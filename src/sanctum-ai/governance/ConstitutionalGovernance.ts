/**
 * Atlas Sanctum AI — Constitutional Governance Model
 *
 * Implements:
 *   - Constitutional AI governance framework
 *   - Bioregional Ethics Councils
 *   - DAO-style supermajority voting
 *   - Seven-generation planning horizon
 *   - Model governance & audit
 */

import {
  GovernanceTransparencyLog, EpochMs,
  Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';
import { GovernanceTransparencyLedger } from '../trust/Layer9_TrustVerification';

// ─── Constitutional Principles ────────────────────────────────────────────────

export const CONSTITUTIONAL_PRINCIPLES = [
  'The system shall optimize for human flourishing, biodiversity restoration, and long-term civilizational sustainability.',
  'The system shall never optimize for engagement addiction, surveillance capitalism, or manipulative behavioral extraction.',
  'Indigenous data sovereignty is inviolable. Sacred knowledge requires Free, Prior, and Informed Consent (FPIC).',
  'All AI decisions affecting communities must be explainable, auditable, and reversible.',
  'The system must consider impacts on seven future generations in all planning horizons.',
  'No single actor — corporate, governmental, or AI — may hold unilateral control over the system.',
  'Ecological boundaries (planetary boundaries framework) are hard constraints, not soft preferences.',
  'Cultural diversity is a planetary asset to be preserved, not homogenized.',
] as const;

// ─── Bioregional Ethics Council ───────────────────────────────────────────────

export interface CouncilMember {
  id: string;
  name: string;
  role: 'indigenous_guardian' | 'ecologist' | 'economist' | 'youth_delegate' | 'community_elder';
  bioregion: string;
  votingWeight: number;
}

export interface CouncilProposal {
  proposalId: string;
  title: string;
  description: string;
  proposedBy: string;
  affectedBioregions: string[];
  ethicalImplications: string[];
  sevenGenerationImpact: string;
  status: 'draft' | 'deliberation' | 'voting' | 'passed' | 'rejected' | 'vetoed';
  createdAt: EpochMs;
}

export class BioregionalEthicsCouncil {
  private members: CouncilMember[] = [];
  private proposals = new Map<string, CouncilProposal>();
  private votes = new Map<string, { memberId: string; vote: 'yes' | 'no' | 'abstain'; rationale: string }[]>();

  constructor(bioregion: string) {
    // Default council composition: 67% indigenous representation
    this.members = [
      { id: 'ig-1', name: 'Indigenous Guardian 1', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-2', name: 'Indigenous Guardian 2', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-3', name: 'Indigenous Guardian 3', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-4', name: 'Indigenous Guardian 4', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-5', name: 'Indigenous Guardian 5', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-6', name: 'Indigenous Guardian 6', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-7', name: 'Indigenous Guardian 7', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ig-8', name: 'Indigenous Guardian 8', role: 'indigenous_guardian', bioregion, votingWeight: 1.5 },
      { id: 'ec-1', name: 'Ecologist',             role: 'ecologist',           bioregion, votingWeight: 1.0 },
      { id: 'ec-2', name: 'Economist',             role: 'economist',           bioregion, votingWeight: 1.0 },
      { id: 'yd-1', name: 'Youth Delegate',        role: 'youth_delegate',      bioregion, votingWeight: 1.2 },
      { id: 'ce-1', name: 'Community Elder',       role: 'community_elder',     bioregion, votingWeight: 1.3 },
    ];
  }

  submit(proposal: CouncilProposal): void {
    this.proposals.set(proposal.proposalId, { ...proposal, status: 'deliberation' });
    this.votes.set(proposal.proposalId, []);
  }

  vote(proposalId: string, memberId: string, vote: 'yes' | 'no' | 'abstain', rationale: string): Result<void, AIError> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return err(new AIError('Proposal not found', 'NOT_FOUND', 'foundational'));
    if (proposal.status !== 'voting' && proposal.status !== 'deliberation')
      return err(new AIError('Proposal not open for voting', 'INVALID_STATE', 'foundational'));

    const votes = this.votes.get(proposalId) ?? [];
    votes.push({ memberId, vote, rationale });
    this.votes.set(proposalId, votes);
    return ok(undefined);
  }

  tally(proposalId: string): Result<{ outcome: 'passed' | 'rejected'; yesWeight: number; noWeight: number; quorum: boolean }, AIError> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return err(new AIError('Proposal not found', 'NOT_FOUND', 'foundational'));

    const votes = this.votes.get(proposalId) ?? [];
    let yesWeight = 0, noWeight = 0, totalWeight = 0;

    for (const v of votes) {
      const member = this.members.find(m => m.id === v.memberId);
      const weight = member?.votingWeight ?? 1;
      totalWeight += weight;
      if (v.vote === 'yes') yesWeight += weight;
      if (v.vote === 'no')  noWeight  += weight;
    }

    const totalPossibleWeight = this.members.reduce((s, m) => s + m.votingWeight, 0);
    const quorum = totalWeight / totalPossibleWeight >= 0.67;  // 67% quorum required
    const supermajority = yesWeight / (yesWeight + noWeight) >= 0.67;  // 67% supermajority

    const outcome = quorum && supermajority ? 'passed' : 'rejected';
    this.proposals.set(proposalId, { ...proposal, status: outcome });

    return ok({ outcome, yesWeight, noWeight, quorum });
  }

  getActiveProposals(): CouncilProposal[] {
    return [...this.proposals.values()].filter(p =>
      p.status === 'deliberation' || p.status === 'voting'
    );
  }
}

