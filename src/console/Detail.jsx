import Icon from '../components/Icon.jsx'
import Ring from '../components/Ring.jsx'
import { SCORECARD } from './data.js'
import { TONE } from '../theme.js'

const toneColor = TONE

export default function Detail({ onBack }) {
  const { total, client, metrics } = SCORECARD
  return (
    <>
      <div className="detail-head">
        <button className="back-btn" onClick={onBack}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <div className="detail-head__t">Marcus T. — At dealership</div>
        <Ring value={26} pct={68} color={TONE.red} size={34} />
      </div>

      <div className="body">
        <div className="pad">
          <div className="card client-card">
            <div className="client-card__top">
              <div className="avatar">{client.initials}</div>
              <div className="t">
                <b>
                  {client.name} <span className="pill pill--crit">Critical</span>
                </b>
                <span>{client.vehicle}</span>
              </div>
            </div>

            <div className="field-k">Client said</div>
            <div className="said">"{client.said}"</div>

            <div className="field-k">Your read</div>
            <div className="read">{client.read}</div>

            <div className="file-chip">
              <span className="file-chip__l">
                <Icon name="doc" size={16} />
                {client.file}
              </span>
              <span className="file-chip__r">Tap to view</span>
            </div>
          </div>

          <div className="card scorecard">
            <div className="scorecard__h">
              <b>Risk scorecard</b>
              <span className="big">{total}</span>
            </div>

            {metrics.map((m) => (
              <div className="metric" key={m.name}>
                <div className="metric__top">
                  <span style={{ color: toneColor[m.tone], display: 'flex' }}>
                    <Icon name={m.tone === 'green' ? 'checkCircle' : 'triangle'} size={15} />
                  </span>
                  <span className="metric__name">{m.name}</span>
                  <span className="metric__score" style={{ color: toneColor[m.tone] }}>
                    {m.score}
                  </span>
                </div>
                <div className="mtrack">
                  <div className="mfill" style={{ width: `${m.score}%`, background: toneColor[m.tone] }} />
                </div>
                <p className="metric__note">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
