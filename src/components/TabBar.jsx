import Icon from './Icon.jsx'

// Generic bottom nav. `items` = [{ key, label, icon, badge }].
export default function TabBar({ items, active, onChange, variant = '' }) {
  return (
    <div className={`tabbar ${variant}`}>
      {items.map((it) => {
        const on = it.key === active
        return (
          <button
            key={it.key}
            className={`nav ${on ? 'is-on' : ''} ${it.key}`}
            onClick={() => onChange(it.key)}
          >
            {it.badge ? (
              <span className="nav__badge">
                <Icon name={it.icon} />
                <i>{it.badge}</i>
              </span>
            ) : (
              <Icon name={it.icon} />
            )}
            <span>{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}
