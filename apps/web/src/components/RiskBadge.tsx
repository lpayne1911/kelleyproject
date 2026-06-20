import type { RiskLabel } from "../lib/engine";

const CLASS: Record<RiskLabel, string> = {
  Low: "pill pill--low",
  Moderate: "pill pill--moderate",
  Elevated: "pill pill--elevated",
  High: "pill pill--high",
};

export function RiskBadge({ label }: { label: RiskLabel }) {
  return <span className={CLASS[label]}>{label} risk</span>;
}
