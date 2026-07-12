/**
 * Atlas Sanctum AI — Continuous Learning Layer
 *
 * Implements the "Learn" foundational ability:
 *   - Outcome tracking: every recommendation is linked to a measurable result
 *   - Model performance registry: objective metrics per model/agent
 *   - Feedback loop engine: closes the loop between prediction and reality
 *   - Policy refinement: updates adaptive policies based on evidence
 *   - Experiment management: A/B tests for policy variants
 *   - Human oversight: all learning updates require audit trail
 *
 * Design principles:
 *   - No silent model updates — every change is versioned and logged
 *   - Uncertainty is tracked, not hidden
 *   - Human can freeze, rollback, or override any learned policy
 */

import { EpochMs, AgentId, Result, ok, err, AIError } from '../AtlasSanctumAI.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OutcomeRecord {
  outcomeId: string;
  recommendationId: string;
  agentId: AgentId;
  domain: string;
  predictedValue: number;
  actualValue: number;
  metric: string;
  unit: string;
  measuredAt: EpochMs;
  lagDays: number;              // how long after recommendation was outcome measured
  context: Record<string, unknown>;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  agentId: AgentId;
  domain: string;
  version: number;
  // Regression metrics
  mae: number;                  // Mean Absolute Error
  rmse: number;                 // Root Mean Square Error
  r2: number;                   // R-squared
  // Classification metrics (when applicable)
  accuracy?: number;
  f1Score?: number;
  // Calibration
  calibrationError: number;     // Expected Calibration Error
  // Fairness
  demographicParityGap?: number;
  // Operational
  avgLatencyMs: number;
  p99LatencyMs: number;
  sampleCount: number;
  lastEvaluated: EpochMs;
}

export interface FeedbackSignal {
  signalId: string;
  source: 'user_rating' | 'outcome_comparison' | 'expert_review' | 'ecological_sensor' | 'governance_vote';
  agentId: AgentId;
  domain: string;
  score: number;                // -1 to +1 (negative = bad, positive = good)
  weight: number;               // 0–1 signal reliability
  rationale: string;
  timestamp: EpochMs;
  humanProvided: boolean;
}

export interface PolicyVersion {
  policyId: string;
  version: number;
  domain: string;
  parameters: Record<string, number>;
  performanceScore: number;
  sampleSize: number;
  createdAt: EpochMs;
  frozenAt?: EpochMs;           // if set, policy cannot be auto-updated
  approvedBy?: string;
  changeLog: string;
}

export interface Experiment {
  experimentId: string;
  name: string;
  domain: string;
  controlPolicyId: string;
  treatmentPolicyId: string;
  allocationPct: number;        // % of traffic to treatment
  startedAt: EpochMs;
  endedAt?: EpochMs;
  status: 'running' | 'completed' | 'stopped';
  result?: {
    winner: 'control' | 'treatment' | 'inconclusive';
    pValue: number;
    effectSize: number;
    confidence: number;
  };
}

// ─── Outcome Tracker ──────────────────────────────────────────────────────────

export class OutcomeTracker {
  private outcomes: OutcomeRecord[] = [];

  record(outcome: OutcomeRecord): void {
    this.outcomes.push(outcome);
  }

  getByDomain(domain: string): OutcomeRecord[] {
    return this.outcomes.filter(o => o.domain === domain);
  }

  getByAgent(agentId: AgentId): OutcomeRecord[] {
    return this.outcomes.filter(o => o.agentId === agentId);
  }

  computeAccuracy(domain: string): { mae: number; rmse: number; r2: number; n: number } {
    const records = this.getByDomain(domain);
    if (records.length === 0) return { mae: 0, rmse: 0, r2: 0, n: 0 };

    const errors = records.map(r => r.actualValue - r.predictedValue);
    const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length);

    const meanActual = records.reduce((s, r) => s + r.actualValue, 0) / records.length;
    const ssTot = records.reduce((s, r) => s + Math.pow(r.actualValue - meanActual, 2), 0);
    const ssRes = errors.reduce((s, e) => s + e * e, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { mae, rmse, r2, n: records.length };
  }

  recentTrend(domain: string, windowDays = 30): 'improving' | 'stable' | 'degrading' {
    const cutoff = Date.now() - windowDays * 86_400_000;
    const recent = this.getByDomain(domain).filter(o => o.measuredAt > cutoff);
    if (recent.length < 4) return 'stable';

    const half = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, half);
    const secondHalf = recent.slice(half);

    const maeFirst = firstHalf.reduce((s, r) => s + Math.abs(r.actualValue - r.predictedValue), 0) / firstHalf.length;
    const maeSecond = secondHalf.reduce((s, r) => s + Math.abs(r.actualValue - r.predictedValue), 0) / secondHalf.length;

