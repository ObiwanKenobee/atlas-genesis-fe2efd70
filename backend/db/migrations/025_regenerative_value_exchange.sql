-- =====================================================
-- REGENERATIVE VALUE EXCHANGE (RVE)
-- Carbon Credit Trading & Token Economics Database Schema
-- =====================================================

-- Carbon Credits Table
CREATE TABLE IF NOT EXISTS carbon_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    credit_type VARCHAR(50) NOT NULL, -- 'forestry', 'renewable', 'methane', 'efficiency'
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    quantity DECIMAL(20, 4) NOT NULL,
    unit_price DECIMAL(20, 8) NOT NULL,
    vintage_year INTEGER NOT NULL,
    certification_standard VARCHAR(100), -- 'VCS', 'Gold Standard', 'CDM', etc.
    verification_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'pending', 'traded', 'retired'
    metadata JSONB DEFAULT '{}',
    verifier_id UUID REFERENCES verifiers(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carbon_credits_project ON carbon_credits(project_id);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_status ON carbon_credits(status);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_credit_type ON carbon_credits(credit_type);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_vintage ON carbon_credits(vintage_year);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id UUID NOT NULL REFERENCES carbon_credits(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id),
    seller_id UUID REFERENCES auth.users(id),
    amount DECIMAL(20, 4) NOT NULL,
    unit_price DECIMAL(20, 8) NOT NULL,
    total_price DECIMAL(20, 8) NOT NULL,
    trade_type VARCHAR(20) NOT NULL, -- 'market', 'OTC', 'auction'
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
    transaction_hash VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_credit ON trades(credit_id);
CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller ON trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at);

-- Token Configuration Table
CREATE TABLE IF NOT EXISTS token_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    decimals INTEGER DEFAULT 18,
    total_supply DECIMAL(30, 0),
    current_price DECIMAL(20, 8) DEFAULT 0,
    token_type VARCHAR(50) NOT NULL, -- 'impact', 'governance', 'reward', 'carbon_offset'
    utility_description TEXT,
    emission_rate DECIMAL(20, 8), -- tokens per impact unit
    burn_rate DECIMAL(5, 4), -- percentage that can be burned
    governance_weight DECIMAL(5, 2), -- voting power multiplier
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_config_symbol ON token_config(symbol);
CREATE INDEX IF NOT EXISTS idx_token_config_type ON token_config(token_type);

-- Token Mints/Burns Table
CREATE TABLE IF NOT EXISTS token_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES token_config(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL,
    amount DECIMAL(30, 0) NOT NULL,
    minted_by UUID REFERENCES auth.users(id),
    reason VARCHAR(100), -- 'impact_reward', 'grant', 'staking', 'community'
    burned BOOLEAN DEFAULT FALSE,
    burn_reason VARCHAR(100),
    transaction_hash VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_mints_token ON token_mints(token_id);
CREATE INDEX IF NOT EXISTS idx_token_mints_wallet ON token_mints(wallet_id);
CREATE INDEX IF NOT EXISTS idx_token_mints_burned ON token_mints(burned);

-- User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES token_config(id) ON DELETE CASCADE,
    balance DECIMAL(30, 0) DEFAULT 0,
    locked_balance DECIMAL(30, 0) DEFAULT 0, -- for staking, governance
    pending_balance DECIMAL(30, 0) DEFAULT 0,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_token ON user_wallets(token_id);

-- Impact Derivatives Table
CREATE TABLE IF NOT EXISTS impact_derivatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    derivative_type VARCHAR(50) NOT NULL, -- 'forward', 'option', 'swap', 'contingent'
    underlying_metric VARCHAR(100) NOT NULL, -- 'co2_reduction', 'biodiversity', 'water_conservation'
    strike_value DECIMAL(20, 8),
    notional_amount DECIMAL(20, 8),
    currency VARCHAR(10) DEFAULT 'USD',
    expiration_date TIMESTAMPTZ,
    settlement_type VARCHAR(20), -- 'cash', 'physical'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'settled', 'cancelled'
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impact_derivatives_type ON impact_derivatives(derivative_type);
CREATE INDEX IF NOT EXISTS idx_impact_derivatives_underlying ON impact_derivatives(underlying_metric);
CREATE INDEX IF NOT EXISTS idx_impact_derivatives_status ON impact_derivatives(status);

-- Impact Derivative Positions Table
CREATE TABLE IF NOT EXISTS derivative_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    derivative_id UUID NOT NULL REFERENCES impact_derivatives(id) ON DELETE CASCADE,
    holder_id UUID NOT NULL REFERENCES auth.users(id),
    position_type VARCHAR(10) NOT NULL, -- 'long', 'short'
    quantity DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 8),
    leverage DECIMAL(5, 2) DEFAULT 1,
    margin_amount DECIMAL(20, 8),
    pnl DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'liquidated'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_derivative_positions_derivative ON derivative_positions(derivative_id);
