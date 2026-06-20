import { useState } from "react";
import {
  validateSubmission,
  normalizeSubmission,
  OFFER_TYPE_OPTIONS,
  TIER_OPTIONS,
  TERM_OPTIONS,
  usd,
  type SubmissionInput,
  type NormalizedSubmission,
  type OfferType,
} from "../lib/engine";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function optNum(v: string): number | undefined {
  return v.trim() === "" ? undefined : toNum(v);
}

const EMPTY = {
  offerType: "dealer_initial" as OfferType,
  make: "",
  model: "",
  modelYear: "",
  trim: "",
  mileage: "",
  state: "",
  termMonths: "60",
  termMileage: "",
  coverageTier: "exclusionary",
  deductible: "100",
  price: "",
  monthly: "",
  downPayment: "",
  providerName: "",
  notes: "",
};

export function SubmissionForm() {
  const [f, setF] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<NormalizedSubmission | null>(null);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((prev) => ({ ...prev, [key]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setAccepted(null);

    const input: SubmissionInput = {
      offerType: f.offerType,
      make: f.make.trim(),
      model: f.model.trim(),
      modelYear: toNum(f.modelYear),
      mileage: toNum(f.mileage),
      termMonths: toNum(f.termMonths),
      coverageTier: f.coverageTier,
      price: toNum(f.price),
      providerName: f.providerName.trim() || undefined,
      trim: f.trim.trim() || undefined,
      state: f.state.trim() || undefined,
      termMileage: optNum(f.termMileage),
      deductible: optNum(f.deductible),
      monthly: optNum(f.monthly),
      downPayment: optNum(f.downPayment),
      notes: f.notes.trim() || undefined,
    };

    const { valid, errors: errs } = validateSubmission(input);
    if (!valid) {
      setErrors(errs);
      return;
    }
    // No backend yet — normalize locally so the contributor can see exactly
    // what would be stored. Wire this to POST /api/submissions when the
    // intake endpoint exists.
    setAccepted(normalizeSubmission(input));
  }

  if (accepted) {
    return (
      <div className="card result">
        <h2>Thanks — got it ✅</h2>
        <p className="muted">
          Here's the normalized record your offer becomes. It's marked{" "}
          <strong>{accepted.reviewStatus}</strong> for review (confidence:{" "}
          <strong>{accepted.confidence}</strong>, source:{" "}
          <strong>{accepted.sourceType}</strong>).
        </p>
        <section className="metrics">
          <div className="metric metric--hl">
            <span className="metric__val">{usd(accepted.price)}</span>
            <span className="metric__label">price</span>
          </div>
          <div className="metric">
            <span className="metric__val">{usd(accepted.perYear)}</span>
            <span className="metric__label">per year</span>
          </div>
          <div className="metric">
            <span className="metric__val">{accepted.mileageBand ?? "—"}</span>
            <span className="metric__label">mileage band</span>
          </div>
        </section>
        <details className="explain" open>
          <summary>Normalized record</summary>
          <pre className="code">{JSON.stringify(accepted, null, 2)}</pre>
        </details>
        <button
          className="btn btn--primary"
          onClick={() => {
            setF({ ...EMPTY });
            setAccepted(null);
          }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Show us yours</h2>
      <p className="muted">
        Share a real warranty offer (anonymously). Crowdsourced offers make
        everyone's fair-price estimates sharper. Required fields are marked *.
      </p>

      {errors.length > 0 && (
        <div className="errors">
          <strong>Please fix:</strong>
          <ul>
            {errors.map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid">
        <label>
          This offer is *
          <select value={f.offerType} onChange={set("offerType")}>
            {OFFER_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Provider / dealer
          <input value={f.providerName} onChange={set("providerName")} placeholder="Endurance" />
        </label>
        <label>
          Make *
          <input required value={f.make} onChange={set("make")} placeholder="Honda" />
        </label>
        <label>
          Model *
          <input required value={f.model} onChange={set("model")} placeholder="CR-V" />
        </label>
        <label>
          Model year *
          <input required type="number" value={f.modelYear} onChange={set("modelYear")} placeholder="2020" />
        </label>
        <label>
          Trim
          <input value={f.trim} onChange={set("trim")} placeholder="EX-L" />
        </label>
        <label>
          Mileage at purchase *
          <input required type="number" value={f.mileage} onChange={set("mileage")} placeholder="38000" />
        </label>
        <label>
          State
          <input value={f.state} onChange={set("state")} placeholder="TX" maxLength={2} />
        </label>
        <label>
          Term *
          <select value={f.termMonths} onChange={set("termMonths")}>
            {TERM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Term mileage
          <input type="number" value={f.termMileage} onChange={set("termMileage")} placeholder="75000" />
        </label>
        <label>
          Coverage tier *
          <select value={f.coverageTier} onChange={set("coverageTier")}>
            {TIER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Deductible
          <input type="number" value={f.deductible} onChange={set("deductible")} placeholder="100" />
        </label>
        <label>
          Price (total) *
          <input required type="number" value={f.price} onChange={set("price")} placeholder="2800" />
        </label>
        <label>
          Monthly payment
          <input type="number" value={f.monthly} onChange={set("monthly")} placeholder="116" />
        </label>
        <label>
          Down payment
          <input type="number" value={f.downPayment} onChange={set("downPayment")} placeholder="200" />
        </label>
      </div>

      <label className="full">
        Notes (optional)
        <textarea
          value={f.notes}
          onChange={set("notes")}
          rows={3}
          placeholder="Anything that affected the price — negotiation, bundle, etc."
        />
      </label>

      <button type="submit" className="btn btn--primary">
        Submit my offer
      </button>
    </form>
  );
}
