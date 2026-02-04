// Advanced Analytics Service
import { EventEmitter } from 'events';
import {
  ChartConfig,
  DashboardWidget,
  DashboardTemplate,
  ReportConfig,
  ReportSchedule,
  AnalyticsFilter,
  DateRangeFilter,
  ExportResult,
  TimeSeriesData,
  AggregatedData,
  MetricResult,
  PerformanceMetric,
  WebSocketMessage,
} from '../types/analytics';

// In-memory storage for demo (replace with database in production)
class AnalyticsService extends EventEmitter {
  private templates: Map<string, DashboardTemplate> = new Map();
  private reports: Map<string, ReportConfig> = new Map();
  private metrics: Map<string, PerformanceMetric> = new Map();
  private widgets: Map<string, DashboardWidget> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.initializeMetrics();
    this.startMetricUpdates();
  }

  // Initialize default dashboard templates
  private initializeDefaultTemplates(): void {
    const executiveTemplate: DashboardTemplate = {
      id: 'template-executive',
      name: 'Executive Overview',
      description: 'High-level metrics for executive dashboard',
      category: 'executive',
      widgets: [
        {
          id: 'widget-revenue',
          type: 'chart',
          title: 'Total Revenue',
          config: {
            type: 'line',
            title: 'Revenue Trend',
            dataSource: 'revenue',
            refreshInterval: 30000,
          },
          position: { x: 0, y: 0, width: 3, height: 2 },
        },
        {
          id: 'widget-users',
          type: 'chart',
          title: 'Active Users',
          config: {
            type: 'line',
            title: 'User Growth',
            dataSource: 'users',
            refreshInterval: 30000,
          },
          position: { x: 3, y: 0, width: 3, height: 2 },
        },
        {
          id: 'widget-conversion',
          type: 'chart',
          title: 'Conversion Rate',
          config: {
            type: 'bar',
            title: 'Conversion by Channel',
            dataSource: 'conversions',
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
          },
          position: { x: 6, y: 0, width: 6, height: 3 },
        },
        {
          id: 'widget-breakdown',
          type: 'chart',
          title: 'Revenue Breakdown',
          config: {
            type: 'pie',
            title: 'Revenue by Category',
            dataSource: 'revenue-breakdown',
            colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
          },
          position: { x: 0, y: 3, width: 6, height: 3 },
        },
      ],
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const operationsTemplate: DashboardTemplate = {
      id: 'template-operations',
      name: 'Operations Dashboard',
      description: 'Real-time operational metrics',
      category: 'operations',
      widgets: [
        {
          id: 'widget-throughput',
          type: 'gauge',
          title: 'System Throughput',
          config: {
            type: 'area',
            title: 'Request Rate',
            dataSource: 'throughput',
            refreshInterval: 5000,
          },
          position: { x: 0, y: 0, width: 4, height: 2 },
        },
        {
          id: 'widget-latency',
          type: 'chart',
          title: 'Response Latency',
          config: {
            type: 'line',
            title: 'Latency Trend',
            dataSource: 'latency',
            refreshInterval: 5000,
          },
          position: { x: 4, y: 0, width: 4, height: 2 },
        },
        {
          id: 'widget-error-rate',
          type: 'chart',
          title: 'Error Rate',
          config: {
            type: 'area',
            title: 'Errors Over Time',
            dataSource: 'errors',
            refreshInterval: 10000,
          },
          position: { x: 8, y: 0, width: 4, height: 2 },
        },
        {
          id: 'widget-health',
          type: 'chart',
          title: 'System Health',
          config: {
            type: 'radar',
            title: 'Component Health Scores',
            dataSource: 'health',
            refreshInterval: 15000,
          },
          position: { x: 0, y: 2, width: 6, height: 4 },
        },
        {
          id: 'widget-resources',
          type: 'chart',
          title: 'Resource Usage',
          config: {
            type: 'bar',
            title: 'CPU & Memory Usage',
            dataSource: 'resources',
            refreshInterval: 10000,
          },
          position: { x: 6, y: 2, width: 6, height: 4 },
        },
      ],
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const analyticsTemplate: DashboardTemplate = {
      id: 'template-analytics',
      name: 'User Analytics',
      description: 'Detailed user behavior analytics',
      category: 'analytics',
      widgets: [
        {
          id: 'widget-sessions',
          type: 'chart',
          title: 'Session Trends',
          config: {
            type: 'area',
            title: 'Daily Sessions',
            dataSource: 'sessions',
            refreshInterval: 60000,
          },
          position: { x: 0, y: 0, width: 8, height: 3 },
        },
        {
          id: 'widget-engagement',
          type: 'chart',
          title: 'Engagement Metrics',
          config: {
            type: 'bar',
            title: 'Engagement by Feature',
            dataSource: 'engagement',
            refreshInterval: 60000,
          },
          position: { x: 8, y: 0, width: 4, height: 3 },
        },
        {
          id: 'widget-retention',
          type: 'chart',
          title: 'Retention Curve',
          config: {
            type: 'line',
            title: 'User Retention',
            dataSource: 'retention',
            refreshInterval: 300000,
          },
          position: { x: 0, y: 3, width: 6, height: 3 },
        },
        {
          id: 'widget-cohorts',
          type: 'chart',
          title: 'Cohort Analysis',
          config: {
            type: 'line',
            title: 'Cohort Retention',
            dataSource: 'cohorts',
            refreshInterval: 300000,
          },
          position: { x: 6, y: 3, width: 6, height: 3 },
        },
      ],
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(executiveTemplate.id, executiveTemplate);
    this.templates.set(operationsTemplate.id, operationsTemplate);
    this.templates.set(analyticsTemplate.id, analyticsTemplate);
  }

  // Initialize performance metrics
  private initializeMetrics(): void {
    const metrics: PerformanceMetric[] = [
      {
        name: 'API Response Time (p95)',
        value: 145,
        unit: 'ms',
        threshold: 200,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        threshold: 1.0,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Request Throughput',
        value: 12500,
        unit: 'req/s',
        threshold: 10000,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'CPU Usage',
        value: 67,
        unit: '%',
        threshold: 80,
        status: 'warning',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Memory Usage',
        value: 72,
        unit: '%',
        threshold: 85,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Database Connections',
        value: 450,
        unit: 'conn',
        threshold: 500,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Cache Hit Rate',
        value: 94.5,
        unit: '%',
        threshold: 90,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
      {
        name: 'Queue Depth',
        value: 1250,
        unit: 'msg',
        threshold: 5000,
        status: 'healthy',
        history: this.generateMetricHistory(24),
      },
    ];

    metrics.forEach((m) => this.metrics.set(m.name, m));
  }

  // Generate mock history data
  private generateMetricHistory(hours: number): TimeSeriesData[] {
    const history: TimeSeriesData[] = [];
    const now = Date.now();

    for (let i = hours; i >= 0; i--) {
      history.push({
        timestamp: new Date(now - i * 3600000).toISOString(),
        value: Math.random() * 100,
      });
    }

    return history;
  }

  // Start periodic metric updates via WebSocket
  private startMetricUpdates(): void {
    setInterval(() => {
      this.metrics.forEach((metric, name) => {
        const change = (Math.random() - 0.5) * 10;
        metric.value = Math.max(0, metric.value + change);
        metric.status = metric.value >= (metric.threshold || 0) * 0.9 ? 'warning' : 'healthy';
        if (metric.value >= (metric.threshold || 0)) {
          metric.status = 'critical';
        }

        if (metric.history) {
          metric.history.push({
            timestamp: new Date().toISOString(),
            value: metric.value,
          });
          if (metric.history.length > 100) {
            metric.history.shift();
          }
        }

        this.emit('metricUpdate', {
          type: 'metric_update',
          payload: { metricId: name, value: metric.value, status: metric.status },
          timestamp: new Date().toISOString(),
        } as WebSocketMessage);
      });
    }, 5000);
  }

  // Dashboard Template Methods
  getTemplates(): DashboardTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): DashboardTemplate | undefined {
    return this.templates.get(id);
  }

  createTemplate(template: Omit<DashboardTemplate, 'id' | 'createdAt' | 'updatedAt'>): DashboardTemplate {
    const newTemplate: DashboardTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<DashboardTemplate>): DashboardTemplate | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate = {
      ...template,
      ...updates,
      id: template.id,
      createdAt: template.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Report Methods
  getReports(): ReportConfig[] {
    return Array.from(this.reports.values());
  }

  getReport(id: string): ReportConfig | undefined {
    return this.reports.get(id);
  }

  createReport(report: Omit<ReportConfig, 'id'>): ReportConfig {
    const newReport: ReportConfig = {
      ...report,
      id: `report-${Date.now()}`,
    };
    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  updateReport(id: string, updates: Partial<ReportConfig>): ReportConfig | undefined {
    const report = this.reports.get(id);
    if (!report) return undefined;

    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  deleteReport(id: string): boolean {
    return this.reports.delete(id);
  }

  // Scheduled Report Methods
  scheduleReport(reportId: string, schedule: ReportSchedule): ReportConfig | undefined {
    const report = this.reports.get(reportId);
    if (!report) return undefined;

    report.schedule = { ...schedule, lastRun: new Date().toISOString() };
    this.reports.set(reportId, report);

    // Set up cron-like scheduling
    this.scheduleNextRun(reportId, schedule);

    return report;
  }

  private scheduleNextRun(reportId: string, schedule: ReportSchedule): void {
    const now = new Date();
    let nextRun: Date;

    switch (schedule.frequency) {
      case 'daily':
        nextRun = new Date(now.setDate(now.getDate() + 1));
        nextRun.setHours(8, 0, 0, 0);
        break;
      case 'weekly':
        nextRun = new Date(now.setDate(now.getDate() + 7));
        nextRun.setHours(8, 0, 0, 0);
        break;
      case 'monthly':
        nextRun = new Date(now.setMonth(now.getMonth() + 1));
        nextRun.setDate(1);
        nextRun.setHours(8, 0, 0, 0);
        break;
      default:
        return;
    }

    schedule.nextRun = nextRun.toISOString();
  }

  // Data Aggregation Methods
  async aggregateData(
    dataSource: string,
    groupBy: string,
    filters?: AnalyticsFilter[],
    dateRange?: DateRangeFilter
  ): Promise<AggregatedData> {
    // Simulate data aggregation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const metrics: MetricResult[] = [
      {
        metric: 'count',
        value: Math.floor(Math.random() * 10000),
        change: Math.random() * 100 - 50,
        changePercent: Math.random() * 20 - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      {
        metric: 'sum',
        value: Math.floor(Math.random() * 100000),
        change: Math.random() * 1000 - 500,
        changePercent: Math.random() * 15 - 7.5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      {
        metric: 'avg',
        value: Math.random() * 100,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 10 - 5,
        trend: Math.random() > 0.5 ? 'up' : 'stable',
      },
    ];

    return { groupBy, metrics };
  }

  // Time Series Data Methods
  async getTimeSeriesData(
    metric: string,
    startDate: string,
    endDate: string,
    interval: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const data: TimeSeriesData[] = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    let current = start;

    while (current <= end) {
      data.push({
        timestamp: new Date(current).toISOString(),
        value: Math.random() * 1000 + 100,
        label: metric,
      });

      switch (interval) {
        case 'minute':
          current += 60000;
          break;
        case 'hour':
          current += 3600000;
          break;
        case 'day':
          current += 86400000;
          break;
        case 'week':
          current += 604800000;
          break;
        case 'month':
          current += 2592000000;
          break;
      }
    }

    return data;
  }

  // Performance Metrics Methods
  getPerformanceMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  // Export Methods
  async generateExport(
    reportId: string,
    format: 'pdf' | 'csv' | 'excel',
    filters?: AnalyticsFilter[]
  ): Promise<ExportResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const filename = `report-${reportId}-${Date.now()}.${format}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    // In production, this would generate actual files and upload to storage
    return {
      downloadUrl: `/api/analytics/exports/${filename}`,
      filename,
      expiresAt,
    };
  }

  // Widget Management
  getWidgets(): DashboardWidget[] {
    const templates = this.getTemplates();
    const widgets: DashboardWidget[] = [];
    templates.forEach((t) => widgets.push(...t.widgets));
    return widgets;
  }

  getWidget(id: string): DashboardWidget | undefined {
    const widgets = this.getWidgets();
    return widgets.find((w) => w.id === id);
  }

  createWidget(widget: Omit<DashboardWidget, 'id'>): DashboardWidget {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
    };
    this.widgets.set(newWidget.id, newWidget);
    return newWidget;
  }

  updateWidget(id: string, updates: Partial<DashboardWidget>): DashboardWidget | undefined {
    const widget = this.widgets.get(id);
    if (!widget) return undefined;

    const updatedWidget = { ...widget, ...updates };
    this.widgets.set(id, updatedWidget);
    return updatedWidget;
  }

  deleteWidget(id: string): boolean {
    return this.widgets.delete(id);
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
