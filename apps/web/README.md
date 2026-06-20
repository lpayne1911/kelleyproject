# @drivewayadvocate/web

The Driveway Advocate web app — a React + Vite + TypeScript front end over the
dependency-free [`@drivewayadvocate/warranty-engine`](../../packages/warranty-engine).

Two flows:

- **Check an offer** — enter a vehicle (and optionally a dealer's price) and get a
  fair-market range, a FAIR / NEGOTIATE / OVERPRICED verdict, a negotiation
  target, the warranty-risk score, and a plain-English recommendation.
  Calls `priceQuote()`.
- **Show us yours** — crowdsource a real offer. Validated with
  `validateSubmission()` and turned into a normalized, review-pending record via
  `normalizeSubmission()`. (No backend yet — the normalized record is shown back
  to the contributor; wire it to `POST /api/submissions` when intake exists.)

## Run

From the repo root (npm workspaces):

```bash
npm install
npm run dev          # starts Vite on http://localhost:5173
```

Or scoped:

```bash
npm run dev -w @drivewayadvocate/web
npm run build -w @drivewayadvocate/web     # tsc --noEmit && vite build
```

## How the engine is wired

The engine is resolved straight from its TypeScript **source** (see the alias in
`vite.config.ts` and the `paths` entry in `tsconfig.json`), so the app always runs
against the latest engine code with no separate build step. The engine's
published entry is `dist/`, which is gitignored — hence the source alias.

UI option lists (coverage tiers, offer types, terms, etc.) and currency/percent
formatting live in `src/lib/engine.ts`, the single adapter over the engine.

## Structure

```
src/
  App.tsx                    tab shell: "Check an offer" / "Show us yours"
  lib/engine.ts              engine re-exports + dropdown options + formatters
  components/
    QuoteForm.tsx            vehicle + offer inputs -> priceQuote()
    QuoteResult.tsx          fair range, verdict, target, recommendation
    SubmissionForm.tsx       "show us yours" intake -> validate + normalize
    VerdictBadge.tsx         FAIR / NEGOTIATE / OVERPRICED
    RiskBadge.tsx            Low / Moderate / Elevated / High
  styles.css
```
