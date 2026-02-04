/**
 * AI Services - React Hooks
 * Production-ready hooks for using AI services in React components
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  nlpService, 
  type NLPAnalysis, 
  type Entity, 
  type SentimentScore,
  type TranslationRequest,
  type TextClassificationRequest,
  type ClassificationCategory 
} from '../services/ai/nlpService';
import { 
  visionService, 
  type VisionAnalysis, 
  type ChangeEvent, 
  type SpeciesRecognition,
  type VegetationIndex,
  type FireRiskAssessment 
} from '../services/ai/visionService';
import { 
  predictionService, 
  anomalyService, 
  recommendationService, 
  forecastingService, 
  knowledgeGraphService, 
  reinforcementLearningService,
  type PriceForecast,
  type ImpactPrediction,
  type ClimateRisk,
  type SuccessPrediction,
  type AnomalyResult,
  type Recommendation,
  type PortfolioSuggestion,
  type TimeSeriesForecast,
  type GraphNode,
  type GraphRelationship,
  type RLPolicy,
  type UserProfile,
  type Coordinates
} from '../services/ai/predictionService';
import { AIServiceError, type Result } from '../services/ai/baseClient';

// ============================================
// BASE HOOK TYPES
// ============================================

export interface UseAIOptions {
  immediate?: boolean;
  onSuccess?: <T>(data: T) => void;
  onError?: (error: AIServiceError) => void;
}

export interface UseAIResult<T> {
  data: T | null;
  loading: boolean;
  error: AIServiceError | null;
  refetch: () => Promise<void>;
  cancel: () => void;
}

// ============================================
// NLP HOOKS
// ============================================

/**
 * Hook for analyzing text with NLP
 */
export function useNLPAnalysis(text: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<NLPAnalysis, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    if (!text.trim()) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await nlpService.analyzeText(text, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'NLPService',
        'analyzeText',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [text, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      analyze();
    }
    return () => cancel();
  }, [immediate, analyze, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: analyze,
    cancel,
  }), [result, loading, error, analyze, cancel]);
}

/**
 * Hook for extracting entities from text
 */
export function useEntities(text: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<Entity[], AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const extract = useCallback(async () => {
    if (!text.trim()) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await nlpService.extractEntities(text, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'NLPService',
        'extractEntities',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [text, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) extract();
    return () => cancel();
  }, [immediate, extract, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: extract,
    cancel,
  }), [result, loading, error, extract, cancel]);
}

/**
 * Hook for sentiment analysis
 */
export function useSentiment(text: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<SentimentScore, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    if (!text.trim()) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await nlpService.analyzeSentiment(text, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'NLPService',
        'analyzeSentiment',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [text, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) analyze();
    return () => cancel();
  }, [immediate, analyze, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: analyze,
    cancel,
  }), [result, loading, error, analyze, cancel]);
}

/**
 * Hook for text classification
 */
export function useTextClassification(request: TextClassificationRequest, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<ClassificationResponse, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const classify = useCallback(async () => {
    if (!request.text.trim()) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await nlpService.classifyText(request, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'NLPService',
        'classifyText',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [request, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) classify();
    return () => cancel();
  }, [immediate, classify, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: classify,
    cancel,
  }), [result, loading, error, classify, cancel]);
}

// ============================================
// VISION HOOKS
// ============================================

/**
 * Hook for satellite image analysis
 */
export function useSatelliteAnalysis(imageUrl: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<VisionAnalysis, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    if (!imageUrl) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await visionService.analyzeSatelliteImage(imageUrl, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'VisionService',
        'analyzeSatelliteImage',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [imageUrl, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) analyze();
    return () => cancel();
  }, [immediate, analyze, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: analyze,
    cancel,
  }), [result, loading, error, analyze, cancel]);
}

/**
 * Hook for vegetation index calculation
 */
export function useVegetationIndex(imageUrl: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<VegetationIndex, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculate = useCallback(async () => {
    if (!imageUrl) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await visionService.calculateVegetationIndex(imageUrl, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'VisionService',
        'calculateVegetationIndex',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [imageUrl, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) calculate();
    return () => cancel();
  }, [immediate, calculate, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: calculate,
    cancel,
  }), [result, loading, error, calculate, cancel]);
}

/**
 * Hook for species identification
 */
export function useSpeciesIdentification(imageUrl: string, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<SpeciesRecognition[], AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const identify = useCallback(async () => {
    if (!imageUrl) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await visionService.identifySpecies(imageUrl, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'VisionService',
        'identifySpecies',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [imageUrl, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) identify();
    return () => cancel();
  }, [immediate, identify, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: identify,
    cancel,
  }), [result, loading, error, identify, cancel]);
}

// ============================================
// PREDICTION HOOKS
// ============================================

/**
 * Hook for carbon price forecasting
 */
