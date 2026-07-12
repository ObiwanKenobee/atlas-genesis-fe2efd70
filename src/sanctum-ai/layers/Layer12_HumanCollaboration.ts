/**
 * Atlas Sanctum AI — Human Collaboration Layer
 *
 * Implements the "Human judgment remains the final authority" principle.
 *
 * Capabilities:
 *   - Explainability engine: every recommendation includes evidence, confidence,
 *     alternatives, and uncertainty representation
 *   - Approval gate system: high-stakes decisions require human sign-off
 *   - Decision provenance: full lineage from data → reasoning → recommendation
 *   - Uncertainty communication: never presents false certainty
 *   - Override registry: humans can override any AI decision with audit trail
 *   - Collaboration interface: structured human-AI dialogue for complex decisions
 */

import { EpochMs, AgentId, Confidence, Result, ok, err, AIError } from '../AtlasSanctumAI.types';

// ─── Explainability Types ─────────────────────────────────────────────────────

export interface Evidence {
  sourceId: string;
  sourceType: 'satellite' | 'sensor' | 'database' | 'model' | 'human_input' | 'historical';
  description: string;
  value: unknown;
  confidence: Confidence;
  timestamp: EpochMs;
  url?: string;
}

export interface Alternative {
  description: string;
  confidence: Confidence;
  tradeoffs: string[];
  estimatedImpact: Record<string, number>;
}

export interface Explanation {
  recommendationId: string;
  summary: string;
  reasoning: string[];           // step-by-step logical chain
  evidence: Evidence[];
  confidence: Confidence;
  confidenceInterval: [number, number];
  uncertainties: string[];       // explicit uncertainty statements
  alternatives: Alternative[];
  assumptions: string[];
  limitations: string[];
  agentId: AgentId;
  generatedAt: EpochMs;
  humanReadableScore: string;    // e.g. "High confidence (87%)"
}

// ─── Approval Gate Types ──────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'auto_approved';

export interface ApprovalGate {
  gateId: string;
  recommendationId: string;
  agentId: AgentId;
  domain: string;
  action: string;
  stakes: 'low' | 'medium' | 'high' | 'civilizational';
  explanation: Explanation;
  requiredApprovers: string[];
  approvals: { approverId: string; decision: 'approve' | 'reject'; rationale: string; timestamp: EpochMs }[];
  status: ApprovalStatus;
  createdAt: EpochMs;
  expiresAt: EpochMs;
  autoApproveAfterMs?: number;   // if set, auto-approves after timeout for low-stakes
}

// ─── Decision Provenance ──────────────────────────────────────────────────────

export interface ProvenanceNode {
  nodeId: string;
  type: 'data_source' | 'model_inference' | 'agent_action' | 'human_input' | 'policy_rule' | 'ethical_check';
  description: string;
  inputs: string[];              // nodeIds of upstream nodes
  outputs: string[];             // nodeIds of downstream nodes
  confidence: Confidence;
  timestamp: EpochMs;
  metadata: Record<string, unknown>;
}

export interface DecisionProvenance {
  decisionId: string;
  finalRecommendation: string;
  nodes: ProvenanceNode[];
  rootCauses: string[];          // nodeIds with no inputs
  criticalPath: string[];        // most influential chain of nodes
  humanInterventions: string[];  // nodeIds where humans contributed
  auditHash: string;             // SHA-256 of the full provenance graph
}

// ─── Override Registry ────────────────────────────────────────────────────────

export interface HumanOverride {
  overrideId: string;
  recommendationId: string;
  overriddenBy: string;
  originalDecision: string;
  overrideDecision: string;
  rationale: string;
  timestamp: EpochMs;
  acknowledged: boolean;         // AI system acknowledged the override
  learningSignal: number;        // -1 to +1 fed back to learning layer
}

// ─── Explainability Engine ────────────────────────────────────────────────────

