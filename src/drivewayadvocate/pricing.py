"""VSC pricing engine.

Turns a vehicle + coverage spec (+ optional dealer offer) into a fair-market price range,
estimated dealer cost, markup assessment, negotiation target, and a buy/negotiate/decline
recommendation.

All outputs are ESTIMATES built from the labeled ranges documented in
``research/`` and ``scoring/``.  The parametric model is, where possible, blended with
real observations from the database (``v_fair_price_by_class_tier``).
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from typing import Optional

from .scoring import ScoreResult, score_vehicle

# --- Base annual retail by coverage tier (USD/yr) -----------------------------
# Calibrated so an AVERAGE-risk vehicle (intrinsic score ~37 -> risk multiplier ~1.0)
# at mid mileage/age lands within published per-year ranges (see
# research/05-coverage-tiers.md). Labeled estimates.
BASE_ANNUAL_BY_TIER: dict[str, float] = {
    "powertrain": 620,
    "powertrain_plus": 780,
    "stated_component": 900,
    "high_tech": 1000,
    "comprehensive": 1100,
    "exclusionary": 1180,
    "ev_hybrid": 1500,
    "wrap": 450,
    "cpo": 880,
    "maintenance": 380,
    "tire_wheel": 230,
    "gap": 420,
}
_DEFAULT_TIER = "stated_component"

# Reference "current" year used to derive vehicle age from model year.
CURRENT_YEAR = 2026
# Fallback age (years) when the model year is unknown.
DEFAULT_AGE_YEARS = 3

# Mileage/age multipliers mirror database/seed/{mileage,age}_bands.csv price_mult.
_MILEAGE_MULT = [
    (12000, 0.85), (36000, 0.95), (60000, 1.05), (85000, 1.20),
    (100000, 1.35), (125000, 1.55), (150000, 1.75), (None, 1.95),
]
_AGE_MULT = [(3, 0.95), (6, 1.05), (10, 1.20), (15, 1.35), (None, 1.50)]

# Deductible multiplier (base prices assume a $100 deductible).
_DEDUCTIBLE_MULT = {0: 1.08, 50: 1.04, 100: 1.00, 200: 0.94, 250: 0.92, 500: 0.85}

# Dealer economics (see research/04-dealer-markup-analysis.md).
DEALER_COST_RATIO = 0.55          # est. wholesale ~55% of typical retail
FAIR_MARGIN_OVER_COST = 400       # "cost-plus" fair dealer profit (Edmunds $200-500)
MARKUP_WARNING_MULT = 2.0         # warn if offer > 2x estimated dealer cost
OVERPRICED_MULT = 1.5             # offer > 1.5x fair-high => overpriced


def _band_mult(value: float, bands) -> float:
    for upper, mult in bands:
        if upper is None or value <= upper:
            return mult
    return bands[-1][1]


def _deductible_mult(deductible: Optional[int]) -> float:
    if deductible is None:
        return 1.0
    if deductible in _DEDUCTIBLE_MULT:
        return _DEDUCTIBLE_MULT[deductible]
    # nearest known deductible
    nearest = min(_DEDUCTIBLE_MULT, key=lambda d: abs(d - deductible))
    return _DEDUCTIBLE_MULT[nearest]


def risk_multiplier(intrinsic_score: float) -> float:
    """Map intrinsic risk (0-100) to a price multiplier.

    Calibrated so an average vehicle (intrinsic ~37) -> ~1.0, a reliable economy car
    (~18) -> ~0.77, and a luxury/European car (~70) -> ~1.39 (i.e. ~1.8x the economy
    car, consistent with the published "luxury costs 2-3x" guidance once mileage/age
    multipliers compound). Bounded to [0.55, 1.95].
    """
    return max(0.55, min(1.95, 0.55 + intrinsic_score / 100.0 * 1.2))


@dataclass
class QuoteRequest:
    make: str
    model: str
    mileage: int
    term_months: int
    tier: str
    year: Optional[int] = None
    trim: Optional[str] = None
    deductible: Optional[int] = 100
    term_mileage: Optional[int] = None
    state: Optional[str] = None
    dealer_offer: Optional[int] = None
    current_warranty_active: Optional[bool] = None
    # fallback attrs for vehicles not in the DB:
    segment: str = "mainstream"
    luxury: bool = False
    powertrain: str = "ice"
    turbo: bool = False
    drivetrain: str = "fwd"

    def __post_init__(self) -> None:
        if self.term_months is None or self.term_months < 1:
            raise ValueError("term_months must be >= 1")
        if self.mileage is None or self.mileage < 0:
            raise ValueError("mileage must be >= 0")
        if self.deductible is not None and self.deductible < 0:
            raise ValueError("deductible must be >= 0")
        if self.dealer_offer is not None and self.dealer_offer < 0:
            raise ValueError("dealer_offer must be >= 0")

    @property
    def age_years(self) -> int:
        if self.year is None:
            return DEFAULT_AGE_YEARS
        return max(0, CURRENT_YEAR - self.year)


@dataclass
class QuoteResult:
    request: QuoteRequest
    score: ScoreResult
    fair_low: int
    fair_mid: int
    fair_high: int
    dealer_cost_est: int
    negotiation_target: int
    per_year_fair: int
    observed_n: int                       # # of real observations blended in
    verdict: Optional[str] = None         # FAIR | NEGOTIATE | OVERPRICED (if offer given)
    markup_vs_cost_pct: Optional[int] = None
    offer_vs_fair_pct: Optional[int] = None
    markup_warning: Optional[str] = None
    recommendation: str = ""
    explanation: list[str] = field(default_factory=list)
    alternatives: list[str] = field(default_factory=list)
    confidence: str = "estimated"

    def to_dict(self) -> dict:
        d = {k: v for k, v in self.__dict__.items() if k not in ("request", "score")}
        d["score"] = {
            "full_score": self.score.full_score,
            "intrinsic_score": self.score.intrinsic_score,
            "risk_label": self.score.risk_label(),
            "top_drivers": self.score.top_drivers,
        }
        return d


_DRIVER_LABELS = {
    "brand_repair_cost": "brand repair cost",
    "model_reliability": "model reliability",
    "powertrain_complexity": "powertrain complexity",
    "electronics_complexity": "electronics complexity",
    "known_failure_points": "known failure points",
    "luxury_parts_cost": "luxury parts cost",
    "hybrid_ev_components": "hybrid/EV components",
    "claims_likelihood": "claims likelihood",
}


def _observed_fair_mid(
    conn: sqlite3.Connection, make: str, model: str, tier: str, year: Optional[int]
) -> tuple[Optional[float], int]:
    """Average non-dealer_quote retail for this vehicle's class + tier from the view."""
    row = conn.execute(
        "SELECT vehicle_class FROM vehicles WHERE LOWER(make)=LOWER(?) "
        "AND LOWER(model)=LOWER(?) ORDER BY year DESC LIMIT 1",
        [make, model],
    ).fetchone()
    if row is None or row["vehicle_class"] is None:
        return None, 0
    agg = conn.execute(
        "SELECT n_obs, retail_mid FROM v_fair_price_by_class_tier "
        "WHERE vehicle_class = ? AND coverage_tier = ?",
        [row["vehicle_class"], tier],
    ).fetchone()
    if agg is None or agg["retail_mid"] is None:
        return None, 0
    return float(agg["retail_mid"]), int(agg["n_obs"])


