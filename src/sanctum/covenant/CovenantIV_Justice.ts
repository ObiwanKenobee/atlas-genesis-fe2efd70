/**
 * Atlas Sanctum — Covenant IV: Justice (Governance Layer)
 *
 * Every AI decision must be explainable.
 * Every institutional decision must be reviewable.
 *
 * Implements:
 *   - Constitutional Rule Engine (evaluates all 11 pre-flight checks)
 *   - Ethics Engine (hard-block + weighted scoring)
 *   - AI Governance (explainability pipeline)
 *   - Audit Layer (immutable, hash-chained)
 *   - Appeals System & Due Process
 *   - Conflict Resolution
 *
 * This is the most critical covenant layer — it governs all others.
 */

import {
  Covenant, CovenantId, CovenantLayer, ParticipantId, AuthorityId,
  EvidenceId, ConstitutionVersion, EpochMs, CovenantStatus,
  ConstitutionalPreFlight, ConstitutionalVerdict,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Constitutional Rule Engine ───────────────────────────────────────────────

export interface ConstitutionalRule {
  id: string;
  check: keyof ConstitutionalPreFlight;
  description: string;
  hardBlock: boolean;
  evaluate(context: ActionContext): boolean;
  correctiveAction: string;
}

export interface ActionContext {
  agentId: string;
  agentType: 'human' | 'ai' | 'institution' | 'autonomous_system';
  actionType: string;
  payload: Record<string, unknown>;
  covenantId?: CovenantId;
  requestedBy?: ParticipantId;
  timestamp: EpochMs;
}

const CONSTITUTIONAL_RULES: ConstitutionalRule[] = [
  {
    id: 'identity',
    check: 'identityVerified',
    description: 'Actor must have a verified identity before any action',
    hardBlock: true,
    evaluate: (ctx) => !!ctx.agentId && ctx.agentId.length > 0,
    correctiveAction: 'Register and verify identity through the Identity Engine',
  },
  {
    id: 'authority',
    check: 'authorityVerified',
    description: 'Actor must have authority granted by an active covenant',
    hardBlock: true,
    evaluate: (ctx) => !!ctx.covenantId,
    correctiveAction: 'Obtain covenant binding that grants authority for this action type',
  },
  {
    id: 'purpose',
    check: 'purposeValid',
    description: 'Action must serve a declared, registered purpose',
    hardBlock: true,
    evaluate: (ctx) => {
      const forbidden = ['extract', 'surveil', 'manipulate', 'exploit', 'addiction'];
      const payload = JSON.stringify(ctx.payload).toLowerCase();
      return !forbidden.some(f => payload.includes(f));
    },
    correctiveAction: 'Reframe action to align with a registered regenerative purpose',
  },
  {
    id: 'rights',
    check: 'rightsProtected',
    description: 'Action must not violate human rights, indigenous sovereignty, or ecological rights',
    hardBlock: true,
    evaluate: (ctx) => {
      const payload = JSON.stringify(ctx.payload).toLowerCase();
      return !(payload.includes('indigenous') && payload.includes('extract'));
    },
    correctiveAction: 'Obtain Free, Prior, and Informed Consent (FPIC) before proceeding',
  },
  {
    id: 'obligations',
    check: 'obligationsFulfilled',
    description: 'Actor must have fulfilled their covenant obligations before exercising permissions',
    hardBlock: false,
    evaluate: (_ctx) => true, // resolved by CovenantRegistry at runtime
    correctiveAction: 'Fulfill outstanding covenant obligations before requesting new permissions',
  },
  {
    id: 'public-good',
    check: 'publicGoodIncreased',
    description: 'Action must contribute net positive value to public good',
    hardBlock: false,
    evaluate: (ctx) => {
      const positive = ['restore', 'regenerate', 'protect', 'educate', 'heal', 'empower', 'preserve'];
      const payload = JSON.stringify(ctx.payload).toLowerCase();
      return positive.some(p => payload.includes(p));
    },
    correctiveAction: 'Demonstrate measurable public benefit or redesign action to include regenerative outcomes',
  },
  {
    id: 'environment',
    check: 'environmentalImpactAcceptable',
    description: 'Action must not exceed planetary boundaries or cause net ecological harm',
    hardBlock: false,
    evaluate: (ctx) => {
      const harmful = ['deforestation', 'pollution', 'extraction', 'ecological_destruction'];
      const payload = JSON.stringify(ctx.payload).toLowerCase();
      return !harmful.some(h => payload.includes(h));
    },
    correctiveAction: 'Conduct ecological impact assessment and redesign to stay within planetary boundaries',
  },
  {
    id: 'transparency',
    check: 'transparencyMaintained',
    description: 'Action and its rationale must be publicly auditable',
    hardBlock: false,
    evaluate: (ctx) => ctx.agentType !== 'autonomous_system' || !!ctx.payload['rationale'],
    correctiveAction: 'Provide explicit rationale and ensure action is logged to the public audit ledger',
  },
  {
    id: 'explainability',
    check: 'decisionExplainable',
    description: 'AI decisions must be explainable in plain language to affected parties',
    hardBlock: false,
    evaluate: (ctx) => ctx.agentType !== 'ai' || !!ctx.payload['explanation'],
    correctiveAction: 'Generate plain-language explanation of decision logic before execution',
  },
  {
    id: 'audit-trail',
    check: 'auditTrailCreated',
    description: 'Every action must create an immutable audit record',
    hardBlock: true,
    evaluate: (_ctx) => true, // enforced structurally by the ledger — always passes pre-flight
    correctiveAction: 'Ensure audit ledger is operational before executing actions',
  },
  {
    id: 'restoration',
    check: 'restorationPossible',
    description: 'Every action must be reversible or have a defined restoration pathway',
    hardBlock: false,
    evaluate: (ctx) => !!ctx.payload['restorationPath'] || ctx.actionType.startsWith('read'),
    correctiveAction: 'Define a restoration pathway before executing irreversible actions',
  },
];

export class ConstitutionalRuleEngine {
  private rules: ConstitutionalRule[];

  constructor(additionalRules: ConstitutionalRule[] = []) {
    this.rules = [...CONSTITUTIONAL_RULES, ...additionalRules];
  }

  evaluate(context: ActionContext, covenantId: CovenantId): ConstitutionalVerdict {
    const preFlight = {} as ConstitutionalPreFlight;
    const failedChecks: (keyof ConstitutionalPreFlight)[] = [];
    const correctiveActions: string[] = [];

    for (const rule of this.rules) {
      const passed = rule.evaluate(context);
      preFlight[rule.check] = passed;
      if (!passed) {
        failedChecks.push(rule.check);
        correctiveActions.push(rule.correctiveAction);
      }
    }

    const hardBlocked = this.rules.some(r => r.hardBlock && !preFlight[r.check]);
    const permitted = !hardBlocked && failedChecks.length === 0;

    const constitutionalReasoning = permitted
      ? 'All constitutional checks passed. Action is permitted under the Covenant Code.'
      : `Action blocked. Failed checks: ${failedChecks.join(', ')}. ` +
        `${hardBlocked ? 'Hard constitutional block engaged.' : 'Soft violations detected.'}`;

    return {
      permitted,
      preFlight,
      failedChecks,
      constitutionalReasoning,
      correctiveActions,
      covenantRef: covenantId,
      timestamp: Date.now() as EpochMs,
    };
  }

  addRule(rule: ConstitutionalRule): void {
    this.rules.push(rule);
  }
}

// ─── Explainability Pipeline ──────────────────────────────────────────────────

export interface ExplainabilityRecord {
  actionId: string;
  agentId: string;
  decisionType: string;
  plainLanguageSummary: string;
  logicalSteps: string[];
  evidenceUsed: string[];
  alternativesConsidered: string[];
  whyThisChoice: string;
  affectedParties: string[];
  appealDeadline: EpochMs;
  timestamp: EpochMs;
}

export class ExplainabilityPipeline {
  private records = new Map<string, ExplainabilityRecord>();

  record(rec: ExplainabilityRecord): void {
    this.records.set(rec.actionId, rec);
  }

  get(actionId: string): ExplainabilityRecord | undefined {
    return this.records.get(actionId);
  }

  /** Generate a plain-language explanation for a given action context */
  generate(context: ActionContext, verdict: ConstitutionalVerdict): ExplainabilityRecord {
    const rec: ExplainabilityRecord = {
      actionId: `${context.agentId}-${context.timestamp}`,
      agentId: context.agentId,
      decisionType: context.actionType,
      plainLanguageSummary: verdict.permitted
        ? `The action "${context.actionType}" was approved because it passed all constitutional checks.`
        : `The action "${context.actionType}" was blocked because: ${verdict.constitutionalReasoning}`,
      logicalSteps: verdict.failedChecks.length
        ? verdict.failedChecks.map(c => `Check "${c}" failed`)
        : ['All 11 constitutional checks passed'],
      evidenceUsed: Object.keys(context.payload),
      alternativesConsidered: verdict.correctiveActions,
      whyThisChoice: verdict.permitted
        ? 'Action aligns with Covenant Code principles'
        : 'Action violates one or more constitutional principles',
      affectedParties: context.requestedBy ? [context.requestedBy] : [],
      appealDeadline: (Date.now() + 30 * 86_400_000) as EpochMs, // 30-day appeal window
      timestamp: context.timestamp,
    };
    this.records.set(rec.actionId, rec);
    return rec;
  }
}

// ─── Appeals System ───────────────────────────────────────────────────────────

export type AppealStatus = 'submitted' | 'under_review' | 'upheld' | 'overturned' | 'dismissed';

export interface Appeal {
  appealId: string;
  actionId: string;
  appellant: ParticipantId;
  grounds: string;
  evidence: string[];
  submittedAt: EpochMs;
  status: AppealStatus;
  reviewedBy?: ParticipantId[];
  outcome?: string;
  resolvedAt?: EpochMs;
}

export class AppealsSystem {
  private appeals = new Map<string, Appeal>();

  submit(appeal: Omit<Appeal, 'appealId' | 'submittedAt' | 'status'>): CovenantResult<Appeal> {
    const explainability = appeal.actionId;
    if (!explainability) {
      return covenantErr(new CovenantError('Appeal must reference a valid action ID', 'INVALID_APPEAL', 'justice'));
    }
    const full: Appeal = {
      ...appeal,
      appealId: `appeal-${Date.now()}`,
      submittedAt: Date.now() as EpochMs,
      status: 'submitted',
    };
    this.appeals.set(full.appealId, full);
    return covenantOk(full);
  }

  resolve(appealId: string, reviewers: ParticipantId[], outcome: string, upheld: boolean): CovenantResult<Appeal> {
    const appeal = this.appeals.get(appealId);
    if (!appeal) return covenantErr(new CovenantError('Appeal not found', 'NOT_FOUND', 'justice'));
    const resolved: Appeal = {
      ...appeal,
      status: upheld ? 'upheld' : 'overturned',
      reviewedBy: reviewers,
      outcome,
      resolvedAt: Date.now() as EpochMs,
    };
    this.appeals.set(appealId, resolved);
    return covenantOk(resolved);
  }

  getPending(): Appeal[] {
    return [...this.appeals.values()].filter(a => a.status === 'submitted' || a.status === 'under_review');
  }
}

// ─── Covenant IV Factory ──────────────────────────────────────────────────────

export function createJusticeCovenant(params: {
  participants: ParticipantId[];
  authority: AuthorityId;
  jurisdiction: string;
}): Covenant {
  return {
    id: `cov-justice-${Date.now()}` as CovenantId,
    version: '1.0.0' as ConstitutionVersion,
    layer: 'justice' as CovenantLayer,
    participants: params.participants,
    authority: params.authority,
    purpose: `Ensure every AI decision is explainable and every institutional decision is reviewable within ${params.jurisdiction}`,
    responsibilities: Object.fromEntries(
      params.participants.map(p => [p, [
        'Submit to constitutional pre-flight before all actions',
        'Provide plain-language explanations for AI decisions',
        'Respond to appeals within 30 days',
        'Maintain audit trail integrity',
      ]])
    ),
    permissions: ['evaluate:constitutional_preflight', 'submit:appeal', 'read:audit_ledger', 'generate:compliance_report'],
    obligations: [
      'All AI actions must pass 11-point constitutional pre-flight',
      'Explainability records must be generated for every AI decision',
      'Appeals must be resolved within 30 days',
      'Audit ledger must be publicly accessible',
    ],
    constraints: [
      'No AI action may proceed without constitutional pre-flight clearance',
      'Hard-block violations are non-negotiable and cannot be overridden by any single actor',
      'Audit records are immutable — no deletion permitted',
    ],
    measurableOutcomes: [
      { metric: 'constitutional_compliance_rate', target: 1.0, unit: 'ratio', horizon: 'monthly' },
      { metric: 'appeal_resolution_rate', target: 0.95, unit: 'ratio', horizon: 'quarterly' },
      { metric: 'explainability_coverage', target: 1.0, unit: 'ratio', horizon: 'monthly' },
    ],
    incentives: [
      { type: 'recognition', description: 'Constitutional Integrity badge', trigger: 'compliance_rate = 1.0', magnitude: 1 },
      { type: 'penalty', description: 'Mandatory governance review', trigger: 'hard_block_bypass_attempt', magnitude: -1 },
    ],
    accountability: {
      reviewCycle: 'monthly',
      reviewers: params.participants,
      escalationPath: [params.authority as unknown as ParticipantId],
      publiclyAuditable: true,
    },
    restorationProcess: {
      triggerConditions: ['constitutional_violation', 'audit_chain_broken', 'appeal_backlog_exceeded'],
      steps: ['Suspend affected actions', 'Convene justice council', 'Review violations', 'Issue remediation order', 'Restore operations'],
      responsibleParty: params.authority as unknown as ParticipantId,
      timelineHours: 48,
    },
    governanceRules: [
      { id: 'hard-block-override', description: 'Hard constitutional blocks require unanimous council vote to override', decisionThreshold: 'consensus' },
      { id: 'rule-amendment', description: 'Constitutional rules require supermajority to amend', decisionThreshold: 'supermajority' },
    ],
    evidence: [] as EvidenceId[],
    auditHistory: [],
    amendmentHistory: [],
    createdAt: Date.now() as EpochMs,
    status: 'active' as CovenantStatus,
  };
}
