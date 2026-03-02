-- ============================================================================
-- RVE Database Schema (PostgreSQL)
-- Production-ready schema with proper indexes, constraints, and audit trails
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'custodian', 'verifier', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    profile_data JSONB DEFAULT '{}',
    voting_power DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(verified);

-- ============================================================================
-- CUSTODIANS
-- ============================================================================

CREATE TABLE custodians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('indigenous', 'cooperative', 'ngo', 'research', 'government')),
    registration_number VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(100),
    location GEOGRAPHY(POINT),
    expertise TEXT[],
    team_size VARCHAR(50),
    founded_year INTEGER,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_date TIMESTAMP,
    reputation_score DECIMAL(5, 2) DEFAULT 0,
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custodians_user ON custodians(user_id);
CREATE INDEX idx_custodians_type ON custodians(type);
CREATE INDEX idx_custodians_status ON custodians(verification_status);
CREATE INDEX idx_custodians_location ON custodians USING GIST(location);

-- ============================================================================
-- ASSETS
-- ============================================================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('environmental', 'health', 'cultural', 'ecosystem')),
    custodian_id UUID REFERENCES custodians(id),
    total_supply DECIMAL(30, 8) NOT NULL,
    circulating_supply DECIMAL(30, 8) DEFAULT 0,
    contract_address VARCHAR(42),
    blockchain VARCHAR(50) DEFAULT 'ethereum',
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    project_description TEXT,
    location GEOGRAPHY(POINT),
    region VARCHAR(100),
    impact_metrics JSONB DEFAULT '{}',
    documentation JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_custodian ON assets(custodian_id);
CREATE INDEX idx_assets_verified ON assets(verified);
CREATE INDEX idx_assets_location ON assets USING GIST(location);

-- ============================================================================
-- ASSET PRICES
-- ============================================================================

CREATE TABLE asset_prices (
    id BIGSERIAL PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    price DECIMAL(20, 8) NOT NULL,
    volume_24h DECIMAL(30, 8) DEFAULT 0,
    market_cap DECIMAL(30, 8),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_prices_asset ON asset_prices(asset_id);
CREATE INDEX idx_asset_prices_timestamp ON asset_prices(timestamp DESC);
CREATE INDEX idx_asset_prices_asset_time ON asset_prices(asset_id, timestamp DESC);

-- ============================================================================
-- IMPACT REPORTS
-- ============================================================================

CREATE TABLE impact_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    custodian_id UUID REFERENCES custodians(id),
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    metrics JSONB NOT NULL,
    verification_methods TEXT[],
    documents JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID[],
    verification_date TIMESTAMP,
    ai_confidence DECIMAL(5, 2),
    narrative_text TEXT,
    challenges TEXT,
    next_steps TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_impact_reports_project ON impact_reports(project_id);
CREATE INDEX idx_impact_reports_custodian ON impact_reports(custodian_id);
CREATE INDEX idx_impact_reports_status ON impact_reports(status);
CREATE INDEX idx_impact_reports_period ON impact_reports(reporting_period_end DESC);

-- ============================================================================
-- GOVERNANCE PROPOSALS
-- ============================================================================

CREATE TABLE governance_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposer_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('protocol', 'treasury', 'verification', 'community')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'passed', 'rejected', 'executed')),
    votes_for DECIMAL(30, 8) DEFAULT 0,
    votes_against DECIMAL(30, 8) DEFAULT 0,
    votes_abstain DECIMAL(30, 8) DEFAULT 0,
    quorum DECIMAL(30, 8) NOT NULL,
    execution_data JSONB,
    deadline TIMESTAMP NOT NULL,
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_proposals_status ON governance_proposals(status);
CREATE INDEX idx_proposals_deadline ON governance_proposals(deadline);
CREATE INDEX idx_proposals_category ON governance_proposals(category);

-- ============================================================================
-- GOVERNANCE VOTES
-- ============================================================================

CREATE TABLE governance_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id),
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (0, 1, 2)), -- 0=for, 1=against, 2=abstain
    voting_power DECIMAL(30, 8) NOT NULL,
    comment TEXT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(proposal_id, voter_id)
);

CREATE INDEX idx_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX idx_votes_voter ON governance_votes(voter_id);

