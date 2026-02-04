/**
 * AI Services Types
 * Comprehensive type definitions for the AI services layer
 */

// ============================================================================
// Core AI Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  functions?: FunctionDefinition[];
  stream?: boolean;
  provider?: string;
  correlationId?: string;
}

export interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: TokenUsage;
  provider: string;
  latency_ms: number;
}

export interface EmbedRequest {
  input: string | string[];
  model?: string;
  encoding_format?: 'float' | 'base64';
  provider?: string;
  correlationId?: string;
}

export interface EmbedResponse {
  object: 'list';
  data: {
    object: 'embedding';
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: TokenUsage;
  provider: string;
}

export interface CompletionRequest {
  prompt: string;
  model?: string;
  suffix?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  echo?: boolean;
  provider?: string;
  correlationId?: string;
}

export interface CompletionResponse {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    finish_reason: string;
    logprobs?: any;
  }[];
  usage: TokenUsage;
  provider: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============================================================================
// Provider Types
// ============================================================================

export type AICapability = 
  | 'chat'
  | 'completion'
  | 'embedding'
  | 'vision'
  | 'function-calling'
  | 'stream';

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: AICapability[];
  
  chat(request: ChatRequest): Promise<ChatResponse>;
  embed(request: EmbedRequest): Promise<EmbedResponse>;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  
  configure(config: ProviderConfig): void;
  healthCheck(): Promise<ProviderHealth>;
  getUsage(): ProviderUsage;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: RateLimitConfig;
  modelMapping?: Record<string, string>;
  customHeaders?: Record<string, string>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  maxConcurrent?: number;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  latency: number;
  errorRate: number;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
  lastChecked: string;
  details?: Record<string, any>;
}

export interface ProviderUsage {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// ============================================================================
// Resilience Types
// ============================================================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
  monitoringWindow?: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number;
  totalRequests: number;
  failedRequests: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter?: number;
  retryOnStatusCodes?: number[];
  retryOnErrors?: string[];
}

export interface QueueConfig {
  maxSize: number;
  maxWaitTime: number;
  maxConcurrent: number;
  priorityLevels?: number;
}

export type RequestPriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueueStats {
  queued: number;
  processing: number;
  paused: boolean;
  dropped: number;
  avgWaitTime: number;
}

// ============================================================================
// Telemetry Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  correlationId: string;
  timestamp: string;
  service: string;
  provider?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  spanId?: string;
  parentSpanId?: string;
}

export interface MetricsSnapshot {
  timestamp: string;
  provider?: string;
  operation?: string;
  latency: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  throughput: {
    total: number;
    perSecond: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
  };
}

export interface TelemetryConfig {
  serviceName: string;
  environment: string;
  version: string;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  enableExternal: boolean;
  externalEndpoint?: string;
  samplingRate: number;
  correlationIdHeader: string;
  piiFilterPatterns: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AIConfiguration {
  providers: {
    openai: OpenAIProviderConfig;
    anthropic: AnthropicProviderConfig;
    customML?: CustomMLProviderConfig;
  };
  defaults: {
    primaryProvider: string;
    fallbackProviders: string[];
    defaultModel: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
  };
  resilience: {
    circuitBreaker: CircuitBreakerConfig;
    retry: RetryConfig;
    queue: QueueConfig;
  };
  observability: TelemetryConfig;
  security: {
    piiFilterEnabled: boolean;
    costTrackingEnabled: boolean;
    maxDailyCost?: number;
    allowedProviders: string[];
  };
}

export interface OpenAIProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  organization?: string;
  models: {
    chat: string;
    completion: string;
    embedding: string;
  };
  rateLimit: RateLimitConfig;
  timeout: number;
  timeoutFactor?: number;
}

export interface AnthropicProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: {
    chat: string;
    completion: string;
  };
  rateLimit: RateLimitConfig;
  timeout: number;
}

export interface CustomMLProviderConfig {
  enabled: boolean;
  endpoint: string;
  apiKey?: string;
  models: {
    carbonPrediction: string;
    riskAssessment: string;
    recommendation: string;
  };
  timeout: number;
}

// ============================================================================
// Health & Monitoring Types
// ============================================================================

export interface HealthDashboardData {
  overallStatus: 'healthy' | 'degraded' | 'unavailable' | 'maintenance';
  timestamp: string;
  version: string;
  uptime: number;
  providers: ProviderHealthStatus[];
  aggregateMetrics: AggregateMetrics;
  alerts: Alert[];
  configuration: {
    primaryProvider: string;
    fallbackProviders: string[];
    circuitBreakerEnabled: boolean;
    retryEnabled: boolean;
  };
}

export interface ProviderHealthStatus {
  providerId: string;
  providerName: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  circuitState: CircuitState;
  capabilities: AICapability[];
  metrics: {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    p99Latency: number;
    errorRate: number;
    tokensPerSecond: number;
  };
  rateLimits: {
    requestsRemaining: number;
    tokensRemaining: number;
    resetAt: string;
  };
  costs: {
    daily: number;
    monthly: number;
    currency: string;
  };
  lastHealthCheck: string;
  lastSuccessfulRequest?: string;
}

export interface AggregateMetrics {
  totalRequests: number;
  avgLatency: number;
  p99Latency: number;
  errorRate: number;
  costRate: {
    total: number;
    currency: string;
  };
  throughput: {
    requestsPerSecond: number;
    tokensPerSecond: number;
  };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  type: 'error_rate' | 'latency' | 'cost' | 'availability' | 'rate_limit';
  title: string;
  message: string;
  provider?: string;
  threshold?: number;
  currentValue?: number;
  startedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type AIErrorCode = 
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TOKEN_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'AUTHENTICATION_ERROR'
  | 'CIRCUIT_OPEN'
  | 'TIMEOUT'
  | 'CONTENT_FILTERED'
  | 'UNKNOWN_ERROR';

export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public provider?: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class CircuitBreakerError extends AIError {
  constructor(provider: string, public circuitState: CircuitState) {
    super(`Circuit breaker is ${circuitState}`, 'CIRCUIT_OPEN', provider);
    this.name = 'CircuitBreakerError';
  }
}

export class RetryExhaustedError extends AIError {
  constructor(
    message: string,
    provider: string,
    public attempts: number,
    public lastError: Error
  ) {
    super(message, 'PROVIDER_UNAVAILABLE', provider);
    this.name = 'RetryExhaustedError';
  }
}

export class QueueOverflowError extends Error {
  constructor(message: string, public droppedRequest?: any) {
    super(message);
    this.name = 'QueueOverflowError';
  }
}

export class RequestTimeoutError extends Error {
  constructor(message: string, public requestId: string) {
    super(message);
    this.name = 'RequestTimeoutError';
  }
}
