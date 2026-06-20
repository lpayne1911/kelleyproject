// Thin adapter over the dependency-free warranty engine. Re-exports the
// runtime functions/types the UI needs and centralizes the dropdown option
// lists so the forms stay in sync with the engine's accepted values.
export {
  priceQuote,
  validateQuoteRequest,
  validateSubmission,
  normalizeSubmission,
  scoreVehicle,
  riskLabelFor,
} from "@drivewayadvocate/warranty-engine";

export type {
  QuoteRequest,
  QuoteResult,
  Verdict,
  RiskLabel,
  ScoreResult,
  Segment,
  Powertrain,
  Drivetrain,
  SubmissionInput,
  NormalizedSubmission,
  OfferType,
  ValidationResult,
} from "@drivewayadvocate/warranty-engine";

import type {
  Segment,
  Powertrain,
  Drivetrain,
  OfferType,
} from "@drivewayadvocate/warranty-engine";

export interface Option<T extends string> {
  value: T;
  label: string;
}

/** Canonical coverage tiers (engine tier keys). Mirrors TIER_ALIASES targets. */
export const TIER_OPTIONS: Option<string>[] = [
  { value: "exclusionary", label: "Exclusionary (bumper-to-bumper)" },
  { value: "comprehensive", label: "Comprehensive" },
  { value: "powertrain_plus", label: "Powertrain Plus" },
  { value: "powertrain", label: "Powertrain / Drivetrain" },
  { value: "high_tech", label: "High-Tech / Electrical" },
  { value: "stated_component", label: "Stated Component" },
  { value: "ev_hybrid", label: "EV / Hybrid" },
  { value: "wrap", label: "Wrap" },
  { value: "cpo", label: "Certified Pre-Owned (CPO)" },
];

export const OFFER_TYPE_OPTIONS: Option<OfferType>[] = [
  { value: "dealer_initial", label: "Dealer's initial offer" },
  { value: "price_paid", label: "Price I actually paid" },
  { value: "outside_quote", label: "Outside / third-party quote" },
];

export const SEGMENT_OPTIONS: Option<Segment>[] = [
  { value: "economy", label: "Economy" },
  { value: "mainstream", label: "Mainstream" },
  { value: "performance", label: "Performance" },
  { value: "luxury", label: "Luxury" },
];

export const POWERTRAIN_OPTIONS: Option<Powertrain>[] = [
  { value: "ice", label: "Gas (ICE)" },
  { value: "hybrid", label: "Hybrid" },
  { value: "phev", label: "Plug-in Hybrid (PHEV)" },
  { value: "ev", label: "Electric (EV)" },
];

export const DRIVETRAIN_OPTIONS: Option<Drivetrain>[] = [
  { value: "fwd", label: "FWD" },
  { value: "rwd", label: "RWD" },
  { value: "awd", label: "AWD" },
  { value: "4wd", label: "4WD" },
];

export const TERM_OPTIONS: Option<string>[] = [
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
  { value: "48", label: "48 months" },
  { value: "60", label: "60 months" },
  { value: "72", label: "72 months" },
  { value: "84", label: "84 months" },
];

/** Format a number as whole USD (e.g. 1234.5 -> "$1,235"). */
export function usd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format a signed percentage from a fraction-or-percent value already in %. */
export function pct(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}
