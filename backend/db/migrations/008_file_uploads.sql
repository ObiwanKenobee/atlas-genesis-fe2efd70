-- File upload security and tracking enhancements
-- Migration: 008_file_uploads.sql

-- Add file upload tracking fields to assets table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'file_path') THEN
        ALTER TABLE assets ADD COLUMN file_path text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'file_name') THEN
        ALTER TABLE assets ADD COLUMN file_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'file_size') THEN
        ALTER TABLE assets ADD COLUMN file_size bigint;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'mime_type') THEN
        ALTER TABLE assets ADD COLUMN mime_type text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'file_hash') THEN
        ALTER TABLE assets ADD COLUMN file_hash text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'upload_status') THEN
        ALTER TABLE assets ADD COLUMN upload_status text DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'quarantined', 'approved', 'rejected'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'scan_status') THEN
        ALTER TABLE assets ADD COLUMN scan_status text DEFAULT 'not_scanned' CHECK (scan_status IN ('not_scanned', 'scanning', 'clean', 'infected', 'suspicious'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'quarantine_reason') THEN
        ALTER TABLE assets ADD COLUMN quarantine_reason text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'version') THEN
        ALTER TABLE assets ADD COLUMN version integer DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'previous_version_id') THEN
        ALTER TABLE assets ADD COLUMN previous_version_id uuid REFERENCES assets(id);
    END IF;
END $$;

-- Create file upload sessions table for tracking multipart uploads
CREATE TABLE file_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  total_size bigint NOT NULL,
  uploaded_size bigint DEFAULT 0,
  chunk_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  expires_at timestamptz NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create file access logs table for security auditing
CREATE TABLE file_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('upload', 'download', 'delete', 'access', 'scan', 'quarantine')),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create file scan results table
CREATE TABLE file_scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  scanner_name text NOT NULL,
  scan_version text,
  threat_level text CHECK (threat_level IN ('clean', 'low', 'medium', 'high', 'critical')),
  threats_found jsonb,
  scan_metadata jsonb,
  scanned_at timestamptz DEFAULT now()
);

-- Create file upload policies table
CREATE TABLE file_upload_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  max_file_size bigint,
  allowed_mime_types text[],
  allowed_extensions text[],
  blocked_patterns text[],
  rate_limit_requests integer,
  rate_limit_window_minutes integer,
  quarantine_suspicious boolean DEFAULT true,
  require_scan boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default file upload policy
INSERT INTO file_upload_policies (
  name,
  description,
  max_file_size,
  allowed_mime_types,
  allowed_extensions,
  blocked_patterns,
  rate_limit_requests,
  rate_limit_window_minutes,
  quarantine_suspicious,
  require_scan
) VALUES (
  'default',
  'Default file upload policy for general assets',
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/json'],
  ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'json'],
  ARRAY['\\.exe$', '\\.bat$', '\\.cmd$', '\\.scr$', '\\.pif$', '\\.com$'],
  10, -- 10 uploads
  60, -- per hour
  true,
  true
);

-- Create indexes for performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_assets_file_hash') THEN
        CREATE INDEX idx_assets_file_hash ON assets(file_hash);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_assets_upload_status') THEN
        CREATE INDEX idx_assets_upload_status ON assets(upload_status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_assets_scan_status') THEN
        CREATE INDEX idx_assets_scan_status ON assets(scan_status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_upload_sessions_user_id') THEN
        CREATE INDEX idx_file_upload_sessions_user_id ON file_upload_sessions(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_upload_sessions_status') THEN
        CREATE INDEX idx_file_upload_sessions_status ON file_upload_sessions(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_upload_sessions_expires_at') THEN
        CREATE INDEX idx_file_upload_sessions_expires_at ON file_upload_sessions(expires_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_access_logs_asset_id') THEN
        CREATE INDEX idx_file_access_logs_asset_id ON file_access_logs(asset_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_access_logs_user_id') THEN
        CREATE INDEX idx_file_access_logs_user_id ON file_access_logs(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_access_logs_created_at') THEN
        CREATE INDEX idx_file_access_logs_created_at ON file_access_logs(created_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_scan_results_asset_id') THEN
        CREATE INDEX idx_file_scan_results_asset_id ON file_scan_results(asset_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_upload_policies_active') THEN
        CREATE INDEX idx_file_upload_policies_active ON file_upload_policies(is_active);
    END IF;
END $$;

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_file_upload_sessions_updated_at
    BEFORE UPDATE ON file_upload_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_upload_policies_updated_at
    BEFORE UPDATE ON file_upload_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();