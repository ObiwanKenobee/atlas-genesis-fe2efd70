-- Token versioning for forced logout capabilities
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version integer DEFAULT 1;

-- Add device_fingerprint to refresh_tokens if not exists
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS device_fingerprint text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_token_version ON users(token_version);