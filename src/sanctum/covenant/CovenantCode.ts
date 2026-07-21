/**
 * Atlas Sanctum — The Covenant Code: Constitutional Operating System
 *
 * Master orchestrator that wires all six covenant layers into a unified
 * constitutional intelligence platform.
 *
 * Architecture:
 *   Covenant I   → Creation      (Purpose Layer)
 *   Covenant II  → Preservation  (Resilience Layer)
 *   Covenant III → Multiplication (Innovation Layer)  [registry hooks]
 *   Covenant IV  → Justice       (Governance Layer)
 *   Covenant V   → Leadership    (Institution Layer)  [registry hooks]
 *   Covenant VI  → Renewal       (Learning Layer)
 *
 * Every AI action passes through the Constitutional Pre-Flight before execution.
 * Every covenant is version-controlled and publicly auditable.
 * The constitution evolves through approved amendments, never arbitrary change.
 */

import { CovenantRegistry }                                    from './CovenantRegistry';
import { MissionRegistry, StewardshipRegistry, PurposeEngine } from './CovenantI_Creation';
import { ResilienceRegistry, ContinuityProtocol, AdaptiveRecoveryEngine } from './CovenantII_Preservation';
import { ConstitutionalRuleEngine, ExplainabilityPipeline, AppealsSystem, ActionContext } from './CovenantIV_Justice';
import { ReflectionEngine, InstitutionalLearningRegistry, ConstitutionalVersionControl, PolicyEvolutionEngine } from './CovenantVI_Renewal';
import {
  Covenant, CovenantId, CovenantLayer, ParticipantId, AuthorityId,
  ConstitutionalVerdict, EpochMs,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Covenant Code Configuration ─────────────────────────────────────────────

export interface CovenantCodeConfig {
  strictMode: boolean;           // if true, soft violations also block execution
  auditAllActions: boolean;      // if true, every action is logged regardless of outcome
  reflectionCycleWeeks: number;
  defaultAuthority: AuthorityId;
}

export const DEFAULT_COVENANT_CONFIG: CovenantCodeConfig = {
  strictMode: false,
  auditAllActions: true,
  reflectionCycleWeeks: 4,
  defaultAuthority: 'atlas-sanctum-council' as AuthorityId,
};

// ─── Constitutional Action Request ───────────────────────────────────────────

export interface ConstitutionalActionRequest {
  agentId: string;
  agentType: ActionContext['agentType'];
  actionType: string;
  payload: Record<string, unknown>;
  covenantId?: CovenantId;
  requestedBy?: ParticipantId;
}

export interface ConstitutionalActionResult {
  permitted: boolean;
  verdict: ConstitutionalVerdict;
  explainability: ReturnType<ExplainabilityPipeline['generate']>;
  auditEntryId: string;
  timestamp: EpochMs;
}

// ─── The Covenant Code ────────────────────────────────────────────────────────

export class CovenantCode {
  // Six Covenant Layers
  readonly registry:      CovenantRegistry;

  // Covenant I — Creation
  readonly missions:      MissionRegistry;
  readonly stewardship:   StewardshipRegistry;
  readonly purpose:       PurposeEngine;

  // Covenant II — Preservation
  readonly resilience:    ResilienceRegistry;
  readonly continuity:    ContinuityProtocol;
  readonly recovery:      AdaptiveRecoveryEngine;

  // Covenant IV — Justice
  readonly constitution:  ConstitutionalRuleEngine;
  readonly explainability: ExplainabilityPipeline;
  readonly appeals:       AppealsSystem;

  // Covenant VI — Renewal
  readonly reflection:    ReflectionEngine;
  readonly learnings:     InstitutionalLearningRegistry;
  readonly versionControl: ConstitutionalVersionControl;
  readonly policyEngine:  PolicyEvolutionEngine;

  private readonly config: CovenantCodeConfig;
  private auditLog: { entryId: string; context: ActionContext; verdict: ConstitutionalVerdict; timestamp: EpochMs }[] = [];

  constructor(config: Partial<CovenantCodeConfig> = {}) {
    this.config = { ...DEFAULT_COVENANT_CONFIG, ...config };

    this.registry       = new CovenantRegistry();
    this.missions       = new MissionRegistry();
    this.stewardship    = new StewardshipRegistry();
    this.purpose        = new PurposeEngine(this.missions, this.stewardship, new Map());
    this.resilience     = new ResilienceRegistry();
    this.continuity     = new ContinuityProtocol();
    this.recovery       = new AdaptiveRecoveryEngine();
    this.constitution   = new ConstitutionalRuleEngine();
    this.explainability = new ExplainabilityPipeline();
    this.appeals        = new AppealsSystem();
    this.reflection     = new ReflectionEngine();
    this.learnings      = new InstitutionalLearningRegistry();
    this.versionControl = new ConstitutionalVersionControl();
    this.policyEngine   = new PolicyEvolutionEngine();

    // Wire covenant lifecycle events to the audit log
    this.registry.on(event => {
      if (event.type === 'audited') return; // avoid recursion
      this.auditLog.push({
        entryId: `covenant-event-${Date.now()}`,
        context: {
          agentId: 'covenant-registry',
          agentType: 'autonomous_system',
          actionType: event.type,
          payload: { covenantId: event.covenantId },
          timestamp: event.timestamp,
        },
        verdict: {
          permitted: true,
          preFlight: {
            identityVerified: true, authorityVerified: true, purposeValid: true,
            rightsProtected: true, obligationsFulfilled: true, publicGoodIncreased: true,
            environmentalImpactAcceptable: true, transparencyMaintained: true,
            decisionExplainable: true, auditTrailCreated: true, restorationPossible: true,
          },
          failedChecks: [],
          constitutionalReasoning: `Covenant lifecycle event: ${event.type}`,
          correctiveActions: [],
          covenantRef: event.covenantId,
          timestamp: event.timestamp,
        },
        timestamp: event.timestamp,
      });
    });
  }

  // ─── Primary Entry Point ──────────────────────────────────────────────────
  // Every AI action must pass through this gate.

  evaluate(request: ConstitutionalActionRequest): ConstitutionalActionResult {
    const covenantId = request.covenantId ?? ('unbound' as CovenantId);
    const context: ActionContext = {
      agentId: request.agentId,
      agentType: request.agentType,
      actionType: request.actionType,
      payload: request.payload,
      covenantId,
      requestedBy: request.requestedBy,
      timestamp: Date.now() as EpochMs,
    };

    // Run all 11 constitutional checks
    const verdict = this.constitution.evaluate(context, covenantId);

    // Generate explainability record
    const explainability = this.explainability.generate(context, verdict);

    // Strict mode: soft violations also block
    const finalPermitted = this.config.strictMode
      ? verdict.failedChecks.length === 0
      : verdict.permitted;

    const finalVerdict = { ...verdict, permitted: finalPermitted };

    // Audit every action if configured
    const entryId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (this.config.auditAllActions) {
      this.auditLog.push({ entryId, context, verdict: finalVerdict, timestamp: context.timestamp });
    }

    return {
      permitted: finalPermitted,
      verdict: finalVerdict,
      explainability,
      auditEntryId: entryId,
      timestamp: context.timestamp,
    };
  }

  // ─── Covenant Binding ─────────────────────────────────────────────────────

  bind(covenant: Covenant): CovenantResult<Covenant> {
    return this.registry.register(covenant);
  }

  // ─── Constitutional Health ────────────────────────────────────────────────

  healthReport(): {
    covenants: ReturnType<CovenantRegistry['healthReport']>;
    pendingAppeals: number;
    unappliedLearnings: number;
    untestedResilienceEntities: number;
    activeIncidents: number;
    recentAuditEntries: number;
    constitutionalIntegrity: number; // 0–1
  } {
    const covenants = this.registry.healthReport();
    const pendingAppeals = this.appeals.getPending().length;
    const unappliedLearnings = this.learnings.unappliedCount();
    const untestedResilienceEntities = this.resilience.getUntestedEntities().length;
    const activeIncidents = this.continuity.activeCount();
    const recentAuditEntries = this.auditLog.filter(
      e => e.timestamp > (Date.now() - 86_400_000) as EpochMs
    ).length;

    // Integrity score: penalize for violations, appeals, unapplied learnings
    const penaltyFactors = [
      covenants.criticalViolations * 0.1,
      pendingAppeals * 0.02,
      unappliedLearnings * 0.01,
      untestedResilienceEntities * 0.02,
    ];
    const constitutionalIntegrity = Math.max(0, 1 - penaltyFactors.reduce((s, p) => s + p, 0));

    return {
      covenants,
      pendingAppeals,
      unappliedLearnings,
      untestedResilienceEntities,
      activeIncidents,
      recentAuditEntries,
      constitutionalIntegrity,
    };
  }

  // ─── Audit Access ─────────────────────────────────────────────────────────

  getAuditLog(filter?: { agentId?: string; permitted?: boolean; windowHours?: number }) {
    let entries = this.auditLog;
    if (filter?.agentId)    entries = entries.filter(e => e.context.agentId === filter.agentId);
    if (filter?.permitted !== undefined) entries = entries.filter(e => e.verdict.permitted === filter.permitted);
    if (filter?.windowHours) {
      const cutoff = Date.now() - filter.windowHours * 3_600_000;
      entries = entries.filter(e => e.timestamp >= cutoff);
    }
    return entries;
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const TheCovenantCode = new CovenantCode();

export default TheCovenantCode;
