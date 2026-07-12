/**
 * MODEL IV — ETHICAL DECISION ENGINE
 * Decision: "What are the full consequences before we act?"
 *
 * Evaluates through five ethical lenses:
 *   1. Utilitarian     — greatest good for greatest number
 *   2. Rights-based    — does it violate fundamental rights?
 *   3. Virtue ethics   — does it reflect good character?
 *   4. Indigenous      — does it respect land, community, and future generations?
 *   5. Governance      — does it comply with constitutional constraints?
 */

import { query } from '../db';
import { logger } from '../utils/logger';

export interface EthicalEvaluationInput {
  evaluationRef: string;
  entityType: 'project' | 'policy' | 'trade' | 'agent_action' | 'investment';
  proposedAction: string;
  stakeholderImpacts?: StakeholderImpact[];
  environmentalImpact?: EnvironmentalImpact;
  economicOutcomes?: EconomicOutcomes;
  governanceConstraints?: string[];
}

export interface StakeholderImpact {
  group: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedCount?: number;
  description: string;
}

export interface EnvironmentalImpact {
  carbonDeltaTonnes?: number;
  biodiversityDelta?: number;
  waterImpactM3?: number;
  landUseHa?: number;
  reversible: boolean;
  timeHorizonYears?: number;
}

export interface EconomicOutcomes {
  gdpImpactUsd?: number;
  jobsCreated?: number;
  jobsDestroyed?: number;
  wealthConcentrationDelta?: number;  // positive = more concentrated
  communityBenefitUsd?: number;
}

export interface EthicalEvaluation {
  id: string;
  evaluationRef: string;
  entityType: string;
  proposedAction: string;
  ethicalRiskScore: number;       // 0–100 (higher = riskier)
  humanBenefitScore: number;      // 0–100
  longTermSustainability: number; // 0–100
  utilitarianScore: number;
  rightsBased: number;
  virtueEthics: number;
  indigenousEthics: number;
  violations: EthicsViolation[];
  recommendedActions: string[];
  requiresHumanReview: boolean;
  auditTrail: string;
  evaluatedAt: string;
}

export interface EthicsViolation {
  principle: string;
  lens: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  description: string;
  mitigation: string;
}

// Constitutional hard stops — these always block
const HARD_STOPS = [
  { check: (i: EthicalEvaluationInput) => (i.environmentalImpact?.carbonDeltaTonnes ?? 0) > 100000, violation: 'Exceeds 100,000 tonne CO2 threshold — requires supermajority governance approval', lens: 'indigenous' },
  { check: (i: EthicalEvaluationInput) => (i.stakeholderImpacts ?? []).some(s => s.impact === 'negative' && s.severity === 'critical' && (s.affectedCount ?? 0) > 10000), violation: 'Critical harm to >10,000 people — blocked pending human review', lens: 'rights_based' },
  { check: (i: EthicalEvaluationInput) => (i.economicOutcomes?.wealthConcentrationDelta ?? 0) > 0.15, violation: 'Increases wealth concentration by >15% — violates equity principle', lens: 'utilitarian' },
];

class EthicalDecisionEngine {

  private evaluateUtilitarian(input: EthicalEvaluationInput): { score: number; violations: EthicsViolation[] } {
    const violations: EthicsViolation[] = [];
    let score = 70;

    const positiveGroups = (input.stakeholderImpacts ?? []).filter(s => s.impact === 'positive').length;
    const negativeGroups = (input.stakeholderImpacts ?? []).filter(s => s.impact === 'negative').length;
    const totalGroups = positiveGroups + negativeGroups;

    if (totalGroups > 0) {
      const ratio = positiveGroups / totalGroups;
      score = Math.round(ratio * 100);
    }

    if ((input.economicOutcomes?.jobsDestroyed ?? 0) > (input.economicOutcomes?.jobsCreated ?? 0)) {
      score -= 15;
      violations.push({ principle: 'Net employment harm', lens: 'utilitarian', severity: 'moderate', description: 'Action destroys more jobs than it creates', mitigation: 'Include transition support and retraining programs' });
    }

    return { score: Math.max(0, Math.min(100, score)), violations };
  }

