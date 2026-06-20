// Vehicle warranty-risk scoring (1-100). Port of src/drivewayadvocate/scoring.py.
import {
  AGE_SCORE_BANDS,
  INTRINSIC_COMPONENTS,
  INTRINSIC_WEIGHTS,
  INTRINSIC_WEIGHT_SUM,
  MILEAGE_SCORE_BANDS,
  MILEAGE_WEIGHT,
  AGE_WEIGHT,
  SEGMENT_BASE,
  type Band,
} from "./constants.js";
import { RISK_SCORES, VEHICLES, type RiskScoreRow } from "./data.generated.js";
import type {
  RiskLabel,
  ScoreComponents,
  ScoreResult,
  Segment,
  VehicleAttrs,
} from "./types.js";

/** Round half-to-even, matching Python's built-in round(). */
export function pyRound(x: number): number {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (Math.abs(diff - 0.5) < 1e-9) {
    return floor % 2 === 0 ? floor : floor + 1;
  }
  return Math.round(x);
}

function bandValue(value: number, bands: Band[]): number {
  for (const [upper, score] of bands) {
    if (upper === null || value <= upper) return score;
  }
  return bands[bands.length - 1]![1];
}

export function mileageScore(miles: number): number {
  return bandValue(miles, MILEAGE_SCORE_BANDS);
}

export function ageScore(years: number): number {
  return bandValue(years, AGE_SCORE_BANDS);
}

function clamp(value: number, lo = 1, hi = 100): number {
  return Math.max(lo, Math.min(hi, value));
}

export function riskLabelFor(fullScore: number): RiskLabel {
  if (fullScore < 25) return "Low";
  if (fullScore < 45) return "Moderate";
  if (fullScore < 65) return "Elevated";
  return "High";
}

export function scoreFromComponents(
  components: ScoreComponents,
  miles: number,
  years: number,
  source: "database" | "estimated" = "estimated",
): ScoreResult {
  let intrinsicWeighted = 0;
  const contributions: [keyof ScoreComponents, number][] = [];
  for (const name of INTRINSIC_COMPONENTS) {
    const contribution = components[name] * INTRINSIC_WEIGHTS[name];
    intrinsicWeighted += contribution;
    contributions.push([name, contribution]);
  }

  const m = mileageScore(miles);
  const a = ageScore(years);
  const full = intrinsicWeighted + m * MILEAGE_WEIGHT + a * AGE_WEIGHT;
  const intrinsic = intrinsicWeighted / INTRINSIC_WEIGHT_SUM;

  contributions.sort((x, y) => y[1] - x[1]);
  const topDrivers = contributions.slice(0, 3).map(([name]) => name as string);

  const fullScore = pyRound(clamp(full));
  return {
    fullScore,
    intrinsicScore: pyRound(clamp(intrinsic)),
    components: { ...components },
    mileageScore: m,
    ageScore: a,
    topDrivers,
    source,
    riskLabel: riskLabelFor(fullScore),
  };
}

function clampInt(v: number): number {
  return Math.trunc(Math.max(0, Math.min(100, v)));
}

export function estimateIntrinsicFromAttrs(attrs: VehicleAttrs = {}): ScoreComponents {
  const segment: Segment = attrs.segment ?? "mainstream";
  const base: ScoreComponents = { ...(SEGMENT_BASE[segment] ?? SEGMENT_BASE.mainstream) };

  if (attrs.turbo) base.powertrainComplexity += 8;
  if (attrs.drivetrain === "awd" || attrs.drivetrain === "4wd") base.powertrainComplexity += 5;
  if (attrs.luxury) {
    base.luxuryPartsCost = Math.max(base.luxuryPartsCost, 85);
    base.brandRepairCost = Math.max(base.brandRepairCost, 75);
  }

  const pt = (attrs.powertrain ?? "ice").toLowerCase();
  if (pt === "ev") {
    base.hybridEvComponents = 90;
    base.electronicsComplexity += 15;
    base.powertrainComplexity = Math.max(0, base.powertrainComplexity - 10);
  } else if (pt === "hybrid" || pt === "phev") {
    base.hybridEvComponents = pt === "phev" ? 55 : 45;
    base.electronicsComplexity += 5;
  }

  return {
    brandRepairCost: clampInt(base.brandRepairCost),
    modelReliability: clampInt(base.modelReliability),
    powertrainComplexity: clampInt(base.powertrainComplexity),
    electronicsComplexity: clampInt(base.electronicsComplexity),
    knownFailurePoints: clampInt(base.knownFailurePoints),
    luxuryPartsCost: clampInt(base.luxuryPartsCost),
    hybridEvComponents: clampInt(base.hybridEvComponents),
    claimsLikelihood: clampInt(base.claimsLikelihood),
  };
}

function componentsOf(row: RiskScoreRow): ScoreComponents {
  return {
    brandRepairCost: row.brandRepairCost,
    modelReliability: row.modelReliability,
    powertrainComplexity: row.powertrainComplexity,
    electronicsComplexity: row.electronicsComplexity,
    knownFailurePoints: row.knownFailurePoints,
    luxuryPartsCost: row.luxuryPartsCost,
    hybridEvComponents: row.hybridEvComponents,
    claimsLikelihood: row.claimsLikelihood,
  };
}

/** Intrinsic component scores for a known vehicle, or null. Mirrors load_intrinsic_from_db. */
export function loadIntrinsicFromData(
  make: string,
  model: string,
  year?: number,
): ScoreComponents | null {
  let pool = VEHICLES.filter(
    (v) => v.make.toLowerCase() === make.toLowerCase() && v.model.toLowerCase() === model.toLowerCase(),
  );
  if (year != null) pool = pool.filter((v) => v.year === year);
  if (pool.length === 0) return null;
  pool = [...pool].sort((a, b) => b.year - a.year);
  const vehicleId = pool[0]!.vehicleId;
  const rs = RISK_SCORES.find((r) => r.vehicleId === vehicleId);
  return rs ? componentsOf(rs) : null;
}

export interface ScoreVehicleOptions extends VehicleAttrs {
  year?: number;
}

export function scoreVehicle(
  make: string,
  model: string,
  miles: number,
  years: number,
  opts: ScoreVehicleOptions = {},
): ScoreResult {
  let components = loadIntrinsicFromData(make, model, opts.year);
  let source: "database" | "estimated" = "estimated";
  if (components) {
    source = "database";
  } else {
    components = estimateIntrinsicFromAttrs(opts);
  }
  return scoreFromComponents(components, miles, years, source);
}
