-- Admin Dashboard Database Schema
-- Migration for the Professional Admin Template

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ============================================
-- ADMIN ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO admin_roles (id, name, description, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Full system access', true),
    ('00000000-0000-0000-0000-000000000002', 'admin', 'Standard admin access', true),
    ('00000000-0000-0000-0000-000000000003', 'moderator', 'Limited moderation access', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ADMIN PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO admin_permissions (id, name, description, resource, action) VALUES
    -- User permissions
    ('00000000-0000-0000-0000-000000000101', 'users:read', 'View users', 'users', 'read'),
    ('00000000-0000-0000-0000-000000000102', 'users:create', 'Create users', 'users', 'create'),
    ('00000000-0000-0000-0000-000000000103', 'users:update', 'Update users', 'users', 'update'),
    ('00000000-0000-0000-0000-000000000104', 'users:delete', 'Delete users', 'users', 'delete'),
    
    -- Role permissions
    ('00000000-0000-0000-0000-000000000201', 'roles:read', 'View roles', 'roles', 'read'),
    ('00000000-0000-0000-0000-000000000202', 'roles:create', 'Create roles', 'roles', 'create'),
    ('00000000-0000-0000-0000-000000000203', 'roles:update', 'Update roles', 'roles', 'update'),
    ('00000000-0000-0000-0000-000000000204', 'roles:delete', 'Delete roles', 'roles', 'delete'),
    
    -- Dashboard permissions
    ('00000000-0000-0000-0000-000000000301', 'dashboard:read', 'View dashboard', 'dashboard', 'read'),
    ('00000000-0000-0000-0000-000000000302', 'dashboard:export', 'Export dashboard data', 'dashboard', 'export'),
    
    -- Analytics permissions
    ('00000000-0000-0000-0000-000000000401', 'analytics:read', 'View analytics', 'analytics', 'read'),
    ('00000000-0000-0000-0000-000000000402', 'analytics:export', 'Export analytics', 'analytics', 'export'),
    
    -- Settings permissions
    ('00000000-0000-0000-0000-000000000501', 'settings:read', 'View settings', 'settings', 'read'),
    ('00000000-0000-0000-0000-000000000502', 'settings:update', 'Update settings', 'settings', 'update'),
    
    -- Alerts permissions
    ('00000000-0000-0000-0000-000000000601', 'alerts:read', 'View alerts', 'alerts', 'read'),
    ('00000000-0000-0000-0000-000000000602', 'alerts:manage', 'Manage alerts', 'alerts', 'manage'),
    
    -- Audit permissions
    ('00000000-0000-0000-0000-000000000701', 'audit:read', 'View audit logs', 'audit', 'read'),
    ('00000000-0000-0000-0000-000000000702', 'audit:export', 'Export audit logs', 'audit', 'export'),
    
    -- Security permissions
    ('00000000-0000-0000-0000-000000000801', 'security:read', 'View security', 'security', 'read'),
    ('00000000-0000-0000-0000-000000000802', 'security:manage', 'Manage security', 'security', 'manage'),
    
    -- Backup permissions
    ('00000000-0000-0000-0000-000000000901', 'backup:read', 'View backups', 'backup', 'read'),
    ('00000000-0000-0000-0000-000000000902', 'backup:create', 'Create backups', 'backup', 'create'),
    ('00000000-0000-0000-0000-000000000903', 'backup:restore', 'Restore backups', 'backup', 'restore'),
    ('00000000-0000-0000-0000-000000000904', 'backup:delete', 'Delete backups', 'backup', 'delete'),
    
    -- Files permissions
    ('00000000-0000-0000-0000-000000000a01', 'files:read', 'View files', 'files', 'read'),
    ('00000000-0000-0000-0000-000000000a02', 'files:upload', 'Upload files', 'files', 'upload'),
    ('00000000-0000-0000-0000-000000000a03', 'files:delete', 'Delete files', 'files', 'delete')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ADMIN ROLE PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_role_permissions (
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Grant permissions to super_admin role
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM admin_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant permissions to admin role (excluding role management and backup restore)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM admin_permissions
WHERE name NOT IN ('roles:create', 'roles:update', 'roles:delete', 'backup:restore')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- ADMIN USER ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_user_roles (
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- ADMIN AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id ON admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_type ON admin_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- ============================================
-- ADMIN ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_is_read ON admin_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON admin_alerts(created_at);

-- ============================================
-- ADMIN NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_id ON admin_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);

-- ============================================
-- ADMIN BACKUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    size_bytes BIGINT,
    file_path TEXT,
    include_tables TEXT[],
    exclude_tables TEXT[],
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_backups_status ON admin_backups(status);
CREATE INDEX IF NOT EXISTS idx_admin_backups_created_at ON admin_backups(created_at);

-- ============================================
-- ADMIN API KEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions TEXT[],
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_api_keys_user_id ON admin_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_is_active ON admin_api_keys(is_active);

-- ============================================
-- ADMIN SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ============================================
-- ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO admin_settings (id, key, value, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'general', 
     '{"siteName": "Atlas Genesis", "siteDescription": "Impact Platform", "timezone": "UTC", "dateFormat": "YYYY-MM-DD", "timeFormat": "24h", "language": "en"}'::jsonb,
     'General settings'),
    ('00000000-0000-0000-0000-000000000002', 'security',
     '{"mfaRequired": false, "sessionTimeout": 3600, "maxLoginAttempts": 5, "passwordExpiry": 90}'::jsonb,
     'Security settings'),
    ('00000000-0000-0000-0000-000000000003', 'notifications',
     '{"emailEnabled": true, "pushEnabled": true, "alertSeverity": "medium"}'::jsonb,
     'Notification settings')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_permissions_updated_at BEFORE UPDATE ON admin_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