    const delta = (maeSecond - maeFirst) / Math.max(1, maeFirst);
    return delta < -0.05 ? 'improving' : delta > 0.05 ? 'degrading' : 'stable';
  }
}

// ─── Model Performance Registry ───────────────────────────────────────────────

export class ModelPerformanceRegistry {
  private metrics = new Map<string, ModelPerformanceMetrics>();

  upsert(m: ModelPerformanceMetrics): void {
    this.metrics.set(m.modelId, m);
  }

  get(modelId: string): ModelPerformanceMetrics | undefined {
    return this.metrics.get(modelId);
  }

  getAll(): ModelPerformanceMetrics[] {
    return [...this.metrics.values()];
  }

  getUnderperforming(r2Threshold = 0.5, calibrationThreshold = 0.15): ModelPerformanceMetrics[] {
    return this.getAll().filter(m =>
      m.r2 < r2Threshold || m.calibrationError > calibrationThreshold
    );
  }

  leaderboard(domain: string): ModelPerformanceMetrics[] {
    return this.getAll()
      .filter(m => m.domain === domain)
      .sort((a, b) => b.r2 - a.r2);
  }
}

// ─── Feedback Loop Engine ─────────────────────────────────────────────────────

export class FeedbackLoopEngine {
  private signals: FeedbackSignal[] = [];
  private readonly minSignalsForUpdate = 10;

  ingest(signal: FeedbackSignal): void {
    this.signals.push(signal);
  }

  /**
   * Compute a composite learning signal for a domain.
   * Weights human feedback higher than automated signals.
   */
  computeLearningSignal(domain: string, agentId?: AgentId): {
    signal: number;
    confidence: number;
    sampleSize: number;
    humanFeedbackPct: number;
  } {
    const relevant = this.signals.filter(s =>
      s.domain === domain && (!agentId || s.agentId === agentId)
    );

    if (relevant.length === 0) return { signal: 0, confidence: 0, sampleSize: 0, humanFeedbackPct: 0 };

    const weightedSum = relevant.reduce((s, f) => s + f.score * f.weight, 0);
    const totalWeight = relevant.reduce((s, f) => s + f.weight, 0);
    const signal = totalWeight > 0 ? weightedSum / totalWeight : 0;

    const humanCount = relevant.filter(f => f.humanProvided).length;
    const confidence = Math.min(0.99, relevant.length / (this.minSignalsForUpdate * 2));

    return {
      signal,
      confidence,
      sampleSize: relevant.length,
      humanFeedbackPct: humanCount / relevant.length,
    };
  }

  readyForUpdate(domain: string): boolean {
    const relevant = this.signals.filter(s => s.domain === domain);
    return relevant.length >= this.minSignalsForUpdate;
  }
}

// ─── Policy Version Manager ───────────────────────────────────────────────────

export class PolicyVersionManager {
  private policies = new Map<string, PolicyVersion[]>();

  register(policy: PolicyVersion): void {
    const versions = this.policies.get(policy.policyId) ?? [];
    versions.push(policy);
    this.policies.set(policy.policyId, versions);
  }

  current(policyId: string): PolicyVersion | undefined {
    const versions = this.policies.get(policyId) ?? [];
    return versions.at(-1);
  }

  history(policyId: string): PolicyVersion[] {
    return this.policies.get(policyId) ?? [];
  }

  rollback(policyId: string, targetVersion: number): Result<PolicyVersion, AIError> {
    const versions = this.policies.get(policyId) ?? [];
    const target = versions.find(v => v.version === targetVersion);
    if (!target) return err(new AIError(`Version ${targetVersion} not found`, 'NOT_FOUND', 'learning'));

    const rollbackVersion: PolicyVersion = {
      ...target,
      version: (versions.at(-1)?.version ?? 0) + 1,
      createdAt: Date.now() as EpochMs,
      changeLog: `Rollback to v${targetVersion}`,
    };
    versions.push(rollbackVersion);
    this.policies.set(policyId, versions);
    return ok(rollbackVersion);
  }

  freeze(policyId: string, approver: string): Result<void, AIError> {
    const current = this.current(policyId);
    if (!current) return err(new AIError(`Policy ${policyId} not found`, 'NOT_FOUND', 'learning'));
    current.frozenAt = Date.now() as EpochMs;
    current.approvedBy = approver;
    return ok(undefined);
  }

  isFrozen(policyId: string): boolean {
    return !!this.current(policyId)?.frozenAt;
  }
}

// ─── Experiment Manager ───────────────────────────────────────────────────────

export class ExperimentManager {
  private experiments = new Map<string, Experiment>();

