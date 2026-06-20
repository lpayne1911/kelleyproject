import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { logoutFromConsole } from "./actions";
import { money, shortDate, vehicle, VERDICT_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  shopping: "Shopping",
  quoted: "New quote",
  in_review: "In review",
  delivered: "Delivered",
  signed: "Signed",
  walked: "Walked",
};

export default async function ConsoleQueue() {
  let deals: any[] = [];
  let configError = false;

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("deals")
      .select(
        "id, created_at, stage, requested_package, vehicle_year, vehicle_make, vehicle_model, dealer_name, out_the_door_price, leads(full_name, email), reviews(verdict)",
      )
      .order("created_at", { ascending: false });
    deals = data ?? [];
  } catch {
    configError = true;
  }

  return (
    <main className="min-h-screen bg-paper-2">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <span className="font-serif text-lg font-semibold text-ink">
              Review Console
            </span>
            <span className="ml-3 text-[12px] text-slate-light">
              Deal Check queue
            </span>
          </div>
          <form action={logoutFromConsole}>
            <button className="text-[13px] font-semibold text-slate hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {configError ? (
          <div className="rounded-lg border-l-4 border-risk bg-paper p-6 text-[14px] text-slate">
            <strong className="text-ink">Supabase isn&apos;t configured.</strong>{" "}
            Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment, then
            reload.
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center text-slate">
            No submissions yet. Test the funnel at{" "}
            <Link href="/deal-check" className="font-semibold text-gold-deep">
              /deal-check
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink text-[10.5px] uppercase tracking-wider text-slate">
                  <th className="px-5 py-3 font-bold">Buyer</th>
                  <th className="px-5 py-3 font-bold">Vehicle</th>
                  <th className="px-5 py-3 font-bold">Dealer</th>
                  <th className="px-5 py-3 font-bold">OTD</th>
                  <th className="px-5 py-3 font-bold">Received</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => {
                  const lead = Array.isArray(d.leads) ? d.leads[0] : d.leads;
                  const verdict = d.reviews?.[0]?.verdict as string | undefined;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-line last:border-b-0 hover:bg-paper-2"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">
                          {lead?.full_name ?? "—"}
                        </div>
                        <div className="text-[12px] text-slate-light">
                          {lead?.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate">{vehicle(d)}</td>
                      <td className="px-5 py-4 text-slate">
                        {d.dealer_name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate">
                        {money(d.out_the_door_price)}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-slate-light">
                        {shortDate(d.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        {verdict ? (
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${VERDICT_STYLES[verdict] ?? ""}`}
                          >
                            {verdict}
                          </span>
                        ) : (
                          <span className="text-[12px] font-semibold text-slate">
                            {STAGE_LABEL[d.stage] ?? d.stage}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/console/deals/${d.id}`}
                          className="text-[13px] font-semibold text-gold-deep hover:underline"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
