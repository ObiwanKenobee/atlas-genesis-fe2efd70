/**
 * AI Services - Enterprise Error Types and API Base Client
 * Production-ready error handling, request management, and caching
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================
// ERROR TYPES
// ============================================

export type AIServiceName = 
  | 'NLPService'
  | 'VisionService'
  | 'PredictionService'
  | 'AnomalyService'
  | 'RecommendationService'
  | 'ForecastingService'
  | 'KnowledgeGraphService'
  | 'ReinforcementLearningService';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AIErrorContext {
  service: AIServiceName;
  operation: string;
  requestId: string;
  timestamp: string;
  endpoint?: string;
  parameters?: Record<string, unknown>;
}

export class AIServiceError extends Error {
  public readonly service: AIServiceName;
  public readonly operation: string;
  public readonly requestId: string;
  public readonly timestamp: string;
  public readonly severity: ErrorSeverity;
  public readonly isRetryable: boolean;
  public readonly fallbackUsed: boolean;
  public readonly context: AIErrorContext;

  constructor(
    message: string,
    service: AIServiceName,
    operation: string,
    options: {
      severity?: ErrorSeverity;
      isRetryable?: boolean;
      fallbackUsed?: boolean;
      endpoint?: string;
      parameters?: Record<string, unknown>;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.service = service;
    this.operation = operation;
    this.requestId = uuidv4();
    this.timestamp = new Date().toISOString();
    this.severity = options.severity || 'medium';
    this.isRetryable = options.isRetryable ?? true;
    this.fallbackUsed = options.fallbackUsed ?? false;
    this.context = {
      service,
      operation,
      requestId: this.requestId,
      timestamp: this.timestamp,
      endpoint: options.endpoint,
      parameters: options.parameters,
    };

    // Capture stack trace (Node.js/V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIServiceError);
    }

    // Log error with context
    this.logError(options.originalError);
  }

  private logError(originalError?: Error): void {
    const logData = {
      errorId: this.requestId,
      service: this.service,
      operation: this.operation,
      message: this.message,
      severity: this.severity,
      isRetryable: this.isRetryable,
      fallbackUsed: this.fallbackUsed,
      timestamp: this.timestamp,
      originalError: originalError?.message || originalError,
    };

    if (this.severity === 'critical') {
      console.error('[AI-CRITICAL]', JSON.stringify(logData, null, 2));
    } else if (this.severity === 'high') {
      console.error('[AI-ERROR]', JSON.stringify(logData));
    } else {
      console.warn('[AI-WARNING]', JSON.stringify(logData));
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      service: this.service,
      operation: this.operation,
      requestId: this.requestId,
      timestamp: this.timestamp,
      severity: this.severity,
      isRetryable: this.isRetryable,
      fallbackUsed: this.fallbackUsed,
      stack: this.stack,
    };
  }
}

// ============================================
// RESULT TYPE
// ============================================

/**
 * Result type for operations that can fail
 */
export type Result<T, E = AIServiceError> = 
  | { ok: true; data: T }
  | { ok: false; error: E };

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T> {
  return { ok: true, data };
}

/**
 * Create a failure result
 */
export function failure<T>(error: AIServiceError): Result<T, AIServiceError> {
  return { ok: false, error };
}

// ============================================
// API BASE CLIENT
// ============================================

export interface APIRequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  signal?: AbortSignal;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useMock?: boolean;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  requestId: string;
  duration: number;
}

export class APIClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private abortControllers: Map<string, AbortController>;
  private mockMode: boolean;

  constructor(options: {
    baseUrl?: string;
    defaultTimeout?: number;
    defaultRetries?: number;
    mockMode?: boolean;
  } = {}) {
    this.baseUrl = options.baseUrl || import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.defaultTimeout = options.defaultTimeout || 30000; // 30 seconds
    this.defaultRetries = options.defaultRetries || 3;
    this.abortControllers = new Map();
    this.mockMode = options.mockMode || false;
  }

  /**
   * Execute an API request with retries and timeout
   */
  async request<T>(
    service: AIServiceName,
    operation: string,
    config: APIRequestConfig,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const requestId = uuidv4();
    const startTime = performance.now();

    // Check if mock mode is enabled
    if (this.mockMode || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      if (fallback) {
        return fallback();
      }
      throw new AIServiceError(
        `Mock mode enabled, no fallback provided`,
        service,
        operation,
        { severity: 'low', isRetryable: false, fallbackUsed: false, endpoint: config.endpoint }
      );
    }

    // Create AbortController with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.timeout || this.defaultTimeout);
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await fetch(`${this.baseUrl}${config.endpoint}`, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal || abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIServiceError(
          `API request failed: ${response.status} ${response.statusText}`,
          service,
          operation,
          {
            severity: response.status >= 500 ? 'high' : 'medium',
            isRetryable: response.status >= 500,
            fallbackUsed: false,
            endpoint: config.endpoint,
            parameters: config.body as Record<string, unknown>,
            originalError: new Error(errorText),
          }
        );
      }

      const data = await response.json();
      const duration = performance.now() - startTime;

      // Log successful request
      console.log(`[AI-REQUEST] ${service}.${operation} - ${duration.toFixed(2)}ms`);

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIServiceError(
          `Request timed out after ${config.timeout || this.defaultTimeout}ms`,
          service,
          operation,
          { severity: 'high', isRetryable: true, fallbackUsed: false, endpoint: config.endpoint }
        );
      }

      // Handle AIServiceError
      if (error instanceof AIServiceError) {
        // Try fallback if available
        if (fallback && error.isRetryable) {
          const currentRetries = 0; // Could track retries in context
          if (currentRetries < (config.retries || this.defaultRetries)) {
            return this.retryWithDelay(() => fallback(), config.retryDelay || 1000);
          }
        }
        throw error;
      }

      // Handle unexpected errors
      throw new AIServiceError(
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        service,
        operation,
        { severity: 'high', isRetryable: true, fallbackUsed: false, endpoint: config.endpoint }
      );
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithDelay<T>(
    fn: () => Promise<T>,
    delay: number,
    maxRetries: number = this.defaultRetries
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Set mock mode
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
}

// ============================================
// CACHE WITH LRU EVICTION
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private maxAccessCount: number;

  constructor(options: {
    maxSize?: number;
    ttl?: number;
    maxAccessCount?: number;
  } = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 10 * 60 * 1000; // 10 minutes
    this.maxAccessCount = options.maxAccessCount || 100;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, data: T): void {
    // Check if we need to evict
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entries
   */
  private evict(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove 20% of cache
    const toRemove = Math.ceil(this.maxSize * 0.2);
    entries.slice(0, toRemove).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    let hits = 0;
    let misses = 0;
    
    this.cache.forEach(entry => {
      if (entry.accessCount > 0) hits++;
      else misses++;
    });

    const total = hits + misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? hits / total : 0,
    };
  }
}

// ============================================
// DEFAULT EXPORTS
// ============================================

export const apiClient = new APIClient();
export const globalCache = new LRUCache();
