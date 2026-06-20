# Driveway Advocate — Vehicle Service Contract (VSC) Pricing Intelligence

A research database **and** a runnable pricing engine for vehicle service contracts
(a.k.a. "extended car warranties" / vehicle protection plans).

The goal: be the **"KBB for service contracts."** Dealers profit on VSCs because the
buyer has no pricing reference point. This project builds that reference point so a buyer
can tell whether a dealer's offer is **fairly priced, overpriced, negotiable, or not worth
buying.**

> ⚠️ **Disclaimer:** This is a research and decision-support tool. All pricing produced by
> the engine is an **estimate** built from publicly reported ranges and documented
> assumptions — it is **not** a quote, an insurance product, or financial advice. Always
> confirm with real quotes before making a purchase decision.

---

## What's in here

| Path | What it is |
|------|------------|
| `research/` | Market research write-ups (overview, provider comparison, pricing factors, dealer markup, coverage tiers, workflow, business case) with cited sources. |
| `database/schema.sql` | SQLite schema for the pricing database. |
| `database/seed/` | Seed CSVs: providers, vehicles, risk scores, coverage tiers, bands, 30+ labeled pricing observations, and crowdsourced submissions. |
| `scoring/risk-scoring-model.md` | The 1–100 vehicle warranty-risk model: variables, weights, formula, worked examples. |
| `templates/` | Quote-collection template (for researchers) and the **submission intake** template (for crowdsourcing real offers). |
| `src/drivewayadvocate/` | The Python tool: build the DB, score a vehicle, price a VSC, ingest real submissions, CLI, and an optional FastAPI web layer (`api.py`). |
| `tests/` | Pytest suite for the scoring, pricing, DB, ingestion, CLI, and API layers. |

## Data integrity

Every pricing/fact data point is labeled with a **source type** and **confidence**:

`verified · public_quote · dealer_quote · consumer_reported · estimated · assumption`

No exact prices are invented. Where exact prices are not public, the tool uses **ranges**
and documents the methodology (see `scoring/` and `research/04-dealer-markup-analysis.md`).

---

## Quickstart

Requires **Python 3.9+** (standard library only; `pytest` for tests).

```bash
# 1. Build & seed the SQLite database (creates database/vsc.db)
python -m drivewayadvocate.db --build

# 2. Score a vehicle / price a dealer's offer
python -m drivewayadvocate.cli quote \
  --year 2021 --make BMW --model "3 Series" \
  --mileage 45000 --term-months 36 --term-mileage 45000 \
  --deductible 100 --tier exclusionary --dealer-offer 4200

# 3. Run the tests
pytest -q
```

The `quote` command prints an **advocacy report**: vehicle risk score, fair-market price
range, estimated dealer cost, markup warning, negotiation target, and a
buy / negotiate / decline recommendation.

## Capturing real numbers (crowdsourced data)

The seed prices are labeled estimates. Real numbers enter through a **moderated ingestion
pipeline** — people "show us theirs" by filling
[`templates/submission-intake-template.csv`](templates/submission-intake-template.csv):

```bash
# Validate + queue real offers (status: pending). Use --dry-run to preview.
python -m drivewayadvocate.cli ingest --file my_offers.csv

# A reviewer approves/rejects, then promotes approved rows into the engine's data
python -m drivewayadvocate.cli review                  # list pending
python -m drivewayadvocate.cli review --approve 4 5
python -m drivewayadvocate.cli promote                 # -> pricing_observations
python -m drivewayadvocate.db --build                  # reload so the engine sees them
```

Submissions land in a `submissions` ledger first; the pricing engine only reads
`pricing_observations`, so unmoderated crowdsourced data can never silently move a price.
Dealer *opening offers* are stored but excluded from the fair-price aggregate (they're
marked-up anchors used to measure markup); *prices actually paid* and *outside quotes* feed
the fair-price signal. See
[`templates/submission-intake-template.md`](templates/submission-intake-template.md).

## Web app + API (optional)

A FastAPI layer wraps the same engine + ingestion core so people can price an offer and
"show us theirs" from a browser:

```bash
pip install -e ".[web]"
python -m drivewayadvocate.api        # serves http://127.0.0.1:8000
```

| Route | Purpose |
|-------|---------|
| `GET /` | One-page UI: price-check form + submission form |
| `POST /api/quote` | Advocacy report (JSON) for a vehicle/offer |
| `POST /api/submissions` | Submit one real offer (queued for moderation) |
| `GET /api/submissions?status=pending` | List submissions |
| `GET /docs` | Auto-generated OpenAPI docs |

The API is an **optional extra** — the core CLI/engine stays standard-library only.

## Roadmap

The engine (`pricing.py` + `scoring.py`), the crowdsourced ingestion pipeline
(`ingest.py`), and a FastAPI web layer (`api.py`) are in place. Next steps: persist
submissions/DB in a hosted store (e.g. Postgres) instead of seed CSVs, add auth + an admin
review UI, and replace estimated seed rows with collected real data. Business direction is
tracked in `research/07-business-use-case.md`.
