import Icon from '../components/Icon.jsx'
import AppHeader from '../components/AppHeader.jsx'
import { METRICS } from './data.js'
import { BRAND } from '../theme.js'

export default function Metrics() {
  const { today, sla, mix } = METRICS
  return (
    <>
      <AppHeader title="Advocate Console" brandColor={BRAND.navy} live />
      <div className="body">
        <div className="pad">
          <h2 className="section-h">Today's performance</h2>

          <div className="mgrid">
            {today.map((m) => (
              <div className="mcard" key={m.l}>
                <div className="mcard__n">{m.n}</div>
                <div className="mcard__l">{m.l}</div>
                <div className={`mcard__d ${m.up ? 'up' : ''}`}>{m.d}</div>
              </div>
            ))}
          </div>

          <div className="card panel">
            <div className="panel__h">
              <Icon name="clock" size={16} style={{ color: 'var(--ink)' }} />
              30-minute SLA performance
            </div>
            {sla.map((d) => (
              <div className="dist" key={d.lab}>
                <div className="dist__top">
                  <span className="lab">{d.lab}</span>
                  <span className="val">{d.val}</span>
                </div>
                <div className="dist__track">
                  <div className="dist__fill" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card panel">
            <div className="panel__h">
              <Icon name="zap" size={16} style={{ color: 'var(--ink)' }} />
              Response type mix
            </div>
            {mix.map((r) => (
              <div className="mix__row" key={r.lab}>
                <span className="mix__lab">{r.lab}</span>
                <span className="mix__track">
                  <span className="mix__fill" style={{ width: `${r.pct}%` }} />
                </span>
                <span className="mix__val">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
