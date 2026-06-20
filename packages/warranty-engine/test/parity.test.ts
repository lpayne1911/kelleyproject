// Cross-language parity: the TS engine must reproduce the Python engine.
// fixtures.generated.json is produced by `python scripts/export_ts_data.py`.
import { describe, expect, it } from "vitest";

import { priceQuote, scoreVehicle, type QuoteRequest } from "../src/index.js";
import fixtures from "./fixtures.generated.json";

const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

describe("scoring parity with the Python engine", () => {
  for (const c of fixtures.scoreCases as any[]) {
    it(`${c.input.make} ${c.input.model} @ ${c.input.miles}mi/${c.input.years}yr`, () => {
      const opts: any = {};
      if (c.input.year != null) opts.year = c.input.year;
      if (c.input.attrs) Object.assign(opts, c.input.attrs);
      const s = scoreVehicle(c.input.make, c.input.model, c.input.miles, c.input.years, opts);
      const e = c.expected;
      expect(near(s.fullScore, e.fullScore)).toBe(true);
      expect(near(s.intrinsicScore, e.intrinsicScore)).toBe(true);
      expect(s.mileageScore).toBe(e.mileageScore);
      expect(s.ageScore).toBe(e.ageScore);
      expect(s.riskLabel).toBe(e.riskLabel);
      expect(s.source).toBe(e.source);
      expect(s.topDrivers).toEqual(e.topDrivers);
    });
  }
});

describe("pricing parity with the Python engine", () => {
  for (const c of fixtures.priceCases as any[]) {
    it(`${c.input.make} ${c.input.model} ${c.input.tier} ${c.input.termMonths}mo`, () => {
      const r = priceQuote(c.input as QuoteRequest);
      const e = c.expected;
      expect(near(r.fairLow, e.fairLow)).toBe(true);
      expect(near(r.fairMid, e.fairMid)).toBe(true);
      expect(near(r.fairHigh, e.fairHigh)).toBe(true);
      expect(near(r.dealerCostEst, e.dealerCostEst)).toBe(true);
      expect(near(r.negotiationTarget, e.negotiationTarget)).toBe(true);
      expect(near(r.perYearFair, e.perYearFair)).toBe(true);
      expect(r.observedN).toBe(e.observedN);
      expect(r.verdict).toBe(e.verdict);
      expect(r.confidence).toBe(e.confidence);
      if (e.markupVsCostPct == null) expect(r.markupVsCostPct).toBeNull();
      else expect(near(r.markupVsCostPct as number, e.markupVsCostPct)).toBe(true);
      if (e.offerVsFairPct == null) expect(r.offerVsFairPct).toBeNull();
      else expect(near(r.offerVsFairPct as number, e.offerVsFairPct)).toBe(true);
      // user-facing strings ported verbatim — must match exactly
      expect(r.markupWarning).toBe(e.markupWarning);
      expect(r.recommendation).toBe(e.recommendation);
      expect(r.score.fullScore).toBe(e.fullScore);
    });
  }
});
