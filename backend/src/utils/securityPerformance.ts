import { performance } from 'perf_hooks';
import { logSecurityEvent } from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  timestamp: Date;
  userId?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export interface SecurityPerformanceThresholds {
  maxDuration: number; // milliseconds
  maxMemoryUsage: number; // bytes
  alertOnExceed: boolean;
}

export class SecurityPerformanceMonitor {
  private static instance: SecurityPerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private thresholds: Map<string, SecurityPerformanceThresholds> = new Map();

  private constructor() {
    // Set default thresholds
    this.setThresholds('rate_limiting', { maxDuration: 100, maxMemoryUsage: 50 * 1024 * 1024, alertOnExceed: true });
    this.setThresholds('validation', { maxDuration: 500, maxMemoryUsage: 100 * 1024 * 1024, alertOnExceed: true });
    this.setThresholds('authentication', { maxDuration: 200, maxMemoryUsage: 50 * 1024 * 1024, alertOnExceed: true });
    this.setThresholds('file_upload', { maxDuration: 2000, maxMemoryUsage: 200 * 1024 * 1024, alertOnExceed: true });
    this.setThresholds('file_validation', { maxDuration: 1000, maxMemoryUsage: 150 * 1024 * 1024, alertOnExceed: true });
    this.setThresholds('database_query', { maxDuration: 300, maxMemoryUsage: 50 * 1024 * 1024, alertOnExceed: true });
  }

  static getInstance(): SecurityPerformanceMonitor {
    if (!SecurityPerformanceMonitor.instance) {
      SecurityPerformanceMonitor.instance = new SecurityPerformanceMonitor();
    }
    return SecurityPerformanceMonitor.instance;
  }

  setThresholds(operation: string, thresholds: SecurityPerformanceThresholds): void {
    this.thresholds.set(operation, thresholds);
  }

  async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>,
    userId?: string,
    ip?: string
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();

    try {
      const result = await fn();

      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage();

      const duration = endTime - startTime;
      const memoryUsage = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
      };

      const cpuUsage = {
        user: endCpu.user - startCpu.user,
        system: endCpu.system - startCpu.system,
      };

      const metrics: PerformanceMetrics = {
        operation,
        duration,
        memoryUsage,
        cpuUsage,
        timestamp: new Date(),
        userId,
        ip,
        metadata,
      };

      this.metrics.push(metrics);

      // Check thresholds and alert if exceeded
      const thresholds = this.thresholds.get(operation);
      if (thresholds && thresholds.alertOnExceed) {
        if (duration > thresholds.maxDuration) {
          logSecurityEvent('security_performance_threshold_exceeded', userId || null, {
            operation,
            metric: 'duration',
            value: duration,
            threshold: thresholds.maxDuration,
            ip,
            metadata,
          }, 'medium');
        }

        if (memoryUsage.heapUsed > thresholds.maxMemoryUsage) {
          logSecurityEvent('security_performance_threshold_exceeded', userId || null, {
            operation,
            metric: 'memory',
            value: memoryUsage.heapUsed,
            threshold: thresholds.maxMemoryUsage,
            ip,
            metadata,
          }, 'medium');
        }
      }

      // Keep only last 1000 metrics to prevent memory leaks
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log failed operation performance
      logSecurityEvent('security_operation_failed', userId || null, {
        operation,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        ip,
        metadata,
      }, 'low');

      throw error;
    }
  }

  getMetrics(operation?: string, limit: number = 100): PerformanceMetrics[] {
    let filtered = this.metrics;
    if (operation) {
      filtered = this.metrics.filter(m => m.operation === operation);
    }
    return filtered.slice(-limit);
  }

  getAggregatedMetrics(operation?: string): {
    operation: string;
    count: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    avgMemoryUsage: number;
    maxMemoryUsage: number;
    p95Duration: number;
    p99Duration: number;
  }[] {
    const metrics = operation ? this.metrics.filter(m => m.operation === operation) : this.metrics;

    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = [];
      }
      acc[metric.operation].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(grouped).map(([op, opMetrics]) => {
      const durations = opMetrics.map(m => m.duration).sort((a, b) => a - b);
      const memoryUsages = opMetrics.map(m => m.memoryUsage?.heapUsed || 0).sort((a, b) => a - b);

      return {
        operation: op,
        count: opMetrics.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
        avgMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        maxMemoryUsage: Math.max(...memoryUsages),
        p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
        p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
      };
    });
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const securityPerformanceMonitor = SecurityPerformanceMonitor.getInstance();

// Middleware wrapper for performance monitoring
export const withSecurityPerformanceMonitoring = (
  operation: string,
  metadataFn?: (req: any) => Record<string, any>
) => {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    const ip = req.ip;
    const metadata = metadataFn ? metadataFn(req) : {};

    securityPerformanceMonitor.measureOperation(
      operation,
      async () => {
        // Continue to next middleware
        return new Promise<void>((resolve, reject) => {
          const originalNext = next;
          next = (err?: any) => {
            if (err) reject(err);
            else resolve();
          };
          originalNext();
        });
      },
      metadata,
      userId,
      ip
    ).catch(next);
  };
};