// ─── Model Governance ─────────────────────────────────────────────────────────

export interface ModelCard {
  modelId: string;
  name: string;
  version: string;
  purpose: string;
  trainingData: string[];
  knownBiases: string[];
  ethicalConstraints: string[];
  performanceMetrics: Record<string, number>;
  auditHistory: { date: string; auditor: string; findings: string[] }[];
  approvedBy: string[];
  deployedAt?: EpochMs;
}

export class ModelGovernanceFramework {
  private models = new Map<string, ModelCard>();
  private readonly ledger = new GovernanceTransparencyLedger();

  register(card: ModelCard): void {
    this.models.set(card.modelId, card);
  }

  async approve(modelId: string, approver: string): Promise<Result<ModelCard, AIError>> {
    const card = this.models.get(modelId);
    if (!card) return err(new AIError('Model not found', 'NOT_FOUND', 'foundational'));

    const updated: ModelCard = {
      ...card,
      approvedBy: [...card.approvedBy, approver],
      deployedAt: Date.now() as EpochMs,
    };
    this.models.set(modelId, updated);

    await this.ledger.record({
      proposalId: `model-approval-${modelId}`,
      proposer: approver,
      description: `Model ${card.name} v${card.version} approved for deployment`,
      votes: [{ voter: approver, vote: 'yes', weight: 1 }],
      outcome: 'passed',
    });

    return ok(updated);
  }

  audit(modelId: string, auditor: string, findings: string[]): Result<void, AIError> {
    const card = this.models.get(modelId);
    if (!card) return err(new AIError('Model not found', 'NOT_FOUND', 'foundational'));

    this.models.set(modelId, {
      ...card,
      auditHistory: [...card.auditHistory, { date: new Date().toISOString(), auditor, findings }],
    });
    return ok(undefined);
  }

  getModelsRequiringAudit(daysSinceLastAudit = 90): ModelCard[] {
    const cutoff = Date.now() - daysSinceLastAudit * 86_400_000;
    return [...this.models.values()].filter(card => {
      const lastAudit = card.auditHistory.at(-1);
      return !lastAudit || new Date(lastAudit.date).getTime() < cutoff;
    });
  }
}

// ─── Seven-Generation Planning ────────────────────────────────────────────────

export interface GenerationalImpact {
  generation: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  yearsAhead: number;
  projectedPopulation: number;
  ecologicalHealth: number;   // 0–100
  economicWellbeing: number;  // 0–100
  culturalVitality: number;   // 0–100
  risks: string[];
}

export class SevenGenerationPlanner {
  project(
    currentMetrics: { ecological: number; economic: number; cultural: number },
    interventions: string[],
  ): GenerationalImpact[] {
    const generationYears = 25;
    const interventionBonus = interventions.length * 0.02;

    return Array.from({ length: 7 }, (_, i) => {
      const gen = (i + 1) as GenerationalImpact['generation'];
      const years = gen * generationYears;
      const decay = Math.pow(0.97, gen);  // natural degradation without intervention
      const boost = interventionBonus * gen;

      return {
        generation: gen,
        yearsAhead: years,
        projectedPopulation: Math.round(8_000_000_000 * (1 + 0.005 * years)),
        ecologicalHealth: Math.max(0, Math.min(100, currentMetrics.ecological * decay + boost * 100)),
        economicWellbeing: Math.max(0, Math.min(100, currentMetrics.economic * (1 + boost))),
        culturalVitality: Math.max(0, Math.min(100, currentMetrics.cultural * (0.95 + boost))),
        risks: gen > 4
          ? ['Climate tipping points', 'Biodiversity collapse risk', 'Resource scarcity']
          : ['Policy reversal', 'Economic disruption'],
      };
    });
  }
}

// ─── Governance Layer Export ──────────────────────────────────────────────────

export class ConstitutionalGovernanceFramework {
  readonly principles = CONSTITUTIONAL_PRINCIPLES;
  readonly councils   = new Map<string, BioregionalEthicsCouncil>();
  readonly models     = new ModelGovernanceFramework();
  readonly planning   = new SevenGenerationPlanner();

  createCouncil(bioregion: string): BioregionalEthicsCouncil {
    const council = new BioregionalEthicsCouncil(bioregion);
    this.councils.set(bioregion, council);
    return council;
  }

  getCouncil(bioregion: string): BioregionalEthicsCouncil | undefined {
    return this.councils.get(bioregion);
  }

  validateAgainstConstitution(action: string): { compliant: boolean; violations: string[] } {
    const violations = CONSTITUTIONAL_PRINCIPLES.filter(p => {
      const forbidden = ['surveillance', 'addiction', 'extraction', 'manipulation'];
      return forbidden.some(f => action.toLowerCase().includes(f));
    });
    return { compliant: violations.length === 0, violations: [...violations] };
  }
}
