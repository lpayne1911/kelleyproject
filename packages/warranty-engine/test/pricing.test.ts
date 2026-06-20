import { describe, expect, it } from "vitest";

import { priceQuote, riskMultiplier, type QuoteRequest } from "../src/index.js";

const req = (over: Partial<QuoteRequest> = {}): QuoteRequest => ({
  make: "Toyota", model: "Camry", year: 2021, mileage: 45000,
  termMonths: 36, tier: "powertrain", deductible: 100, ...over,
});

describe("pricing", () => {
  it("risk multiplier is bounded, monotonic, ~1.0 for an average vehicle", () => {
    expect(riskMultiplier(0)).toBeGreaterThanOrEqual(0.55);
    expect(riskMultiplier(100)).toBeLessThanOrEqual(1.95);
    expect(riskMultiplier(20)).toBeLessThan(riskMultiplier(70));
    expect(riskMultiplier(37)).toBeGreaterThanOrEqual(0.9);
    expect(riskMultiplier(37)).toBeLessThanOrEqual(1.1);
  });

  it("fair range is ordered and dealer cost sits below the mid", () => {
    const r = priceQuote(req());
    expect(r.fairLow).toBeLessThan(r.fairMid);
    expect(r.fairMid).toBeLessThan(r.fairHigh);
    expect(r.dealerCostEst).toBeLessThan(r.fairMid);
    expect(r.negotiationTarget).toBeLessThanOrEqual(r.fairMid);
  });

  it("luxury costs more than economy for the same coverage", () => {
    const camry = priceQuote(req({ tier: "exclusionary" }));
    const bmw = priceQuote(req({ make: "BMW", model: "3 Series", tier: "exclusionary" }));
    expect(bmw.fairMid).toBeGreaterThan(camry.fairMid);
  });

  it("higher mileage and broader tier both cost more", () => {
    expect(priceQuote(req({ mileage: 120000, tier: "stated_component" })).fairMid)
      .toBeGreaterThan(priceQuote(req({ mileage: 20000, tier: "stated_component" })).fairMid);
    expect(priceQuote(req({ tier: "exclusionary" })).fairMid)
      .toBeGreaterThan(priceQuote(req({ tier: "powertrain" })).fairMid);
  });

  it("higher deductible lowers price; longer term raises it", () => {
    expect(priceQuote(req({ tier: "exclusionary", deductible: 500 })).fairMid)
      .toBeLessThan(priceQuote(req({ tier: "exclusionary", deductible: 0 })).fairMid);
    expect(priceQuote(req({ tier: "exclusionary", termMonths: 60 })).fairMid)
      .toBeGreaterThan(priceQuote(req({ tier: "exclusionary", termMonths: 24 })).fairMid);
  });

  it("flags an overpriced offer with a markup warning", () => {
    const r = priceQuote(req({ tier: "powertrain", dealerOffer: 6000 }));
    expect(r.verdict).toBe("OVERPRICED");
    expect(r.markupWarning).not.toBeNull();
    expect(r.recommendation).toMatch(/DECLINE|NEGOTIATE/);
  });

  it("a fair offer is not flagged", () => {
    const base = priceQuote(req({ tier: "exclusionary" }));
    const r = priceQuote(req({ tier: "exclusionary", dealerOffer: base.fairMid }));
    expect(r.verdict).toBe("FAIR");
    expect(r.markupWarning).toBeNull();
  });

  it("rejects invalid input", () => {
    expect(() => priceQuote(req({ termMonths: 0 }))).toThrow(/termMonths/);
    expect(() => priceQuote(req({ mileage: -1 }))).toThrow(/mileage/);
    expect(() => priceQuote(req({ deductible: -5 }))).toThrow(/deductible/);
  });

  it("unknown tier is priced as a proxy with a note", () => {
    const r = priceQuote(req({ make: "Toyota", model: "Corolla", tier: "made_up_tier" }));
    expect(r.explanation.some((l) => l.includes("Unknown coverage tier"))).toBe(true);
  });

  it("BMW vs Camry regression: same $4,200 offer reads FAIR vs NEGOTIATE", () => {
    const bmw = priceQuote(req({ make: "BMW", model: "3 Series", tier: "exclusionary", dealerOffer: 4200 }));
    const camry = priceQuote(req({ tier: "exclusionary", dealerOffer: 4200 }));
    expect(bmw.verdict).toBe("FAIR");
    expect(camry.verdict).toBe("NEGOTIATE");
    expect(camry.markupWarning).not.toBeNull();
  });
});
