// VSC fair-price engine. Port of src/drivewayadvocate/pricing.py.
import {
  AGE_MULT_BANDS,
  BASE_ANNUAL_BY_TIER,
  CURRENT_YEAR,
  DEALER_COST_RATIO,
  DEDUCTIBLE_MULT,
  DEFAULT_AGE_YEARS,
  DEFAULT_TIER,
  FAIR_MARGIN_OVER_COST,
  MARKUP_WARNING_MULT,
  MILEAGE_MULT_BANDS,
  OVERPRICED_MULT,
  RISK_MULT_BASE,
  RISK_MULT_MAX,
  RISK_MULT_MIN,
  RISK_MULT_SLOPE,
  type Band,
} from "./constants.js";
import { OBSERVATIONS, VEHICLES } from "./data.generated.js";
import { pyRound, scoreVehicle } from "./scoring.js";
import type { QuoteRequest, QuoteResult, ScoreComponents, ScoreResult, Verdict } from "./types.js";

const DRIVER_LABELS: Record<keyof ScoreComponents, string> = {
  brandRepairCost: "brand repair cost",
  modelReliability: "model reliability",
  powertrainComplexity: "powertrain complexity",
  electronicsComplexity: "electronics complexity",
  knownFailurePoints: "known failure points",
  luxuryPartsCost: "luxury parts cost",
  hybridEvComponents: "hybrid/EV components",
  claimsLikelihood: "claims likelihood",
};

function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function bandMult(value: number, bands: Band[]): number {
  for (const [upper, mult] of bands) {
    if (upper === null || value <= upper) return mult;
  }
  return bands[bands.length - 1]![1];
}

function deductibleMult(deductible: number | null | undefined): number {
  if (deductible == null) return 1.0;
  if (deductible in DEDUCTIBLE_MULT) return DEDUCTIBLE_MULT[deductible]!;
  let nearest = 0;
  let bestDiff = Infinity;
  for (const key of Object.keys(DEDUCTIBLE_MULT).map(Number)) {
    const diff = Math.abs(key - deductible);
    if (diff < bestDiff) {
      bestDiff = diff;
      nearest = key;
    }
  }
  return DEDUCTIBLE_MULT[nearest]!;
}

export function riskMultiplier(intrinsicScore: number): number {
  return Math.max(RISK_MULT_MIN, Math.min(RISK_MULT_MAX, RISK_MULT_BASE + (intrinsicScore / 100) * RISK_MULT_SLOPE));
}

export function ageYearsFor(year?: number): number {
  if (year == null) return DEFAULT_AGE_YEARS;
  return Math.max(0, CURRENT_YEAR - year);
}

/** Validate inputs; throws on bad values (mirrors QuoteRequest.__post_init__). */
export function validateQuoteRequest(req: QuoteRequest): void {
  if (req.termMonths == null || req.termMonths < 1) throw new Error("termMonths must be >= 1");
  if (req.mileage == null || req.mileage < 0) throw new Error("mileage must be >= 0");
  if (req.deductible != null && req.deductible < 0) throw new Error("deductible must be >= 0");
  if (req.dealerOffer != null && req.dealerOffer < 0) throw new Error("dealerOffer must be >= 0");
}

function vehicleClassLatest(make: string, model: string): string | null {
  const pool = VEHICLES.filter(
    (v) => v.make.toLowerCase() === make.toLowerCase() && v.model.toLowerCase() === model.toLowerCase(),
  ).sort((a, b) => b.year - a.year);
  return pool.length ? (pool[0]!.vehicleClass ?? null) : null;
}

function vehicleClassById(id: number): string | null {
  return VEHICLES.find((v) => v.vehicleId === id)?.vehicleClass ?? null;
}

/** Replicates the v_fair_price_by_class_tier view: avg non-dealer_quote retail for the
 *  vehicle's class + tier. Returns [retailMid|null, nObs]. */
