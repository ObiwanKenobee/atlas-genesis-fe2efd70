/**
 * Atlas Sanctum — The Covenant Code
 * Constitutional Type System
 *
 * Every relationship, object, and AI action in Atlas Sanctum inherits from
 * the Universal Covenant Object. Nothing changes without constitutional review.
 * Every decision is explainable. Every institution is auditable.
 *
 * Six Covenant Layers:
 *   I   — Creation      (Purpose)
 *   II  — Preservation  (Resilience)
 *   III — Multiplication (Innovation)
 *   IV  — Justice       (Governance)
 *   V   — Leadership    (Institution)
 *   VI  — Renewal       (Learning)
 */

// ─── Branded Primitives ───────────────────────────────────────────────────────

export type CovenantId          = string & { readonly _brand: 'CovenantId' };
export type ParticipantId       = string & { readonly _brand: 'ParticipantId' };
export type AuthorityId         = string & { readonly _brand: 'AuthorityId' };
export type EvidenceId          = string & { readonly _brand: 'EvidenceId' };
export type ConstitutionVersion = string & { readonly _brand: 'ConstitutionVersion' };
export type EpochMs             = number & { readonly _brand: 'EpochMs' };

// ─── Covenant Layer ───────────────────────────────────────────────────────────

export type CovenantLayer =
  | 'creation'        // Covenant I   — Purpose Layer
  | 'preservation'    // Covenant II  — Resilience Layer
  | 'multiplication'  // Covenant III — Innovation Layer
  | 'justice'         // Covenant IV  — Governance Layer
  | 'leadership'      // Covenant V   — Institution Layer
  | 'renewal';        // Covenant VI  — Learning Layer

// ─── Universal Covenant Object ────────────────────────────────────────────────
// Every relationship in Atlas Sanctum inherits from this.
// Nothing changes without constitutional review.

export interface Covenant {
  readonly id: CovenantId;
  readonly version: ConstitutionVersion;
  readonly layer: CovenantLayer;
  readonly participants: ParticipantId[];
  readonly authority: AuthorityId;
  readonly purpose: string;
  readonly responsibilities: Record<string, string[]>;
  readonly permissions: string[];
  readonly obligations: string[];
  readonly constraints: string[];
  readonly measurableOutcomes: MeasurableOutcome[];
  readonly incentives: Incentive[];
  readonly accountability: AccountabilityMechanism;
  readonly restorationProcess: RestorationProcess;
  readonly governanceRules: GovernanceRule[];
  readonly evidence: EvidenceId[];
  readonly auditHistory: AuditRecord[];
  readonly amendmentHistory: Amendment[];
  readonly createdAt: EpochMs;
  readonly expiresAt?: EpochMs;
  readonly status: CovenantStatus;
}

export type CovenantStatus =
  | 'draft'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'amended'
  | 'terminated';

export interface MeasurableOutcome {
  metric: string;
  target: number;
  unit: string;
  horizon: 'immediate' | '1y' | '5y' | '25y' | '7gen';
  currentValue?: number;
}

export interface Incentive {
  type: 'reward' | 'recognition' | 'access' | 'penalty';
  description: string;
  trigger: string;
  magnitude: number;
}

export interface AccountabilityMechanism {
  reviewCycle: 'monthly' | 'quarterly' | 'annual' | 'event-driven';
  reviewers: ParticipantId[];
  escalationPath: ParticipantId[];
  publiclyAuditable: boolean;
}

export interface RestorationProcess {
  triggerConditions: string[];
  steps: string[];
  responsibleParty: ParticipantId;
  timelineHours: number;
}

export interface GovernanceRule {
  id: string;
  description: string;
  decisionThreshold: 'simple' | 'supermajority' | 'consensus' | 'veto';
  vetoHolders?: ParticipantId[];
}

export interface AuditRecord {
  timestamp: EpochMs;
  auditor: ParticipantId;
  finding: string;
  severity: 'info' | 'warning' | 'violation' | 'critical';
  resolved: boolean;
}

export interface Amendment {
  version: ConstitutionVersion;
  proposedBy: ParticipantId;
  rationale: string;
  approvedBy: ParticipantId[];
  appliedAt: EpochMs;
  diff: string;
}

// ─── AI Constitutional Pre-Flight ─────────────────────────────────────────────
// Every AI agent action must pass all 11 checks before execution.
// If any check fails: reject, produce constitutional reasoning, recommend corrections.

export interface ConstitutionalPreFlight {
  identityVerified: boolean;
  authorityVerified: boolean;
  purposeValid: boolean;
  rightsProtected: boolean;
  obligationsFulfilled: boolean;
  publicGoodIncreased: boolean;
  environmentalImpactAcceptable: boolean;
  transparencyMaintained: boolean;
  decisionExplainable: boolean;
  auditTrailCreated: boolean;
  restorationPossible: boolean;
}

export interface ConstitutionalVerdict {
  permitted: boolean;
  preFlight: ConstitutionalPreFlight;
  failedChecks: (keyof ConstitutionalPreFlight)[];
  constitutionalReasoning: string;
  correctiveActions: string[];
  covenantRef: CovenantId;
  timestamp: EpochMs;
}

// ─── Result Type ──────────────────────────────────────────────────────────────

export type CovenantResult<T> =
  | { ok: true;  value: T }
  | { ok: false; error: CovenantError };

export class CovenantError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly layer: CovenantLayer,
    public readonly covenantId?: CovenantId,
    public readonly recoverable = true,
  ) { super(message); this.name = 'CovenantError'; }
}

export const covenantOk  = <T>(value: T): CovenantResult<T> => ({ ok: true, value });
export const covenantErr = (e: CovenantError): CovenantResult<never> => ({ ok: false, error: e });
