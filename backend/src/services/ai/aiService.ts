/**
 * AI Service Factory
 * 
 * Central factory for creating and managing AI services with dependency injection.
 */

import {
  AIConfiguration,
  IAIProvider,
  ChatRequest,
  ChatResponse,
  EmbedRequest,
  EmbedResponse,
  CompletionRequest,
  CompletionResponse,
  ProviderHealth,
  ProviderUsage,
  HealthDashboardData,
  ProviderHealthStatus,
  CircuitBreakerMetrics
} from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { TelemetryService } from './observability/telemetry';
import { CircuitBreaker } from './resilience/circuitBreaker';
import { CircuitBreakerError } from './types';

interface ServiceDependencies {
  telemetry: TelemetryService;
}

/**
 * Main AI Service that manages providers and routing
 */
export class AIService {
  private providers: Map<string, IAIProvider> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private telemetry: TelemetryService;
  private config: AIConfiguration;
  private startTime: number;

  constructor(config: AIConfiguration, deps: ServiceDependencies) {
    this.config = config;
    this.telemetry = deps.telemetry;
    this.startTime = Date.now();
    
    this.initializeProviders();
  }

  /**
   * Initialize all configured providers
   */
  private initializeProviders(): void {
    if (this.config.providers.openai?.enabled) {
      const openai = new OpenAIProvider(this.telemetry);
      openai.configure({
        apiKey: this.config.providers.openai.apiKey,
        baseUrl: this.config.providers.openai.baseUrl
      });
      this.providers.set('openai', openai);
    }

    if (this.config.providers.anthropic?.enabled) {
      const anthropic = new AnthropicProvider(this.telemetry);
      anthropic.configure({
        apiKey: this.config.providers.anthropic.apiKey,
        baseUrl: this.config.providers.anthropic.baseUrl
      });
      this.providers.set('anthropic', anthropic);
    }
  }

  /**
   * Get a provider by ID
   */
  getProvider(id: string): IAIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Get the primary provider
   */
  getPrimaryProvider(): IAIProvider | undefined {
    return this.providers.get(this.config.defaults.primaryProvider);
  }

  /**
   * Get fallback providers
   */
  getFallbackProviders(primaryId: string): IAIProvider[] {
    return this.config.defaults.fallbackProviders
      .filter(id => id !== primaryId)
      .map(id => this.providers.get(id))
      .filter((p): p is IAIProvider => p !== undefined);
  }

  /**
   * Chat completion with automatic fallback
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const correlationId = request.correlationId || this.telemetry.generateCorrelationId();
    this.telemetry.startSpan(correlationId);

    try {
      // Get requested provider or use primary
      const providerId = request.provider || this.config.defaults.primaryProvider;
      let provider = this.providers.get(providerId);

      // If provider not found, try primary
      if (!provider) {
        provider = this.getPrimaryProvider();
      }

      if (!provider) {
        throw new Error('No AI provider available');
      }

      // Try primary provider
      try {
        const response = await provider.chat(request);
        this.telemetry.endSpan();
        return response;
      } catch (error) {
        // If circuit breaker is open or provider failed, try fallbacks
        if (error instanceof CircuitBreakerError) {
          return this.tryFallbackProviders(request, 'chat', providerId);
        }
        throw error;
      }
    } catch (error) {
      this.telemetry.error('AI chat failed', error as Error, { correlationId });
      this.telemetry.endSpan();
      throw error;
    }
  }

  /**
   * Try fallback providers
   */
  private async tryFallbackProviders(
    request: ChatRequest | EmbedRequest | CompletionRequest,
    operation: 'chat' | 'embed' | 'complete',
    originalProviderId: string
  ): Promise<ChatResponse | EmbedResponse | CompletionResponse> {
    const fallbacks = this.getFallbackProviders(originalProviderId);
    const dispatch: Record<'chat' | 'embed' | 'complete', (p: IAIProvider, r: any) => Promise<any>> = {
      chat: (p, r) => p.chat(r as ChatRequest),
      embed: (p, r) => p.embed(r as EmbedRequest),
      complete: (p, r) => p.complete(r as CompletionRequest),
    };

    for (const provider of fallbacks) {
      try {
        return await dispatch[operation](provider, request);
      } catch (error) {
        this.telemetry.warn(
          `Fallback to ${provider.id} failed`,
          { operation, error: (error as Error).message }
        );
      }
    }

    throw new Error('All AI providers failed');
  }

  /**
   * Embeddings
   */
  async embed(request: EmbedRequest): Promise<EmbedResponse> {
    const provider = this.getPrimaryProvider();
    if (!provider) {
      throw new Error('No AI provider available');
    }
    return provider.embed(request);
  }

