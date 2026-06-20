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
| `database/seed/` | Seed CSVs: providers, vehicles, risk scores, coverage tiers, bands, and 30+ labeled pricing observations. |
| `scoring/risk-scoring-model.md` | The 1–100 vehicle warranty-risk model: variables, weights, formula, worked examples. |
| `templates/` | Quote-collection template (Markdown + CSV) for field data collection. |
| `src/drivewayadvocate/` | The Python tool: build the DB, score a vehicle, price a VSC, run from the CLI. |
| `tests/` | Pytest suite for the scoring and pricing engines. |

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

## Roadmap

This is the **foundation**. The reusable engine (`pricing.py` + `scoring.py`) is designed
so a future web/API layer (FastAPI) and a consumer-facing UI can wrap it without changing
the core logic. Next steps are tracked in `research/07-business-use-case.md`.
