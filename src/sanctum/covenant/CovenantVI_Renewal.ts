/**
 * Atlas Sanctum — Covenant VI: Renewal (Learning Layer)
 *
 * Every failure becomes institutional learning.
 * The constitution itself evolves through versioned amendments.
 *
 * Implements:
 *   - Reflection Engine (structured retrospectives)
 *   - Institutional Learning Registry
 *   - Constitutional Version Control (git-like amendment history)
 *   - Policy Evolution Engine
 *   - Human Feedback Integration
 *   - Continuous Improvement Protocol
 */

import {
  Covenant, CovenantId, CovenantLayer, ParticipantId, AuthorityId,
  EvidenceId, ConstitutionVersion, EpochMs, CovenantStatus, Amendment,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Reflection Engine ────────────────────────────────────────────────────────

export type ReflectionTrigger =
  | 'incident'
  | 'milestone'
  | 'periodic'
  | 'constitutional_amendment'
  | 'stakeholder_feedback'
  | 'performance_degradation';

export interface ReflectionSession {
  sessionId: string;
  trigger: ReflectionTrigger;
  participants: ParticipantId[];
  period: { from: EpochMs; to: EpochMs };
  whatWorked: string[];
  whatFailed: string[];
  rootCauses: string[];
  systemicPatterns: string[];
  proposedChanges: ProposedChange[];
  conductedAt: EpochMs;
  facilitator: ParticipantId;
}

export interface ProposedChange {
  changeId: string;
  target: 'covenant' | 'policy' | 'ai_rule' | 'process' | 'metric';
  targetId: string;
  description: string;
  rationale: string;
  expectedOutcome: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  proposedBy: ParticipantId;
}

export class ReflectionEngine {
  private sessions: ReflectionSession[] = [];

  conduct(session: ReflectionSession): CovenantResult<ReflectionSession> {
    if (!session.participants.length) {
      return covenantErr(new CovenantError(
        'Reflection session requires at least one participant',
        'INVALID_SESSION', 'renewal',
      ));
    }
    this.sessions.push(session);
    return covenantOk(session);
  }

  /** Aggregate proposed changes across all sessions, ranked by frequency */
  aggregateProposals(): ProposedChange[] {
    const all = this.sessions.flatMap(s => s.proposedChanges);
    const freq = new Map<string, { change: ProposedChange; count: number }>();
    all.forEach(c => {
      const key = `${c.target}::${c.targetId}::${c.description}`;
      const existing = freq.get(key);
      freq.set(key, existing ? { ...existing, count: existing.count + 1 } : { change: c, count: 1 });
    });
    return [...freq.values()]
      .sort((a, b) => b.count - a.count)
      .map(v => v.change);
  }

  getByTrigger(trigger: ReflectionTrigger): ReflectionSession[] {
    return this.sessions.filter(s => s.trigger === trigger);
  }

  recentSessions(windowDays = 90): ReflectionSession[] {
    const cutoff = (Date.now() - windowDays * 86_400_000) as EpochMs;
    return this.sessions.filter(s => s.conductedAt >= cutoff);
  }
}

// ─── Institutional Learning Registry ─────────────────────────────────────────

export interface LearningRecord {
  learningId: string;
  source: 'incident' | 'research' | 'community_feedback' | 'ai_observation' | 'external_audit';
  domain: string;
  insight: string;
  evidence: string[];
  applicableTo: string[];   // covenant IDs, policy IDs, or agent IDs
  confidence: number;       // 0–1
  appliedAt?: EpochMs;
  appliedTo?: string[];
  registeredAt: EpochMs;
}

export class InstitutionalLearningRegistry {
  private learnings: LearningRecord[] = [];

  register(learning: LearningRecord): void {
    this.learnings.push(learning);
  }

  getApplicable(targetId: string): LearningRecord[] {
    return this.learnings.filter(l => l.applicableTo.includes(targetId) && !l.appliedAt);
  }

  markApplied(learningId: string, appliedTo: string[]): CovenantResult<LearningRecord> {
    const idx = this.learnings.findIndex(l => l.learningId === learningId);
    if (idx === -1) return covenantErr(new CovenantError('Learning not found', 'NOT_FOUND', 'renewal'));
    this.learnings[idx] = { ...this.learnings[idx], appliedAt: Date.now() as EpochMs, appliedTo };
    return covenantOk(this.learnings[idx]);
  }

  unappliedCount(): number {
    return this.learnings.filter(l => !l.appliedAt).length;
  }

  all(): LearningRecord[] { return this.learnings; }
}

// ─── Constitutional Version Control ──────────────────────────────────────────
// The constitution evolves through versioned, approved amendments.
// Nothing changes without constitutional review.

export interface ConstitutionSnapshot {
  version: ConstitutionVersion;
  covenantId: CovenantId;
  snapshot: Record<string, unknown>;
  takenAt: EpochMs;
  takenBy: ParticipantId;
  changeLog: string;
}

export class ConstitutionalVersionControl {
  private history = new Map<CovenantId, ConstitutionSnapshot[]>();

  /** Take a snapshot before any amendment */
  snapshot(covenantId: CovenantId, covenant: Record<string, unknown>, takenBy: ParticipantId, changeLog: string): ConstitutionSnapshot {
    const existing = this.history.get(covenantId) ?? [];
    const snap: ConstitutionSnapshot = {
      version: `${existing.length + 1}.0.0` as ConstitutionVersion,
      covenantId,
      snapshot: structuredClone(covenant),
      takenAt: Date.now() as EpochMs,
      takenBy,
      changeLog,
    };
    this.history.set(covenantId, [...existing, snap]);
    return snap;
  }

  /** Propose an amendment — requires approval before application */
  proposeAmendment(params: {
    covenantId: CovenantId;
    proposedBy: ParticipantId;
    rationale: string;
    diff: string;
  }): Amendment {
    const existing = this.history.get(params.covenantId) ?? [];
    const nextVersion = `${existing.length + 1}.0.0` as ConstitutionVersion;
    return {
      version: nextVersion,
      proposedBy: params.proposedBy,
      rationale: params.rationale,
      approvedBy: [],
      appliedAt: 0 as EpochMs,
      diff: params.diff,
    };
  }

  getHistory(covenantId: CovenantId): ConstitutionSnapshot[] {
    return this.history.get(covenantId) ?? [];
  }

  rollback(covenantId: CovenantId, toVersion: ConstitutionVersion): CovenantResult<ConstitutionSnapshot> {
    const history = this.history.get(covenantId) ?? [];
    const target = history.find(s => s.version === toVersion);
    if (!target) return covenantErr(new CovenantError(`Version ${toVersion} not found`, 'VERSION_NOT_FOUND', 'renewal', covenantId));
    return covenantOk(target);
  }
}

// ─── Policy Evolution Engine ──────────────────────────────────────────────────

export interface PolicyVersion {
  policyId: string;
  version: ConstitutionVersion;
  content: string;
  rationale: string;
  performanceMetrics: Record<string, number>;
  supersedes?: ConstitutionVersion;
  effectiveAt: EpochMs;
  expiresAt?: EpochMs;
  approvedBy: ParticipantId[];
}

export class PolicyEvolutionEngine {
  private policies = new Map<string, PolicyVersion[]>();

  publish(policy: PolicyVersion): CovenantResult<PolicyVersion> {
    if (!policy.approvedBy.length) {
      return covenantErr(new CovenantError(
        'Policy must be approved before publication',
        'UNAPPROVED_POLICY', 'renewal',
      ));
    }
    const existing = this.policies.get(policy.policyId) ?? [];
    this.policies.set(policy.policyId, [...existing, policy]);
    return covenantOk(policy);
  }

  current(policyId: string): PolicyVersion | undefined {
    const versions = this.policies.get(policyId) ?? [];
    const now = Date.now();
    return versions
      .filter(v => v.effectiveAt <= now && (!v.expiresAt || v.expiresAt > now))
      .at(-1);
  }

  history(policyId: string): PolicyVersion[] {
    return this.policies.get(policyId) ?? [];
  }

  /** Policies whose performance metrics have degraded below threshold */
  getPoliciesNeedingReview(threshold = 0.7): PolicyVersion[] {
    const result: PolicyVersion[] = [];
    this.policies.forEach(versions => {
      const latest = versions.at(-1);
      if (!latest) return;
      const avgPerf = Object.values(latest.performanceMetrics).reduce((s, v) => s + v, 0) /
        Math.max(1, Object.values(latest.performanceMetrics).length);
      if (avgPerf < threshold) result.push(latest);
    });
    return result;
  }
}

// ─── Covenant VI Factory ──────────────────────────────────────────────────────

export function createRenewalCovenant(params: {
  participants: ParticipantId[];
  authority: AuthorityId;
  reflectionCycleWeeks: number;
}): Covenant {
  return {
    id: `cov-renewal-${Date.now()}` as CovenantId,
    version: '1.0.0' as ConstitutionVersion,
    layer: 'renewal' as CovenantLayer,
    participants: params.participants,
    authority: params.authority,
    purpose: 'Transform every failure into institutional learning and evolve the constitution through versioned, approved amendments',
    responsibilities: Object.fromEntries(
      params.participants.map(p => [p, [
        `Participate in reflection sessions every ${params.reflectionCycleWeeks} weeks`,
        'Register learnings within 7 days of any incident',
        'Review and vote on proposed constitutional amendments',
        'Apply approved learnings within 30 days',
      ]])
    ),
    permissions: ['conduct:reflection', 'register:learning', 'propose:amendment', 'publish:policy'],
    obligations: [
      `Conduct structured reflection every ${params.reflectionCycleWeeks} weeks`,
      'No amendment may be applied without version snapshot and approval',
      'All learnings must be registered in the institutional registry',
      'Policy evolution must be evidence-based',
    ],
    constraints: [
      'Constitutional rollback requires supermajority approval',
      'Amendments that weaken hard-block rules require unanimous consent',
      'Learning records are permanent — no deletion permitted',
    ],
    measurableOutcomes: [
      { metric: 'learning_application_rate', target: 0.9, unit: 'ratio', horizon: 'quarterly' },
      { metric: 'reflection_participation_rate', target: 0.8, unit: 'ratio', horizon: 'quarterly' },
      { metric: 'policy_performance_avg', target: 0.8, unit: 'score', horizon: 'annual' },
    ],
    incentives: [
      { type: 'recognition', description: 'Institutional Learning Champion', trigger: 'learning_application_rate > 0.95', magnitude: 1 },
    ],
    accountability: {
      reviewCycle: 'quarterly',
      reviewers: params.participants,
      escalationPath: [params.authority as unknown as ParticipantId],
      publiclyAuditable: true,
    },
    restorationProcess: {
      triggerConditions: ['learning_backlog_exceeded', 'policy_performance_degraded', 'reflection_skipped'],
      steps: ['Convene emergency reflection session', 'Triage unapplied learnings', 'Fast-track critical amendments', 'Restore normal cycle'],
      responsibleParty: params.authority as unknown as ParticipantId,
      timelineHours: 168, // 1 week
    },
    governanceRules: [
      { id: 'amendment-approval', description: 'Amendments require supermajority of covenant participants', decisionThreshold: 'supermajority' },
      { id: 'hard-block-weakening', description: 'Weakening hard-block rules requires unanimous consent', decisionThreshold: 'consensus' },
    ],
    evidence: [] as EvidenceId[],
    auditHistory: [],
    amendmentHistory: [],
    createdAt: Date.now() as EpochMs,
    status: 'active' as CovenantStatus,
  };
}
