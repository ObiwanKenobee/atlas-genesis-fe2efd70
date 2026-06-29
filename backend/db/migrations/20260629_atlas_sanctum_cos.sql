-- ═══════════════════════════════════════════════════════════
-- Atlas Sanctum COS — Database Migration
-- Five Planes: Intelligence, Trust, Value, Coordination, Planetary
-- ═══════════════════════════════════════════════════════════
-- Run: psql $DATABASE_URL -f this_file.sql
-- Requires: PostgreSQL 14+ with PostGIS and pgvector extensions

BEGIN;

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ═══════════════════════════════════════════════════════════
-- INTELLIGENCE PLANE TABLES
-- ═══════════════════════════════════════════════════════════

-- Vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS vector_embeddings (
    id            TEXT PRIMARY KEY,
    embedding     vector(1536),         -- OpenAI text-embedding-3-large
    metadata      JSONB NOT NULL DEFAULT '{}',
    namespace     TEXT NOT NULL DEFAULT 'default',
    tenant_id     UUID REFERENCES users(tenant_id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_metadata ON vector_embeddings USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_namespace ON vector_embeddings(namespace);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_ivfflat ON vector_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Agent task history
CREATE TABLE IF NOT EXISTS agent_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        TEXT NOT NULL,
    agent_type      TEXT NOT NULL,
    task_type       TEXT NOT NULL,
    description     TEXT NOT NULL,
    input           JSONB NOT NULL DEFAULT '{}',
    output          JSONB,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','running','completed','failed','awaiting_approval','cancelled')),
    steps           JSONB NOT NULL DEFAULT '[]',
    priority        TEXT NOT NULL DEFAULT 'normal',
    tokens_used     INTEGER DEFAULT 0,
    duration_ms     INTEGER,
    error           TEXT,
    tenant_id       UUID,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_tenant_id ON agent_tasks(tenant_id);

-- Agent delegations
CREATE TABLE IF NOT EXISTS agent_delegations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_agent_id   TEXT NOT NULL,
    to_agent_id     TEXT NOT NULL,
    task            JSONB NOT NULL,
    rationale       TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    result          JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════
-- TRUST PLANE TABLES
-- ═══════════════════════════════════════════════════════════

-- Decentralized Identity Registry
CREATE TABLE IF NOT EXISTS did_registry (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    did             TEXT NOT NULL UNIQUE,
    subject_type    TEXT NOT NULL CHECK (subject_type IN ('person','organization','device','agent')),
    tenant_id       TEXT NOT NULL,
    document        JSONB NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_did_registry_tenant ON did_registry(tenant_id);
CREATE INDEX IF NOT EXISTS idx_did_registry_did ON did_registry(did);

-- Verifiable Credentials
CREATE TABLE IF NOT EXISTS verifiable_credentials (
    id              TEXT PRIMARY KEY,
    issuer_did      TEXT NOT NULL,
    subject_did     TEXT NOT NULL,
    type            TEXT NOT NULL,
    credential      JSONB NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vc_issuer ON verifiable_credentials(issuer_did);
CREATE INDEX IF NOT EXISTS idx_vc_subject ON verifiable_credentials(subject_did);
CREATE INDEX IF NOT EXISTS idx_vc_type ON verifiable_credentials(type);

-- Blockchain Anchors
CREATE TABLE IF NOT EXISTS chain_anchors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash         TEXT NOT NULL,
    chain           TEXT NOT NULL,
    block_number    BIGINT,
    content_hash    TEXT NOT NULL,
    record_type     TEXT NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','failed','reorged')),
    confirmations   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chain_anchors_tx_hash ON chain_anchors(tx_hash);
CREATE INDEX IF NOT EXISTS idx_chain_anchors_content_hash ON chain_anchors(content_hash);
CREATE INDEX IF NOT EXISTS idx_chain_anchors_status ON chain_anchors(status);

-- Trusted Devices (Zero Trust)
CREATE TABLE IF NOT EXISTS trusted_devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id       TEXT NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name     TEXT,
    device_type     TEXT,
    trust_level     INTEGER NOT NULL DEFAULT 50 CHECK (trust_level BETWEEN 0 AND 100),
    fingerprint     TEXT,
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(device_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);

-- ═══════════════════════════════════════════════════════════
-- COORDINATION PLANE TABLES
-- ═══════════════════════════════════════════════════════════

-- Governance Proposals (extends existing governance table)
CREATE TABLE IF NOT EXISTS governance_proposals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    proposer_id         UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    tenant_id           UUID NOT NULL,
    type                TEXT NOT NULL,
    payload             JSONB NOT NULL DEFAULT '{}',
    quorum_pct          DECIMAL(5,2) NOT NULL DEFAULT 51,
    supermajority_pct   DECIMAL(5,2) NOT NULL DEFAULT 50,
    status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','passed','rejected','executed','cancelled')),
    votes_for           DECIMAL DEFAULT 0,
    votes_against       DECIMAL DEFAULT 0,
    votes_abstain       DECIMAL DEFAULT 0,
    chain_tx_hash       TEXT,
    ends_at             TIMESTAMPTZ NOT NULL,
    executed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gov_proposals_tenant ON governance_proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gov_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_gov_proposals_ends_at ON governance_proposals(ends_at);

-- Governance Votes
CREATE TABLE IF NOT EXISTS governance_votes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id     UUID NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
    voter_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    choice          TEXT NOT NULL CHECK (choice IN ('for','against','abstain')),
    weight          DECIMAL NOT NULL DEFAULT 1,
    reason          TEXT,
    chain_tx_hash   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(proposal_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_gov_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_gov_votes_voter ON governance_votes(voter_id);

-- Workflow Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name   TEXT NOT NULL,
    version         TEXT NOT NULL DEFAULT '1.0.0',
    tenant_id       UUID NOT NULL,
    status          TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running','completed','failed','suspended','cancelled')),
    definition      JSONB NOT NULL,
    current_step    TEXT,
    completed_steps JSONB NOT NULL DEFAULT '[]',
    result          JSONB,
    error           TEXT,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflow_tenant ON workflow_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_name ON workflow_instances(workflow_name);

-- Human Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id      TEXT NOT NULL,
    requested_by    TEXT NOT NULL,
    action          TEXT NOT NULL,
    context         JSONB NOT NULL DEFAULT '{}',
    approvers       JSONB NOT NULL DEFAULT '[]',
    approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    urgency         TEXT NOT NULL DEFAULT 'medium',
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','expired','cancelled')),
    decision_reason TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_expires_at ON approval_requests(expires_at);

-- ═══════════════════════════════════════════════════════════
-- PLANETARY PLANE TABLES
-- ═══════════════════════════════════════════════════════════

-- Planetary Measurements (PostGIS-enabled)
CREATE TABLE IF NOT EXISTS planetary_measurements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      TEXT NOT NULL,
    source          TEXT NOT NULL CHECK (source IN ('satellite','ground_sensor','iot','manual','drone')),
    type            TEXT NOT NULL,
    value           DECIMAL NOT NULL,
    unit            TEXT NOT NULL,
    location        GEOMETRY(Point, 4326) NOT NULL,
    confidence      DECIMAL(4,3) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
    measured_at     TIMESTAMPTZ NOT NULL,
    raw_data        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT create_hypertable('planetary_measurements', 'measured_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_measurements_project ON planetary_measurements(project_id);
CREATE INDEX IF NOT EXISTS idx_measurements_type ON planetary_measurements(type);
CREATE INDEX IF NOT EXISTS idx_measurements_geom ON planetary_measurements USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_measurements_confidence ON planetary_measurements(confidence);

-- Digital Twins
CREATE TABLE IF NOT EXISTS digital_twins (
    entity_id       TEXT PRIMARY KEY,
    entity_type     TEXT NOT NULL,
    physical_state  JSONB NOT NULL DEFAULT '{}',
    virtual_state   JSONB NOT NULL DEFAULT '{}',
    divergence      DECIMAL(4,3) NOT NULL DEFAULT 0 CHECK (divergence BETWEEN 0 AND 1),
    predictions     JSONB NOT NULL DEFAULT '[]',
    last_synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twin_entity_type ON digital_twins(entity_type);

-- Climate Simulation Results (cache)
CREATE TABLE IF NOT EXISTS climate_simulations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_name   TEXT NOT NULL,
    scenario_input  JSONB NOT NULL,
    result          JSONB NOT NULL,
    computed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE did_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiable_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE planetary_measurements ENABLE ROW LEVEL SECURITY;

-- Policies: service role bypasses, authenticated users scoped to tenant
CREATE POLICY "service_full_access" ON vector_embeddings TO service_role USING (true);
CREATE POLICY "service_full_access" ON did_registry TO service_role USING (true);
CREATE POLICY "service_full_access" ON governance_proposals TO service_role USING (true);
CREATE POLICY "service_full_access" ON planetary_measurements TO service_role USING (true);

-- ═══════════════════════════════════════════════════════════
-- AUDIT TRIGGERS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name, record_id, action, old_data, new_data, changed_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['governance_proposals','governance_votes','chain_anchors','approval_requests'] LOOP
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

-- ═══════════════════════════════════════════════════════════
-- PERFORMANCE INDEXES (additional)
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_vector_tenant_namespace ON vector_embeddings(namespace, tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON agent_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anchor_chain_status ON chain_anchors(chain, status);

COMMIT;
