/**
 * MODEL V — ECOSYSTEM INTELLIGENCE ENGINE
 * Decision: "Is this ecosystem recovering or dying — and what do we do before crisis?"
 *
 * Composite health score weights (IUCN Red List of Ecosystems methodology):
 *   Carbon    20%  Water    20%  Biodiversity  25%
 *   Soil      20%  Resilience 15%
 */

import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

export interface EcosystemInput {
  regionId: string;
  regionName: string;
  regionType: 'forest' | 'wetland' | 'grassland' | 'ocean' | 'river' | 'urban_green' | 'agricultural' | 'coral_reef' | 'tundra' | 'other';
  areaHectares?: number;
  carbonScore?: number;       // 0–100
  waterScore?: number;
  biodiversityScore?: number;
  soilScore?: number;
  resilienceScore?: number;
  dataSources?: string[];
  lastSatellitePass?: string;
  sensorCount?: number;
  rawMeasurements?: Record<string, unknown>;
}

export interface EcosystemAssessment {
  id: string;
  regionId: string;
  regionName: string;
  regionType: string;
  areaHectares: number;
  ecosystemHealthScore: number;
  carbonScore: number;
  waterScore: number;
  biodiversityScore: number;
  soilScore: number;
  resilienceScore: number;
  trend: 'recovering' | 'stable' | 'degrading' | 'critical' | 'unknown';
  trendConfidence: number;
  restorationOpportunities: RestorationOpportunity[];
  environmentalAlerts: EnvironmentalAlert[];
  scenarios: EcosystemScenarios;
  assessedAt: string;
}

export interface RestorationOpportunity {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCostUsd: number;
  estimatedBenefitUsd: number;
  roi: number;
  timeToImpactYears: number;
  description: string;
  methodology: string;
}

export interface EnvironmentalAlert {
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentValue: number;
  threshold: number;
  description: string;
  recommendedAction: string;
}

export interface EcosystemScenarios {
  baseline: ScenarioProjection;
  intervention: ScenarioProjection;
  worstCase: ScenarioProjection;
}

export interface ScenarioProjection {
  name: string;
  year5Score: number;
  year10Score: number;
  year25Score: number;
  carbonSequestrationT: number;
  biodiversityTrend: string;
  keyAssumptions: string[];
}

// Health score weights
const HEALTH_WEIGHTS = {
  carbon: 0.20,
  water: 0.20,
  biodiversity: 0.25,
  soil: 0.20,
  resilience: 0.15,
};

// Alert thresholds per metric
const ALERT_THRESHOLDS = {
  carbonScore: { critical: 20, high: 35, medium: 50 },
  waterScore: { critical: 20, high: 35, medium: 50 },
  biodiversityScore: { critical: 25, high: 40, medium: 55 },
  soilScore: { critical: 20, high: 35, medium: 50 },
  resilienceScore: { critical: 25, high: 40, medium: 55 },
};

// Restoration cost/benefit by region type (USD per hectare)
const RESTORATION_ECONOMICS: Record<string, { costPerHa: number; benefitPerHa: number; timeYears: number }> = {
  forest: { costPerHa: 1200, benefitPerHa: 8500, timeYears: 10 },
  wetland: { costPerHa: 2500, benefitPerHa: 15000, timeYears: 5 },
  grassland: { costPerHa: 400, benefitPerHa: 2800, timeYears: 3 },
  ocean: { costPerHa: 800, benefitPerHa: 12000, timeYears: 8 },
  coral_reef: { costPerHa: 5000, benefitPerHa: 35000, timeYears: 15 },
  agricultural: { costPerHa: 600, benefitPerHa: 3500, timeYears: 4 },
  river: { costPerHa: 1800, benefitPerHa: 9000, timeYears: 6 },
  urban_green: { costPerHa: 3000, benefitPerHa: 18000, timeYears: 3 },
  tundra: { costPerHa: 200, benefitPerHa: 4000, timeYears: 20 },
  other: { costPerHa: 1000, benefitPerHa: 5000, timeYears: 7 },
};

class EcosystemIntelligenceEngine {

  private computeHealthScore(scores: { carbon: number; water: number; biodiversity: number; soil: number; resilience: number }): number {
    return Math.round(
      scores.carbon * HEALTH_WEIGHTS.carbon +
      scores.water * HEALTH_WEIGHTS.water +
      scores.biodiversity * HEALTH_WEIGHTS.biodiversity +
      scores.soil * HEALTH_WEIGHTS.soil +
      scores.resilience * HEALTH_WEIGHTS.resilience
    );
  }

