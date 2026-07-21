/**
 * Atlas Sanctum — Covenant I: Creation (Purpose Layer)
 *
 * Every object must answer:
 *   Why do I exist?
 *   Who am I serving?
 *   Who is responsible?
 *
 * Implements:
 *   - Mission Registry
 *   - Purpose Engine (validates every object has a declared purpose)
 *   - Stewardship Registry (ownership graph with accountability)
 *   - Asset Classification
 */

import {
  Covenant, CovenantId, CovenantLayer, ParticipantId, AuthorityId,
  EvidenceId, ConstitutionVersion, EpochMs, CovenantStatus,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Mission Registry ─────────────────────────────────────────────────────────

export interface MissionStatement {
  id: string;
  entityId: ParticipantId;
  entityType: 'platform' | 'organization' | 'agent' | 'project' | 'service';
  mission: string;
  vision: string;
  coreValues: string[];
  primaryBeneficiaries: string[];
  planetaryBoundaryAlignment: string[];
  registeredAt: EpochMs;
  version: ConstitutionVersion;
}

export class MissionRegistry {
  private missions = new Map<string, MissionStatement>();

  register(statement: MissionStatement): CovenantResult<MissionStatement> {
    if (!statement.mission.trim() || !statement.primaryBeneficiaries.length) {
      return covenantErr(new CovenantError(
        'Mission must declare purpose and at least one beneficiary',
        'INVALID_MISSION', 'creation',
      ));
    }
    this.missions.set(statement.entityId, statement);
    return covenantOk(statement);
  }

  get(entityId: ParticipantId): MissionStatement | undefined {
    return this.missions.get(entityId);
  }

  hasPurpose(entityId: ParticipantId): boolean {
    return this.missions.has(entityId);
  }

  all(): MissionStatement[] {
    return [...this.missions.values()];
  }
}

// ─── Asset Classification ─────────────────────────────────────────────────────

export type AssetClass =
  | 'natural_capital'     // ecosystems, biodiversity, water, soil
  | 'social_capital'      // communities, relationships, trust
  | 'knowledge_capital'   // data, research, indigenous knowledge
  | 'financial_capital'   // currency, credits, investments
  | 'infrastructure'      // physical and digital systems
  | 'cultural_heritage';  // traditions, languages, sacred sites

export interface RegisteredAsset {
  assetId: string;
  name: string;
  class: AssetClass;
  stewardId: ParticipantId;
  purposeStatement: string;
  servingBeneficiaries: string[];
  sovereigntyLevel: 'open' | 'shared' | 'community' | 'sacred';
  registeredAt: EpochMs;
  covenantId: CovenantId;
}

// ─── Stewardship Registry ─────────────────────────────────────────────────────
// Stewardship before ownership. Every asset has a declared steward
// who is accountable for its purpose-aligned use.

export interface StewardshipRecord {
  assetId: string;
  stewardId: ParticipantId;
  stewardType: 'individual' | 'community' | 'institution' | 'ai_agent';
  obligations: string[];
  reportingCycle: 'monthly' | 'quarterly' | 'annual';
  lastReportedAt?: EpochMs;
  complianceScore: number; // 0–1
}

export class StewardshipRegistry {
  private assets   = new Map<string, RegisteredAsset>();
  private stewards = new Map<string, StewardshipRecord>();

  registerAsset(asset: RegisteredAsset): CovenantResult<RegisteredAsset> {
    if (!asset.purposeStatement.trim()) {
      return covenantErr(new CovenantError(
        `Asset "${asset.name}" must declare a purpose before registration`,
        'MISSING_PURPOSE', 'creation', asset.covenantId,
      ));
    }
    this.assets.set(asset.assetId, asset);
    return covenantOk(asset);
  }

  assignSteward(record: StewardshipRecord): CovenantResult<StewardshipRecord> {
    if (!this.assets.has(record.assetId)) {
      return covenantErr(new CovenantError(
        `Asset ${record.assetId} not found in registry`,
        'ASSET_NOT_FOUND', 'creation',
      ));
    }
    this.stewards.set(record.assetId, record);
    return covenantOk(record);
  }

  getSteward(assetId: string): StewardshipRecord | undefined {
    return this.stewards.get(assetId);
  }

  getAsset(assetId: string): RegisteredAsset | undefined {
    return this.assets.get(assetId);
  }

  /** Returns assets whose stewards have not reported within their cycle */
  getOverdueReports(): RegisteredAsset[] {
    const now = Date.now();
    return [...this.assets.values()].filter(asset => {
      const steward = this.stewards.get(asset.assetId);
      if (!steward?.lastReportedAt) return true;
      const cycleMs = { monthly: 30, quarterly: 90, annual: 365 }[steward.reportingCycle] * 86_400_000;
      return now - steward.lastReportedAt > cycleMs;
    });
  }
}

// ─── Purpose Engine ───────────────────────────────────────────────────────────
// Validates that every object in the system has answered the three questions.

export interface PurposeValidation {
  entityId: string;
  hasMission: boolean;
  hasSteward: boolean;
  hasCovenantBinding: boolean;
  purposeScore: number; // 0–1
  gaps: string[];
}

export class PurposeEngine {
  constructor(
    private readonly missions: MissionRegistry,
    private readonly stewardship: StewardshipRegistry,
    private readonly covenants: Map<CovenantId, Covenant>,
  ) {}

  validate(entityId: ParticipantId, assetId?: string): PurposeValidation {
    const hasMission = this.missions.hasPurpose(entityId);
    const hasSteward = assetId ? !!this.stewardship.getSteward(assetId) : true;
    const hasCovenantBinding = [...this.covenants.values()].some(
      c => c.participants.includes(entityId) && c.status === 'active',
    );

    const gaps: string[] = [];
    if (!hasMission)         gaps.push('No mission statement registered — Why do I exist?');
    if (!hasSteward)         gaps.push('No steward assigned — Who is responsible?');
    if (!hasCovenantBinding) gaps.push('No active covenant binding — Who am I serving?');

    const purposeScore = [hasMission, hasSteward, hasCovenantBinding]
      .filter(Boolean).length / 3;

    return { entityId, hasMission, hasSteward, hasCovenantBinding, purposeScore, gaps };
  }
}

// ─── Covenant I Factory ───────────────────────────────────────────────────────

export function createCreationCovenant(params: {
  participants: ParticipantId[];
  authority: AuthorityId;
  purpose: string;
  responsibilities: Record<string, string[]>;
  stewardshipObligations: string[];
}): Covenant {
  return {
    id: `cov-creation-${Date.now()}` as CovenantId,
    version: '1.0.0' as ConstitutionVersion,
    layer: 'creation' as CovenantLayer,
    participants: params.participants,
    authority: params.authority,
    purpose: params.purpose,
    responsibilities: params.responsibilities,
    permissions: ['read:purpose', 'write:mission', 'register:asset'],
    obligations: [
      'Declare purpose before any action',
      'Maintain stewardship records',
      'Report asset use quarterly',
      ...params.stewardshipObligations,
    ],
    constraints: [
      'No asset may be used contrary to its declared purpose',
      'Sacred assets require community consent before any access',
    ],
    measurableOutcomes: [
      { metric: 'purpose_coverage', target: 1.0, unit: 'ratio', horizon: '1y' },
      { metric: 'stewardship_compliance', target: 0.95, unit: 'ratio', horizon: 'quarterly' },
    ],
    incentives: [
      { type: 'recognition', description: 'Purpose-aligned steward badge', trigger: 'compliance_score > 0.9', magnitude: 1 },
    ],
    accountability: {
      reviewCycle: 'quarterly',
      reviewers: params.participants,
      escalationPath: [params.authority as unknown as ParticipantId],
      publiclyAuditable: true,
    },
    restorationProcess: {
      triggerConditions: ['purpose_drift_detected', 'stewardship_failure'],
      steps: ['Suspend asset access', 'Convene stewardship review', 'Reaffirm or reassign steward', 'Restore access'],
      responsibleParty: params.authority as unknown as ParticipantId,
      timelineHours: 72,
    },
    governanceRules: [
      { id: 'purpose-amendment', description: 'Purpose changes require supermajority', decisionThreshold: 'supermajority' },
    ],
    evidence: [] as EvidenceId[],
    auditHistory: [],
    amendmentHistory: [],
    createdAt: Date.now() as EpochMs,
    status: 'active' as CovenantStatus,
  };
}
