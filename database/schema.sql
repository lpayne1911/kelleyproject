-- Driveway Advocate — Vehicle Service Contract (VSC) pricing database
-- Target: SQLite 3.  Build with: python -m drivewayadvocate.db --build
--
-- Conventions:
--   * source_type ∈ (verified, public_quote, dealer_quote, consumer_reported,
--                     estimated, assumption)
--   * confidence  ∈ (high, medium, low)
--   * All monetary values are USD whole dollars unless noted.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Reference / lookup tables
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS pricing_observations;
DROP TABLE IF EXISTS vehicle_risk_scores;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS coverage_tiers;
DROP TABLE IF EXISTS mileage_bands;
DROP TABLE IF EXISTS age_bands;

CREATE TABLE coverage_tiers (
    tier_key          TEXT PRIMARY KEY,           -- e.g. 'exclusionary'
    name              TEXT NOT NULL,
    coverage_model    TEXT NOT NULL,              -- 'stated_component' | 'exclusionary' | 'supplemental' | 'add_on'
    description       TEXT,
    exclusionary_flag INTEGER NOT NULL DEFAULT 0, -- 1 if bumper-to-bumper/exclusionary
    typical_annual_low  INTEGER,
    typical_annual_high INTEGER,
    relative_rank     INTEGER                      -- 1 (cheapest) .. n (most expensive)
);

CREATE TABLE mileage_bands (
    band_key   TEXT PRIMARY KEY,                  -- e.g. '60001_85000'
    label      TEXT NOT NULL,                     -- '60,001-85,000'
    min_miles  INTEGER NOT NULL,
    max_miles  INTEGER,                           -- NULL = open-ended
    risk_score INTEGER NOT NULL,                  -- 0-100, feeds scoring model
    price_mult REAL    NOT NULL                   -- multiplier used by pricing engine
);

CREATE TABLE age_bands (
    band_key   TEXT PRIMARY KEY,                  -- e.g. '7_10'
    label      TEXT NOT NULL,
    min_years  INTEGER NOT NULL,
    max_years  INTEGER,                           -- NULL = open-ended
    risk_score INTEGER NOT NULL,
    price_mult REAL    NOT NULL
);

-- ---------------------------------------------------------------------------
-- Providers
-- ---------------------------------------------------------------------------

CREATE TABLE providers (
    provider_id            INTEGER PRIMARY KEY,
    name                   TEXT NOT NULL UNIQUE,
    provider_type          TEXT NOT NULL,         -- 'oem' | 'third_party' | 'dealer_admin' | 'credit_union'
    channel                TEXT NOT NULL,         -- 'oem' | 'dtc' | 'dealer' | 'credit_union'
    business_role          TEXT NOT NULL,         -- 'administrator' | 'broker' | 'insurer' | 'oem'
    self_administers       INTEGER DEFAULT 0,     -- 1/0
    publishes_quotes_online INTEGER DEFAULT 0,    -- 1/0
    am_best_backer         TEXT,                  -- insurer backing the CLIP, if known
    bbb_rating             TEXT,
    review_score           REAL,                  -- 0-5 consumer review aggregate
    source_type            TEXT,
    confidence             TEXT,
    notes                  TEXT
);

-- ---------------------------------------------------------------------------
-- Vehicles + risk scores
-- ---------------------------------------------------------------------------

CREATE TABLE vehicles (
    vehicle_id    INTEGER PRIMARY KEY,
    year          INTEGER,
    make          TEXT NOT NULL,
    model         TEXT NOT NULL,
    trim          TEXT,
    vehicle_class TEXT,                           -- 'sedan_economy','sedan_midsize','suv_compact','truck_fullsize','luxury_sedan','ev', ...
    segment       TEXT,                           -- 'economy' | 'mainstream' | 'luxury' | 'performance'
    luxury_flag   INTEGER DEFAULT 0,
    powertrain    TEXT,                           -- 'ice' | 'hybrid' | 'phev' | 'ev'
    turbo_flag    INTEGER DEFAULT 0,
    drivetrain    TEXT,                           -- 'fwd' | 'rwd' | 'awd' | '4wd'
    UNIQUE (year, make, model, trim)
);

CREATE TABLE vehicle_risk_scores (
    vehicle_id             INTEGER PRIMARY KEY REFERENCES vehicles(vehicle_id),
    brand_repair_cost      INTEGER NOT NULL,      -- the 8 intrinsic components, 0-100
    model_reliability      INTEGER NOT NULL,
    powertrain_complexity  INTEGER NOT NULL,
    electronics_complexity INTEGER NOT NULL,
    known_failure_points   INTEGER NOT NULL,
    luxury_parts_cost      INTEGER NOT NULL,
    hybrid_ev_components    INTEGER NOT NULL,
    claims_likelihood      INTEGER NOT NULL,
    reference_total        INTEGER NOT NULL,      -- score_full at 36k mi / 3 yr (1-100)
    source_type            TEXT,
    confidence             TEXT,
    notes                  TEXT
);

