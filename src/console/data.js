import { TONE } from '../theme.js'

export const ALERTS = [
  {
    id: 'marcus',
    initials: 'MT',
    name: 'Marcus T.',
    sev: 'crit',
    sevLabel: 'Critical',
    meta: 'At dealership · 4m ago',
    ring: 26,
    ringPct: 68,
    quote:
      "They changed everything. My payment went from $420 to $495 and added a bunch of stuff I didn't ask for.",
    doc: 'Doc uploaded',
    priors: '3 prior msgs',
    risk: 87,
    color: TONE.red,
  },
  {
    id: 'priya',
    initials: 'PN',
    name: 'Priya N.',
    sev: 'high',
    sevLabel: 'High',
    meta: 'Payment changed · 11m ago',
    ring: 19,
    ringPct: 52,
    quote:
      'The finance guy said the rate changed. My payment is now $498 instead of what we agreed on.',
    doc: 'Doc uploaded',
    priors: '1 prior msg',
    risk: 66,
    color: TONE.orange,
  },
  {
    id: 'devon',
    initials: 'DW',
    name: 'Devon W.',
    sev: 'med',
    sevLabel: 'Medium',
    meta: 'Quote review · 18m ago',
    ring: 12,
    ringPct: 80,
    color: TONE.yellow,
  },
]

export const SCORECARD = {
  total: 87,
  client: {
    initials: 'MT',
    name: 'Marcus T.',
    vehicle: '2024 Honda Accord EX-L · AutoNation Honda',
    said:
      "They changed everything. My payment went from $420 to $495 and added a bunch of stuff I didn't ask for.",
    read:
      "Client is at the dealership right now. F&I manager added $3,200 in paint/warranty products and pushed APR to 9.4%. Uploaded revised buyer's order 4 minutes ago.",
    file: "buyer's-order-revised.pdf",
  },
  metrics: [
    { name: 'APR', score: 91, tone: 'red', note: 'Quoted 9.4% — market is 6.8% for his profile.' },
    { name: 'Add-ons', score: 80, tone: 'red', note: '$3,200 in undisclosed add-ons added to F&I sheet.' },
    { name: 'Term', score: 72, tone: 'orange', note: '84-month vs 60-month recommended.' },
    { name: 'Payment', score: 45, tone: 'orange', note: '$95/mo higher than last quoted figure.' },
    { name: 'Trade-in', score: 20, tone: 'green', note: 'Offer matches KBB fair value.' },
  ],
}

export const TEMPLATES = {
  Reassurance: [
    {
      title: "I'm on it — don't sign yet",
      target: '95% target',
      ctx: 'Client is at dealership, uploaded docs',
      body: ["Hi ", '{{clientName}}', " — got your documents. I'm reviewing everything right now and will have y…"],
    },
    {
      title: "Fee is normal — here's why",
      target: '88% target',
      ctx: 'Client asking about a specific fee',
      body: ['Hi ', '{{clientName}}', ' — good question on the ', '{{feeName}}', '…'],
    },
    {
      title: 'Deal looks clean — proceed',
      target: '91% target',
      ctx: 'Risk score low, no major flags',
      body: ['Hi ', '{{clientName}}', ' — I reviewed your full quote on the ', '{{vehicle}}', '…'],
    },
  ],
  'Counter-offer': [
    {
      title: 'Push back on APR markup',
      target: '82% target',
      ctx: 'Rate marked up above buyer-rate',
      body: ['Tell them: "', '{{lender}}', ' approved me at ', '{{buyRate}}', '. Match it or I finance outside."'],
    },
    {
      title: 'Strip the add-ons',
      target: '79% target',
      ctx: 'F&I products padded onto the deal',
      body: ['Ask to remove ', '{{addonList}}', ' — total ', '{{addonTotal}}', '. None are required to buy.'],
    },
  ],
  Instructions: [
    {
      title: 'What to say at signing',
      target: '90% target',
      ctx: 'Client is about to sit with F&I',
      body: ['Step 1: confirm out-the-door ', '{{otdPrice}}', '. Step 2: decline all add-ons. Step 3: text me the figures.'],
    },
  ],
  Escalate: [
    {
      title: 'Walk-away script',
      target: '74% target',
      ctx: 'Dealer refusing to fix the deal',
      body: ['"', '{{clientName}}', ', this deal is ', '{{overpay}}', ' over fair. Recommend walking — I have two backups."'],
    },
  ],
}

export const METRICS = {
  today: [
    { n: '7', l: 'Alerts today', d: '+2 vs yesterday', up: true },
    { n: '11m', l: 'Avg response time', d: '1m faster than SLA', up: true },
    { n: '6/7', l: 'Resolved < 30min', d: '86%', up: false },
    { n: '4.9', l: 'Client satisfaction', d: '↑ from 4.7', up: true },
  ],
  sla: [
    { lab: '< 10 min', val: '3 (43%)', pct: 43, color: TONE.green },
    { lab: '10–20 min', val: '2 (29%)', pct: 29, color: TONE.green },
    { lab: '20–30 min', val: '1 (14%)', pct: 14, color: TONE.yellow },
    { lab: '> 30 min (missed)', val: '1 (14%)', pct: 14, color: TONE.red },
  ],
  mix: [
    { lab: 'Reassurance', pct: 100, val: 12 },
    { lab: 'Counter-offer', pct: 67, val: 8 },
    { lab: 'Instructions', pct: 33, val: 4 },
    { lab: 'Escalated', pct: 8, val: 1 },
  ],
}
