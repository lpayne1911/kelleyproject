import Icon from '../components/Icon.jsx'

const ROWS = [
  { icon: 'book', label: 'My plan', value: 'Credit-to-Keys' },
  { icon: 'doc', label: 'Documents', value: '3 files' },
  { icon: 'bell', label: 'Notifications', value: 'On' },
  { icon: 'lock', label: 'Privacy & data', value: '' },
]

export default function Account() {
  return (
    <div className="pad">
      <div className="profile">
        <span className="profile__avatar">MT</span>
        <div>
          <div className="profile__name">Marcus T.</div>
          <div className="profile__sub">marcus.t@email.com</div>
        </div>
      </div>

      <div className="card plan-badge">
        <div className="plan-badge__l">
          <div className="plan-badge__k">Active plan</div>
          <div className="plan-badge__t">Credit-to-Keys</div>
          <div className="plan-badge__d">Credit prep · sourcing · deal protection</div>
        </div>
        <span className="plan-badge__icon">
          <Icon name="shield" size={26} />
        </span>
      </div>

      <div className="pledge">
        <span className="pledge__icon">
          <Icon name="checkCircle" size={18} />
        </span>
        <div>
          <div className="pledge__t">Our independence pledge</div>
          <div className="pledge__d">
            We're paid only by you. We never take commissions or kickbacks from any dealer, lender, or
            product provider.
          </div>
        </div>
      </div>

      <div className="settings">
        {ROWS.map((r) => (
          <button key={r.label} className="setrow">
            <span className="setrow__icon">
              <Icon name={r.icon} size={18} />
            </span>
            <span className="setrow__label">{r.label}</span>
            <span className="setrow__value">{r.value}</span>
            <span className="setrow__chev">
              <Icon name="chevronRight" size={16} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
