import Icon from '../components/Icon.jsx'

const STEPS = [
  { t: 'Credit prepared', d: 'Score moved from 612 to 688 — finance-ready.', state: 'done' },
  { t: 'Pre-approval secured', d: 'Locked 6.8% benchmark rate before shopping.', state: 'done' },
  { t: 'Find the right car', d: '2024 Honda Accord EX-L · target out-the-door set.', state: 'active' },
  { t: 'Deal review', d: 'Upload the dealer quote — we tear it apart.', state: 'todo' },
  { t: 'Sign, protected', d: 'Drive off on a clean, advocate-checked deal.', state: 'todo' },
]

export default function Plan() {
  return (
    <div className="pad">
      <h2 className="screen-title">Your car plan</h2>
      <p className="screen-sub">Credit to keys, on your side the whole way. Here's where you are.</p>

      <div className="card next-card">
        <div className="next-card__k">Next step</div>
        <div className="next-card__t">Lock your target out-the-door price</div>
        <p className="next-card__d">
          We've set a benchmark on the Accord EX-L. When you have a dealer quote, upload it and we'll
          review before you sign.
        </p>
        <button className="btn-primary">
          Upload a quote
          <span style={{ color: '#fff', display: 'flex' }}>
            <Icon name="arrowRight" size={17} />
          </span>
        </button>
      </div>

      <div className="timeline">
        {STEPS.map((s, i) => (
          <div key={s.t} className={`tl ${s.state}`}>
            <div className="tl__rail">
              <span className="tl__node">
                {s.state === 'done' ? <Icon name="checkCircle" size={18} /> : <span className="tl__dot" />}
              </span>
              {i < STEPS.length - 1 && <span className="tl__line" />}
            </div>
            <div className="tl__body">
              <div className="tl__t">
                {s.t}
                {s.state === 'active' && <span className="tl__badge">In progress</span>}
              </div>
              <div className="tl__d">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
