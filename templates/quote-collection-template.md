# Quote Collection Template

Use this when collecting a VSC quote from a **dealer F&I office, OEM, direct-to-consumer
provider, credit union, or customer**. One filled form = one row in
`database/seed/pricing_observations.csv`. The CSV version
([`quote-collection-template.csv`](quote-collection-template.csv)) has the same fields for
bulk entry.

> Goal: capture the **same spec across 2–3 channels** (dealer + DTC + credit union) so the
> markup spread on an identical vehicle is visible.

## Provenance (always required)
- **Date collected:** `YYYY-MM-DD`
- **Collector:** who gathered it
- **Source type:** `verified · public_quote · dealer_quote · consumer_reported · estimated · assumption`
- **Confidence:** `high · medium · low`
- **Source URL / note:** link or where it came from

## Provider
- **Provider name:**
- **Channel:** `oem · dtc · dealer · credit_union`
- **Business role:** `administrator · broker · insurer · oem`
- **Claims administrator (obligor):**
- **AM Best backer (insurer):** ____  **BBB rating:** ____

## Vehicle
- **Year / Make / Model / Trim:**
- **Vehicle class:** (map per `research/05-coverage-tiers.md` / schema)
- **Mileage at purchase:** ____  **State / ZIP:** ____

## Coverage spec
- **Term (months):** ____  **Term mileage cap:** ____
- **Deductible:** `$0 / $50 / $100 / $200 / $250 / $500`
- **Coverage tier (normalized `tier_key`):**
- **Plan name as quoted:** ____  **Exclusionary or stated-component?** ____
- **Waiting period:** ____  **Transferable?** ____  **Cancellation terms:** ____

## Pricing
- **Retail price (total):** $____
- **Monthly payment:** $____  **Down payment:** $____
- **Dealer cost (if disclosed):** $____  **Markup (if known):** $____
- **Per-year retail** = `retail ÷ (term_months ÷ 12)` = $____  ← universal comparator

## Collection checklist
- [ ] Asked for the **cash price** of the contract (not just the monthly payment)
- [ ] Recorded the **exclusions list** (exclusionary) or **inclusions list** (stated)
- [ ] Captured **dealer cost** if F&I would disclose it
- [ ] Logged **source type + confidence** — never a bare price
- [ ] Normalized **tier**, **mileage band**, **age band** per the schema
