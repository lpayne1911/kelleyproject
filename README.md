# Driveway Advocate — App Prototype

Interactive mobile-app prototype for **Driveway Advocate**, a buyer-side car-deal
protection and credit-preparation service. Built as a Vite + React app showing two
connected experiences.

## 📱 Buyer App (green)
Walks a client from credit work to a protected purchase.
- **Home** — journey state + "Car ready / deal strategy"
- **Plan** — credit-to-keys timeline with next-step card
- **Upload** — document dropzone + uploaded-doc list
- **Messages** — live chat thread with the advocate
- **Account** — Credit-to-Keys plan badge + independence pledge

## 🛡️ Advocate Console (navy)
Where the team triages live deals against a 30-minute SLA.
- **Triage** — SLA stats + urgency-ranked alerts (tap Marcus's card to open detail)
- **Detail** — client risk scorecard (APR, add-ons, term, payment, trade-in)
- **Templates** — Reassurance / Counter-offer / Instructions / Escalate
- **Metrics** — today's performance, SLA distribution, response mix

## Run locally

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
```

## Project structure

```
src/
  components/   Phone, StatusBar, AppHeader, TabBar, Ring, Icon
  buyer/        BuyerApp + Home, Plan, Upload, Messages, Account
  console/      ConsoleApp + Triage, Detail, Templates, Metrics, data.js
  App.jsx, main.jsx, index.css
prototype/      original self-contained static HTML version (no build step)
```
