-- Security performance metrics table for monitoring security operation performance
CREATE TABLE IF NOT EXISTS security_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation VARCHAR(100) NOT NULL UNIQUE,
    total_calls BIGINT DEFAULT 0,
    successful_calls BIGINT DEFAULT 0,
    failed_calls BIGINT DEFAULT 0,
    average_duration DOUBLE PRECISION,
    min_duration DOUBLE PRECISION,
    max_duration DOUBLE PRECISION,
    p95_duration DOUBLE PRECISION,
    p99_duration DOUBLE PRECISION,
    total_memory_used BIGINT DEFAULT 0,
    average_memory_used DOUBLE PRECISION,
    error_rate DOUBLE PRECISION DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security performance alerts table
CREATE TABLE IF NOT EXISTS security_performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'duration', 'memory', 'error_rate', 'benchmark'
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    message TEXT NOT NULL,
    metrics JSONB,
    threshold JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security performance benchmarks table
CREATE TABLE IF NOT EXISTS security_performance_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation VARCHAR(100) NOT NULL UNIQUE,
    expected_duration DOUBLE PRECISION,
    max_duration DOUBLE PRECISION,
    expected_memory_usage BIGINT,
    max_memory_usage BIGINT,
    error_threshold DOUBLE PRECISION,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security incident tracking table
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_time INTERVAL, -- Time to respond
    resolution_time INTERVAL, -- Time to resolve
    affected_users INTEGER DEFAULT 0,
    affected_endpoints TEXT[],
    mitigation_steps TEXT[],
    root_cause TEXT,
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security compliance reports table
CREATE TABLE IF NOT EXISTS security_compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    compliance_score DOUBLE PRECISION, -- 0-100
    total_violations INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    high_violations INTEGER DEFAULT 0,
    medium_violations INTEGER DEFAULT 0,
    low_violations INTEGER DEFAULT 0,
    security_events INTEGER DEFAULT 0,
    performance_issues INTEGER DEFAULT 0,
    recommendations TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES users(id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_performance_metrics_operation ON security_performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_security_performance_metrics_last_updated ON security_performance_metrics(last_updated);

CREATE INDEX IF NOT EXISTS idx_security_performance_alerts_operation ON security_performance_alerts(operation);
CREATE INDEX IF NOT EXISTS idx_security_performance_alerts_created_at ON security_performance_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_performance_alerts_resolved ON security_performance_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_security_performance_benchmarks_operation ON security_performance_benchmarks(operation);
CREATE INDEX IF NOT EXISTS idx_security_performance_benchmarks_enabled ON security_performance_benchmarks(enabled);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at ON security_incidents(detected_at);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assigned_to ON security_incidents(assigned_to);

CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_period ON security_compliance_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_type ON security_compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_generated_at ON security_compliance_reports(generated_at);

-- Insert default benchmarks
INSERT INTO security_performance_benchmarks (operation, expected_duration, max_duration, expected_memory_usage, max_memory_usage, error_threshold) VALUES
('auth:verify_token', 50, 200, 1048576, 5242880, 0.05),
('auth:login', 150, 500, 2097152, 10485760, 0.10),
('rate_limit:check', 5, 20, 524288, 2097152, 0.01),
('validation:body', 10, 50, 262144, 1048576, 0.05),
('validation:response', 5, 25, 131072, 524288, 0.02),
('file_upload:validate', 100, 500, 10485760, 52428800, 0.10),
('security:headers', 2, 10, 65536, 262144, 0.005)
ON CONFLICT (operation) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_security_performance_metrics_updated_at BEFORE UPDATE ON security_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_performance_benchmarks_updated_at BEFORE UPDATE ON security_performance_benchmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();