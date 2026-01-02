import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_on_purchase: boolean;
  email_on_retirement: boolean;
  email_on_market_opportunities: boolean;
  email_on_price_alerts: boolean;
  sms_alerts: boolean;
  in_app_notifications: boolean;
  daily_digest: boolean;
}

// Mock notifications for demo purposes (notifications table doesn't exist yet)
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '',
    type: 'success',
    title: 'Welcome to Atlas Sanctum',
    message: 'Start exploring carbon credit opportunities',
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_on_purchase: true,
    email_on_retirement: true,
    email_on_market_opportunities: true,
    email_on_price_alerts: false,
    sms_alerts: false,
    in_app_notifications: true,
    daily_digest: false,
  });
  const [unreadCount, setUnreadCount] = useState(1);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const createNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    []
  );

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
    toast.success('Notification preferences updated');
  }, []);

  return {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    updatePreferences,
  };
}

export function usePriceAlerts(userId?: string) {
  const setPriceAlert = useCallback((projectId: string, targetPrice: number) => {
    toast.success(`Price alert set for $${targetPrice}`);
  }, []);

  return { setPriceAlert };
}

export function usePortfolioAlerts(userId?: string) {
  const setMilestoneAlert = useCallback(
    (type: 'impact_reached' | 'value_threshold' | 'carbon_offset', threshold: number) => {
      toast.success('Milestone alert set');
    },
    []
  );

  return { setMilestoneAlert };
}
