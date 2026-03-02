-- RVE (Regenerative Value Exchange) Database Tables
-- Migration for regenerative value exchange dashboard

-- RVE Asset Classes Table
CREATE TABLE IF NOT EXISTS rve_asset_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    total_value DECIMAL(20, 2) DEFAULT 0,
    token_supply DECIMAL(20, 2) DEFAULT 0,
    price_per_unit DECIMAL(20, 8) DEFAULT 0,
    verification_status VARCHAR(50) DEFAULT 'pending',
    impact_score DECIMAL(5, 2) DEFAULT 0,
    environmental_benefits JSONB DEFAULT '{}',
    social_benefits JSONB DEFAULT '{}',
    governance_details JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Transactions Table
CREATE TABLE IF NOT EXISTS rve_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash VARCHAR(255) UNIQUE,
    asset_class_id UUID REFERENCES rve_asset_classes(id),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    token_symbol VARCHAR(20),
    price_at_execution DECIMAL(20, 8),
    status VARCHAR(50) DEFAULT 'pending',
    carbon_offset DECIMAL(20, 4) DEFAULT 0,
    water_conserved DECIMAL(20, 4) DEFAULT 0,
    biodiversity_impact DECIMAL(10, 2) DEFAULT 0,
    community_impact JSONB DEFAULT '{}',
    oracle_feeds JSONB DEFAULT '{}',
    verification_proof TEXT,
    executed_by VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Custodians Table
CREATE TABLE IF NOT EXISTS rve_custodians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    jurisdiction VARCHAR(100),
    regulatory_status VARCHAR(100),
    total_assets_custodied DECIMAL(20, 2) DEFAULT 0,
    coverage_percentage DECIMAL(5, 2) DEFAULT 0,
    insurance_coverage DECIMAL(20, 2) DEFAULT 0,
    verification_score DECIMAL(5, 2) DEFAULT 0,
    contact_info JSONB DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    audit_history JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Oracle Networks Table
CREATE TABLE IF NOT EXISTS rve_oracle_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    network_type VARCHAR(100) NOT NULL,
    description TEXT,
    data_sources JSONB DEFAULT '[]',
    update_frequency VARCHAR(50),
    accuracy_score DECIMAL(5, 2) DEFAULT 0,
    reliability_score DECIMAL(5, 2) DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    verification_protocols JSONB DEFAULT '[]',
    api_endpoint VARCHAR(500),
    documentation_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Impact Metrics Table
CREATE TABLE IF NOT EXISTS rve_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    value DECIMAL(20, 4) NOT NULL,
    unit VARCHAR(50),
    change_percentage DECIMAL(10, 2),
    change_direction VARCHAR(10),
    timeframe VARCHAR(50),
    verified BOOLEAN DEFAULT false,
    data_sources JSONB DEFAULT '[]',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Governance Proposals Table
CREATE TABLE IF NOT EXISTS rve_governance_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    proposal_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    voting_power_for DECIMAL(20, 8) DEFAULT 0,
    voting_power_against DECIMAL(20, 8) DEFAULT 0,
    voting_power_abstain DECIMAL(20, 8) DEFAULT 0,
    quorum_required DECIMAL(5, 2) DEFAULT 0,
    quorum_reached BOOLEAN DEFAULT false,
    proposer_id VARCHAR(255),
    proposer_name VARCHAR(255),
    voting_start TIMESTAMP WITH TIME ZONE,
    voting_end TIMESTAMP WITH TIME ZONE,
    execution_delay INTEGER DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Compliance Records Table
CREATE TABLE IF NOT EXISTS rve_compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    compliance_type VARCHAR(100) NOT NULL,
    standard VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    certificate_number VARCHAR(100),
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    auditor_name VARCHAR(255),
    audit_report_url VARCHAR(500),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Token Economics Table
CREATE TABLE IF NOT EXISTS rve_token_economics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_symbol VARCHAR(20) NOT NULL UNIQUE,
    token_name VARCHAR(255) NOT NULL,
    total_supply DECIMAL(20, 8) NOT NULL,
    circulating_supply DECIMAL(20, 8) DEFAULT 0,
    reserved_supply DECIMAL(20, 8) DEFAULT 0,
    burn_rate DECIMAL(10, 6) DEFAULT 0,
    inflation_rate DECIMAL(10, 6) DEFAULT 0,
    staking_rewards_rate DECIMAL(10, 6) DEFAULT 0,
    governance_weight DECIMAL(10, 4) DEFAULT 1,
    utility_score DECIMAL(5, 2) DEFAULT 0,
    market_cap DECIMAL(20, 2) DEFAULT 0,
    price DECIMAL(20, 8) DEFAULT 0,
    price_change_24h DECIMAL(10, 2) DEFAULT 0,
    volume_24h DECIMAL(20, 2) DEFAULT 0,
    distribution_json JSONB DEFAULT '{}',
    vesting_schedule JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Market Data Table
