import { useState, useEffect, useCallback } from 'react';
import {
  listCarbonCredits,
  getCarbonCredit,
  mintCarbonCredit,
  listTrades,
  executeTrade,
  listTokens,
  mintTokens,
  burnTokens,
  getUserWallets,
  listDerivatives,
  createDerivative,
  getRVEAnalytics,
  getMarketOverview,
} from '../services/rveConnector';

// ============================================
// Carbon Credits Hooks
// ============================================

export function useCarbonCredits(params = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCarbonCredits(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { data, loading, error, count, refetch: fetchCredits };
}

export function useCarbonCredit(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCredit() {
      setLoading(true);
      try {
        const result = await getCarbonCredit(id);
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredit();
  }, [id]);

  return { data, loading, error };
}

// ============================================
// Trading Hooks
// ============================================

export function useTrades(params = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listTrades(params);
      setData(result.data);
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { data, loading, error, count, refetch: fetchTrades };
}

// ============================================
// Token Economics Hooks
// ============================================

export function useTokens() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      setLoading(true);
      try {
        const result = await listTokens();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchTokens();
  }, []);

  return { data, loading, error };
}

export function useUserWallets(userId: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchWallets() {
      if (!userId) return;
      setLoading(true);
      try {
        const result = await getUserWallets(userId);
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchWallets();
  }, [userId]);

  return { data, loading, error };
}

// ============================================
// Impact Derivatives Hooks
// ============================================

export function useDerivatives(params = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDerivatives = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDerivatives(params);
      setData(result.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchDerivatives();
  }, [fetchDerivatives]);

  return { data, loading, error, refetch: fetchDerivatives };
}

// ============================================
// Analytics Hooks
// ============================================

export function useRVEAnalytics(period = '30d') {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const result = await getRVEAnalytics(period);
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  return { data, loading, error };
}

export function useMarketOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      try {
        const result = await getMarketOverview();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  return { data, loading, error };
}

// ============================================
// Action Hooks
// ============================================

export function useRVEActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mintCredit = useCallback(async (creditData: any) => {
    setLoading(true);
    try {
      const result = await mintCarbonCredit(creditData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeTradeAction = useCallback(async (tradeData: any) => {
    setLoading(true);
    try {
      const result = await executeTrade(tradeData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mintToken = useCallback(async (tokenData: any) => {
    setLoading(true);
    try {
      const result = await mintTokens(tokenData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const burnToken = useCallback(async (tokenData: any) => {
    setLoading(true);
    try {
      const result = await burnTokens(tokenData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDerivativeAction = useCallback(async (derivData: any) => {
    setLoading(true);
    try {
      const result = await createDerivative(derivData);
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
    mintCredit,
    executeTradeAction,
    mintToken,
    burnToken,
    createDerivativeAction,
  };
}
