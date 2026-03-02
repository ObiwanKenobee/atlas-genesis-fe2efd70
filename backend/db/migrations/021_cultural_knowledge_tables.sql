-- Migration: Create Cultural Knowledge Impact Platform tables
-- Created: 2024-02-07

-- ==========================================
-- Cultural Knowledge Records Table
-- ==========================================

CREATE TABLE IF NOT EXISTS cultural_knowledge_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    culture VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'tradition',
    impact_score DECIMAL(5,2) DEFAULT 0.00,
    preservation_status VARCHAR(50) DEFAULT 'active',
    community_size INTEGER DEFAULT 0,
    historical_significance DECIMAL(5,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Cultural Impact Metrics Table
-- ==========================================

CREATE TABLE IF NOT EXISTS cultural_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES cultural_knowledge_records(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    measurement_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Community Contributions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS cultural_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES cultural_knowledge_records(id) ON DELETE CASCADE,
    contributor_id UUID,
    contribution_type VARCHAR(50) NOT NULL,
    description TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Preservation Activities Table
-- ==========================================

CREATE TABLE IF NOT EXISTS preservation_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES cultural_knowledge_records(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planned',
    impact_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Indexes for Performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_cultural_records_culture ON cultural_knowledge_records(culture);
CREATE INDEX IF NOT EXISTS idx_cultural_records_region ON cultural_knowledge_records(region);
CREATE INDEX IF NOT EXISTS idx_cultural_records_category ON cultural_knowledge_records(category);
CREATE INDEX IF NOT EXISTS idx_cultural_records_preservation ON cultural_knowledge_records(preservation_status);
CREATE INDEX IF NOT EXISTS idx_cultural_records_created ON cultural_knowledge_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cultural_records_impact ON cultural_knowledge_records(impact_score DESC);

CREATE INDEX IF NOT EXISTS idx_cultural_metrics_record ON cultural_impact_metrics(record_id);
CREATE INDEX IF NOT EXISTS idx_cultural_metrics_type ON cultural_impact_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_cultural_metrics_date ON cultural_impact_metrics(measurement_date);

CREATE INDEX IF NOT EXISTS idx_contributions_record ON cultural_contributions(record_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON cultural_contributions(contributor_id);

CREATE INDEX IF NOT EXISTS idx_preservation_record ON preservation_activities(record_id);
CREATE INDEX IF NOT EXISTS idx_preservation_status ON preservation_activities(status);
CREATE INDEX IF NOT EXISTS idx_preservation_dates ON preservation_activities(start_date, end_date);

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE cultural_knowledge_records IS 'Stores cultural knowledge records from the Cultural Knowledge Impact Platform';
COMMENT ON TABLE cultural_impact_metrics IS 'Stores impact metrics for cultural knowledge records';
COMMENT ON TABLE cultural_contributions IS 'Tracks community contributions to cultural knowledge preservation';
COMMENT ON TABLE preservation_activities IS 'Records preservation activities for cultural knowledge';

COMMENT ON COLUMN cultural_knowledge_records.category IS 'tradition, practice, art, language, heritage';
COMMENT ON COLUMN cultural_knowledge_records.preservation_status IS 'active, endangered, critical, revitalized';