export function useCarbonPriceForecast(projectId: string, months: number = 12, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<PriceForecast[], AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const forecast = useCallback(async () => {
    if (!projectId) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await predictionService.forecastCarbonPrice(projectId, months, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'PredictionService',
        'forecastCarbonPrice',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [projectId, months, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) forecast();
    return () => cancel();
  }, [immediate, forecast, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: forecast,
    cancel,
  }), [result, loading, error, forecast, cancel]);
}

/**
 * Hook for impact prediction
 */
export function useImpactPrediction(projectId: string, timeframe: string = '1 year', options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<ImpactPrediction, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const predict = useCallback(async () => {
    if (!projectId) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await predictionService.predictImpact(projectId, timeframe, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'PredictionService',
        'predictImpact',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [projectId, timeframe, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) predict();
    return () => cancel();
  }, [immediate, predict, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: predict,
    cancel,
  }), [result, loading, error, predict, cancel]);
}

/**
 * Hook for climate risk assessment
 */
export function useClimateRisk(location: Coordinates, timeframe: number = 10, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<ClimateRisk, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const assess = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await predictionService.modelClimateRisk(location, timeframe, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'PredictionService',
        'modelClimateRisk',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [location, timeframe, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) assess();
    return () => cancel();
  }, [immediate, assess, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: assess,
    cancel,
  }), [result, loading, error, assess, cancel]);
}

// ============================================
// RECOMMENDATION HOOKS
// ============================================

/**
 * Hook for personalized recommendations
 */
export function useRecommendations(userId: string, limit: number = 5, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<Recommendation[], AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getRecommendations = useCallback(async () => {
    if (!userId) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationService.getPersonalizedRecommendations(userId, limit, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'RecommendationService',
        'getPersonalizedRecommendations',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) getRecommendations();
    return () => cancel();
  }, [immediate, getRecommendations, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: getRecommendations,
    cancel,
  }), [result, loading, error, getRecommendations, cancel]);
}

/**
 * Hook for portfolio optimization
 */
export function usePortfolioOptimization(userProfile: UserProfile | null, options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<PortfolioSuggestion, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const optimize = useCallback(async () => {
    if (!userProfile) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationService.optimizePortfolio(userProfile, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'RecommendationService',
        'optimizePortfolio',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [userProfile, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) optimize();
    return () => cancel();
  }, [immediate, optimize, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: optimize,
    cancel,
  }), [result, loading, error, optimize, cancel]);
}

// ============================================
// ANOMALY HOOKS
// ============================================

/**
 * Hook for transaction anomaly detection
 */
export function useTransactionAnomaly(
  transaction: { id: string; userId: string; amount: number; type: string; timestamp: string } | null,
  options: UseAIOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<AnomalyResult, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const detect = useCallback(async () => {
    if (!transaction) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await anomalyService.detectTransactionAnomaly(transaction as any, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'AnomalyService',
        'detectTransactionAnomaly',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [transaction, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) detect();
    return () => cancel();
  }, [immediate, detect, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: detect,
    cancel,
  }), [result, loading, error, detect, cancel]);
}

// ============================================
// KNOWLEDGE GRAPH HOOKS
// ============================================

/**
 * Hook for project graph building
 */
export function useProjectGraph(projectIds: string[], options: UseAIOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<{ nodes: GraphNode[]; relationships: GraphRelationship[] }, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildGraph = useCallback(async () => {
    if (projectIds.length === 0) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await knowledgeGraphService.buildProjectGraph(projectIds, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'KnowledgeGraphService',
        'buildProjectGraph',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [projectIds, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) buildGraph();
    return () => cancel();
  }, [immediate, buildGraph, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: buildGraph,
    cancel,
  }), [result, loading, error, buildGraph, cancel]);
}

// ============================================
// RL HOOKS
// ============================================

/**
 * Hook for optimal investment recommendations
 */
export function useOptimalInvestment(
  state: { currentAllocation: Record<string, number>; marketConditions: Record<string, number>; impactTargets: any } | null,
  options: UseAIOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [result, setResult] = useState<Result<RLPolicy, AIServiceError> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIServiceError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getOptimal = useCallback(async () => {
    if (!state) return;
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await reinforcementLearningService.getOptimalInvestment(state as any, { 
        signal: abortControllerRef.current.signal 
      });
      
      setResult(response);
      if (response.ok && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const aiError = err instanceof AIServiceError ? err : new AIServiceError(
        err instanceof Error ? err.message : 'Unknown error',
        'ReinforcementLearningService',
        'getOptimalInvestment',
        { originalError: err instanceof Error ? err : undefined }
      );
      setError(aiError);
      if (onError) onError(aiError);
    } finally {
      setLoading(false);
    }
  }, [state, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) getOptimal();
    return () => cancel();
  }, [immediate, getOptimal, cancel]);

  return useMemo(() => ({
    data: result?.ok ? result.data : null,
    loading,
    error,
    refetch: getOptimal,
    cancel,
  }), [result, loading, error, getOptimal, cancel]);
}

// ============================================
// HOOK EXPORTS
// ============================================

export type {
  UseAIOptions,
  UseAIResult,
};
