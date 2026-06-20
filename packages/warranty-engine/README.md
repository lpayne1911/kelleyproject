# @drivewayadvocate/warranty-engine

The Driveway Advocate vehicle-service-contract **scoring + fair-price engine**, as a
**dependency-free TypeScript module**. It's a faithful port of the Python engine
(`src/drivewayadvocate/`), proven equivalent by cross-language parity tests.

Runs anywhere the app does — **Next.js / React web or React Native** — with **no Python at
runtime** and **zero runtime dependencies**.

## Install (in this monorepo)

The app imports it directly. With workspaces:

```jsonc
// app package.json
"dependencies": { "@drivewayadvocate/warranty-engine": "workspace:*" }
```

…or reference the folder (`file:../warranty-engine`), or copy `src/` in. Then build once:

```bash
cd packages/warranty-engine && npm install && npm run build
```

## Usage

```ts
import { priceQuote, scoreVehicle, validateSubmission, normalizeSubmission } from "@drivewayadvocate/warranty-engine";

// 1) Price a dealer's offer
const report = priceQuote({
  year: 2021, make: "BMW", model: "3 Series", mileage: 45000,
  termMonths: 36, tier: "exclusionary", dealerOffer: 4200,
});
report.fairLow;            // 3935
report.fairHigh;           // 5323
report.verdict;            // "FAIR" | "NEGOTIATE" | "OVERPRICED" | null
report.negotiationTarget;  // 2946
report.markupWarning;      // string | null
report.recommendation;     // plain-English advocacy line
report.score.fullScore;    // 65   (risk 1-100)
report.score.riskLabel;    // "High"

// 2) Just the risk score
const s = scoreVehicle("Toyota", "Camry", 45000, 5, { year: 2021 });

// 3) Validate + normalize a crowdsourced submission ("show us yours")
const check = validateSubmission(input);   // { valid, errors[] }
if (check.valid) {
  const row = normalizeSubmission(input);  // bands, perYear, sourceType, dedupeKey, ...
  // persist `row` however the app wants (its own DB, or POST to the Python pipeline)
}
```

`priceQuote` throws on invalid input (`termMonths < 1`, negative mileage/deductible/offer).

### React example

```tsx
function OfferCheck({ vehicle }: { vehicle: QuoteRequest }) {
  const r = useMemo(() => priceQuote(vehicle), [vehicle]);
  return (
    <div>
      <p>Risk {r.score.fullScore}/100 ({r.score.riskLabel})</p>
      <p>Fair market ${r.fairLow.toLocaleString()}–${r.fairHigh.toLocaleString()}</p>
      {r.verdict && <p>Verdict: {r.verdict}</p>}
      <p>{r.recommendation}</p>
    </div>
  );
}
```

## Data & source of truth

The bundled vehicle/risk/observation data is **generated from the Python seed CSVs** —
do not edit `src/data.generated.ts` by hand. Regenerate after changing seed data or engine
constants:

```bash
python scripts/export_ts_data.py     # run from the repo root
```

That step also rewrites `test/fixtures.generated.json` (canonical Python outputs), and
`test/parity.test.ts` asserts this TS engine reproduces them. So **Python stays the source
of truth**; this package is the runtime the app embeds.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run build` | `tsc` → `dist/` (ESM + `.d.ts`) |
| `npm run typecheck` | type-check only |
| `npm test` | vitest (unit + cross-language parity) |
