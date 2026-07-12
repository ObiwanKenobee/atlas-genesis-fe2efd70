/**
 * Atlas Sanctum AI — Sentinel Agent
 *
 * The Sentinel is the always-on monitoring intelligence.
 * It continuously perceives signals across all 10 layers, detects anomalies,
 * escalates to human operators when confidence thresholds are breached,
 * and coordinates emergency response coalitions.
 *
 * Responsibilities:
 *   - Ingest real-time streams (satellite, IoT, agent actions, governance events)
 *   - Detect statistical anomalies and pattern deviations
 *   - Classify alert severity with confidence intervals
 *   - Escalate to human operators when AI confidence < threshold
 *   - Trigger multi-agent emergency coalitions
 *   - Maintain a rolling observation window for trend detection
 */

import { EpochMs, AgentId, Confidence, LatLng, Result, ok, err, AIError } from '../AtlasSanctumAI.types';

// ─── Observation Types ────────────────────────────────────────────────────────

export type SignalSource =
  | 'satellite' | 'iot_sensor' | 'drone' | 'ocean_buoy'
  | 'agent_action' | 'governance_event' | 'market_data'
  | 'health_metric' | 'infrastructure' | 'social_signal';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface SentinelObservation {
  observationId: string;
  source: SignalSource;
  metric: string;
  value: number;
  unit: string;
  location?: LatLng;
  timestamp: EpochMs;
  confidence: Confidence;
  rawPayload?: Record<string, unknown>;
}

export interface SentinelAlert {
  alertId: string;
  severity: AlertSeverity;
  source: SignalSource;
  metric: string;
  observedValue: number;
  baselineValue: number;
  deviationSigma: number;       // standard deviations from baseline
  confidence: Confidence;
  location?: LatLng;
  timestamp: EpochMs;
  message: string;
  recommendedActions: string[];
  requiresHumanReview: boolean;
  escalatedAt?: EpochMs;
  resolvedAt?: EpochMs;
  agentCoalitionTriggered?: string;
}

export interface SentinelBaseline {
  metric: string;
  source: SignalSource;
  mean: number;
  stdDev: number;
  sampleCount: number;
  lastUpdated: EpochMs;
}

export interface SentinelConfig {
  anomalyThresholdSigma: number;       // default 2.5σ
  criticalThresholdSigma: number;      // default 4.0σ
  humanEscalationConfidenceFloor: number; // escalate if confidence < this
  rollingWindowSize: number;           // observations to keep per metric
  emergencyCoalitionRoles: string[];
}

// ─── Baseline Registry ────────────────────────────────────────────────────────

class BaselineRegistry {
  private baselines = new Map<string, SentinelBaseline>();
  private windows = new Map<string, number[]>();

  private key(source: SignalSource, metric: string): string {
    return `${source}::${metric}`;
  }

  ingest(obs: SentinelObservation, windowSize: number): void {
    const k = this.key(obs.source, obs.metric);
    const window = this.windows.get(k) ?? [];
    window.push(obs.value);
    if (window.length > windowSize) window.shift();
    this.windows.set(k, window);

    if (window.length >= 5) {
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
      this.baselines.set(k, {
        metric: obs.metric,
        source: obs.source,
        mean,
        stdDev: Math.sqrt(variance),
        sampleCount: window.length,
        lastUpdated: obs.timestamp,
      });
    }
  }

  get(source: SignalSource, metric: string): SentinelBaseline | undefined {
    return this.baselines.get(this.key(source, metric));
  }

  all(): SentinelBaseline[] {
    return [...this.baselines.values()];
  }
}

// ─── Alert Manager ────────────────────────────────────────────────────────────

class AlertManager {
  private alerts: SentinelAlert[] = [];
  private handlers: ((alert: SentinelAlert) => void)[] = [];

  emit(alert: SentinelAlert): void {
    this.alerts.push(alert);
    this.handlers.forEach(h => h(alert));
  }

