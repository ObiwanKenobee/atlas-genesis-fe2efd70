-- Atlas Sanctum Regenerative Architecture Database Schema
-- Replaces CRUD with verification pipelines and regenerative systems

-- =====================================================
-- VERIFICATION PIPELINES (Replaces "Create record")
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_pipelines (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ingesting',
    overall_confidence DECIMAL(3,2) DEFAULT 0.0,
    created_by VARCHAR(255),
    scheduled_finalization TIMESTAMP,
    finalized_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_pipeline_status CHECK (status IN ('ingesting', 'normalizing', 'cross_validating', 'scoring', 'finalized', 'rejected')),
    CONSTRAINT chk_confidence_range CHECK (overall_confidence >= 0.0 AND overall_confidence <= 1.0)
);

CREATE TABLE IF NOT EXISTS verification_stages (
    id VARCHAR(255) PRIMARY KEY,
    pipeline_id VARCHAR(255) NOT NULL REFERENCES verification_pipelines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_stage_status CHECK (status IN ('pending', 'processing', 'verified', 'failed')),
    CONSTRAINT chk_stage_source CHECK (source IN ('sensor', 'satellite', 'human', 'ai')),
    CONSTRAINT chk_stage_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- =====================================================
-- CONFIDENCE-WEIGHTED STATE (Data that knows it might be wrong)
-- =====================================================

CREATE TABLE IF NOT EXISTS confidence_weighted_values (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    uncertainty DECIMAL(15,6) NOT NULL,
    distribution VARCHAR(20) DEFAULT 'normal',
    parameters JSONB DEFAULT '{}',
    provenance JSONB DEFAULT '[]',
    decay_rate DECIMAL(4,3) DEFAULT 0.100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_confidence_range CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CONSTRAINT chk_distribution CHECK (distribution IN ('normal', 'uniform', 'exponential')),
    CONSTRAINT chk_decay_rate CHECK (decay_rate >= 0.0 AND decay_rate <= 1.0),
    
    UNIQUE(entity_type, entity_id, metric, created_at)
);

-- =====================================================
-- ETHICAL CONSTRAINT EVALUATION (Executable morality)
-- =====================================================

CREATE TABLE IF NOT EXISTS ethical_constraints (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rule TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    violation_cost DECIMAL(10,2) DEFAULT 0.0,
    active BOOLEAN DEFAULT true,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_constraint_type CHECK (type IN ('hard', 'soft')),
    CONSTRAINT chk_constraint_category CHECK (category IN ('environmental', 'social', 'economic', 'cultural', 'temporal'))
);

CREATE TABLE IF NOT EXISTS ethical_evaluations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    result VARCHAR(20) NOT NULL,
    total_cost DECIMAL(10,2) DEFAULT 0.0,
    constraints_evaluated INTEGER DEFAULT 0,
    violations INTEGER DEFAULT 0,
    reasoning JSONB DEFAULT '[]',
    alternatives JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_evaluation_result CHECK (result IN ('allowed', 'denied', 'allowed_with_cost'))
);

-- =====================================================
-- TRUST ACCUMULATION & DECAY (Reputation as physics)
-- =====================================================

CREATE TABLE IF NOT EXISTS trust_scores (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    current_score DECIMAL(3,2) NOT NULL DEFAULT 0.50,
    base_score DECIMAL(3,2) NOT NULL DEFAULT 0.50,
    decay_rate DECIMAL(4,3) DEFAULT 0.050,
    trust_level VARCHAR(20) DEFAULT 'emerging',
    risk_factors JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_trust_score_range CHECK (current_score >= 0.0 AND current_score <= 1.0),
    CONSTRAINT chk_base_score_range CHECK (base_score >= 0.0 AND base_score <= 1.0),
    CONSTRAINT chk_trust_level CHECK (trust_level IN ('untrusted', 'emerging', 'established', 'verified', 'exemplary'))
);

CREATE TABLE IF NOT EXISTS trust_contributions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    raw_value DECIMAL(10,4) NOT NULL,
    adjusted_value DECIMAL(10,4) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    description TEXT NOT NULL,
    verified_by VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    decay_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_contribution_type CHECK (type IN ('verification', 'governance', 'community', 'impact', 'violation')),
    CONSTRAINT chk_weight_range CHECK (weight >= 0.0 AND weight <= 1.0),
    
    FOREIGN KEY (user_id) REFERENCES trust_scores(user_id) ON DELETE CASCADE
);

-- =====================================================
-- TEMPORAL LOGIC (Time as first-class citizen)
-- =====================================================

