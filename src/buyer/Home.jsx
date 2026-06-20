import Icon from '../components/Icon.jsx'

const STAGES = [
  'Quote in Hand',
  'Waiting on Review',
  'Risk Scan Result',
  'Credit Active',
  'Car Ready',
  'Purchase Complete',
]

export default function Home({ onStartPlan }) {
  return (
    <div className="pad">
      <div className="proto-panel">
        <div className="proto-panel__k">Prototype State</div>
        <div className="chips">
          {STAGES.map((s) => (
            <span key={s} className={`chip ${s === 'Car Ready' ? 'is-on' : ''}`}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="card ready-card">
        <div className="ready-badge">
          <Icon name="star" size={13} fill="currentColor" />
          Car ready
        </div>
        <h2>You're ready for deal strategy</h2>
        <p>Now we shift from credit work to purchase protection. Time to find the right car.</p>
        <button className="btn-primary" onClick={onStartPlan}>
          Start car plan
          <span style={{ color: '#fff', display: 'flex' }}>
            <Icon name="arrowRight" size={17} />
          </span>
        </button>
      </div>

      <button className="btn-outline">Review summary</button>
    </div>
  )
}
