/**
 * Atlas Sanctum — Covenant II: Preservation (Resilience Layer)
 *
 * Every system must survive catastrophic failure.
 *
 * Implements:
 *   - Resilience Registry (tracks system continuity posture)
 *   - Continuity Protocol (disaster recovery playbooks)
 *   - Adaptive Recovery Engine (learns from each failure)
 *   - Multi-domain resilience: climate, health, infrastructure, food, digital
 */

import {
  Covenant, CovenantId, CovenantLayer, ParticipantId, AuthorityId,
  EvidenceId, ConstitutionVersion, EpochMs, CovenantStatus,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Resilience Domains ───────────────────────────────────────────────────────

export type ResilienceDomain =
  | 'digital_continuity'
  | 'climate_resilience'
  | 'food_security'
  | 'health_continuity'
  | 'infrastructure_redundancy'
  | 'knowledge_preservation'
  | 'governance_continuity';

export type ThreatLevel = 'low' | 'moderate' | 'high' | 'critical' | 'existential';

// ─── Resilience Registry ──────────────────────────────────────────────────────

export interface ResilienceProfile {
  entityId: string;
  domain: ResilienceDomain;
  redundancyLevel: 1 | 2 | 3 | 4 | 5;   // 1 = single point of failure, 5 = fully distributed
  rto: number;                            // Recovery Time Objective (hours)
  rpo: number;                            // Recovery Point Objective (hours)
  lastTestedAt?: EpochMs;
  testResult?: 'passed' | 'partial' | 'failed';
  backupLocations: string[];
  continuityPlan: string;
}

export class ResilienceRegistry {
  private profiles = new Map<string, ResilienceProfile[]>();

  register(profile: ResilienceProfile): CovenantResult<ResilienceProfile> {
    if (profile.redundancyLevel < 2) {
      return covenantErr(new CovenantError(
        `Entity "${profile.entityId}" has single-point-of-failure risk in domain "${profile.domain}"`,
        'INSUFFICIENT_REDUNDANCY', 'preservation',
      ));
    }
    const existing = this.profiles.get(profile.entityId) ?? [];
    this.profiles.set(profile.entityId, [...existing, profile]);
    return covenantOk(profile);
  }

  getProfile(entityId: string, domain: ResilienceDomain): ResilienceProfile | undefined {
    return this.profiles.get(entityId)?.find(p => p.domain === domain);
  }

  /** Entities with no tested continuity plan in the last 90 days */
  getUntestedEntities(windowDays = 90): string[] {
    const cutoff = Date.now() - windowDays * 86_400_000;
    const untestedIds = new Set<string>();
    this.profiles.forEach((profiles, entityId) => {
      const hasStale = profiles.some(p => !p.lastTestedAt || p.lastTestedAt < cutoff);
      if (hasStale) untestedIds.add(entityId);
    });
    return [...untestedIds];
  }

  resilienceScore(entityId: string): number {
    const profiles = this.profiles.get(entityId) ?? [];
    if (!profiles.length) return 0;
    const avg = profiles.reduce((s, p) => s + p.redundancyLevel, 0) / profiles.length;
    return avg / 5; // normalize to 0–1
  }
}

// ─── Continuity Protocol ──────────────────────────────────────────────────────

export interface ContinuityPlaybook {
  playbookId: string;
  domain: ResilienceDomain;
  threatLevel: ThreatLevel;
  triggerConditions: string[];
  phases: ContinuityPhase[];
  estimatedRecoveryHours: number;
  testedAt?: EpochMs;
  owner: ParticipantId;
}

export interface ContinuityPhase {
  phase: number;
  name: string;
  actions: string[];
  responsibleRoles: string[];
  durationHours: number;
  successCriteria: string;
}

export class ContinuityProtocol {
  private playbooks = new Map<string, ContinuityPlaybook>();
  private activeIncidents = new Map<string, { playbookId: string; startedAt: EpochMs; currentPhase: number }>();

  register(playbook: ContinuityPlaybook): void {
    this.playbooks.set(playbookId(playbook.domain, playbook.threatLevel), playbook);
  }

  activate(domain: ResilienceDomain, threatLevel: ThreatLevel): CovenantResult<ContinuityPlaybook> {
    const key = playbookId(domain, threatLevel);
    const playbook = this.playbooks.get(key);
    if (!playbook) {
      return covenantErr(new CovenantError(
        `No continuity playbook for domain "${domain}" at threat level "${threatLevel}"`,
        'PLAYBOOK_NOT_FOUND', 'preservation',
      ));
    }
    const incidentId = `incident-${Date.now()}`;
    this.activeIncidents.set(incidentId, { playbookId: key, startedAt: Date.now() as EpochMs, currentPhase: 1 });
    return covenantOk(playbook);
  }

  advancePhase(incidentId: string): CovenantResult<ContinuityPhase | null> {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) return covenantErr(new CovenantError('Incident not found', 'NOT_FOUND', 'preservation'));
    const playbook = this.playbooks.get(incident.playbookId);
    if (!playbook) return covenantErr(new CovenantError('Playbook not found', 'NOT_FOUND', 'preservation'));
    incident.currentPhase++;
    const phase = playbook.phases.find(p => p.phase === incident.currentPhase) ?? null;
    return covenantOk(phase);
  }

  activeCount(): number { return this.activeIncidents.size; }
}