-- ============================================================================
-- TRADING
-- ============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    asset_id UUID REFERENCES assets(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('market', 'limit', 'stop')),
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    amount DECIMAL(30, 8) NOT NULL,
    price DECIMAL(20, 8),
    filled_amount DECIMAL(30, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'filled', 'cancelled')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_asset ON orders(asset_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    asset_id UUID REFERENCES assets(id),
    amount DECIMAL(30, 8) NOT NULL,
    price DECIMAL(20, 8),
    total_value DECIMAL(30, 8),
    fee DECIMAL(30, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    blockchain_tx_hash VARCHAR(66),
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON transactions(from_user_id);
CREATE INDEX idx_transactions_to ON transactions(to_user_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_hash ON transactions(blockchain_tx_hash);

-- ============================================================================
-- ORACLE VERIFICATIONS
-- ============================================================================

CREATE TABLE oracle_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES assets(id),
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    confidence DECIMAL(5, 2),
    data_points INTEGER,
    ai_model_version VARCHAR(50),
    results JSONB,
    satellite_images TEXT[],
    sensor_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_oracle_project ON oracle_verifications(project_id);
CREATE INDEX idx_oracle_status ON oracle_verifications(status);
CREATE INDEX idx_oracle_created ON oracle_verifications(created_at DESC);

-- ============================================================================
-- DEFI - LIQUIDITY POOLS
-- ============================================================================

CREATE TABLE liquidity_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    token0_id UUID REFERENCES assets(id),
    token1_id UUID REFERENCES assets(id),
    reserve0 DECIMAL(30, 8) DEFAULT 0,
    reserve1 DECIMAL(30, 8) DEFAULT 0,
    total_lp_supply DECIMAL(30, 8) DEFAULT 0,
    fee_percentage DECIMAL(5, 4) DEFAULT 0.003,
    contract_address VARCHAR(42),
    blockchain VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pools_tokens ON liquidity_pools(token0_id, token1_id);

-- ============================================================================
-- DEFI - LIQUIDITY POSITIONS
-- ============================================================================

CREATE TABLE liquidity_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES liquidity_pools(id),
    user_id UUID REFERENCES users(id),
    lp_tokens DECIMAL(30, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lp_positions_pool ON liquidity_positions(pool_id);
CREATE INDEX idx_lp_positions_user ON liquidity_positions(user_id);

-- ============================================================================
-- DEFI - YIELD FARMS
-- ============================================================================

CREATE TABLE yield_farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    staking_token_id UUID REFERENCES assets(id),
    reward_token_id UUID REFERENCES assets(id),
    apy DECIMAL(10, 2),
    total_staked DECIMAL(30, 8) DEFAULT 0,
    lock_period INTEGER, -- in days
    impact_project_id UUID REFERENCES assets(id),
    contract_address VARCHAR(42),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_farms_active ON yield_farms(active);

-- ============================================================================
-- DEFI - STAKING POSITIONS
-- ============================================================================

CREATE TABLE staking_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES yield_farms(id),
    user_id UUID REFERENCES users(id),
    staked_amount DECIMAL(30, 8) NOT NULL,
    rewards_earned DECIMAL(30, 8) DEFAULT 0,
    staked_at TIMESTAMP DEFAULT NOW(),
    unlock_at TIMESTAMP,
    unstaked_at TIMESTAMP
);

CREATE INDEX idx_staking_farm ON staking_positions(farm_id);
CREATE INDEX idx_staking_user ON staking_positions(user_id);

-- ============================================================================
-- TRADITIONAL KNOWLEDGE
-- ============================================================================

CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('medicinal', 'agricultural', 'ecological', 'spiritual', 'craft')),
    community_id UUID REFERENCES custodians(id),
    region VARCHAR(100),
    location GEOGRAPHY(POINT),
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('public', 'restricted', 'sacred')),
    content TEXT,
    language VARCHAR(50),
    verifiers UUID[],
    related_nodes UUID[],
    impact_description TEXT,
    documents JSONB DEFAULT '[]',
    access_requests JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_category ON knowledge_nodes(category);
CREATE INDEX idx_knowledge_community ON knowledge_nodes(community_id);
CREATE INDEX idx_knowledge_access ON knowledge_nodes(access_level);
CREATE INDEX idx_knowledge_location ON knowledge_nodes USING GIST(location);

-- ============================================================================
-- BIODIVERSITY TOKENS
-- ============================================================================

CREATE TABLE biodiversity_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    iucn_status VARCHAR(50) CHECK (iucn_status IN ('critically_endangered', 'endangered', 'vulnerable', 'near_threatened')),
    token_symbol VARCHAR(20) UNIQUE NOT NULL,
    population_count INTEGER,
    last_population_update TIMESTAMP,
    region VARCHAR(255),
    conservation_projects UUID[],
    token_supply DECIMAL(30, 8),
    price DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bio_tokens_status ON biodiversity_tokens(iucn_status);
CREATE INDEX idx_bio_tokens_symbol ON biodiversity_tokens(token_symbol);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custodians_updated_at BEFORE UPDATE ON custodians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_reports_updated_at BEFORE UPDATE ON impact_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON governance_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Market Overview View
CREATE VIEW market_overview AS
SELECT
    COUNT(DISTINCT a.id) as total_assets,
    SUM(ap.market_cap) as total_market_cap,
    SUM(ap.volume_24h) as volume_24h,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT c.id) as total_custodians
FROM assets a
LEFT JOIN LATERAL (
    SELECT market_cap, volume_24h
    FROM asset_prices
    WHERE asset_id = a.id
    ORDER BY timestamp DESC
    LIMIT 1
) ap ON true
CROSS JOIN (SELECT COUNT(*) FROM users) u(id)
CROSS JOIN (SELECT COUNT(*) FROM custodians WHERE verification_status = 'verified') c(id);

-- User Portfolio View
CREATE VIEW user_portfolios AS
SELECT
    t.to_user_id as user_id,
    t.asset_id,
    a.symbol,
    a.name,
    SUM(CASE WHEN t.to_user_id = t.to_user_id THEN t.amount ELSE 0 END) -
    SUM(CASE WHEN t.from_user_id = t.to_user_id THEN t.amount ELSE 0 END) as total_amount,
    AVG(t.price) as average_price
FROM transactions t
JOIN assets a ON a.id = t.asset_id
WHERE t.status = 'completed'
GROUP BY t.to_user_id, t.asset_id, a.symbol, a.name;
