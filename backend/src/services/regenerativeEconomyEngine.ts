/**
 * MODEL II — REGENERATIVE ECONOMY ENGINE
 * Decision: "Does this project create or destroy real value?"
 *
 * True Value = Financial Value + Ecological Value + Social Value − Hidden Costs
 *
 * Pricing primitives (2024 reference values):
 *   Carbon:      $65/tonne CO2e  (EU ETS midpoint)
 *   Water:       $0.08/m³        (global average scarcity-adjusted)
 *   Biodiversity: $2,500/Shannon unit/ha/yr (TEEB methodology)
 *   Soil health:  $150/point/ha/yr (USDA Natural Capital)
 *   Job creation: $18,500/job/yr  (ILO social value of employment)
 */

import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

// ── Natural capital pricing constants ────────────────────────────────────────
const CARBON_PRICE_USD_PER_TONNE = 65;
const WATER_PRICE_USD_PER_M3 = 0.08;
const BIODIVERSITY_PRICE_USD_PER_UNIT = 2500;
const SOIL_HEALTH_PRICE_USD_PER_POINT_HA = 150;
const JOB_SOCIAL_VALUE_USD = 18500;
const COMMUNITY_BENEFIT_MULTIPLIER = 1.4; // local economic multiplier

export interface RegenerativeInput {
  projectId: string;
  projectName: string;
  carbonSequestrationT?: number;
  waterRestoredM3?: number;
  biodiversityDelta?: number;
  soilHealthDelta?: number;
  areaHectares?: number;
  energyKwh?: number;           // negative = consumed
  wasteKg?: number;             // negative = generated
  jobsCreated?: number;
  communityBenefitUsd?: number;
  financialInvestmentUsd?: number;
  periodStart?: string;
  periodEnd?: string;
  metadata?: Record<string, unknown>;
}

export interface RegenerativeValuation {
  id: string;
  projectId: string;
  projectName: string;
  // Raw inputs
  carbonSequestrationT: number;
  waterRestoredM3: number;
  biodiversityDelta: number;
  soilHealthDelta: number;
  jobsCreated: number;
  communityBenefitUsd: number;
  // Computed outputs
  regenerativeValueScore: number;   // 0–100
  ecologicalRoi: number;
  restorationYield: number;
  circularEconomyIndex: number;
  hiddenCostsUsd: number;
  hiddenBenefitsUsd: number;
  trueValueUsd: number;
  // Breakdown
  breakdown: ValueBreakdown;
  verdict: 'regenerative' | 'neutral' | 'extractive';
  createdAt: string;
}

export interface ValueBreakdown {
  carbonValueUsd: number;
  waterValueUsd: number;
  biodiversityValueUsd: number;
  soilValueUsd: number;
  employmentValueUsd: number;
  communityValueUsd: number;
  totalEcologicalUsd: number;
  totalSocialUsd: number;
  totalFinancialUsd: number;
}

export interface RegenerativeLeaderboard {
  projects: Array<{
    projectId: string;
    projectName: string;
    regenerativeValueScore: number;
    trueValueUsd: number;
    verdict: string;
    rank: number;
  }>;
  sectorAverages: Record<string, number>;
}

class RegenerativeEconomyEngine {

  // ── Core valuation ────────────────────────────────────────────────────────

  private computeBreakdown(input: RegenerativeInput, areaHa: number): ValueBreakdown {
    const carbonValueUsd = (input.carbonSequestrationT ?? 0) * CARBON_PRICE_USD_PER_TONNE;
    const waterValueUsd = (input.waterRestoredM3 ?? 0) * WATER_PRICE_USD_PER_M3;
    const biodiversityValueUsd = (input.biodiversityDelta ?? 0) * BIODIVERSITY_PRICE_USD_PER_UNIT * Math.max(1, areaHa);
    const soilValueUsd = (input.soilHealthDelta ?? 0) * SOIL_HEALTH_PRICE_USD_PER_POINT_HA * Math.max(1, areaHa);
    const employmentValueUsd = (input.jobsCreated ?? 0) * JOB_SOCIAL_VALUE_USD;
    const communityValueUsd = (input.communityBenefitUsd ?? 0) * COMMUNITY_BENEFIT_MULTIPLIER;

    return {
      carbonValueUsd: Math.round(carbonValueUsd * 100) / 100,
      waterValueUsd: Math.round(waterValueUsd * 100) / 100,
      biodiversityValueUsd: Math.round(biodiversityValueUsd * 100) / 100,
      soilValueUsd: Math.round(soilValueUsd * 100) / 100,
      employmentValueUsd: Math.round(employmentValueUsd * 100) / 100,
      communityValueUsd: Math.round(communityValueUsd * 100) / 100,
      totalEcologicalUsd: Math.round((carbonValueUsd + waterValueUsd + biodiversityValueUsd + soilValueUsd) * 100) / 100,
      totalSocialUsd: Math.round((employmentValueUsd + communityValueUsd) * 100) / 100,
      totalFinancialUsd: input.financialInvestmentUsd ?? 0,
    };
  }

