# Business Use Case — Driveway Advocate

## Positioning

**Driveway Advocate is the "KBB for service contracts."** Just as Kelley Blue Book gave
buyers a vehicle price reference and shifted negotiating power, this database gives buyers
a **VSC price reference** — the one number dealers count on them not having.

## Core jobs-to-be-done

1. **Compare a dealer-offered warranty** against a fair-market range in seconds.
2. **Detect excessive markup** and quantify it ("this offer is 2.4× estimated dealer cost").
3. **Recommend buy / negotiate / decline** with a concrete negotiation target.
4. **Surface better alternatives** (DTC providers, credit-union plans, OEM cost-plus).
5. **Improve buyer trust** through transparent, sourced, confidence-labeled estimates.
6. **Support adjacent decisions** — inspection findings and financing both interact with
   whether a VSC is worth buying.

## The product the data enables

A tool where the buyer enters:

> year · make · model · trim · mileage · ZIP/state · current warranty status ·
> dealer warranty offer price · coverage term · deductible · coverage type

and receives:

> estimated **fair-market price range** · estimated **dealer cost range** · **markup
> warning** · **negotiation target** · **better-alternative providers** ·
> **buy / negotiate / decline** recommendation · **vehicle risk score** · plain-English
> explanation of the major cost drivers.

The engine in `src/drivewayadvocate/` already produces all of these from the CLI; a web/API
layer is the next build.

## Monetization (legitimate, disclosure-first)

| Stream | Description | Notes |
|--------|-------------|-------|
| **Affiliate referrals** | Commission from **legitimate** VSC partners (DTC providers, CU programs) when a buyer chooses a recommended alternative. | Must be disclosed; recommendations must remain merit-based, not pay-to-rank. |
| **Advisory / concierge** | Flat-fee "review my dealer offer" or live negotiation support. | High-trust, high-margin. |
| **Pro / dealer-watchdog tier** | Subscription for unlimited checks + saved vehicles + alerts. | For frequent buyers, fleets, car-buying services. |
| **Data licensing** | Anonymized, aggregated fair-price benchmarks to lenders/CUs/insurers. | Long-term; requires real data volume. |

> **Trust guardrail:** affiliate revenue must never bias the buy/negotiate/decline output.
> The recommendation engine is sourced from fair-price data, not partner payouts, and the
> two are kept architecturally separate.

## Why it defends itself

- **Data moat:** real dealer-cost + markup observations are hard to get and compound over
  time (see [`06-research-workflow.md`](06-research-workflow.md)).
- **Trust moat:** transparent sourcing + a consumer-advocacy stance is the opposite of the
  opaque F&I experience buyers distrust.
- **Workflow fit:** plugs into the broader buyer-support ecosystem (inspection, financing,
  negotiation) rather than standing alone.

## Build roadmap

1. **Now (this repo):** research foundation, schema, seed data, scoring model, CLI engine.
2. **Next:** replace estimates with collected real quotes; add a FastAPI layer over the
   engine; basic web form → advocacy report.
3. **Then:** account system, saved vehicles, affiliate integrations (disclosed), local
   credit-union pricing ingestion.
4. **Later:** anonymized benchmark licensing; expand from VSCs to GAP/tire-wheel/maintenance.

## Compliance notes

- VSCs are **state-regulated**; recommendations must avoid implying insurance advice.
- All outputs are **estimates / decision support**, not quotes or financial advice (see the
  disclaimer in the root `README.md`).
- Affiliate relationships require **clear disclosure** (FTC).
