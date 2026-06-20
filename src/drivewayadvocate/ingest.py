"""Crowdsourced submission ingestion pipeline ("show us yours").

Flow:
    intake CSV  --ingest-->  submissions (pending)
                --review-->  approved / rejected
                --promote--> pricing_observations (canonical, used by the engine)

Untrusted crowdsourced data is held in the ``submissions`` ledger until a reviewer
approves it; only ``promote`` copies it into ``pricing_observations``, so it can never
silently affect a price estimate.

All file-mutating functions take explicit paths (defaulting to the repo seed CSVs) so
tests can run against temporary copies.
"""
from __future__ import annotations

import csv
import datetime as _dt
import hashlib
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Optional

from .db import SEED_DIR
from .pricing import CURRENT_YEAR

SUBMISSIONS_SEED = SEED_DIR / "submissions.csv"
OBSERVATIONS_SEED = SEED_DIR / "pricing_observations.csv"
MILEAGE_BANDS_SEED = SEED_DIR / "mileage_bands.csv"
AGE_BANDS_SEED = SEED_DIR / "age_bands.csv"
COVERAGE_TIERS_SEED = SEED_DIR / "coverage_tiers.csv"

# --- Submission semantics -----------------------------------------------------
ALLOWED_OFFER_TYPES = {"dealer_initial", "price_paid", "outside_quote"}
OFFER_TYPE_SOURCE = {
    "dealer_initial": "dealer_quote",      # opening offer = marked-up anchor (excluded from fair)
    "price_paid": "consumer_reported",     # what they actually paid = best fair signal
    "outside_quote": "public_quote",       # DTC/credit-union quote = competitive floor
}
OFFER_TYPE_CONFIDENCE = {
    "dealer_initial": "low",
    "price_paid": "medium",
    "outside_quote": "medium",
}

# Friendly coverage-tier phrases people actually type -> canonical tier_key.
TIER_ALIASES = {
    "bumper to bumper": "exclusionary", "bumper-to-bumper": "exclusionary",
    "b2b": "exclusionary", "exclusionary": "exclusionary",
    "drivetrain": "powertrain", "power train": "powertrain", "powertrain": "powertrain",
    "powertrain plus": "powertrain_plus", "powertrain+": "powertrain_plus",
    "stated": "stated_component", "stated component": "stated_component",
    "named component": "stated_component",
    "high tech": "high_tech", "high-tech": "high_tech", "electrical": "high_tech",
    "comprehensive": "comprehensive",
    "ev": "ev_hybrid", "hybrid": "ev_hybrid", "ev/hybrid": "ev_hybrid",
    "certified pre-owned": "cpo", "cpo": "cpo", "wrap": "wrap",
}

# Plausibility bounds for validation.
MIN_YEAR, MAX_YEAR = 1990, CURRENT_YEAR + 1
MAX_MILEAGE = 400_000
MIN_TERM, MAX_TERM = 1, 120
MIN_PRICE, MAX_PRICE = 50, 40_000

REQUIRED_FIELDS = ("offer_type", "make", "model", "model_year", "mileage",
                   "term_months", "coverage_tier", "price")

SUBMISSION_COLUMNS = [
    "submission_id", "date_submitted", "submitter_ref", "offer_type", "provider_name",
    "make", "model", "model_year", "trim", "mileage_at_purchase", "mileage_band",
    "age_band", "state", "term_months", "term_mileage", "deductible", "coverage_tier",
    "price", "per_year", "monthly", "down_payment", "source_type", "confidence",
    "review_status", "dedupe_key", "notes",
]
OBSERVATION_COLUMNS = [
    "obs_id", "provider_id", "vehicle_id", "vehicle_class", "obs_year",
    "mileage_at_purchase", "mileage_band", "age_band", "term_months", "term_mileage",
    "deductible", "coverage_tier", "retail_price", "dealer_cost_est", "markup_est",
    "monthly_est", "down_payment", "state", "source_type", "confidence", "source_url",
    "date_collected", "notes",
]


# --- CSV helpers --------------------------------------------------------------
def read_csv_dicts(path: Path) -> list[dict]:
    if not Path(path).exists():
        return []
    with Path(path).open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def write_csv_dicts(path: Path, columns: list[str], rows: Iterable[dict]) -> None:
    with Path(path).open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({c: ("" if row.get(c) is None else row.get(c)) for c in columns})


