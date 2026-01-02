import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface RealtimeSyncConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for real-time data synchronization using Supabase subscriptions
 * Enables live updates for marketplace data, transactions, and measurements
 */
export function useRealtimeSync(config: RealtimeSyncConfig) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribe = useCallback(() => {
    const channelName = `${config.table}-changes-${Date.now()}`;
    
    const channel = supabase.channel(channelName);
    
    channel.on(
      'postgres_changes' as any,
      {
        event: config.event || '*',
        schema: 'public',
        table: config.table,
        filter: config.filter,
      },
      (payload: any) => {
        try {
          if (payload.eventType === 'INSERT' && config.onInsert) {
            config.onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && config.onUpdate) {
            config.onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && config.onDelete) {
            config.onDelete(payload.old);
          }
        } catch (error) {
          console.error('Error handling realtime event:', error);
          config.onError?.(error as Error);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✓ Real-time sync active for ${config.table}`);
      } else if (status === 'CHANNEL_ERROR') {
        toast.error(`Failed to sync ${config.table} data`);
      }
    });

    channelRef.current = channel;
  }, [config]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return { subscribe, unsubscribe };
}

/**
 * Specialized hook for monitoring marketplace transactions in real-time
 */
export function useTransactionSync(userId: string) {
  useRealtimeSync({
    table: 'transactions',
    event: 'UPDATE',
    filter: `user_id=eq.${userId}`,
    onUpdate: (transaction) => {
      if (transaction.status === 'completed') {
        toast.success(`✓ Transaction confirmed: ${transaction.id}`);
      } else if (transaction.status === 'failed') {
        toast.error(`Transaction failed. Please try again.`);
      }
    },
  });

  return {};
}

/**
 * Specialized hook for monitoring carbon credit holdings changes
 */
export function useCreditHoldingsSync(userId: string) {
  useRealtimeSync({
    table: 'credit_holdings',
    filter: `user_id=eq.${userId}`,
    onInsert: (holding) => {
      toast.success(`✓ Added ${holding.quantity} credits to your portfolio`);
    },
    onUpdate: (holding) => {
      if (holding.retired) {
        toast.success(`✓ Retired ${holding.quantity} credits`);
      }
    },
    onDelete: () => {
      // Handle deletion if needed
    },
  });

  return {};
}

/**
 * Specialized hook for monitoring project updates in real-time
 */
export function useProjectSync(projectId: string) {
  useRealtimeSync({
    table: 'carbon_projects',
    event: 'UPDATE',
    filter: `id=eq.${projectId}`,
    onUpdate: (project) => {
      if (project.available_credits < 100) {
        toast.warning(`⚠️ Only ${project.available_credits} credits remaining`);
      }
    },
  });

  return {};
}

/**
 * Hook for monitoring new market opportunities
 * Alerts users when new high-impact projects are listed
 */
export function useMarketWatchSync(filters?: {
  minImpactScore?: number;
  projectType?: string;
  maxPrice?: number;
}) {
  let filterString = '';
  if (filters) {
    const conditions = [];
    if (filters.minImpactScore !== undefined) {
      conditions.push(`impact_score=gte.${filters.minImpactScore}`);
    }
    if (filters.projectType) {
      conditions.push(`project_type=eq.${filters.projectType}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(`price_per_credit=lte.${filters.maxPrice}`);
    }
    filterString = conditions.join(',');
  }

  useRealtimeSync({
    table: 'carbon_projects',
    event: 'INSERT',
    filter: filterString || undefined,
    onInsert: (project) => {
      toast.info(
        `🌿 New opportunity: ${project.title} at $${project.price_per_credit}/credit`
      );
    },
  });

  return {};
}
