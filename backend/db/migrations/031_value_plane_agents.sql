-- ═══════════════════════════════════════════════════════════
-- Atlas Sanctum — Value Plane + Agent Support Tables
-- Migration 031: Value Plane, Health Agent, Research Agent
-- ═══════════════════════════════════════════════════════════
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- VALUE PLANE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carbon_credits (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          TEXT NOT NULL,
    serial_number       TEXT NOT NULL UNIQUE,
    quantity            INTEGER NOT NULL DEFAULT 1,
    vintage             INTEGER NOT NULL,
    methodology         TEXT NOT NULL DEFAULT 'atlas_v1',
    verification_data   JSONB NOT NULL DEFAULT '{}',
    batch_id            UUID,
    status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','retired','pending','cancelled')),
    retired_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_project ON carbon_credits(project_id);
CREATE INDEX IF NOT EXISTS idx_credits_status ON carbon_credits(status);
CREATE INDEX IF NOT EXISTS idx_credits_vintage ON carbon_credits(vintage);
CREATE INDEX IF NOT EXISTS idx_credits_batch ON carbon_credits(batch_id);

CREATE TABLE IF NOT EXISTS retirement_certificates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_ids      UUID[] NOT NULL,
    total_quantity  INTEGER NOT NULL,
    retired_by      TEXT,
    purpose         TEXT NOT NULL DEFAULT 'voluntary_offset',
    content_hash    TEXT NOT NULL,
    ipfs_hash       TEXT,
    chain_tx_hash   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retirement_chain_tx ON retirement_certificates(chain_tx_hash);

CREATE TABLE IF NOT EXISTS treasury_positions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       TEXT NOT NULL,
    asset_type      TEXT NOT NULL,   -- 'USD', 'ETH', 'RIU', 'BOND'
    currency        TEXT NOT NULL DEFAULT 'USD',
    amount          DECIMAL(20,8) NOT NULL DEFAULT 0,
    amount_usd      DECIMAL(20,2),
    price_usd       DECIMAL(20,8),
    rebalanced_at   TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasury_tenant ON treasury_positions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treasury_asset ON treasury_positions(asset_type);

CREATE TABLE IF NOT EXISTS payment_intents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_usd      DECIMAL(14,2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'USD',
    provider        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','succeeded','failed','refunded','cancelled')),
    provider_tx_id  TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_user ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_provider ON payment_intents(provider);

-- Extend existing listings table if needed
ALTER TABLE listings ADD COLUMN IF NOT EXISTS asset_type TEXT NOT NULL DEFAULT 'RIU';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS remaining_quantity DECIMAL DEFAULT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Extend existing transactions table if needed
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS listing_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_fee_usd DECIMAL(14,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'fiat';

-- ─────────────────────────────────────────────────────────────
-- HEALTH AGENT SUPPORT TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_metrics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id       TEXT NOT NULL,
    metric_type     TEXT NOT NULL,   -- 'mortality', 'morbidity', 'access', 'mental_health', 'nutrition'
    value           DECIMAL(10,4) NOT NULL,
    unit            TEXT NOT NULL,
    period          TEXT,            -- e.g. '2024-Q1', '2024'
    data_source     TEXT,
    confidence      DECIMAL(4,3) NOT NULL DEFAULT 0.8,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_entity ON health_metrics(entity_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded ON health_metrics(recorded_at DESC);

CREATE TABLE IF NOT EXISTS health_benchmarks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type     TEXT NOT NULL UNIQUE,
    benchmark_value DECIMAL(10,4) NOT NULL,
    benchmark_source TEXT NOT NULL DEFAULT 'WHO',
    region          TEXT NOT NULL DEFAULT 'global',
    year            INTEGER NOT NULL DEFAULT 2024,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed WHO global benchmarks
INSERT INTO health_benchmarks (metric_type, benchmark_value, benchmark_source) VALUES
    ('life_expectancy', 73.3, 'WHO 2024'),
    ('infant_mortality_per_1000', 27.0, 'WHO 2024'),
    ('maternal_mortality_per_100k', 223.0, 'WHO 2024'),
    ('physician_density_per_1000', 1.6, 'WHO 2024'),
    ('hospital_beds_per_1000', 2.7, 'WHO 2024'),
    ('vaccination_coverage_pct', 84.0, 'WHO 2024'),
    ('mental_health_treatment_gap_pct', 75.0, 'WHO 2024'),
    ('clean_water_access_pct', 74.0, 'WHO 2024')
ON CONFLICT (metric_type) DO NOTHING;

CREATE TABLE IF NOT EXISTS disease_burden (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id           TEXT NOT NULL,
    disease_category    TEXT NOT NULL,
    dalys_per_100k      DECIMAL(10,2) NOT NULL,
    deaths_per_100k     DECIMAL(10,2),
    prevalence_pct      DECIMAL(6,3),
    trend               TEXT CHECK (trend IN ('increasing','stable','decreasing')),
    year                INTEGER NOT NULL DEFAULT 2024,
    data_source         TEXT NOT NULL DEFAULT 'IHME GBD',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disease_entity ON disease_burden(entity_id);
CREATE INDEX IF NOT EXISTS idx_disease_category ON disease_burden(disease_category);

CREATE TABLE IF NOT EXISTS health_alerts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id           TEXT NOT NULL,
    alert_type          TEXT NOT NULL,
    severity            TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    description         TEXT NOT NULL,
    recommended_actions JSONB NOT NULL DEFAULT '[]',
    status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','acknowledged','resolved','dismissed')),
    acknowledged_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_entity ON health_alerts(entity_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_severity ON health_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);

-- ─────────────────────────────────────────────────────────────
-- RESEARCH AGENT SUPPORT TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_papers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    abstract            TEXT,
    authors             TEXT[],
    publication_date    DATE,
    domain              TEXT,
    citation_count      INTEGER NOT NULL DEFAULT 0,
    impact_factor       DECIMAL(6,3),
    source_url          TEXT,
    doi                 TEXT UNIQUE,
    tags                TEXT[] NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_papers_domain ON research_papers(domain);
CREATE INDEX IF NOT EXISTS idx_papers_citations ON research_papers(citation_count DESC);
CREATE INDEX IF NOT EXISTS idx_papers_title_trgm ON research_papers USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_papers_abstract_trgm ON research_papers USING GIN(abstract gin_trgm_ops);

CREATE TABLE IF NOT EXISTS patents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    abstract            TEXT,
    assignee            TEXT,
    inventors           TEXT[],
    filing_date         DATE,
    grant_date          DATE,
    domain              TEXT,
    forward_citations   INTEGER NOT NULL DEFAULT 0,
    patent_number       TEXT UNIQUE,
    source_url          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patents_domain ON patents(domain);
CREATE INDEX IF NOT EXISTS idx_patents_assignee ON patents(assignee);
CREATE INDEX IF NOT EXISTS idx_patents_filing ON patents(filing_date DESC);

CREATE TABLE IF NOT EXISTS research_funding_requests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    domain              TEXT NOT NULL,
    requested_usd       DECIMAL(14,2) NOT NULL,
    rationale           TEXT NOT NULL,
    expected_outcomes   JSONB NOT NULL DEFAULT '[]',
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','funded','completed')),
    approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_status ON research_funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_funding_domain ON research_funding_requests(domain);

-- ─────────────────────────────────────────────────────────────
-- AUDIT TRIGGERS for new tables
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'carbon_credits','retirement_certificates',
        'health_alerts','research_funding_requests'
    ] LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'audit_trigger_' || tbl
        ) THEN
            EXECUTE format('
                CREATE TRIGGER audit_trigger_%I
                AFTER INSERT OR UPDATE OR DELETE ON %I
                FOR EACH ROW EXECUTE FUNCTION log_audit_event()', tbl, tbl);
        END IF;
    END LOOP;
END $$;

COMMIT;
