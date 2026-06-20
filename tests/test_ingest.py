"""Tests for the crowdsourced submission ingestion pipeline."""
import csv
import shutil
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pytest

from drivewayadvocate import ingest

SEED = Path(__file__).resolve().parents[1] / "database" / "seed"

INTAKE_HEADER = (
    "offer_type,provider_name,make,model,model_year,trim,mileage,state,term_months,"
    "term_mileage,deductible,coverage_tier,price,monthly,down_payment,submitter_ref,notes\n"
)


@pytest.fixture
def seeds(tmp_path):
    """Temp copies of the submission ledger + observations seed (never touch real files)."""
    subs = tmp_path / "submissions.csv"
    obs = tmp_path / "pricing_observations.csv"
    shutil.copy(SEED / "submissions.csv", subs)
    shutil.copy(SEED / "pricing_observations.csv", obs)
    return subs, obs


def _write_intake(path, *rows):
    path.write_text(INTAKE_HEADER + "".join(r if r.endswith("\n") else r + "\n" for r in rows))
    return path


def test_accepts_valid_rejects_bad(tmp_path, seeds):
    subs, _ = seeds
    intake = _write_intake(
        tmp_path / "intake.csv",
        "price_paid,Toyota dealer,Toyota,RAV4,2022,XLE,30000,CA,48,60000,100,exclusionary,2600,,0,,paid",
        "dealer_initial,Dealer F&I,Jeep,Grand Cherokee,2021,Ltd,55000,MI,48,60000,100,exclusionary,99999,,0,,absurd",
        "price_paid,,Toyota,Camry,2021,LE,30000,,36,,100,,1200,,0,,missing tier",
    )
    report = ingest.ingest(intake, submissions_path=subs, today="2026-06-20")
    assert len(report.accepted) == 1
    assert len(report.rejected) == 2
    # the absurd-price and missing-tier rows are rejected with reasons
    reasons = " ".join(e for _, errs in report.rejected for e in errs)
    assert "price out of range" in reasons
    assert "coverage_tier" in reasons


def test_normalizes_alias_bands_and_per_year(tmp_path, seeds):
    subs, _ = seeds
    intake = _write_intake(
        tmp_path / "intake.csv",
        "price_paid,Toyota dealer,Toyota,RAV4,2022,XLE,30000,CA,48,60000,100,bumper to bumper,2600,,0,,x",
    )
    report = ingest.ingest(intake, submissions_path=subs, today="2026-06-20")
    row = report.accepted[0]
    assert row["coverage_tier"] == "exclusionary"          # alias mapped
    assert row["mileage_band"] == "12001_36000"            # 30k
    assert row["age_band"] == "4_6"                         # 2026-2022 = 4
    assert row["per_year"] == round(2600 * 12 / 48)         # 650
    assert row["source_type"] == "consumer_reported"       # price_paid mapping
    assert row["review_status"] == "pending"


def test_dedupes_against_existing(tmp_path, seeds):
    subs, _ = seeds
    # Seed example #1 is a BMW dealer_initial @ $4800 — resubmitting it must dedupe.
    intake = _write_intake(
        tmp_path / "intake.csv",
        "dealer_initial,Dealer F&I,BMW,3 Series,2021,330i,48000,CA,48,60000,100,exclusionary,4800,,0,,dup",
    )
    report = ingest.ingest(intake, submissions_path=subs, today="2026-06-20")
    assert report.accepted == []
    assert report.duplicates == [1]


def test_dry_run_changes_nothing(tmp_path, seeds):
    subs, _ = seeds
    before = subs.read_text()
    intake = _write_intake(
        tmp_path / "intake.csv",
        "price_paid,Toyota dealer,Toyota,RAV4,2022,XLE,30000,CA,48,60000,100,exclusionary,2600,,0,,x",
    )
    report = ingest.ingest(intake, submissions_path=subs, dry_run=True, today="2026-06-20")
    assert len(report.accepted) == 1
    assert subs.read_text() == before  # ledger untouched


def test_review_approve_and_reject(tmp_path, seeds):
    subs, _ = seeds
    ingest.review(approve_ids=[1], reject_ids=[2], submissions_path=subs)
    rows = {int(r["submission_id"]): r["review_status"] for r in csv.DictReader(subs.open())}
    assert rows[1] == "approved"
    assert rows[2] == "rejected"
    assert rows[3] == "pending"


def test_promote_maps_and_flips_status(tmp_path, seeds, conn):
    subs, obs = seeds
    # Approve the seed example submissions, then promote.
    ingest.review(approve_ids=[1, 2, 3], submissions_path=subs)
    result = ingest.promote(conn, submissions_path=subs, observations_path=obs)
    assert result["promoted"] == 3

    obs_rows = list(csv.DictReader(obs.open()))
    crowdsourced = [r for r in obs_rows if "crowdsourced" in (r["source_url"] or "")]
    assert len(crowdsourced) == 3
    # Seed example #1 is a BMW -> resolves to luxury_sedan; dealer_initial -> dealer_quote.
    bmw = next(r for r in crowdsourced if r["source_url"].endswith("#1"))
    assert bmw["vehicle_class"] == "luxury_sedan"
    assert bmw["source_type"] == "dealer_quote"
    assert bmw["dealer_cost_est"] == ""   # unknown for crowdsourced -> NULL

    statuses = {int(r["submission_id"]): r["review_status"] for r in csv.DictReader(subs.open())}
    assert all(statuses[i] == "promoted" for i in (1, 2, 3))


def test_promote_only_approved(tmp_path, seeds, conn):
    subs, obs = seeds
    # Nothing approved -> nothing promoted.
    result = ingest.promote(conn, submissions_path=subs, observations_path=obs)
    assert result["promoted"] == 0


def test_offer_type_source_and_confidence_mapping():
    for offer_type, source in ingest.OFFER_TYPE_SOURCE.items():
        assert offer_type in ingest.ALLOWED_OFFER_TYPES
        assert source in {"dealer_quote", "consumer_reported", "public_quote"}
        assert ingest.OFFER_TYPE_CONFIDENCE[offer_type] in {"low", "medium", "high"}
