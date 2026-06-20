import type { CSSProperties } from "react";
import {
  usd,
  pct,
  type QuoteResult as QuoteResultType,
  type QuoteRequest,
  type RiskLabel,
} from "../lib/engine";
import { VerdictBadge } from "./VerdictBadge";
import { RiskBadge } from "./RiskBadge";

interface Props {
  result: QuoteResultType;
  request: QuoteRequest;
}

const RISK_COLOR: Record<RiskLabel, string> = {
  Low: "#16C784",
  Moderate: "#3AA0FF",
  Elevated: "#F5A524",
  High: "#F31260",
};

export function QuoteResult({ result, request }: Props) {
  const { score } = result;
  const offer = request.dealerOffer;

  const span = result.fairHigh - result.fairLow;
  const offerPos =
    offer != null && span > 0
      ? Math.max(0, Math.min(100, ((offer - result.fairLow) / span) * 100))
      : null;
  const offerBeyond =
    offer != null && (offer < result.fairLow || offer > result.fairHigh);

  const dialStyle = {
    "--score": score.fullScore,
    "--ring": RISK_COLOR[score.riskLabel],
  } as CSSProperties;

  return (
    <div className="card result">
      <header className="result__head">
        <div>
          <h2>
            {request.year ? `${request.year} ` : ""}
            {request.make} {request.model}
          </h2>
          <div className="badges">
            <VerdictBadge verdict={result.verdict} />
            <RiskBadge label={score.riskLabel} />
            <span className="pill pill--source">
              {result.confidence === "blended"
                ? `Blended · ${result.observedN} real offer${
                    result.observedN === 1 ? "" : "s"
                  }`
                : "Estimated"}
            </span>
          </div>
        </div>
        <div className="score-dial" style={dialStyle} title="Warranty-risk score (1–100)">
          <span className="score-dial__num num">{score.fullScore}</span>
          <span className="score-dial__label">risk</span>
        </div>
      </header>

      <section className="fairbar">
        <div className="fairbar__head">
          <h3>Fair market range</h3>
          {offer != null && (
            <span className={`delta delta--${(result.verdict ?? "fair").toLowerCase()}`}>
              {pct(result.offerVsFairPct)} vs. fair
            </span>
          )}
        </div>

        <div className="meter">
          <div className="meter__track">
            <div className="meter__fairzone" />
            <div className="meter__mid" />
            {offerPos != null && (
              <div
                className={`meter__marker${offerBeyond ? " meter__marker--out" : ""}`}
                style={{ left: `${offerPos}%` } as CSSProperties}
                title={`Offer ${usd(offer!)}`}
              >
                <span className="meter__flag num">{usd(offer!)}</span>
              </div>
            )}
          </div>
          <div className="meter__scale">
            <span className="num">{usd(result.fairLow)}</span>
            <span className="meter__mid-cap num">{usd(result.fairMid)}</span>
            <span className="num">{usd(result.fairHigh)}</span>
          </div>
        </div>

        {offer != null && (
          <p className="muted small">
            Offer <strong className="num">{usd(offer)}</strong> ·{" "}
            <strong className="num">{pct(result.offerVsFairPct)}</strong> vs. fair mid
            {result.markupVsCostPct != null && (
              <>
                {" "}
                · <strong className="num">{pct(result.markupVsCostPct)}</strong> vs.
                est. dealer cost
              </>
            )}
            .
          </p>
        )}
      </section>

      <section className="metrics">
        <Metric label="Negotiation target" value={usd(result.negotiationTarget)} highlight />
        <Metric label="Est. dealer cost" value={usd(result.dealerCostEst)} />
        <Metric label="Per year (fair)" value={usd(result.perYearFair)} />
      </section>

      <section className="reco">
        <h3>Recommendation</h3>
        <p>{result.recommendation}</p>
        {result.markupWarning && <p className="warning">⚠️ {result.markupWarning}</p>}
      </section>

      {result.explanation.length > 0 && (
        <details className="explain">
          <summary>How we got here</summary>
          <ul>
            {result.explanation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </details>
      )}

      {result.alternatives.length > 0 && (
        <section className="alts">
          <h3>Things to consider</h3>
          <ul>
            {result.alternatives.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="disclaimer">
        Estimate only — built from publicly reported ranges and documented
        assumptions. Not a quote, insurance product, or financial advice. Always
        confirm with real quotes before buying.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`metric${highlight ? " metric--hl" : ""}`}>
      <span className="metric__val num">{value}</span>
      <span className="metric__label">{label}</span>
    </div>
  );
}
