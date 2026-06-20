"""Tests for the optional FastAPI web layer.

Skipped automatically if the 'web'/'test-web' extra (fastapi + httpx) isn't installed.
"""
import shutil
import sys
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

pytest.importorskip("fastapi")
pytest.importorskip("httpx")
from fastapi.testclient import TestClient  # noqa: E402

from drivewayadvocate import api  # noqa: E402

SEED = Path(__file__).resolve().parents[1] / "database" / "seed"


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Point the app at a temp submissions ledger and force an in-memory DB.
    subs = tmp_path / "submissions.csv"
    shutil.copy(SEED / "submissions.csv", subs)
    monkeypatch.setattr(api, "SUBMISSIONS_PATH", subs)
    monkeypatch.setattr(api, "DB_PATH", tmp_path / "no_such.db")  # missing -> in-memory
    return TestClient(api.app)


def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_index_serves_html(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "text/html" in r.headers["content-type"]
    assert "Driveway Advocate" in r.text


def test_quote_endpoint(client):
    r = client.post("/api/quote", json={
        "year": 2021, "make": "BMW", "model": "3 Series", "mileage": 45000,
        "term_months": 36, "tier": "exclusionary", "dealer_offer": 4200,
    })
    assert r.status_code == 200
    data = r.json()
    assert data["fair_mid"] > 0
    assert data["verdict"] in {"FAIR", "NEGOTIATE", "OVERPRICED"}
    assert data["score"]["full_score"] >= 1
    assert "recommendation" in data


def test_quote_invalid_input_returns_422(client):
    r = client.post("/api/quote", json={
        "make": "Toyota", "model": "Camry", "mileage": 45000,
        "term_months": 0, "tier": "powertrain",
    })
    assert r.status_code == 422


def test_submission_accepted(client):
    r = client.post("/api/submissions", json={
        "offer_type": "price_paid", "provider_name": "Toyota dealer",
        "make": "Toyota", "model": "RAV4", "model_year": 2022, "mileage": 30000,
        "term_months": 48, "coverage_tier": "bumper to bumper", "price": 2600,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "accepted"
    assert isinstance(body["submission_id"], int)
    assert body["review_status"] == "pending"


def test_submission_duplicate(client):
    # Matches seed example #1 (BMW dealer_initial @ 4800) -> duplicate.
    payload = {
        "offer_type": "dealer_initial", "provider_name": "Dealer F&I",
        "make": "BMW", "model": "3 Series", "model_year": 2021, "mileage": 48000,
        "term_months": 48, "deductible": 100, "coverage_tier": "exclusionary",
        "price": 4800,
    }
    r = client.post("/api/submissions", json=payload)
    assert r.status_code == 200
    assert r.json()["status"] == "duplicate"


def test_submission_invalid_returns_422(client):
    r = client.post("/api/submissions", json={
        "offer_type": "dealer_initial", "make": "Jeep", "model": "Grand Cherokee",
        "model_year": 2021, "mileage": 55000, "term_months": 48,
        "coverage_tier": "exclusionary", "price": 99999,
    })
    assert r.status_code == 422
    detail = r.json()["detail"]
    assert any("price out of range" in e for e in detail)


def test_list_submissions(client):
    r = client.get("/api/submissions", params={"status": "pending"})
    assert r.status_code == 200
    body = r.json()
    assert body["count"] >= 3
    assert all(s["review_status"] == "pending" for s in body["submissions"])
