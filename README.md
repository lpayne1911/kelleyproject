# Driveway Advocate

Buyer-side car-deal protection and credit preparation. _Your buyer-side shield
before you sign._

This repo is the web app: a marketing landing page and the **Deal Check** intake
funnel ("upload your quote"), backed by Supabase.

## Stack

- **Next.js 14** (App Router, TypeScript, server actions)
- **Tailwind CSS** (brand tokens from the business-plan deck)
- **Supabase** — Postgres + Storage (project `driveway-advocate`)
- Deploys to **Vercel**

## What's built (Engine 02 — auto-side first, per the 90-day plan)

| Route         | What it is                                                         |
| ------------- | ----------------------------------------------------------------- |
| `/`           | Landing page: positioning, two-engines, pricing ladder, CTAs      |
| `/deal-check` | "Upload your quote" intake form → creates a lead + deal + file     |

The intake posts to a **server action** (`app/actions/submit-deal-check.ts`)
that writes via the Supabase service-role key, so the public form never needs
database write access.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

### Environment variables

See `.env.example`. You need:

- `NEXT_PUBLIC_SUPABASE_URL` — already set to the project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/publishable key (Dashboard → API)
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only** service-role secret (Dashboard → API)

## Database

The schema lives in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
**It is not applied yet** — review it first (see `supabase/README.md`), since you
already have objects in the project and we don't want to clobber anything.

## Roadmap

- **Now (Engine 02):** landing + Deal Check intake ← _this commit_
- **Next:** internal review console (red-flag checklist → red/yellow/green report)
- **Then:** client portal (auth, "see my own review") with scoped RLS policies
- **Later (Engine 01):** compliant credit program — monthly billing, disputes