# --- Band / tier lookups (sourced from the seed CSVs) -------------------------
def _load_bands(path: Path, min_col: str, max_col: str) -> list[tuple[str, int, Optional[int]]]:
    bands = []
    for r in read_csv_dicts(path):
        lo = int(r[min_col])
        hi = int(r[max_col]) if r[max_col] not in (None, "") else None
        bands.append((r["band_key"], lo, hi))
    return bands


def band_key_for(value: int, bands: list[tuple[str, int, Optional[int]]]) -> Optional[str]:
    for key, lo, hi in bands:
        if value >= lo and (hi is None or value <= hi):
            return key
    return None


def load_known_tiers(seed_dir: Path = SEED_DIR) -> set:
    return {r["tier_key"] for r in read_csv_dicts(Path(seed_dir) / "coverage_tiers.csv")}


def resolve_tier(raw: str) -> Optional[str]:
    if raw is None:
        return None
    key = raw.strip().lower()
    return TIER_ALIASES.get(key, key if key else None)


# --- Validation & normalization ----------------------------------------------
def _to_int(value) -> Optional[int]:
    if value is None or str(value).strip() == "":
        return None
    return int(float(str(value).replace(",", "").replace("$", "").strip()))


def validate_row(raw: dict, known_tiers: set) -> list[str]:
    """Return a list of human-readable validation errors (empty == valid)."""
    errors: list[str] = []

    for field_name in REQUIRED_FIELDS:
        if raw.get(field_name) in (None, ""):
            errors.append(f"missing required field '{field_name}'")
    if errors:
        return errors  # don't bother parsing if required fields are absent

    if raw["offer_type"].strip() not in ALLOWED_OFFER_TYPES:
        errors.append(
            f"offer_type '{raw['offer_type']}' not in {sorted(ALLOWED_OFFER_TYPES)}"
        )

    tier = resolve_tier(raw["coverage_tier"])
    if tier not in known_tiers:
        errors.append(f"unknown coverage_tier '{raw['coverage_tier']}'")

    try:
        year = _to_int(raw["model_year"])
        if year is None or not (MIN_YEAR <= year <= MAX_YEAR):
            errors.append(f"model_year out of range [{MIN_YEAR}-{MAX_YEAR}]: {raw['model_year']}")
    except ValueError:
        errors.append(f"model_year not a number: {raw['model_year']}")

    try:
        mileage = _to_int(raw["mileage"])
        if mileage is None or not (0 <= mileage <= MAX_MILEAGE):
            errors.append(f"mileage out of range [0-{MAX_MILEAGE}]: {raw['mileage']}")
    except ValueError:
        errors.append(f"mileage not a number: {raw['mileage']}")

    try:
        term = _to_int(raw["term_months"])
        if term is None or not (MIN_TERM <= term <= MAX_TERM):
            errors.append(f"term_months out of range [{MIN_TERM}-{MAX_TERM}]: {raw['term_months']}")
    except ValueError:
        errors.append(f"term_months not a number: {raw['term_months']}")

    try:
        price = _to_int(raw["price"])
        if price is None or not (MIN_PRICE <= price <= MAX_PRICE):
            errors.append(f"price out of range [{MIN_PRICE}-{MAX_PRICE}]: {raw['price']}")
    except ValueError:
        errors.append(f"price not a number: {raw['price']}")

    deductible = raw.get("deductible")
    if deductible not in (None, ""):
        try:
            if _to_int(deductible) < 0:
                errors.append("deductible must be >= 0")
        except ValueError:
            errors.append(f"deductible not a number: {deductible}")

    return errors


def compute_dedupe_key(norm: dict) -> str:
    parts = [
        norm.get("offer_type", ""),
        str(norm.get("make", "")).lower(),
        str(norm.get("model", "")).lower(),
        str(norm.get("model_year", "")),
        str(norm.get("mileage_at_purchase", "")),
        str(norm.get("term_months", "")),
        str(norm.get("deductible", "")),
        str(norm.get("coverage_tier", "")),
        str(norm.get("price", "")),
        str(norm.get("provider_name", "")).lower(),
    ]
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:16]


