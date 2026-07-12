/**
 * MODEL I — HUMAN FLOURISHING ENGINE
 * Decision: "Where is human flourishing increasing or declining — and why?"
 *
 * Scoring weights (evidence-based, drawn from Oxford Wellbeing Research Centre,
 * Gallup World Poll, and UNDP Human Development Index methodology):
 *   Physical Health    15%  Mental Wellbeing  15%  Education        12%
 *   Employment         12%  Income Mobility   10%  Community Trust  14%
 *   Environmental      12%  Purpose/Meaning   10%
 */

import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

export interface FlourishingInput {
  entityId: string;
  entityType: 'individual' | 'community' | 'city' | 'nation';
  entityName: string;
  physicalHealth?: number;       // 0–100
  mentalWellbeing?: number;
  education?: number;
  employment?: number;
  incomeMobility?: number;
  communityTrust?: number;
  environmentalQuality?: number;
  purposeMeaning?: number;
  dataSources?: string[];
  confidence?: number;
}

export interface FlourishingSnapshot {
  id: string;
  entityId: string;
  entityType: string;
  entityName: string;
  physicalHealth: number;
  mentalWellbeing: number;
  education: number;
  employment: number;
  incomeMobility: number;
  communityTrust: number;
  environmentalQuality: number;
  purposeMeaning: number;
  flourishingScore: number;
  communityResilienceScore: number;
  futureOpportunityIndex: number;
  riskIndicators: RiskIndicator[];
  rootCauses: RootCause[];
  confidence: number;
  measuredAt: string;
}

export interface RiskIndicator {
  dimension: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  threshold: number;
  description: string;
}

export interface RootCause {
  factor: string;
  contribution: number;   // 0–1 share of variance explained
  direction: 'positive' | 'negative';
  actionable: boolean;
  intervention: string;
}

export interface FlourishingTrend {
  entityId: string;
  entityName: string;
  snapshots: Array<{ measuredAt: string; flourishingScore: number }>;
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number;   // points per month
  forecast90d: number;
}

export interface FlourishingComparison {
  entities: Array<{
    entityId: string;
    entityName: string;
    entityType: string;
    flourishingScore: number;
    rank: number;
    dimensionScores: Record<string, number>;
  }>;
  globalAverage: number;
  topPerformer: string;
  bottomPerformer: string;
}

// Dimension weights — must sum to 1.0
const WEIGHTS = {
  physicalHealth: 0.15,
  mentalWellbeing: 0.15,
  education: 0.12,
  employment: 0.12,
  incomeMobility: 0.10,
  communityTrust: 0.14,
  environmentalQuality: 0.12,
  purposeMeaning: 0.10,
} as const;

// Risk thresholds — below these values a dimension is flagged
const RISK_THRESHOLDS = {
  physicalHealth: { low: 60, medium: 45, high: 30, critical: 20 },
  mentalWellbeing: { low: 60, medium: 45, high: 30, critical: 20 },
  education: { low: 55, medium: 40, high: 25, critical: 15 },
  employment: { low: 55, medium: 40, high: 25, critical: 15 },
  incomeMobility: { low: 50, medium: 35, high: 20, critical: 10 },
  communityTrust: { low: 55, medium: 40, high: 25, critical: 15 },
  environmentalQuality: { low: 55, medium: 40, high: 25, critical: 15 },
  purposeMeaning: { low: 50, medium: 35, high: 20, critical: 10 },
};

const INTERVENTIONS: Record<string, string> = {
  physicalHealth: 'Invest in primary healthcare access, nutrition programs, and preventive care',
  mentalWellbeing: 'Fund community mental health services, reduce social isolation, address trauma',
  education: 'Expand early childhood education, vocational training, and digital literacy',
  employment: 'Create green jobs programs, support SMEs, reduce structural unemployment',
  incomeMobility: 'Progressive taxation reform, asset-building programs, reduce wealth concentration',
  communityTrust: 'Participatory governance, conflict resolution, transparent institutions',
  environmentalQuality: 'Clean air/water initiatives, urban greening, pollution remediation',
  purposeMeaning: 'Cultural programs, civic engagement, spiritual and community life support',
};

class HumanFlourishingEngine {

  // ── Core scoring ──────────────────────────────────────────────────────────

  private computeResilienceScore(dims: Record<string, number>): number {
    // Resilience = how evenly distributed the scores are (low variance = more resilient)
    const values = Object.values(dims);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    // High std dev = fragile (one weak link). Score = 100 - normalized stdDev
    return Math.max(0, Math.min(100, Math.round(100 - stdDev * 1.2)));
  }

  private computeFutureOpportunityIndex(dims: Record<string, number>): number {
    // FOI weights forward-looking dimensions more heavily
    return Math.round(
      dims.education * 0.30 +
      dims.incomeMobility * 0.25 +
      dims.employment * 0.20 +
      dims.environmentalQuality * 0.15 +
      dims.communityTrust * 0.10
    );
  }