def price_quote(
    req: QuoteRequest, conn: Optional[sqlite3.Connection] = None
) -> QuoteResult:
    score = score_vehicle(
        req.make, req.model, req.mileage, req.age_years,
        conn=conn, year=req.year, segment=req.segment, luxury=req.luxury,
        powertrain=req.powertrain, turbo=req.turbo, drivetrain=req.drivetrain,
    )

    tier_recognized = req.tier in BASE_ANNUAL_BY_TIER
    base_annual = BASE_ANNUAL_BY_TIER.get(req.tier, BASE_ANNUAL_BY_TIER[_DEFAULT_TIER])
    term_years = max(req.term_months, 1) / 12.0
    parametric_mid = (
        base_annual
        * term_years
        * risk_multiplier(score.intrinsic_score)
        * _band_mult(req.mileage, _MILEAGE_MULT)
        * _band_mult(req.age_years, _AGE_MULT)
        * _deductible_mult(req.deductible)
    )

    # Blend with real observations when available (50/50).
    observed_n = 0
    fair_mid = parametric_mid
    if conn is not None:
        observed_mid, observed_n = _observed_fair_mid(
            conn, req.make, req.model, req.tier, req.year
        )
        if observed_mid is not None:
            fair_mid = 0.5 * parametric_mid + 0.5 * observed_mid

    fair_low = fair_mid * 0.85
    fair_high = fair_mid * 1.15
    dealer_cost_est = fair_mid * DEALER_COST_RATIO
    negotiation_target = min(
        fair_mid, dealer_cost_est + FAIR_MARGIN_OVER_COST
    )
    per_year_fair = fair_mid / term_years

    result = QuoteResult(
        request=req,
        score=score,
        fair_low=round(fair_low),
        fair_mid=round(fair_mid),
        fair_high=round(fair_high),
        dealer_cost_est=round(dealer_cost_est),
        negotiation_target=round(negotiation_target),
        per_year_fair=round(per_year_fair),
        observed_n=observed_n,
        confidence="blended" if observed_n else "estimated",
    )

    _assess_offer(result, fair_high, dealer_cost_est)
    _build_recommendation(result)
    _build_explanation(result, base_annual, term_years)
    if not tier_recognized:
        result.explanation.append(
            f"Unknown coverage tier '{req.tier}' — priced using '{_DEFAULT_TIER}' as a "
            "proxy. Map it to a known tier (see research/05-coverage-tiers.md)."
        )
    _build_alternatives(result, conn)
    return result


