"""Tests for the command-line interface."""
import json
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pytest

from drivewayadvocate import cli

BASE_ARGS = [
    "quote", "--year", "2021", "--make", "BMW", "--model", "3 Series",
    "--mileage", "45000", "--term-months", "36", "--tier", "exclusionary",
]


def test_quote_report_output(capsys):
    rc = cli.main(BASE_ARGS + ["--dealer-offer", "4200"])
    out = capsys.readouterr().out
    assert rc == 0
    assert "ADVOCACY REPORT" in out
    assert "BMW 3 Series" in out
    assert "Risk score" in out
    assert "Fair market" in out
    assert "RECOMMENDATION" in out


def test_quote_json_output(capsys):
    rc = cli.main(BASE_ARGS + ["--dealer-offer", "4200", "--json"])
    out = capsys.readouterr().out
    assert rc == 0
    data = json.loads(out)
    assert "fair_mid" in data
    assert "recommendation" in data
    assert data["score"]["full_score"] >= 1


def test_overpriced_offer_shows_markup_warning(capsys):
    # Absurd offer on a low-risk Camry powertrain plan -> markup warning + NEGOTIATE.
    rc = cli.main([
        "quote", "--make", "Toyota", "--model", "Camry", "--year", "2021",
        "--mileage", "45000", "--term-months", "36", "--tier", "powertrain",
        "--dealer-offer", "6000",
    ])
    out = capsys.readouterr().out
    assert rc == 0
    assert "High markup" in out


def test_bad_input_exits_nonzero(capsys):
    rc = cli.main([
        "quote", "--make", "Toyota", "--model", "Camry",
        "--mileage", "45000", "--term-months", "0", "--tier", "powertrain",
    ])
    err = capsys.readouterr().err
    assert rc == 2
    assert "term_months" in err


def test_missing_db_falls_back_to_in_memory(capsys, tmp_path):
    missing = tmp_path / "does_not_exist.db"
    rc = cli.main(BASE_ARGS + ["--db", str(missing)])
    captured = capsys.readouterr()
    assert rc == 0
    assert "ADVOCACY REPORT" in captured.out
    assert "in-memory" in captured.err  # note about the fallback


def test_unknown_tier_proxy_note(capsys):
    rc = cli.main([
        "quote", "--make", "Toyota", "--model", "Camry", "--year", "2021",
        "--mileage", "45000", "--term-months", "36", "--tier", "made_up_tier",
    ])
    out = capsys.readouterr().out
    assert rc == 0
    assert "Unknown coverage tier" in out
