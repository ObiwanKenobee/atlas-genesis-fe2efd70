-- Critical Components Database Schema
-- Minimal viable system

-- Users & Authentication (CRITICAL)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Carbon Projects (CRITICAL)
CREATE TABLE IF NOT EXISTS carbon_projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    location JSONB,
    area DECIMAL(12,2),
    co2_offset_per_credit DECIMAL(8,2) DEFAULT 1.0,
    price_per_credit DECIMAL(10,2),
    total_credits INTEGER,
    available_credits INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Holdings (CRITICAL)
CREATE TABLE IF NOT EXISTS user_holdings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    project_id VARCHAR(255) REFERENCES carbon_projects(id),
    quantity INTEGER NOT NULL,
    purchase_price DECIMAL(10,2),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retired BOOLEAN DEFAULT false,
    certificate_id VARCHAR(255)
);

-- Transactions (CRITICAL)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    project_id VARCHAR(255) REFERENCES carbon_projects(id),
    transaction_type VARCHAR(50),
    quantity INTEGER,
    total_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trust Scores (CRITICAL - Regenerative Architecture)
CREATE TABLE IF NOT EXISTS trust_scores (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) UNIQUE,
    current_score DECIMAL(3,2) DEFAULT 0.50,
    trust_level VARCHAR(20) DEFAULT 'emerging',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Pipelines (CRITICAL - Regenerative Architecture)
CREATE TABLE IF NOT EXISTS verification_pipelines (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    confidence DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ethical Constraints (CRITICAL - Regenerative Architecture)
CREATE TABLE IF NOT EXISTS ethical_constraints (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'hard' or 'soft'
    rule TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Critical Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON carbon_projects(status);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON user_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_user ON trust_scores(user_id);

-- Insert default ethical constraints
INSERT INTO ethical_constraints (id, name, type, rule) VALUES
('ec_basic_harm', 'Prevent Harm', 'hard', 'action.type !== "harmful"'),
('ec_min_trust', 'Minimum Trust', 'soft', 'user.trustLevel >= "emerging"')
ON CONFLICT (id) DO NOTHING;