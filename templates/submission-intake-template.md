# Submission Intake — "Show Us Yours"

This is how real numbers get into Driveway Advocate. Anyone who got a vehicle service
contract quote or offer can share it, and it strengthens the fair-price database for the
next buyer. Fill one row per offer in
[`submission-intake-template.csv`](submission-intake-template.csv) and run it through the
ingest pipeline (see below).

> Every submission lands in a **moderation queue** first — it does **not** affect any
> price estimate until a reviewer approves and promotes it.

## What to fill in

| Field | Required | What it is |
|-------|:-------:|------------|
| `offer_type` | ✅ | One of: `dealer_initial` (the dealer's opening offer), `price_paid` (what you actually paid after negotiating), `outside_quote` (a quote from a DTC provider or credit union) |
| `provider_name` | – | Who quoted it (e.g. "Dealer F&I", "Endurance", "olive", "My Credit Union") |
| `make` / `model` | ✅ | Vehicle make and model |
| `model_year` | ✅ | Vehicle model year |
| `trim` | – | Trim level |
| `mileage` | ✅ | Odometer miles at the time of the quote |
| `state` | – | State or ZIP (helps with regional pricing) |
| `term_months` | ✅ | Contract length in months |
| `term_mileage` | – | Mileage cap added by the contract |
| `deductible` | – | Per-visit deductible (defaults to $100 if blank) |
| `coverage_tier` | ✅ | Coverage type — see tiers below (aliases like "bumper to bumper" are accepted) |
| `price` | ✅ | Total contract price (not the monthly payment) |
| `monthly` | – | Monthly payment, if financed |
| `down_payment` | – | Any down payment |
| `submitter_ref` | – | Optional handle/initials so you can be credited (never published) |
| `notes` | – | Anything useful (e.g. "they dropped it $900 when I pushed back") |

## offer_type → how it's used

| `offer_type` | Stored as | Counts toward "fair price"? |
|--------------|-----------|------------------------------|
| `dealer_initial` | `dealer_quote` | **No** — opening offers are marked-up anchors, tracked to measure markup |
| `price_paid` | `consumer_reported` | **Yes** — what people actually paid is the best fair-price signal |
| `outside_quote` | `public_quote` | **Yes** — DTC/credit-union quotes anchor the competitive floor |

## Coverage tiers (`coverage_tier`)

`powertrain`, `powertrain_plus`, `stated_component`, `high_tech`, `comprehensive`,
`exclusionary` (= bumper-to-bumper), `ev_hybrid`, `wrap`, `cpo`. Full definitions in
[`../research/05-coverage-tiers.md`](../research/05-coverage-tiers.md). Common phrases are
auto-mapped (e.g. "bumper to bumper" → `exclusionary`, "drivetrain" → `powertrain`).

## How to submit it

```bash
# 1. Validate + load into the moderation queue (status: pending)
python -m drivewayadvocate.cli ingest --file my_offers.csv

#    Preview only, change nothing:
python -m drivewayadvocate.cli ingest --file my_offers.csv --dry-run

# 2. A reviewer approves/rejects pending rows
python -m drivewayadvocate.cli review                 # list pending
python -m drivewayadvocate.cli review --approve 7 8   # approve by id
python -m drivewayadvocate.cli review --reject 9

# 3. Promote approved rows into the canonical pricing data the engine uses
python -m drivewayadvocate.cli promote
```
