export function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function shortDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function vehicle(d: {
  vehicle_year?: number | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
}): string {
  const parts = [d.vehicle_year, d.vehicle_make, d.vehicle_model].filter(Boolean);
  return parts.length ? parts.join(" ") : "Vehicle TBD";
}

export const VERDICT_STYLES: Record<string, string> = {
  red: "bg-risk/10 text-risk border-risk",
  yellow: "bg-gold/10 text-gold-deep border-gold",
  green: "bg-emerald-50 text-emerald-700 border-emerald-500",
};
