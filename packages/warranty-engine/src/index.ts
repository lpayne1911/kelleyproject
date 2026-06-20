// @drivewayadvocate/warranty-engine — public API.
// A dependency-free TypeScript port of the Python scoring + pricing + validation engine.

export type {
  ScoreComponents,
  ScoreResult,
  RiskLabel,
  VehicleAttrs,
  Segment,
  Powertrain,
  Drivetrain,
  QuoteRequest,
  QuoteResult,
  Verdict,
  OfferType,
  SubmissionInput,
  NormalizedSubmission,
  ValidationResult,
} from "./types.js";

export {
  scoreVehicle,
  scoreFromComponents,
  estimateIntrinsicFromAttrs,
  loadIntrinsicFromData,
  mileageScore,
  ageScore,
  riskLabelFor,
  pyRound,
} from "./scoring.js";

export {
  priceQuote,
  riskMultiplier,
  validateQuoteRequest,
  observedFairMid,
  ageYearsFor,
} from "./pricing.js";

export {
  validateSubmission,
  normalizeSubmission,
  resolveTier,
  computeDedupeKey,
  ALLOWED_OFFER_TYPES,
  OFFER_TYPE_SOURCE,
  OFFER_TYPE_CONFIDENCE,
  TIER_ALIASES,
} from "./ingest.js";

export { DATA_VERSION, DATA_GENERATED_AT } from "./data.generated.js";