CREATE TABLE IF NOT EXISTS temporal_actions (
    id VARCHAR(255) PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    executed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',
    conditions JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_temporal_status CHECK (status IN ('scheduled', 'executing', 'completed', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS seasonal_checkpoints (
    id VARCHAR(255) PRIMARY KEY,
    season VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    ecosystem_type VARCHAR(100) NOT NULL,
    checkpoints JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_season CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
    CONSTRAINT chk_year_range CHECK (year >= 2020 AND year <= 2100)
);

CREATE TABLE IF NOT EXISTS time_locked_attestations (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    attestation JSONB NOT NULL,
    unlock_time TIMESTAMP NOT NULL,
    unlock_conditions JSONB DEFAULT '[]',
    locked BOOLEAN DEFAULT true,
    unlocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEEDBACK LOOPS & LEARNING
-- =====================================================

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    predicted_outcome JSONB NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    prediction_horizon INTEGER NOT NULL, -- days
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_prediction_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

CREATE TABLE IF NOT EXISTS feedback_loops (
    id VARCHAR(255) PRIMARY KEY,
    prediction_id VARCHAR(255) NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    predicted_outcome JSONB NOT NULL,
    actual_outcome JSONB NOT NULL,
    accuracy DECIMAL(3,2) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    lessons_learned JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_feedback_accuracy CHECK (accuracy >= 0.0 AND accuracy <= 1.0),
    CONSTRAINT chk_feedback_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- =====================================================
-- ORCHESTRATION & AUDIT
-- =====================================================

CREATE TABLE IF NOT EXISTS orchestration_logs (
    id VARCHAR(255) PRIMARY KEY,
    action_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    ethical_result VARCHAR(20),
    trust_result BOOLEAN,
    verification_pipeline_id VARCHAR(255),
    temporal_action_id VARCHAR(255),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Verification pipelines
CREATE INDEX IF NOT EXISTS idx_verification_pipelines_status ON verification_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_verification_pipelines_entity ON verification_pipelines(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verification_stages_pipeline ON verification_stages(pipeline_id);

-- Confidence-weighted values
CREATE INDEX IF NOT EXISTS idx_confidence_values_entity ON confidence_weighted_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_confidence_values_metric ON confidence_weighted_values(metric);
CREATE INDEX IF NOT EXISTS idx_confidence_values_updated ON confidence_weighted_values(last_updated);

-- Ethical constraints
CREATE INDEX IF NOT EXISTS idx_ethical_constraints_active ON ethical_constraints(active);
CREATE INDEX IF NOT EXISTS idx_ethical_constraints_type ON ethical_constraints(type);
CREATE INDEX IF NOT EXISTS idx_ethical_evaluations_user ON ethical_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_ethical_evaluations_result ON ethical_evaluations(result);

-- Trust scores
CREATE INDEX IF NOT EXISTS idx_trust_scores_level ON trust_scores(trust_level);
CREATE INDEX IF NOT EXISTS idx_trust_scores_updated ON trust_scores(last_updated);
CREATE INDEX IF NOT EXISTS idx_trust_contributions_user ON trust_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_contributions_type ON trust_contributions(type);

-- Temporal actions
CREATE INDEX IF NOT EXISTS idx_temporal_actions_scheduled ON temporal_actions(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_temporal_actions_status ON temporal_actions(status);
CREATE INDEX IF NOT EXISTS idx_seasonal_checkpoints_season ON seasonal_checkpoints(season, year);
CREATE INDEX IF NOT EXISTS idx_time_locked_attestations_unlock ON time_locked_attestations(unlock_time, locked);

-- Feedback loops
CREATE INDEX IF NOT EXISTS idx_predictions_entity ON predictions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_feedback_loops_prediction ON feedback_loops(prediction_id);

-- Orchestration
CREATE INDEX IF NOT EXISTS idx_orchestration_logs_action ON orchestration_logs(action_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_logs_user ON orchestration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_logs_created ON orchestration_logs(created_at);

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC DECAY
-- =====================================================

-- Function to calculate current confidence with decay
CREATE OR REPLACE FUNCTION calculate_current_confidence(
    original_confidence DECIMAL(3,2),
    decay_rate DECIMAL(4,3),
    last_updated TIMESTAMP
) RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN GREATEST(
        0.1, -- Minimum confidence
        original_confidence * EXP(-decay_rate * EXTRACT(EPOCH FROM (NOW() - last_updated)) / (30 * 24 * 3600))
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate current trust with decay
CREATE OR REPLACE FUNCTION calculate_current_trust(
    original_score DECIMAL(3,2),
    decay_rate DECIMAL(4,3),
    last_updated TIMESTAMP
) RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN GREATEST(
        0.0, -- Minimum trust
        LEAST(
            1.0, -- Maximum trust
            original_score * EXP(-decay_rate * EXTRACT(EPOCH FROM (NOW() - last_updated)) / (30 * 24 * 3600))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- VIEWS FOR EASY ACCESS
-- =====================================================

-- Current confidence-weighted values with decay applied
CREATE OR REPLACE VIEW current_confidence_values AS
SELECT 
    id,
    entity_type,
    entity_id,
    metric,
    value,
    calculate_current_confidence(confidence, decay_rate, last_updated) as current_confidence,
    uncertainty,
    distribution,
    parameters,
    provenance,
    last_updated
FROM confidence_weighted_values;

-- Current trust scores with decay applied
CREATE OR REPLACE VIEW current_trust_scores AS
SELECT 
    id,
    user_id,
    calculate_current_trust(current_score, decay_rate, last_updated) as current_score,
    base_score,
    decay_rate,
    trust_level,
    risk_factors,
    last_updated
FROM trust_scores;

-- Active verification pipelines summary
CREATE OR REPLACE VIEW verification_pipeline_summary AS
SELECT 
    vp.id,
    vp.entity_type,
    vp.entity_id,
    vp.status,
    vp.overall_confidence,
    COUNT(vs.id) as total_stages,
    COUNT(CASE WHEN vs.status = 'verified' THEN 1 END) as verified_stages,
    COUNT(CASE WHEN vs.status = 'failed' THEN 1 END) as failed_stages,
    vp.created_at,
    vp.scheduled_finalization
FROM verification_pipelines vp
LEFT JOIN verification_stages vs ON vp.id = vs.pipeline_id
GROUP BY vp.id, vp.entity_type, vp.entity_id, vp.status, vp.overall_confidence, vp.created_at, vp.scheduled_finalization;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_verification_pipelines_updated_at
    BEFORE UPDATE ON verification_pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confidence_weighted_values_updated_at
    BEFORE UPDATE ON confidence_weighted_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ethical_constraints_updated_at
    BEFORE UPDATE ON ethical_constraints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_scores_updated_at
    BEFORE UPDATE ON trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_checkpoints_updated_at
    BEFORE UPDATE ON seasonal_checkpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default ethical constraints
INSERT INTO ethical_constraints (id, name, type, category, rule, parameters, created_by) VALUES
('ec_emissions_limit', 'Emission Limit Constraint', 'hard', 'environmental', '!exceedsEmissionLimit(action.emissions, params.maxEmissions)', '{"maxEmissions": 1000, "actionTypes": ["create_project", "ecosystem_intervention"]}', 'system'),
('ec_indigenous_consent', 'Indigenous Land Consent', 'hard', 'cultural', '!affectsIndigenousLand(action.location) || context.hasConsent', '{"actionTypes": ["create_project", "ecosystem_intervention"]}', 'system'),
('ec_biodiversity_protection', 'Biodiversity Protection', 'soft', 'environmental', '!threatensBiodiversity(action.impact)', '{"violationCost": 500, "actionTypes": ["ecosystem_intervention"]}', 'system'),
('ec_community_impact', 'Community Impact Assessment', 'soft', 'social', '!requiresCommunityConsent(action.impact) || context.communityApproval', '{"violationCost": 200, "actionTypes": ["create_project"]}', 'system'),
('ec_affordability', 'Affordability Threshold', 'soft', 'economic', '!exceedsAffordabilityThreshold(action.cost, context.income)', '{"violationCost": 100}', 'system')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE verification_pipelines IS 'Multi-stage verification flows where nothing becomes real until it survives scrutiny';
COMMENT ON TABLE confidence_weighted_values IS 'Data that knows it might be wrong - every metric carries uncertainty and decay';
COMMENT ON TABLE ethical_constraints IS 'Executable morality - policy engine that evaluates actions against ethical invariants';
COMMENT ON TABLE trust_scores IS 'Reputation as physics - slow-moving trust score tied to verified contribution';
COMMENT ON TABLE temporal_actions IS 'Actions that unfold over ecological time, not app time';
COMMENT ON TABLE seasonal_checkpoints IS 'Ecosystem monitoring aligned with natural cycles';
COMMENT ON TABLE feedback_loops IS 'Learning without central control - outcome-driven reinforcement';
COMMENT ON TABLE orchestration_logs IS 'Audit trail for all regenerative action processing';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🌍 Atlas Sanctum Regenerative Architecture Database Schema Deployed Successfully';
    RAISE NOTICE '✅ Verification Pipelines: Replace CRUD with multi-stage verification';
    RAISE NOTICE '✅ Confidence-Weighted State: Data with uncertainty and decay';
    RAISE NOTICE '✅ Ethical Constraint Engine: Executable morality system';
    RAISE NOTICE '✅ Trust Accumulation: Reputation as physics';
    RAISE NOTICE '✅ Temporal Logic: Time as first-class citizen';
    RAISE NOTICE '✅ Feedback Loops: Learning without ideology';
    RAISE NOTICE '🚀 Ready for regenerative, non-CRUD operations';
END $$;