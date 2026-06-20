import { useState } from "react";
import {
  priceQuote,
  TIER_OPTIONS,
  TERM_OPTIONS,
  SEGMENT_OPTIONS,
  POWERTRAIN_OPTIONS,
  DRIVETRAIN_OPTIONS,
  type QuoteRequest,
  type QuoteResult,
  type Segment,
  type Powertrain,
  type Drivetrain,
} from "../lib/engine";

interface Props {
  onResult: (result: QuoteResult, request: QuoteRequest) => void;
  onError: (message: string) => void;
}

function toNum(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function QuoteForm({ onResult, onError }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [termMonths, setTermMonths] = useState("60");
  const [tier, setTier] = useState("exclusionary");
  const [dealerOffer, setDealerOffer] = useState("");
  const [deductible, setDeductible] = useState("100");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [segment, setSegment] = useState<Segment | "">("");
  const [powertrain, setPowertrain] = useState<Powertrain | "">("");
  const [drivetrain, setDrivetrain] = useState<Drivetrain | "">("");
  const [turbo, setTurbo] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError("");

    const req: QuoteRequest = {
      make: make.trim(),
      model: model.trim(),
      mileage: toNum(mileage) ?? NaN,
      termMonths: toNum(termMonths) ?? NaN,
      tier,
      year: toNum(year),
      deductible: toNum(deductible),
      dealerOffer: toNum(dealerOffer),
      segment: segment || undefined,
      powertrain: powertrain || undefined,
      drivetrain: drivetrain || undefined,
      turbo: turbo || undefined,
    };

    try {
      const result = priceQuote(req);
      onResult(result, req);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Check a warranty offer</h2>
      <p className="muted">
        Enter your vehicle and (optionally) the dealer's price. We'll estimate a
        fair market range and tell you whether the offer is fair, negotiable, or
        overpriced.
      </p>

      <div className="grid">
        <label>
          Make *
          <input
            required
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Toyota"
          />
        </label>
        <label>
          Model *
          <input
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="RAV4"
          />
        </label>
        <label>
          Model year
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2021"
          />
        </label>
        <label>
          Current mileage *
          <input
            required
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="42000"
          />
        </label>
        <label>
          Term *
          <select value={termMonths} onChange={(e) => setTermMonths(e.target.value)}>
            {TERM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Coverage tier *
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            {TIER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dealer's offer (optional)
          <input
            type="number"
            value={dealerOffer}
            onChange={(e) => setDealerOffer(e.target.value)}
            placeholder="3200"
          />
        </label>
        <label>
          Deductible
          <input
            type="number"
            value={deductible}
            onChange={(e) => setDeductible(e.target.value)}
            placeholder="100"
          />
        </label>
      </div>

      <button
        type="button"
        className="link-btn"
        onClick={() => setShowAdvanced((s) => !s)}
      >
        {showAdvanced ? "− Hide" : "+ Show"} advanced (used only if your vehicle
        isn't in our database)
      </button>

      {showAdvanced && (
        <div className="grid">
          <label>
            Segment
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as Segment | "")}
            >
              <option value="">Auto-detect</option>
              {SEGMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Powertrain
            <select
              value={powertrain}
              onChange={(e) => setPowertrain(e.target.value as Powertrain | "")}
            >
              <option value="">Auto-detect</option>
              {POWERTRAIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Drivetrain
            <select
              value={drivetrain}
              onChange={(e) => setDrivetrain(e.target.value as Drivetrain | "")}
            >
              <option value="">Auto-detect</option>
              {DRIVETRAIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={turbo}
              onChange={(e) => setTurbo(e.target.checked)}
            />
            Turbocharged
          </label>
        </div>
      )}

      <button type="submit" className="btn btn--primary">
        Check this offer
      </button>
    </form>
  );
}
