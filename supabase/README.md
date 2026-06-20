# Supabase — Driveway Advocate

Project: **driveway-advocate** (`vwnnhmxjjxfoctylisfn`)

## ⚠️ Review before applying

`migrations/0001_init.sql` was authored from the business plan, **not** generated
from your live database. Because the project already had objects created before
this repo existed, **do not run it blindly.** First diff it against what's there:

- Dashboard → Table Editor (eyeball existing tables), or
- `select table_name from information_schema.tables where table_schema = 'public';`

If any of these names already exist, reconcile before applying:
`leads`, `deals`, `quote_documents`, `reviews`, `findings`, `packages`,
`credit_clients`, and the enums (`lead_status`, `deal_stage`, etc.).

## Applying it (once reviewed)

**Option A — Dashboard:** paste the SQL into the SQL Editor and run.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref vwnnhmxjjxfoctylisfn
supabase db push
```

**Option C — via MCP:** ask Claude to apply it with `apply_migration` once the
Supabase MCP server is connected and you've confirmed it won't collide.

## Design notes

- **RLS is on, with no public policies** (except read-only `packages`). The
  public intake writes through a server action using the service-role key, which
  bypasses RLS. Scoped policies get added when the client portal is built.
- **Storage:** a private `quote-documents` bucket holds uploaded quotes; the
  `quote_documents` table is the pointer to each object.
- **Engine 01 (credit)** is intentionally stubbed (`credit_clients`) — the full
  compliant billing model lands in a later migration (deck days 61–90).
