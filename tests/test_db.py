"""Tests for the database builder and schema integrity."""
import sqlite3
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from drivewayadvocate import db as db_module

EXPECTED_COUNTS = {
    "coverage_tiers": 12,
    "mileage_bands": 8,
    "age_bands": 5,
    "providers": 17,
    "vehicles": 15,
    "vehicle_risk_scores": 15,
    "pricing_observations": 32,
}


def test_build_to_file(tmp_path):
    db_path = tmp_path / "vsc.db"
    returned = db_module.build_database(db_path)
    assert returned == db_path
    assert db_path.exists()

    conn = db_module.connect(db_path)
    try:
        for table, expected in EXPECTED_COUNTS.items():
            n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            assert n == expected, f"{table}: {n} != {expected}"
    finally:
        conn.close()


def test_rebuild_overwrites(tmp_path):
    db_path = tmp_path / "vsc.db"
    db_module.build_database(db_path)
    first = db_path.stat().st_mtime_ns
    # Rebuilding must not raise (drops tables first) and must reseed cleanly.
    db_module.build_database(db_path)
    conn = db_module.connect(db_path)
    try:
        n = conn.execute("SELECT COUNT(*) FROM pricing_observations").fetchone()[0]
        assert n == EXPECTED_COUNTS["pricing_observations"]
    finally:
        conn.close()
    assert db_path.exists()
    assert isinstance(first, int)


def test_in_memory_build_has_rows():
    conn = db_module.build_in_memory()
    try:
        for table, expected in EXPECTED_COUNTS.items():
            n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            assert n == expected
    finally:
        conn.close()


def test_foreign_keys_valid(conn):
    violations = conn.execute("PRAGMA foreign_key_check").fetchall()
    assert violations == [], f"FK violations: {violations}"


def test_empty_csv_cell_becomes_null(conn):
    # obs 16 (Tesla ESA) intentionally has a blank dealer_cost_est -> SQL NULL.
    row = conn.execute(
        "SELECT dealer_cost_est, markup_est FROM pricing_observations WHERE obs_id = 16"
    ).fetchone()
    assert row["dealer_cost_est"] is None
    assert row["markup_est"] is None


def test_view_excludes_dealer_quotes(conn):
    # A marked-up dealer_quote (obs 12: BMW $4800) must not inflate the fair aggregate.
    agg = conn.execute(
        "SELECT retail_high FROM v_fair_price_by_class_tier "
        "WHERE vehicle_class = 'luxury_sedan' AND coverage_tier = 'exclusionary'"
    ).fetchone()
    assert agg is not None
    # 4800 (dealer_quote) and 6200 (dealer_quote) are excluded; max fair obs is 4300.
    assert agg["retail_high"] <= 4300


def test_connect_enables_foreign_keys(tmp_path):
    db_path = tmp_path / "vsc.db"
    db_module.build_database(db_path)
    conn = db_module.connect(db_path)
    try:
        assert conn.execute("PRAGMA foreign_keys").fetchone()[0] == 1
        assert conn.row_factory is sqlite3.Row
    finally:
        conn.close()