def normalize_row(
    raw: dict,
    mileage_bands: list,
    age_bands: list,
    *,
    today: Optional[str] = None,
) -> dict:
    """Turn a validated intake row into a submissions-table row (no submission_id yet)."""
    offer_type = raw["offer_type"].strip()
    tier = resolve_tier(raw["coverage_tier"])
    year = _to_int(raw["model_year"])
    mileage = _to_int(raw["mileage"])
    term = _to_int(raw["term_months"])
    price = _to_int(raw["price"])
    deductible = _to_int(raw.get("deductible")) if raw.get("deductible") not in (None, "") else 100
    age = max(0, CURRENT_YEAR - year)

    norm = {
        "date_submitted": today or _dt.date.today().isoformat(),
        "submitter_ref": (raw.get("submitter_ref") or "").strip() or None,
        "offer_type": offer_type,
        "provider_name": (raw.get("provider_name") or "").strip() or None,
        "make": raw["make"].strip(),
        "model": raw["model"].strip(),
        "model_year": year,
        "trim": (raw.get("trim") or "").strip() or None,
        "mileage_at_purchase": mileage,
        "mileage_band": band_key_for(mileage, mileage_bands),
        "age_band": band_key_for(age, age_bands),
        "state": (raw.get("state") or "").strip() or None,
        "term_months": term,
        "term_mileage": _to_int(raw.get("term_mileage")),
        "deductible": deductible,
        "coverage_tier": tier,
        "price": price,
        "per_year": round(price * 12 / term),
        "monthly": _to_int(raw.get("monthly")),
        "down_payment": _to_int(raw.get("down_payment")) or 0,
        "source_type": OFFER_TYPE_SOURCE[offer_type],
        "confidence": OFFER_TYPE_CONFIDENCE[offer_type],
        "review_status": "pending",
        "notes": (raw.get("notes") or "").strip() or None,
    }
    norm["dedupe_key"] = compute_dedupe_key(norm)
    return norm


# --- Ingest -------------------------------------------------------------------
@dataclass
class IngestReport:
    accepted: list[dict] = field(default_factory=list)
    rejected: list[tuple[int, list[str]]] = field(default_factory=list)  # (row_no, errors)
    duplicates: list[int] = field(default_factory=list)                  # row numbers
    total: int = 0

    def summary(self) -> str:
        return (
            f"{self.total} rows: {len(self.accepted)} accepted, "
            f"{len(self.duplicates)} duplicate, {len(self.rejected)} rejected"
        )


def _next_id(rows: list[dict], id_col: str) -> int:
    ids = [int(r[id_col]) for r in rows if r.get(id_col) not in (None, "")]
    return (max(ids) + 1) if ids else 1


def ingest(
    intake_path: Path,
    *,
    submissions_path: Path = SUBMISSIONS_SEED,
    seed_dir: Path = SEED_DIR,
    dry_run: bool = False,
    today: Optional[str] = None,
) -> IngestReport:
    """Validate + normalize an intake CSV and append accepted rows to the ledger."""
    mileage_bands = _load_bands(Path(seed_dir) / "mileage_bands.csv", "min_miles", "max_miles")
    age_bands = _load_bands(Path(seed_dir) / "age_bands.csv", "min_years", "max_years")
    known_tiers = load_known_tiers(seed_dir)

    existing = read_csv_dicts(submissions_path)
    # Recompute the dedupe key from each existing row's fields so dedup is robust even
    # if a stored key is a placeholder; also keep any stored key as a fallback.
    seen_keys = {compute_dedupe_key(r) for r in existing}
    seen_keys.update(r.get("dedupe_key") for r in existing if r.get("dedupe_key"))

    report = IngestReport()
    new_rows: list[dict] = []
    next_id = _next_id(existing, "submission_id")

    for i, raw in enumerate(read_csv_dicts(intake_path), start=1):
        report.total += 1
        errors = validate_row(raw, known_tiers)
        if errors:
            report.rejected.append((i, errors))
            continue
        norm = normalize_row(raw, mileage_bands, age_bands, today=today)
        if norm["dedupe_key"] in seen_keys:
            report.duplicates.append(i)
            continue
        seen_keys.add(norm["dedupe_key"])
        norm["submission_id"] = next_id
        next_id += 1
        report.accepted.append(norm)
        new_rows.append(norm)

    if not dry_run and new_rows:
        write_csv_dicts(submissions_path, SUBMISSION_COLUMNS, existing + new_rows)

    return report


# --- Review -------------------------------------------------------------------
def review(
    approve_ids: Iterable[int] = (),
    reject_ids: Iterable[int] = (),
    *,
    submissions_path: Path = SUBMISSIONS_SEED,
) -> dict:
    """Set review_status for the given submission ids. Returns counts changed."""
    approve = {int(i) for i in approve_ids}
    reject = {int(i) for i in reject_ids}
    rows = read_csv_dicts(submissions_path)
    changed = {"approved": 0, "rejected": 0}
    for r in rows:
        sid = int(r["submission_id"])
        if sid in approve and r["review_status"] != "promoted":
            r["review_status"] = "approved"
            changed["approved"] += 1
        elif sid in reject and r["review_status"] != "promoted":
            r["review_status"] = "rejected"
            changed["rejected"] += 1
    if changed["approved"] or changed["rejected"]:
        write_csv_dicts(submissions_path, SUBMISSION_COLUMNS, rows)
    return changed


