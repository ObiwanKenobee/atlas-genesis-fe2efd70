/**
 * Atlas Sanctum AI — Layer 4: Learning
 *
 * Implements:
 *   - Reinforcement learning environment & policy management
 *   - Adaptive governance learning
 *   - Infrastructure learning models
 *   - Ecological feedback integration
 */

import {
  RLEnvironment, AdaptivePolicy, EcologicalFeedback,
  EpochMs, Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';

// ─── Q-Learning Agent (tabular, production → PyTorch DQN) ────────────────────

export class QLearningAgent {
  private qTable = new Map<string, Map<string, number>>();
  private readonly alpha: number;   // learning rate
  private readonly gamma: number;   // discount factor
  private epsilon: number;          // exploration rate

  constructor(alpha = 0.1, gamma = 0.95, epsilon = 0.2) {
    this.alpha   = alpha;
    this.gamma   = gamma;
    this.epsilon = epsilon;
  }

  selectAction(state: string, actions: string[]): string {
    if (Math.random() < this.epsilon) return actions[Math.floor(Math.random() * actions.length)];
    const stateQ = this.qTable.get(state);
    if (!stateQ) return actions[0];
    return actions.reduce((best, a) => (stateQ.get(a) ?? 0) > (stateQ.get(best) ?? 0) ? a : best, actions[0]);
  }

  update(state: string, action: string, reward: number, nextState: string, nextActions: string[]): void {
    if (!this.qTable.has(state)) this.qTable.set(state, new Map());
    const stateQ = this.qTable.get(state)!;
    const current = stateQ.get(action) ?? 0;

    const nextQ = this.qTable.get(nextState);
    const maxNext = nextQ ? Math.max(...nextActions.map(a => nextQ.get(a) ?? 0)) : 0;

    stateQ.set(action, current + this.alpha * (reward + this.gamma * maxNext - current));
  }

  decayExploration(rate = 0.995, minEpsilon = 0.01): void {
    this.epsilon = Math.max(minEpsilon, this.epsilon * rate);
  }

  getQValue(state: string, action: string): number {
    return this.qTable.get(state)?.get(action) ?? 0;
  }
}

// ─── Adaptive Policy Manager ──────────────────────────────────────────────────

export class AdaptivePolicyManager {
  private policies = new Map<string, AdaptivePolicy>();

  register(policy: AdaptivePolicy): void {
    this.policies.set(policy.policyId, policy);
  }

  recordPerformance(policyId: string, score: number): void {
    const policy = this.policies.get(policyId);
    if (!policy) return;
    this.policies.set(policyId, {
      ...policy,
      performanceHistory: [
        ...policy.performanceHistory,
        { epoch: Date.now() as EpochMs, score },
      ],
      lastUpdated: Date.now() as EpochMs,
    });
  }

  adapt(policyId: string, gradients: Record<string, number>): Result<AdaptivePolicy, AIError> {
    const policy = this.policies.get(policyId);
    if (!policy) return err(new AIError(`Policy ${policyId} not found`, 'POLICY_NOT_FOUND', 'learning'));

    const updatedParams = Object.fromEntries(
      Object.entries(policy.parameters).map(([k, v]) => [k, v + (gradients[k] ?? 0) * 0.01])
    );

    const updated: AdaptivePolicy = {
      ...policy,
      parameters: updatedParams,
      version: policy.version + 1,
      lastUpdated: Date.now() as EpochMs,
    };
    this.policies.set(policyId, updated);
    return ok(updated);
  }

  getBestPolicy(domain: string): AdaptivePolicy | undefined {
    return [...this.policies.values()]
      .filter(p => p.domain === domain)
      .sort((a, b) => {
        const scoreA = a.performanceHistory.at(-1)?.score ?? 0;
        const scoreB = b.performanceHistory.at(-1)?.score ?? 0;
        return scoreB - scoreA;
      })[0];
  }
}

// ─── Ecological Feedback Integrator ──────────────────────────────────────────

export class EcologicalFeedbackIntegrator {
  private feedbackHistory = new Map<string, EcologicalFeedback[]>();

  record(feedback: EcologicalFeedback): void {
    const history = this.feedbackHistory.get(feedback.biomeId) ?? [];
    this.feedbackHistory.set(feedback.biomeId, [...history, feedback]);
  }

  computeRewardSignal(biomeId: string): number {
    const history = this.feedbackHistory.get(biomeId) ?? [];
    if (history.length === 0) return 0;

    const latest = history.at(-1)!;
    const trendBonus = latest.trend === 'improving' ? 0.3 : latest.trend === 'degrading' ? -0.5 : 0;
    const deviationPenalty = Math.abs(latest.observedValue - latest.baselineValue) / Math.max(1, latest.baselineValue);

    return Math.max(-1, Math.min(1, latest.feedbackSignal + trendBonus - deviationPenalty));
  }

  getTrend(biomeId: string, windowSize = 5): 'improving' | 'stable' | 'degrading' {
    const history = this.feedbackHistory.get(biomeId) ?? [];
    const window = history.slice(-windowSize);
    if (window.length < 2) return 'stable';

    const delta = window.at(-1)!.observedValue - window[0].observedValue;
    return delta > 0.05 ? 'improving' : delta < -0.05 ? 'degrading' : 'stable';
  }
}

// ─── Governance Learning System ───────────────────────────────────────────────

export interface GovernanceOutcome {
  proposalId: string;
  domain: string;
  policy: string;
  implementedAt: EpochMs;
  measuredImpact: Record<string, number>;
  citizenSatisfaction: number;   // 0–1
  ecologicalImpact: number;      // 0–1
}

export class GovernanceLearningSystem {
  private outcomes: GovernanceOutcome[] = [];
  private readonly policyManager = new AdaptivePolicyManager();

  recordOutcome(outcome: GovernanceOutcome): void {
    this.outcomes.push(outcome);
    const score = (outcome.citizenSatisfaction + outcome.ecologicalImpact) / 2;
    this.policyManager.recordPerformance(outcome.domain, score);
  }

  recommendPolicy(domain: string, context: Record<string, unknown>): string {
    const best = this.policyManager.getBestPolicy(domain);
    if (!best) return `No learned policy for domain: ${domain}`;

    const relevantOutcomes = this.outcomes
      .filter(o => o.domain === domain)
      .sort((a, b) => (b.citizenSatisfaction + b.ecologicalImpact) - (a.citizenSatisfaction + a.ecologicalImpact));

    return relevantOutcomes[0]?.policy ?? `Default policy for ${domain}`;
  }

  getInsights(domain: string): { avgSatisfaction: number; avgEcologicalImpact: number; sampleSize: number } {
    const relevant = this.outcomes.filter(o => o.domain === domain);
    if (relevant.length === 0) return { avgSatisfaction: 0, avgEcologicalImpact: 0, sampleSize: 0 };

    return {
      avgSatisfaction: relevant.reduce((s, o) => s + o.citizenSatisfaction, 0) / relevant.length,
      avgEcologicalImpact: relevant.reduce((s, o) => s + o.ecologicalImpact, 0) / relevant.length,
      sampleSize: relevant.length,
    };
  }
}

// ─── Learning Layer ───────────────────────────────────────────────────────────

export class LearningLayer {
  readonly rl          = new QLearningAgent();
  readonly policies    = new AdaptivePolicyManager();
  readonly ecology     = new EcologicalFeedbackIntegrator();
  readonly governance  = new GovernanceLearningSystem();

  /**
   * Single training step: observe ecological feedback, compute reward,
   * update RL agent, adapt governance policy.
   */
  step(
    state: string,
    action: string,
    nextState: string,
    biomeId: string,
    feedback: EcologicalFeedback,
  ): { reward: number; qValue: number } {
    this.ecology.record(feedback);
    const reward = this.ecology.computeRewardSignal(biomeId);
    this.rl.update(state, action, reward, nextState, [action]);
    this.rl.decayExploration();
    return { reward, qValue: this.rl.getQValue(state, action) };
  }
}
