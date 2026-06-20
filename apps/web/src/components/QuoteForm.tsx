import { useRef, useState } from "react";
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
import { decodeVin, isValidVin } from "../lib/vin";

interface Props {
  onResult: (result: QuoteResult, request: QuoteRequest) => void;
  onError: (message: string) => void;
}

type VinState =
  | { status: "idle" | "loading" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

function toNum(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function QuoteForm({ onResult, onError }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");
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
  const [vin, setVin] = useState("");
  const [vinState, setVinState] = useState<VinState>({ status: "idle" });
  // VIN we last kicked a decode for — prevents the auto-decode from re-firing
  // on every keystroke once 17 valid characters are present.
  const decodedVinRef = useRef<string>("");

  async function handleDecodeVin(rawVin: string = vin) {
    const target = rawVin.trim().toUpperCase();
    decodedVinRef.current = target;
    setVinState({ status: "loading" });
    try {
      const d = await decodeVin(target);
      if (d.make) setMake(d.make);
      if (d.model) setModel(d.model);
      if (d.year) setYear(String(d.year));
      if (d.trim) setTrim(d.trim);

      let revealed = false;
      if (d.powertrain) {
        setPowertrain(d.powertrain);
        revealed = true;
      }
      if (d.drivetrain) {
        setDrivetrain(d.drivetrain);
        revealed = true;
      }
      if (d.turbo) {
        setTurbo(true);
        revealed = true;
      }
      if (revealed) setShowAdvanced(true);

      const summary = [d.year, d.make, d.model].filter(Boolean).join(" ");
      setVinState({
        status: "ok",
        message: summary
          ? `Decoded ${summary} — review and adjust below.`
          : "Decoded — review the details below.",
      });
    } catch (err) {
      setVinState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

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
      trim: trim.trim() || undefined,
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

      <div className="vin">
        <label className="full">
          Look up by VIN
          <div className="vin__row">
            <input
              value={vin}
              onChange={(e) => {
                const next = e.target.value;
                setVin(next);
                const cleaned = next.trim().toUpperCase();
                if (isValidVin(cleaned)) {
                  // Auto-decode once we have a full, valid VIN we haven't tried.
                  if (cleaned !== decodedVinRef.current) void handleDecodeVin(cleaned);
                } else if (vinState.status !== "idle") {
                  setVinState({ status: "idle" });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleDecodeVin();
                }
              }}
              placeholder="17-character VIN"
              maxLength={17}
              autoComplete="off"
              spellCheck={false}
              className="vin__input"
            />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void handleDecodeVin()}
              disabled={vinState.status === "loading" || vin.trim().length === 0}
            >
              {vinState.status === "loading" ? "Decoding…" : "Decode"}
            </button>
          </div>
        </label>
        {vinState.status === "ok" && (
          <p className="vin__status vin__status--ok">✓ {vinState.message}</p>
        )}
        {vinState.status === "error" && (
          <p className="vin__status vin__status--err">{vinState.message}</p>
        )}
      </div>

      <div className="divider">
        <span>or enter details manually</span>
      </div>

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
          Trim
          <input
            value={trim}
            onChange={(e) => setTrim(e.target.value)}
            placeholder="XLE"
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
