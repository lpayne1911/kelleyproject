import Icon from '../components/Icon.jsx'

const HISTORY = [612, 624, 631, 650, 663, 688]
const GOAL = 720

const DISPUTES = [
  { item: 'Collection · Midland Funding', bureau: 'All bureaus', status: 'resolved' },
  { item: 'Late payment · Capital One', bureau: 'Experian', status: 'responded' },
  { item: 'Hard inquiry · unverified', bureau: 'TransUnion', status: 'sent' },
  { item: 'Mixed-file address error', bureau: 'Equifax', status: 'open' },
]

const STATUS = {
  resolved: { label: 'Resolved', cls: 'ok' },
  responded: { label: 'Responded', cls: 'high' },
  sent: { label: 'Sent', cls: 'med' },
  open: { label: 'Open', cls: 'crit' },
}

const FACTORS = [
  { k: 'Payment history', v: 'On track', pct: 88, tone: 'var(--green)' },
  { k: 'Credit utilization', v: '28% — aim < 10%', pct: 52, tone: 'var(--orange)' },
  { k: 'Credit age', v: 'Improving', pct: 64, tone: 'var(--green)' },
]

// Inline-SVG sparkline of the score history (no chart library).
function Sparkline({ data, w = 248, h = 66, pad = 6 }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)
  const pts = data.map((d, i) => {
    const x = pad + i * step
    const y = pad + (h - pad * 2) * (1 - (d - min) / span)
    return [x, y]
  })
  const line = pts.map((p) => p.join(',')).join(' ')
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`
  const last = pts[pts.length - 1]
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={area} fill="rgba(47,140,90,.12)" />
      <polyline points={line} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--green)" />
    </svg>
  )
}

export default function CreditDashboard() {
  const score = HISTORY[HISTORY.length - 1]
  const gain = score - HISTORY[0]
  const toGoal = GOAL - score

  return (
    <div className="pad">
      <h2 className="screen-title">Credit progress</h2>
      <p className="screen-sub">The score that sets your interest rate — and where it's heading.</p>

      <div className="card score-hero">
        <div className="score-hero__top">
          <div>
            <div className="score-hero__num">{score}</div>
            <div className="score-hero__delta">
              <Icon name="checkCircle" size={14} /> +{gain} since you started
            </div>
          </div>
          <div className="score-hero__goal">
            <span className="score-hero__goal-k">Next goal</span>
            <span className="score-hero__goal-v">{GOAL}</span>
            <span className="score-hero__goal-d">{toGoal} to go</span>
          </div>
        </div>
        <Sparkline data={HISTORY} />
      </div>

      <div className="dash-h">What's moving your score</div>
      <div className="card factors">
        {FACTORS.map((f) => (
          <div className="factor" key={f.k}>
            <div className="factor__top">
              <span className="factor__k">{f.k}</span>
              <span className="factor__v">{f.v}</span>
            </div>
            <div className="mtrack">
              <div className="mfill" style={{ width: `${f.pct}%`, background: f.tone }} />
            </div>
          </div>
        ))}
      </div>

      <div className="dash-h">Active disputes</div>
      <div className="doc-list">
        {DISPUTES.map((d) => {
          const s = STATUS[d.status]
          return (
            <div className="docrow" key={d.item}>
              <div className="docrow__body">
                <div className="docrow__name">{d.item}</div>
                <div className="docrow__meta">{d.bureau}</div>
              </div>
              <span className={`pill pill--${s.cls}`}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
