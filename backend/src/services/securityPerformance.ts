import { performance } from 'perf_hooks';

interface SecurityPerformanceMetric {
  operation: string;
  path: string;
  method: string;
  duration: number;
  memoryDelta: number;
  cpuDelta: number;
  success: boolean;
  statusCode: number;
  ip: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  incidentId?: string;
  additionalData?: any;
}

interface SecurityAlertThreshold {
  operation: string;
  maxDuration: number;
  maxMemoryDelta: number;
  maxCpuDelta: number;
  minSuccessRate: number;
  alertCooldown: number; // minutes
}

interface SecurityIncident {
  id: string;
  operation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metrics: SecurityPerformanceMetric[];
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
  responseTime?: number;
}

interface SecurityKPIs {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  activeThreats: number;
  incidentsResolved: number;
  complianceScore: number;
  uptime: number;
}

class SecurityPerformanceMonitor {
  private metrics: SecurityPerformanceMetric[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics

  recordMetric(operation: string, data: any) {
    const metric: SecurityPerformanceMetric = {
      operation,
      path: data.path,
      method: data.method,
      duration: data.duration,
      memoryDelta: data.memoryDelta,
      cpuDelta: data.cpuDelta,
      success: data.success,
      statusCode: data.statusCode,
      ip: data.ip,
      timestamp: new Date(),
      additionalData: data
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log high latency or failures
    if (data.duration > 1000 || !data.success) {
      console.warn(`Security performance issue: ${operation} took ${data.duration}ms, success: ${data.success}`);
    }
  }

  getMetrics(operation?: string, timeRange?: number) {
    let filtered = this.metrics;

    if (operation) {
      filtered = filtered.filter(m => m.operation === operation);
    }

    if (timeRange) {
      const cutoff = new Date(Date.now() - timeRange);
      filtered = filtered.filter(m => m.timestamp > cutoff);
    }

    return filtered;
  }

  getAggregatedMetrics(operation?: string, timeRange?: number) {
    const metrics = this.getMetrics(operation, timeRange);

    if (metrics.length === 0) return null;

    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalDuration / metrics.length;
    const maxDuration = Math.max(...metrics.map(m => m.duration));
    const minDuration = Math.min(...metrics.map(m => m.duration));
    const successCount = metrics.filter(m => m.success).length;
    const successRate = successCount / metrics.length;
    const totalMemoryDelta = metrics.reduce((sum, m) => sum + m.memoryDelta, 0);
    const avgMemoryDelta = totalMemoryDelta / metrics.length;
    const totalCpuDelta = metrics.reduce((sum, m) => sum + m.cpuDelta, 0);
    const avgCpuDelta = totalCpuDelta / metrics.length;

    return {
      operation: operation || 'all',
      count: metrics.length,
      avgDuration,
      maxDuration,
      minDuration,
      successRate,
      avgMemoryDelta,
      avgCpuDelta,
      timeRange,
      timestamp: new Date()
    };
  }

  getPerformanceBenchmarks() {
    const operations = ['rate_limiting', 'api_key_validation', 'security_headers', 'input_sanitization', 'csrf_protection', 'request_fingerprinting', 'replay_attack_prevention'];

    const benchmarks = operations.map(op => {
      const metrics = this.getMetrics(op, 3600000); // Last hour
      if (metrics.length === 0) return null;

      const p95 = this.calculatePercentile(metrics.map(m => m.duration), 95);
      const p99 = this.calculatePercentile(metrics.map(m => m.duration), 99);

      return {
        operation: op,
        p95Duration: p95,
        p99Duration: p99,
        avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
        sampleSize: metrics.length
      };
    }).filter(Boolean);

    return benchmarks;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}

const monitor = new SecurityPerformanceMonitor();

export const recordSecurityPerformanceMetric = (operation: string, data: any) => {
  monitor.recordMetric(operation, data);
};

export const getSecurityPerformanceMetrics = (operation?: string, timeRange?: number) => {
  return monitor.getMetrics(operation, timeRange);
};

export const getAggregatedSecurityPerformanceMetrics = (operation?: string, timeRange?: number) => {
  return monitor.getAggregatedMetrics(operation, timeRange);
};

export const getSecurityPerformanceBenchmarks = () => {
  return monitor.getPerformanceBenchmarks();
};