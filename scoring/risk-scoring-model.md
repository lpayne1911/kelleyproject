# Vehicle Warranty-Risk Scoring Model (1–100)

A single number that captures **how risky/expensive a vehicle is to cover** with a service
contract. **100 = highest warranty pricing risk** (most expensive, most likely to claim);
**1 = lowest**. The score drives the pricing engine's risk multiplier and gives the buyer a
plain-English risk indicator.

This document is the **specification**; `src/drivewayadvocate/scoring.py` is the
implementation. They share the same weights and component scores (component scores live in
[`../database/seed/vehicle_risk_scores.csv`](../database/seed/vehicle_risk_scores.csv) — a
single source of truth).

## Components & weights

Ten components, each scored **0–100**, combined by weight (weights sum to 1.0):

| Component | Weight | What it measures | Type |
|-----------|-------:|------------------|------|
| `brand_repair_cost` | 0.15 | Brand's average annual repair/parts cost | intrinsic |
| `model_reliability` | 0.15 | Model's failure frequency (higher = less reliable) | intrinsic |
| `powertrain_complexity` | 0.10 | Engine/trans complexity (V8, turbo, CVT, diesel) | intrinsic |
| `electronics_complexity` | 0.10 | Sensors, infotainment, ADAS, electrical density | intrinsic |
| `known_failure_points` | 0.10 | Documented chronic failures for the model | intrinsic |
| `luxury_parts_cost` | 0.10 | Parts/labor severity (luxury/European premium) | intrinsic |
| `hybrid_ev_components` | 0.05 | HV battery / inverter / e-motor exposure | intrinsic |
| `claims_likelihood` | 0.10 | Overall expected claim frequency | intrinsic |
| `mileage` | 0.10 | Mileage at purchase (situational) | contextual |
| `age` | 0.05 | Vehicle age in years (situational) | contextual |

The **eight intrinsic** components (weight sum 0.85) describe the make/model and are stored
per vehicle. The **two contextual** components (mileage 0.10, age 0.05) are computed at
runtime from the buyer's inputs.

## Formula

```
score_full = Σ (component_score_i × weight_i)        # 0–100, clamp to [1, 100]
```

Contextual component scores come from band lookups:

**Mileage → score**

| Mileage band | score |
|--------------|------:|
| 0–12,000 | 10 |
| 12,001–36,000 | 20 |
| 36,001–60,000 | 35 |
| 60,001–85,000 | 50 |
| 85,001–100,000 | 65 |
| 100,001–125,000 | 78 |
| 125,001–150,000 | 88 |
| 150,000+ | 95 |

**Age → score**

| Age band | score |
|----------|------:|
| 0–3 yrs | 15 |
| 4–6 yrs | 35 |
| 7–10 yrs | 55 |
| 11–15 yrs | 75 |
| 15+ yrs | 90 |

## Intrinsic risk (used by the pricing engine)

The pricing engine uses an **intrinsic-only** score so mileage/age aren't double-counted
(they're applied as separate pricing multipliers):

```
score_intrinsic = Σ (intrinsic_component_i × weight_i) / 0.85    # renormalized to 0–100
```

`score_full` (with mileage + age) is what's shown to the buyer; `score_intrinsic` feeds the
price multiplier.

## Reference total

Each vehicle's stored `reference_total` is `score_full` evaluated at **reference conditions**
(36,000 mi → mileage score 20; 3 yrs → age score 15). `scoring.py` reproduces this within
±1, which the test suite asserts — keeping the doc, the CSV, and the code in sync.

## Worked examples

**Toyota Camry** (intrinsic: brand 20, reliability 15, powertrain 25, electronics 30,
failures 15, luxury 10, hybrid/EV 0, claims 20) at 36k mi / 3 yrs:

```
intrinsic = .15·20 + .15·15 + .10·25 + .10·30 + .10·15 + .10·10 + .05·0 + .10·20 = 15.25
+ mileage .10·20 = 2.0   + age .05·15 = 0.75
score_full ≈ 18   |   score_intrinsic = 15.25 / 0.85 ≈ 18
```

**BMW 3 Series** (intrinsic: brand 85, reliability 55, powertrain 70, electronics 80,
failures 70, luxury 90, hybrid/EV 5, claims 72) at 36k mi / 3 yrs:

```
intrinsic = .15·85 + .15·55 + .10·70 + .10·80 + .10·70 + .10·90 + .05·5 + .10·72 = 59.45
+ mileage 2.0 + age 0.75
score_full ≈ 62   |   score_intrinsic = 59.45 / 0.85 ≈ 70
```

So the BMW is ~3.4× the Camry's risk — consistent with luxury/European covering 2–3× more
([Insurify](https://insurify.com/auto-warranty/extended-warranty-cost/)) plus its weaker
reliability/complexity profile.

## Calibration & confidence

Intrinsic component scores are **estimates / assumptions** anchored to:

- Brand repair cost — RepairPal/CarEdge annual figures (Porsche $1,192 → high; Honda $428 →
  low) ([SlashGear](https://www.slashgear.com/1836652/expensive-car-brands-maintenance-costs-ranked/)).
- Reliability — Consumer Reports brand/model ranks (Toyota #1, Jeep last)
  ([CR](https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/who-makes-the-most-reliable-cars-a7824554938/)).
- Known failure points — documented model issues (Nissan CVT, Honda 1.5T oil dilution,
  Jeep GC electrical, Subaru head gasket history).

These are starting weights. Re-tune quarterly as real claims/quote data accumulates
(see [`../research/06-research-workflow.md`](../research/06-research-workflow.md)); record
any weight changes here with a date.
