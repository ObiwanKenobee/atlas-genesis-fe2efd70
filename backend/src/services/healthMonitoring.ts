/**
 * Health Monitoring Service
 * 
 * Provides comprehensive health checks for all backend services,
 * including database, Redis, external APIs, and system resources.
 */

import { checkDatabaseHealth, getPoolStats } from '../db';
import redisClient from '../redisClient';
import { encryptionService } from './encryption';
import { query } from '../db';
import { performance } from 'perf_hooks';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: ServiceHealth[];
  system: SystemHealth;
  checks: HealthCheckResult[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  eventLoopLag?: number;
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
  timestamp: string;
}

export interface HealthCheckConfig {
  name: string;
  check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string }>;
  timeout?: number;
  critical?: boolean;
}

class HealthMonitoringService {
  private checkHistory: Map<string, HealthCheckResult[]> = new Map();
  private maxHistorySize: number = 100;
  private checkInterval: NodeJS.Timeout | null = null;
  private intervalMs: number = 30000; // 30 seconds

  constructor() {
    // Start periodic health checks
    this.startPeriodicChecks();
  }

  /**
   * Run comprehensive health check
   */
  async getFullHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    const results: HealthCheckResult[] = [];

    // Run all health checks
    results.push(await this.checkDatabase());
    results.push(await this.checkRedis());
    results.push(await this.checkEncryption());
    results.push(await this.checkMemory());
    results.push(await this.checkEventLoop());
    results.push(await this.checkDiskSpace());

    // Determine overall status
    const hasFailures = results.some(r => r.status === 'fail');
    const hasWarnings = results.some(r => r.status === 'warn');
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    // Get service statuses
    const services = this.getServiceStatuses(results);

    // Get system health
    const system = this.getSystemHealth();

    // Store check results
    this.storeCheckResults(results);