  /**
   * Text completion
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const provider = this.getPrimaryProvider();
    if (!provider) {
      throw new Error('No AI provider available');
    }
    return provider.complete(request);
  }

  /**
   * Get health dashboard data
   */
  async getHealthDashboard(): Promise<HealthDashboardData> {
    const providerStatuses: ProviderHealthStatus[] = [];

    for (const [id, provider] of this.providers) {
      const health = await provider.healthCheck();
      const usage = provider.getUsage();
      const circuitState = this.circuitBreakers.get(id)?.getState() || 'closed';

      providerStatuses.push({
        providerId: id,
        providerName: provider.name,
        status: health.status,
        circuitState,
        capabilities: provider.capabilities,
        metrics: {
          totalRequests: usage.totalRequests,
          successRate: usage.totalRequests > 0 
            ? 1 - (usage.byModel['failed']?.requests || 0) / usage.totalRequests 
            : 1,
          avgLatency: health.latency,
          p99Latency: health.latency * 2, // Simplified
          errorRate: health.errorRate,
          tokensPerSecond: 0 // Would need to calculate
        },
        rateLimits: {
          requestsRemaining: health.rateLimitRemaining || 0,
          tokensRemaining: health.rateLimitReset ? 0 : 0,
          resetAt: health.rateLimitReset || new Date().toISOString()
        },
        costs: {
          daily: usage.totalCost,
          monthly: usage.totalCost * 30,
          currency: 'USD'
        },
        lastHealthCheck: health.lastChecked
      });
    }

    const overallStatus = this.calculateOverallStatus(providerStatuses);

    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      providers: providerStatuses,
      aggregateMetrics: {
        totalRequests: providerStatuses.reduce((sum, p) => sum + p.metrics.totalRequests, 0),
        avgLatency: providerStatuses.reduce((sum, p) => sum + p.metrics.avgLatency, 0) / providerStatuses.length,
        p99Latency: Math.max(...providerStatuses.map(p => p.metrics.p99Latency)),
        errorRate: providerStatuses.reduce((sum, p) => sum + p.metrics.errorRate, 0) / providerStatuses.length,
        costRate: {
          total: providerStatuses.reduce((sum, p) => sum + p.costs.daily, 0),
          currency: 'USD'
        },
        throughput: {
          requestsPerSecond: 0,
          tokensPerSecond: 0
        }
      },
      alerts: [],
      configuration: {
        primaryProvider: this.config.defaults.primaryProvider,
        fallbackProviders: this.config.defaults.fallbackProviders,
        circuitBreakerEnabled: true,
        retryEnabled: true
      }
    };
  }

  /**
   * Calculate overall status from provider statuses
   */
  private calculateOverallStatus(statuses: ProviderHealthStatus[]): 'healthy' | 'degraded' | 'unavailable' {
    if (statuses.some(s => s.status === 'unavailable')) {
      return 'unavailable';
    }
    if (statuses.some(s => s.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Get all registered provider IDs
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is registered and ready
   */
  isProviderReady(id: string): boolean {
    const provider = this.providers.get(id);
    return provider ? (provider as any).isReady?.() || true : false;
  }
}

/**
 * Service Factory for creating AIService instances
 */
export class AIServiceFactory {
  private static instance: AIService | null = null;

  /**
   * Create or get existing AIService instance
   */
  static create(config?: AIConfiguration): AIService {
    if (this.instance && !config) {
      return this.instance;
    }

    if (!config) {
      // Load from environment or default config
      config = this.getDefaultConfig();
    }

    const telemetry = new TelemetryService(config.observability);
    const deps: ServiceDependencies = { telemetry };

    this.instance = new AIService(config, deps);
    return this.instance;
  }

  /**
   * Get default configuration
   */
  private static getDefaultConfig(): AIConfiguration {
    return {
      providers: {
        openai: {
          enabled: true,
          apiKey: process.env.OPENAI_API_KEY || '',
          baseUrl: 'https://api.openai.com/v1',
          models: {
            chat: 'gpt-4',
            completion: 'gpt-3.5-turbo-instruct',
            embedding: 'text-embedding-ada-002'
          },
          rateLimit: {
            requestsPerMinute: 100,
            tokensPerMinute: 60000
          },
          timeout: 30000
        },
        anthropic: {
          enabled: !!(process.env.ANTHROPIC_API_KEY),
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          baseUrl: 'https://api.anthropic.com',
          models: {
            chat: 'claude-3-opus-20240229',
            completion: 'claude-3-sonnet-20240229'
          },
          rateLimit: {
            requestsPerMinute: 50,
            tokensPerMinute: 100000
          },
          timeout: 60000
        }
      },
      defaults: {
        primaryProvider: 'openai',
        fallbackProviders: ['anthropic'],
        defaultModel: 'gpt-4',
        defaultTemperature: 0.7,
        defaultMaxTokens: 1000
      },
      resilience: {
        circuitBreaker: {
          failureThreshold: 5,
          resetTimeout: 30000,
          halfOpenRequests: 3
        },
        retry: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 30000,
          backoffMultiplier: 2
        },
        queue: {
          maxSize: 100,
          maxWaitTime: 5000,
          maxConcurrent: 10
        }
      },
      observability: {
        serviceName: 'ai-service',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        enableConsole: true,
        enableFile: false,
        enableExternal: false,
        samplingRate: 1,
        correlationIdHeader: 'X-Correlation-ID',
        piiFilterPatterns: []
      },
      security: {
        piiFilterEnabled: true,
        costTrackingEnabled: true,
        allowedProviders: ['openai']
      }
    };
  }

  /**
   * Reset factory (for testing)
   */
  static reset(): void {
    this.instance = null;
  }
}
