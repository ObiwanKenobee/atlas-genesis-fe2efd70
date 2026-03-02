/**
 * Type Definitions for Admin Platform Connector
 */

// ============================================
// BASE TYPES
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  permissions: AdminPermission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  user?: AdminUser;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    language: string;
  };
  security: {
    mfaRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    alertSeverity: 'low' | 'medium' | 'high' | 'critical';
  };
  integrations: Record<string, {
    enabled: boolean;
    config: Record<string, unknown>;
  }>;
}

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalProjects: number;
  };
  trends: {
    users: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
    engagement: { date: string; score: number }[];
  };
  metrics: Record<string, number>;
}

export interface AdminHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: { status: string; latency: number };
    cache: { status: string; latency: number };
    storage: { status: string; usage: number };
    queue: { status: string; pending: number };
  };
  uptime: number;
  version: string;
}

export interface AdminAlert {
  id: string;
  type: 'system' | 'security' | 'performance' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AdminDashboard {
  stats: {
    users: { total: number; active: number; new: number };
    revenue: { total: number; change: number };
    projects: { total: number; active: number; completed: number };
    impact: { total: number; change: number };
  };
  charts: {
    userGrowth: { date: string; count: number }[];
    revenueTrend: { date: string; amount: number }[];
    impactDistribution: { category: string; value: number }[];
  };
  recentActivity: AdminAuditLog[];
  alerts: AdminAlert[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AdminAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// REQUEST TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface CreateAlertRequest {
  type: 'system' | 'security' | 'performance' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSettingsRequest {
  general?: Partial<AdminSettings['general']>;
  security?: Partial<AdminSettings['security']>;
  notifications?: Partial<AdminSettings['notifications']>;
  integrations?: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
}

export interface CreateAPIKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
}

export interface CreateBackupRequest {
  includeTables?: string[];
  excludeTables?: string[];
}

export interface CreateKnowledgeItemRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  attachments?: string[];
}

export interface CreateImpactProjectRequest {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  metrics: Record<string, number>;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  category: string;
  votingPeriod: number;
  quorum: number;
  options: string[];
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface AdminWebhookEvent {
  type: 'alert' | 'notification' | 'audit' | 'health' | 'security';
  data: Record<string, unknown>;
  timestamp: string;
}

// ============================================
// ERROR TYPES
// ============================================

export interface AdminError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class AdminAPIError extends Error {
  code: string;
  details?: Record<string, unknown>;
  statusCode: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: Record<string, unknown>, statusCode: number = 500) {
    super(message);
    this.name = 'AdminAPIError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends AdminAPIError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', undefined, 401);
  }
}

export class AuthorizationError extends AdminAPIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', undefined, 403);
  }
}

export class ValidationError extends AdminAPIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details, 400);
  }
}

export class NotFoundError extends AdminAPIError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', undefined, 404);
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export type AdminResponse<T> = Promise<T>;

export type AsyncIterator<T> = AsyncGenerator<T, void, unknown>;

export type AdminEventHandler = (event: AdminWebhookEvent) => void;

// ============================================
// EXPORT
// ============================================

export * from './types';
