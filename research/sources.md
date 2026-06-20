# Consolidated Sources

All sources used across the research docs and seed-data calibration, with the confidence
level assigned to claims drawn from each. Confidence reflects how much weight the project
puts on the figure, **not** the reputability of the outlet alone (pricing in this market is
inherently noisy). Collected June 2026.

## Pricing & cost ranges

| # | Source | Used for | Confidence |
|---|--------|----------|------------|
| 1 | [Insurify — Average Cost of Extended Auto Warranties (2026)](https://insurify.com/auto-warranty/extended-warranty-cost/) | Annual averages ($1,068–$3,588; avg ~$1,897); luxury 2–3× | Medium |
| 2 | [ConsumerAffairs — Extended Car Warranty Cost](https://www.consumeraffairs.com/automotive/extended-car-warranty-cost.html) | Powertrain vs B2B per-year ranges | Medium |
| 3 | [Cuvrd — Extended Warranty Estimate 2025](https://cuvrd.com/blog/post/extended-warranty-estimate-what-to-expect-in-2025) | $75–$150/mo framing | Low |
| 4 | [autopom! — How Much Does an Extended Car Warranty Cost?](https://autopom.com/extended-car-warranty-cost/) | ~$1,000/yr per added B2B year (500+ quotes) | Medium |
| 5 | [ConsumerAffairs — Honda Extended Warranty](https://www.consumeraffairs.com/automotive/honda-extended-warranty.html) | Honda Care $700–$1,800; $300–$600/yr | Medium |
| 6 | [ConsumerAffairs — Tesla / Model 3 Extended Warranty](https://www.consumeraffairs.com/automotive/tesla-model-3-extended-warranty.html) | olive $5,412.50/yr Tesla quote; MB EQS $7,550; Porsche Taycan $8,112 | Medium (public_quote) |
| 7 | [ConsumerAffairs — Tesla Extended Warranty](https://www.consumeraffairs.com/automotive/tesla-extended-warranty.html) | Tesla ESA $50–$150/mo; no 3rd-party ESA on Model 3 | Medium |

## Dealer markup

| # | Source | Used for | Confidence |
|---|--------|----------|------------|
| 8 | [dealerre.com — Profit Margin Analysis](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties) | Markup ≥50% of retail; 50–200% over wholesale; F&I commissions | Medium |
| 9 | [ConsumerAffairs — What Is a Dealership Warranty?](https://www.consumeraffairs.com/automotive/what-is-a-dealership-warranty.html) | 40–400% markup spread; $1,000+ profit | Medium |
| 10 | [Edmunds — Get the Best Price on an Extended Warranty](https://www.edmunds.com/auto-warranty/how-to-get-the-best-price-on-an-extended-car-warranty.html) | Fair profit $200–$500 over cost; cost-plus strategy | High |
| 11 | [Edmunds — Secrets of Negotiating a Car Extended Warranty](https://www.edmunds.com/car-buying/secrets-of-an-ace-negotiator-part-ii.html) | Negotiation tactics | Medium |
| 12 | [ConsumerAffairs — Can You Negotiate an Extended Car Warranty?](https://www.consumeraffairs.com/automotive/can-you-negotiate-extended-car-warranty.html) | Negotiability | Medium |

## Providers & structure

| # | Source | Used for | Confidence |
|---|--------|----------|------------|
| 13 | [Cars.com — Best Extended Car Warranty Plans](https://www.cars.com/car-warranty/money/best-extended-car-warranty-plans/) | Endurance self-administers; CarShield/CARCHEX brokers | Medium |
| 14 | [NerdWallet — Best Extended Car Warranty Companies](https://www.nerdwallet.com/auto-loans/learn/best-extended-car-warranty) | Provider roster | Medium |
| 15 | [CNBC Select — Best Extended Car Warranties](https://www.cnbc.com/select/best-extended-car-warranties/) | Provider roster | Medium |
| 16 | [AM Best — Best's Credit Ratings](https://web.ambest.com/ratings-services/bests-credit-ratings) | Insurer-backer rating concept | High |

## Reliability & repair cost (risk-score inputs)

| # | Source | Used for | Confidence |
|---|--------|----------|------------|
| 17 | [SlashGear — Car Brands Ranked by Maintenance Cost (RepairPal/CarEdge)](https://www.slashgear.com/1836652/expensive-car-brands-maintenance-costs-ranked/) | Porsche $1,192, BMW $968, Honda $428, Toyota $441, Kia $474, Acura $501 annual repair | Medium |
| 18 | [Consumer Reports — Who Makes the Most Reliable Cars](https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/who-makes-the-most-reliable-cars-a7824554938/) | Toyota #1; Jeep last; brand ranks | High |
| 19 | [Cars.com — Toyota Tops CR Reliability Survey](https://www.cars.com/articles/toyota-again-tops-consumer-reports-annual-auto-reliability-survey-519312/) | Camry/Accord reliability | Medium |
| 20 | [ConsumerAffairs — 10 Most Expensive Car Repairs](https://www.consumeraffairs.com/automotive/most-expensive-car-repairs.html) | Repair severity | Low |

## How confidence maps to the database

- `verified` → filed rates / official reliability data (e.g., #16, #18).
- `public_quote` → a specific published price for a specific vehicle (e.g., #6).
- `consumer_reported` → forum/owner-reported paid prices.
- `estimated` → derived from published ranges via the documented model.
- `assumption` → engineering judgment where no public data exists (e.g., component
  sub-scores in the risk model).

> ⚠️ Most figures here are **Medium** confidence: VSC pricing is opaque and outlet figures
> are themselves estimates. Treat everything as a calibration starting point to be replaced
> by collected `dealer_quote` / `public_quote` data per
> [`06-research-workflow.md`](06-research-workflow.md).