  private evaluateRightsBased(input: EthicalEvaluationInput): { score: number; violations: EthicsViolation[] } {
    const violations: EthicsViolation[] = [];
    let score = 80;

    const criticalHarms = (input.stakeholderImpacts ?? []).filter(s => s.impact === 'negative' && s.severity === 'critical');
    for (const harm of criticalHarms) {
      score -= 20;
      violations.push({ principle: 'Right to non-harm', lens: 'rights_based', severity: 'severe', description: `Critical harm to ${harm.group}: ${harm.description}`, mitigation: 'Redesign to eliminate critical harm or obtain informed consent' });
    }

    if (!(input.environmentalImpact?.reversible ?? true)) {
      score -= 15;
      violations.push({ principle: 'Intergenerational rights', lens: 'rights_based', severity: 'moderate', description: 'Irreversible environmental impact violates future generations\' rights', mitigation: 'Require reversibility or long-term restoration bond' });
    }

    return { score: Math.max(0, Math.min(100, score)), violations };
  }

  private evaluateVirtueEthics(input: EthicalEvaluationInput): { score: number; violations: EthicsViolation[] } {
    const violations: EthicsViolation[] = [];
    let score = 75;

    // Virtue: transparency — does the action have clear, honest intent?
    if (!input.proposedAction || input.proposedAction.length < 20) {
      score -= 10;
      violations.push({ principle: 'Transparency', lens: 'virtue_ethics', severity: 'minor', description: 'Action description is insufficient for ethical review', mitigation: 'Provide full description of intent, method, and expected outcomes' });
    }

    // Virtue: prudence — are long-term consequences considered?
    if ((input.environmentalImpact?.timeHorizonYears ?? 0) < 10 && (input.environmentalImpact?.carbonDeltaTonnes ?? 0) !== 0) {
      score -= 10;
      violations.push({ principle: 'Prudence', lens: 'virtue_ethics', severity: 'minor', description: 'Environmental impact assessed over <10 year horizon', mitigation: 'Extend impact assessment to 25-year horizon minimum' });
    }

    return { score: Math.max(0, Math.min(100, score)), violations };
  }

  private evaluateIndigenousEthics(input: EthicalEvaluationInput): { score: number; violations: EthicsViolation[] } {
    const violations: EthicsViolation[] = [];
    let score = 70;

    // Seven generations principle: does it benefit 7 generations forward?
    const timeHorizon = input.environmentalImpact?.timeHorizonYears ?? 0;
    if (timeHorizon < 175 && (input.environmentalImpact?.landUseHa ?? 0) > 100) {
      score -= 15;
      violations.push({ principle: 'Seven Generations', lens: 'indigenous_ethics', severity: 'moderate', description: 'Land use impact not assessed over 175-year (7 generation) horizon', mitigation: 'Conduct intergenerational impact assessment with indigenous community input' });
    }

    // Reciprocity: does it give back to the land?
    if ((input.environmentalImpact?.carbonDeltaTonnes ?? 0) > 0 && (input.environmentalImpact?.biodiversityDelta ?? 0) <= 0) {
      score -= 20;
      violations.push({ principle: 'Reciprocity with land', lens: 'indigenous_ethics', severity: 'severe', description: 'Action increases carbon without biodiversity restoration — violates reciprocity', mitigation: 'Include biodiversity restoration component proportional to carbon impact' });
    }

    return { score: Math.max(0, Math.min(100, score)), violations };
  }

