// Public types for the warranty engine. Mirrors the Python dataclasses in
// src/drivewayadvocate/{scoring,pricing,ingest}.py (camelCase here).

export type Powertrain = "ice" | "hybrid" | "phev" | "ev";
export type Drivetrain = "fwd" | "rwd" | "awd" | "4wd";
export type Segment = "economy" | "mainstream" | "performance" | "luxury";

/** The 8 intrinsic component scores (0-100 each). */
export interface ScoreComponents {
  brandRepairCost: number;
  modelReliability: number;
  powertrainComplexity: number;
  electronicsComplexity: number;
  knownFailurePoints: number;
  luxuryPartsCost: number;
  hybridEvComponents: number;
  claimsLikelihood: number;
}

export type RiskLabel = "Low" | "Moderate" | "Elevated" | "High";

export interface ScoreResult {
  /** 1-100, includes mileage + age (consumer-facing). */
  fullScore: number;
  /** 1-100, intrinsic only (feeds the pricing risk multiplier). */
  intrinsicScore: number;
  components: ScoreComponents;
  mileageScore: number;
  ageScore: number;
  topDrivers: string[];
  source: "database" | "estimated";
  riskLabel: RiskLabel;
}

/** Fallback vehicle attributes used only when a vehicle isn't in the dataset. */
export interface VehicleAttrs {
  segment?: Segment;
  luxury?: boolean;
  powertrain?: Powertrain;
  turbo?: boolean;
  drivetrain?: Drivetrain;
}

export interface QuoteRequest extends VehicleAttrs {
  make: string;
  model: string;
  mileage: number;
  termMonths: number;
  tier: string;
  year?: number;
  trim?: string;
  deductible?: number;
  termMileage?: number;
  state?: string;
  dealerOffer?: number;
  currentWarrantyActive?: boolean;
}

export type Verdict = "FAIR" | "NEGOTIATE" | "OVERPRICED";

export interface QuoteResult {
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  dealerCostEst: number;
  negotiationTarget: number;
  perYearFair: number;
  observedN: number;
  verdict: Verdict | null;
  markupVsCostPct: number | null;
  offerVsFairPct: number | null;
  markupWarning: string | null;
  recommendation: string;
  explanation: string[];
  alternatives: string[];
  confidence: "blended" | "estimated";
  score: ScoreResult;
}

// --- Submissions ("show us yours") -------------------------------------------
export type OfferType = "dealer_initial" | "price_paid" | "outside_quote";

export interface SubmissionInput {
  offerType: OfferType;
  make: string;
  model: string;
  modelYear: number;
  mileage: number;
  termMonths: number;
  coverageTier: string;
  price: number;
  providerName?: string;
  trim?: string;
  state?: string;
  termMileage?: number;
  deductible?: number;
  monthly?: number;
  downPayment?: number;
  submitterRef?: string;
  notes?: string;
}

export interface NormalizedSubmission {
  offerType: OfferType;
  provider: string | null;
  make: string;
  model: string;
  modelYear: number;
  trim: string | null;
  mileageAtPurchase: number;
  mileageBand: string | null;
  ageBand: string | null;
  state: string | null;
  termMonths: number;
  termMileage: number | null;
  deductible: number;
  coverageTier: string;
  price: number;
  perYear: number;
  monthly: number | null;
  downPayment: number;
  sourceType: "dealer_quote" | "consumer_reported" | "public_quote";
  confidence: "low" | "medium" | "high";
  reviewStatus: "pending";
  dedupeKey: string;
  notes: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
