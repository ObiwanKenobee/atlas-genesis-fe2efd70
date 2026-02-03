-- Add DeFi products table
CREATE TABLE IF NOT EXISTS defi_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_range VARCHAR(100),
    pricing_mechanism VARCHAR(255),
    value_justification TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add DeFi segments table
CREATE TABLE IF NOT EXISTS defi_segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    primary_customers VARCHAR(255),
    what_is_being_priced TEXT,
    pricing_mechanism VARCHAR(255),
    price_range VARCHAR(100),
    value_justification TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add DeFi technical infrastructure table
CREATE TABLE IF NOT EXISTS defi_technical_infrastructure (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    technology VARCHAR(255),
    security_rating VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add blockchain networks table
CREATE TABLE IF NOT EXISTS blockchain_networks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    chain_id VARCHAR(50),
    symbol VARCHAR(10),
    average_block_time VARCHAR(50),
    transaction_fee VARCHAR(50),
    network_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add smart contracts table
CREATE TABLE IF NOT EXISTS smart_contracts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contract_address VARCHAR(255),
    abi TEXT,
    network VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(50) DEFAULT 'public',
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add oracle feeds table
CREATE TABLE IF NOT EXISTS oracle_feeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    oracle_provider VARCHAR(255),
    update_frequency VARCHAR(50),
    data_sources VARCHAR(255),
    network VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add DeFi statistics table
CREATE TABLE IF NOT EXISTS defi_statistics (
    id SERIAL PRIMARY KEY,
    total_value_locked DECIMAL(10, 2),
    daily_volume DECIMAL(10, 2),
    active_addresses INTEGER,
    average_apy DECIMAL(5, 2),
    total_transactions INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_defi_products_active ON defi_products(is_active);
CREATE INDEX IF NOT EXISTS idx_defi_segments_active ON defi_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_defi_infrastructure_active ON defi_technical_infrastructure(is_active);
CREATE INDEX IF NOT EXISTS idx_blockchain_networks_active ON blockchain_networks(is_active);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_active ON smart_contracts(is_active);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_visibility ON smart_contracts(visibility);
CREATE INDEX IF NOT EXISTS idx_oracle_feeds_active ON oracle_feeds(is_active);
CREATE INDEX IF NOT EXISTS idx_defi_statistics_last_updated ON defi_statistics(last_updated);

-- Insert sample data
INSERT INTO defi_products (name, description, price_range, pricing_mechanism, value_justification, features, benefits, display_order)
VALUES
('RIU Token', 'Tokenized Regenerative Impact Units', '$82.10', 'Market price fluctuations', 'ERC-20 standard', '["ERC-20 standard", "Backed by verified impact", "Audited smart contracts"]', '["Tradeable on exchanges", "Staking rewards", "Governance rights"]', 1),
('Impact Oracle', 'Decentralized impact verification oracle', '$0.001 per API call', 'On-chain reporting', 'Real-time data feeds', '["Real-time data feeds", "Multi-source validation", "On-chain reporting"]', '["Secure data source", "Tamper-proof verification", "Cost-effective"]', 2),
('Regeneration Vaults', 'Automated yield farming strategies', 'Variable APY', 'Yield farming', 'Risk-managed returns', '["Algorithmic strategies", "Risk-managed returns", "Impact-weighted allocations"]', '["Automated yield optimization", "Diversified exposure", "Low fees"]', 3);

INSERT INTO defi_technical_infrastructure (name, description, features, technology, security_rating, display_order)
VALUES
('Smart Contracts', 'Audited, battle-tested smart contracts for regenerative finance', '["ERC-20 tokens", "Yield farming", "Staking", "Governance"]', 'Solidity', 'High', 1),
('Oracles', 'Decentralized oracle network for real-time impact data', '["Data aggregation", "Multi-source verification", "On-chain reporting"]', 'Chainlink', 'High', 2),
('Bridge Infrastructure', 'Cross-chain compatibility for seamless asset transfers', '["Multi-chain support", "Instant transfers", "Security audits"]', 'ChainBridge', 'Medium', 3);

INSERT INTO blockchain_networks (name, chain_id, symbol, average_block_time, transaction_fee, network_type, display_order)
VALUES
('Ethereum', '1', 'ETH', '12 seconds', 'Variable', 'Mainnet', 1),
('Polygon', '137', 'MATIC', '2 seconds', 'Low', 'Layer 2', 2),
('Binance Smart Chain', '56', 'BNB', '3 seconds', 'Low', 'Mainnet', 3);

INSERT INTO oracle_feeds (name, description, oracle_provider, update_frequency, data_sources, network, display_order)
VALUES
('Satellite Data Feed', 'Real-time satellite imagery for impact verification', 'Planet Labs', '10 minutes', 'Satellite, IoT sensors', 'Ethereum', 1),
('Weather Data Feed', 'Weather patterns and climate information', 'OpenWeather', '1 minute', 'Weather stations', 'Polygon', 2),
('Impact Metrics Feed', 'Verification of regenerative outcomes', 'Verra', 'Daily', 'Third-party auditors', 'Binance Smart Chain', 3);

INSERT INTO defi_statistics (total_value_locked, daily_volume, active_addresses, average_apy, total_transactions)
VALUES
(250000000, 5000000, 15000, 8.5, 120000);

-- Add foreign key constraints (if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE smart_contracts
        ADD CONSTRAINT fk_smart_contracts_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER defi_products_updated_at
    BEFORE UPDATE ON defi_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER defi_segments_updated_at
    BEFORE UPDATE ON defi_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER defi_technical_infrastructure_updated_at
    BEFORE UPDATE ON defi_technical_infrastructure
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER blockchain_networks_updated_at
    BEFORE UPDATE ON blockchain_networks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER smart_contracts_updated_at
    BEFORE UPDATE ON smart_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER oracle_feeds_updated_at
    BEFORE UPDATE ON oracle_feeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER defi_statistics_updated_at
    BEFORE UPDATE ON defi_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
