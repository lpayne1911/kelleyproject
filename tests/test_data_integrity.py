"""Seed-data integrity tests and code/CSV anti-drift checks."""
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pytest

from drivewayadvocate import pricing, scoring

ALLOWED_SOURCE_TYPES = {
    "verified", "public_quote", "dealer_quote", "consumer_reported",
    "estimated", "assumption",
}
ALLOWED_CONFIDENCE = {"high", "medium", "low"}

LABELED_TABLES = ["providers", "vehicle_risk_scores", "pricing_observations"]


@pytest.mark.parametrize("table", LABELED_TABLES)
def test_source_type_and_confidence_labels(conn, table):
    for row in conn.execute(f"SELECT source_type, confidence FROM {table}"):
        if row["source_type"] is not None:
            assert row["source_type"] in ALLOWED_SOURCE_TYPES, row["source_type"]
        if row["confidence"] is not None:
            assert row["confidence"] in ALLOWED_CONFIDENCE, row["confidence"]


def test_pricing_observations_always_labeled(conn):
    # source_type / confidence are NOT NULL in the schema, but assert anyway.
    n_bad = conn.execute(
        "SELECT COUNT(*) FROM pricing_observations "
        "WHERE source_type IS NULL OR confidence IS NULL"
    ).fetchone()[0]
    assert n_bad == 0


def test_markup_arithmetic(conn):
    rows = conn.execute(
        "SELECT obs_id, retail_price, dealer_cost_est, markup_est "
        "FROM pricing_observations "
        "WHERE retail_price IS NOT NULL AND dealer_cost_est IS NOT NULL "
        "AND markup_est IS NOT NULL"
    ).fetchall()
    assert rows  # there should be some
    for r in rows:
        assert r["retail_price"] - r["dealer_cost_est"] == r["markup_est"], r["obs_id"]


def test_band_and_tier_references_exist(conn):
    tiers = {r["tier_key"] for r in conn.execute("SELECT tier_key FROM coverage_tiers")}
    miles = {r["band_key"] for r in conn.execute("SELECT band_key FROM mileage_bands")}
    ages = {r["band_key"] for r in conn.execute("SELECT band_key FROM age_bands")}
    for r in conn.execute(
        "SELECT obs_id, coverage_tier, mileage_band, age_band FROM pricing_observations"
    ):
        assert r["coverage_tier"] in tiers, r["obs_id"]
        if r["mileage_band"] is not None:
            assert r["mileage_band"] in miles, r["obs_id"]
        if r["age_band"] is not None:
            assert r["age_band"] in ages, r["obs_id"]


def test_mileage_band_matches_mileage(conn):
    bands = conn.execute(
        "SELECT band_key, min_miles, max_miles FROM mileage_bands"
    ).fetchall()

    def band_for(m):
        for b in bands:
            if m >= b["min_miles"] and (b["max_miles"] is None or m <= b["max_miles"]):
                return b["band_key"]
        return None

    for r in conn.execute(
        "SELECT obs_id, mileage_at_purchase, mileage_band FROM pricing_observations "
        "WHERE mileage_at_purchase IS NOT NULL AND mileage_band IS NOT NULL"
    ):
        assert r["mileage_band"] == band_for(r["mileage_at_purchase"]), r["obs_id"]


def test_risk_score_components_in_range(conn):
    component_cols = list(scoring.INTRINSIC_COMPONENTS)
    for row in conn.execute("SELECT * FROM vehicle_risk_scores"):
        for col in component_cols:
            assert 0 <= row[col] <= 100, (row["vehicle_id"], col, row[col])
        assert 1 <= row["reference_total"] <= 100, row["vehicle_id"]


def test_every_vehicle_has_a_risk_score(conn):
    n = conn.execute(
        "SELECT COUNT(*) FROM vehicles v "
        "LEFT JOIN vehicle_risk_scores s ON s.vehicle_id = v.vehicle_id "
        "WHERE s.vehicle_id IS NULL"
    ).fetchone()[0]
    assert n == 0


# --- Anti-drift: code constants must match the seed band tables ---------------

def test_mileage_band_scores_match_code(conn):
    rows = conn.execute(
        "SELECT max_miles, risk_score, price_mult FROM mileage_bands "
        "ORDER BY min_miles"
    ).fetchall()
    code_scores = [s for _, s in scoring._MILEAGE_BANDS]
    code_mults = [m for _, m in pricing._MILEAGE_MULT]
    assert [r["risk_score"] for r in rows] == code_scores
    assert [r["price_mult"] for r in rows] == code_mults


def test_age_band_scores_match_code(conn):
    rows = conn.execute(
        "SELECT max_years, risk_score, price_mult FROM age_bands ORDER BY min_years"
    ).fetchall()
    code_scores = [s for _, s in scoring._AGE_BANDS]
    code_mults = [m for _, m in pricing._AGE_MULT]
    assert [r["risk_score"] for r in rows] == code_scores
    assert [r["price_mult"] for r in rows] == code_mults
