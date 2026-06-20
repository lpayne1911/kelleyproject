import {
  usd,
  pct,
  type QuoteResult as QuoteResultType,
  type QuoteRequest,
} from "../lib/engine";
import { VerdictBadge } from "./VerdictBadge";
import { RiskBadge } from "./RiskBadge";

interface Props {
  result: QuoteResultType;
  request: QuoteRequest;
}

export function QuoteResult({ result, request }: Props) {
  const { score } = result;
  const offer = request.dealerOffer;

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
                ? `Blended w/ ${result.observedN} real offer${
                    result.observedN === 1 ? "" : "s"
                  }`
                : "Estimated"}
            </span>
          </div>
        </div>
        <div className="score-dial" title="Warranty-risk score (1–100)">
          <span className="score-dial__num">{score.fullScore}</span>
          <span className="score-dial__label">risk score</span>
        </div>
      </header>

      <section className="fairbar">
        <h3>Fair market range</h3>
        <div className="fairbar__track">
          <div className="fairbar__seg">
            <span className="fairbar__cap">{usd(result.fairLow)}</span>
            <small>low</small>
          </div>
          <div className="fairbar__seg fairbar__seg--mid">
            <span className="fairbar__cap">{usd(result.fairMid)}</span>
            <small>fair mid</small>
          </div>
          <div className="fairbar__seg">
            <span className="fairbar__cap">{usd(result.fairHigh)}</span>
            <small>high</small>
          </div>
        </div>
        {offer != null && (
          <p className="muted">
            Dealer's offer <strong>{usd(offer)}</strong> is{" "}
            <strong>{pct(result.offerVsFairPct)}</strong> vs. fair mid
            {result.markupVsCostPct != null && (
              <> · {pct(result.markupVsCostPct)} vs. estimated dealer cost</>
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
        {result.markupWarning && (
          <p className="warning">⚠️ {result.markupWarning}</p>
        )}
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
      <span className="metric__val">{value}</span>
      <span className="metric__label">{label}</span>
    </div>
  );
}
