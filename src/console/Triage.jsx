import Icon from '../components/Icon.jsx'
import Ring from '../components/Ring.jsx'
import AppHeader from '../components/AppHeader.jsx'
import { ALERTS } from './data.js'
import { BRAND } from '../theme.js'

function Alert({ a, onOpen }) {
  return (
    <div className={`alert sev-${a.sev}`} onClick={onOpen}>
      <div className="alert__top">
        <div className="avatar">{a.initials}</div>
        <div className="alert__id">
          <div className="alert__name">
            <b>{a.name}</b>
            <span className={`pill pill--${a.sev}`}>{a.sevLabel}</span>
            <span className="pill pill--new">New</span>
          </div>
          <div className="alert__meta">{a.meta}</div>
        </div>
        <Ring value={a.ring} pct={a.ringPct} color={a.color} />
      </div>

      {a.quote && <div className="alert__quote">"{a.quote}"</div>}

      {a.doc && (
        <div className="alert__foot">
          <span className="doc-chip">
            <Icon name="doc" size={14} />
            {a.doc}
          </span>
          <span className="muted">{a.priors}</span>
        </div>
      )}

      {a.risk != null && (
        <div className="riskbar">
          <span className="riskbar__k">Risk score</span>
          <div className="riskbar__track">
            <div className="riskbar__fill" style={{ width: `${a.risk}%`, background: a.color }} />
          </div>
          <span className="riskbar__lab" style={{ color: a.color }}>
            {a.risk}/100
          </span>
        </div>
      )}
    </div>
  )
}

export default function Triage({ onOpen }) {
  return (
    <>
      <AppHeader title="Advocate Console" brandColor={BRAND.navy} live />
      <div className="body">
        <div className="pad">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__n is-red">3</div>
              <div className="stat__l">New alerts</div>
            </div>
            <div className="stat">
              <div className="stat__n">1</div>
              <div className="stat__l">Critical</div>
            </div>
            <div className="stat">
              <div className="stat__n">19m</div>
              <div className="stat__l">Avg SLA left</div>
            </div>
          </div>

          <div className="sla-banner">
            <Icon name="clock" size={16} />
            <span>30-minute response SLA — clients expect help before they sign.</span>
          </div>

          <div className="list-head">
            <b>New — ranked by urgency</b>
            <span>Tap to review</span>
          </div>

          {ALERTS.map((a) => (
            <Alert key={a.id} a={a} onOpen={a.id === 'marcus' ? onOpen : undefined} />
          ))}
        </div>
      </div>
    </>
  )
}
