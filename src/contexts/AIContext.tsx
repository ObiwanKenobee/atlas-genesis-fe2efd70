/**
 * AI Context (Placeholder)
 * 
 * Provides AI service access throughout the application
 * TODO: Restore full AI service integration
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

interface AIContextValue {
  isAvailable: boolean;
  isLoading: boolean;
}

const defaultValue: AIContextValue = {
  isAvailable: false,
  isLoading: false,
};

const AIContext = createContext<AIContextValue>(defaultValue);

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const value = useMemo<AIContextValue>(() => ({
    isAvailable: false,
    isLoading: false,
  }), []);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}

export default AIContext;