export class ExplainabilityEngine {
  /**
   * Generate a human-readable explanation for any AI recommendation.
   */
  explain(params: {
    recommendationId: string;
    agentId: AgentId;
    summary: string;
    reasoning: string[];
    evidence: Evidence[];
    confidence: Confidence;
    alternatives?: Alternative[];
    assumptions?: string[];
    limitations?: string[];
  }): Explanation {
    const ci = this.computeConfidenceInterval(params.confidence, params.evidence.length);
    const uncertainties = this.identifyUncertainties(params.evidence, params.confidence);

    return {
      recommendationId: params.recommendationId,
      summary: params.summary,
      reasoning: params.reasoning,
      evidence: params.evidence,
      confidence: params.confidence,
      confidenceInterval: ci,
      uncertainties,
      alternatives: params.alternatives ?? [],
      assumptions: params.assumptions ?? [],
      limitations: params.limitations ?? ['Model trained on historical data — future conditions may differ'],
      agentId: params.agentId,
      generatedAt: Date.now() as EpochMs,
      humanReadableScore: this.scoreToText(params.confidence),
    };
  }

  private computeConfidenceInterval(confidence: Confidence, evidenceCount: number): [number, number] {
    // Wilson score interval approximation
    const z = 1.96; // 95% CI
    const n = Math.max(1, evidenceCount);
    const margin = z * Math.sqrt((confidence * (1 - confidence)) / n);
    return [
      Math.max(0, confidence - margin) as Confidence,
      Math.min(1, confidence + margin) as Confidence,
    ];
  }

  private identifyUncertainties(evidence: Evidence[], confidence: Confidence): string[] {
    const uncertainties: string[] = [];
    if (confidence < 0.7) uncertainties.push('Confidence below 70% — treat as hypothesis, not conclusion');
    if (evidence.length < 3) uncertainties.push('Limited evidence sources — additional verification recommended');
    const lowConfEvidence = evidence.filter(e => e.confidence < 0.6);
    if (lowConfEvidence.length > 0) uncertainties.push(`${lowConfEvidence.length} evidence source(s) have low confidence`);
    const oldEvidence = evidence.filter(e => Date.now() - e.timestamp > 30 * 86_400_000);
    if (oldEvidence.length > 0) uncertainties.push(`${oldEvidence.length} evidence source(s) are older than 30 days`);
    return uncertainties;
  }

  private scoreToText(confidence: Confidence): string {
    if (confidence >= 0.9) return `Very high confidence (${(confidence * 100).toFixed(0)}%)`;
    if (confidence >= 0.75) return `High confidence (${(confidence * 100).toFixed(0)}%)`;
    if (confidence >= 0.6) return `Moderate confidence (${(confidence * 100).toFixed(0)}%)`;
    if (confidence >= 0.4) return `Low confidence (${(confidence * 100).toFixed(0)}%) — human review recommended`;
    return `Very low confidence (${(confidence * 100).toFixed(0)}%) — do not act without human verification`;
  }
}

// ─── Approval Gate Manager ────────────────────────────────────────────────────

export class ApprovalGateManager {
  private gates = new Map<string, ApprovalGate>();

  /**
   * Create an approval gate for a high-stakes decision.
   * Low-stakes decisions with high confidence can be auto-approved.
   */
  create(params: {
    recommendationId: string;
    agentId: AgentId;
    domain: string;
    action: string;
    stakes: ApprovalGate['stakes'];
    explanation: Explanation;
    requiredApprovers: string[];
    ttlHours?: number;
  }): ApprovalGate {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ttlMs = (params.ttlHours ?? 24) * 3_600_000;

    // Auto-approve low-stakes, high-confidence decisions
    const autoApprove = params.stakes === 'low' && params.explanation.confidence > 0.85;

    const gate: ApprovalGate = {
      gateId,
      recommendationId: params.recommendationId,
      agentId: params.agentId,
      domain: params.domain,
      action: params.action,
      stakes: params.stakes,
      explanation: params.explanation,
      requiredApprovers: params.requiredApprovers,
      approvals: [],
      status: autoApprove ? 'auto_approved' : 'pending',
      createdAt: Date.now() as EpochMs,
      expiresAt: (Date.now() + ttlMs) as EpochMs,
      autoApproveAfterMs: params.stakes === 'low' ? 3_600_000 : undefined,
    };

    this.gates.set(gateId, gate);
    return gate;
  }