def _assess_offer(result: QuoteResult, fair_high: float, dealer_cost_est: float) -> None:
    offer = result.request.dealer_offer
    if offer is None:
        return
    result.offer_vs_fair_pct = round((offer / result.fair_mid - 1) * 100)
    if dealer_cost_est > 0:
        result.markup_vs_cost_pct = round((offer / dealer_cost_est - 1) * 100)

    if offer <= fair_high:
        result.verdict = "FAIR"
    elif offer <= OVERPRICED_MULT * fair_high:
        result.verdict = "NEGOTIATE"
    else:
        result.verdict = "OVERPRICED"

    if offer > MARKUP_WARNING_MULT * dealer_cost_est:
        mult = offer / dealer_cost_est if dealer_cost_est else 0
        result.markup_warning = (
            f"High markup: offer is ~{mult:.1f}x the estimated dealer cost "
            f"(${result.dealer_cost_est:,})."
        )


def _suitability(score: ScoreResult) -> str:
    if score.full_score < 30:
        return "optional"   # reliable, low-risk: declining is defensible
    if score.full_score < 60:
        return "reasonable"
    return "valuable"       # high repair risk: coverage has real value


def _build_recommendation(result: QuoteResult) -> None:
    suit = _suitability(result.score)
    offer = result.request.dealer_offer
    target = f"${result.negotiation_target:,}"

    if offer is None:
        if suit == "optional":
            result.recommendation = (
                "OPTIONAL — this is a low-risk, reliable vehicle. A service contract is "
                f"defensible to DECLINE. If you want one, target ~{target}."
            )
        elif suit == "reasonable":
            result.recommendation = (
                f"CONSIDER — moderate risk. A contract can be worthwhile; target ~{target}."
            )
        else:
            result.recommendation = (
                "WORTH CONSIDERING — higher repair risk makes coverage valuable; "
                f"target ~{target}."
            )
        return

    if result.verdict == "OVERPRICED":
        result.recommendation = (
            f"DECLINE or NEGOTIATE HARD — the ${offer:,} offer is well above fair market. "
            f"Counter toward {target}; walk away if they won't move."
        )
    elif result.verdict == "NEGOTIATE":
        result.recommendation = (
            f"NEGOTIATE — the ${offer:,} offer is above fair market. Counter toward "
            f"{target}."
        )
    else:  # FAIR
        if suit == "optional":
            result.recommendation = (
                f"FAIR PRICE, but OPTIONAL — ${offer:,} is reasonable, yet this reliable "
                "vehicle may not need a contract. Buy only if you want the peace of mind."
            )
        else:
            result.recommendation = (
                f"REASONABLE BUY — ${offer:,} is within fair market for this vehicle and "
                "coverage. Little left to negotiate."
            )


def _build_explanation(
    result: QuoteResult, base_annual: float, term_years: float
) -> None:
    s = result.score
    drivers = ", ".join(_DRIVER_LABELS.get(d, d) for d in s.top_drivers)
    result.explanation.append(
        f"Vehicle risk score {s.full_score}/100 ({s.risk_label()}); intrinsic risk "
        f"{s.intrinsic_score}/100. Top cost drivers: {drivers}."
    )
    result.explanation.append(
        f"Fair price built from a ${base_annual:,.0f}/yr base for '{result.request.tier}' "
        f"coverage x {term_years:.1f} yr, adjusted for vehicle risk, "
        f"{result.request.mileage:,} mi, age {result.request.age_years} yr, and "
        f"${result.request.deductible} deductible."
    )
    if result.observed_n:
        result.explanation.append(
            f"Blended 50/50 with {result.observed_n} real observation(s) for this "
            "vehicle class + tier."
        )
    else:
        result.explanation.append(
            "No matching real observations yet — fully parametric estimate."
        )
    if result.request.current_warranty_active:
        result.explanation.append(
            "Factory warranty still active — consider a cheaper 'wrap' tier until it "
            "expires, and remember you can buy later."
        )


def _build_alternatives(result: QuoteResult, conn: Optional[sqlite3.Connection]) -> None:
    result.alternatives.append(
        "Get a credit-union mechanical-breakdown quote — often the price floor."
    )
    result.alternatives.append(
        "Compare a direct-to-consumer quote (e.g., Endurance, olive) for the same spec."
    )
    if result.request.luxury or result.score.full_score >= 60:
        result.alternatives.append(
            "For luxury/high-risk vehicles, prefer an exclusionary tier and verify the "
            "AM Best rating of the insurer backing the contract."
        )
