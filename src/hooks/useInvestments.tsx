/**
 * useInvestments Hook
 * React hook for managing investments and portfolio
 */

import { useState, useEffect, useCallback } from 'react';
import investmentService, {
  InvestmentWizardState,
  InvestmentLineItem,
  PortfolioSummary,
  PortfolioItem,
  PortfolioActivity,
  CarbonRetirement,
  RetirementQuote,
  InvestmentStatus,
} from '../services/investmentService';
import { Project } from '../services/projectService';

interface UseInvestmentsReturn {
  // Wizard State
  wizardState: InvestmentWizardState | null;
  setWizardState: (state: Partial<InvestmentWizardState>) => void;
  clearWizardState: () => void;
  addProjectToSelection: (project: Project, quantity: number) => void;
  removeProjectFromSelection: (projectId: string) => void;
  updatePaymentMethod: (paymentMethodId: string) => void;
  advanceStep: () => void;

  // Investments
  investments: investmentService.Investment[];
  isLoading: boolean;
  error: string | null;
  createInvestment: (
    lineItems: InvestmentLineItem[],
    paymentMethodId?: string
  ) => Promise<investmentService.Investment>;
  getInvestment: (id: string) => Promise<investmentService.Investment | null>;
  cancelInvestment: (id: string) => Promise<boolean>;
  refreshInvestments: () => Promise<void>;

  // Portfolio
  portfolioSummary: PortfolioSummary | null;
  portfolioItems: PortfolioItem[];
  portfolioActivity: PortfolioActivity[];
  refreshPortfolio: () => Promise<void>;

  // Retirement
  retirementQuote: RetirementQuote | null;
  getRetirementQuote: (credits: number) => Promise<RetirementQuote>;
  retireCredits: (
    creditIds: string[],
    reason: string,
    beneficiary?: string
  ) => Promise<CarbonRetirement>;
  retirements: CarbonRetirement[];
  refreshRetirements: () => Promise<void>;
}

