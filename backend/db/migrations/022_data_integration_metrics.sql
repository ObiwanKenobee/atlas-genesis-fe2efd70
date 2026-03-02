-- Data Integration Metrics Engine Tables
-- Creates tables for data sources, metrics, and pipelines

-- Data Sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metric Definitions table
CREATE TABLE IF NOT EXISTS metric_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50),
    calculation_type VARCHAR(50) NOT NULL,
    aggregation_type VARCHAR(50) NOT NULL,
    dimensions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metric Data Points table
CREATE TABLE IF NOT EXISTS metric_data_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_definition_id UUID REFERENCES metric_definitions(id) ON DELETE CASCADE,
    source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    value DECIMAL(15, 4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dimensions JSONB DEFAULT '{}',
    quality_score DECIMAL(5, 2),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Pipelines table
CREATE TABLE IF NOT EXISTS data_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_id UUID REFERENCES data_sources(id),
    destination_id VARCHAR(255),
    schedule VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(50),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Checks table
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    metric_definition_id UUID REFERENCES metric_definitions(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(15, 4),
    severity VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Logs table
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES data_pipelines(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);

CREATE INDEX IF NOT EXISTS idx_metric_definitions_active ON metric_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_metric_definitions_category ON metric_definitions(category);

CREATE INDEX IF NOT EXISTS idx_metric_data_points_metric ON metric_data_points(metric_definition_id);
CREATE INDEX IF NOT EXISTS idx_metric_data_points_source ON metric_data_points(source_id);
CREATE INDEX IF NOT EXISTS idx_metric_data_points_timestamp ON metric_data_points(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_pipelines_status ON data_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_data_pipelines_source ON data_pipelines(source_id);

CREATE INDEX IF NOT EXISTS idx_quality_checks_metric ON quality_checks(metric_definition_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_active ON quality_checks(is_active);

CREATE INDEX IF NOT EXISTS idx_integration_logs_source ON integration_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_pipeline ON integration_logs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_data_sources_updated_at ON data_sources;
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
CREATE TRIGGER update_metric_definitions_updated_at
    BEFORE UPDATE ON metric_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_pipelines_updated_at ON data_pipelines;
CREATE TRIGGER update_data_pipelines_updated_at
    BEFORE UPDATE ON data_pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
