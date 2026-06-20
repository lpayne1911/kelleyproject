# Market Overview & Industry Map

## What a "vehicle service contract" actually is

A **vehicle service contract (VSC)** is a paid agreement to repair or replace covered
components after the factory warranty expires. "Extended warranty" is the common
(technically imprecise) name — only the manufacturer can offer a true *warranty*; everyone
else sells a *service contract*. VSCs are regulated at the **state** level (often as
insurance products or as separate "service contract" statutes), which is why availability,
pricing, and cancellation rules vary by state.

## The four players in every contract

A VSC almost always involves a stack of distinct companies. Understanding who is who is
the key to understanding pricing and risk:

| Role | What they do | Examples |
|------|--------------|----------|
| **Obligor / Administrator** | Legally responsible for paying claims; administers the contract. | Endurance (self-administered), Fidelity Warranty Services, CNA National, Zurich, Dealers Assurance |
| **Insurer / Backer** | Insures the administrator's obligation (the CLIP — Contractual Liability Insurance Policy). Rated by **AM Best**. | AM Best–rated carriers behind each plan |
| **Broker / Marketer** | Sells contracts they don't administer; takes a commission. | CarShield, CARCHEX |
| **Seller / Channel** | Where the buyer actually purchases. | Dealership F&I office, OEM, direct-to-consumer site, credit union |

> Endurance is notable for **administering its own plans and claims** — one company to deal
> with — whereas CarShield and CARCHEX are **brokers** that resell third-party
> administrators
> ([Cars.com](https://www.cars.com/car-warranty/money/best-extended-car-warranty-plans/)).

## The three sales channels (and why price differs)

| Channel | How it's priced | Typical buyer takeaway |
|---------|-----------------|------------------------|
| **OEM-backed** (Honda Care, Toyota ECP, Ford Protect, GM/Mopar) | Sold through the dealer F&I office; manufacturer parts/standards; **price is set by a published dealer cost + dealer markup**. | Highest-quality coverage; **markup is negotiable** — OEM cost can be ~half the first offer. |
| **Dealer-sold third-party** (Fidelity, Zurich, CNA, etc. via F&I) | Dealer buys wholesale from an administrator and marks up. | Most opaque; biggest markup spread. |
| **Direct-to-consumer (DTC)** (Endurance, CarShield, olive, autopom!) | Published or phone quotes; no dealer in the middle. | Easier to comparison-shop; quality varies; read exclusions. |
| **Credit union / membership** | Offered at low markup as a member benefit. | Often the **cheapest** legitimate option; underused reference point. |

## How VSCs are priced (the levers)

Pricing is fundamentally **actuarial**: expected claims cost + administration + insurer
margin + seller markup. The expected-claims piece is driven by:

- **Vehicle risk** — brand repair cost, model reliability, powertrain/electronics
  complexity, known failure points, luxury parts cost, EV/hybrid systems.
- **Exposure** — mileage at purchase, vehicle age, term length, mileage limit.
- **Coverage breadth** — powertrain (cheap) → exclusionary bumper-to-bumper (expensive).
- **Deductible** — higher deductible lowers premium.
- **Channel & markup** — the single biggest *controllable* lever for the buyer.

Luxury and European vehicles cost **2–3× more** to cover than mainstream cars
([Insurify](https://insurify.com/auto-warranty/extended-warranty-cost/)), and high-mileage
contracts step up sharply in price as the vehicle crosses 60k, 100k, and 125k miles.

## Where the margin lives

The buyer's leverage is the **markup**, not the actuarial base. Dealer markup commonly
accounts for **50%+ of the retail price**, with markups of **50%–200% over wholesale**
([dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties)); some
OEM plans are marked up far more. A VSC can add **$1,000+ of gross profit** to a single
deal, and F&I staff are commissioned on it — see
[`04-dealer-markup-analysis.md`](04-dealer-markup-analysis.md).

## Implications for Driveway Advocate

1. The actuarial "fair base" is estimable from public ranges + reliability data.
2. The markup is large, opaque, and **negotiable** — that's where buyer value is created.
3. A database keyed by (vehicle, mileage, age, tier, term, channel) can surface a
   defensible fair-price range and a negotiation target on demand.