export function useInvestments(): UseInvestmentsReturn {
  const [wizardState, setWizardStateState] = useState<InvestmentWizardState | null>(null);
  const [investments, setInvestments] = useState<investmentService.Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioActivity, setPortfolioActivity] = useState<PortfolioActivity[]>([]);
  const [retirements, setRetirements] = useState<CarbonRetirement[]>([]);
  const [retirementQuote, setRetirementQuote] = useState<RetirementQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wizard state
  useEffect(() => {
    if (!wizardState) {
      setWizardStateState(investmentService.getInitialWizardState());
    }
  }, [wizardState]);

  // Load investments on mount
  useEffect(() => {
    loadInvestments();
    loadPortfolio();
    loadRetirements();
  }, []);

  // Wizard methods
  const setWizardState = useCallback((state: Partial<InvestmentWizardState>) => {
    investmentService.setWizardState(state);
    setWizardStateState(investmentService.getWizardState());
  }, []);

  const clearWizardState = useCallback(() => {
    investmentService.clearWizardState();
    setWizardStateState(investmentService.getInitialWizardState());
  }, []);

  const addProjectToSelection = useCallback((project: Project, quantity: number) => {
    investmentService.addProjectToSelection(project, quantity);
    setWizardStateState(investmentService.getWizardState());
  }, []);

  const removeProjectFromSelection = useCallback((projectId: string) => {
    investmentService.removeProjectFromSelection(projectId);
    setWizardStateState(investmentService.getWizardState());
  }, []);

  const updatePaymentMethod = useCallback((paymentMethodId: string) => {
    investmentService.updatePaymentMethod(paymentMethodId);
    setWizardStateState(investmentService.getWizardState());
  }, []);

  const advanceStep = useCallback(() => {
    investmentService.advanceStep();
    setWizardStateState(investmentService.getWizardState());
  }, []);

  // Investment methods
  const loadInvestments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await investmentService.getInvestments();
      setInvestments(result.investments);
    } catch (err) {
      setError('Failed to load investments');
      console.error('Error loading investments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInvestment = useCallback(
    async (lineItems: InvestmentLineItem[], paymentMethodId?: string) => {
      setIsLoading(true);
      try {
        const investment = await investmentService.createInvestment(
          lineItems,
          paymentMethodId
        );
        await loadInvestments();
        await loadPortfolio();
        return investment;
      } catch (err) {
        setError('Failed to create investment');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadInvestments, loadPortfolio]
  );

  const getInvestment = useCallback(async (id: string) => {
    try {
      return await investmentService.getInvestment(id);
    } catch (err) {
      setError('Failed to get investment');
      return null;
    }
  }, []);

  const cancelInvestment = useCallback(async (id: string) => {
    try {
      const success = await investmentService.cancelInvestment(id);
      if (success) {
        await loadInvestments();
      }
      return success;
    } catch (err) {
      setError('Failed to cancel investment');
      return false;
    }
  }, [loadInvestments]);

  const refreshInvestments = useCallback(async () => {
    await loadInvestments();
  }, [loadInvestments]);

  // Portfolio methods
  const loadPortfolio = useCallback(async () => {
    try {
      const summary = await investmentService.getPortfolioSummary();
      setPortfolioSummary(summary);
      const items = await investmentService.getPortfolioItems();
      setPortfolioItems(items);
      const activity = await investmentService.getPortfolioActivity();
      setPortfolioActivity(activity);
    } catch (err) {
      setError('Failed to load portfolio');
      console.error('Error loading portfolio:', err);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    await loadPortfolio();
  }, [loadPortfolio]);

  // Retirement methods
  const getRetirementQuote = useCallback(async (credits: number) => {
    try {
      const quote = await investmentService.getRetirementQuote(credits);
      setRetirementQuote(quote);
      return quote;
    } catch (err) {
      setError('Failed to get retirement quote');
      throw err;
    }
  }, []);

  const retireCredits = useCallback(
    async (creditIds: string[], reason: string, beneficiary?: string) => {
      setIsLoading(true);
      try {
        const retirement = await investmentService.retireCredits(
          creditIds,
          reason,
          beneficiary
        );
        await loadRetirements();
        await loadPortfolio();
        return retirement;
      } catch (err) {
        setError('Failed to retire credits');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadRetirements, loadPortfolio]
  );

  const loadRetirements = useCallback(async () => {
    try {
      const list = await investmentService.getRetirements();
      setRetirements(list);
    } catch (err) {
      setError('Failed to load retirements');
      console.error('Error loading retirements:', err);
    }
  }, []);

  const refreshRetirements = useCallback(async () => {
    await loadRetirements();
  }, [loadRetirements]);

  return {
    wizardState,
    setWizardState,
    clearWizardState,
    addProjectToSelection,
    removeProjectFromSelection,
    updatePaymentMethod,
    advanceStep,
    investments,
    isLoading,
    error,
    createInvestment,
    getInvestment,
    cancelInvestment,
    refreshInvestments,
    portfolioSummary,
    portfolioItems,
    portfolioActivity,
    refreshPortfolio,
    retirementQuote,
    getRetirementQuote,
    retireCredits,
    retirements,
    refreshRetirements,
  };
}

/**
 * Hook for tracking investment progress
 */
export function useInvestmentProgress(investmentId: string | null) {
  const [investment, setInvestment] = useState<investmentService.Investment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadInvestment = useCallback(async () => {
    if (!investmentId) return;
    setIsLoading(true);
    try {
      const result = await investmentService.getInvestment(investmentId);
      setInvestment(result);
    } catch (err) {
      console.error('Error loading investment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [investmentId]);

  useEffect(() => {
    loadInvestment();
  }, [loadInvestment]);

  // Poll for updates every 10 seconds
  useEffect(() => {
    if (!investment || investment.status === 'completed') return;

    const interval = setInterval(loadInvestment, 10000);
    return () => clearInterval(interval);
  }, [investment, loadInvestment]);

  return {
    investment,
    isLoading,
    refresh: loadInvestment,
    isCompleted: investment?.status === 'completed',
    isFailed: investment?.status === 'failed',
  };
}

export default useInvestments;
