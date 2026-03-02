-- Global Impact Economy Tables Migration
-- Creates tables for the Global Impact Economy workspace

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact_category VARCHAR(100),
    impact_score DECIMAL(10, 2) DEFAULT 0,
    carbon_credits DECIMAL(10, 2) DEFAULT 0,
    value_generated DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    location TEXT,
    beneficiaries_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impact metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Impact bonds table
CREATE TABLE IF NOT EXISTS impact_bonds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    face_value DECIMAL(15, 2) NOT NULL,
    current_price DECIMAL(15, 2) NOT NULL,
    impact_targets TEXT[],
    return_rate DECIMAL(5, 2) NOT NULL,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Microfinance opportunities table
CREATE TABLE IF NOT EXISTS microfinance_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    loan_amount DECIMAL(15, 2) NOT NULL,
    repayment_term INTEGER, -- in months
    interest_rate DECIMAL(5, 2),
    impact_score DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User impact tracking table
CREATE TABLE IF NOT EXISTS user_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    support_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    impact_score DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community contributions table
CREATE TABLE IF NOT EXISTS community_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES auth.users(id),
    contribution_type VARCHAR(100),
    contribution_value DECIMAL(15, 2) DEFAULT 0,
    impact_score DECIMAL(10, 2) DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(impact_category);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_impact_metrics_project ON impact_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_type ON impact_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_impact_bonds_status ON impact_bonds(status);
CREATE INDEX IF NOT EXISTS idx_impact_bonds_maturity ON impact_bonds(maturity_date);

CREATE INDEX IF NOT EXISTS idx_microfinance_status ON microfinance_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_microfinance_sector ON microfinance_opportunities(sector);

CREATE INDEX IF NOT EXISTS idx_user_impact_user ON user_impact(user_id);
CREATE INDEX IF NOT EXISTS idx_user_impact_project ON user_impact(project_id);

CREATE INDEX IF NOT EXISTS idx_community_contributions_project ON community_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_community_contributions_verified ON community_contributions(verified);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
