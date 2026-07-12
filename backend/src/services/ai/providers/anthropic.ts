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
  AIError,
} from '../types';
import { CircuitBreaker } from '../resilience/circuitBreaker';
import { RetryPolicy } from '../resilience/retryPolicy';
import { TelemetryService } from '../observability/telemetry';

export class AnthropicProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';
  readonly capabilities: AICapability[] = ['chat', 'completion'];

  private config: ProviderConfig = {};
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;
  private telemetry: TelemetryService;
  private baseUrl = 'https://api.anthropic.com';
  private usage: ProviderUsage = { totalRequests: 0, totalTokens: 0, totalCost: 0, byModel: {} };

  constructor(telemetry: TelemetryService) {
    this.telemetry = telemetry;
    this.circuitBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000, halfOpenRequests: 3 });
    this.retryPolicy = new RetryPolicy({ maxRetries: 3, baseDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 });
  }

  configure(config: ProviderConfig): void {
    this.config = { ...this.config, ...config };
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }

  isReady(): boolean {
    return !!this.config.apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    return this.circuitBreaker.execute(() =>
      this.retryPolicy.execute(async () => {
        const model = request.model || 'claude-3-opus-20240229';
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: request.max_tokens ?? 1024,
            messages: request.messages
              .filter(m => m.role !== 'system')
              .map(m => ({ role: m.role, content: m.content })),
            system: request.messages.find(m => m.role === 'system')?.content,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new AIError((err as any).error?.message || 'Anthropic API error', 'UNKNOWN_ERROR', this.id, response.status);
        }

        const data: any = await response.json();
        const inputTokens = data.usage?.input_tokens ?? 0;
        const outputTokens = data.usage?.output_tokens ?? 0;
        this.updateUsage(model, inputTokens, outputTokens);
        this.telemetry.recordLatency(this.id, 'chat', Date.now() - startTime);
        this.telemetry.recordSuccess(this.id, 'chat');

        return {
          id: data.id,
          object: 'chat.completion' as const,
          created: Math.floor(Date.now() / 1000),
          model: data.model,
          choices: [{
            index: 0,
            message: { role: 'assistant', content: data.content?.[0]?.text ?? '' },
            finish_reason: data.stop_reason ?? 'stop',
          }],
          usage: { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens },
          provider: this.id,
          latency_ms: Date.now() - startTime,
        };
      })
    );
  }

  async embed(_request: EmbedRequest): Promise<EmbedResponse> {
    throw new AIError('Anthropic does not support embeddings', 'INVALID_REQUEST', this.id);
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const chatResponse = await this.chat({
      messages: [{ role: 'user', content: request.prompt }],
      model: request.model,
      max_tokens: request.max_tokens,
      temperature: request.temperature,
    });
    return {
      id: chatResponse.id,
      object: 'text_completion' as const,
      created: chatResponse.created,
      model: chatResponse.model,
      choices: [{ text: chatResponse.choices[0].message.content, index: 0, finish_reason: chatResponse.choices[0].finish_reason }],
      usage: chatResponse.usage,
      provider: this.id,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await this.chat({ messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 });
      return { status: 'healthy', latency: Date.now() - start, errorRate: 0, lastChecked: new Date().toISOString() };
    } catch (error) {
      return { status: 'unavailable', latency: Date.now() - start, errorRate: 1, lastChecked: new Date().toISOString(), details: { error: (error as Error).message } };
    }
  }

  getUsage(): ProviderUsage {
    return { ...this.usage };
  }

  private updateUsage(model: string, inputTokens: number, outputTokens: number): void {
    const total = inputTokens + outputTokens;
    this.usage.totalRequests++;
    this.usage.totalTokens += total;
    const m = this.usage.byModel[model] ?? { requests: 0, tokens: 0, cost: 0 };
    m.requests++;
    m.tokens += total;
    // claude-3-opus pricing (per token)
    m.cost += inputTokens * 0.000015 + outputTokens * 0.000075;
    this.usage.byModel[model] = m;
    this.usage.totalCost += m.cost;
  }
}