  decide(gateId: string, approverId: string, decision: 'approve' | 'reject', rationale: string): Result<ApprovalGate, AIError> {
    const gate = this.gates.get(gateId);
    if (!gate) return err(new AIError(`Gate ${gateId} not found`, 'NOT_FOUND', 'multi-agent'));
    if (gate.status !== 'pending') return err(new AIError(`Gate ${gateId} is ${gate.status}`, 'INVALID_STATE', 'multi-agent'));
    if (Date.now() > gate.expiresAt) {
      gate.status = 'expired';
      return err(new AIError(`Gate ${gateId} has expired`, 'EXPIRED', 'multi-agent'));
    }

    gate.approvals.push({ approverId, decision, rationale, timestamp: Date.now() as EpochMs });

    // Check if all required approvers have decided
    const approvedBy = gate.approvals.filter(a => a.decision === 'approve').map(a => a.approverId);
    const rejectedBy = gate.approvals.filter(a => a.decision === 'reject');

    if (rejectedBy.length > 0) {
      gate.status = 'rejected';
    } else if (gate.requiredApprovers.every(id => approvedBy.includes(id))) {
      gate.status = 'approved';
    }

    this.gates.set(gateId, gate);
    return ok(gate);
  }

  getPending(): ApprovalGate[] {
    return [...this.gates.values()].filter(g => g.status === 'pending');
  }

  getByStakes(stakes: ApprovalGate['stakes']): ApprovalGate[] {
    return [...this.gates.values()].filter(g => g.stakes === stakes);
  }
}

// ─── Provenance Tracker ───────────────────────────────────────────────────────

export class ProvenanceTracker {
  private provenances = new Map<string, DecisionProvenance>();

  record(provenance: DecisionProvenance): void {
    this.provenances.set(provenance.decisionId, provenance);
  }

  get(decisionId: string): DecisionProvenance | undefined {
    return this.provenances.get(decisionId);
  }

  buildProvenance(params: {
    decisionId: string;
    finalRecommendation: string;
    nodes: ProvenanceNode[];
  }): DecisionProvenance {
    const rootCauses = params.nodes
      .filter(n => n.inputs.length === 0)
      .map(n => n.nodeId);

    const humanInterventions = params.nodes
      .filter(n => n.type === 'human_input')
      .map(n => n.nodeId);

    // Critical path: highest-confidence chain from root to output
    const criticalPath = this.findCriticalPath(params.nodes);

    // Deterministic hash of the provenance graph
    const auditHash = this.hashProvenance(params.nodes);

    const provenance: DecisionProvenance = {
      decisionId: params.decisionId,
      finalRecommendation: params.finalRecommendation,
      nodes: params.nodes,
      rootCauses,
      criticalPath,
      humanInterventions,
      auditHash,
    };

    this.provenances.set(params.decisionId, provenance);
    return provenance;
  }

  private findCriticalPath(nodes: ProvenanceNode[]): string[] {
    // Greedy: follow highest-confidence edges from root to leaf
    const roots = nodes.filter(n => n.inputs.length === 0);
    if (roots.length === 0) return [];

    const path: string[] = [];
    let current = roots.reduce((best, n) => n.confidence > best.confidence ? n : best, roots[0]);
    const visited = new Set<string>();

    while (current && !visited.has(current.nodeId)) {
      path.push(current.nodeId);
      visited.add(current.nodeId);
      const next = nodes
        .filter(n => n.inputs.includes(current.nodeId))
        .sort((a, b) => b.confidence - a.confidence)[0];
      if (!next) break;
      current = next;
    }

    return path;
  }

