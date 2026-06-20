# Executive Summary

**Project:** Vehicle Service Contract (VSC) pricing intelligence database + engine for
Driveway Advocate, a buyer-side automotive advocacy business.

**Problem.** Vehicle service contracts ("extended warranties") are one of the most opaque
products in the car-buying process. Unlike the vehicle itself — where buyers have KBB,
Edmunds, and invoice data — there is **no public pricing reference** for VSCs. Dealers
exploit this: markups on a VSC commonly run **50%–200%+ over wholesale cost**, and a
single contract can add **$1,000+ of pure profit** to a deal
([dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties),
[ConsumerAffairs](https://www.consumeraffairs.com/automotive/what-is-a-dealership-warranty.html)).
F&I managers are commissioned on these sales, which structurally pushes prices up.

**Opportunity.** A normalized database of real and estimated VSC pricing — keyed by
vehicle, mileage, age, coverage tier, term, and provider — lets a buyer instantly see
whether an offer is fair. That is a durable data advantage: the **"KBB for service
contracts."**

## Key market facts (researched)

- **Cost ranges.** VSCs broadly run **$1,000–$3,600+ total** depending on vehicle and
  coverage; powertrain-only ≈ **$600–$750/yr**, midlevel ≈ **$1,000–$1,500/yr**,
  comprehensive/bumper-to-bumper **$1,000–$4,000+/yr**
  ([Insurify](https://insurify.com/auto-warranty/extended-warranty-cost/),
  [ConsumerAffairs](https://www.consumeraffairs.com/automotive/extended-car-warranty-cost.html)).
- **Luxury/European premium.** Luxury and European vehicles typically cost **2–3×** more
  to cover than mainstream domestic/Japanese cars
  ([Insurify](https://insurify.com/auto-warranty/extended-warranty-cost/)).
- **Reliability drives price.** Toyota (~$441/yr repair), Honda (~$428) sit at the low end;
  Porsche (~$1,192), BMW (~$968) at the high end
  ([CarEdge/RepairPal via SlashGear](https://www.slashgear.com/1836652/expensive-car-brands-maintenance-costs-ranked/)).
  Jeep ranks **dead last** for brand reliability three years running; Toyota ranks #1
  ([Consumer Reports](https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/who-makes-the-most-reliable-cars-a7824554938/)).
- **Provider structure matters.** Endurance **administers** its own plans; CarShield and
  CARCHEX are **brokers** reselling third-party administrators; OEM plans (Honda Care,
  Toyota ECP, Ford Protect) are manufacturer-backed
  ([Cars.com](https://www.cars.com/car-warranty/money/best-extended-car-warranty-plans/)).
- **Markup is negotiable.** A fair dealer profit is roughly **$200–$500 over cost**;
  experts advise buying VSCs at "cost-plus"
  ([Edmunds](https://www.edmunds.com/auto-warranty/how-to-get-the-best-price-on-an-extended-car-warranty.html)).

## What this repo delivers

1. **Research** — market map, provider comparison, pricing-factor matrix, dealer-markup
   analysis, coverage-tier glossary, data-collection workflow, business strategy.
2. **Database** — a normalized SQLite schema with seed data (15 representative vehicles,
   providers, coverage tiers, mileage/age bands, and 30+ labeled pricing observations).
3. **Risk model** — a documented 1–100 vehicle warranty-risk score.
4. **Engine** — a Python library + CLI that turns a vehicle and a dealer offer into a fair
   price range, dealer-cost estimate, markup warning, negotiation target, and a
   buy/negotiate/decline recommendation.

All pricing is labeled by source type and confidence; estimates are never presented as
facts. See [`sources.md`](sources.md) for the consolidated source list.