export function observedFairMid(make: string, model: string, tier: string): [number | null, number] {
  const cls = vehicleClassLatest(make, model);
  if (!cls) return [null, 0];

  let sum = 0;
  let priced = 0;
  let nRows = 0;
  for (const o of OBSERVATIONS) {
    if (o.sourceType === "dealer_quote") continue;
    const oClass = o.vehicleId != null ? (vehicleClassById(o.vehicleId) ?? o.vehicleClass) : o.vehicleClass;
    if (oClass === cls && o.coverageTier === tier) {
      nRows += 1;
      if (o.retailPrice != null) {
        sum += o.retailPrice;
        priced += 1;
      }
    }
  }
  if (nRows === 0 || priced === 0) return [null, 0];
  return [Math.trunc(sum / priced), nRows];
}

function suitability(score: ScoreResult): "optional" | "reasonable" | "valuable" {
  if (score.fullScore < 30) return "optional";
  if (score.fullScore < 60) return "reasonable";
  return "valuable";
}

export function priceQuote(req: QuoteRequest): QuoteResult {
  validateQuoteRequest(req);
  const ageYears = ageYearsFor(req.year);
  const deductible = req.deductible ?? 100;

  const score = scoreVehicle(req.make, req.model, req.mileage, ageYears, {
    year: req.year,
    segment: req.segment,
    luxury: req.luxury,
    powertrain: req.powertrain,
    turbo: req.turbo,
    drivetrain: req.drivetrain,
  });

  const tierRecognized = req.tier in BASE_ANNUAL_BY_TIER;
  const baseAnnual = BASE_ANNUAL_BY_TIER[req.tier] ?? BASE_ANNUAL_BY_TIER[DEFAULT_TIER]!;
  const termYears = Math.max(req.termMonths, 1) / 12;

  const parametricMid =
    baseAnnual *
    termYears *
    riskMultiplier(score.intrinsicScore) *
    bandMult(req.mileage, MILEAGE_MULT_BANDS) *
    bandMult(ageYears, AGE_MULT_BANDS) *
    deductibleMult(deductible);

  const [observedMid, observedN] = observedFairMid(req.make, req.model, req.tier);
  const fairMid = observedMid != null ? 0.5 * parametricMid + 0.5 * observedMid : parametricMid;

  const fairLow = fairMid * 0.85;
  const fairHigh = fairMid * 1.15;
  const dealerCostEst = fairMid * DEALER_COST_RATIO;
  const negotiationTarget = Math.min(fairMid, dealerCostEst + FAIR_MARGIN_OVER_COST);
  const perYearFair = fairMid / termYears;

  const result: QuoteResult = {
    fairLow: pyRound(fairLow),
    fairMid: pyRound(fairMid),
    fairHigh: pyRound(fairHigh),
    dealerCostEst: pyRound(dealerCostEst),
    negotiationTarget: pyRound(negotiationTarget),
    perYearFair: pyRound(perYearFair),
    observedN,
    verdict: null,
    markupVsCostPct: null,
    offerVsFairPct: null,
    markupWarning: null,
    recommendation: "",
    explanation: [],
    alternatives: [],
    confidence: observedN ? "blended" : "estimated",
    score,
  };

  assessOffer(result, req, fairHigh, dealerCostEst);
  buildRecommendation(result, req);
  buildExplanation(result, req, baseAnnual, termYears, ageYears, deductible);
  if (!tierRecognized) {
    result.explanation.push(
      `Unknown coverage tier '${req.tier}' — priced using '${DEFAULT_TIER}' as a ` +
        "proxy. Map it to a known tier (see research/05-coverage-tiers.md).",
    );
  }
  buildAlternatives(result, req);
  return result;
}

function assessOffer(result: QuoteResult, req: QuoteRequest, fairHigh: number, dealerCostEst: number): void {
  const offer = req.dealerOffer;
  if (offer == null) return;
  result.offerVsFairPct = pyRound((offer / result.fairMid - 1) * 100);
  if (dealerCostEst > 0) {
    result.markupVsCostPct = pyRound((offer / dealerCostEst - 1) * 100);
  }

  let verdict: Verdict;
  if (offer <= fairHigh) verdict = "FAIR";
  else if (offer <= OVERPRICED_MULT * fairHigh) verdict = "NEGOTIATE";
  else verdict = "OVERPRICED";
  result.verdict = verdict;

  if (offer > MARKUP_WARNING_MULT * dealerCostEst) {
    const mult = dealerCostEst ? offer / dealerCostEst : 0;
    result.markupWarning =
      `High markup: offer is ~${mult.toFixed(1)}x the estimated dealer cost ` +
      `(${usd(result.dealerCostEst)}).`;
  }
}

