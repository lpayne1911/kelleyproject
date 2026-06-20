"""Vehicle warranty-risk scoring model (1-100).

Implements the model specified in ``scoring/risk-scoring-model.md``.  100 = highest
warranty pricing risk.  The eight intrinsic component scores come from the database
(``vehicle_risk_scores``) when the vehicle is known, or from an attribute-based fallback
heuristic when it is not.  Mileage and age are scored contextually at runtime.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from typing import Optional

# --- Weights (must sum to 1.0); mirror scoring/risk-scoring-model.md ----------
INTRINSIC_WEIGHTS: dict[str, float] = {
    "brand_repair_cost": 0.15,
    "model_reliability": 0.15,
    "powertrain_complexity": 0.10,
    "electronics_complexity": 0.10,
    "known_failure_points": 0.10,
    "luxury_parts_cost": 0.10,
    "hybrid_ev_components": 0.05,
    "claims_likelihood": 0.10,
}
INTRINSIC_WEIGHT_SUM = sum(INTRINSIC_WEIGHTS.values())  # 0.85
MILEAGE_WEIGHT = 0.10
AGE_WEIGHT = 0.05

assert abs(INTRINSIC_WEIGHT_SUM + MILEAGE_WEIGHT + AGE_WEIGHT - 1.0) < 1e-9

INTRINSIC_COMPONENTS = tuple(INTRINSIC_WEIGHTS.keys())

# --- Contextual band -> score (mirror database/seed/{mileage,age}_bands.csv) --
# (upper_bound_inclusive_or_None, score)
_MILEAGE_BANDS = [
    (12000, 10),
    (36000, 20),
    (60000, 35),
    (85000, 50),
    (100000, 65),
    (125000, 78),
    (150000, 88),
    (None, 95),
]
_AGE_BANDS = [
    (3, 15),
    (6, 35),
    (10, 55),
    (15, 75),
    (None, 90),
]

# Reference conditions used to compute the stored ``reference_total``.
REFERENCE_MILEAGE = 36000
REFERENCE_AGE_YEARS = 3


def mileage_score(miles: float) -> int:
    for upper, score in _MILEAGE_BANDS:
        if upper is None or miles <= upper:
            return score
    return 95


def age_score(years: float) -> int:
    for upper, score in _AGE_BANDS:
        if upper is None or years <= upper:
            return score
    return 90


def _clamp(value: float, low: float = 1.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


@dataclass
class ScoreResult:
    full_score: int            # 1-100, includes mileage + age (consumer-facing)
    intrinsic_score: int       # 1-100, intrinsic only (feeds pricing risk multiplier)
    components: dict[str, int] # the 8 intrinsic component scores
    mileage_score: int
    age_score: int
    top_drivers: list[str] = field(default_factory=list)  # biggest contributors
    source: str = "estimated"  # 'database' | 'estimated' (fallback heuristic)

    def risk_label(self) -> str:
        s = self.full_score
        if s < 25:
            return "Low"
        if s < 45:
            return "Moderate"
        if s < 65:
            return "Elevated"
        return "High"


def score_from_components(
    components: dict[str, int],
    miles: float,
    years: float,
    *,
    source: str = "estimated",
) -> ScoreResult:
    """Compute full + intrinsic scores from the 8 intrinsic component scores."""
    missing = set(INTRINSIC_COMPONENTS) - set(components)
    if missing:
        raise ValueError(f"missing intrinsic components: {sorted(missing)}")

    intrinsic_weighted = sum(
        components[name] * INTRINSIC_WEIGHTS[name] for name in INTRINSIC_COMPONENTS
    )
    m_score = mileage_score(miles)
    a_score = age_score(years)

    full = intrinsic_weighted + m_score * MILEAGE_WEIGHT + a_score * AGE_WEIGHT
    intrinsic = intrinsic_weighted / INTRINSIC_WEIGHT_SUM

    # Rank intrinsic components by their weighted contribution.
    contributions = {
        name: components[name] * INTRINSIC_WEIGHTS[name]
        for name in INTRINSIC_COMPONENTS
    }
    top = sorted(contributions, key=contributions.get, reverse=True)[:3]

    return ScoreResult(
        full_score=round(_clamp(full)),
        intrinsic_score=round(_clamp(intrinsic)),
        components={name: components[name] for name in INTRINSIC_COMPONENTS},
        mileage_score=m_score,
        age_score=a_score,
        top_drivers=top,
        source=source,
    )


# --- Attribute-based fallback for vehicles not in the database ----------------
_SEGMENT_BASE = {
    "economy":     dict(brand_repair_cost=28, model_reliability=35, powertrain_complexity=35,
                        electronics_complexity=33, known_failure_points=38, luxury_parts_cost=15,
                        hybrid_ev_components=0, claims_likelihood=35),
    "mainstream":  dict(brand_repair_cost=35, model_reliability=35, powertrain_complexity=38,
                        electronics_complexity=40, known_failure_points=40, luxury_parts_cost=28,
                        hybrid_ev_components=0, claims_likelihood=40),
    "performance": dict(brand_repair_cost=58, model_reliability=60, powertrain_complexity=62,
                        electronics_complexity=52, known_failure_points=55, luxury_parts_cost=48,
                        hybrid_ev_components=0, claims_likelihood=60),
    "luxury":      dict(brand_repair_cost=82, model_reliability=55, powertrain_complexity=68,
                        electronics_complexity=80, known_failure_points=65, luxury_parts_cost=88,
                        hybrid_ev_components=0, claims_likelihood=70),
}


def estimate_intrinsic_from_attrs(
    *,
    segment: str = "mainstream",
    luxury: bool = False,
    powertrain: str = "ice",
    turbo: bool = False,
    drivetrain: str = "fwd",
) -> dict[str, int]:
    """Heuristic intrinsic component scores for an unknown vehicle."""
    base = dict(_SEGMENT_BASE.get(segment, _SEGMENT_BASE["mainstream"]))

    if turbo:
        base["powertrain_complexity"] += 8
    if drivetrain in ("awd", "4wd"):
        base["powertrain_complexity"] += 5
    if luxury:
        base["luxury_parts_cost"] = max(base["luxury_parts_cost"], 85)
        base["brand_repair_cost"] = max(base["brand_repair_cost"], 75)

    pt = (powertrain or "ice").lower()
    if pt == "ev":
        base["hybrid_ev_components"] = 90
        base["electronics_complexity"] += 15
        base["powertrain_complexity"] = max(0, base["powertrain_complexity"] - 10)
    elif pt in ("hybrid", "phev"):
        base["hybrid_ev_components"] = 55 if pt == "phev" else 45
        base["electronics_complexity"] += 5

    return {k: int(max(0, min(100, v))) for k, v in base.items()}


def load_intrinsic_from_db(
    conn: sqlite3.Connection, make: str, model: str, year: Optional[int] = None
) -> Optional[dict[str, int]]:
    """Return intrinsic component scores for a vehicle, or None if not found."""
    sql = (
        "SELECT s.* FROM vehicle_risk_scores s "
        "JOIN vehicles v ON v.vehicle_id = s.vehicle_id "
        "WHERE LOWER(v.make) = LOWER(?) AND LOWER(v.model) = LOWER(?)"
    )
    params: list = [make, model]
    if year is not None:
        sql += " AND v.year = ?"
        params.append(year)
    sql += " ORDER BY v.year DESC LIMIT 1"
    row = conn.execute(sql, params).fetchone()
    if row is None:
        return None
    return {name: int(row[name]) for name in INTRINSIC_COMPONENTS}


def score_vehicle(
    make: str,
    model: str,
    miles: float,
    years: float,
    *,
    conn: Optional[sqlite3.Connection] = None,
    year: Optional[int] = None,
    # fallback attributes (used only when the vehicle isn't in the DB):
    segment: str = "mainstream",
    luxury: bool = False,
    powertrain: str = "ice",
    turbo: bool = False,
    drivetrain: str = "fwd",
) -> ScoreResult:
    """Score a vehicle, preferring DB component scores, falling back to a heuristic."""
    components = None
    source = "estimated"
    if conn is not None:
        components = load_intrinsic_from_db(conn, make, model, year)
        if components is not None:
            source = "database"
    if components is None:
        components = estimate_intrinsic_from_attrs(
            segment=segment, luxury=luxury, powertrain=powertrain,
            turbo=turbo, drivetrain=drivetrain,
        )
    return score_from_components(components, miles, years, source=source)
