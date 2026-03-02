/**
 * Admin Context Provider
 * 
 * React context for managing admin connector state and authentication.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  AuthConnector,
  DashboardConnector,
  HealthConnector,
  AlertConnector,
  NotificationConnector,
} from '../services/adminConnector';
import { getAdminWebSocket, useRealtimeAlerts, useRealtimeNotifications, useRealtimeHealth, type WebSocketHandler } from '../services/adminWebSocket';
import type { AdminUser, AdminAlert, AdminNotification, AdminHealth, AdminDashboard } from '../services/types';

interface AdminContextValue {
  // Authentication
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Dashboard
  dashboard: AdminDashboard | null;
  refreshDashboard: () => Promise<void>;

  // Health
  health: AdminHealth | null;
  refreshHealth: () => Promise<void>;

  // Alerts
  alerts: AdminAlert[];
  unreadAlertsCount: number;
  refreshAlerts: () => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;

  // Notifications
  notifications: AdminNotification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;

  // WebSocket
  isConnected: boolean;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef(getAdminWebSocket());
  const mountedRef = useRef(true);

  // Calculate unread counts
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await AuthConnector.getCurrentUser();
          if (mountedRef.current) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          clearAuthToken();
        }
      }
      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Real-time alerts
  const { subscribe: subscribeToAlerts } = useRealtimeAlerts();
  useEffect(() => {
    const unsubscribe = subscribeToAlerts(((newAlert: AdminAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    }) as WebSocketHandler);
    return unsubscribe;
  }, [subscribeToAlerts]);

  // Real-time notifications
  const { subscribe: subscribeToNotifications } = useRealtimeNotifications();
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(((newNotification: AdminNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    }) as WebSocketHandler);
    return unsubscribe;
  }, [subscribeToNotifications]);

  // Real-time health updates
  const { subscribe: subscribeToHealth } = useRealtimeHealth();
  useEffect(() => {
    const unsubscribe = subscribeToHealth(((healthData: AdminHealth) => {
      setHealth(healthData);
    }) as WebSocketHandler);
    return unsubscribe;
  }, [subscribeToHealth]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: userData } = await AuthConnector.login(email, password);
      setAuthToken(token);
      setUser(userData);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthConnector.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthToken();
      setUser(null);
      setDashboard(null);
      setHealth(null);
      setAlerts([]);
      setNotifications([]);
      disconnectWebSocket();
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const { token } = await AuthConnector.refreshToken();
      setAuthToken(token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [logout]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    try {
      const data = await DashboardConnector.getOverview();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }, []);

  // Refresh health
  const refreshHealth = useCallback(async () => {
    try {
      const data = await HealthConnector.getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to refresh health:', error);
    }
  }, []);

  // Refresh alerts
  const refreshAlerts = useCallback(async () => {
    try {
      const { data } = await AlertConnector.getAlerts({ limit: 50 });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  }, []);

  // Mark alert as read
  const markAlertAsRead = useCallback(async (id: string) => {
    try {
      await AlertConnector.markAlertAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  }, []);

  // Mark all alerts as read
  const markAllAlertsAsRead = useCallback(async () => {
    try {
      await AlertConnector.markAllAlertsAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    try {
      const { data } = await NotificationConnector.getNotifications({ limit: 50 });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await NotificationConnector.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback(async () => {
    const ws = wsRef.current;
    if (!ws.isConnected()) {
      try {
        await ws.connect();
        setIsConnected(true);
        ws.subscribeToChannels(['alerts', 'notifications', 'health', 'security']);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    } else {
      setIsConnected(true);
    }
  }, []);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    const ws = wsRef.current;
    ws.disconnect();
    setIsConnected(false);
  }, []);

  const value: AdminContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    dashboard,
    refreshDashboard,
    health,
    refreshHealth,
    alerts,
    unreadAlertsCount,
    refreshAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    notifications,
    unreadNotificationsCount,
    refreshNotifications,
    markNotificationAsRead,
    isConnected,
    connectWebSocket,
    disconnectWebSocket,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