  private hashProvenance(nodes: ProvenanceNode[]): string {
    // Deterministic string hash (production: SHA-256 via Web Crypto)
    const str = JSON.stringify(nodes.map(n => ({ id: n.nodeId, type: n.type, confidence: n.confidence })));
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

// ─── Override Registry ────────────────────────────────────────────────────────

export class OverrideRegistry {
  private overrides: HumanOverride[] = [];

  record(override: HumanOverride): void {
    this.overrides.push(override);
  }

  acknowledge(overrideId: string): Result<void, AIError> {
    const override = this.overrides.find(o => o.overrideId === overrideId);
    if (!override) return err(new AIError(`Override ${overrideId} not found`, 'NOT_FOUND', 'multi-agent'));
    override.acknowledged = true;
    return ok(undefined);
  }

  getUnacknowledged(): HumanOverride[] {
    return this.overrides.filter(o => !o.acknowledged);
  }

  getLearningSignals(): { domain: string; signal: number }[] {
    return this.overrides.map(o => ({
      domain: o.recommendationId.split('-')[0] ?? 'unknown',
      signal: o.learningSignal,
    }));
  }

  stats(): { total: number; unacknowledged: number; avgLearningSignal: number } {
    const signals = this.overrides.map(o => o.learningSignal);
    return {
      total: this.overrides.length,
      unacknowledged: this.getUnacknowledged().length,
      avgLearningSignal: signals.length > 0 ? signals.reduce((a, b) => a + b, 0) / signals.length : 0,
    };
  }
}

// ─── Human Collaboration Layer ────────────────────────────────────────────────

export class HumanCollaborationLayer {
  readonly explainability = new ExplainabilityEngine();
  readonly approvalGates  = new ApprovalGateManager();
  readonly provenance     = new ProvenanceTracker();
  readonly overrides      = new OverrideRegistry();

  /**
   * Full human collaboration pipeline for a high-stakes recommendation.
   * 1. Generate explanation
   * 2. Build provenance graph
   * 3. Create approval gate if stakes warrant it
   */
  prepareForHuman(params: {
    recommendationId: string;
    agentId: AgentId;
    domain: string;
    action: string;
    stakes: ApprovalGate['stakes'];
    summary: string;
    reasoning: string[];
    evidence: Evidence[];
    confidence: Confidence;
    alternatives?: Alternative[];
    provenanceNodes?: ProvenanceNode[];
    requiredApprovers?: string[];
  }): {
    explanation: Explanation;
    provenance?: DecisionProvenance;
    gate?: ApprovalGate;
    requiresApproval: boolean;
  } {
    const explanation = this.explainability.explain({
      recommendationId: params.recommendationId,
      agentId: params.agentId,
      summary: params.summary,
      reasoning: params.reasoning,
      evidence: params.evidence,
      confidence: params.confidence,
      alternatives: params.alternatives,
    });

    let provenance: DecisionProvenance | undefined;
    if (params.provenanceNodes && params.provenanceNodes.length > 0) {
      provenance = this.provenance.buildProvenance({
        decisionId: params.recommendationId,
        finalRecommendation: params.summary,
        nodes: params.provenanceNodes,
      });
    }

    const requiresApproval = params.stakes !== 'low' || params.confidence < 0.7;
    let gate: ApprovalGate | undefined;

    if (requiresApproval) {
      gate = this.approvalGates.create({
        recommendationId: params.recommendationId,
        agentId: params.agentId,
        domain: params.domain,
        action: params.action,
        stakes: params.stakes,
        explanation,
        requiredApprovers: params.requiredApprovers ?? [],
      });
    }

    return { explanation, provenance, gate, requiresApproval };
  }

  /**
   * Dashboard summary for human operators.
   */
  operatorDashboard(): {
    pendingApprovals: number;
    civilizationalStakesPending: number;
    unacknowledgedOverrides: number;
    avgConfidenceOfPendingDecisions: number;
    recentOverrideSignal: number;
  } {
    const pending = this.approvalGates.getPending();
    const civilizational = this.approvalGates.getByStakes('civilizational').filter(g => g.status === 'pending');
    const overrideStats = this.overrides.stats();

    const avgConfidence = pending.length > 0
      ? pending.reduce((s, g) => s + g.explanation.confidence, 0) / pending.length
      : 1;

    return {
      pendingApprovals: pending.length,
      civilizationalStakesPending: civilizational.length,
      unacknowledgedOverrides: overrideStats.unacknowledged,
      avgConfidenceOfPendingDecisions: avgConfidence,
      recentOverrideSignal: overrideStats.avgLearningSignal,
    };
  }
}
