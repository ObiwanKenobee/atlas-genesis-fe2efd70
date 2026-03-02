import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../types/database';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================
// RBAC API
// ============================================

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  permission_count: number;
  user_count: number;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UserRole {
  id: string;
  role_id: string;
  role_name: string;
  role_level: number;
  assigned_at: string;
  assigned_by: string;
}

// List roles
export async function listRoles() {
  const response = await fetch(`${API_BASE_URL}/admin/roles`);
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

// Create role
export async function createRole(data: {
  name: string;
  description?: string;
  level: number;
  permissions?: string[];
}) {
  const response = await fetch(`${API_BASE_URL}/admin/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create role');
  return response.json();
}

// List permissions
export async function listPermissions() {
  const response = await fetch(`${API_BASE_URL}/admin/permissions`);
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
}

// Create permission
export async function createPermission(data: {
  name: string;
  resource: string;
  action: string;
  description?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create permission');
  return response.json();
}

// Get user roles
export async function getUserRoles(userId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/roles`);
  if (!response.ok) throw new Error('Failed to fetch user roles');
  return response.json();
}

// Assign role to user
export async function assignRole(userId: string, roleId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId }),
  });
  if (!response.ok) throw new Error('Failed to assign role');
  return response.json();
}

// ============================================
// User Management API
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  status: string;
  roles: Array<{ id: string; name: string; level: number }>;
  created_at: string;
  last_login?: string;
}

export interface UserListParams {
  status?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateUserStatusData {
  status: 'active' | 'suspended' | 'pending' | 'banned';
  reason?: string;
}

// List users
export async function listUsers(params: UserListParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.role) query.set('role', params.role);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/admin/users?${query}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

// Get user details
export async function getUser(userId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// Update user status
export async function updateUserStatus(userId: string, data: UpdateUserStatusData) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user status');
  return response.json();
}

// ============================================
// File Management API
// ============================================

export interface File {
  id: string;
  filename: string;
  file_type: string;
  folder: string;
  size: number;
  mime_type: string;
  url: string;
  status: string;
  uploaded_by: string;
  created_at: string;
}

export interface FileListParams {
  type?: string;
  folder?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface UploadFileData {
  filename: string;
  file_type: string;
  folder?: string;
  size: number;
  mime_type: string;
  url: string;
  metadata?: Record<string, any>;
}

// List files
export async function listFiles(params: FileListParams = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.folder) query.set('folder', params.folder);
  if (params.status) query.set('status', params.status);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/admin/files?${query}`);
  if (!response.ok) throw new Error('Failed to fetch files');
  return response.json();
}

// Upload file
export async function uploadFile(data: UploadFileData) {
  const response = await fetch(`${API_BASE_URL}/admin/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to upload file');
  return response.json();
}

// Delete file
export async function deleteFile(fileId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/files/${fileId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete file');
  return response.json();
}

// ============================================
// System Monitoring API
// ============================================

export interface SystemStatus {
  id: string;
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time_ms: number;
  seconds_since_heartbeat: number;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded';
  checks: Array<{
    service: string;
    status: 'healthy' | 'unhealthy';
    error?: string;
  }>;
  timestamp: string;
}

export interface MetricsData {
  period: string;
  api: Array<{
    time: string;
    requests: number;
    avg_response_time: number;
  }>;
  database: Array<{
    query_type: string;
    count: number;
    avg_duration: number;
  }>;
  errors: Array<{
    error_type: string;
    count: number;
  }>;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

// Get system status
export async function getSystemStatus() {
  const response = await fetch(`${API_BASE_URL}/admin/monitoring/system`);
  if (!response.ok) throw new Error('Failed to fetch system status');
  return response.json();
}

// Health check
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/admin/monitoring/health`);
  if (!response.ok) throw new Error('Failed to perform health check');
  return response.json();
}

// Get metrics
export async function getMetrics(period: '15m' | '1h' | '24h' | '7d' = '1h') {
  const response = await fetch(`${API_BASE_URL}/admin/monitoring/metrics?period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}

// Get audit logs
export async function getAuditLogs(params: {
  user_id?: string;
  action?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.user_id) query.set('user_id', params.user_id);
  if (params.action) query.set('action', params.action);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/admin/monitoring/audit-logs?${query}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
}

// Record heartbeat
export async function recordHeartbeat(data: {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics?: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    active_connections?: number;
  };
}) {
  const response = await fetch(`${API_BASE_URL}/admin/monitoring/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to record heartbeat');
  return response.json();
}

// ============================================
// Activity Logs API
// ============================================

export interface ActivityLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ActivityListParams {
  user_id?: string;
  entity_type?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

// Get activity logs
export async function getActivityLogs(params: ActivityListParams = {}) {
  const query = new URLSearchParams();
  if (params.user_id) query.set('user_id', params.user_id);
  if (params.entity_type) query.set('entity_type', params.entity_type);
  if (params.action) query.set('action', params.action);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/admin/activity?${query}`);
  if (!response.ok) throw new Error('Failed to fetch activity logs');
  return response.json();
}

// Create activity log
export async function createActivityLog(data: {
  entity_type: string;
  entity_id?: string;
  action: string;
  details?: Record<string, any>;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create activity log');
  return response.json();
}

// ============================================
// Utility Functions
// ============================================

// Check if user has permission
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

// Get role badge color
export function getRoleBadgeColor(roleName: string): string {
  const colors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    moderator: 'bg-blue-100 text-blue-800',
    user: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800',
  };
  return colors[roleName] || 'bg-gray-100 text-gray-800';
}

// Get status badge color
export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    banned: 'bg-red-100 text-red-800',
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    unhealthy: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
