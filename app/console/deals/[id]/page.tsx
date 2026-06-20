import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { addFinding, deleteFinding, publishReview } from "../../actions";
import { money, vehicle, VERDICT_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  ["junk_fee", "Junk fee"],
  ["rate_markup", "Rate markup"],
  ["trade_in", "Trade-in"],
  ["add_on", "Add-on / F&I"],
  ["pricing", "Pricing"],
  ["financing", "Financing"],
  ["other", "Other"],
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-paper-2 px-4 py-3">
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-light">
        {label}
      </div>
      <div className="mt-0.5 font-serif text-lg font-semibold text-ink">
        {value}
      </div>
    </div>
  );
}

export default async function DealReview({ params }: { params: { id: string } }) {
  const supabase = createServiceClient();

  const { data: deal } = await supabase
    .from("deals")
    .select("*, leads(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!deal) notFound();

  const lead = Array.isArray(deal.leads) ? deal.leads[0] : deal.leads;

  const { data: docs } = await supabase
    .from("quote_documents")
    .select("*")
    .eq("deal_id", params.id);

  const { data: review } = await supabase
    .from("reviews")
    .select("*, findings(*)")
    .eq("deal_id", params.id)
    .maybeSingle();

  const findings = (review?.findings ?? []) as any[];
  const totalExposure = findings.reduce(
    (sum, f) => sum + (Number(f.estimated_cost) || 0),
    0,
  );

  // Signed URLs for uploaded quote files (private bucket).
  const docLinks: { name: string; url: string | null }[] = [];
  for (const doc of docs ?? []) {
    const { data } = await supabase.storage
      .from("quote-documents")
      .createSignedUrl(doc.storage_path, 60 * 60);
    docLinks.push({ name: doc.file_name, url: data?.signedUrl ?? null });
  }

  return (
    <main className="min-h-screen bg-paper-2">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/console" className="text-[13px] font-semibold text-slate hover:text-ink">
            ← Queue
          </Link>
          {review?.verdict && (
            <span
              className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase ${VERDICT_STYLES[review.verdict] ?? ""}`}
            >
              {review.verdict} · delivered
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Buyer + deal summary */}
        <div className="rounded-lg border border-line bg-paper p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-serif text-2xl font-semibold text-ink">
              {lead?.full_name ?? "Buyer"}
            </h1>
            <span className="text-[13px] text-slate">
              {lead?.email}
              {lead?.phone ? ` · ${lead.phone}` : ""}
            </span>
          </div>
          <p className="mt-1 text-[15px] text-slate">
            {vehicle(deal)} · {deal.dealer_name ?? "Dealer TBD"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Out-the-door" value={money(deal.out_the_door_price)} />
            <Stat label="Monthly" value={money(deal.monthly_payment)} />
            <Stat label="APR" value={deal.apr ? `${deal.apr}%` : "—"} />
            <Stat label="Term" value={deal.term_months ? `${deal.term_months} mo` : "—"} />
          </div>

          {lead?.notes && (
            <p className="mt-4 rounded border-l-4 border-line bg-paper-2 px-4 py-3 text-[13.5px] text-slate">
              <strong className="text-ink">Buyer note:</strong> {lead.notes}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {docLinks.length === 0 && (
              <span className="text-[13px] text-slate-light">No quote file uploaded.</span>
            )}
            {docLinks.map((d, i) =>
              d.url ? (
                <a
                  key={i}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-ink bg-ink px-4 py-2 text-[13px] font-semibold text-paper hover:bg-ink-soft"
                >
                  📄 {d.name}
                </a>
              ) : (
                <span key={i} className="text-[13px] text-slate-light">
                  {d.name} (link unavailable)
                </span>
              ),
            )}
          </div>
        </div>

        {/* Findings */}
        <section className="mt-6 rounded-lg border border-line bg-paper p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Red-flag findings
            </h2>
            <span className="text-[13px] text-slate">
              Buyer exposure:{" "}
              <strong className="font-serif text-base text-risk">
                {money(totalExposure)}
              </strong>
            </span>
          </div>

          <ul className="mt-4 flex flex-col divide-y divide-line">
            {findings.length === 0 && (
              <li className="py-3 text-[13.5px] text-slate-light">
                No findings yet. Add red flags below.
              </li>
            )}
            {findings.map((f) => (
              <li key={f.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${VERDICT_STYLES[f.severity] ?? ""}`}
                >
                  {f.severity}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-ink">{f.label}</div>
                  {f.detail && (
                    <div className="text-[13px] text-slate">{f.detail}</div>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-ink">
                  {money(f.estimated_cost)}
                </span>
                <form action={deleteFinding}>
                  <input type="hidden" name="deal_id" value={deal.id} />
                  <input type="hidden" name="finding_id" value={f.id} />
                  <button className="text-[12px] text-slate-light hover:text-risk">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>

          {/* Add finding */}
          <form
            action={addFinding}
            className="mt-5 grid grid-cols-1 gap-3 rounded border border-dashed border-line bg-paper-2 p-4 sm:grid-cols-12"
          >
            <input type="hidden" name="deal_id" value={deal.id} />
            <select
              name="category"
              className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink sm:col-span-3"
            >
              {CATEGORIES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              name="severity"
              className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink sm:col-span-2"
            >
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
            </select>
            <input
              name="label"
              required
              placeholder="e.g. Bogus 'dealer prep' fee"
              className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink sm:col-span-4"
            />
            <input
              name="estimated_cost"
              placeholder="$ cost"
              className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink sm:col-span-2"
            />
            <input
              name="detail"
              placeholder="Optional detail / what to say to the dealer"
              className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink sm:col-span-10"
            />
            <button className="rounded bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-ink-soft sm:col-span-2">
              Add flag
            </button>
          </form>
        </section>

        {/* Publish verdict */}
        <section className="mt-6 rounded-lg border border-line bg-paper p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Verdict &amp; report
          </h2>
          <form action={publishReview} className="mt-4 flex flex-col gap-4">
            <input type="hidden" name="deal_id" value={deal.id} />
            <div className="flex flex-wrap gap-3">
              {["red", "yellow", "green"].map((v) => (
                <label
                  key={v}
                  className="flex cursor-pointer items-center gap-2 rounded border border-line bg-paper-2 px-4 py-2 text-[14px] font-semibold capitalize text-ink has-[:checked]:border-gold has-[:checked]:bg-gold/10"
                >
                  <input
                    type="radio"
                    name="verdict"
                    value={v}
                    defaultChecked={review?.verdict === v}
                    required
                  />
                  {v}
                </label>
              ))}
            </div>
            <textarea
              name="summary"
              rows={4}
              defaultValue={review?.summary ?? ""}
              placeholder="Plain-English summary: the headline, the target numbers, sign / push / walk."
              className="rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-gold"
            />
            <div className="flex flex-wrap items-center gap-3">
              <input
                name="reviewer"
                defaultValue={review?.reviewer ?? ""}
                placeholder="Reviewer name"
                className="rounded border border-line bg-white px-3 py-2 text-[14px] text-ink"
              />
              <button className="rounded bg-gold px-6 py-2.5 text-[14px] font-semibold text-ink hover:bg-gold-deep">
                {review?.published_at ? "Update verdict" : "Publish verdict"}
              </button>
              {review?.published_at && (
                <span className="text-[12px] text-slate-light">
                  Last delivered {new Date(review.published_at).toLocaleString()}
                </span>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