CREATE TABLE IF NOT EXISTS rve_market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_class_id UUID REFERENCES rve_asset_classes(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    open_price DECIMAL(20, 8) NOT NULL,
    high_price DECIMAL(20, 8) NOT NULL,
    low_price DECIMAL(20, 8) NOT NULL,
    close_price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 4) DEFAULT 0,
    number_of_trades INTEGER DEFAULT 0,
    bid_depth DECIMAL(20, 4) DEFAULT 0,
    ask_depth DECIMAL(20, 4) DEFAULT 0,
    volatility DECIMAL(10, 6) DEFAULT 0,
    oracle_price DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RVE Alerts Table
CREATE TABLE IF NOT EXISTS rve_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'info',
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(255),
    affected_entity_id VARCHAR(255),
    affected_entity_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rve_asset_classes_category ON rve_asset_classes(category);
CREATE INDEX IF NOT EXISTS idx_rve_asset_classes_active ON rve_asset_classes(is_active);
CREATE INDEX IF NOT EXISTS idx_rve_transactions_asset_class ON rve_transactions(asset_class_id);
CREATE INDEX IF NOT EXISTS idx_rve_transactions_status ON rve_transactions(status);
CREATE INDEX IF NOT EXISTS idx_rve_transactions_timestamp ON rve_transactions(executed_at);
CREATE INDEX IF NOT EXISTS idx_rve_custodians_type ON rve_custodians(type);
CREATE INDEX IF NOT EXISTS idx_rve_oracle_networks_type ON rve_oracle_networks(network_type);
CREATE INDEX IF NOT EXISTS idx_rve_impact_metrics_category ON rve_impact_metrics(category);
CREATE INDEX IF NOT EXISTS idx_rve_impact_metrics_type ON rve_impact_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_rve_governance_status ON rve_governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_rve_governance_type ON rve_governance_proposals(proposal_type);
CREATE INDEX IF NOT EXISTS idx_rve_alerts_type ON rve_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_rve_alerts_severity ON rve_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_rve_market_data_asset_time ON rve_market_data(asset_class_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rve_token_economics_symbol ON rve_token_economics(token_symbol);

-- Insert default RVE data
INSERT INTO rve_asset_classes (name, description, category, icon, total_value, token_supply, impact_score, display_order) VALUES
('Carbon Credits', 'High-integrity carbon credits from verified regenerative projects', 'environmental', 'leaf', 1250000000, 125000000, 95.5, 1),
('Biodiversity Tokens', 'Tokens representing biodiversity preservation and restoration', 'environmental', 'sprout', 450000000, 45000000, 92.3, 2),
('Water Conservation Credits', 'Verified water conservation and quality improvement credits', 'environmental', 'droplet', 320000000, 32000000, 88.7, 3),
('Community Impact Bonds', 'Social impact bonds funding community development', 'social', 'users', 280000000, 28000000, 91.2, 4),
('Cultural Heritage Tokens', 'Tokens preserving and promoting cultural heritage', 'cultural', 'book-open', 180000000, 18000000, 89.4, 5),
('Agroforestry Credits', 'Sustainable agroforestry and regenerative agriculture credits', 'environmental', 'tree', 520000000, 52000000, 94.1, 6),
('Ocean Conservation Tokens', 'Marine ecosystem protection and restoration tokens', 'environmental', 'waves', 350000000, 35000000, 93.8, 7),
('Renewable Energy Credits', 'Clean energy generation and distribution credits', 'environmental', 'zap', 680000000, 68000000, 90.5, 8)
ON CONFLICT DO NOTHING;

INSERT INTO rve_token_economics (token_symbol, token_name, total_supply, circulating_supply, burn_rate, inflation_rate, staking_rewards_rate, distribution_json) VALUES
('RVE', 'Regenerative Value Exchange Token', 10000000000, 4500000000, 0.0012, 0.008, 0.15, '{"public_sale": 0.15, "team": 0.12, "foundation": 0.25, "community": 0.30, "partners": 0.10, "reserve": 0.08}')
ON CONFLICT DO NOTHING;