  async evaluate(input: EthicalEvaluationInput): Promise<EthicalEvaluation> {
    const allViolations: EthicsViolation[] = [];

    // Check hard stops first
    for (const stop of HARD_STOPS) {
      if (stop.check(input)) {
        allViolations.push({ principle: 'Constitutional Hard Stop', lens: stop.lens, severity: 'critical', description: stop.violation, mitigation: 'This action cannot proceed without governance supermajority approval' });
      }
    }

    const utilitarian = this.evaluateUtilitarian(input);
    const rightsBased = this.evaluateRightsBased(input);
    const virtue = this.evaluateVirtueEthics(input);
    const indigenous = this.evaluateIndigenousEthics(input);

    allViolations.push(...utilitarian.violations, ...rightsBased.violations, ...virtue.violations, ...indigenous.violations);

    const ethicalRiskScore = Math.round(
      (100 - utilitarian.score) * 0.25 +
      (100 - rightsBased.score) * 0.30 +
      (100 - virtue.score) * 0.20 +
      (100 - indigenous.score) * 0.25
    );

    const humanBenefitScore = Math.round(
      (input.stakeholderImpacts ?? []).filter(s => s.impact === 'positive').length /
      Math.max(1, (input.stakeholderImpacts ?? []).length) * 100
    );

    const longTermSustainability = Math.round(
      (indigenous.score * 0.4 + rightsBased.score * 0.3 + virtue.score * 0.3)
    );

    const requiresHumanReview = ethicalRiskScore > 60 || allViolations.some(v => v.severity === 'critical' || v.severity === 'severe');

    const recommendedActions = [
      ...new Set(allViolations.map(v => v.mitigation)),
      ...(requiresHumanReview ? ['Submit for Ethics Council review before proceeding'] : []),
    ];

    const auditTrail = `Evaluated ${new Date().toISOString()} | Lenses: utilitarian(${utilitarian.score}), rights(${rightsBased.score}), virtue(${virtue.score}), indigenous(${indigenous.score}) | Violations: ${allViolations.length} | Risk: ${ethicalRiskScore}`;

    const result = await query(
      `INSERT INTO ethical_evaluations (
        evaluation_ref, entity_type, proposed_action,
        stakeholder_impacts, environmental_impact, economic_outcomes, governance_constraints,
        ethical_risk_score, human_benefit_score, long_term_sustainability,
        utilitarian_score, rights_based_score, virtue_ethics_score, indigenous_ethics_score,
        recommended_actions, violations, requires_human_review, audit_trail
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        input.evaluationRef, input.entityType, input.proposedAction,
        JSON.stringify(input.stakeholderImpacts ?? []),
        JSON.stringify(input.environmentalImpact ?? {}),
        JSON.stringify(input.economicOutcomes ?? {}),
        JSON.stringify(input.governanceConstraints ?? []),
        ethicalRiskScore, humanBenefitScore, longTermSustainability,
        utilitarian.score, rightsBased.score, virtue.score, indigenous.score,
        JSON.stringify(recommendedActions), JSON.stringify(allViolations),
        requiresHumanReview, auditTrail,
      ]
    );

    logger.info('[Ethics] Evaluation complete', { ref: input.evaluationRef, ethicalRiskScore, requiresHumanReview });

    return {
      id: result.rows[0].id,
      evaluationRef: input.evaluationRef,
      entityType: input.entityType,
      proposedAction: input.proposedAction,
      ethicalRiskScore,
      humanBenefitScore,
      longTermSustainability,
      utilitarianScore: utilitarian.score,
      rightsBased: rightsBased.score,
      virtueEthics: virtue.score,
      indigenousEthics: indigenous.score,
      violations: allViolations,
      recommendedActions,
      requiresHumanReview,
      auditTrail,
      evaluatedAt: result.rows[0].evaluated_at,
    };
  }

  async getEvaluationHistory(evaluationRef: string): Promise<EthicalEvaluation[]> {
    const result = await query(
      `SELECT * FROM ethical_evaluations WHERE evaluation_ref = $1 ORDER BY evaluated_at DESC`,
      [evaluationRef]
    );
    return result.rows.map((r: any) => ({
      id: r.id,
      evaluationRef: r.evaluation_ref,
      entityType: r.entity_type,
      proposedAction: r.proposed_action,
      ethicalRiskScore: parseFloat(r.ethical_risk_score),
      humanBenefitScore: parseFloat(r.human_benefit_score),
      longTermSustainability: parseFloat(r.long_term_sustainability),
      utilitarianScore: parseFloat(r.utilitarian_score),
      rightsBased: parseFloat(r.rights_based_score),
      virtueEthics: parseFloat(r.virtue_ethics_score),
      indigenousEthics: parseFloat(r.indigenous_ethics_score),
      violations: r.violations ?? [],
      recommendedActions: r.recommended_actions ?? [],
      requiresHumanReview: r.requires_human_review,
      auditTrail: r.audit_trail,
      evaluatedAt: r.evaluated_at,
    }));
  }

  async getPendingReviews(): Promise<EthicalEvaluation[]> {
    const result = await query(
      `SELECT * FROM ethical_evaluations WHERE requires_human_review = true ORDER BY evaluated_at DESC LIMIT 50`
    );
    return result.rows.map((r: any) => ({
      id: r.id, evaluationRef: r.evaluation_ref, entityType: r.entity_type,
      proposedAction: r.proposed_action, ethicalRiskScore: parseFloat(r.ethical_risk_score),
      humanBenefitScore: parseFloat(r.human_benefit_score), longTermSustainability: parseFloat(r.long_term_sustainability),
      utilitarianScore: parseFloat(r.utilitarian_score), rightsBased: parseFloat(r.rights_based_score),
      virtueEthics: parseFloat(r.virtue_ethics_score), indigenousEthics: parseFloat(r.indigenous_ethics_score),
      violations: r.violations ?? [], recommendedActions: r.recommended_actions ?? [],
      requiresHumanReview: r.requires_human_review, auditTrail: r.audit_trail, evaluatedAt: r.evaluated_at,
    }));
  }
}

export const ethicalDecisionEngine = new EthicalDecisionEngine();
export default ethicalDecisionEngine;
