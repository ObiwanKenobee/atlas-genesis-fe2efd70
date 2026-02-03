-- Add regenerative finance products table
CREATE TABLE IF NOT EXISTS regenerative_finance_products (
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

-- Add regenerative finance case studies table
CREATE TABLE IF NOT EXISTS regenerative_finance_case_studies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    outcome VARCHAR(255),
    investment VARCHAR(100),
    impact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add regenerative finance testimonials table
CREATE TABLE IF NOT EXISTS regenerative_finance_testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    quote TEXT,
    impact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add financial reports table
CREATE TABLE IF NOT EXISTS financial_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    visibility VARCHAR(50) DEFAULT 'public',
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_rfp_active ON regenerative_finance_products(is_active);
CREATE INDEX IF NOT EXISTS idx_rfcs_active ON regenerative_finance_case_studies(is_active);
CREATE INDEX IF NOT EXISTS idx_rft_active ON regenerative_finance_testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_fr_active ON financial_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_fr_visibility ON financial_reports(visibility);

-- Insert sample data
INSERT INTO regenerative_finance_products (name, description, price_range, pricing_mechanism, value_justification, features, benefits, display_order) 
VALUES 
('Regeneration Bonds', 'Fixed-income securities tied to verified regenerative outcomes', 'Green bond certified', 'Outcome-linked coupons', 'Credit enhancement via impact verification', '["Green bond certified", "Outcome-linked coupons", "Credit enhancement via impact verification"]', '["Stable returns", "Impact investing", "Market liquidity"]', 1),
('Impact ETFs', 'Exchange-traded funds tracking regenerative assets', 'Diversified portfolio', 'Real-time impact tracking', 'Liquidity matching', '["Diversified portfolio", "Real-time impact tracking", "Liquidity matching"]', '["Broad market exposure", "Impact transparency", "Low fees"]', 2),
('Regeneration Certificates', 'Tokenized outcome-based financing instruments', 'Blockchain verification', 'Fractional ownership', 'Secondary market liquidity', '["Blockchain verification", "Fractional ownership", "Secondary market liquidity"]', '["Fractional investment", "Tradeable on secondary markets", "Blockchain security"]', 3);

INSERT INTO regenerative_finance_case_studies (name, description, outcome, investment, impact, display_order)
VALUES
('Reforestation in Amazon', 'Large-scale forest restoration project', '10,000 hectares restored', '$2.5M', '250,000 tons CO₂ sequestered', 1),
('Coastal Protection in Bangladesh', 'Community-led mangrove restoration', '50% flood risk reduction', '$1.8M', '200,000 people protected', 2),
('Regenerative Agriculture Fund', 'Investment in sustainable farming practices', '15% IRR + 100,000 tons CO₂', '$50M fund', '50,000 smallholder farmers', 3);

INSERT INTO regenerative_finance_testimonials (name, role, quote, impact, display_order)
VALUES
('Maria Lopez', 'Coffee Farmer, Colombia', 'The platform has connected our small cooperative to global buyers who value our regenerative practices. We''ve seen our income increase by 40% while improving our soil health.', '100 hectares reforested', 1),
('James Okoth', 'Youth Leader, Kenya', 'As a member of the Youth Council, I''ve learned so much about environmental stewardship and how to advocate for change in my community.', '500 students educated', 2),
('Dr. Sarah Chen', 'Researcher, China', 'The open data platform has revolutionized our climate research. We now have access to real-time impact data from projects around the world.', '20 peer-reviewed papers', 3);

-- Add foreign key constraints (if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE financial_reports
        ADD CONSTRAINT fk_financial_reports_created_by FOREIGN KEY (created_by)
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

CREATE TRIGGER regenerative_finance_products_updated_at
    BEFORE UPDATE ON regenerative_finance_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER regenerative_finance_case_studies_updated_at
    BEFORE UPDATE ON regenerative_finance_case_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER regenerative_finance_testimonials_updated_at
    BEFORE UPDATE ON regenerative_finance_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER financial_reports_updated_at
    BEFORE UPDATE ON financial_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
