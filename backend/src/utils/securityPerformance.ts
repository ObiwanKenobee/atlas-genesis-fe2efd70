import { performance, PerformanceObserver } from 'perf_hooks';
import { EventEmitter } from 'events';
import { logSecurityEvent } from './logger';
import { query } from '../db';

export interface SecurityPerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  timestamp: number;
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SecurityPerformanceStats {
  operation: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  totalMemoryUsed: number;
  averageMemoryUsed: number;
  errorRate: number;
  lastUpdated: number;
}

export interface SecurityBenchmark {
  operation: string;
  expectedDuration: number;
  maxDuration: number;
  expectedMemoryUsage: number;
  maxMemoryUsage: number;
  errorThreshold: number;
  enabled: boolean;
}

class SecurityPerformanceMonitor extends EventEmitter {
  private metrics: SecurityPerformanceMetrics[] = [];
  private stats: Map<string, SecurityPerformanceStats> = new Map();
  private benchmarks: Map<string, SecurityBenchmark> = new Map();
  private maxMetricsHistory = 10000;
  private aggregationInterval: NodeJS.Timeout;
  private alertThresholds: Map<string, { duration: number; memory: number; errorRate: number }> = new Map();

  constructor() {
    super();

    // Set up performance observer for automatic metrics collection
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.name.startsWith('security:')) {
          this.recordPerformanceEntry(entry);
        }
      }
    });

    obs.observe({ entryTypes: ['measure'], buffered: true });

    // Aggregate metrics every 5 minutes
    this.aggregationInterval = setInterval(() => {
      this.aggregateMetrics();
    }, 5 * 60 * 1000);

    // Initialize default benchmarks
    this.initializeBenchmarks();

    // Initialize alert thresholds
    this.initializeAlertThresholds();
  }

  private initializeBenchmarks() {
    // Authentication benchmarks
    this.benchmarks.set('auth:verify_token', {
      operation: 'auth:verify_token',
      expectedDuration: 50, // 50ms
      maxDuration: 200, // 200ms
      expectedMemoryUsage: 1024 * 1024, // 1MB
      maxMemoryUsage: 5 * 1024 * 1024, // 5MB
      errorThreshold: 0.05, // 5% error rate
      enabled: true
    });

    this.benchmarks.set('auth:login', {
      operation: 'auth:login',
      expectedDuration: 150, // 150ms
      maxDuration: 500, // 500ms
      expectedMemoryUsage: 2 * 1024 * 1024, // 2MB
      maxMemoryUsage: 10 * 1024 * 1024, // 10MB
      errorThreshold: 0.10, // 10% error rate
      enabled: true
    });

    // Rate limiting benchmarks
    this.benchmarks.set('rate_limit:check', {
      operation: 'rate_limit:check',
      expectedDuration: 5, // 5ms
      maxDuration: 20, // 20ms
      expectedMemoryUsage: 512 * 1024, // 512KB
      maxMemoryUsage: 2 * 1024 * 1024, // 2MB
      errorThreshold: 0.01, // 1% error rate
      enabled: true
    });

    // Validation benchmarks
    this.benchmarks.set('validation:body', {
      operation: 'validation:body',
      expectedDuration: 10, // 10ms
      maxDuration: 50, // 50ms
      expectedMemoryUsage: 256 * 1024, // 256KB
      maxMemoryUsage: 1024 * 1024, // 1MB
      errorThreshold: 0.05, // 5% error rate
      enabled: true
    });

    this.benchmarks.set('validation:response', {
      operation: 'validation:response',
      expectedDuration: 5, // 5ms
      maxDuration: 25, // 25ms
      expectedMemoryUsage: 128 * 1024, // 128KB
      maxMemoryUsage: 512 * 1024, // 512KB
      errorThreshold: 0.02, // 2% error rate
      enabled: true
    });

    // File upload benchmarks
    this.benchmarks.set('file_upload:validate', {
      operation: 'file_upload:validate',
      expectedDuration: 100, // 100ms
      maxDuration: 500, // 500ms
      expectedMemoryUsage: 10 * 1024 * 1024, // 10MB
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      errorThreshold: 0.10, // 10% error rate
      enabled: true
    });

    // Security header benchmarks
    this.benchmarks.set('security:headers', {
      operation: 'security:headers',
      expectedDuration: 2, // 2ms
      maxDuration: 10, // 10ms
      expectedMemoryUsage: 64 * 1024, // 64KB
      maxMemoryUsage: 256 * 1024, // 256KB
      errorThreshold: 0.005, // 0.5% error rate
      enabled: true
    });
  }

  private initializeAlertThresholds() {
    // Set alert thresholds for critical operations
    this.alertThresholds.set('auth:verify_token', {
      duration: 500, // Alert if > 500ms
      memory: 10 * 1024 * 1024, // Alert if > 10MB
      errorRate: 0.15 // Alert if > 15% error rate
    });

    this.alertThresholds.set('rate_limit:check', {
      duration: 50, // Alert if > 50ms
      memory: 5 * 1024 * 1024, // Alert if > 5MB
      errorRate: 0.05 // Alert if > 5% error rate
    });

    this.alertThresholds.set('file_upload:validate', {
      duration: 1000, // Alert if > 1s
      memory: 100 * 1024 * 1024, // Alert if > 100MB
      errorRate: 0.20 // Alert if > 20% error rate
    });
  }

  /**
   * Start timing a security operation
   */
  startOperation(operation: string, metadata?: Record<string, any>): string {
    const operationId = `${operation}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    performance.mark(`${operationId}:start`);

    // Store metadata for later retrieval
    (global as any).securityPerformanceMetadata = (global as any).securityPerformanceMetadata || new Map();
    (global as any).securityPerformanceMetadata.set(operationId, {
      operation,
      startTime: Date.now(),
      metadata
    });

    return operationId;
  }

  /**
   * End timing a security operation and record metrics
   */
  endOperation(
    operationId: string,
    success: boolean = true,
    error?: string,
    additionalMetadata?: Record<string, any>
  ): void {
    try {
      const endMark = `${operationId}:end`;
      performance.mark(endMark);

      const metadata = (global as any).securityPerformanceMetadata?.get(operationId);
      if (!metadata) {
        console.warn(`No metadata found for operation ${operationId}`);
        return;
      }

      performance.measure(`security:${metadata.operation}`, `${operationId}:start`, endMark);

      // Clean up marks
      performance.clearMarks(`${operationId}:start`);
      performance.clearMarks(endMark);

      // Clean up metadata
      (global as any).securityPerformanceMetadata?.delete(operationId);

    } catch (err) {
      console.error('Error ending security operation timing:', err);
    }
  }

  /**
   * Record performance entry from PerformanceObserver
   */
  private recordPerformanceEntry(entry: PerformanceEntry): void {
    const operation = entry.name.replace('security:', '');
    const duration = entry.duration;

    // Get memory and CPU usage
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics: SecurityPerformanceMetrics = {
      operation,
      duration,
      memoryUsage,
      cpuUsage,
      timestamp: Date.now(),
      success: true // Will be updated if there's an error
    };

    this.addMetrics(metrics);
  }

  /**
   * Manually add security performance metrics
   */
  addMetrics(metrics: SecurityPerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Check against benchmarks and alert if necessary
    this.checkBenchmarks(metrics);

    // Emit event for real-time monitoring
    this.emit('metrics', metrics);
  }

  /**
   * Check metrics against benchmarks and generate alerts
   */
  private checkBenchmarks(metrics: SecurityPerformanceMetrics): void {
    const benchmark = this.benchmarks.get(metrics.operation);
    if (!benchmark || !benchmark.enabled) return;

    const alerts: string[] = [];

    // Check duration
    if (metrics.duration > benchmark.maxDuration) {
      alerts.push(`Duration ${metrics.duration.toFixed(2)}ms exceeds max ${benchmark.maxDuration}ms`);
    }

    // Check memory usage
    const memoryUsed = metrics.memoryUsage.heapUsed;
    if (memoryUsed > benchmark.maxMemoryUsage) {
      alerts.push(`Memory usage ${(memoryUsed / 1024 / 1024).toFixed(2)}MB exceeds max ${(benchmark.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    // Generate alert if any thresholds exceeded
    if (alerts.length > 0) {
      logSecurityEvent('security_performance_alert', metrics.userId || null, {
        operation: metrics.operation,
        alerts,
        metrics: {
          duration: metrics.duration,
          memoryUsed: memoryUsed,
          timestamp: metrics.timestamp,
          path: metrics.path,
          method: metrics.method,
          ip: metrics.ip
        }
      }, 'high');

      this.emit('alert', {
        operation: metrics.operation,
        alerts,
        metrics
      });
    }
  }

  /**
   * Aggregate metrics into statistics
   */
  private aggregateMetrics(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Group metrics by operation
    const operationMetrics = new Map<string, SecurityPerformanceMetrics[]>();

    for (const metric of this.metrics) {
      if (metric.timestamp >= oneHourAgo) {
        if (!operationMetrics.has(metric.operation)) {
          operationMetrics.set(metric.operation, []);
        }
        operationMetrics.get(metric.operation)!.push(metric);
      }
    }

    // Calculate statistics for each operation
    for (const [operation, metrics] of operationMetrics) {
      const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
      const memoryUsages = metrics.map(m => m.memoryUsage.heapUsed);

      const stats: SecurityPerformanceStats = {
        operation,
        totalCalls: metrics.length,
        successfulCalls: metrics.filter(m => m.success).length,
        failedCalls: metrics.filter(m => !m.success).length,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        p95Duration: this.calculatePercentile(durations, 95),
        p99Duration: this.calculatePercentile(durations, 99),
        totalMemoryUsed: memoryUsages.reduce((a, b) => a + b, 0),
        averageMemoryUsed: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        errorRate: metrics.filter(m => !m.success).length / metrics.length,
        lastUpdated: now
      };

      this.stats.set(operation, stats);

      // Check error rate thresholds
      const alertThreshold = this.alertThresholds.get(operation);
      if (alertThreshold && stats.errorRate > alertThreshold.errorRate) {
        logSecurityEvent('security_error_rate_alert', null, {
          operation,
          errorRate: stats.errorRate,
          threshold: alertThreshold.errorRate,
          totalCalls: stats.totalCalls,
          failedCalls: stats.failedCalls
        }, 'critical');

        this.emit('errorRateAlert', stats);
      }
    }

    // Store aggregated metrics in database
    this.storeAggregatedMetrics();
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Store aggregated metrics in database
   */
  private async storeAggregatedMetrics(): Promise<void> {
    try {
      const metrics = Array.from(this.stats.values());

      for (const stat of metrics) {
        await query(`
          INSERT INTO security_performance_metrics (
            operation,
            total_calls,
            successful_calls,
            failed_calls,
            average_duration,
            min_duration,
            max_duration,
            p95_duration,
            p99_duration,
            total_memory_used,
            average_memory_used,
            error_rate,
            last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (operation) DO UPDATE SET
            total_calls = EXCLUDED.total_calls,
            successful_calls = EXCLUDED.successful_calls,
            failed_calls = EXCLUDED.failed_calls,
            average_duration = EXCLUDED.average_duration,
            min_duration = EXCLUDED.min_duration,
            max_duration = EXCLUDED.max_duration,
            p95_duration = EXCLUDED.p95_duration,
            p99_duration = EXCLUDED.p99_duration,
            total_memory_used = EXCLUDED.total_memory_used,
            average_memory_used = EXCLUDED.average_memory_used,
            error_rate = EXCLUDED.error_rate,
            last_updated = EXCLUDED.last_updated
        `, [
          stat.operation,
          stat.totalCalls,
          stat.successfulCalls,
          stat.failedCalls,
          stat.averageDuration,
          stat.minDuration,
          stat.maxDuration,
          stat.p95Duration,
          stat.p99Duration,
          stat.totalMemoryUsed,
          stat.averageMemoryUsed,
          stat.errorRate,
          new Date(stat.lastUpdated)
        ]);
      }
    } catch (error) {
      console.error('Failed to store security performance metrics:', error);
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation?: string): SecurityPerformanceStats[] {
    if (operation) {
      const stat = this.stats.get(operation);
      return stat ? [stat] : [];
    }
    return Array.from(this.stats.values());
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(operation?: string, limit: number = 100): SecurityPerformanceMetrics[] {
    let metrics = this.metrics.slice(-limit);
    if (operation) {
      metrics = metrics.filter(m => m.operation === operation);
    }
    return metrics;
  }

  /**
   * Get benchmark for an operation
   */
  getBenchmark(operation: string): SecurityBenchmark | undefined {
    return this.benchmarks.get(operation);
  }

  /**
   * Update benchmark for an operation
   */
  updateBenchmark(operation: string, benchmark: Partial<SecurityBenchmark>): void {
    const existing = this.benchmarks.get(operation);
    if (existing) {
      this.benchmarks.set(operation, { ...existing, ...benchmark });
    }
  }

  /**
   * Get performance health score (0-100)
   */
  getHealthScore(): number {
    const stats = Array.from(this.stats.values());
    if (stats.length === 0) return 100;

    let totalScore = 0;
    let operationCount = 0;

    for (const stat of stats) {
      const benchmark = this.benchmarks.get(stat.operation);
      if (!benchmark) continue;

      let operationScore = 100;

      // Duration score (40% weight)
      const durationRatio = stat.averageDuration / benchmark.expectedDuration;
      if (durationRatio > 1) {
        operationScore -= Math.min(40, (durationRatio - 1) * 20);
      }

      // Error rate score (40% weight)
      if (stat.errorRate > benchmark.errorThreshold) {
        const errorRatio = stat.errorRate / benchmark.errorThreshold;
        operationScore -= Math.min(40, (errorRatio - 1) * 40);
      }

      // Memory score (20% weight)
      const memoryRatio = stat.averageMemoryUsed / benchmark.expectedMemoryUsage;
      if (memoryRatio > 1) {
        operationScore -= Math.min(20, (memoryRatio - 1) * 10);
      }

      totalScore += Math.max(0, operationScore);
      operationCount++;
    }

    return operationCount > 0 ? totalScore / operationCount : 100;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
    this.removeAllListeners();
  }
}

// Create singleton instance
export const securityPerformanceMonitor = new SecurityPerformanceMonitor();

// Export convenience functions
export const startSecurityOperation = securityPerformanceMonitor.startOperation.bind(securityPerformanceMonitor);
export const endSecurityOperation = securityPerformanceMonitor.endOperation.bind(securityPerformanceMonitor);
export const recordSecurityMetrics = securityPerformanceMonitor.addMetrics.bind(securityPerformanceMonitor);