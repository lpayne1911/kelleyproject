import { describe, expect, it } from "vitest";

import {
  ageScore,
  estimateIntrinsicFromAttrs,
  mileageScore,
  scoreFromComponents,
  scoreVehicle,
  type ScoreComponents,
} from "../src/index.js";

const flat = (v: number): ScoreComponents => ({
  brandRepairCost: v, modelReliability: v, powertrainComplexity: v, electronicsComplexity: v,
  knownFailurePoints: v, luxuryPartsCost: v, hybridEvComponents: v, claimsLikelihood: v,
});

describe("scoring", () => {
  it("bands are monotonic", () => {
    expect(mileageScore(5000)).toBeLessThan(mileageScore(50000));
    expect(mileageScore(50000)).toBeLessThan(mileageScore(140000));
    expect(ageScore(2)).toBeLessThan(ageScore(8));
  });

  it("band boundaries are inclusive on the upper edge", () => {
    expect(mileageScore(12000)).toBe(10);
    expect(mileageScore(12001)).toBe(20);
    expect(ageScore(3)).toBe(15);
    expect(ageScore(4)).toBe(35);
  });

  it("score is bounded and tops out at 99", () => {
    const low = scoreFromComponents(flat(0), 0, 0);
    const high = scoreFromComponents(flat(100), 200000, 30);
    expect(low.fullScore).toBeGreaterThanOrEqual(1);
    expect(high.fullScore).toBe(99); // mileage band max 95, age band max 90
  });

  it("mileage and age raise the full score but not the intrinsic", () => {
    const base = scoreFromComponents(flat(40), 10000, 2);
    const miles = scoreFromComponents(flat(40), 130000, 2);
    expect(miles.fullScore).toBeGreaterThan(base.fullScore);
    expect(miles.intrinsicScore).toBe(base.intrinsicScore);
  });

  it("luxury vehicle scores higher than economy", () => {
    const camry = scoreVehicle("Toyota", "Camry", 45000, 5, { year: 2021 });
    const bmw = scoreVehicle("BMW", "3 Series", 45000, 5, { year: 2021 });
    expect(bmw.fullScore).toBeGreaterThan(camry.fullScore);
    expect(bmw.source).toBe("database");
  });

  it("unknown vehicle falls back to the attribute heuristic", () => {
    const r = scoreVehicle("Lamborghini", "Huracan", 20000, 2, {
      segment: "luxury", luxury: true, turbo: true, drivetrain: "awd",
    });
    expect(r.source).toBe("estimated");
    expect(r.intrinsicScore).toBeGreaterThan(60);
  });

  it("EV attribute raises the hybrid/EV and electronics components", () => {
    const ice = estimateIntrinsicFromAttrs({ segment: "mainstream", powertrain: "ice" });
    const ev = estimateIntrinsicFromAttrs({ segment: "mainstream", powertrain: "ev" });
    expect(ev.hybridEvComponents).toBeGreaterThan(ice.hybridEvComponents);
    expect(ev.electronicsComplexity).toBeGreaterThan(ice.electronicsComplexity);
  });
});
