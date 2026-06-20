// Circular countdown ring used on alert cards (minutes-of-SLA-left style).
// `value` is the centered label; `pct` is how full the arc is (0-100).
export default function Ring({ value, pct, color, size = 38 }) {
  const r = 16
  const circ = 2 * Math.PI * r // ~100.5
  const offset = circ * (1 - pct / 100)
  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 38 38">
      <circle cx="19" cy="19" r={r} fill="none" stroke="#EDEDF1" strokeWidth="3.5" />
      <circle
        cx="19"
        cy="19"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 19 19)"
      />
      <text x="19" y="23" textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
        {value}
      </text>
    </svg>
  )
}
