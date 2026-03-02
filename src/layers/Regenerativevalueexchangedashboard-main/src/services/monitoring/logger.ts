/**
 * RVE Logging & Monitoring Service
 * Production-grade logging with multiple transports and error tracking
 */

import { config } from '../../config/environment';

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  user?: {
    id: string;
    address: string;
  };
  request?: {
    method: string;
    url: string;
    ip?: string;
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  tags?: Record<string, string>;
}

// ============================================================================
// LOGGER
// ============================================================================

class Logger {
  private context?: string;
  private minLevel: LogLevel;
  private levelValues: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(context?: string) {
    this.context = context;
    this.minLevel = config.app.debug ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelValues[level] >= this.levelValues[this.minLevel];
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, data, error } = entry;
    
    let output = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context) {
      output += ` [${context}]`;
    }
    
    output += ` ${message}`;
    
    if (data && Object.keys(data).length > 0) {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    if (error) {
      output += `\n${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n${error.stack}`;
      }
    }
    
    return output;
  }

  private write(entry: LogEntry): void {
    const formatted = this.formatLog(entry);
    
    // Console output
    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
    }

    // Send to external services in production
    if (config.app.environment === 'production') {
      this.sendToExternalServices(entry);
    }

    // Store in browser console for debugging
    if (typeof window !== 'undefined') {
      this.storeInBrowser(entry);
    }
  }

  private sendToExternalServices(entry: LogEntry): void {
    // Send errors to Sentry
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.sendToSentry(entry);
    }

    // Send all logs to backend
    this.sendToBackend(entry);
  }

  private sendToSentry(entry: LogEntry): void {
    // Integration with Sentry would go here
    // For now, just a placeholder
    if (config.services.sentry?.dsn) {
      // Sentry.captureException(entry.error);
    }
  }

  private sendToBackend(entry: LogEntry): void {
    // Send logs to backend for storage and analysis
    // Using navigator.sendBeacon for reliability
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const endpoint = `${config.api.baseUrl}/logs`;
      const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    }
  }

  private storeInBrowser(entry: LogEntry): void {
    try {
      const key = `rve_logs_${new Date().toISOString().split('T')[0]}`;
      const existing = localStorage.getItem(key);
      const logs = existing ? JSON.parse(existing) : [];
      
      logs.push(entry);
      
      // Keep only last 100 logs per day
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      // Silent fail if localStorage is full or disabled
    }
  }

  debug(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;
    
    this.write({
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    });
  }

  info(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;
    
    this.write({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    });
  }

  warn(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;
    
    this.write({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    });
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;
    
    this.write({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  fatal(message: string, error?: Error, data?: Record<string, any>): void {
    this.write({
      level: 'fatal',
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext);
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      logger.warn(`Performance mark "${startMark}" not found`);
      return 0;
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!end) {
      logger.warn(`Performance mark "${endMark}" not found`);
      return 0;
    }

    const duration = end - start;
    
    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
    });

    return duration;
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Log slow operations
    if (metric.unit === 'ms' && metric.value > 1000) {
      logger.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }

    // Send to analytics
    this.sendToAnalytics(metric);

    // Clean old metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to analytics service
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const endpoint = `${config.api.baseUrl}/metrics`;
      const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetrics(name).filter(m => m.unit === 'ms');
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }
}

// ============================================================================
// ERROR BOUNDARY HELPER
// ============================================================================

export class ErrorHandler {
  static handle(error: Error, context?: string): void {
    logger.error(`Unhandled error${context ? ` in ${context}` : ''}`, error);

    // Show user-friendly message
    if (typeof window !== 'undefined') {
      // You would integrate with your notification system here
      console.error('An error occurred. Please try again.');
    }
  }

  static async handleAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  static wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handle(error, context);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.handle(error as Error, context);
        throw error;
      }
    }) as T;
  }
}

// ============================================================================
// SYSTEM HEALTH MONITOR
// ============================================================================

export class HealthMonitor {
  private checks: Map<string, () => Promise<boolean>> = new Map();
  private status: Map<string, boolean> = new Map();

  registerCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, check] of this.checks) {
      try {
        const result = await check();
        results[name] = result;
        this.status.set(name, result);
      } catch (error) {
        logger.error(`Health check failed: ${name}`, error as Error);
        results[name] = false;
        this.status.set(name, false);
      }
    }
    
    return results;
  }

  getStatus(): Record<string, boolean> {
    return Object.fromEntries(this.status);
  }

  isHealthy(): boolean {
    return Array.from(this.status.values()).every(v => v);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const logger = new Logger();
export const performanceMonitor = new PerformanceMonitor();
export const healthMonitor = new HealthMonitor();

// Setup global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', new Error(event.reason));
  });
}

// Log application start
logger.info('RVE Platform initialized', {
  version: config.app.version,
  environment: config.app.environment,
});