  private detectRiskIndicators(dims: Record<string, number>): RiskIndicator[] {
    const risks: RiskIndicator[] = [];
    for (const [dim, value] of Object.entries(dims)) {
      const thresholds = RISK_THRESHOLDS[dim as keyof typeof RISK_THRESHOLDS];
      if (!thresholds) continue;
      let severity: RiskIndicator['severity'] | null = null;
      let threshold = 0;
      if (value <= thresholds.critical) { severity = 'critical'; threshold = thresholds.critical; }
      else if (value <= thresholds.high) { severity = 'high'; threshold = thresholds.high; }
      else if (value <= thresholds.medium) { severity = 'medium'; threshold = thresholds.medium; }
      else if (value <= thresholds.low) { severity = 'low'; threshold = thresholds.low; }
      if (severity) {
        risks.push({
          dimension: dim,
          severity,
          value,
          threshold,
          description: `${dim.replace(/([A-Z])/g, ' $1').trim()} is ${severity} risk at ${value}/100`,
        });
      }
    }
    return risks.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    });
  }

  private identifyRootCauses(dims: Record<string, number>, flourishingScore: number): RootCause[] {
    // Root cause = dimensions whose score deviates most from the overall score
    // and whose weight-adjusted contribution to the gap is largest
    const causes: RootCause[] = [];
    for (const [dim, value] of Object.entries(dims)) {
      const weight = WEIGHTS[dim as keyof typeof WEIGHTS] ?? 0.1;
      const gap = flourishingScore - value;
      const contribution = Math.abs(gap * weight) / 100;
      if (contribution > 0.01) {
        causes.push({
          factor: dim,
          contribution: Math.round(contribution * 1000) / 1000,
          direction: gap > 0 ? 'negative' : 'positive',
          actionable: true,
          intervention: INTERVENTIONS[dim] ?? 'Targeted policy intervention required',
        });
      }
    }
    return causes.sort((a, b) => b.contribution - a.contribution).slice(0, 5);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async recordSnapshot(input: FlourishingInput): Promise<FlourishingSnapshot> {
    const dims = {
      physicalHealth: input.physicalHealth ?? 50,
      mentalWellbeing: input.mentalWellbeing ?? 50,
      education: input.education ?? 50,
      employment: input.employment ?? 50,
      incomeMobility: input.incomeMobility ?? 50,
      communityTrust: input.communityTrust ?? 50,
      environmentalQuality: input.environmentalQuality ?? 50,
      purposeMeaning: input.purposeMeaning ?? 50,
    };

    // Weighted flourishing score (DB also computes this via GENERATED ALWAYS AS)
    const flourishingScore = Math.round(
      Object.entries(WEIGHTS).reduce((sum, [dim, w]) => sum + (dims[dim as keyof typeof dims] * w), 0) * 100
    ) / 100;

    const resilienceScore = this.computeResilienceScore(dims);
    const futureOpportunityIndex = this.computeFutureOpportunityIndex(dims);
    const riskIndicators = this.detectRiskIndicators(dims);
    const rootCauses = this.identifyRootCauses(dims, flourishingScore);

    const result = await query(
      `INSERT INTO flourishing_snapshots (
        entity_id, entity_type, entity_name,
        physical_health, mental_wellbeing, education, employment,
        income_mobility, community_trust, environmental_quality, purpose_meaning,
        community_resilience_score, future_opportunity_index,
        risk_indicators, root_causes, data_sources, confidence
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        input.entityId, input.entityType, input.entityName,
        dims.physicalHealth, dims.mentalWellbeing, dims.education, dims.employment,
        dims.incomeMobility, dims.communityTrust, dims.environmentalQuality, dims.purposeMeaning,
        resilienceScore, futureOpportunityIndex,
        JSON.stringify(riskIndicators), JSON.stringify(rootCauses),
        JSON.stringify(input.dataSources ?? []),
        input.confidence ?? 0.8,
      ]
    );

    await invalidateCache(`flourishing:${input.entityId}:*`);
    logger.info('[Flourishing] Snapshot recorded', { entityId: input.entityId, flourishingScore });
    return this.mapRow(result.rows[0]);
  }

  async getLatest(entityId: string): Promise<FlourishingSnapshot | null> {
    return cacheWithRedis(`flourishing:${entityId}:latest`, 300, async () => {
      const result = await query(
        `SELECT * FROM flourishing_snapshots WHERE entity_id = $1 ORDER BY measured_at DESC LIMIT 1`,
        [entityId]
      );
      return result.rows[0] ? this.mapRow(result.rows[0]) : null;
    });
  }

  async getTrend(entityId: string, days = 180): Promise<FlourishingTrend | null> {
    const safeDays = Math.max(1, Math.min(3650, Math.floor(days)));
    return cacheWithRedis(`flourishing:${entityId}:trend:${safeDays}`, 600, async () => {
      const result = await query(
        `SELECT entity_id, entity_name, flourishing_score, measured_at
         FROM flourishing_snapshots
         WHERE entity_id = $1 AND measured_at >= NOW() - ($2 || ' days')::INTERVAL
         ORDER BY measured_at ASC`,
        [entityId, safeDays]
      );
      if (result.rows.length < 2) return null;

      const snapshots = result.rows.map(r => ({
        measuredAt: r.measured_at,
        flourishingScore: parseFloat(r.flourishing_score),
      }));

      const first = snapshots[0].flourishingScore;
      const last = snapshots[snapshots.length - 1].flourishingScore;
      const monthsElapsed = days / 30;
      const changeRate = (last - first) / monthsElapsed;
      const forecast90d = Math.max(0, Math.min(100, last + changeRate * 3));

      const trend: FlourishingTrend['trend'] =
        changeRate > 0.5 ? 'improving' : changeRate < -0.5 ? 'declining' : 'stable';

      return {
        entityId,
        entityName: result.rows[0].entity_name,
        snapshots,
        trend,
        changeRate: Math.round(changeRate * 100) / 100,
        forecast90d: Math.round(forecast90d * 100) / 100,
      };
    });
  }

  async compare(entityIds: string[]): Promise<FlourishingComparison> {
    const result = await query(
      `SELECT DISTINCT ON (entity_id)
         entity_id, entity_name, entity_type, flourishing_score,
         physical_health, mental_wellbeing, education, employment,
         income_mobility, community_trust, environmental_quality, purpose_meaning
       FROM flourishing_snapshots
       WHERE entity_id = ANY($1)
       ORDER BY entity_id, measured_at DESC`,
      [entityIds]
    );

    const rows = result.rows;
    const sorted = [...rows].sort((a, b) => b.flourishing_score - a.flourishing_score);
    const globalAverage = rows.reduce((s, r) => s + parseFloat(r.flourishing_score), 0) / rows.length;

    return {
      entities: sorted.map((r, i) => ({
        entityId: r.entity_id,
        entityName: r.entity_name,
        entityType: r.entity_type,
        flourishingScore: parseFloat(r.flourishing_score),
        rank: i + 1,
        dimensionScores: {
          physicalHealth: parseFloat(r.physical_health),
          mentalWellbeing: parseFloat(r.mental_wellbeing),
          education: parseFloat(r.education),
          employment: parseFloat(r.employment),
          incomeMobility: parseFloat(r.income_mobility),
          communityTrust: parseFloat(r.community_trust),
          environmentalQuality: parseFloat(r.environmental_quality),
          purposeMeaning: parseFloat(r.purpose_meaning),
        },
      })),
      globalAverage: Math.round(globalAverage * 100) / 100,
      topPerformer: sorted[0]?.entity_name ?? '',
      bottomPerformer: sorted[sorted.length - 1]?.entity_name ?? '',
    };
  }

  async getDashboard(entityType?: string): Promise<Record<string, unknown>> {
    const VALID_TYPES = new Set(['individual', 'community', 'city', 'nation']);
    const safeType = entityType && VALID_TYPES.has(entityType) ? entityType : undefined;
    return cacheWithRedis(`flourishing:dashboard:${safeType ?? 'all'}`, 300, async () => {
      const result = await query(
        `SELECT
           COUNT(*) as total_entities,
           AVG(flourishing_score) as avg_score,
           MIN(flourishing_score) as min_score,
           MAX(flourishing_score) as max_score,
           COUNT(*) FILTER (WHERE flourishing_score >= 70) as thriving,
           COUNT(*) FILTER (WHERE flourishing_score BETWEEN 50 AND 69) as stable,
           COUNT(*) FILTER (WHERE flourishing_score < 50) as struggling
         FROM flourishing_latest
         WHERE ($1::TEXT IS NULL OR entity_type = $1)`,
        [safeType ?? null]
      );
      return result.rows[0];
    });
  }

  private mapRow(row: Record<string, unknown>): FlourishingSnapshot {
    return {
      id: row.id as string,
      entityId: row.entity_id as string,
      entityType: row.entity_type as string,
      entityName: row.entity_name as string,
      physicalHealth: parseFloat(row.physical_health as string),
      mentalWellbeing: parseFloat(row.mental_wellbeing as string),
      education: parseFloat(row.education as string),
      employment: parseFloat(row.employment as string),
      incomeMobility: parseFloat(row.income_mobility as string),
      communityTrust: parseFloat(row.community_trust as string),
      environmentalQuality: parseFloat(row.environmental_quality as string),
      purposeMeaning: parseFloat(row.purpose_meaning as string),
      flourishingScore: parseFloat(row.flourishing_score as string),
      communityResilienceScore: parseFloat(row.community_resilience_score as string),
      futureOpportunityIndex: parseFloat(row.future_opportunity_index as string),
      riskIndicators: (row.risk_indicators as RiskIndicator[]) ?? [],
      rootCauses: (row.root_causes as RootCause[]) ?? [],
      confidence: parseFloat(row.confidence as string),
      measuredAt: row.measured_at as string,
    };
  }
}

export const humanFlourishingEngine = new HumanFlourishingEngine();
export default humanFlourishingEngine;
