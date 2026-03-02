-- Database Schema for Admin Dashboard System
-- This file contains the SQL statements to create the database schema
-- for the admin dashboard system as outlined in the architecture document.

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table: Stores user account information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- Roles Table: Defines user roles in the system
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table: Defines individual permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Roles Junction Table: Many-to-many relationship between users and roles
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

-- Role Permissions Junction Table: Many-to-many relationship between roles and permissions
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- Audit Logs Table: Tracks system events and changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table: Manages API keys for programmatic access
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table: Tracks user sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Entries Table: Stores generic data entries for the dashboard
CREATE TABLE data_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  category VARCHAR(255),
  tags VARCHAR(255)[],
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Entry Versions Table: Tracks versions of data entries
CREATE TABLE data_entry_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_entry_id UUID NOT NULL REFERENCES data_entries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table: Manages user notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- System Settings Table: Stores application configuration
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization

-- Users Table Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Roles Table Indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role);

-- Permissions Table Indexes
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_category ON permissions(category);

-- User Roles Table Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Role Permissions Table Indexes
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Audit Logs Table Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- API Keys Table Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- Sessions Table Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

-- Data Entries Table Indexes
CREATE INDEX idx_data_entries_user_id ON data_entries(user_id);
CREATE INDEX idx_data_entries_category ON data_entries(category);
CREATE INDEX idx_data_entries_is_active ON data_entries(is_active);
CREATE INDEX idx_data_entries_is_public ON data_entries(is_public);
CREATE INDEX idx_data_entries_created_at ON data_entries(created_at);
CREATE INDEX idx_data_entries_tags ON data_entries USING GIN(tags);

-- Data Entry Versions Table Indexes
CREATE INDEX idx_data_entry_versions_data_entry_id ON data_entry_versions(data_entry_id);
CREATE INDEX idx_data_entry_versions_version_number ON data_entry_versions(version_number);
CREATE INDEX idx_data_entry_versions_created_at ON data_entry_versions(created_at);

-- Notifications Table Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- System Settings Table Indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_type ON system_settings(type);

-- Create triggers for automatic timestamp updates

-- Users Table Trigger
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

-- Roles Table Trigger
CREATE OR REPLACE FUNCTION update_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_timestamp_trigger
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_roles_timestamp();

-- Permissions Table Trigger
CREATE OR REPLACE FUNCTION update_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_permissions_timestamp_trigger
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION update_permissions_timestamp();

-- Data Entries Table Trigger
CREATE OR REPLACE FUNCTION update_data_entries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_entries_timestamp_trigger
BEFORE UPDATE ON data_entries
FOR EACH ROW
EXECUTE FUNCTION update_data_entries_timestamp();

-- System Settings Table Trigger
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_timestamp_trigger
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_system_settings_timestamp();

-- Create functions for common operations

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(255),
  p_entity_type VARCHAR(255),
  p_entity_id UUID,
  p_old_value JSONB,
  p_new_value JSONB,
  p_ip_address VARCHAR(45),
  p_user_agent TEXT,
  p_status VARCHAR(50),
  p_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, entity_type, entity_id, old_value, new_value,
    ip_address, user_agent, status, metadata, created_at
  ) VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id, p_old_value, p_new_value,
    p_ip_address, p_user_agent, p_status, p_metadata, CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_permission_name VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = p_user_id AND p.name = p_permission_name
  ) INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(
  p_user_id UUID
)
RETURNS TABLE (
  role_id UUID,
  role_name VARCHAR(255),
  role_description TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS role_id,
    r.name AS role_name,
    r.description AS role_description,
    ur.assigned_at AS assigned_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new data entry version
CREATE OR REPLACE FUNCTION create_data_entry_version(
  p_data_entry_id UUID,
  p_version_number INTEGER,
  p_title VARCHAR(255),
  p_description TEXT,
  p_data JSONB,
  p_changed_by UUID,
  p_change_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  new_version_id UUID;
BEGIN
  INSERT INTO data_entry_versions (
    data_entry_id, version_number, title, description, data,
    changed_by, change_reason, created_at
  ) VALUES (
    p_data_entry_id, p_version_number, p_title, p_description, p_data,
    p_changed_by, p_change_reason, CURRENT_TIMESTAMP
  ) RETURNING id INTO new_version_id;

  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql;

-- Initialize system roles and permissions
INSERT INTO roles (id, name, description, is_system_role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Administrator', 'System administrator with full access', TRUE),
  ('10000000-0000-0000-0000-000000000002', 'Editor', 'Can create and edit content', TRUE),
  ('10000000-0000-0000-0000-000000000003', 'Viewer', 'Read-only access', TRUE);

INSERT INTO permissions (id, name, description, category) VALUES
  ('20000000-0000-0000-0000-000000000001', 'user.create', 'Create new users', 'User Management'),
  ('20000000-0000-0000-0000-000000000002', 'user.read', 'View user information', 'User Management'),
  ('20000000-0000-0000-0000-000000000003', 'user.update', 'Update user information', 'User Management'),
  ('20000000-0000-0000-0000-000000000004', 'user.delete', 'Delete users', 'User Management'),
  ('20000000-0000-0000-0000-000000000005', 'role.create', 'Create new roles', 'Role Management'),
  ('20000000-0000-0000-0000-000000000006', 'role.read', 'View role information', 'Role Management'),
  ('20000000-0000-0000-0000-000000000007', 'role.update', 'Update role information', 'Role Management'),
  ('20000000-0000-0000-0000-000000000008', 'role.delete', 'Delete roles', 'Role Management'),
  ('20000000-0000-0000-0000-000000000009', 'data.create', 'Create data entries', 'Data Management'),
  ('20000000-0000-0000-0000-000000000010', 'data.read', 'View data entries', 'Data Management'),
  ('20000000-0000-0000-0000-000000000011', 'data.update', 'Update data entries', 'Data Management'),
  ('20000000-0000-0000-0000-000000000012', 'data.delete', 'Delete data entries', 'Data Management'),
  ('20000000-0000-0000-0000-000000000013', 'audit.read', 'View audit logs', 'Audit'),
  ('20000000-0000-0000-0000-000000000014', 'settings.read', 'View system settings', 'Settings'),
  ('20000000-0000-0000-0000-000000000015', 'settings.update', 'Update system settings', 'Settings');

-- Assign permissions to system roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
  -- Administrator role gets all permissions
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015'),
  
  -- Editor role gets data management permissions
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000011'),
  
  -- Viewer role gets read-only permissions
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000014');

-- Create initial system settings
INSERT INTO system_settings (key, value, type, description) VALUES
  ('app.name', 'Admin Dashboard System', 'string', 'Application name'),
  ('app.version', '1.0.0', 'string', 'Application version'),
  ('app.environment', 'development', 'string', 'Application environment'),
  ('auth.jwt.secret', 'change-this-to-a-strong-secret', 'string', 'JWT secret key'),
  ('auth.jwt.expiration', '3600', 'number', 'JWT expiration time in seconds'),
  ('auth.refresh_token.expiration', '86400', 'number', 'Refresh token expiration time in seconds'),
  ('rate_limiting.enabled', 'true', 'boolean', 'Enable rate limiting'),
  ('rate_limiting.window', '15', 'number', 'Rate limiting window in minutes'),
  ('rate_limiting.max_requests', '100', 'number', 'Maximum requests per window');