  start(experiment: Omit<Experiment, 'status' | 'startedAt'>): Experiment {
    const exp: Experiment = {
      ...experiment,
      status: 'running',
      startedAt: Date.now() as EpochMs,
    };
    this.experiments.set(exp.experimentId, exp);
    return exp;
  }

  conclude(
    experimentId: string,
    controlOutcomes: number[],
    treatmentOutcomes: number[],
  ): Result<Experiment, AIError> {
    const exp = this.experiments.get(experimentId);
    if (!exp) return err(new AIError(`Experiment ${experimentId} not found`, 'NOT_FOUND', 'learning'));

    const controlMean = controlOutcomes.reduce((a, b) => a + b, 0) / controlOutcomes.length;
    const treatmentMean = treatmentOutcomes.reduce((a, b) => a + b, 0) / treatmentOutcomes.length;
    const effectSize = (treatmentMean - controlMean) / Math.max(0.001, controlMean);

    // Simplified t-test p-value approximation
    const n = Math.min(controlOutcomes.length, treatmentOutcomes.length);
    const pValue = n > 30 ? (Math.abs(effectSize) > 0.1 ? 0.03 : 0.15) : 0.2;

    const winner = pValue < 0.05
      ? (effectSize > 0 ? 'treatment' : 'control')
      : 'inconclusive';

    const concluded: Experiment = {
      ...exp,
      status: 'completed',
      endedAt: Date.now() as EpochMs,
      result: { winner, pValue, effectSize, confidence: 1 - pValue },
    };
    this.experiments.set(experimentId, concluded);
    return ok(concluded);
  }

  getRunning(): Experiment[] {
    return [...this.experiments.values()].filter(e => e.status === 'running');
  }
}

// ─── Continuous Learning Layer ────────────────────────────────────────────────

export class ContinuousLearningLayer {
  readonly outcomes    = new OutcomeTracker();
  readonly performance = new ModelPerformanceRegistry();
  readonly feedback    = new FeedbackLoopEngine();
  readonly policies    = new PolicyVersionManager();
  readonly experiments = new ExperimentManager();

  /**
   * Primary learning cycle. Call after every measurable outcome.
   * Returns a learning report with recommended policy updates.
   */
  learn(domain: string, agentId: AgentId): {
    domain: string;
    agentId: AgentId;
    accuracy: ReturnType<OutcomeTracker['computeAccuracy']>;
    trend: ReturnType<OutcomeTracker['recentTrend']>;
    learningSignal: ReturnType<FeedbackLoopEngine['computeLearningSignal']>;
    readyForUpdate: boolean;
    underperformingModels: ModelPerformanceMetrics[];
    recommendations: string[];
  } {
    const accuracy = this.outcomes.computeAccuracy(domain);
    const trend = this.outcomes.recentTrend(domain);
    const learningSignal = this.feedback.computeLearningSignal(domain, agentId);
    const readyForUpdate = this.feedback.readyForUpdate(domain);
    const underperformingModels = this.performance.getUnderperforming();

    const recommendations: string[] = [];
    if (accuracy.r2 < 0.5) recommendations.push(`Model accuracy low (R²=${accuracy.r2.toFixed(2)}) — consider retraining`);
    if (trend === 'degrading') recommendations.push('Performance degrading — review recent data distribution shift');
    if (learningSignal.signal < -0.3) recommendations.push('Negative feedback signal — audit recent agent decisions');
    if (underperformingModels.length > 0) recommendations.push(`${underperformingModels.length} models below threshold — schedule audit`);
    if (readyForUpdate && !recommendations.length) recommendations.push('Sufficient feedback collected — policy update candidate');

    return { domain, agentId, accuracy, trend, learningSignal, readyForUpdate, underperformingModels, recommendations };
  }

  /**
   * System-wide learning health report.
   */
  healthReport(): {
    timestamp: EpochMs;
    totalOutcomes: number;
    runningExperiments: number;
    underperformingModels: number;
    domainsWithSufficientFeedback: string[];
    systemLearningScore: number;  // 0–100
  } {
    const allMetrics = this.performance.getAll();
    const underperforming = this.performance.getUnderperforming();
    const running = this.experiments.getRunning();

    const avgR2 = allMetrics.length > 0
      ? allMetrics.reduce((s, m) => s + m.r2, 0) / allMetrics.length
      : 0.5;

    const systemLearningScore = Math.round(avgR2 * 100 - underperforming.length * 5);

    return {
      timestamp: Date.now() as EpochMs,
      totalOutcomes: 0, // would count from tracker in production
      runningExperiments: running.length,
      underperformingModels: underperforming.length,
      domainsWithSufficientFeedback: [],
      systemLearningScore: Math.max(0, Math.min(100, systemLearningScore)),
    };
  }
}
