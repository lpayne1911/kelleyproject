# Pricing Factor Matrix

How strongly each factor moves the **price** of a vehicle service contract. Impact labels:

- **Low** — moves price ≲ 10%
- **Medium** — ~10–30%
- **High** — ~30–80%
- **Extreme** — can multiply price 2×+ or cause a decline/exclusion

| Factor | Impact | Direction | Notes |
|--------|--------|-----------|-------|
| **Make (brand)** | **Extreme** | Luxury/European ↑ | Porsche ~$1,192/yr vs Honda ~$428/yr repair cost ([SlashGear](https://www.slashgear.com/1836652/expensive-car-brands-maintenance-costs-ranked/)). Luxury covers 2–3× mainstream ([Insurify](https://insurify.com/auto-warranty/extended-warranty-cost/)). |
| **Model / known failure points** | **High** | Problem models ↑ | Nissan CVT, Jeep GC electrical, Honda 1.5T oil dilution, etc. |
| **Model year / generation** | Medium | Newer ↑ value, older ↑ risk | New tech raises parts cost; old age raises claims. |
| **Mileage at purchase** | **Extreme** | More miles ↑ | Step-ups at 60k, 100k, 125k; many plans cap eligibility at 150k–200k. |
| **Vehicle age** | **High** | Older ↑ | Compounds with mileage; eligibility windows. |
| **Vehicle class** | Medium | Trucks/large SUV ↑ | Heavier-duty parts, towing wear. |
| **Engine / powertrain complexity** | **High** | Complex ↑ | V8, twin-turbo, diesel cost more than NA 4-cyl. |
| **Turbocharged** | **High** | Turbo ↑ | Turbos are common, expensive failure points. |
| **AWD / 4WD** | Medium | AWD ↑ | More drivetrain components to cover. |
| **Hybrid / EV status** | **High** | Hybrid/EV ↑ | High-voltage battery, inverter, EV-specific parts; specialized labor. |
| **Luxury parts cost** | **Extreme** | Luxury ↑ | German electronics and parts dominate claims severity. |
| **Known reliability history** | **High** | Unreliable ↑ | Jeep last in CR; Toyota first ([Consumer Reports](https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/who-makes-the-most-reliable-cars-a7824554938/)). |
| **Repair-cost severity** | **High** | Expensive repairs ↑ | Drives claims-cost expectation. |
| **Term length** | **High** | Longer ↑ | Roughly linear per added year (~$300–$1,000/yr added). |
| **Mileage limit** | **High** | Higher cap ↑ | More covered exposure. |
| **Deductible** | Medium | Higher deductible ↓ | $0 vs $100 vs $250 meaningfully shifts premium. |
| **Coverage tier** | **Extreme** | Broader ↑ | Powertrain (~$600–750/yr) → exclusionary B2B ($1,000–$4,000+/yr) ([ConsumerAffairs](https://www.consumeraffairs.com/automotive/extended-car-warranty-cost.html)). |
| **Exclusionary vs stated-component** | **High** | Exclusionary ↑ | Exclusionary covers more (everything except a short list). |
| **Waiting period** | Low | — | Affects value, not headline price. |
| **Existing factory warranty** | Medium | Overlap ↓ | "Wrap" coverage is cheaper while factory powertrain remains. |
| **Dealer markup** | **Extreme** | Markup ↑ | 50–200%+ over cost; the buyer's #1 controllable lever ([dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties)). |
| **State restrictions** | Medium | Varies | Some states cap pricing/cancellation; CA has special rules. |
| **Sales channel** | **High** | Dealer ↑ vs CU/DTC ↓ | Credit-union/DTC typically cheaper than F&I desk. |

## How the engine uses this

The pricing engine collapses these into three multiplier groups on top of a coverage-tier
base price:

1. **Risk multiplier** ← intrinsic vehicle factors (make, model, complexity, luxury,
   hybrid/EV, reliability, claims likelihood) via the [risk score](../scoring/risk-scoring-model.md).
2. **Mileage multiplier** ← mileage band.
3. **Age multiplier** ← age band.

Term length scales linearly; deductible and tier select the base. Markup is then evaluated
*against* the resulting fair-price range — see
[`04-dealer-markup-analysis.md`](04-dealer-markup-analysis.md).
