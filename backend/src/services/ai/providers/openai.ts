/**
 * OpenAI Provider Implementation
 * 
 * Implements the IAIProvider interface for OpenAI API integration.
 */

import {
  ChatRequest,
  ChatResponse,
  EmbedRequest,
  EmbedResponse,
  CompletionRequest,
  CompletionResponse,
  ProviderConfig,
  ProviderHealth,
  ProviderUsage,
  AICapability,
  CircuitBreakerConfig,
  RetryConfig,
  AIError
} from '../types';
import { CircuitBreaker } from '../resilience/circuitBreaker';
import { RetryPolicy } from '../resilience/retryPolicy';
import { TelemetryService } from '../observability/telemetry';

/**
 * OpenAI Provider implementation
 */
export class OpenAIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly capabilities: AICapability[] = [
    'chat',
    'completion',
    'embedding',
    'function-calling',
    'stream'
  ];

  private config: ProviderConfig = {};
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;
  private telemetry: TelemetryService;
  private usage: ProviderUsage;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(
    telemetryService: TelemetryService,
    circuitConfig?: CircuitBreakerConfig,
    retryConfig?: RetryConfig
  ) {
    this.telemetry = telemetryService;
    
    const defaultCircuitConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 30000,
      halfOpenRequests: 3
    };
    
    const defaultRetryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    };
    
    this.circuitBreaker = new CircuitBreaker(circuitConfig || defaultCircuitConfig);
    this.retryPolicy = new RetryPolicy(retryConfig || defaultRetryConfig);
    this.usage = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byModel: {}
    };
  }

  /**
   * Configure the provider
   */
  configure(config: ProviderConfig): void {
    this.config = { ...this.config, ...config };
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * Check if provider is ready
   */
  isReady(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Chat completion
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const correlationId = request.correlationId || this.telemetry.generateCorrelationId();
    const startTime = Date.now();

    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        try {
          const response = await this.callChatAPI(request, correlationId);
          
          // Update metrics
          this.telemetry.recordLatency(this.id, 'chat', Date.now() - startTime);
          this.telemetry.recordSuccess(this.id, 'chat');
          
          return response;
        } catch (error) {
          this.telemetry.recordError(this.id, 'chat', error as Error);
          throw error;
        }
      });
    });
  }

  /**
   * Call OpenAI Chat API
   */
  private async callChatAPI(
    request: ChatRequest,
    correlationId: string
  ): Promise<ChatResponse> {
    const model = request.model || 'gpt-4';
    const url = `${this.baseUrl}/chat/completions`;
    
    const body: Record<string, any> = {
      model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
        name: m.name
      })),
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      frequency_penalty: request.frequency_penalty,
      presence_penalty: request.presence_penalty,
      stop: request.stop,
      stream: request.stream || false
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Correlation-ID': correlationId
    };

    if ((this.config as any).organization) {
      headers['OpenAI-Organization'] = (this.config as any).organization;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIError(
        (errorData as any).error?.message || 'OpenAI API error',
        'UNKNOWN_ERROR',
        this.id,
        response.status,
        errorData
      );
    }

    const data: any = await response.json();
    
    // Update usage
    this.updateUsage(model, data.usage);

    return {
      id: data.id,
      object: 'chat.completion',
      created: data.created,
      model: data.model,
      choices: data.choices.map((c: any, i: number) => ({
        index: i,
        message: {
          role: c.message.role,
          content: c.message.content,
          function_call: c.message.function_call
        },
        finish_reason: c.finish_reason
      })),
      usage: {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens
      },
      provider: this.id,
      latency_ms: 0
    };
  }

  /**
   * Embeddings
   */
  async embed(request: EmbedRequest): Promise<EmbedResponse> {
    const correlationId = request.correlationId || this.telemetry.generateCorrelationId();
    const startTime = Date.now();

    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        try {
          const model = request.model || 'text-embedding-ada-002';
          const url = `${this.baseUrl}/embeddings`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-Correlation-ID': correlationId
            },
            body: JSON.stringify({
              model,
              input: request.input,
              encoding_format: request.encoding_format
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new AIError(
              (errorData as any).error?.message || 'Embeddings API error',
              'UNKNOWN_ERROR',
              this.id,
              response.status,
              errorData
            );
          }

          const data: any = await response.json();
          
          this.telemetry.recordLatency(this.id, 'embed', Date.now() - startTime);
          this.telemetry.recordSuccess(this.id, 'embed');

          return {
            object: 'list',
            data: data.data.map((d: any, i: number) => ({
              object: 'embedding',
              embedding: d.embedding,
              index: i
            })),
            model: data.model,
            usage: {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: 0,
              total_tokens: data.usage.prompt_tokens
            },
            provider: this.id
          };
        } catch (error) {
          this.telemetry.recordError(this.id, 'embed', error as Error);
          throw error;
        }
      });
    });
  }

  /**
   * Text completion
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const correlationId = request.correlationId || this.telemetry.generateCorrelationId();
    const startTime = Date.now();

    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        try {
          const model = request.model || 'gpt-3.5-turbo-instruct';
          const url = `${this.baseUrl}/completions`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-Correlation-ID': correlationId
            },
            body: JSON.stringify({
              model,
              prompt: request.prompt,
              suffix: request.suffix,
              max_tokens: request.max_tokens,
              temperature: request.temperature,
              top_p: request.top_p,
              stream: request.stream || false,
              echo: request.echo || false
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new AIError(
              (errorData as any).error?.message || 'Completion API error',
              'UNKNOWN_ERROR',
              this.id,
              response.status,
              errorData
            );
          }

          const data: any = await response.json();
          
          this.telemetry.recordLatency(this.id, 'complete', Date.now() - startTime);
          this.telemetry.recordSuccess(this.id, 'complete');

          return {
            id: data.id,
            object: 'text_completion',
            created: data.created,
            model: data.model,
            choices: data.choices.map((c: any, i: number) => ({
              text: c.text,
              index: i,
              finish_reason: c.finish_reason
            })),
            usage: {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens
            },
            provider: this.id
          };
        } catch (error) {
          this.telemetry.recordError(this.id, 'complete', error as Error);
          throw error;
        }
      });
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      await this.callChatAPI(
        { messages: [{ role: 'user', content: 'ping' }] },
        'health-check'
      );

      return {
        status: 'healthy',
        latency: Date.now() - startTime,
        errorRate: 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unavailable',
        latency: Date.now() - startTime,
        errorRate: 1,
        lastChecked: new Date().toISOString(),
        details: {
          error: (error as Error).message
        }
      };
    }
  }

  /**
   * Get usage statistics
   */
  getUsage(): ProviderUsage {
    return { ...this.usage };
  }

  /**
   * Update usage statistics
   */
  private updateUsage(model: string, usage: any): void {
    this.usage.totalRequests++;
    this.usage.totalTokens += usage.total_tokens;

    const modelUsage = this.usage.byModel[model] || {
      requests: 0,
      tokens: 0,
      cost: 0
    };
    
    modelUsage.requests++;
    modelUsage.tokens += usage.total_tokens;
    // Calculate cost (simplified)
    const pricing = this.getModelPricing(model);
    modelUsage.cost += (usage.prompt_tokens * pricing.input) + 
                       (usage.completion_tokens * pricing.output);
    
    this.usage.byModel[model] = modelUsage;
    this.usage.totalCost += modelUsage.cost;

    this.telemetry.recordTokenUsage(
      this.id,
      model,
      usage.prompt_tokens,
      usage.completion_tokens
    );
    this.telemetry.recordCost(this.id, modelUsage.cost);
  }

  /**
   * Get model pricing
   */
  private getModelPricing(model: string): { input: number; output: number } {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.00003, output: 0.00006 },
      'gpt-4-32k': { input: 0.00006, output: 0.00012 },
      'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 },
      'gpt-3.5-turbo-16k': { input: 0.000003, output: 0.000004 },
      'text-embedding-ada-002': { input: 0.0000001, output: 0 }
    };

    return pricing[model] || { input: 0.00001, output: 0.00002 };
  }
}