def list_submissions(
    status: Optional[str] = None, *, submissions_path: Path = SUBMISSIONS_SEED
) -> list[dict]:
    rows = read_csv_dicts(submissions_path)
    if status is not None:
        rows = [r for r in rows if r["review_status"] == status]
    return rows


# --- Promote ------------------------------------------------------------------
def _resolve_provider(conn: sqlite3.Connection, name: Optional[str]) -> Optional[int]:
    if not name:
        return None
    row = conn.execute(
        "SELECT provider_id FROM providers WHERE LOWER(name) = LOWER(?)", [name]
    ).fetchone()
    return row[0] if row else None


def _resolve_vehicle(
    conn: sqlite3.Connection, make: str, model: str, year: Optional[int]
) -> tuple[Optional[int], Optional[str]]:
    row = conn.execute(
        "SELECT vehicle_id, vehicle_class FROM vehicles "
        "WHERE LOWER(make)=LOWER(?) AND LOWER(model)=LOWER(?) "
        "ORDER BY (year = ?) DESC, year DESC LIMIT 1",
        [make, model, year],
    ).fetchone()
    if row is None:
        return None, None
    return row[0], row[1]


def _submission_to_observation(sub: dict, obs_id: int, conn: sqlite3.Connection) -> dict:
    year = _to_int(sub.get("model_year"))
    provider_id = _resolve_provider(conn, sub.get("provider_name"))
    vehicle_id, vehicle_class = _resolve_vehicle(conn, sub["make"], sub["model"], year)
    note = (sub.get("notes") or "").strip()
    note = (note + " [crowdsourced]").strip()
    return {
        "obs_id": obs_id,
        "provider_id": provider_id,
        "vehicle_id": vehicle_id,
        "vehicle_class": vehicle_class,
        "obs_year": year,
        "mileage_at_purchase": _to_int(sub.get("mileage_at_purchase")),
        "mileage_band": sub.get("mileage_band"),
        "age_band": sub.get("age_band"),
        "term_months": _to_int(sub.get("term_months")),
        "term_mileage": _to_int(sub.get("term_mileage")),
        "deductible": _to_int(sub.get("deductible")),
        "coverage_tier": sub.get("coverage_tier"),
        "retail_price": _to_int(sub.get("price")),
        "dealer_cost_est": None,   # unknown for crowdsourced data
        "markup_est": None,
        "monthly_est": _to_int(sub.get("monthly")),
        "down_payment": _to_int(sub.get("down_payment")) or 0,
        "state": sub.get("state"),
        "source_type": sub.get("source_type"),
        "confidence": sub.get("confidence"),
        "source_url": f"crowdsourced submission #{sub.get('submission_id')}",
        "date_collected": sub.get("date_submitted"),
        "notes": note,
    }


def promote(
    conn: sqlite3.Connection,
    *,
    submissions_path: Path = SUBMISSIONS_SEED,
    observations_path: Path = OBSERVATIONS_SEED,
    ids: Optional[Iterable[int]] = None,
) -> dict:
    """Copy approved submissions into pricing_observations; mark them promoted.

    ``conn`` is a built DB used only to resolve provider/vehicle references.
    If ``ids`` is given, only those submissions are promoted (must be approved).
    """
    target_ids = {int(i) for i in ids} if ids is not None else None
    subs = read_csv_dicts(submissions_path)
    obs = read_csv_dicts(observations_path)
    next_obs_id = _next_id(obs, "obs_id")

    promoted = 0
    new_obs: list[dict] = []
    for s in subs:
        sid = int(s["submission_id"])
        if s["review_status"] != "approved":
            continue
        if target_ids is not None and sid not in target_ids:
            continue
        new_obs.append(_submission_to_observation(s, next_obs_id, conn))
        next_obs_id += 1
        s["review_status"] = "promoted"
        promoted += 1

    if promoted:
        write_csv_dicts(observations_path, OBSERVATION_COLUMNS, obs + new_obs)
        write_csv_dicts(submissions_path, SUBMISSION_COLUMNS, subs)

    return {"promoted": promoted}
