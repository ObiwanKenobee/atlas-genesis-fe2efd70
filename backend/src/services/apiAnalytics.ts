/**
 * API Analytics Service
 * 
 * Provides usage tracking, metrics, and analytics for API endpoints.
 */

import { query } from '../db';

export interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByMethod: Record<string, number>;
  requestsByHour: Record<string, number>;
  requestsByDay: Record<string, number>;
  requestsByMonth: Record<string, number>;
  topEndpoints: Array<{ endpoint: string; count: number; avgResponseTime: number }>;
  topErrors: Array<{ statusCode: number; count: number }>;
}

export interface TimeSeriesData {
  timestamp: Date;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

export class APIAnalyticsService {
  /**
   * Record API request
   */
  async recordRequest(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await query(
      `INSERT INTO api_requests (
        api_key_id, endpoint, method, status_code, response_time,
        ip_address, user_agent, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        ipAddress,
        userAgent,
      ]
    );
  }

  /**
   * Get API metrics for a time period
   */
  async getMetrics(
    apiKeyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<APIMetrics> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code < 400 THEN 1 END) as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
        AVG(response_time) as average_response_time,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time) as p50_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99_response_time
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3`,
      [apiKeyId, startDate, endDate]
    );

    const stats = result[0];

    // Get requests by endpoint
    const endpointResult = await query(
      `SELECT 
        endpoint,
        COUNT(*) as count,
        AVG(response_time) as avg_response_time
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY endpoint
       ORDER BY count DESC`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByEndpoint: Record<string, number> = {};
    endpointResult.forEach((row: any) => {
      requestsByEndpoint[row.endpoint] = parseInt(row.count);
    });

    // Get requests by method
    const methodResult = await query(
      `SELECT 
        method,
        COUNT(*) as count,
        AVG(response_time) as avg_response_time
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY method
       ORDER BY count DESC`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByMethod: Record<string, number> = {};
    methodResult.forEach((row: any) => {
      requestsByMethod[row.method] = parseInt(row.count);
    });

    // Get top endpoints
    const topEndpointsResult = await query(
      `SELECT 
        endpoint,
        COUNT(*) as count,
        AVG(response_time) as avg_response_time
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY endpoint
       ORDER BY count DESC
       LIMIT 10`,
      [apiKeyId, startDate, endDate]
    );

    const topEndpoints = topEndpointsResult.map((row: any) => ({
      endpoint: row.endpoint,
      count: parseInt(row.count),
      avgResponseTime: parseFloat(row.avg_response_time),
    }));

    // Get top errors
    const errorsResult = await query(
      `SELECT 
        status_code,
        COUNT(*) as count
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
         AND status_code >= 400
       GROUP BY status_code
       ORDER BY count DESC
       LIMIT 10`,
      [apiKeyId, startDate, endDate]
    );

    const topErrors = errorsResult.map((row: any) => ({
      statusCode: parseInt(row.status_code),
      count: parseInt(row.count),
    }));

    // Get requests by hour
    const hourResult = await query(
      `SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as requests
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY hour
       ORDER BY hour DESC
       LIMIT 24`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByHour: Record<string, number> = {};
    hourResult.forEach((row: any) => {
      requestsByHour[row.hour] = parseInt(row.requests);
    });

    // Get requests by day
    const dayResult = await query(
      `SELECT 
        DATE_TRUNC('day', timestamp) as day,
        COUNT(*) as requests
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY day
       ORDER BY day DESC
       LIMIT 30`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByDay: Record<string, number> = {};
    dayResult.forEach((row: any) => {
      requestsByDay[row.day] = parseInt(row.requests);
    });

    // Get requests by month
    const monthResult = await query(
      `SELECT 
        DATE_TRUNC('month', timestamp) as month,
        COUNT(*) as requests
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      [apiKeyId, startDate, endDate]
    );

    const requestsByMonth: Record<string, number> = {};
    monthResult.forEach((row: any) => {
      requestsByMonth[row.month] = parseInt(row.requests);
    });

    return {
      totalRequests: parseInt(stats.total_requests),
      successfulRequests: parseInt(stats.successful_requests),
      failedRequests: parseInt(stats.failed_requests),
      averageResponseTime: parseFloat(stats.average_response_time) || 0,
      p50ResponseTime: parseFloat(stats.p50_response_time) || 0,
      p95ResponseTime: parseFloat(stats.p95_response_time) || 0,
      p99ResponseTime: parseFloat(stats.p99_response_time) || 0,
      requestsByEndpoint,
      requestsByMethod,
      requestsByHour,
      requestsByDay,
      requestsByMonth,
      topEndpoints,
      topErrors,
    };
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeries(
    apiKeyId: string,
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month' = 'hour'
  ): Promise<TimeSeriesData[]> {
    const intervalMap = {
      hour: "DATE_TRUNC('hour', timestamp)",
      day: "DATE_TRUNC('day', timestamp)",
      week: "DATE_TRUNC('week', timestamp)",
      month: "DATE_TRUNC('month', timestamp)",
    };

    const result = await query(
      `SELECT 
        ${intervalMap[interval]},
        COUNT(*) as requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
        AVG(response_time) as avg_response_time
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY ${intervalMap[interval]}
       ORDER BY ${intervalMap[interval]} ASC`,
      [apiKeyId, startDate, endDate]
    );

    return result.map((row: any) => ({
      timestamp: new Date(row.timestamp),
      requests: parseInt(row.requests),
      errors: parseInt(row.errors),
      avgResponseTime: parseFloat(row.avg_response_time) || 0,
    }));
  }

  /**
   * Get real-time metrics (last 5 minutes)
   */
  async getRealTimeMetrics(apiKeyId: string): Promise<{
    requestsPerMinute: number;
    errorsPerMinute: number;
    avgResponseTime: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '5 minutes') as requests_per_minute,
        COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '5 minutes' AND status_code >= 400) as errors_per_minute,
        AVG(response_time) FILTER (WHERE timestamp > NOW() - INTERVAL '5 minutes') as avg_response_time
       FROM api_requests
       WHERE api_key_id = $1`,
      [apiKeyId]
    );

    return {
      requestsPerMinute: parseInt(result[0].requests_per_minute) || 0,
      errorsPerMinute: parseInt(result[0].errors_per_minute) || 0,
      avgResponseTime: parseFloat(result[0].avg_response_time) || 0,
    };
  }

  /**
   * Get organization API metrics
   */
  async getOrganizationMetrics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    totalKeys: number;
    activeKeys: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_keys,
        AVG(ar.response_time) as avg_response_time
       FROM api_requests ar
       JOIN api_keys ak ON ar.api_key_id = ak.id
       WHERE ak.organization_id = $1
         AND ar.timestamp >= $2
         AND ar.timestamp <= $3`,
      [organizationId, startDate, endDate]
    );

    const stats = result[0];

    // Get top endpoints
    const topEndpointsResult = await query(
      `SELECT 
        ar.endpoint,
        COUNT(*) as count,
        AVG(ar.response_time) as avg_response_time
       FROM api_requests ar
       JOIN api_keys ak ON ar.api_key_id = ak.id
       WHERE ak.organization_id = $1
         AND ar.timestamp >= $2
         AND ar.timestamp <= $3
       GROUP BY ar.endpoint
       ORDER BY count DESC
       LIMIT 10`,
      [organizationId, startDate, endDate]
    );

    return {
      totalRequests: parseInt(stats.total_requests) || 0,
      totalKeys: parseInt(stats.total_keys) || 0,
      activeKeys: parseInt(stats.active_keys) || 0,
      averageResponseTime: parseFloat(stats.avg_response_time) || 0,
      topEndpoints: topEndpointsResult.map((row: any) => ({
        endpoint: row.endpoint,
        count: parseInt(row.count),
        avgResponseTime: parseFloat(row.avg_response_time),
      })),
    };
  }

  /**
   * Get slowest endpoints
   */
  async getSlowEndpoints(
    apiKeyId: string,
    startDate: Date,
    endDate: Date,
    threshold: number = 1000 // 1 second threshold
  ): Promise<Array<{ endpoint: string; avgResponseTime: number; count: number }>> {
    const result = await query(
      `SELECT 
        endpoint,
        AVG(response_time) as avg_response_time,
        COUNT(*) as count
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
         AND response_time >= $4
       GROUP BY endpoint
       HAVING AVG(response_time) >= $4
       ORDER BY avg_response_time DESC`,
      [apiKeyId, startDate, endDate]
    );

    return result.map((row: any) => ({
      endpoint: row.endpoint,
      avgResponseTime: parseFloat(row.avg_response_time),
      count: parseInt(row.count),
    }));
  }

  /**
   * Get error rate by status code
   */
  async getErrorRateByStatus(
    apiKeyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, { count: number; rate: number }>> {
    const result = await query(
      `SELECT 
        status_code,
        COUNT(*) as count,
        COUNT(*) OVER () as total
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       GROUP BY status_code`,
      [apiKeyId, startDate, endDate]
    );

    const errorRates: Record<string, { count: number; rate: number }> = {};
    result.forEach((row: any) => {
      const count = parseInt(row.count);
      const total = parseInt(row.total);
      errorRates[row.status_code] = {
        count,
        rate: total > 0 ? (count / total) * 100 : 0,
      };
    });

    return errorRates;
  }

  /**
   * Get usage trends
   */
  async getUsageTrends(
    apiKeyId: string,
    days: number = 30
  ): Promise<{
    daily: Array<{ date: string; requests: number; errors: number }>;
    weekly: Array<{ week: string; requests: number; errors: number }>;
  }> {
    const result = await query(
      `SELECT 
        DATE(timestamp) as date,
        COUNT(*) as requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [apiKeyId]
    );

    const daily = result.map((row: any) => ({
      date: row.date,
      requests: parseInt(row.requests),
      errors: parseInt(row.errors),
    }));

    // Calculate weekly aggregates
    const weeklyResult = await query(
      `SELECT 
        DATE_TRUNC('week', timestamp) as week,
        COUNT(*) as requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
       FROM api_requests
       WHERE api_key_id = $1
         AND timestamp >= NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('week', timestamp)
       ORDER BY week DESC
       LIMIT 8`,
      [apiKeyId]
    );

    const weekly = weeklyResult.map((row: any) => ({
      week: row.week,
      requests: parseInt(row.requests),
      errors: parseInt(row.errors),
    }));

    return { daily, weekly };
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    const result = await query(
      `DELETE FROM api_requests 
       WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING id`
    );

    return result.length;
  }

  /**
   * Get API key health metrics
   */
  async getKeyHealthMetrics(apiKeyId: string): Promise<{
    totalRequests: number;
    lastUsedAt?: Date;
    daysSinceLastUse: number;
    isActive: boolean;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_requests,
        MAX(last_used_at) as last_used_at,
        is_active
       FROM api_keys
       WHERE id = $1`,
      [apiKeyId]
    );

    const stats = result[0];
    const lastUsedAt = stats.last_used_at ? new Date(stats.last_used_at) : null;
    const daysSinceLastUse = lastUsedAt 
      ? Math.floor((Date.now() - lastUsedAt.getTime()) / (1000 * 60 * 24))
      : null;

    return {
      totalRequests: parseInt(stats.total_requests) || 0,
      lastUsedAt,
      daysSinceLastUse,
      isActive: stats.is_active,
    };
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    apiKeyId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const metrics = await this.getMetrics(apiKeyId, startDate, endDate);

    if (format === 'json') {
      return metrics;
    }

    // For CSV, we need to fetch all records
    const records = await query(
      `SELECT 
        ar.endpoint,
        ar.method,
        ar.status_code,
        ar.response_time,
        ar.ip_address,
        ar.user_agent,
        ar.timestamp
       FROM api_requests ar
       WHERE ar.api_key_id = $1
         AND ar.timestamp >= $2
         AND ar.timestamp <= $3
       ORDER BY ar.timestamp DESC`,
      [apiKeyId, startDate, endDate]
    );

    // Convert to CSV format
    const headers = ['Endpoint', 'Method', 'Status Code', 'Response Time (ms)', 'IP Address', 'User Agent', 'Timestamp'];
    const rows = records.map((row: any) => [
      row.endpoint,
      row.method,
      row.status_code,
      row.response_time,
      row.ip_address,
      row.user_agent,
      new Date(row.timestamp).toISOString(),
    ]);

    return { headers, rows };
  }
}

// Export singleton instance
export const apiAnalyticsService = new APIAnalyticsService();