-- ---------------------------------------------------------------------------
-- Central fact table: pricing observations
-- ---------------------------------------------------------------------------

CREATE TABLE pricing_observations (
    obs_id          INTEGER PRIMARY KEY,
    provider_id     INTEGER REFERENCES providers(provider_id),
    vehicle_id      INTEGER REFERENCES vehicles(vehicle_id),  -- nullable: class-level obs allowed
    vehicle_class   TEXT,                          -- used when vehicle_id is NULL
    obs_year        INTEGER,                       -- model year priced
    mileage_at_purchase INTEGER,
    mileage_band    TEXT REFERENCES mileage_bands(band_key),
    age_band        TEXT REFERENCES age_bands(band_key),
    term_months     INTEGER,
    term_mileage    INTEGER,
    deductible      INTEGER,
    coverage_tier   TEXT REFERENCES coverage_tiers(tier_key),
    retail_price    INTEGER,                       -- total contract retail (USD)
    dealer_cost_est INTEGER,                       -- estimated wholesale cost
    markup_est      INTEGER,                       -- retail - dealer_cost_est
    monthly_est     INTEGER,                       -- est. monthly payment
    down_payment    INTEGER,
    state           TEXT,
    source_type     TEXT NOT NULL,
    confidence      TEXT NOT NULL,
    source_url      TEXT,
    date_collected  TEXT,                          -- ISO date
    notes           TEXT
);

CREATE INDEX idx_obs_vehicle ON pricing_observations(vehicle_id);
CREATE INDEX idx_obs_tier     ON pricing_observations(coverage_tier);
CREATE INDEX idx_obs_class    ON pricing_observations(vehicle_class);

-- ---------------------------------------------------------------------------
-- Crowdsourced submissions ("show us yours")
-- ---------------------------------------------------------------------------
-- Raw, moderated intake of real offers/prices from people. Rows flow:
--   pending -> approved/rejected (review) -> promoted (copied to pricing_observations)
-- The pricing engine only ever reads pricing_observations, so unmoderated
-- crowdsourced data can never silently enter the fair-price math.

CREATE TABLE submissions (
    submission_id   INTEGER PRIMARY KEY,
    date_submitted  TEXT,                          -- ISO date
    submitter_ref   TEXT,                          -- optional anonymized handle/contact
    offer_type      TEXT NOT NULL,                 -- 'dealer_initial' | 'price_paid' | 'outside_quote'
    provider_name   TEXT,
    make            TEXT NOT NULL,
    model           TEXT NOT NULL,
    model_year      INTEGER,
    trim            TEXT,
    mileage_at_purchase INTEGER,
    mileage_band    TEXT REFERENCES mileage_bands(band_key),
    age_band        TEXT REFERENCES age_bands(band_key),
    state           TEXT,
    term_months     INTEGER,
    term_mileage    INTEGER,
    deductible      INTEGER,
    coverage_tier   TEXT REFERENCES coverage_tiers(tier_key),
    price           INTEGER,                        -- the quoted/paid price (USD)
    per_year        INTEGER,                        -- normalized price per year
    monthly         INTEGER,
    down_payment    INTEGER,
    source_type     TEXT,                           -- derived from offer_type
    confidence      TEXT,
    review_status   TEXT NOT NULL DEFAULT 'pending',-- pending|approved|rejected|promoted
    dedupe_key      TEXT,                           -- stable hash to prevent re-ingest
    notes           TEXT
);

CREATE INDEX idx_sub_status ON submissions(review_status);
CREATE INDEX idx_sub_dedupe ON submissions(dedupe_key);

-- ---------------------------------------------------------------------------
-- Views: aggregate observations into fair-price ranges
-- ---------------------------------------------------------------------------

-- Per vehicle_class + tier: low/mid/high retail (per-year-normalized then summarized).
-- Excludes dealer_quote rows from the "fair" aggregate (those are marked-up offers).
DROP VIEW IF EXISTS v_fair_price_by_class_tier;
CREATE VIEW v_fair_price_by_class_tier AS
SELECT
    COALESCE(v.vehicle_class, o.vehicle_class) AS vehicle_class,
    o.coverage_tier,
    COUNT(*)                                   AS n_obs,
    MIN(o.retail_price)                        AS retail_low,
    CAST(AVG(o.retail_price) AS INTEGER)       AS retail_mid,
    MAX(o.retail_price)                        AS retail_high,
    CAST(AVG(o.retail_price * 12.0 / NULLIF(o.term_months,0)) AS INTEGER) AS avg_per_year
FROM pricing_observations o
LEFT JOIN vehicles v ON v.vehicle_id = o.vehicle_id
WHERE o.source_type <> 'dealer_quote'
GROUP BY COALESCE(v.vehicle_class, o.vehicle_class), o.coverage_tier;
