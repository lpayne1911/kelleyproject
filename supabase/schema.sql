-- Driveway Advocate — demo schema + seed.
-- Run in the Supabase SQL editor. RLS is left disabled for the single-seeded-client
-- demo; enable RLS + policies before any real/multi-user use (see docs/SUPABASE.md).

create table if not exists clients (
  id text primary key,
  name text,
  vehicle text,
  stage text,
  created_at timestamptz default now()
);

create table if not exists risk_scores (
  id text primary key,
  client_id text references clients(id),
  is_active boolean default false,
  initials text,
  client_name text,
  severity text check (severity in ('crit','high','med')),
  meta text,
  ring int,
  ring_pct int,
  client_said text,
  advocate_read text,
  has_doc boolean default false,
  priors text,
  total int,
  vehicle text,
  file_name text,
  created_at timestamptz default now()
);

create table if not exists risk_metrics (
  id bigint generated always as identity primary key,
  risk_score_id text references risk_scores(id),
  name text,
  score int,
  tone text check (tone in ('red','orange','green')),
  note text
);

create table if not exists templates (
  id bigint generated always as identity primary key,
  category text,
  title text,
  target text,
  ctx text,
  body jsonb
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id text references clients(id),
  sender_role text check (sender_role in ('buyer','advocate')),
  body text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id bigint generated always as identity primary key,
  client_id text references clients(id),
  file_name text,
  meta text,
  state text check (state in ('todo','uploaded','done')),
  created_at timestamptz default now()
);

create table if not exists credit_progress (
  id bigint generated always as identity primary key,
  client_id text references clients(id),
  score int,
  recorded_on date
);

create table if not exists disputes (
  id bigint generated always as identity primary key,
  client_id text references clients(id),
  item text,
  bureau text,
  status text check (status in ('open','sent','responded','resolved'))
);

-- ---------- seed (mirrors src mock data) ----------
insert into clients (id, name, vehicle, stage) values
  ('demo-client-marcus', 'Marcus T.', '2024 Honda Accord EX-L', 'car_ready')
on conflict (id) do nothing;

insert into risk_scores (id, client_id, is_active, initials, client_name, severity, meta, ring, ring_pct, client_said, advocate_read, has_doc, priors, total, vehicle, file_name) values
  ('rs-marcus', 'demo-client-marcus', true, 'MT', 'Marcus T.', 'crit', 'At dealership · 4m ago', 26, 68,
   'They changed everything. My payment went from $420 to $495 and added a bunch of stuff I didn''t ask for.',
   'Client is at the dealership right now. F&I manager added $3,200 in paint/warranty products and pushed APR to 9.4%. Uploaded revised buyer''s order 4 minutes ago.',
   true, '3 prior msgs', 87, '2024 Honda Accord EX-L · AutoNation Honda', 'buyer''s-order-revised.pdf'),
  ('rs-priya', 'demo-client-priya', false, 'PN', 'Priya N.', 'high', 'Payment changed · 11m ago', 19, 52,
   'The finance guy said the rate changed. My payment is now $498 instead of what we agreed on.',
   null, true, '1 prior msg', 66, null, null),
  ('rs-devon', 'demo-client-devon', false, 'DW', 'Devon W.', 'med', 'Quote review · 18m ago', 12, 80,
   null, null, false, null, null, null, null)
on conflict (id) do nothing;

insert into risk_metrics (risk_score_id, name, score, tone, note) values
  ('rs-marcus', 'APR', 91, 'red', 'Quoted 9.4% — market is 6.8% for his profile.'),
  ('rs-marcus', 'Add-ons', 80, 'red', '$3,200 in undisclosed add-ons added to F&I sheet.'),
  ('rs-marcus', 'Term', 72, 'orange', '84-month vs 60-month recommended.'),
  ('rs-marcus', 'Payment', 45, 'orange', '$95/mo higher than last quoted figure.'),
  ('rs-marcus', 'Trade-in', 20, 'green', 'Offer matches KBB fair value.');

insert into messages (client_id, sender_role, body, created_at) values
  ('demo-client-marcus', 'advocate', 'Hi Marcus — got your documents. I''m reviewing everything right now. Don''t sign anything yet.', now() - interval '7 min'),
  ('demo-client-marcus', 'buyer', 'They''re pushing me to sign. Payment jumped from $420 to $495.', now() - interval '5 min'),
  ('demo-client-marcus', 'advocate', 'That jump is the added products and a marked-up rate. None of it is required. Give me 4 minutes.', now() - interval '4 min'),
  ('demo-client-marcus', 'advocate', 'Here''s your read: APR should be 6.8%, not 9.4%. Ask them to remove the $3,200 in add-ons.', now() - interval '1 min');

insert into documents (client_id, file_name, meta, state) values
  ('demo-client-marcus', 'credit-report.pdf', 'Reviewed · 3 items disputed', 'done'),
  ('demo-client-marcus', 'pre-approval-letter.pdf', 'Verified · 6.8% benchmark', 'done'),
  ('demo-client-marcus', 'dealer-quote.pdf', 'Waiting on your upload', 'todo');

insert into credit_progress (client_id, score, recorded_on) values
  ('demo-client-marcus', 612, current_date - 150),
  ('demo-client-marcus', 624, current_date - 120),
  ('demo-client-marcus', 631, current_date - 90),
  ('demo-client-marcus', 650, current_date - 60),
  ('demo-client-marcus', 663, current_date - 30),
  ('demo-client-marcus', 688, current_date);

insert into disputes (client_id, item, bureau, status) values
  ('demo-client-marcus', 'Collection · Midland Funding', 'All bureaus', 'resolved'),
  ('demo-client-marcus', 'Late payment · Capital One', 'Experian', 'responded'),
  ('demo-client-marcus', 'Hard inquiry · unverified', 'TransUnion', 'sent'),
  ('demo-client-marcus', 'Mixed-file address error', 'Equifax', 'open');

insert into templates (category, title, target, ctx, body) values
  ('Reassurance', 'I''m on it — don''t sign yet', '95% target', 'Client is at dealership, uploaded docs',
   '["Hi ","{{clientName}}"," — got your documents. I''m reviewing everything right now and will have y…"]'),
  ('Reassurance', 'Fee is normal — here''s why', '88% target', 'Client asking about a specific fee',
   '["Hi ","{{clientName}}"," — good question on the ","{{feeName}}","…"]'),
  ('Reassurance', 'Deal looks clean — proceed', '91% target', 'Risk score low, no major flags',
   '["Hi ","{{clientName}}"," — I reviewed your full quote on the ","{{vehicle}}","…"]'),
  ('Counter-offer', 'Push back on APR markup', '82% target', 'Rate marked up above buyer-rate',
   '["Tell them: \"","{{lender}}"," approved me at ","{{buyRate}}",". Match it or I finance outside.\""]'),
  ('Counter-offer', 'Strip the add-ons', '79% target', 'F&I products padded onto the deal',
   '["Ask to remove ","{{addonList}}"," — total ","{{addonTotal}}",". None are required to buy."]'),
  ('Instructions', 'What to say at signing', '90% target', 'Client is about to sit with F&I',
   '["Step 1: confirm out-the-door ","{{otdPrice}}",". Step 2: decline all add-ons. Step 3: text me the figures."]'),
  ('Escalate', 'Walk-away script', '74% target', 'Dealer refusing to fix the deal',
   '["\"","{{clientName}}",", this deal is ","{{overpay}}"," over fair. Recommend walking — I have two backups.\""]');
