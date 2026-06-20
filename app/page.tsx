import Link from "next/link";
import { PACKAGES } from "@/lib/packages";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ---------- Nav ---------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-xl font-semibold text-ink">
          Driveway Advocate
        </span>
        <Link
          href="/deal-check"
          className="rounded bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
        >
          Check my deal
        </Link>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-[#233B5E] text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_.9fr] md:py-28">
          <div>
            <span className="inline-block rounded-sm bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
              Buyer-side only
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-white md:text-6xl">
              Protect buyers
              <br />
              before they sign.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#C3CEDC]">
              We audit the dealer&apos;s offer, kill the junk fees, and protect
              you through signing — and we fix the credit score that sets your
              rate before you ever hit the lot. From credit score to driveway,
              on your side the whole way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/deal-check"
                className="rounded bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-deep"
              >
                Upload your quote →
              </Link>
              <a
                href="#pricing"
                className="rounded border border-white/25 px-6 py-3 text-sm font-semibold text-paper transition hover:border-white/50"
              >
                See packages
              </a>
            </div>
          </div>

          {/* Stylized "protected contract" motif */}
          <div className="hidden items-center justify-center md:flex">
            <div className="w-[78%] -rotate-3 rounded-md bg-paper p-8 shadow-2xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-light">
                Auto Purchase Agreement
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {[92, 84, 88, 70, 80].map((w, i) => (
                  <span
                    key={i}
                    className="block h-1.5 rounded bg-line"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <p className="mt-8 -rotate-3 font-serif text-2xl font-semibold italic text-ink">
                Protected
              </p>
              <hr className="sign-rule mt-2" />
              <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-light">
                Buyer signature
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Two engines ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          One business · two engines
        </p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold text-ink">
          Two services that fix the two places buyers lose money.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-ink p-8 text-paper">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
              Engine 01 · Upstream
            </p>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-white">
              Credit Preparation
            </h3>
            <p className="mt-3 text-sm text-[#B9C6D6]">
              Review, dispute, rebuild, and prepare the score that sets your
              interest rate — billed monthly, only for work performed.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-paper-2 p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
              Engine 02 · At purchase
            </p>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-ink">
              Deal Protection
            </h3>
            <p className="mt-3 text-sm text-slate">
              Audit the offer, kill junk fees, and protect you through signing —
              a flat fee, paid by one party only: you.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-r border-l-4 border-gold bg-paper-2 px-6 py-4 text-[15px] text-ink">
          A credit client who graduates is a pre-sold deal-protection client.{" "}
          <strong className="font-semibold text-gold-deep">
            One customer, served twice.
          </strong>
        </div>
      </section>

      {/* ---------- Pricing ladder ---------- */}
      <section id="pricing" className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
            Packages
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
            A low-friction front door that ladders up to protection.
          </h2>
          <div className="mt-10 overflow-hidden rounded-lg border border-line">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.code}
                className={`grid grid-cols-1 gap-2 border-b border-line px-6 py-5 last:border-b-0 sm:grid-cols-[1.4fr_2fr_1fr] sm:items-center ${
                  pkg.role === "flagship" ? "bg-gold/[0.06]" : "bg-paper"
                }`}
              >
                <div>
                  <span className="font-serif text-lg font-semibold text-ink">
                    {pkg.name}
                  </span>
                  <span className="ml-2 inline-block rounded-sm bg-paper-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate">
                    {pkg.role.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[13.5px] text-slate">{pkg.blurb}</p>
                <p className="font-serif text-lg font-bold text-ink sm:text-right">
                  {pkg.price}
                  {pkg.priceNote && (
                    <span className="block text-[11px] font-medium text-slate-light">
                      {pkg.priceNote}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-slate">
            Auto fees are a limited launch <strong>Founding Rate</strong>. Credit
            is billed monthly in arrears — never as an advance fee.
          </p>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-gradient-to-br from-ink to-[#233B5E] text-center text-paper">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-serif text-3xl font-semibold text-white">
            From credit score to driveway, on the buyer&apos;s side the whole way.
          </h2>
          <p className="mt-3 font-serif text-lg italic text-gold">
            Your buyer-side shield before you sign.
          </p>
          <Link
            href="/deal-check"
            className="mt-8 inline-block rounded bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-deep"
          >
            Check my deal →
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-slate-light">
        Driveway Advocate · Independent buyer-side advocacy · We take no dealer
        commissions.
      </footer>
    </main>
  );
}
