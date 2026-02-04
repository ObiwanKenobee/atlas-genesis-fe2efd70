/**
 * Telemetry Service
 * 
 * Provides structured logging, metrics collection, and correlation ID tracking
 * for the AI services infrastructure.
 */

import { 
  LogEntry, 
  LogLevel, 
  TelemetryConfig,
  MetricsSnapshot 
} from '../types';

/**
 * PII Filter for sanitizing log data
 */
export class PIIFilter {
  private patterns: RegExp[];

  constructor(patterns?: (string | RegExp)[]) {
    // Default PII patterns
    const defaultPatterns: RegExp[] = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b[A-Z]{1,2}[0-9][A-Z0-9]* ?[0-9][A-Z]{2}\b/g, // UK Postcode
      /"(?:password|token|secret|api[_-]?key)["\s]*[:=]["\s]*([^",\s}]+)/gi, // Keys in JSON
    ];
    
    if (patterns) {
      this.patterns = patterns.map(p => 
        typeof p === 'string' ? new RegExp(p, 'gi') : p
      );
    } else {
      this.patterns = defaultPatterns;
    }
  }

  /**
   * Filter PII from a string
   */
  filter(input: string): string {
    let result = input;
    for (const pattern of this.patterns) {
      result = result.replace(pattern, '[PII_REDACTED]');
    }
    return result;
  }

  /**
   * Filter PII from an object
   */
  filterObject(obj: Record<string, any>): Record<string, any> {
    if (obj === null || obj === undefined) return obj;
    
    const filtered: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (this.isPIIKey(key)) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        filtered[key] = this.filter(value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        filtered[key] = this.filterObject(value);
      } else {
        filtered[key] = value;
      }
    }
    
    return filtered;
  }

  /**
   * Check if a key likely contains PII
   */
  private isPIIKey(key: string): boolean {
    const piiIndicators = [
      'email', 'phone', 'ssn', 'password', 'token', 'secret',
      'api[_-]?key', 'private[_-]?key', 'access[_-]?token',
      'refresh[_-]?token', 'credit[_-]?card', 'cvv'
    ];
    const lowerKey = key.toLowerCase();
    return piiIndicators.some(indicator => 
      lowerKey.includes(indicator.toLowerCase())
    );
  }
}

/**
 * Telemetry Service for structured logging and metrics
 */
export class TelemetryService {
  private correlationId: string = '';
  private parentSpanId: string = '';
  private spanId: string = '';
  private logs: LogEntry[] = [];
  private metrics: Map<string, number[]> = new Map();
  private piiFilter: PIIFilter;

  constructor(private config: TelemetryConfig) {
    this.piiFilter = new PIIFilter(config.piiFilterPatterns);
    this.spanId = this.generateId();
  }

  /**
   * Generate a new correlation ID
   */
  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start a new span for tracing
   */
  startSpan(correlationId?: string): string {
    this.correlationId = correlationId || this.generateCorrelationId();
    this.parentSpanId = this.spanId;
    this.spanId = this.generateId();
    return this.correlationId;
  }

  /**
   * End the current span
   */
  endSpan(): void {
    this.spanId = this.parentSpanId;
  }