  private computeHiddenCosts(input: RegenerativeInput): number {
    let costs = 0;
    // Energy consumption externality ($0.05/kWh carbon cost)
    if ((input.energyKwh ?? 0) < 0) costs += Math.abs(input.energyKwh!) * 0.05;
    // Waste generation externality ($0.12/kg disposal + pollution)
    if ((input.wasteKg ?? 0) < 0) costs += Math.abs(input.wasteKg!) * 0.12;
    return Math.round(costs * 100) / 100;
  }

  private computeHiddenBenefits(breakdown: ValueBreakdown): number {
    // Hidden benefits = ecological + social value not captured in financial accounts
    return Math.round((breakdown.totalEcologicalUsd + breakdown.totalSocialUsd) * 100) / 100;
  }

  private computeRegenerativeScore(breakdown: ValueBreakdown, hiddenCosts: number, investment: number): number {
    const totalPositive = breakdown.totalEcologicalUsd + breakdown.totalSocialUsd;
    const totalNegative = hiddenCosts + Math.max(0, investment * 0.1); // 10% of investment as baseline cost
    if (totalPositive + totalNegative === 0) return 50;
    const ratio = totalPositive / (totalPositive + totalNegative);
    return Math.round(Math.min(100, ratio * 100) * 100) / 100;
  }

  private computeEcologicalRoi(breakdown: ValueBreakdown, investment: number): number {
    if (investment <= 0) return 0;
    return Math.round((breakdown.totalEcologicalUsd / investment) * 1000) / 1000;
  }

  private computeRestorationYield(carbonT: number, areaHa: number): number {
    if (areaHa <= 0) return 0;
    return Math.round((carbonT / areaHa) * 100) / 100;
  }

  private computeCircularIndex(input: RegenerativeInput): number {
    // Circular economy index: penalise waste, reward energy efficiency
    let score = 70; // baseline
    if ((input.wasteKg ?? 0) < 0) score -= Math.min(30, Math.abs(input.wasteKg!) / 1000);
    if ((input.energyKwh ?? 0) > 0) score += Math.min(20, input.energyKwh! / 10000);
    if ((input.waterRestoredM3 ?? 0) > 0) score += Math.min(10, input.waterRestoredM3! / 1000);
    return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
  }

