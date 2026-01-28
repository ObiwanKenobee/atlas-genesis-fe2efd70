-- Migration: Add phone number and updated roles to users table
-- Date: 2024-06-18

-- Add phone number field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add index for phone number
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Create a new role management table for more flexible role definitions
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Update existing users with default profile data
UPDATE users 
SET profile_data = '{"onboardingCompleted": false}'::jsonb 
WHERE profile_data IS NULL;

-- Add foreign key constraints if not exists
DO $$ 
BEGIN
    -- Check if user_roles table has the required constraints
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_fkey' 
        AND conrelid = 'user_roles'::regclass
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial user roles for existing users
INSERT INTO user_roles (user_id, role, is_primary)
SELECT 
    id, 
    COALESCE(role, 'individual') AS role, 
    TRUE 
FROM users 
ON CONFLICT DO NOTHING;

-- Update the role column in users table to support new role types
ALTER TABLE users 
ALTER COLUMN role TYPE VARCHAR(50);

-- Update default role if needed
UPDATE users 
SET role = 'producer' 
WHERE role IS NULL OR role = '';

-- Create a view to get user roles with metadata
CREATE OR REPLACE VIEW user_with_roles AS
SELECT 
    u.*,
    ARRAY_AGG(ur.role) AS roles,
    MIN(CASE WHEN ur.is_primary THEN ur.role ELSE NULL END) AS primary_role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id;
