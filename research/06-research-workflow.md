# Research & Data-Collection Workflow

How to populate the database with **real** pricing over time and keep it trustworthy. The
seed data ships as labeled *estimates*; this workflow replaces them with sourced
observations.

## 1. Sources to mine

| Tier | Source | What you get | Source type label |
|------|--------|--------------|-------------------|
| Best | Real dealer F&I quote sheets (buy/cost + retail) | Dealer cost AND markup | `dealer_quote` |
| Best | Direct provider quotes (Endurance, olive, autopom!) | Retail by vehicle/tier | `public_quote` |
| Best | Credit-union MBI pricing pages | Low-markup floor | `public_quote` |
| Good | OEM plan pricing sheets / dealer portals | OEM retail + cost tables | `public_quote` / `dealer_quote` |
| Good | State service-contract filings (where public) | Filed rates | `verified` |
| Medium | Owner forums (Reddit, brand forums, MyHonda/Tesla) | Real paid prices | `consumer_reported` |
| Medium | Comparison sites (ConsumerAffairs, Insurify, Edmunds) | Published ranges | `public_quote` |
| Low | Reliability/repair-cost benchmarks (RepairPal, CR, JD Power) | Risk inputs, not price | `verified` (for risk) |

## 2. Collection procedure

1. **Define the quote spec** before requesting: exact year/make/model/trim, current
   mileage, desired term (months) + mileage cap, deductible, coverage tier, ZIP/state.
2. **Request 2–3 channels for the same spec** where possible (dealer + DTC + CU) so you
   capture the markup spread on an identical vehicle.
3. **Record using the template** in [`../templates/quote-collection-template.csv`](../templates/quote-collection-template.csv).
4. **Capture provenance:** provider, channel, date, and a source URL or note. Never log a
   price without a `source_type` and `confidence`.

## 3. Normalization rules

Quotes are not directly comparable until normalized. Standard transforms:

- **Per-year retail** = `retail_price ÷ (term_months ÷ 12)` — the universal comparator.
- **Map plan name → `tier_key`** using [`05-coverage-tiers.md`](05-coverage-tiers.md).
- **Map mileage → `mileage_band`** and **age → `age_band`** (see schema seed CSVs).
- **Deductible normalization:** note deductible; when comparing, adjust to a common $100
  deductible baseline (higher deductible plans are cheaper — flag, don't silently merge).
- **Channel tag:** dealer / DTC / OEM / credit_union — never blend channels in a "fair
  price" aggregate without recording the channel.

## 4. Validation & confidence

- **Cross-check:** a price is promoted to `confidence = high` only when ≥ 2 independent
  sources agree within ~20%, or it is a `verified`/`dealer_quote` data point.
- **Outlier rule:** any observation > 2× the class/tier median is flagged for review (it's
  usually a markup, not a fair price — keep it, but label `source_type = dealer_quote`).
- **Staleness:** observations older than **18 months** are auto-downgraded one confidence
  level; pricing drifts with inflation and model changes.
- **Audit column:** `date_collected` is mandatory; re-collect annually for hot vehicles.

## 5. From estimate → sourced

Each seed row currently labeled `estimated`/`assumption` should be replaced by a real
observation as it's collected. The schema supports many observations per
vehicle/tier/band; the `v_fair_price_by_class_tier` view aggregates them into low/mid/high
ranges, so the engine's accuracy improves automatically as real data lands.

## 6. Cadence

- **Weekly:** collect 10–20 fresh quotes across target vehicles/channels.
- **Monthly:** re-aggregate; review outliers; refresh provider roster.
- **Quarterly:** re-pull reliability/repair-cost benchmarks; re-tune scoring weights if
  warranted (document changes in `scoring/risk-scoring-model.md`).
