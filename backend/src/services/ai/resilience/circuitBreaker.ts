/**
 * Circuit Breaker Implementation
 * 
 * Implements the circuit breaker pattern to prevent cascading failures
 * when AI providers are experiencing issues.
 */

import { 
  CircuitBreakerConfig, 
  CircuitState, 
  CircuitBreakerMetrics,
  CircuitBreakerError 
} from '../types';

/**
 * Circuit Breaker states:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Fail-fast, no requests allowed
 * - HALF-OPEN: Testing recovery, limited requests allowed
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: number = 0;
  private halfOpenAttempts: number = 0;
  private totalRequests: number = 0;
  private failedRequests: number = 0;
  private failureTimestamps: number[] = [];

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition
    this.checkTransition();

    // If circuit is open, fail fast
    if (this.state === 'open') {
      this.recordFailedRequest();
      throw new CircuitBreakerError(
        this.getProviderId(),
        this.state
      );
    }

    this.totalRequests++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if circuit should transition state
   */
  private checkTransition(): void {
    // Clean up old failure timestamps
    this.cleanupOldFailures();

    // Transition from open to half-open after timeout
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure >= this.config.resetTimeout) {
        this.transitionTo('half-open');
      }
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successes++;
      
      // If enough successes in half-open, close the circuit
      if (this.successes >= this.config.halfOpenRequests) {
        this.transitionTo('closed');
      }
    } else {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    this.failureTimestamps.push(this.lastFailure);

    if (this.state === 'half-open') {
      // Any failure in half-open reopens the circuit
      this.transitionTo('open');
    } else if (this.failures >= this.config.failureThreshold) {
      // Open circuit after threshold reached
      this.transitionTo('open');
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;

    // Reset counters based on new state
    switch (newState) {
      case 'closed':
        this.failures = 0;
        this.successes = 0;
        this.halfOpenAttempts = 0;
        break;
      case 'open':
        this.successes = 0;
        this.halfOpenAttempts = 0;
        break;
      case 'half-open':
        this.halfOpenAttempts = 0;
        this.successes = 0;
        break;
    }

    // Log state transition
    console.log(
      `[CircuitBreaker] State transition: ${previousState} -> ${newState}`
    );
  }

  /**
   * Clean up failure timestamps outside monitoring window
   */
  private cleanupOldFailures(): void {
    const windowStart = Date.now() - (this.config.monitoringWindow || 60000);
    this.failureTimestamps = this.failureTimestamps.filter(
      ts => ts > windowStart
    );
    this.failures = this.failureTimestamps.length;
  }

  /**
   * Record a failed request for metrics
   */
  private recordFailedRequest(): void {
    this.failedRequests++;
    this.totalRequests++;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    this.checkTransition();
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    this.checkTransition();

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests
    };
  }

  /**
   * Get failure rate within monitoring window
   */
  getFailureRate(): number {
    if (this.totalRequests === 0) return 0;
    return this.failedRequests / this.totalRequests;
  }

  /**
   * Manually force circuit to a specific state (for testing/admin)
   */
  forceState(state: CircuitState): void {
    this.transitionTo(state);
  }

  /**
   * Reset circuit to initial closed state
   */
  reset(): void {
    this.transitionTo('closed');
    this.totalRequests = 0;
    this.failedRequests = 0;
    this.failureTimestamps = [];
  }

  /**
   * Get provider ID (for error messages)
   * Override in subclass or pass to constructor
   */
  protected getProviderId(): string {
    return 'unknown';
  }
}

/**
 * Circuit Breaker with per-provider identification
 */
export class ProviderCircuitBreaker extends CircuitBreaker {
  constructor(
    private providerId: string,
    config: CircuitBreakerConfig
  ) {
    super(config);
  }

  protected getProviderId(): string {
    return this.providerId;
  }
}

/**
 * Circuit Breaker Manager - manages multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Register a circuit breaker for a provider
   */
  register(providerId: string, config: CircuitBreakerConfig): CircuitBreaker {
    const breaker = new ProviderCircuitBreaker(providerId, config);
    this.breakers.set(providerId, breaker);
    return breaker;
  }

  /**
   * Get circuit breaker for a provider
   */
  get(providerId: string): CircuitBreaker | undefined {
    return this.breakers.get(providerId);
  }

  /**
   * Execute through circuit breaker for a provider
   */
  async execute<T>(
    providerId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const breaker = this.breakers.get(providerId);
    if (!breaker) {
      throw new Error(`No circuit breaker registered for provider: ${providerId}`);
    }
    return breaker.execute(fn);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    for (const [providerId, breaker] of this.breakers) {
      metrics[providerId] = breaker.getMetrics();
    }

    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get overall health status
   */
  getHealthStatus(): {
    healthy: string[];
    degraded: string[];
    open: string[];
  } {
    const result = {
      healthy: [] as string[],
      degraded: [] as string[],
      open: [] as string[]
    };

    for (const [providerId, breaker] of this.breakers) {
      const state = breaker.getState();
      switch (state) {
        case 'closed':
          result.healthy.push(providerId);
          break;
        case 'half-open':
          result.degraded.push(providerId);
          break;
        case 'open':
          result.open.push(providerId);
          break;
      }
    }

    return result;
  }
}
