"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { submitDealCheck, type DealCheckState } from "@/app/actions/submit-deal-check";

const initialState: DealCheckState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-deep disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send my quote for review →"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  half,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  half?: boolean;
}) {
  return (
    <label className={half ? "block" : "block sm:col-span-2"}>
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate">
        {label}
        {required && <span className="text-risk"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-gold"
      />
    </label>
  );
}

export default function DealCheckPage() {
  const [state, formAction] = useFormState(submitDealCheck, initialState);

  return (
    <main className="min-h-screen bg-paper-2">
      <header className="mx-auto max-w-3xl px-6 py-6">
        <Link href="/" className="font-serif text-lg font-semibold text-ink">
          ← Driveway Advocate
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Deal Check · Founding Rate
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">
          Before you sign, we check the deal.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-slate">
          Upload your dealer quote and we&apos;ll tear it apart for junk fees,
          rate markup, and add-ons — then send you a plain-English red / yellow /
          green within one business day.
        </p>

        {state?.ok ? (
          <div className="mt-10 rounded-lg border-l-4 border-gold bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              You&apos;re in the queue.
            </h2>
            <p className="mt-2 text-[15px] text-slate">{state.message}</p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold text-gold-deep"
            >
              ← Back home
            </Link>
          </div>
        ) : (
          <form
            action={formAction}
            className="mt-10 rounded-lg border border-line bg-white p-7 shadow-sm"
          >
            {state && !state.ok && (
              <p className="mb-5 rounded border-l-4 border-risk bg-risk/5 px-4 py-3 text-sm text-risk">
                {state.message}
              </p>
            )}

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-serif text-lg font-semibold text-ink">
                Your details
              </legend>
              <Field label="Full name" name="full_name" required half />
              <Field label="Phone" name="phone" type="tel" half />
              <Field label="Email" name="email" type="email" required />
            </fieldset>

            <hr className="sign-rule my-7" />

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-serif text-lg font-semibold text-ink">
                The deal
              </legend>
              <Field label="Dealer name" name="dealer_name" half placeholder="e.g. City Motors" />
              <Field label="Vehicle year" name="vehicle_year" type="number" half placeholder="2024" />
              <Field label="Make" name="vehicle_make" half placeholder="Toyota" />
              <Field label="Model" name="vehicle_model" half placeholder="RAV4" />
              <Field label="Out-the-door price" name="out_the_door_price" half placeholder="$38,500" />
              <Field label="Monthly payment" name="monthly_payment" half placeholder="$612" />
              <Field label="APR %" name="apr" half placeholder="7.9" />
              <Field label="Term (months)" name="term_months" type="number" half placeholder="72" />
            </fieldset>

            <hr className="sign-rule my-7" />

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate">
                Upload your quote / buyer&apos;s order
              </span>
              <input
                name="quote"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
                className="w-full rounded border border-dashed border-line bg-paper-2 px-3.5 py-3 text-[14px] text-slate file:mr-3 file:rounded file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
              />
              <span className="mt-1.5 block text-[12px] text-slate-light">
                PDF or photo. No quote yet? Leave it blank and tell us below.
              </span>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate">
                Anything we should know?
              </span>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-gold"
                placeholder="Trade-in, timeline, pressure you're feeling…"
              />
            </label>

            <div className="mt-7">
              <SubmitButton />
              <p className="mt-3 text-center text-[12px] text-slate-light">
                Independent &amp; buyer-side. We take no dealer commissions.
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