  private computeVerdict(score: number): 'regenerative' | 'neutral' | 'extractive' {
    if (score >= 65) return 'regenerative';
    if (score >= 40) return 'neutral';
    return 'extractive';
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async valuate(input: RegenerativeInput): Promise<RegenerativeValuation> {
    const areaHa = (input.metadata?.areaHectares as number) ?? 1;
    const investment = input.financialInvestmentUsd ?? 0;

    const breakdown = this.computeBreakdown(input, areaHa);
    const hiddenCosts = this.computeHiddenCosts(input);
    const hiddenBenefits = this.computeHiddenBenefits(breakdown);
    const trueValueUsd = breakdown.totalEcologicalUsd + breakdown.totalSocialUsd + investment - hiddenCosts;
    const regenerativeValueScore = this.computeRegenerativeScore(breakdown, hiddenCosts, investment);
    const ecologicalRoi = this.computeEcologicalRoi(breakdown, investment);
    const restorationYield = this.computeRestorationYield(input.carbonSequestrationT ?? 0, areaHa);
    const circularEconomyIndex = this.computeCircularIndex(input);
    const verdict = this.computeVerdict(regenerativeValueScore);

    const result = await query(
      `INSERT INTO regenerative_valuations (
        project_id, project_name,
        carbon_sequestration_t, water_restored_m3, biodiversity_delta,
        soil_health_delta, energy_kwh, waste_kg, jobs_created, community_benefit_usd,
        regenerative_value_score, ecological_roi, restoration_yield, circular_economy_index,
        hidden_costs_usd, hidden_benefits_usd, true_value_usd,
        methodology, period_start, period_end, metadata
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *`,
      [
        input.projectId, input.projectName,
        input.carbonSequestrationT ?? 0, input.waterRestoredM3 ?? 0,
        input.biodiversityDelta ?? 0, input.soilHealthDelta ?? 0,
        input.energyKwh ?? 0, input.wasteKg ?? 0,
        input.jobsCreated ?? 0, input.communityBenefitUsd ?? 0,
        regenerativeValueScore, ecologicalRoi, restorationYield, circularEconomyIndex,
        hiddenCosts, hiddenBenefits, trueValueUsd,
        'atlas_v1', input.periodStart ?? null, input.periodEnd ?? null,
        JSON.stringify({ ...input.metadata, breakdown }),
      ]
    );

    await invalidateCache(`regen:${input.projectId}:*`);
    logger.info('[RegenEconomy] Valuation computed', { projectId: input.projectId, verdict, regenerativeValueScore });

    return {
      id: result.rows[0].id,
      projectId: input.projectId,
      projectName: input.projectName,
      carbonSequestrationT: input.carbonSequestrationT ?? 0,
      waterRestoredM3: input.waterRestoredM3 ?? 0,
      biodiversityDelta: input.biodiversityDelta ?? 0,
      soilHealthDelta: input.soilHealthDelta ?? 0,
      jobsCreated: input.jobsCreated ?? 0,
      communityBenefitUsd: input.communityBenefitUsd ?? 0,
      regenerativeValueScore,
      ecologicalRoi,
      restorationYield,
      circularEconomyIndex,
      hiddenCostsUsd: hiddenCosts,
      hiddenBenefitsUsd: hiddenBenefits,
      trueValueUsd: Math.round(trueValueUsd * 100) / 100,
      breakdown,
      verdict,
      createdAt: result.rows[0].created_at,
    };
  }

  async getLatestValuation(projectId: string): Promise<RegenerativeValuation | null> {
    return cacheWithRedis(`regen:${projectId}:latest`, 600, async () => {
      const result = await query(
        `SELECT * FROM regenerative_valuations WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [projectId]
      );
      if (!result.rows[0]) return null;
      return this.mapRow(result.rows[0]);
    });
  }

  async getLeaderboard(limit = 20): Promise<RegenerativeLeaderboard> {
    return cacheWithRedis(`regen:leaderboard:${limit}`, 300, async () => {
      const result = await query(
        `SELECT DISTINCT ON (project_id)
           project_id, project_name, regenerative_value_score, true_value_usd
         FROM regenerative_valuations
         ORDER BY project_id, created_at DESC`,
      );
      const sorted = result.rows
        .sort((a: any, b: any) => b.regenerative_value_score - a.regenerative_value_score)
        .slice(0, limit);

      return {
        projects: sorted.map((r: any, i: number) => ({
          projectId: r.project_id,
          projectName: r.project_name,
          regenerativeValueScore: parseFloat(r.regenerative_value_score),
          trueValueUsd: parseFloat(r.true_value_usd),
          verdict: this.computeVerdict(parseFloat(r.regenerative_value_score)),
          rank: i + 1,
        })),
        sectorAverages: {},
      };
    });
  }

  async compareProjects(projectIds: string[]): Promise<RegenerativeValuation[]> {
    const result = await query(
      `SELECT DISTINCT ON (project_id) *
       FROM regenerative_valuations
       WHERE project_id = ANY($1)
       ORDER BY project_id, created_at DESC`,
      [projectIds]
    );
    return result.rows.map((r: any) => this.mapRow(r));
  }

  private mapRow(row: Record<string, unknown>): RegenerativeValuation {
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    return {
      id: row.id as string,
      projectId: row.project_id as string,
      projectName: row.project_name as string,
      carbonSequestrationT: parseFloat(row.carbon_sequestration_t as string),
      waterRestoredM3: parseFloat(row.water_restored_m3 as string),
      biodiversityDelta: parseFloat(row.biodiversity_delta as string),
      soilHealthDelta: parseFloat(row.soil_health_delta as string),
      jobsCreated: parseInt(row.jobs_created as string),
      communityBenefitUsd: parseFloat(row.community_benefit_usd as string),
      regenerativeValueScore: parseFloat(row.regenerative_value_score as string),
      ecologicalRoi: parseFloat(row.ecological_roi as string),
      restorationYield: parseFloat(row.restoration_yield as string),
      circularEconomyIndex: parseFloat(row.circular_economy_index as string),
      hiddenCostsUsd: parseFloat(row.hidden_costs_usd as string),
      hiddenBenefitsUsd: parseFloat(row.hidden_benefits_usd as string),
      trueValueUsd: parseFloat(row.true_value_usd as string),
      breakdown: (meta.breakdown as ValueBreakdown) ?? {} as ValueBreakdown,
      verdict: this.computeVerdict(parseFloat(row.regenerative_value_score as string)),
      createdAt: row.created_at as string,
    };
  }
}

export const regenerativeEconomyEngine = new RegenerativeEconomyEngine();
export default regenerativeEconomyEngine;
