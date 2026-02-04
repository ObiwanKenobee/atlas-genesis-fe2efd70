-- Zero-Trust Architecture Database Migration
-- Creates tables for device trust, policy decisions, and risk management

-- ============================================================================
-- DEVICE TRUST TABLES
-- ============================================================================

-- Device Trust Registry
CREATE TABLE IF NOT EXISTS device_trust (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) NOT NULL,
    user_id UUID NOT NULL,
    fingerprint_hash VARCHAR(128) NOT NULL,
    device_type VARCHAR(32) NOT NULL,
    os_info VARCHAR(64),
    browser_info VARCHAR(64),
    trust_level VARCHAR(16) DEFAULT 'known',
    security_posture JSONB DEFAULT '{}',
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_count INTEGER DEFAULT 0,
    is_managed BOOLEAN DEFAULT false,
    is_revoked BOOLEAN DEFAULT false,
    revocation_reason TEXT,
    enrollment_method VARCHAR(32) DEFAULT 'automatic',
    device_name VARCHAR(128),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id, user_id)
);

-- Index for device lookups
CREATE INDEX IF NOT EXISTS idx_device_trust_user_id ON device_trust(user_id);
CREATE INDEX IF NOT EXISTS idx_device_trust_device_id ON device_trust(device_id);
CREATE INDEX IF NOT EXISTS idx_device_trust_fingerprint ON device_trust(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_trust_trust_level ON device_trust(trust_level);
CREATE INDEX IF NOT EXISTS idx_device_trust_last_seen ON device_trust(last_seen DESC);

-- Endpoint Security Checks
CREATE TABLE IF NOT EXISTS endpoint_security_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_id UUID NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    check_type VARCHAR(64) NOT NULL,
    result VARCHAR(16) NOT NULL,
    score INTEGER NOT NULL,
    details JSONB DEFAULT '{}',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_endpoint_checks_device_id ON endpoint_security_checks(device_id);
CREATE INDEX IF NOT EXISTS idx_endpoint_checks_check_type ON endpoint_security_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_endpoint_checks_expires ON endpoint_security_checks(expires_at);

-- ============================================================================
-- ZERO-TRUST POLICY TABLES
-- ============================================================================

-- Zero-Trust Policies
CREATE TABLE IF NOT EXISTS zero_trust_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    resource_type VARCHAR(32) NOT NULL,
    sensitivity_level VARCHAR(16) NOT NULL,
    minimum_trust_score INTEGER DEFAULT 70,
    required_factors JSONB DEFAULT '[]',
    allowed_networks JSONB DEFAULT '[]',
    time_restrictions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zt_policies_resource_type ON zero_trust_policies(resource_type);
CREATE INDEX IF NOT EXISTS idx_zt_policies_active ON zero_trust_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_zt_policies_priority ON zero_trust_policies(priority DESC);

-- Policy Decisions Audit Log
CREATE TABLE IF NOT EXISTS zero_trust_policy_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(64) NOT NULL,
    session_id UUID NOT NULL,
    user_id UUID,
    allowed BOOLEAN NOT NULL,
    trust_score INTEGER NOT NULL,
    conditions JSONB DEFAULT '[]',
    risk_level VARCHAR(16),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zt_decisions_policy_id ON zero_trust_policy_decisions(policy_id);
CREATE INDEX IF NOT EXISTS idx_zt_decisions_session_id ON zero_trust_policy_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_zt_decisions_user_id ON zero_trust_policy_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_zt_decisions_created_at ON zero_trust_policy_decisions(created_at DESC);

-- ============================================================================
-- RISK MANAGEMENT TABLES
-- ============================================================================

-- Risk Exceptions
CREATE TABLE IF NOT EXISTS zero_trust_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_id UUID NOT NULL UNIQUE,
    user_id UUID,
    device_id VARCHAR(64),
    ip_range CIDR,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_by UUID NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zt_exceptions_user ON zero_trust_exceptions(user_id);
CREATE INDEX IF NOT EXISTS idx_zt_exceptions_device ON zero_trust_exceptions(device_id);
CREATE INDEX IF NOT EXISTS idx_zt_exceptions_ip ON zero_trust_exceptions(ip_range);
CREATE INDEX IF NOT EXISTS idx_zt_exceptions_expires ON zero_trust_exceptions(expires_at);

-- Risk Indicators
CREATE TABLE IF NOT EXISTS risk_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    indicator_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(64),
    score INTEGER DEFAULT 0,
    mitigations JSONB DEFAULT '[]',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_risk_indicators_user ON risk_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_type ON risk_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_severity ON risk_indicators(severity);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_detected ON risk_indicators(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_indicators_unresolved ON risk_indicators(is_resolved, detected_at DESC);

-- Behavioral Anomalies
CREATE TABLE IF NOT EXISTS behavioral_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    anomaly_type VARCHAR(64) NOT NULL,
    description TEXT,
    previous_value TEXT,
    current_value TEXT,
    deviation_score INTEGER,
    risk_level VARCHAR(16),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_behavioral_user ON behavioral_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_session ON behavioral_anomalies(session_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_type ON behavioral_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_detected ON behavioral_anomalies(detected_at DESC);

-- ============================================================================
-- IP BLACKLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS ip_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address CIDR NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    source VARCHAR(64) DEFAULT 'manual',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_ip_blacklist_expires ON ip_blacklist(expires_at);

-- ============================================================================
-- SESSION TRUST SCORES (Redis-backed in production)
-- ============================================================================

-- This table caches trust scores for sessions (for debugging/monitoring)
CREATE TABLE IF NOT EXISTS session_trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    overall_score INTEGER NOT NULL,
    identity_score INTEGER NOT NULL,
    device_score INTEGER NOT NULL,
    behavior_score INTEGER NOT NULL,
    context_score INTEGER NOT NULL,
    network_score INTEGER NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    factors JSONB DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_session_trust_user ON session_trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_session_trust_updated ON session_trust_scores(last_updated DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp to relevant tables
CREATE TRIGGER update_device_trust_updated_at
    BEFORE UPDATE ON device_trust
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_zt_policies_updated_at
    BEFORE UPDATE ON zero_trust_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DEFAULT POLICIES
-- ============================================================================

INSERT INTO zero_trust_policies (
    policy_id, name, description, resource_type, sensitivity_level,
    minimum_trust_score, required_factors, allowed_networks, time_restrictions,
    is_active, priority
) VALUES (
    'ztp-api-access', 'API Access Zero-Trust Policy',
    'Default policy for all API endpoints requiring continuous verification',
    'api_endpoint', 'internal', 70,
    '[{"factorId": "session_token", "factorType": "session_token", "required": true, "freshnessMinutes": 60}]',
    '["corporate", "vpn", "trusted"]', '[]', true, 100
), (
    'ztp-user-data', 'User Data Protection Policy',
    'Strict policy for accessing user personal data',
    'user_data', 'confidential', 80,
    '[{"factorId": "session_token", "factorType": "session_token", "required": true, "freshnessMinutes": 30}, {"factorId": "mfa", "factorType": "mfa_totp", "required": true, "freshnessMinutes": 240}]',
    '["corporate", "vpn"]', '[{"daysOfWeek": [1,2,3,4,5], "startTime": "08:00", "endTime": "18:00", "timezone": "UTC"}]',
    true, 200
), (
    'ztp-admin-panel', 'Admin Panel Access Policy',
    'Highest security policy for administrative access',
    'admin_panel', 'restricted', 95,
    '[{"factorId": "session_token", "factorType": "session_token", "required": true, "freshnessMinutes": 15}, {"factorId": "mfa_hardware", "factorType": "hardware_key", "required": true, "freshnessMinutes": 480}, {"factorId": "mfa_totp", "factorType": "mfa_totp", "required": true, "freshnessMinutes": 240}]',
    '["corporate"]', '[{"daysOfWeek": [1,2,3,4,5], "startTime": "07:00", "endTime": "20:00", "timezone": "UTC"}]',
    true, 300
), (
    'ztp-billing', 'Billing System Access Policy',
    'Strict policy for billing and payment operations',
    'billing_system', 'top_secret', 90,
    '[{"factorId": "session_token", "factorType": "session_token", "required": true, "freshnessMinutes": 30}, {"factorId": "mfa", "factorType": "mfa_totp", "required": true, "freshnessMinutes": 240}]',
    '["corporate", "vpn"]', '[]', true, 250
) ON CONFLICT (policy_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE device_trust IS 'Stores device trust information for zero-trust authentication';
COMMENT ON TABLE endpoint_security_checks IS 'Records endpoint security check results';
COMMENT ON TABLE zero_trust_policies IS 'Defines zero-trust access policies';
COMMENT ON TABLE zero_trust_policy_decisions IS 'Audits all policy decisions made by the zero-trust engine';
COMMENT ON TABLE zero_trust_exceptions IS 'Stores risk exceptions for specific users/devices/IPs';
COMMENT ON TABLE risk_indicators IS 'Tracks detected security risks and anomalies';
COMMENT ON TABLE behavioral_anomalies IS 'Records behavioral anomalies for users';
COMMENT ON TABLE ip_blacklist IS 'Stores blacklisted IP addresses';
COMMENT ON TABLE session_trust_scores IS 'Caches trust scores for monitoring';
