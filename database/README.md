# Database

SQLite schema + seed data for the VSC pricing database.

## Build

```bash
python -m drivewayadvocate.db --build        # creates database/vsc.db from schema.sql + seed/
python -m drivewayadvocate.db --build --db /tmp/vsc.db
```

`db.py` executes `schema.sql`, then loads every CSV in `seed/` into the matching table, then
prints row counts.

## Schema (entity relationships)

```
coverage_tiers ─┐
mileage_bands ──┤
age_bands ──────┤        (lookups referenced by pricing_observations)
                │
providers ──────┼──< pricing_observations >──┬── vehicles ──1:1── vehicle_risk_scores
                                              │
vehicles ───────────────────────────────────-┘
```

| Table | Grain | Key columns |
|-------|-------|-------------|
| `providers` | one row per provider | `provider_id`, `business_role`, `channel` |
| `coverage_tiers` | one row per normalized tier | `tier_key`, `exclusionary_flag` |
| `mileage_bands` / `age_bands` | one row per band | `band_key`, `risk_score`, `price_mult` |
| `vehicles` | one row per year/make/model/trim | `vehicle_id`, `vehicle_class`, `segment` |
| `vehicle_risk_scores` | 1:1 with `vehicles` | 8 intrinsic component scores + `reference_total` |
| `pricing_observations` | **central fact**: one row per observed/estimated price | `obs_id`, `source_type`, `confidence` |

## Views

- `v_fair_price_by_class_tier` — aggregates observations into low/mid/high retail and
  average per-year cost by `vehicle_class` + `coverage_tier`. **Excludes `dealer_quote`
  rows** (those are marked-up F&I offers, not fair prices).

## Data labeling

Every row in `providers`, `vehicle_risk_scores`, and `pricing_observations` carries
`source_type` ∈ (`verified`, `public_quote`, `dealer_quote`, `consumer_reported`,
`estimated`, `assumption`) and `confidence` ∈ (`high`, `medium`, `low`). The seed set is
deliberately a mix of public quotes (with `source_url`) and clearly-labeled estimates;
replace estimates with collected data per
[`../research/06-research-workflow.md`](../research/06-research-workflow.md).