  onAlert(handler: (alert: SentinelAlert) => void): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }

  resolve(alertId: string): void {
    const alert = this.alerts.find(a => a.alertId === alertId);
    if (alert) alert.resolvedAt = Date.now() as EpochMs;
  }

  getActive(severity?: AlertSeverity): SentinelAlert[] {
    const unresolved = this.alerts.filter(a => !a.resolvedAt);
    return severity ? unresolved.filter(a => a.severity === severity) : unresolved;
  }

  getHistory(limitHours = 24): SentinelAlert[] {
    const cutoff = Date.now() - limitHours * 3_600_000;
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  stats(): { total: number; active: number; bySevertiy: Record<AlertSeverity, number> } {
    const active = this.getActive();
    return {
      total: this.alerts.length,
      active: active.length,
      bySevertiy: {
        info: active.filter(a => a.severity === 'info').length,
        warning: active.filter(a => a.severity === 'warning').length,
        critical: active.filter(a => a.severity === 'critical').length,
        emergency: active.filter(a => a.severity === 'emergency').length,
      },
    };
  }
}

// ─── Sentinel Agent ───────────────────────────────────────────────────────────

export class SentinelAgent {
  readonly id: AgentId = 'agent-sentinel' as AgentId;
  readonly role = 'sentinel' as const;

  private readonly baselines = new BaselineRegistry();
  readonly alerts = new AlertManager();
  private observationCount = 0;

  private readonly config: SentinelConfig;

  constructor(config: Partial<SentinelConfig> = {}) {
    this.config = {
      anomalyThresholdSigma: 2.5,
      criticalThresholdSigma: 4.0,
      humanEscalationConfidenceFloor: 0.6,
      rollingWindowSize: 200,
      emergencyCoalitionRoles: ['disaster', 'governance', 'logistics', 'medicine'],
      ...config,
    };
  }

