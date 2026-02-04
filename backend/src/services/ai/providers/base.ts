/**
 * AI Provider Base Interface
 * 
 * Defines the contract for all AI providers in the multi-provider architecture.
 */

import {
  IAIProvider,
  ChatRequest,
  ChatResponse,
  EmbedRequest,
  EmbedResponse,
  CompletionRequest,
  CompletionResponse,
  ProviderConfig,
  ProviderHealth,
  ProviderUsage,
  AICapability
} from '../types';

/**
 * Abstract base class for AI providers
 */
export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly capabilities: AICapability[];
  
  protected config: ProviderConfig = {};
  protected isConfigured: boolean = false;

  /**
   * Configure the provider
   */
  configure(config: ProviderConfig): void {
    this.config = { ...this.config, ...config };
    this.isConfigured = true;
    this.onConfigure();
  }

  /**
   * Hook called after configuration
   */
  protected onConfigure(): void {
    // Override in subclass if needed
  }

  /**
   * Check if provider is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && this.validateConfiguration();
  }

  /**
   * Validate configuration
   */
  protected validateConfiguration(): boolean {
    return !!this.config.apiKey || !!this.config.baseUrl;
  }

  /**
   * Abstract methods that must be implemented by providers
   */
  abstract chat(request: ChatRequest): Promise<ChatResponse>;
  abstract embed(request: EmbedRequest): Promise<EmbedResponse>;
  abstract complete(request: CompletionRequest): Promise<CompletionResponse>;
  abstract healthCheck(): Promise<ProviderHealth>;
  abstract getUsage(): ProviderUsage;

  /**
   * Create a common error response
   */
  protected createErrorResponse(
    error: Error,
    provider: string
  ): never {
    const aiError = error as any;
    throw new Error(
      `Provider ${provider} error: ${aiError.message || error.message}`,
      { cause: error }
    );
  }
}

/**
 * Provider Factory for creating providers
 */
export class ProviderFactory {
  private static providers: Map<string, new (...args: any[]) => BaseAIProvider> = new Map();

  /**
   * Register a provider
   */
  static register(
    id: string,
    providerClass: new (...args: any[]) => BaseAIProvider
  ): void {
    this.providers.set(id, providerClass);
  }

  /**
   * Create a provider instance
   */
  static create(
    id: string,
    config: ProviderConfig
  ): BaseAIProvider | undefined {
    const ProviderClass = this.providers.get(id);
    if (!ProviderClass) return undefined;

    const provider = new ProviderClass();
    provider.configure(config);
    return provider;
  }

  /**
   * Check if provider is registered
   */
  static has(id: string): boolean {
    return this.providers.has(id);
  }
}
