import { describe, expect, it } from "vitest";

import {
  normalizeSubmission,
  validateSubmission,
  type SubmissionInput,
} from "../src/index.js";

const sub = (over: Partial<SubmissionInput> = {}): SubmissionInput => ({
  offerType: "price_paid", make: "Toyota", model: "RAV4", modelYear: 2022,
  mileage: 30000, termMonths: 48, coverageTier: "exclusionary", price: 2600, ...over,
});

describe("submission validation", () => {
  it("accepts a well-formed submission", () => {
    expect(validateSubmission(sub()).valid).toBe(true);
  });

  it("rejects an out-of-range price", () => {
    const r = validateSubmission(sub({ price: 99999 }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("price out of range"))).toBe(true);
  });

  it("rejects an unknown coverage tier", () => {
    const r = validateSubmission(sub({ coverageTier: "totally made up" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("coverage_tier"))).toBe(true);
  });

  it("rejects a bad offer type", () => {
    const r = validateSubmission(sub({ offerType: "freebie" as any }));
    expect(r.valid).toBe(false);
  });
});

describe("submission normalization", () => {
  it("maps a tier alias, computes bands, per-year, and source mapping", () => {
    const n = normalizeSubmission(sub({ coverageTier: "bumper to bumper" }));
    expect(n.coverageTier).toBe("exclusionary");
    expect(n.mileageBand).toBe("12001_36000"); // 30k
    expect(n.ageBand).toBe("4_6"); // 2026 - 2022 = 4
    expect(n.perYear).toBe(Math.round((2600 * 12) / 48)); // 650
    expect(n.sourceType).toBe("consumer_reported"); // price_paid
    expect(n.confidence).toBe("medium");
    expect(n.reviewStatus).toBe("pending");
  });

  it("offer type drives the source label", () => {
    expect(normalizeSubmission(sub({ offerType: "dealer_initial" })).sourceType).toBe("dealer_quote");
    expect(normalizeSubmission(sub({ offerType: "outside_quote" })).sourceType).toBe("public_quote");
  });

  it("dedupe key is deterministic and differs across distinct offers", () => {
    const a = normalizeSubmission(sub());
    const b = normalizeSubmission(sub());
    const c = normalizeSubmission(sub({ price: 2700 }));
    expect(a.dedupeKey).toBe(b.dedupeKey);
    expect(a.dedupeKey).not.toBe(c.dedupeKey);
  });
});