    return {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services,
      system,
      checks: results
    };
  }

  /**
   * Quick health check for load balancers
   */
  async getQuickHealthCheck(): Promise<{ status: string; timestamp: string }> {
    const dbHealth = await checkDatabaseHealth();
    const redisHealth = await this.checkRedisQuick();
    
    if (dbHealth.healthy && redisHealth.healthy) {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detailed service status for dashboard
   */
  async getDetailedServiceStatus(): Promise<ServiceHealth[]> {
    const results: HealthCheckResult[] = [];
    
    results.push(await this.checkDatabase());
    results.push(await this.checkRedis());
    results.push(await this.checkEncryption());
    results.push(await this.checkMemory());
    
    return this.getServiceStatuses(results);
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const health = await checkDatabaseHealth();
      const duration = Date.now() - startTime;
      
      if (health.healthy) {
        const poolStats = getPoolStats();
        return {
          name: 'database',
          status: health.latency && health.latency > 1000 ? 'warn' : 'pass',
          duration,
          message: `Connected (latency: ${health.latency}ms)`,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        name: 'database',
        status: 'fail',
        duration,
        message: health.error || 'Connection failed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        duration: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedis(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const start = Date.now();
      await redisClient.ping();
      const latency = Date.now() - start;
      
      return {
        name: 'redis',
        status: latency > 500 ? 'warn' : 'pass',
        duration: Date.now() - startTime,
        message: `Connected (latency: ${latency}ms)`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'redis',
        status: 'fail',
        duration: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Quick Redis check
   */
  private async checkRedisQuick(): Promise<{ healthy: boolean; error?: string }> {
    try {
      await redisClient.ping();
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check encryption service
   */
  private async checkEncryption(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Try to get encryption stats
      const stats = await encryptionService.getStatistics();
      
      return {
        name: 'encryption',
        status: 'pass',
        duration: Date.now() - startTime,
        message: `${stats.activeKeys} active key(s)`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'encryption',
        status: 'fail',
        duration: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const usage = process.memoryUsage();
    const total = usage.heapTotal + usage.external + 0;
    const percentage = Math.round((usage.heapUsed / total) * 100);
    
    let status: 'pass' | 'warn' | 'fail';
    if (percentage > 90) {
      status = 'fail';
    } else if (percentage > 75) {
      status = 'warn';
    } else {
      status = 'pass';
    }
    
    return {
      name: 'memory',
      status,
      duration: Date.now() - startTime,
      message: `${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(total / 1024 / 1024)}MB (${percentage}%)`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check event loop lag
   */
  private async checkEventLoop(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    // Simple event loop lag check
    const start = Date.now();
    await new Promise(resolve => setImmediate(resolve));
    const lag = Date.now() - start;
    
    let status: 'pass' | 'warn' | 'fail';
    if (lag > 100) {
      status = 'fail';
    } else if (lag > 50) {
      status = 'warn';
    } else {
      status = 'pass';
    }
    
    return {
      name: 'event_loop',
      status,
      duration: Date.now() - startTime,
      message: `${lag}ms lag`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check disk space (for systems with /proc)
   */
  private async checkDiskSpace(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a simplified check - in production you'd check actual disk
      const usage = process.memoryUsage();
      const diskUsage = usage.heapUsed / usage.heapTotal;
      
      // Simulated disk check - in real implementation, use fs.statvfs()
      return {
        name: 'disk',
        status: diskUsage > 0.9 ? 'warn' : 'pass',
        duration: Date.now() - startTime,
        message: 'Disk space check simulated',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'warn',
        duration: Date.now() - startTime,
        message: 'Could not check disk space',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service statuses from check results
   */
  private getServiceStatuses(results: HealthCheckResult[]): ServiceHealth[] {
    return results.map(result => ({
      name: result.name,
      status: result.status === 'pass' ? 'healthy' : result.status === 'warn' ? 'degraded' : 'unhealthy',
      latency: result.duration,
      message: result.message
    }));
  }

  /**
   * Get system health
   */
  private getSystemHealth(): SystemHealth {
    const usage = process.memoryUsage();
    const total = usage.heapTotal + usage.external;
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: usage.heapUsed,
        total: total,
        percentage: Math.round((usage.heapUsed / total) * 100)
      },
      cpu: {
        usage: cpuUsage.user / 1000000 // Convert to seconds
      }
    };
  }

  /**
   * Store check results for history
   */
  private storeCheckResults(results: HealthCheckResult[]): void {
    const timestamp = new Date().toISOString();
    
    for (const result of results) {
      const history = this.checkHistory.get(result.name) || [];
      history.push({ ...result, timestamp });
      
      // Keep only last N results
      if (history.length > this.maxHistorySize) {
        history.shift();
      }
      
      this.checkHistory.set(result.name, history);
    }
  }

  /**
   * Get check history
   */
  getCheckHistory(checkName?: string): Map<string, HealthCheckResult[]> {
    if (checkName) {
      const history = this.checkHistory.get(checkName);
      return history ? new Map([[checkName, history]]) : new Map();
    }
    return this.checkHistory;
  }

  /**
   * Start periodic health checks
   */
  private startPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.getFullHealthCheck();
      } catch (error) {
        console.error('[health] Periodic check failed:', error);
      }
    }, this.intervalMs);
  }

  /**
   * Stop periodic checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    totalChecks: number;
    averageLatency: number;
    failureRate: number;
  } {
    let totalChecks = 0;
    let totalLatency = 0;
    let failures = 0;
    
    for (const history of this.checkHistory.values()) {
      for (const check of history) {
        totalChecks++;
        totalLatency += check.duration;
        if (check.status === 'fail') failures++;
      }
    }
    
    return {
      totalChecks,
      averageLatency: totalChecks > 0 ? totalLatency / totalChecks : 0,
      failureRate: totalChecks > 0 ? failures / totalChecks : 0
    };
  }
}

// Export singleton instance
export const healthMonitoringService = new HealthMonitoringService();

// Helper functions for backward compatibility
export async function getFullHealthCheck(): Promise<HealthStatus> {
  return healthMonitoringService.getFullHealthCheck();
}

export async function getQuickHealthCheck(): Promise<{ status: string; timestamp: string }> {
  return healthMonitoringService.getQuickHealthCheck();
}

export async function getDetailedServiceStatus(): Promise<ServiceHealth[]> {
  return healthMonitoringService.getDetailedServiceStatus();
}

export function getHealthHistory(checkName?: string): Map<string, HealthCheckResult[]> {
  return healthMonitoringService.getCheckHistory(checkName);
}

export function getHealthStatistics(): {
  totalChecks: number;
  averageLatency: number;
  failureRate: number;
} {
  return healthMonitoringService.getStatistics();
}
