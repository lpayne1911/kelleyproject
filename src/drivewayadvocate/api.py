"""Web API + intake form for Driveway Advocate (optional `web` extra).

Wraps the existing engine and ingestion core in a small FastAPI app:

    GET  /                     -> HTML page (price-check + "show us yours" forms)
    GET  /healthz              -> liveness probe
    POST /api/quote            -> advocacy report (JSON) for a vehicle/offer
    POST /api/submissions      -> submit one real offer (queued for moderation)
    GET  /api/submissions      -> list submissions (optionally ?status=pending)

Run it:
    pip install -e ".[web]"
    python -m drivewayadvocate.api          # or: uvicorn drivewayadvocate.api:app

The engine still only reads ``pricing_observations``; submissions land in the moderated
``submissions`` ledger exactly as they do via the CLI.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Optional

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel, Field
except ModuleNotFoundError as exc:  # pragma: no cover - import guard
    raise ModuleNotFoundError(
        "The web API needs the optional 'web' extra. Install it with:\n"
        '    pip install -e ".[web]"   (fastapi + uvicorn)'
    ) from exc

from . import db as db_module
from . import ingest as ingest_module
from .pricing import QuoteRequest, price_quote

# Overridable hooks (tests monkeypatch these; resolved at call time).
SUBMISSIONS_PATH: Path = ingest_module.SUBMISSIONS_SEED
DB_PATH: Optional[Path] = None  # None -> default DB if present, else in-memory

app = FastAPI(title="Driveway Advocate", version="0.1.0")


def get_conn() -> sqlite3.Connection:
    """Connect to the on-disk DB if it exists, else a seeded in-memory one."""
    path = Path(DB_PATH) if DB_PATH else db_module.DEFAULT_DB_PATH
    if path.exists():
        return db_module.connect(path)
    return db_module.build_in_memory()


# --- Request models -----------------------------------------------------------
class QuoteIn(BaseModel):
    make: str
    model: str
    mileage: int
    term_months: int
    tier: str
    year: Optional[int] = None
    trim: Optional[str] = None
    deductible: Optional[int] = 100
    term_mileage: Optional[int] = None
    state: Optional[str] = None
    dealer_offer: Optional[int] = None
    current_warranty_active: Optional[bool] = None
    segment: str = "mainstream"
    luxury: bool = False
    powertrain: str = "ice"
    turbo: bool = False
    drivetrain: str = "fwd"


class SubmissionIn(BaseModel):
    offer_type: str = Field(..., description="dealer_initial | price_paid | outside_quote")
    make: str
    model: str
    model_year: int
    mileage: int
    term_months: int
    coverage_tier: str
    price: int
    provider_name: Optional[str] = None
    trim: Optional[str] = None
    state: Optional[str] = None
    term_mileage: Optional[int] = None
    deductible: Optional[int] = 100
    monthly: Optional[int] = None
    down_payment: Optional[int] = None
    submitter_ref: Optional[str] = None
    notes: Optional[str] = None


# --- Endpoints ----------------------------------------------------------------
@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}


@app.post("/api/quote")
def api_quote(payload: QuoteIn) -> dict:
    try:
        req = QuoteRequest(**payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    conn = get_conn()
    try:
        result = price_quote(req, conn)
    finally:
        conn.close()
    return result.to_dict()


@app.post("/api/submissions")
def api_submit(payload: SubmissionIn) -> dict:
    report = ingest_module.ingest_rows(
        [payload.model_dump()], submissions_path=SUBMISSIONS_PATH
    )
    if report.accepted:
        sub = report.accepted[0]
        return {
            "status": "accepted",
            "submission_id": sub["submission_id"],
            "review_status": sub["review_status"],
            "message": "Thanks — queued for moderation. It won't affect prices until approved.",
        }
    if report.duplicates:
        return {"status": "duplicate", "message": "We already have this exact offer."}
    errors = report.rejected[0][1] if report.rejected else ["unknown error"]
    raise HTTPException(status_code=422, detail=errors)


@app.get("/api/submissions")
def api_list_submissions(status: Optional[str] = None) -> dict:
    rows = ingest_module.list_submissions(status=status, submissions_path=SUBMISSIONS_PATH)
    fields = ("submission_id", "review_status", "offer_type", "make", "model",
              "model_year", "mileage_at_purchase", "term_months", "coverage_tier",
              "price", "source_type")
    return {"count": len(rows), "submissions": [{k: r.get(k) for k in fields} for r in rows]}


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return _INDEX_HTML


def run() -> None:  # pragma: no cover - convenience launcher
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":  # pragma: no cover
    run()


# --- Minimal single-page UI (vanilla JS, no build step) -----------------------
_INDEX_HTML = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Driveway Advocate</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#1c2230}
  h1{margin-bottom:.2rem} .sub{color:#667;margin-top:0}
  fieldset{border:1px solid #d6dae3;border-radius:10px;margin:1.5rem 0;padding:1rem 1.2rem}
  legend{font-weight:600;padding:0 .4rem}
  label{display:block;font-size:.85rem;color:#445;margin:.5rem 0 .15rem}
  input,select{width:100%;padding:.45rem;border:1px solid #c7ccd6;border-radius:6px;font:inherit}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
  button{margin-top:1rem;background:#1558d6;color:#fff;border:0;border-radius:7px;padding:.6rem 1.1rem;font:inherit;cursor:pointer}
  pre{background:#f4f6fb;border:1px solid #e0e5ef;border-radius:8px;padding:1rem;white-space:pre-wrap;overflow:auto}
  .note{font-size:.8rem;color:#778}
</style></head><body>
<h1>Driveway Advocate</h1>
<p class="sub">The "KBB for service contracts." Estimates only — not financial advice.</p>

<fieldset><legend>Is my warranty offer fair?</legend>
  <div class="row">
    <div><label>Year</label><input id="q_year" type="number" value="2021"></div>
    <div><label>Make</label><input id="q_make" value="BMW"></div>
  </div>
  <div class="row">
    <div><label>Model</label><input id="q_model" value="3 Series"></div>
    <div><label>Mileage</label><input id="q_mileage" type="number" value="45000"></div>
  </div>
  <div class="row">
    <div><label>Term (months)</label><input id="q_term" type="number" value="36"></div>
    <div><label>Deductible</label><input id="q_ded" type="number" value="100"></div>
  </div>
  <div class="row">
    <div><label>Coverage tier</label>
      <select id="q_tier">
        <option>powertrain</option><option>powertrain_plus</option>
        <option>stated_component</option><option>comprehensive</option>
        <option selected>exclusionary</option><option>ev_hybrid</option>
      </select></div>
    <div><label>Dealer's offer ($, optional)</label><input id="q_offer" type="number" value="4200"></div>
  </div>
  <button onclick="checkPrice()">Check price</button>
  <pre id="q_out" hidden></pre>
</fieldset>

<fieldset><legend>Show us yours (help the next buyer)</legend>
  <p class="note">Share a real quote or what you paid. It's queued for moderation and never
  affects prices until approved.</p>
  <div class="row">
    <div><label>Offer type</label>
      <select id="s_type">
        <option value="price_paid">price I actually paid</option>
        <option value="dealer_initial">dealer's opening offer</option>
        <option value="outside_quote">outside quote (DTC / credit union)</option>
      </select></div>
    <div><label>Provider</label><input id="s_provider" placeholder="Dealer F&I, olive, ..."></div>
  </div>
  <div class="row">
    <div><label>Year</label><input id="s_year" type="number" value="2021"></div>
    <div><label>Make</label><input id="s_make" value="Toyota"></div>
  </div>
  <div class="row">
    <div><label>Model</label><input id="s_model" value="RAV4"></div>
    <div><label>Mileage</label><input id="s_mileage" type="number" value="40000"></div>
  </div>
  <div class="row">
    <div><label>Term (months)</label><input id="s_term" type="number" value="48"></div>
    <div><label>Deductible</label><input id="s_ded" type="number" value="100"></div>
  </div>
  <div class="row">
    <div><label>Coverage tier</label>
      <select id="s_tier">
        <option>powertrain</option><option>powertrain_plus</option>
        <option>stated_component</option><option>comprehensive</option>
        <option selected>exclusionary</option><option>ev_hybrid</option>
      </select></div>
    <div><label>Price ($ total)</label><input id="s_price" type="number" value="2600"></div>
  </div>
  <button onclick="submitOffer()">Submit my offer</button>
  <pre id="s_out" hidden></pre>
</fieldset>

<script>
async function checkPrice(){
  const body={year:+v('q_year'),make:v('q_make'),model:v('q_model'),
    mileage:+v('q_mileage'),term_months:+v('q_term'),deductible:+v('q_ded'),
    tier:v('q_tier')};
  const off=v('q_offer'); if(off) body.dealer_offer=+off;
  const r=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json(); const o=document.getElementById('q_out'); o.hidden=false;
  if(!r.ok){o.textContent='Error: '+JSON.stringify(d.detail);return;}
  o.textContent=`Risk score: ${d.score.full_score}/100 (${d.score.risk_label})
Fair market: $${d.fair_low.toLocaleString()} – $${d.fair_high.toLocaleString()} (mid $${d.fair_mid.toLocaleString()})
Est. dealer cost: $${d.dealer_cost_est.toLocaleString()}   Target: $${d.negotiation_target.toLocaleString()}
`+(d.verdict?`Verdict: ${d.verdict}\n`:'')+(d.markup_warning?'⚠ '+d.markup_warning+'\n':'')
+`\n${d.recommendation}`;
}
async function submitOffer(){
  const body={offer_type:v('s_type'),provider_name:v('s_provider'),make:v('s_make'),
    model:v('s_model'),model_year:+v('s_year'),mileage:+v('s_mileage'),
    term_months:+v('s_term'),deductible:+v('s_ded'),coverage_tier:v('s_tier'),price:+v('s_price')};
  const r=await fetch('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json(); const o=document.getElementById('s_out'); o.hidden=false;
  o.textContent=r.ok?(d.message+(d.submission_id?` (#${d.submission_id})`:'')):('Could not accept: '+JSON.stringify(d.detail));
}
function v(id){return document.getElementById(id).value.trim();}
</script>
</body></html>"""
