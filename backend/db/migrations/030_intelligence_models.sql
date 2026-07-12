-- ═══════════════════════════════════════════════════════════
-- Atlas Sanctum — Five Intelligence Models
-- Migration 030: Human Flourishing, Regenerative Economy,
--                Innovation Genesis, Ethical Decision,
--                Ecosystem Intelligence
-- ═══════════════════════════════════════════════════════════
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- MODEL I — HUMAN FLOURISHING ENGINE
-- Decision: "Where is human flourishing increasing or declining?"
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flourishing_snapshots (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id               TEXT NOT NULL,          -- community / city / nation id
    entity_type             TEXT NOT NULL CHECK (entity_type IN ('individual','community','city','nation')),
    entity_name             TEXT NOT NULL,
    -- Input dimensions (0–100 each)
    physical_health         DECIMAL(5,2),
    mental_wellbeing        DECIMAL(5,2),
    education               DECIMAL(5,2),
    employment              DECIMAL(5,2),
    income_mobility         DECIMAL(5,2),
    community_trust         DECIMAL(5,2),
    environmental_quality   DECIMAL(5,2),
    purpose_meaning         DECIMAL(5,2),
    -- Computed outputs
    flourishing_score       DECIMAL(5,2) GENERATED ALWAYS AS (
        ROUND((
            COALESCE(physical_health,50) * 0.15 +
            COALESCE(mental_wellbeing,50) * 0.15 +
            COALESCE(education,50) * 0.12 +
            COALESCE(employment,50) * 0.12 +
            COALESCE(income_mobility,50) * 0.10 +
            COALESCE(community_trust,50) * 0.14 +
            COALESCE(environmental_quality,50) * 0.12 +
            COALESCE(purpose_meaning,50) * 0.10
        )::DECIMAL, 2)
    ) STORED,
    community_resilience_score  DECIMAL(5,2),
    future_opportunity_index    DECIMAL(5,2),
    risk_indicators             JSONB NOT NULL DEFAULT '[]',
    root_causes                 JSONB NOT NULL DEFAULT '[]',
    data_sources                JSONB NOT NULL DEFAULT '[]',
    confidence                  DECIMAL(4,3) NOT NULL DEFAULT 0.8,
    measured_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flourishing_entity ON flourishing_snapshots(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_flourishing_score ON flourishing_snapshots(flourishing_score DESC);
CREATE INDEX IF NOT EXISTS idx_flourishing_measured ON flourishing_snapshots(measured_at DESC);

-- Trend view: latest snapshot per entity
CREATE OR REPLACE VIEW flourishing_latest AS
SELECT DISTINCT ON (entity_id) *
FROM flourishing_snapshots
ORDER BY entity_id, measured_at DESC;

-- ─────────────────────────────────────────────────────────────
-- MODEL II — REGENERATIVE ECONOMY ENGINE
-- Decision: "Does this project create or destroy real value?"
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS regenerative_valuations (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id                  TEXT NOT NULL,
    project_name                TEXT NOT NULL,
    -- Input dimensions (raw values with units stored in metadata)
    carbon_sequestration_t      DECIMAL(14,4),   -- tonnes CO2e
    water_restored_m3           DECIMAL(14,4),
    biodiversity_delta          DECIMAL(8,4),    -- Shannon index change
    soil_health_delta           DECIMAL(8,4),    -- 0–100 delta
    energy_kwh                  DECIMAL(14,4),   -- negative = consumed
    waste_kg                    DECIMAL(14,4),   -- negative = generated
    jobs_created                INTEGER,
    community_benefit_usd       DECIMAL(14,2),
    -- Computed outputs
    regenerative_value_score    DECIMAL(5,2),    -- 0–100
    ecological_roi              DECIMAL(8,4),    -- ecological return per $ invested
    restoration_yield           DECIMAL(8,4),    -- tonnes CO2e per hectare per year
    circular_economy_index      DECIMAL(5,2),    -- 0–100
    hidden_costs_usd            DECIMAL(14,2),   -- externalities not in P&L
    hidden_benefits_usd         DECIMAL(14,2),   -- positive externalities
    true_value_usd              DECIMAL(14,2),   -- financial + ecological + social
    methodology                 TEXT NOT NULL DEFAULT 'atlas_v1',
    period_start                DATE,
    period_end                  DATE,
    metadata                    JSONB NOT NULL DEFAULT '{}',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regen_project ON regenerative_valuations(project_id);
CREATE INDEX IF NOT EXISTS idx_regen_score ON regenerative_valuations(regenerative_value_score DESC);
CREATE INDEX IF NOT EXISTS idx_regen_created ON regenerative_valuations(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- MODEL III — INNOVATION GENESIS ENGINE
-- Decision: "What breakthrough should we fund next?"
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS innovation_signals (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_type             TEXT NOT NULL CHECK (signal_type IN (
                                'paper','patent','startup','grant','challenge',
                                'technology','societal_need','market_gap')),
    title                   TEXT NOT NULL,
    description             TEXT,
    source_url              TEXT,
    source_domain           TEXT,
    tags                    TEXT[] NOT NULL DEFAULT '{}',
    -- Scoring
    innovation_probability  DECIMAL(4,3) NOT NULL DEFAULT 0.5,  -- 0–1
    adoption_forecast_yrs   DECIMAL(5,1),                       -- years to mainstream
    breakthrough_potential  DECIMAL(4,3) NOT NULL DEFAULT 0.5,  -- 0–1
    -- Intersection detection
    intersecting_domains    TEXT[] NOT NULL DEFAULT '{}',
    opportunity_map         JSONB NOT NULL DEFAULT '{}',
    -- Embedding for semantic clustering
    embedding               vector(1536),
    raw_data                JSONB NOT NULL DEFAULT '{}',
    detected_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_innovation_type ON innovation_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_innovation_probability ON innovation_signals(innovation_probability DESC);
CREATE INDEX IF NOT EXISTS idx_innovation_tags ON innovation_signals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_innovation_domains ON innovation_signals USING GIN(intersecting_domains);
CREATE INDEX IF NOT EXISTS idx_innovation_embedding ON innovation_signals
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Opportunity clusters (aggregated from signals)
CREATE TABLE IF NOT EXISTS innovation_opportunities (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                   TEXT NOT NULL,
    description             TEXT NOT NULL,
    domains                 TEXT[] NOT NULL DEFAULT '{}',
    signal_ids              UUID[] NOT NULL DEFAULT '{}',
    opportunity_score       DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    time_horizon_yrs        DECIMAL(5,1),
    market_size_usd         DECIMAL(18,2),
    key_dependencies        TEXT[] NOT NULL DEFAULT '{}',
    recommended_actions     JSONB NOT NULL DEFAULT '[]',
    status                  TEXT NOT NULL DEFAULT 'emerging'
                            CHECK (status IN ('emerging','validated','funded','deployed','obsolete')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opp_score ON innovation_opportunities(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_opp_domains ON innovation_opportunities USING GIN(domains);

-- ─────────────────────────────────────────────────────────────
-- MODEL IV — ETHICAL DECISION ENGINE
-- Decision: "What are the full consequences before we act?"
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ethical_evaluations (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_ref              TEXT NOT NULL,          -- links to any entity
    entity_type                 TEXT NOT NULL,          -- 'project','policy','trade','agent_action'
    proposed_action             TEXT NOT NULL,
    -- Stakeholder impact (JSONB array of {group, impact, severity})
    stakeholder_impacts         JSONB NOT NULL DEFAULT '[]',
    -- Environmental impact
    environmental_impact        JSONB NOT NULL DEFAULT '{}',
    -- Economic outcomes
    economic_outcomes           JSONB NOT NULL DEFAULT '{}',
    -- Governance constraints checked
    governance_constraints      JSONB NOT NULL DEFAULT '[]',
    -- Computed scores (0–100)
    ethical_risk_score          DECIMAL(5,2) NOT NULL DEFAULT 50,
    human_benefit_score         DECIMAL(5,2) NOT NULL DEFAULT 50,
    long_term_sustainability    DECIMAL(5,2) NOT NULL DEFAULT 50,
    -- Lens evaluations
    utilitarian_score           DECIMAL(5,2),
    rights_based_score          DECIMAL(5,2),
    virtue_ethics_score         DECIMAL(5,2),
    indigenous_ethics_score     DECIMAL(5,2),
    -- Outputs
    recommended_actions         JSONB NOT NULL DEFAULT '[]',
    violations                  JSONB NOT NULL DEFAULT '[]',
    requires_human_review       BOOLEAN NOT NULL DEFAULT FALSE,
    audit_trail                 TEXT,
    evaluated_by                TEXT NOT NULL DEFAULT 'atlas_ethics_v1',
    evaluated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ethics_ref ON ethical_evaluations(evaluation_ref);
CREATE INDEX IF NOT EXISTS idx_ethics_risk ON ethical_evaluations(ethical_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_ethics_review ON ethical_evaluations(requires_human_review) WHERE requires_human_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_ethics_entity_type ON ethical_evaluations(entity_type);

-- ─────────────────────────────────────────────────────────────
-- MODEL V — ECOSYSTEM INTELLIGENCE ENGINE
-- Decision: "Is this ecosystem recovering or dying — and what do we do?"
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ecosystem_intelligence (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id               TEXT NOT NULL,
    region_name             TEXT NOT NULL,
    region_type             TEXT NOT NULL CHECK (region_type IN (
                                'forest','wetland','grassland','ocean','river',
                                'urban_green','agricultural','coral_reef','tundra','other')),
    location                GEOMETRY(Polygon, 4326),
    area_hectares           DECIMAL(14,2),
    -- Composite health score (0–100)
    ecosystem_health_score  DECIMAL(5,2) NOT NULL DEFAULT 50,
    -- Sub-scores
    carbon_score            DECIMAL(5,2),
    water_score             DECIMAL(5,2),
    biodiversity_score      DECIMAL(5,2),
    soil_score              DECIMAL(5,2),
    resilience_score        DECIMAL(5,2),
    -- Trend
    trend                   TEXT NOT NULL DEFAULT 'stable'
                            CHECK (trend IN ('recovering','stable','degrading','critical','unknown')),
    trend_confidence        DECIMAL(4,3) NOT NULL DEFAULT 0.7,
    -- Restoration
    restoration_opportunities   JSONB NOT NULL DEFAULT '[]',
    environmental_alerts        JSONB NOT NULL DEFAULT '[]',
    -- Scenarios (25-year projections)
    scenario_baseline       JSONB NOT NULL DEFAULT '{}',
    scenario_intervention   JSONB NOT NULL DEFAULT '{}',
    scenario_worst_case     JSONB NOT NULL DEFAULT '{}',
    -- Data provenance
    data_sources            TEXT[] NOT NULL DEFAULT '{}',
    last_satellite_pass     TIMESTAMPTZ,
    sensor_count            INTEGER NOT NULL DEFAULT 0,
    assessed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eco_region ON ecosystem_intelligence(region_id);
CREATE INDEX IF NOT EXISTS idx_eco_health ON ecosystem_intelligence(ecosystem_health_score DESC);
CREATE INDEX IF NOT EXISTS idx_eco_trend ON ecosystem_intelligence(trend);
CREATE INDEX IF NOT EXISTS idx_eco_geom ON ecosystem_intelligence USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_eco_assessed ON ecosystem_intelligence(assessed_at DESC);

-- Latest assessment per region
CREATE OR REPLACE VIEW ecosystem_intelligence_latest AS
SELECT DISTINCT ON (region_id) *
FROM ecosystem_intelligence
ORDER BY region_id, assessed_at DESC;

-- ─────────────────────────────────────────────────────────────
-- CROSS-MODEL: Decision Support Log
-- Every model output that influenced a real decision is logged here
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_support_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model           TEXT NOT NULL CHECK (model IN (
                        'flourishing','regenerative_economy',
                        'innovation_genesis','ethical_decision','ecosystem_intelligence')),
    source_id       UUID NOT NULL,          -- FK to the model's output row
    decision_made   TEXT NOT NULL,
    decision_maker  TEXT,                   -- user_id or org_id
    outcome         TEXT,                   -- filled in later
    outcome_score   DECIMAL(5,2),           -- 0–100 how good was the outcome
    feedback        TEXT,
    decided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    outcome_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dsl_model ON decision_support_log(model);
CREATE INDEX IF NOT EXISTS idx_dsl_source ON decision_support_log(source_id);

COMMIT;
