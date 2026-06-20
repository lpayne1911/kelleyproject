"""Tests for the VSC pricing engine."""
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from drivewayadvocate.pricing import (
    BASE_ANNUAL_BY_TIER,
    QuoteRequest,
    price_quote,
    risk_multiplier,
)


def _req(**kw):
    defaults = dict(
        make="Toyota", model="Camry", year=2021, mileage=45000,
        term_months=36, tier="powertrain", deductible=100,
    )
    defaults.update(kw)
    return QuoteRequest(**defaults)


def test_risk_multiplier_bounds_and_monotonic():
    assert risk_multiplier(0) >= 0.55
    assert risk_multiplier(100) <= 1.95
    assert risk_multiplier(20) < risk_multiplier(70)
    # average vehicle (~37 intrinsic) should sit near a 1.0 multiplier
    assert 0.9 <= risk_multiplier(37) <= 1.1


def test_fair_range_is_ordered(conn):
    result = price_quote(_req(), conn)
    assert result.fair_low < result.fair_mid < result.fair_high
    assert result.dealer_cost_est < result.fair_mid


def test_negotiation_target_below_fair_mid(conn):
    result = price_quote(_req(tier="exclusionary"), conn)
    assert result.negotiation_target <= result.fair_mid
    assert result.negotiation_target >= result.dealer_cost_est


def test_luxury_costs_more_than_economy(conn):
    camry = price_quote(_req(make="Toyota", model="Camry", tier="exclusionary"), conn)
    bmw = price_quote(
        _req(make="BMW", model="3 Series", tier="exclusionary"), conn
    )
    assert bmw.fair_mid > camry.fair_mid


def test_higher_mileage_costs_more(conn):
    low = price_quote(_req(mileage=20000, tier="stated_component"), conn)
    high = price_quote(_req(mileage=120000, tier="stated_component"), conn)
    assert high.fair_mid > low.fair_mid


def test_broader_tier_costs_more(conn):
    pt = price_quote(_req(tier="powertrain"), conn)
    excl = price_quote(_req(tier="exclusionary"), conn)
    assert excl.fair_mid > pt.fair_mid
    assert BASE_ANNUAL_BY_TIER["exclusionary"] > BASE_ANNUAL_BY_TIER["powertrain"]


def test_overpriced_offer_flagged(conn):
    # An absurd offer on a Camry powertrain plan must be flagged overpriced + markup.
    result = price_quote(_req(tier="powertrain", dealer_offer=6000), conn)
    assert result.verdict == "OVERPRICED"
    assert result.markup_warning is not None
    assert "DECLINE" in result.recommendation or "NEGOTIATE" in result.recommendation


def test_fair_offer_not_flagged(conn):
    result = price_quote(_req(tier="exclusionary"), conn)
    fair_offer = result.fair_mid  # exactly the mid is within fair range
    result2 = price_quote(_req(tier="exclusionary", dealer_offer=fair_offer), conn)
    assert result2.verdict == "FAIR"
    assert result2.markup_warning is None


def test_low_risk_vehicle_recommendation_mentions_optional(conn):
    # Camry with no offer: reliable => coverage optional.
    result = price_quote(_req(make="Toyota", model="Camry", mileage=30000), conn)
    assert "OPTIONAL" in result.recommendation.upper()


def test_blending_uses_observations(conn):
    # Camry has seed observations for powertrain => blended confidence.
    result = price_quote(_req(make="Toyota", model="Camry", tier="powertrain"), conn)
    assert result.observed_n >= 1
    assert result.confidence == "blended"


def test_to_dict_is_json_serializable(conn):
    import json
    result = price_quote(_req(dealer_offer=2000), conn)
    json.dumps(result.to_dict())  # must not raise