  /**
   * Log a message with structured data
   */
  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      level,
      message,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      service: this.config.serviceName,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      metadata: this.sanitizeMetadata(metadata)
    };

    this.logs.push(entry);

    // Write to console
    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    // Write to file
    if (this.config.enableFile && this.config.filePath) {
      this.writeToFile(entry);
    }

    // Send to external service
    if (this.config.enableExternal && this.config.externalEndpoint) {
      this.sendToExternal(entry);
    }

    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }
  }

  /**
   * Sanitize metadata by removing PII
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    return this.piiFilter.filterObject(metadata);
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.correlationId}]`;
    const extras = entry.provider ? `[${entry.provider}]` : '';
    const spanInfo = `[span:${entry.spanId}]`;

    switch (entry.level) {
      case 'error':
        console.error(prefix, extras, spanInfo, entry.message, entry.error || '', entry.metadata || '');
        break;
      case 'warn':
        console.warn(prefix, extras, spanInfo, entry.message, entry.metadata || '');
        break;
      default:
        console.log(prefix, extras, spanInfo, entry.message, entry.metadata || '');
    }
  }

  /**
   * Write log entry to file
   */
  private writeToFile(entry: LogEntry): void {
    // Implementation would use fs.appendFile in actual code
    // For now, just log to console
    if (process.env.NODE_ENV !== 'production') {
      // console.log(`[FILE] ${JSON.stringify(entry)}`);
    }
  }

  /**
   * Send log entry to external service
   */
  private async sendToExternal(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.externalEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    } catch {
      // Silently fail to avoid recursive errors
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const entry: Record<string, any> = { ...metadata };
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    this.log('error', message, entry);
  }

  // =========================================================================
  // Metrics Methods
  // =========================================================================

  /**
   * Record request latency
   */
  recordLatency(provider: string, operation: string, duration: number): void {
    const key = `${provider}.${operation}.latency`;
    this.pushMetric(key, duration);
    this.recordMetricChange(`${provider}.requests.total`, 1);
  }

  /**
   * Record a success
   */
  recordSuccess(provider: string, operation: string): void {
    const key = `${provider}.${operation}.success`;
    this.pushMetric(key, 1);
    this.recordMetricChange(`${provider}.errors.total`, 0);
  }

  /**
   * Record an error
   */
  recordError(
    provider: string, 
    operation: string, 
    error: Error,
    metadata?: Record<string, any>
  ): void {
    const key = `${provider}.${operation}.error`;
    this.pushMetric(key, 1);
    this.recordMetricChange(`${provider}.errors.total`, 1);
    
    this.error(
      `AI request error: ${error.message}`,
      error,
      { provider, operation, ...metadata }
    );
  }

  /**
   * Record token usage
   */
  recordTokenUsage(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): void {
    this.recordMetricChange(`${provider}.tokens.prompt`, promptTokens);
    this.recordMetricChange(`${provider}.tokens.completion`, completionTokens);
    this.recordMetricChange(`${provider}.tokens.total`, promptTokens + completionTokens);
  }

  /**
   * Record cost
   */
  recordCost(provider: string, cost: number): void {
    this.recordMetricChange(`${provider}.cost.total`, cost);
  }

  /**
   * Record ML prediction confidence
   */
  recordMLPrediction(modelId: string, confidence: number): void {
    this.pushMetric(`ml.${modelId}.confidence`, confidence);
  }

  /**
   * Push a metric value
   */
  private pushMetric(key: string, value: number): void {
    const existing = this.metrics.get(key) || [];
    existing.push(value);
    
    // Keep only last 1000 values per metric
    if (existing.length > 1000) {
      this.metrics.set(key, existing.slice(-1000));
    } else {
      this.metrics.set(key, existing);
    }
  }

  /**
   * Record a metric delta change
   */
  recordMetricChange(key: string, delta: number): void {
    const current = this.metrics.get(key) || [0];
    current.push(current[current.length - 1] + delta);
    
    if (current.length > 1000) {
      this.metrics.set(key, current.slice(-1000));
    } else {
      this.metrics.set(key, current);
    }
  }

  /**
   * Get metrics snapshot
   */
  getMetrics(): Record<string, { p50: number; p75: number; p90: number; p95: number; p99: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [key, values] of this.metrics.entries()) {
      if (values.length === 0) continue;
      
      const sorted = [...values].sort((a, b) => a - b);
      const count = sorted.length;
      
      result[key] = {
        p50: this.percentile(sorted, 50),
        p75: this.percentile(sorted, 75),
        p90: this.percentile(sorted, 90),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
        count
      };
    }

    return result;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return (sorted[lower] + sorted[upper]) / 2;
  }

  /**
   * Get logs for a correlation ID
   */
  getLogsByCorrelationId(correlationId: string): LogEntry[] {
    return this.logs.filter(log => log.correlationId === correlationId);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let logs = this.logs;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
