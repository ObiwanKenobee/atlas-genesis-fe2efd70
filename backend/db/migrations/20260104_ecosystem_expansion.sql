-- Ecosystem Expansion Database Schema
-- AI, Blockchain, IoT, and DAO features

-- AI Decision Engine Tables
CREATE TABLE IF NOT EXISTS ecosystem_metrics (
    id VARCHAR(255) PRIMARY KEY,
    soil_health DECIMAL(3,2),
    water_quality DECIMAL(3,2),
    air_purity DECIMAL(3,2),
    biodiversity_index DECIMAL(3,2),
    carbon_sequestration DECIMAL(8,2),
    location JSONB,
    confidence DECIMAL(3,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50),
    priority VARCHAR(20),
    action TEXT,
    expected_impact DECIMAL(3,2),
    confidence DECIMAL(3,2),
    timeframe VARCHAR(100),
    cost DECIMAL(10,2),
    location JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_sensor_data (
    id VARCHAR(255) PRIMARY KEY,
    sensor_id VARCHAR(100),
    sensor_type VARCHAR(50),
    raw_data JSONB,
    processed_metrics JSONB,
    location JSONB,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain Tables
CREATE TABLE IF NOT EXISTS carbon_tokens (
    token_id VARCHAR(255) PRIMARY KEY,
    contract_address VARCHAR(100),
    owner VARCHAR(100),
    carbon_credits DECIMAL(10,2),
    project_id VARCHAR(255),
    minted_at TIMESTAMP,
    retired BOOLEAN DEFAULT false,
    retired_at TIMESTAMP,
    retirement_reason TEXT,
    metadata JSONB,
    tx_hash VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dao_proposals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500),
    description TEXT,
    proposer VARCHAR(100),
    voting_power INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    yes_votes INTEGER DEFAULT 0,
    no_votes INTEGER DEFAULT 0,
    status VARCHAR(20),
    tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dao_votes (
    id VARCHAR(255) PRIMARY KEY,
    proposal_id VARCHAR(255) REFERENCES dao_proposals(id),
    voter VARCHAR(100),
    support BOOLEAN,
    voting_power INTEGER,
    tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rve_transactions (
    id VARCHAR(255) PRIMARY KEY,
    from_address VARCHAR(100),
    to_address VARCHAR(100),
    amount DECIMAL(15,6),
    impact_data JSONB,
    tx_hash VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_contract_transactions (
    tx_hash VARCHAR(100) PRIMARY KEY,
    contract_address VARCHAR(100),
    function_name VARCHAR(100),
    parameters JSONB,
    gas_used INTEGER,
    status VARCHAR(20),
    block_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ecosystem_metrics_location ON ecosystem_metrics USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_ecosystem_metrics_timestamp ON ecosystem_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_carbon_tokens_owner ON carbon_tokens(owner);
CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX IF NOT EXISTS idx_rve_transactions_addresses ON rve_transactions(from_address, to_address);