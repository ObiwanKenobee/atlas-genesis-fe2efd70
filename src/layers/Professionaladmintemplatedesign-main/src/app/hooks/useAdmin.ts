import { useState, useEffect, useCallback } from 'react';
import {
  listRoles,
  createRole,
  listPermissions,
  listUsers,
  getUser,
  updateUserStatus,
  listFiles,
  uploadFile,
  deleteFile,
  getSystemStatus,
  healthCheck,
  getMetrics,
  getAuditLogs,
  getActivityLogs,
  type Role,
  type Permission,
  type AdminUser,
  type File,
  type SystemStatus,
  type HealthCheck,
  type MetricsData,
  type AuditLog,
  type ActivityLog,
} from '../services/adminConnector';

// ============================================
// RBAC Hooks
// ============================================

export function useRoles() {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      setLoading(true);
      try {
        const result = await listRoles();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  return { data, loading, error };
}

export function usePermissions() {
  const [data, setData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      setLoading(true);
      try {
        const result = await listPermissions();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchPermissions();
  }, []);

  return { data, loading, error };
}

// ============================================
// User Management Hooks
// ============================================

export function useUsers(params = {}) {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, count, refetch: fetchUsers };
}

export function useUser(userId: string) {
  const [data, setData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      setLoading(true);
      try {
        const result = await getUser(userId);
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  return { data, loading, error };
}

// ============================================
// File Management Hooks
// ============================================

export function useFiles(params = {}) {
  const [data, setData] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listFiles(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { data, loading, error, count, refetch: fetchFiles };
}

// ============================================
// System Monitoring Hooks
// ============================================

export function useSystemStatus() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      try {
        const result = await getSystemStatus();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return { data, loading, error };
}

export function useHealthCheck() {
  const [data, setData] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkHealth() {
      setLoading(true);
      try {
        const result = await healthCheck();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  return { data, loading, error };
}

export function useMetrics(period: '15m' | '1h' | '24h' | '7d' = '1h') {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const result = await getMetrics(period);
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [period]);

  return { data, loading, error };
}

export function useAuditLogs(params = {}) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { data, loading, error, count, refetch: fetchLogs };
}

export function useActivityLogs(params = {}) {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getActivityLogs(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { data, loading, error, count, refetch: fetchLogs };
}

// ============================================
// Action Hooks
// ============================================

export function useAdminActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createRoleAction = useCallback(async (data: Parameters<typeof createRole>[0]) => {
    setLoading(true);
    try {
      const result = await createRole(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatusAction = useCallback(async (userId: string, data: Parameters<typeof updateUserStatus>[1]) => {
    setLoading(true);
    try {
      const result = await updateUserStatus(userId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFileAction = useCallback(async (data: Parameters<typeof uploadFile>[0]) => {
    setLoading(true);
    try {
      const result = await uploadFile(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFileAction = useCallback(async (fileId: string) => {
    setLoading(true);
    try {
      const result = await deleteFile(fileId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createRole: createRoleAction,
    updateUserStatus: updateUserStatusAction,
    uploadFile: uploadFileAction,
    deleteFile: deleteFileAction,
  };
}
