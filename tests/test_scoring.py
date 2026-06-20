"""Tests for the vehicle warranty-risk scoring model."""
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pytest

from drivewayadvocate import scoring
from drivewayadvocate.scoring import (
    REFERENCE_AGE_YEARS,
    REFERENCE_MILEAGE,
    age_score,
    estimate_intrinsic_from_attrs,
    mileage_score,
    score_from_components,
    score_vehicle,
)

ALL_VEHICLES = [
    ("Toyota", "Camry"), ("Honda", "Accord"), ("Ford", "F-150"),
    ("Chevrolet", "Silverado 1500"), ("Toyota", "RAV4"), ("Honda", "CR-V"),
    ("Jeep", "Grand Cherokee"), ("Dodge", "Charger"), ("BMW", "3 Series"),
    ("Mercedes-Benz", "C-Class"), ("Tesla", "Model 3"), ("Hyundai", "Elantra"),
    ("Kia", "Telluride"), ("Nissan", "Altima"), ("Subaru", "Outback"),
]


def test_weights_sum_to_one():
    total = scoring.INTRINSIC_WEIGHT_SUM + scoring.MILEAGE_WEIGHT + scoring.AGE_WEIGHT
    assert total == pytest.approx(1.0)


def test_bands_are_monotonic():
    assert mileage_score(5000) < mileage_score(50000) < mileage_score(140000)
    assert age_score(2) < age_score(8) < age_score(20)


def test_score_bounds():
    low = score_from_components(
        {c: 0 for c in scoring.INTRINSIC_COMPONENTS}, 0, 0
    )
    high = score_from_components(
        {c: 100 for c in scoring.INTRINSIC_COMPONENTS}, 200000, 30
    )
    assert 1 <= low.full_score <= 100
    assert 1 <= high.full_score <= 100
    assert high.full_score > low.full_score
    # Effective ceiling is 99: max mileage-band score is 95 and max age-band score is 90,
    # so an all-100-intrinsic vehicle tops out at 100*0.85 + 95*0.10 + 90*0.05 = 99.
    assert high.full_score == 99


def test_mileage_and_age_increase_score():
    comps = {c: 40 for c in scoring.INTRINSIC_COMPONENTS}
    base = score_from_components(comps, 10000, 2)
    more_miles = score_from_components(comps, 130000, 2)
    more_age = score_from_components(comps, 10000, 14)
    assert more_miles.full_score > base.full_score
    assert more_age.full_score > base.full_score
    # intrinsic score is unaffected by mileage/age
    assert base.intrinsic_score == more_miles.intrinsic_score == more_age.intrinsic_score


def test_db_lookup_matches_reference_total(conn):
    """score_vehicle at reference conditions reproduces stored reference_total (±1)."""
    for make, model in ALL_VEHICLES:
        result = score_vehicle(
            make, model, REFERENCE_MILEAGE, REFERENCE_AGE_YEARS, conn=conn
        )
        assert result.source == "database", f"{make} {model} not found in DB"
        row = conn.execute(
            "SELECT s.reference_total FROM vehicle_risk_scores s "
            "JOIN vehicles v ON v.vehicle_id = s.vehicle_id "
            "WHERE v.make = ? AND v.model = ?",
            [make, model],
        ).fetchone()
        assert abs(result.full_score - row["reference_total"]) <= 1, (
            f"{make} {model}: scored {result.full_score} vs stored {row['reference_total']}"
        )


def test_luxury_scores_higher_than_economy(conn):
    miles, years = 45000, 5
    camry = score_vehicle("Toyota", "Camry", miles, years, conn=conn)
    bmw = score_vehicle("BMW", "3 Series", miles, years, conn=conn)
    jeep = score_vehicle("Jeep", "Grand Cherokee", miles, years, conn=conn)
    assert bmw.full_score > camry.full_score
    assert jeep.full_score > camry.full_score
    # BMW intrinsic risk should be markedly higher than Camry's
    assert bmw.intrinsic_score > camry.intrinsic_score + 30


def test_fallback_heuristic_for_unknown_vehicle(conn):
    # A vehicle not in the DB should still score via the attribute heuristic.
    result = score_vehicle(
        "Lamborghini", "Huracan", 20000, 2, conn=conn,
        segment="luxury", luxury=True, turbo=True, drivetrain="awd",
    )
    assert result.source == "estimated"
    assert 1 <= result.full_score <= 100
    assert result.intrinsic_score > 60  # luxury => high intrinsic risk


def test_ev_attribute_drives_hybrid_ev_component():
    ice = estimate_intrinsic_from_attrs(segment="mainstream", powertrain="ice")
    ev = estimate_intrinsic_from_attrs(segment="mainstream", powertrain="ev")
    assert ev["hybrid_ev_components"] > ice["hybrid_ev_components"]
    assert ev["electronics_complexity"] > ice["electronics_complexity"]
