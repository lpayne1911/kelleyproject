import { useState } from "react";
import { QuoteForm } from "./components/QuoteForm";
import { QuoteResult } from "./components/QuoteResult";
import { SubmissionForm } from "./components/SubmissionForm";
import type { QuoteResult as QuoteResultType, QuoteRequest } from "./lib/engine";

type Tab = "check" | "submit";

export function App() {
  const [tab, setTab] = useState<Tab>("check");
  const [quote, setQuote] = useState<{
    result: QuoteResultType;
    request: QuoteRequest;
  } | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">DA</span>
          <div>
            <strong>Driveway Advocate</strong>
            <small>The KBB for vehicle service contracts</small>
          </div>
        </div>
        <nav className="tabs">
          <button
            className={tab === "check" ? "tab tab--active" : "tab"}
            onClick={() => setTab("check")}
          >
            Check an offer
          </button>
          <button
            className={tab === "submit" ? "tab tab--active" : "tab"}
            onClick={() => setTab("submit")}
          >
            Show us yours
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === "check" ? (
          <>
            <section className="hero">
              <h1>
                Know a <span className="grad">fair price</span> before you sign.
              </h1>
              <p>
                Independent, data-driven fair-market estimates for vehicle service
                contracts — so a dealer's offer meets a number, not a guess.
              </p>
              <div className="hero__chips">
                <span>FAIR · NEGOTIATE · OVERPRICED verdict</span>
                <span>Risk-scored pricing</span>
                <span>Blended with real offers</span>
              </div>
            </section>
            <div className="columns">
            <QuoteForm
              onResult={(result, request) => {
                setQuote({ result, request });
                setError("");
              }}
              onError={setError}
            />
            <div className="results-col">
              {error && <div className="errors">{error}</div>}
              {quote ? (
                <QuoteResult result={quote.result} request={quote.request} />
              ) : (
                !error && (
                  <div className="card empty">
                    <p>
                      Fill in your vehicle to see a fair-price estimate and
                      verdict.
                    </p>
                  </div>
                )
              )}
            </div>
            </div>
          </>
        ) : (
          <SubmissionForm />
        )}
      </main>

      <footer className="footer">
        <p>
          Research &amp; decision-support tool. Estimates are built from publicly
          reported ranges and documented assumptions — not a quote, insurance
          product, or financial advice.
        </p>
      </footer>
    </div>
  );
}
