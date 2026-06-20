// Engine constants — MIRRORS src/drivewayadvocate/scoring.py and pricing.py.
// Parity tests (test/parity.test.ts) enforce that this TS engine reproduces the Python one,
// and the data-integrity test asserts the band tables here match the generated seed data.

import type { ScoreComponents, Segment } from "./types.js";

// --- Scoring weights (sum to 1.0) --------------------------------------------
export const INTRINSIC_WEIGHTS: Record<keyof ScoreComponents, number> = {
  brandRepairCost: 0.15,
  modelReliability: 0.15,
  powertrainComplexity: 0.1,
  electronicsComplexity: 0.1,
  knownFailurePoints: 0.1,
  luxuryPartsCost: 0.1,
  hybridEvComponents: 0.05,
  claimsLikelihood: 0.1,
};
export const INTRINSIC_COMPONENTS = Object.keys(INTRINSIC_WEIGHTS) as (keyof ScoreComponents)[];
export const INTRINSIC_WEIGHT_SUM = 0.85;
export const MILEAGE_WEIGHT = 0.1;
export const AGE_WEIGHT = 0.05;

// Reference conditions used to compute the stored reference_total.
export const REFERENCE_MILEAGE = 36000;
export const REFERENCE_AGE_YEARS = 3;

/** Band tables: [upperBoundInclusive | null, value]. */
export type Band = readonly [number | null, number];

export const MILEAGE_SCORE_BANDS: Band[] = [
  [12000, 10], [36000, 20], [60000, 35], [85000, 50],
  [100000, 65], [125000, 78], [150000, 88], [null, 95],
];
export const AGE_SCORE_BANDS: Band[] = [
  [3, 15], [6, 35], [10, 55], [15, 75], [null, 90],
];

// --- Pricing constants -------------------------------------------------------
export const BASE_ANNUAL_BY_TIER: Record<string, number> = {
  powertrain: 620,
  powertrain_plus: 780,
  stated_component: 900,
  high_tech: 1000,
  comprehensive: 1100,
  exclusionary: 1180,
  ev_hybrid: 1500,
  wrap: 450,
  cpo: 880,
  maintenance: 380,
  tire_wheel: 230,
  gap: 420,
};
export const DEFAULT_TIER = "stated_component";

export const CURRENT_YEAR = 2026;
export const DEFAULT_AGE_YEARS = 3;

export const MILEAGE_MULT_BANDS: Band[] = [
  [12000, 0.85], [36000, 0.95], [60000, 1.05], [85000, 1.2],
  [100000, 1.35], [125000, 1.55], [150000, 1.75], [null, 1.95],
];
export const AGE_MULT_BANDS: Band[] = [
  [3, 0.95], [6, 1.05], [10, 1.2], [15, 1.35], [null, 1.5],
];

// Base prices assume a $100 deductible.
export const DEDUCTIBLE_MULT: Record<number, number> = {
  0: 1.08, 50: 1.04, 100: 1.0, 200: 0.94, 250: 0.92, 500: 0.85,
};

export const DEALER_COST_RATIO = 0.55;
export const FAIR_MARGIN_OVER_COST = 400;
export const MARKUP_WARNING_MULT = 2.0;
export const OVERPRICED_MULT = 1.5;

// risk multiplier: clamp(0.55 + intrinsic/100 * 1.2, 0.55, 1.95)
export const RISK_MULT_BASE = 0.55;
export const RISK_MULT_SLOPE = 1.2;
export const RISK_MULT_MIN = 0.55;
export const RISK_MULT_MAX = 1.95;

// --- Attribute-based fallback for vehicles not in the dataset -----------------
export const SEGMENT_BASE: Record<Segment, ScoreComponents> = {
  economy: { brandRepairCost: 28, modelReliability: 35, powertrainComplexity: 35, electronicsComplexity: 33, knownFailurePoints: 38, luxuryPartsCost: 15, hybridEvComponents: 0, claimsLikelihood: 35 },
  mainstream: { brandRepairCost: 35, modelReliability: 35, powertrainComplexity: 38, electronicsComplexity: 40, knownFailurePoints: 40, luxuryPartsCost: 28, hybridEvComponents: 0, claimsLikelihood: 40 },
  performance: { brandRepairCost: 58, modelReliability: 60, powertrainComplexity: 62, electronicsComplexity: 52, knownFailurePoints: 55, luxuryPartsCost: 48, hybridEvComponents: 0, claimsLikelihood: 60 },
  luxury: { brandRepairCost: 82, modelReliability: 55, powertrainComplexity: 68, electronicsComplexity: 80, knownFailurePoints: 65, luxuryPartsCost: 88, hybridEvComponents: 0, claimsLikelihood: 70 },
};