  private detectAlerts(scores: Record<string, number>): EnvironmentalAlert[] {
    const alerts: EnvironmentalAlert[] = [];
    const descriptions: Record<string, string> = {
      carbonScore: 'Carbon sequestration capacity is critically low — ecosystem may be a net emitter',
      waterScore: 'Water quality and availability are severely degraded',
      biodiversityScore: 'Species diversity is collapsing — ecosystem function at risk',
      soilScore: 'Soil health is critically degraded — regeneration capacity compromised',
      resilienceScore: 'Ecosystem resilience is low — vulnerable to disturbance and collapse',
    };
    const actions: Record<string, string> = {
      carbonScore: 'Implement immediate reforestation and soil carbon programs',
      waterScore: 'Deploy water quality monitoring and restoration interventions',
      biodiversityScore: 'Establish protected corridors and invasive species management',
      soilScore: 'Initiate regenerative agriculture and soil microbiome restoration',
      resilienceScore: 'Reduce stressors and implement adaptive management protocols',
    };

    for (const [metric, thresholds] of Object.entries(ALERT_THRESHOLDS)) {
      const value = scores[metric] ?? 50;
      let severity: EnvironmentalAlert['severity'] | null = null;
      let threshold = 0;
      if (value <= thresholds.critical) { severity = 'critical'; threshold = thresholds.critical; }
      else if (value <= thresholds.high) { severity = 'high'; threshold = thresholds.high; }
      else if (value <= thresholds.medium) { severity = 'medium'; threshold = thresholds.medium; }
      if (severity) {
        alerts.push({
          metric,
          severity,
          currentValue: value,
          threshold,
          description: descriptions[metric] ?? `${metric} below threshold`,
          recommendedAction: actions[metric] ?? 'Immediate assessment required',
        });
      }
    }
    return alerts.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    });
  }

  private generateRestorationOpportunities(
    regionType: string,
    areaHa: number,
    healthScore: number,
    alerts: EnvironmentalAlert[]
  ): RestorationOpportunity[] {
    const economics = RESTORATION_ECONOMICS[regionType] ?? RESTORATION_ECONOMICS.other;
    const opportunities: RestorationOpportunity[] = [];

    if (healthScore < 70) {
      const cost = economics.costPerHa * areaHa;
      const benefit = economics.benefitPerHa * areaHa;
      opportunities.push({
        type: 'Full Ecosystem Restoration',
        priority: healthScore < 40 ? 'critical' : healthScore < 55 ? 'high' : 'medium',
        estimatedCostUsd: Math.round(cost),
        estimatedBenefitUsd: Math.round(benefit),
        roi: Math.round((benefit / cost) * 100) / 100,
        timeToImpactYears: economics.timeYears,
        description: `Comprehensive restoration of ${areaHa.toLocaleString()} ha ${regionType} ecosystem`,
        methodology: 'IUCN Ecosystem Restoration Standard v2.0',
      });
    }

    for (const alert of alerts.filter(a => a.severity === 'critical' || a.severity === 'high')) {
      const metricOpportunities: Record<string, RestorationOpportunity> = {
        biodiversityScore: {
          type: 'Biodiversity Corridor Creation',
          priority: alert.severity as 'high' | 'critical',
          estimatedCostUsd: Math.round(areaHa * 300),
          estimatedBenefitUsd: Math.round(areaHa * 2200),
          roi: 7.3,
          timeToImpactYears: 5,
          description: 'Establish wildlife corridors and native species reintroduction program',
          methodology: 'CBD Kunming-Montreal Framework Target 2',
        },
        carbonScore: {
          type: 'Carbon Sequestration Enhancement',
          priority: alert.severity as 'high' | 'critical',
          estimatedCostUsd: Math.round(areaHa * 450),
          estimatedBenefitUsd: Math.round(areaHa * 3800),
          roi: 8.4,
          timeToImpactYears: 8,
          description: 'Agroforestry, biochar application, and soil carbon enhancement',
          methodology: 'Verra VCS VM0042',
        },
        waterScore: {
          type: 'Watershed Restoration',
          priority: alert.severity as 'high' | 'critical',
          estimatedCostUsd: Math.round(areaHa * 600),
          estimatedBenefitUsd: Math.round(areaHa * 4500),
          roi: 7.5,
          timeToImpactYears: 4,
          description: 'Riparian buffer restoration, wetland creation, and water quality improvement',
          methodology: 'EPA Watershed Restoration Framework',
        },
      };
      if (metricOpportunities[alert.metric]) {
        opportunities.push(metricOpportunities[alert.metric]);
      }
    }

    return opportunities.slice(0, 5);
  }

  private projectScenarios(healthScore: number, regionType: string, areaHa: number): EcosystemScenarios {
    const economics = RESTORATION_ECONOMICS[regionType] ?? RESTORATION_ECONOMICS.other;

    // Baseline: current trajectory without intervention
    const degradationRate = healthScore < 50 ? -2.5 : healthScore < 65 ? -1.0 : -0.3;
    const baseline: ScenarioProjection = {
      name: 'Business as Usual',
      year5Score: Math.max(0, Math.round(healthScore + degradationRate * 5)),
      year10Score: Math.max(0, Math.round(healthScore + degradationRate * 10)),
      year25Score: Math.max(0, Math.round(healthScore + degradationRate * 25)),
      carbonSequestrationT: Math.round(areaHa * (healthScore / 100) * 2.5 * 25),
      biodiversityTrend: degradationRate < -1.5 ? 'Rapid decline' : degradationRate < -0.5 ? 'Slow decline' : 'Stable',
      keyAssumptions: ['No new interventions', 'Current land use continues', 'Climate change baseline RCP4.5'],
    };

    // Intervention: with full restoration program
    const recoveryRate = 3.5;
    const intervention: ScenarioProjection = {
      name: 'Full Restoration Program',
      year5Score: Math.min(100, Math.round(healthScore + recoveryRate * 5)),
      year10Score: Math.min(100, Math.round(healthScore + recoveryRate * 10)),
      year25Score: Math.min(100, Math.round(Math.min(95, healthScore + recoveryRate * 25))),
      carbonSequestrationT: Math.round(areaHa * 0.85 * 4.2 * 25),
      biodiversityTrend: 'Recovering — 40% species richness increase projected',
      keyAssumptions: [
        `Investment of $${(economics.costPerHa * areaHa).toLocaleString()} over 5 years`,
        'Community co-management established',
        'Protected area designation secured',
      ],
    };

    // Worst case: accelerated degradation
    const worstCase: ScenarioProjection = {
      name: 'Accelerated Degradation',
      year5Score: Math.max(0, Math.round(healthScore - 5 * 5)),
      year10Score: Math.max(0, Math.round(healthScore - 5 * 10)),
      year25Score: Math.max(0, Math.round(healthScore - 5 * 25)),
      carbonSequestrationT: Math.round(areaHa * 0.2 * 1.0 * 25),
      biodiversityTrend: 'Collapse — functional extinction of keystone species',
      keyAssumptions: ['Climate change RCP8.5', 'Increased land conversion pressure', 'No governance intervention'],
    };

    return { baseline, intervention, worstCase };
  }

  private computeTrend(healthScore: number, previousScore?: number): { trend: EcosystemAssessment['trend']; confidence: number } {
    if (!previousScore) return { trend: 'unknown', confidence: 0.5 };
    const delta = healthScore - previousScore;
    if (delta > 3) return { trend: 'recovering', confidence: 0.8 };
    if (delta < -5) return { trend: 'critical', confidence: 0.85 };
    if (delta < -2) return { trend: 'degrading', confidence: 0.8 };
    return { trend: 'stable', confidence: 0.75 };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async assess(input: EcosystemInput): Promise<EcosystemAssessment> {
    const scores = {
      carbon: input.carbonScore ?? 50,
      water: input.waterScore ?? 50,
      biodiversity: input.biodiversityScore ?? 50,
      soil: input.soilScore ?? 50,
      resilience: input.resilienceScore ?? 50,
    };

    const healthScore = this.computeHealthScore(scores);
    const areaHa = input.areaHectares ?? 1;

    // Get previous assessment for trend
    const prevResult = await query(
      `SELECT ecosystem_health_score FROM ecosystem_intelligence WHERE region_id = $1 ORDER BY assessed_at DESC LIMIT 1`,
      [input.regionId]
    );
    const previousScore = prevResult.rows[0] ? parseFloat(prevResult.rows[0].ecosystem_health_score) : undefined;
    const { trend, confidence } = this.computeTrend(healthScore, previousScore);

    const alerts = this.detectAlerts({
      carbonScore: scores.carbon, waterScore: scores.water,
      biodiversityScore: scores.biodiversity, soilScore: scores.soil, resilienceScore: scores.resilience,
    });
    const restorationOpportunities = this.generateRestorationOpportunities(input.regionType, areaHa, healthScore, alerts);
    const scenarios = this.projectScenarios(healthScore, input.regionType, areaHa);

    const result = await query(
      `INSERT INTO ecosystem_intelligence (
        region_id, region_name, region_type, area_hectares,
        ecosystem_health_score, carbon_score, water_score, biodiversity_score, soil_score, resilience_score,
        trend, trend_confidence, restoration_opportunities, environmental_alerts,
        scenario_baseline, scenario_intervention, scenario_worst_case,
        data_sources, last_satellite_pass, sensor_count
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *`,
      [
        input.regionId, input.regionName, input.regionType, areaHa,
        healthScore, scores.carbon, scores.water, scores.biodiversity, scores.soil, scores.resilience,
        trend, confidence,
        JSON.stringify(restorationOpportunities), JSON.stringify(alerts),
        JSON.stringify(scenarios.baseline), JSON.stringify(scenarios.intervention), JSON.stringify(scenarios.worstCase),
        input.dataSources ?? [], input.lastSatellitePass ?? null, input.sensorCount ?? 0,
      ]
    );

    await invalidateCache(`ecosystem:${input.regionId}:*`);
    logger.info('[Ecosystem] Assessment complete', { regionId: input.regionId, healthScore, trend });

    return this.mapRow(result.rows[0], restorationOpportunities, alerts, scenarios);
  }

  async getLatest(regionId: string): Promise<EcosystemAssessment | null> {
    return cacheWithRedis(`ecosystem:${regionId}:latest`, 300, async () => {
      const result = await query(
        `SELECT * FROM ecosystem_intelligence WHERE region_id = $1 ORDER BY assessed_at DESC LIMIT 1`,
        [regionId]
      );
      if (!result.rows[0]) return null;
      return this.mapRow(result.rows[0]);
    });
  }

  async getGlobalDashboard(): Promise<Record<string, unknown>> {
    return cacheWithRedis('ecosystem:global:dashboard', 300, async () => {
      const result = await query(
        `SELECT
           COUNT(*) as total_regions,
           AVG(ecosystem_health_score) as avg_health,
           COUNT(*) FILTER (WHERE trend = 'recovering') as recovering,
           COUNT(*) FILTER (WHERE trend = 'stable') as stable,
           COUNT(*) FILTER (WHERE trend = 'degrading') as degrading,
           COUNT(*) FILTER (WHERE trend = 'critical') as critical,
           SUM(area_hectares) as total_area_ha
         FROM ecosystem_intelligence_latest`
      );
      return result.rows[0];
    });
  }

  async getCriticalRegions(limit = 10): Promise<EcosystemAssessment[]> {
    const result = await query(
      `SELECT * FROM ecosystem_intelligence_latest
       WHERE trend IN ('critical','degrading')
       ORDER BY ecosystem_health_score ASC LIMIT $1`,
      [limit]
    );
    return result.rows.map((r: any) => this.mapRow(r));
  }

  async getHistory(regionId: string, days = 365): Promise<Array<{ assessedAt: string; healthScore: number; trend: string }>> {
    const safeDays = Math.max(1, Math.min(3650, Math.floor(days)));
    const result = await query(
      `SELECT assessed_at, ecosystem_health_score, trend
       FROM ecosystem_intelligence
       WHERE region_id = $1 AND assessed_at >= NOW() - ($2 || ' days')::INTERVAL
       ORDER BY assessed_at ASC`,
      [regionId, safeDays]
    );
    return result.rows.map((r: any) => ({
      assessedAt: r.assessed_at,
      healthScore: parseFloat(r.ecosystem_health_score),
      trend: r.trend,
    }));
  }

  private mapRow(row: Record<string, unknown>, opportunities?: RestorationOpportunity[], alerts?: EnvironmentalAlert[], scenarios?: EcosystemScenarios): EcosystemAssessment {
    return {
      id: row.id as string,
      regionId: row.region_id as string,
      regionName: row.region_name as string,
      regionType: row.region_type as string,
      areaHectares: parseFloat(row.area_hectares as string),
      ecosystemHealthScore: parseFloat(row.ecosystem_health_score as string),
      carbonScore: parseFloat(row.carbon_score as string),
      waterScore: parseFloat(row.water_score as string),
      biodiversityScore: parseFloat(row.biodiversity_score as string),
      soilScore: parseFloat(row.soil_score as string),
      resilienceScore: parseFloat(row.resilience_score as string),
      trend: row.trend as EcosystemAssessment['trend'],
      trendConfidence: parseFloat(row.trend_confidence as string),
      restorationOpportunities: opportunities ?? (row.restoration_opportunities as RestorationOpportunity[]) ?? [],
      environmentalAlerts: alerts ?? (row.environmental_alerts as EnvironmentalAlert[]) ?? [],
      scenarios: scenarios ?? {
        baseline: (row.scenario_baseline as ScenarioProjection) ?? {} as ScenarioProjection,
        intervention: (row.scenario_intervention as ScenarioProjection) ?? {} as ScenarioProjection,
        worstCase: (row.scenario_worst_case as ScenarioProjection) ?? {} as ScenarioProjection,
      },
      assessedAt: row.assessed_at as string,
    };
  }
}

export const ecosystemIntelligenceEngine = new EcosystemIntelligenceEngine();
export default ecosystemIntelligenceEngine;