function buildRecommendation(result: QuoteResult, req: QuoteRequest): void {
  const suit = suitability(result.score);
  const offer = req.dealerOffer;
  const target = usd(result.negotiationTarget);

  if (offer == null) {
    if (suit === "optional") {
      result.recommendation =
        "OPTIONAL — this is a low-risk, reliable vehicle. A service contract is " +
        `defensible to DECLINE. If you want one, target ~${target}.`;
    } else if (suit === "reasonable") {
      result.recommendation = `CONSIDER — moderate risk. A contract can be worthwhile; target ~${target}.`;
    } else {
      result.recommendation =
        "WORTH CONSIDERING — higher repair risk makes coverage valuable; " + `target ~${target}.`;
    }
    return;
  }

  if (result.verdict === "OVERPRICED") {
    result.recommendation =
      `DECLINE or NEGOTIATE HARD — the ${usd(offer)} offer is well above fair market. ` +
      `Counter toward ${target}; walk away if they won't move.`;
  } else if (result.verdict === "NEGOTIATE") {
    result.recommendation =
      `NEGOTIATE — the ${usd(offer)} offer is above fair market. Counter toward ${target}.`;
  } else {
    if (suit === "optional") {
      result.recommendation =
        `FAIR PRICE, but OPTIONAL — ${usd(offer)} is reasonable, yet this reliable ` +
        "vehicle may not need a contract. Buy only if you want the peace of mind.";
    } else {
      result.recommendation =
        `REASONABLE BUY — ${usd(offer)} is within fair market for this vehicle and ` +
        "coverage. Little left to negotiate.";
    }
  }
}

function buildExplanation(
  result: QuoteResult,
  req: QuoteRequest,
  baseAnnual: number,
  termYears: number,
  ageYears: number,
  deductible: number,
): void {
  const s = result.score;
  const drivers = s.topDrivers
    .map((d) => DRIVER_LABELS[d as keyof ScoreComponents] ?? d)
    .join(", ");
  result.explanation.push(
    `Vehicle risk score ${s.fullScore}/100 (${s.riskLabel}); intrinsic risk ` +
      `${s.intrinsicScore}/100. Top cost drivers: ${drivers}.`,
  );
  result.explanation.push(
    `Fair price built from a $${Math.round(baseAnnual).toLocaleString("en-US")}/yr base for '${req.tier}' ` +
      `coverage x ${termYears.toFixed(1)} yr, adjusted for vehicle risk, ` +
      `${req.mileage.toLocaleString("en-US")} mi, age ${ageYears} yr, and ` +
      `$${deductible} deductible.`,
  );
  if (result.observedN) {
    result.explanation.push(
      `Blended 50/50 with ${result.observedN} real observation(s) for this ` + "vehicle class + tier.",
    );
  } else {
    result.explanation.push("No matching real observations yet — fully parametric estimate.");
  }
  if (req.currentWarrantyActive) {
    result.explanation.push(
      "Factory warranty still active — consider a cheaper 'wrap' tier until it " +
        "expires, and remember you can buy later.",
    );
  }
}

function buildAlternatives(result: QuoteResult, req: QuoteRequest): void {
  result.alternatives.push("Get a credit-union mechanical-breakdown quote — often the price floor.");
  result.alternatives.push("Compare a direct-to-consumer quote (e.g., Endurance, olive) for the same spec.");
  if (req.luxury || result.score.fullScore >= 60) {
    result.alternatives.push(
      "For luxury/high-risk vehicles, prefer an exclusionary tier and verify the " +
        "AM Best rating of the insurer backing the contract.",
    );
  }
}