  /**
   * Primary ingestion point. Call this for every observation from any source.
   * Returns an alert if an anomaly is detected, null otherwise.
   */
  observe(obs: SentinelObservation): SentinelAlert | null {
    this.observationCount++;
    this.baselines.ingest(obs, this.config.rollingWindowSize);

    const baseline = this.baselines.get(obs.source, obs.metric);
    if (!baseline || baseline.stdDev === 0) return null;

    const deviationSigma = Math.abs((obs.value - baseline.mean) / baseline.stdDev);
    if (deviationSigma < this.config.anomalyThresholdSigma) return null;

    const severity = this.classifySeverity(deviationSigma, obs.confidence);
    const requiresHumanReview =
      severity === 'emergency' ||
      obs.confidence < this.config.humanEscalationConfidenceFloor;

    const alert: SentinelAlert = {
      alertId: `sentinel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      severity,
      source: obs.source,
      metric: obs.metric,
      observedValue: obs.value,
      baselineValue: baseline.mean,
      deviationSigma,
      confidence: obs.confidence,
      location: obs.location,
      timestamp: obs.timestamp,
      message: this.buildMessage(obs, baseline, deviationSigma, severity),
      recommendedActions: this.buildRecommendations(obs, severity),
      requiresHumanReview,
    };

    this.alerts.emit(alert);
    return alert;
  }

  /**
   * Batch-observe multiple signals (e.g., from a satellite pass or IoT flush).
   */
  observeBatch(observations: SentinelObservation[]): SentinelAlert[] {
    return observations
      .map(obs => this.observe(obs))
      .filter((a): a is SentinelAlert => a !== null);
  }

  /**
   * Escalate an alert to human operators.
   * In production: triggers PagerDuty / Slack / email via coordination plane.
   */
  escalate(alertId: string): Result<{ escalated: boolean; channel: string }, AIError> {
    const alert = this.alerts.getActive().find(a => a.alertId === alertId);
    if (!alert) return err(new AIError(`Alert ${alertId} not found`, 'NOT_FOUND', 'multi-agent'));

    alert.escalatedAt = Date.now() as EpochMs;
    const channel = alert.severity === 'emergency' ? 'pagerduty+slack+sms' : 'slack+email';

    return ok({ escalated: true, channel });
  }

  /**
   * Synthesize a situational awareness report across all active alerts.
   */
  situationalReport(): {
    timestamp: EpochMs;
    observationsProcessed: number;
    activeAlerts: number;
    emergencies: SentinelAlert[];
    criticals: SentinelAlert[];
    topRisks: { metric: string; deviationSigma: number; severity: AlertSeverity }[];
    systemHealthScore: number;  // 0–100
    baselines: SentinelBaseline[];
  } {
    const active = this.alerts.getActive();
    const emergencies = active.filter(a => a.severity === 'emergency');
    const criticals = active.filter(a => a.severity === 'critical');

    const topRisks = active
      .sort((a, b) => b.deviationSigma - a.deviationSigma)
      .slice(0, 5)
      .map(a => ({ metric: a.metric, deviationSigma: a.deviationSigma, severity: a.severity }));

    const healthScore = Math.max(0,
      100 - emergencies.length * 25 - criticals.length * 10 - active.length * 2
    );

    return {
      timestamp: Date.now() as EpochMs,
      observationsProcessed: this.observationCount,
      activeAlerts: active.length,
      emergencies,
      criticals,
      topRisks,
      systemHealthScore: healthScore,
      baselines: this.baselines.all(),
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private classifySeverity(sigma: number, confidence: Confidence): AlertSeverity {
    if (sigma >= this.config.criticalThresholdSigma && confidence > 0.8) return 'emergency';
    if (sigma >= this.config.criticalThresholdSigma) return 'critical';
    if (sigma >= this.config.anomalyThresholdSigma + 1) return 'critical';
    if (sigma >= this.config.anomalyThresholdSigma) return 'warning';
    return 'info';
  }

  private buildMessage(
    obs: SentinelObservation,
    baseline: SentinelBaseline,
    sigma: number,
    severity: AlertSeverity,
  ): string {
    const direction = obs.value > baseline.mean ? 'spike' : 'dip';
    return `[${severity.toUpperCase()}] ${obs.metric} ${direction} detected from ${obs.source}: ` +
      `observed=${obs.value.toFixed(3)} ${obs.unit}, baseline=${baseline.mean.toFixed(3)}, ` +
      `deviation=${sigma.toFixed(2)}σ, confidence=${(obs.confidence * 100).toFixed(0)}%`;
  }

  private buildRecommendations(obs: SentinelObservation, severity: AlertSeverity): string[] {
    const base: string[] = ['Review raw data source', 'Cross-validate with secondary sensor'];

    const domainRecs: Partial<Record<SignalSource, string[]>> = {
      satellite: ['Trigger satellite re-pass for confirmation', 'Activate drone verification'],
      iot_sensor: ['Check sensor calibration', 'Deploy field team for ground-truth'],
      ocean_buoy: ['Alert marine monitoring network', 'Coordinate with oceanography team'],
      agent_action: ['Audit agent decision log', 'Invoke ethics review'],
      governance_event: ['Notify bioregional council', 'Pause dependent workflows'],
      infrastructure: ['Activate redundancy protocols', 'Alert infrastructure team'],
      health_metric: ['Notify public health authority', 'Activate health response protocol'],
    };

    const severityRecs: Record<AlertSeverity, string[]> = {
      info: [],
      warning: ['Increase monitoring frequency', 'Prepare contingency plan'],
      critical: ['Activate incident response', 'Notify human operators immediately'],
      emergency: [
        'Declare emergency protocol',
        'Assemble multi-agent coalition',
        'Escalate to governance council',
        'Initiate disaster response workflow',
      ],
    };

    return [...base, ...(domainRecs[obs.source] ?? []), ...severityRecs[severity]];
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const GlobalSentinel = new SentinelAgent();
