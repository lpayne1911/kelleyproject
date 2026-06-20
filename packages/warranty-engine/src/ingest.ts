// Submission validation + normalization. Port of the pure parts of
// src/drivewayadvocate/ingest.py (no file I/O — the app decides where to persist).
import { CURRENT_YEAR } from "./constants.js";
import { AGE_BANDS, COVERAGE_TIERS, MILEAGE_BANDS, type BandRow } from "./data.generated.js";
import { pyRound } from "./scoring.js";
import type { NormalizedSubmission, OfferType, SubmissionInput, ValidationResult } from "./types.js";

export const ALLOWED_OFFER_TYPES: OfferType[] = ["dealer_initial", "price_paid", "outside_quote"];

export const OFFER_TYPE_SOURCE: Record<OfferType, NormalizedSubmission["sourceType"]> = {
  dealer_initial: "dealer_quote",
  price_paid: "consumer_reported",
  outside_quote: "public_quote",
};

export const OFFER_TYPE_CONFIDENCE: Record<OfferType, NormalizedSubmission["confidence"]> = {
  dealer_initial: "low",
  price_paid: "medium",
  outside_quote: "medium",
};

export const TIER_ALIASES: Record<string, string> = {
  "bumper to bumper": "exclusionary", "bumper-to-bumper": "exclusionary",
  b2b: "exclusionary", exclusionary: "exclusionary",
  drivetrain: "powertrain", "power train": "powertrain", powertrain: "powertrain",
  "powertrain plus": "powertrain_plus", "powertrain+": "powertrain_plus",
  stated: "stated_component", "stated component": "stated_component",
  "named component": "stated_component",
  "high tech": "high_tech", "high-tech": "high_tech", electrical: "high_tech",
  comprehensive: "comprehensive",
  ev: "ev_hybrid", hybrid: "ev_hybrid", "ev/hybrid": "ev_hybrid",
  "certified pre-owned": "cpo", cpo: "cpo", wrap: "wrap",
};

const MIN_YEAR = 1990;
const MAX_YEAR = CURRENT_YEAR + 1;
const MAX_MILEAGE = 400_000;
const MIN_TERM = 1;
const MAX_TERM = 120;
const MIN_PRICE = 50;
const MAX_PRICE = 40_000;

const KNOWN_TIERS = new Set(COVERAGE_TIERS.map((t) => t.tierKey));

export function resolveTier(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return TIER_ALIASES[key] ?? key;
}

function bandKeyFor(value: number, bands: readonly BandRow[]): string | null {
  for (const b of bands) {
    if (value >= b.minValue && (b.maxValue == null || value <= b.maxValue)) return b.bandKey;
  }
  return null;
}

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function validateSubmission(input: SubmissionInput): ValidationResult {
  const errors: string[] = [];

  if (!ALLOWED_OFFER_TYPES.includes(input.offerType)) {
    errors.push(`offer_type '${input.offerType}' not in ${JSON.stringify(ALLOWED_OFFER_TYPES)}`);
  }
  if (!input.make?.trim()) errors.push("missing required field 'make'");
  if (!input.model?.trim()) errors.push("missing required field 'model'");

  const tier = resolveTier(input.coverageTier);
  if (!tier || !KNOWN_TIERS.has(tier)) {
    errors.push(`unknown coverage_tier '${input.coverageTier}'`);
  }
  if (!isNum(input.modelYear) || input.modelYear < MIN_YEAR || input.modelYear > MAX_YEAR) {
    errors.push(`model_year out of range [${MIN_YEAR}-${MAX_YEAR}]: ${input.modelYear}`);
  }
  if (!isNum(input.mileage) || input.mileage < 0 || input.mileage > MAX_MILEAGE) {
    errors.push(`mileage out of range [0-${MAX_MILEAGE}]: ${input.mileage}`);
  }
  if (!isNum(input.termMonths) || input.termMonths < MIN_TERM || input.termMonths > MAX_TERM) {
    errors.push(`term_months out of range [${MIN_TERM}-${MAX_TERM}]: ${input.termMonths}`);
  }
  if (!isNum(input.price) || input.price < MIN_PRICE || input.price > MAX_PRICE) {
    errors.push(`price out of range [${MIN_PRICE}-${MAX_PRICE}]: ${input.price}`);
  }
  if (input.deductible != null && (!isNum(input.deductible) || input.deductible < 0)) {
    errors.push("deductible must be >= 0");
  }

  return { valid: errors.length === 0, errors };
}

/** FNV-1a 32-bit hex hash — deterministic, dependency-free. (TS-local; not identical to
 *  the Python sha1 key, which is fine: each store dedupes within itself.) */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function computeDedupeKey(n: {
  offerType: string; make: string; model: string; modelYear: number;
  mileageAtPurchase: number; termMonths: number; deductible: number;
  coverageTier: string; price: number; provider: string | null;
}): string {
  return fnv1a(
    [
      n.offerType,
      n.make.toLowerCase(),
      n.model.toLowerCase(),
      String(n.modelYear),
      String(n.mileageAtPurchase),
      String(n.termMonths),
      String(n.deductible),
      n.coverageTier,
      String(n.price),
      (n.provider ?? "").toLowerCase(),
    ].join("|"),
  );
}

export function normalizeSubmission(
  input: SubmissionInput,
  // Reserved for a future "as of" override (parity with the Python signature);
  // age is currently derived from CURRENT_YEAR. Prefixed to mark it unused.
  _opts: { today?: string } = {},
): NormalizedSubmission {
  const tier = resolveTier(input.coverageTier)!;
  const deductible = input.deductible ?? 100;
  const age = Math.max(0, CURRENT_YEAR - input.modelYear);

  const partial = {
    offerType: input.offerType,
    provider: input.providerName?.trim() || null,
    make: input.make.trim(),
    model: input.model.trim(),
    modelYear: input.modelYear,
    trim: input.trim?.trim() || null,
    mileageAtPurchase: input.mileage,
    mileageBand: bandKeyFor(input.mileage, MILEAGE_BANDS),
    ageBand: bandKeyFor(age, AGE_BANDS),
    state: input.state?.trim() || null,
    termMonths: input.termMonths,
    termMileage: input.termMileage ?? null,
    deductible,
    coverageTier: tier,
    price: input.price,
    perYear: pyRound((input.price * 12) / input.termMonths),
    monthly: input.monthly ?? null,
    downPayment: input.downPayment ?? 0,
    sourceType: OFFER_TYPE_SOURCE[input.offerType],
    confidence: OFFER_TYPE_CONFIDENCE[input.offerType],
    reviewStatus: "pending" as const,
    notes: input.notes?.trim() || null,
  };

  return { ...partial, dedupeKey: computeDedupeKey(partial) };
}
