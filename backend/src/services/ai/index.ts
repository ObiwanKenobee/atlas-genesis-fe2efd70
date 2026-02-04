/**
 * AI Services Module
 * 
 * Comprehensive AI services infrastructure for Atlas Humanitarian platform.
 * 
 * Features:
 * - Multi-provider support (OpenAI, Anthropic, custom ML)
 * - Circuit breaker pattern for resilience
 * - Retry with exponential backoff
 * - Request queuing with backpressure
 * - Structured logging with correlation IDs
 * - PII filtering for privacy
 * - Cost tracking per provider
 */

// Types
export * from './types';

// Providers
export { OpenAIProvider } from './providers/openai';
export { BaseAIProvider, ProviderFactory } from './providers/base';

// Resilience
export { CircuitBreaker, CircuitBreakerManager } from './resilience/circuitBreaker';
export { RetryPolicy, AdaptiveRetryPolicy } from './resilience/retryPolicy';
export { RequestQueue } from './resilience/requestQueue';

// Observability
export { TelemetryService, PIIFilter } from './observability/telemetry';

// Main Service
export { AIService, AIServiceFactory } from './aiService';
