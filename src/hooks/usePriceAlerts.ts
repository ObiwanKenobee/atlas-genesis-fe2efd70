import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PriceAlert {
  id: string;
  user_id: string;
  project_id: string;
  target_price: number;
  direction: 'above' | 'below';
  triggered: boolean;
  triggered_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  carbon_projects?: {
    title: string;
    price_per_credit: number;
    project_type: string;
  };
}

export function usePriceAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['price-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          carbon_projects (
            title,
            price_per_credit,
            project_type
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PriceAlert[];
    },
    enabled: !!user,
  });

  const createAlert = useMutation({
    mutationFn: async ({ projectId, targetPrice, direction }: { 
      projectId: string; 
      targetPrice: number; 
      direction: 'above' | 'below';
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          project_id: projectId,
          target_price: targetPrice,
          direction,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success('Price alert created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create alert: ${error.message}`);
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success('Price alert removed');
    },
    onError: (error) => {
      toast.error(`Failed to delete alert: ${error.message}`);
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ alertId, active }: { alertId: string; active: boolean }) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ active })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  return {
    alerts,
    isLoading,
    error,
    createAlert,
    deleteAlert,
    toggleAlert,
  };
}
