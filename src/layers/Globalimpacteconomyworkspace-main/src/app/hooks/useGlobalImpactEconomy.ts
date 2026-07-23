/**
 * React Hook for Global Impact Economy API
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  globalImpactEconomyConnector,
  DashboardData,
  Project,
  ImpactBond,
  MicrofinanceOpportunity,
  AnalyticsData,
  UserImpactData,
  PaginatedProjects
} from '../services/globalImpactEconomyConnector';

// Loading and Error state types
interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Generic hook result
interface HookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for dashboard data
 */
export function useDashboard(): HookResult<DashboardData> {
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getDashboard();
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for projects with pagination
 */
export function useProjects(options?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
}): HookResult<PaginatedProjects> {
  const [data, setData] = useState<PaginatedProjects | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getProjects(options);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch projects');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, [options?.page, options?.limit, options?.category, options?.status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for single project
 */
export function useProject(id: string): HookResult<Project> {
  const [data, setData] = useState<Project | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getProject(id);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch project');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for impact bonds
 */
export function useImpactBonds(options?: { page?: number; limit?: number }): HookResult<ImpactBond[]> {
  const [data, setData] = useState<ImpactBond[] | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getImpactBonds(options);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch impact bonds');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, [options?.page, options?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for microfinance opportunities
 */
export function useMicrofinance(options?: {
  page?: number;
  limit?: number;
  sector?: string;
}): HookResult<MicrofinanceOpportunity[]> {
  const [data, setData] = useState<MicrofinanceOpportunity[] | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getMicrofinanceOpportunities(options);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch microfinance opportunities');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, [options?.page, options?.limit, options?.sector]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for analytics data
 */
export function useAnalytics(period: string = '30d'): HookResult<AnalyticsData> {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getAnalytics(period);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

/**
 * Hook for user's impact
 */
export function useMyImpact(): HookResult<UserImpactData> {
  const [data, setData] = useState<UserImpactData | null>(null);
  const [state, setState] = useState<LoadingState>({ loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      const response = await globalImpactEconomyConnector.getMyImpact();
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch user impact');
      }
    } catch (error) {
      setState({ loading: false, error: (error as Error).message });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading: state.loading, error: state.error, refetch: fetchData };
}

// Export mutation helper hook
export function useGlobalImpactEconomyActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(async (data: {
    name: string;
    description: string;
    impact_category: string;
    location?: string;
    beneficiaries_count?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await globalImpactEconomyConnector.createProject(data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create project');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const supportProject = useCallback(async (projectId: string, data: {
    support_type: string;
    amount: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await globalImpactEconomyConnector.supportProject(projectId, data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to support project');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    supportProject,
    loading,
    error
  };
}
