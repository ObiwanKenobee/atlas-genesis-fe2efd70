import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

/**
 * Comprehensive notification management hook
 * Handles in-app notifications, email preferences, and alerts
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [userId]);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await supabase
          .from('notifications')
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq('id', notificationId);

        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    []
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Create notification
  const createNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([
            {
              ...notification,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setNotifications((prev) => [data as Notification, ...prev]);
        }
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    },
    [userId]
  );

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .upsert([
            {
              user_id: userId,
              ...preferences,
              ...updates,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPreferences(data as NotificationPreferences);
          toast.success('Notification preferences updated');
        }
      } catch (error) {
        console.error('Error updating preferences:', error);
        toast.error('Failed to update preferences');
      }
    },
    [userId, preferences]
  );

  // Setup real-time subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new notifications
          const icon =
            newNotification.type === 'success'
              ? '✓'
              : newNotification.type === 'warning'
              ? '⚠️'
              : 'ℹ️';
          toast[newNotification.type === 'warning' ? 'warning' : 'info'](
            `${icon} ${newNotification.title}`
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fetch on mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [userId, fetchNotifications, fetchPreferences]);

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

/**
 * Hook for price alerts on projects
 */
export function usePriceAlerts(userId?: string) {
  const { createNotification } = useNotifications(userId);

  const setPriceAlert = useCallback(
    async (projectId: string, targetPrice: number) => {
      // Store alert in database (would need price_alerts table)
      try {
        const { error } = await supabase
          .from('price_alerts')
          .insert([
            {
              user_id: userId,
              project_id: projectId,
              target_price: targetPrice,
              active: true,
            },
          ]);

        if (error) throw error;
        toast.success(`Price alert set for $${targetPrice}`);
      } catch (error) {
        console.error('Error setting price alert:', error);
        toast.error('Failed to set price alert');
      }
    },
    [userId, createNotification]
  );

  return { setPriceAlert };
}

/**
 * Hook for portfolio milestone alerts
 */
export function usePortfolioAlerts(userId?: string) {
  const { createNotification } = useNotifications(userId);

  const setMilestoneAlert = useCallback(
    async (
      type: 'impact_reached' | 'value_threshold' | 'carbon_offset',
      threshold: number
    ) => {
      try {
        const { error } = await supabase
          .from('portfolio_alerts')
          .insert([
            {
              user_id: userId,
              alert_type: type,
              threshold,
              active: true,
            },
          ]);

        if (error) throw error;
        toast.success(`Milestone alert set`);
      } catch (error) {
        console.error('Error setting milestone alert:', error);
      }
    },
    [userId, createNotification]
  );

  return { setMilestoneAlert };
}
