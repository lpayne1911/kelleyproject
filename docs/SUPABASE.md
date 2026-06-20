# Connecting Supabase (optional)

The app is **mock-first**: with no env vars it runs entirely on local mock data, so the
Vercel preview stays green without any backend. Add Supabase to make the buyer app and
advocate console share **live** data (a buyer message appears in the console and vice-versa).

## 1. Create a project
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste and run [`supabase/schema.sql`](../supabase/schema.sql).
   It creates the tables and seeds the demo client (Marcus T.), templates, messages,
   documents, credit history, and disputes.
3. Enable **Realtime** for the `messages` table (Database → Replication) so replies
   stream live to the buyer thread.

## 2. Set env vars
From **Project Settings → API**, copy the Project URL and the `anon` public key.

- **Local:** copy `.env.example` to `.env.local` and fill both values.
- **Vercel:** add them in the project's **Environment Variables** (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`), then redeploy.

The `anon` key is safe to expose in client code — it is gated by row-level security.
Never put the **service_role** key in the app.

## 3. How it wires up
- `src/lib/supabase.js` builds the client and exports `hasSupabase`.
- Hooks (`src/hooks/useMessages.js`, `useConsole.js`, `useBuyer.js`) read from Supabase
  when `hasSupabase` is true and **fall back to mock on any error**, so the UI never breaks.
- `src/lib/session.js` returns the demo client id; swap it for real auth later.

## 4. Before production
- Enable **RLS** on every table and add policies (buyer sees own client; advocate sees
  assigned clients). The demo leaves RLS off for a single shared client.
- Replace demo-mode `session.js` with Supabase Auth and role-based access.
- Move document upload to Supabase Storage (`documents` bucket, path `clients/{id}/...`).
