import type { Verdict } from "../lib/engine";

const STYLES: Record<Verdict, { label: string; className: string }> = {
  FAIR: { label: "Fair price", className: "badge badge--fair" },
  NEGOTIATE: { label: "Negotiate", className: "badge badge--negotiate" },
  OVERPRICED: { label: "Overpriced", className: "badge badge--overpriced" },
};

export function VerdictBadge({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) {
    return <span className="badge badge--neutral">No offer entered</span>;
  }
  const s = STYLES[verdict];
  return <span className={s.className}>{s.label}</span>;
}
