/**
 * AI Services - React Context Provider
 * Production-ready context for managing AI services in React applications
 */

import React, { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import { AIServiceError, apiClient } from '../services/ai/baseClient';
import { nlpService } from '../services/ai/nlpService';
import { visionService } from '../services/ai/visionService';
import { 
  predictionService, 
  anomalyService, 
  recommendationService, 
  forecastingService, 
  knowledgeGraphService, 
  reinforcementLearningService 
} from '../services/ai/predictionService';

// ============================================
// CONTEXT TYPES
// ============================================

interface AIContextValue {
  // Services
  nlpService: typeof nlpService;
  visionService: typeof visionService;
  predictionService: typeof predictionService;
  anomalyService: typeof anomalyService;
  recommendationService: typeof recommendationService;
  forecastingService: typeof forecastingService;
  knowledgeGraphService: typeof knowledgeGraphService;
  reinforcementLearningService: typeof reinforcementLearningService;
  
  // Status
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  mockMode: boolean;
  setMockMode: (enabled: boolean) => void;
  
  // Cache
  clearAllCaches: () => void;
  
  // Error handling
  logError: (error: AIServiceError) => void;
  getRecentErrors: () => AIServiceError[];
  clearErrorLog: () => void;
}

interface AIProviderProps {
  children: ReactNode;
  initialMockMode?: boolean;
  onError?: (error: AIServiceError) => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AIContext = createContext<AIContextValue | null>(null);

// ============================================
// ERROR LOGGING
// ============================================

const errorLog: AIServiceError[] = [];
const MAX_ERROR_LOG_SIZE = 50;

function addToErrorLog(error: AIServiceError): void {
  errorLog.unshift(error);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop();
  }
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AIProvider({ 
  children, 
  initialMockMode = false,
  onError 
}: AIProviderProps): JSX.Element {
  const [isOnline, setOnline] = useState(true);
  const [mockMode, setMockModeState] = useState(initialMockMode);

  // Update mock mode on services when it changes
  const setMockMode = useCallback((enabled: boolean) => {
    setMockModeState(enabled);
    apiClient.setMockMode(enabled);
  }, []);

  // Handle errors
  const logError = useCallback((error: AIServiceError) => {
    addToErrorLog(error);
    if (onError) onError(error);
  }, [onError]);

  // Get recent errors
  const getRecentErrors = useCallback((): AIServiceError[] => {
    return [...errorLog];
  }, []);

  // Clear error log
  const clearErrorLog = useCallback(() => {
    errorLog.length = 0;
  }, []);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    nlpService.clearCache();
    visionService.clearCache();
    predictionService.clearCache();
    recommendationService.clearCache();
  }, []);

  // Create context value
  const value = useMemo<AIContextValue>(() => ({
    nlpService,
    visionService,
    predictionService,
    anomalyService,
    recommendationService,
    forecastingService,
    knowledgeGraphService,
    reinforcementLearningService,
    isOnline,
    setOnline,
    mockMode,
    setMockMode,
    clearAllCaches,
    logError,
    getRecentErrors,
    clearErrorLog,
  }), [
    isOnline,
    mockMode,
    setMockMode,
    clearAllCaches,
    logError,
    getRecentErrors,
    clearErrorLog,
  ]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to access AI context
 */
export function useAI(): AIContextValue {
  const context = useContext(AIContext);
  
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
}

// ============================================
// SERVICE HOOKS (convenience hooks for individual services)
// ============================================

/**
 * Hook to access NLP service with error handling
 */
export function useNLPService() {
  const { nlpService, logError, clearAllCaches } = useAI();
  
  return useMemo(() => ({
    service: nlpService,
    logError,
    clearCache: clearAllCaches,
  }), [nlpService, logError, clearAllCaches]);
}

/**
 * Hook to access Vision service with error handling
 */
export function useVisionService() {
  const { visionService, logError } = useAI();
  
  return useMemo(() => ({
    service: visionService,
    logError,
  }), [visionService, logError]);
}

/**
 * Hook to access Prediction service with error handling
 */
export function usePredictionService() {
  const { predictionService, logError } = useAI();
  
  return useMemo(() => ({
    service: predictionService,
    logError,
  }), [predictionService, logError]);
}

/**
 * Hook to access Recommendation service with error handling
 */
export function useRecommendationService() {
  const { recommendationService, logError } = useAI();
  
  return useMemo(() => ({
    service: recommendationService,
    logError,
  }), [recommendationService, logError]);
}

// ============================================
// EXPORTS
// ============================================

export type {
  AIContextValue,
  AIProviderProps,
};