CREATE INDEX IF NOT EXISTS idx_derivative_positions_holder ON derivative_positions(holder_id);

-- Carbon Market Analytics Table
CREATE TABLE IF NOT EXISTS carbon_market_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_volume DECIMAL(20, 8) DEFAULT 0,
    trade_count INTEGER DEFAULT 0,
    avg_price DECIMAL(20, 8),
    price_change DECIMAL(10, 4),
    credits_traded DECIMAL(20, 4),
    active_contracts INTEGER,
    market_cap DECIMAL(20, 8),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carbon_analytics_date ON carbon_market_analytics(date);

-- Impact Token Price Oracle Table
CREATE TABLE IF NOT EXISTS token_price_oracle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES token_config(id) ON DELETE CASCADE,
    price DECIMAL(20, 8) NOT NULL,
    volume_24h DECIMAL(20, 8),
    market_cap DECIMAL(20, 8),
    price_change_24h DECIMAL(10, 4),
    liquidity DECIMAL(20, 8),
    source VARCHAR(50), -- 'uniswap', 'coingecko', 'manual'
    confidence_score DECIMAL(3, 2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(token_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_token_price_oracle_token ON token_price_oracle(token_id);
CREATE INDEX IF NOT EXISTS idx_token_price_oracle_recorded ON token_price_oracle(recorded_at);

-- Redemption Reserves Table (for impact-backed tokens)
CREATE TABLE IF NOT EXISTS redemption_reserves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES token_config(id) ON DELETE CASCADE,
    reserve_type VARCHAR(50) NOT NULL, -- 'carbon_credits', 'usdc', 'real_world_assets'
    asset_id UUID, -- reference to actual asset (e.g., carbon_credit.id)
    asset_amount DECIMAL(30, 0),
    token_amount_covered DECIMAL(30, 0),
    ratio DECIMAL(20, 10), -- asset_value / token_value
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemption_reserves_token ON redemption_reserves(token_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_carbon_credits_updated_at
    BEFORE UPDATE ON carbon_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_config_updated_at
    BEFORE UPDATE ON token_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_derivatives_updated_at
    BEFORE UPDATE ON impact_derivatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_derivative_positions_updated_at
    BEFORE UPDATE ON derivative_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate token value based on reserves
CREATE OR REPLACE FUNCTION calculate_token_redemption_value(p_token_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_reserves DECIMAL(30, 0);
    v_total_supply DECIMAL(30, 0);
    v_redemption_ratio DECIMAL(20, 10);
BEGIN
    -- Sum of all asset amounts in reserves
    SELECT COALESCE(SUM(ar.asset_amount), 0) INTO v_total_reserves
    FROM redemption_reserves rr
    JOIN asset_reserves ar ON rr.id = ar.reserve_id
    WHERE rr.token_id = p_token_id AND rr.status = 'active';

    -- Get total supply
    SELECT total_supply INTO v_total_supply
    FROM token_config WHERE id = p_token_id;

    -- Calculate redemption ratio
    IF v_total_supply > 0 THEN
        v_redemption_ratio := v_total_reserves / v_total_supply;
    ELSE
        v_redemption_ratio := 0;
    END IF;

    RETURN v_redemption_ratio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-generate credit serial number
CREATE OR REPLACE FUNCTION generate_credit_serial()
RETURNS TRIGGER AS $$
DECLARE
    v_prefix VARCHAR(10);
BEGIN
    -- Generate prefix based on credit type
    v_prefix := CASE NEW.credit_type
        WHEN 'forestry' THEN 'FOR'
        WHEN 'renewable' THEN 'REN'
        WHEN 'methane' THEN 'MET'
        WHEN 'efficiency' THEN 'EFF'
        ELSE 'GEN'
    END;

    -- Format: PREFIX-YYYY-NNNNNN
    NEW.serial_number := v_prefix || '-' || NEW.vintage_year::TEXT || '-' || 
                         TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                         LEFT(gen_random_uuid()::TEXT, 8);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply serial number trigger
CREATE TRIGGER generate_carbon_credit_serial
    BEFORE INSERT ON carbon_credits
    FOR EACH ROW
    WHEN (NEW.serial_number IS NULL)
    EXECUTE FUNCTION generate_credit_serial();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default token configurations
INSERT INTO token_config (name, symbol, decimals, token_type, utility_description)
VALUES 
    ('Atlas Impact Token', 'ATLAS', 18, 'impact', 'Reward token for verified impact contributions'),
    ('Governance Token', 'AGOV', 18, 'governance', 'Voting rights for platform governance'),
    ('Carbon Offset Token', 'CO2T', 18, 'carbon_offset', 'Token backed by verified carbon credits'),
    ('Community Reward', 'CREW', 18, 'reward', 'Reward for community contributions')
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample carbon credit types
INSERT INTO carbon_credits (project_id, credit_type, quantity, unit_price, vintage_year, certification_standard)
SELECT 
    p.id,
    CASE (p.id::text % 4)::integer
        WHEN 0 THEN 'forestry'
        WHEN 1 THEN 'renewable'
        WHEN 2 THEN 'methane'
        ELSE 'efficiency'
    END,
    10000 + (random() * 50000),
    10 + (random() * 50),
    2020 + (random() * 5)::integer,
    CASE (p.id::text % 3)::integer
        WHEN 0 THEN 'VCS'
        WHEN 1 THEN 'Gold Standard'
        ELSE 'CDM'
    END
FROM projects p
LIMIT 10
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Carbon Credit Market Summary
CREATE OR REPLACE VIEW v_carbon_market_summary AS
SELECT 
    cc.credit_type,
    COUNT(*) as total_credits,
    SUM(cc.quantity) as total_quantity,
    AVG(cc.unit_price) as avg_price,
    SUM(cc.quantity * cc.unit_price) as total_value,
    COUNT(DISTINCT cc.project_id) as projects_count
FROM carbon_credits cc
WHERE cc.status = 'available'
GROUP BY cc.credit_type;

-- View: Token Holder Rankings
CREATE OR REPLACE VIEW v_token_holders AS
SELECT 
    tk.symbol,
    uw.user_id,
    uw.balance,
    RANK() OVER (PARTITION BY tk.id ORDER BY uw.balance DESC) as rank,
    (uw.balance / NULLIF(SUM(uw.balance) OVER (PARTITION BY tk.id), 0) * 100) as percentage
FROM user_wallets uw
JOIN token_config tk ON uw.token_id = tk.id
ORDER BY tk.symbol, rank;

-- View: Trade Analytics Summary
CREATE OR REPLACE VIEW v_trade_analytics AS
SELECT 
    DATE_TRUNC('day', t.created_at) as date,
    COUNT(*) as trade_count,
    SUM(t.amount) as total_amount,
    SUM(t.total_price) as total_volume,
    AVG(t.unit_price) as avg_price,
    COUNT(DISTINCT t.buyer_id) as unique_buyers,
    COUNT(DISTINCT t.seller_id) as unique_sellers
FROM trades t
GROUP BY DATE_TRUNC('day', t.created_at)
ORDER BY date;
