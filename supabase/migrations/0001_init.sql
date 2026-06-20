-- ============================================================================
-- Driveway Advocate — initial schema (Engine 02: Deal Protection first)
-- ----------------------------------------------------------------------------
-- REVIEW BEFORE APPLYING. This is written to match the business plan deck and
-- the auto-side-first 90-day launch plan. The credit engine (Engine 01) is
-- stubbed minimally and fleshed out in a later migration once compliance work
-- is done.
--
-- Security model: RLS is ON for every table with NO public policies. The
-- public "upload your quote" form writes through a server action using the
-- service-role key (which bypasses RLS). Anon/auth users get access later via
-- explicit policies when the client portal is built.
-- ============================================================================

-- ---------- Enums -----------------------------------------------------------
create type lead_status as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
create type deal_stage as enum ('shopping', 'quoted', 'in_review', 'delivered', 'signed', 'walked');
create type package_code as enum ('deal_check', 'deal_rescue', 'credit_program', 'credit_to_keys', 'fleet_family');
create type review_verdict as enum ('red', 'yellow', 'green');
create type finding_category as enum (
  'junk_fee', 'rate_markup', 'trade_in', 'add_on', 'pricing', 'financing', 'other'
);

-- ---------- updated_at helper ----------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- leads -----------------------------------------------------------
-- A person who comes through the funnel (the "upload your quote" front door).
create table leads (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  phone         text,
  source        text,                       -- e.g. 'tiktok', 'referral', 'organic'
  status        lead_status not null default 'new',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index leads_email_idx on leads (email);
create index leads_status_idx on leads (status);
create trigger leads_set_updated_at before update on leads
  for each row execute function set_updated_at();

-- ---------- deals -----------------------------------------------------------
-- A specific car purchase we are protecting for a lead.
create table deals (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null references leads (id) on delete cascade,
  requested_package  package_code,
  stage              deal_stage not null default 'quoted',
  vehicle_year       int,
  vehicle_make       text,
  vehicle_model      text,
  dealer_name        text,
  out_the_door_price numeric(10, 2),
  monthly_payment    numeric(10, 2),
  apr                numeric(5, 2),
  term_months        int,
  trade_in_value     numeric(10, 2),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index deals_lead_idx on deals (lead_id);
create index deals_stage_idx on deals (stage);
create trigger deals_set_updated_at before update on deals
  for each row execute function set_updated_at();

-- ---------- quote_documents -------------------------------------------------
-- Files the buyer uploads (dealer quote, buyer's order, credit snapshot).
-- Binary lives in Storage bucket 'quote-documents'; this row is the pointer.
create table quote_documents (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references deals (id) on delete cascade,
  storage_path  text not null,
  file_name     text not null,
  content_type  text,
  byte_size     bigint,
  created_at    timestamptz not null default now()
);
create index quote_documents_deal_idx on quote_documents (deal_id);

-- ---------- reviews ---------------------------------------------------------
-- The deliverable: one red/yellow/green verdict per deal review.
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references deals (id) on delete cascade,
  reviewer      text,
  verdict       review_verdict,
  summary       text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index reviews_deal_idx on reviews (deal_id);
create trigger reviews_set_updated_at before update on reviews
  for each row execute function set_updated_at();

-- ---------- findings --------------------------------------------------------
-- Individual red flags inside a review (the "cut list").
create table findings (
  id             uuid primary key default gen_random_uuid(),
  review_id      uuid not null references reviews (id) on delete cascade,
  category       finding_category not null,
  severity       review_verdict not null,
  label          text not null,
  detail         text,
  estimated_cost numeric(10, 2),            -- dollars this flag is costing the buyer
  created_at     timestamptz not null default now()
);
create index findings_review_idx on findings (review_id);

-- ---------- packages (seeded reference) ------------------------------------
create table packages (
  code        package_code primary key,
  name        text not null,
  engine      text not null,                -- 'auto' | 'credit' | 'both'
  role        text not null,                -- 'front_door' | 'core' | 'recurring' | 'flagship' | 'custom'
  blurb       text not null,
  price_label text not null,
  sort_order  int not null default 0
);

insert into packages (code, name, engine, role, blurb, price_label, sort_order) values
  ('deal_check',     'Deal Check',     'auto',   'front_door', 'Fast audit of an existing dealer quote — red / yellow / green.',           '$99–$199',          1),
  ('deal_rescue',    'Deal Rescue',    'auto',   'core',       'Full line-by-line teardown, cut list, and negotiation scripting.',         '$349–$999',         2),
  ('credit_program', 'Credit Program', 'credit', 'recurring',  'Review, dispute, and rebuild — billed monthly for work performed.',        '$149 setup + $99/mo', 3),
  ('credit_to_keys', 'Credit-to-Keys', 'both',   'flagship',   'Credit prep, sourcing, review, and signing support — the whole journey.',  '$1,799–$3,500',     4),
  ('fleet_family',   'Fleet / Family', 'auto',   'custom',     'Multi-car household or employee benefit program.',                         'Custom',            5);

-- ---------- credit_clients (Engine 01 stub) --------------------------------
-- Minimal placeholder so the FK exists; expanded in a later migration once the
-- compliant monthly-billing program is finalized (deck days 61–90).
create table credit_clients (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads (id) on delete cascade,
  start_date    date,
  target_score  int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index credit_clients_lead_idx on credit_clients (lead_id);
create trigger credit_clients_set_updated_at before update on credit_clients
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------------------------------------------
-- ON everywhere, no public policies. Service role (server actions) bypasses
-- RLS; everyone else is denied until the portal adds scoped policies.
alter table leads           enable row level security;
alter table deals           enable row level security;
alter table quote_documents enable row level security;
alter table reviews         enable row level security;
alter table findings        enable row level security;
alter table credit_clients  enable row level security;
alter table packages        enable row level security;

-- packages is non-sensitive reference data; allow read to anon/auth for the site.
create policy "packages are readable by anyone"
  on packages for select
  using (true);

-- ---------- Storage bucket for uploaded quotes ------------------------------
insert into storage.buckets (id, name, public)
values ('quote-documents', 'quote-documents', false)
on conflict (id) do nothing;