function playbookId(domain: ResilienceDomain, level: ThreatLevel): string {
  return `${domain}::${level}`;
}

// ─── Adaptive Recovery Engine ─────────────────────────────────────────────────
// Every failure becomes institutional learning (bridges to Covenant VI).

export interface FailurePostMortem {
  incidentId: string;
  domain: ResilienceDomain;
  occurredAt: EpochMs;
  rootCauses: string[];
  impactSummary: string;
  recoveryDurationHours: number;
  lessonsLearned: string[];
  playbookUpdates: string[];
  preventionMeasures: string[];
}

export class AdaptiveRecoveryEngine {
  private postMortems: FailurePostMortem[] = [];

  record(postMortem: FailurePostMortem): void {
    this.postMortems.push(postMortem);
  }

  /** Derive updated resilience recommendations from accumulated failures */
  synthesizeLearnings(domain?: ResilienceDomain): {
    topRootCauses: string[];
    recommendedPlaybookUpdates: string[];
    avgRecoveryHours: number;
  } {
    const relevant = domain
      ? this.postMortems.filter(p => p.domain === domain)
      : this.postMortems;

    if (!relevant.length) return { topRootCauses: [], recommendedPlaybookUpdates: [], avgRecoveryHours: 0 };

    const causeFreq = new Map<string, number>();
    relevant.flatMap(p => p.rootCauses).forEach(c => causeFreq.set(c, (causeFreq.get(c) ?? 0) + 1));
    const topRootCauses = [...causeFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cause]) => cause);

    const recommendedPlaybookUpdates = [...new Set(relevant.flatMap(p => p.playbookUpdates))];
    const avgRecoveryHours = relevant.reduce((s, p) => s + p.recoveryDurationHours, 0) / relevant.length;

    return { topRootCauses, recommendedPlaybookUpdates, avgRecoveryHours };
  }

  all(): FailurePostMortem[] { return this.postMortems; }
}

// ─── Covenant II Factory ──────────────────────────────────────────────────────

export function createPreservationCovenant(params: {
  participants: ParticipantId[];
  authority: AuthorityId;
  domains: ResilienceDomain[];
}): Covenant {
  return {
    id: `cov-preservation-${Date.now()}` as CovenantId,
    version: '1.0.0' as ConstitutionVersion,
    layer: 'preservation' as CovenantLayer,
    participants: params.participants,
    authority: params.authority,
    purpose: 'Ensure every system survives catastrophic failure and recovers with institutional learning',
    responsibilities: Object.fromEntries(
      params.participants.map(p => [p, ['Maintain continuity plans', 'Test recovery protocols quarterly', 'Report incidents within 24h']])
    ),
    permissions: ['read:resilience_profiles', 'activate:continuity_playbook', 'write:post_mortem'],
    obligations: [
      'Maintain minimum redundancy level 2 for all critical systems',
      'Test continuity plans every 90 days',
      'File post-mortem within 72 hours of any incident',
      'Share learnings across the covenant network',
    ],
    constraints: [
      'No single point of failure permitted for life-critical systems',
      'Backup data must be geographically distributed across minimum 3 regions',
    ],
    measurableOutcomes: [
      { metric: 'rto_compliance', target: 0.99, unit: 'ratio', horizon: 'annual' },
      { metric: 'continuity_test_coverage', target: 1.0, unit: 'ratio', horizon: 'quarterly' },
      { metric: 'mean_recovery_hours', target: 4, unit: 'hours', horizon: '1y' },
    ],
    incentives: [
      { type: 'recognition', description: 'Resilience Excellence certification', trigger: 'rto_compliance > 0.99', magnitude: 1 },
      { type: 'penalty', description: 'Mandatory audit', trigger: 'untested_continuity_plan > 90_days', magnitude: -1 },
    ],
    accountability: {
      reviewCycle: 'quarterly',
      reviewers: params.participants,
      escalationPath: [params.authority as unknown as ParticipantId],
      publiclyAuditable: true,
    },
    restorationProcess: {
      triggerConditions: ['system_failure', 'data_loss', 'service_unavailability'],
      steps: ['Activate continuity playbook', 'Notify stakeholders', 'Execute recovery phases', 'File post-mortem', 'Update playbook'],
      responsibleParty: params.authority as unknown as ParticipantId,
      timelineHours: 24,
    },
    governanceRules: [
      { id: 'resilience-standard', description: 'Resilience standards require consensus to lower', decisionThreshold: 'consensus' },
    ],
    evidence: [] as EvidenceId[],
    auditHistory: [],
    amendmentHistory: [],
    createdAt: Date.now() as EpochMs,
    status: 'active' as CovenantStatus,
  };
}
