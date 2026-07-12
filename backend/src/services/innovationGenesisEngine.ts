/**
 * MODEL III — INNOVATION GENESIS ENGINE
 * Decision: "What breakthrough should we fund next?"
 *
 * Acts as an innovation telescope: detects intersections between
 * science, technology, economics, and human needs before they become obvious.
 */

import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

export interface InnovationSignalInput {
  signalType: 'paper' | 'patent' | 'startup' | 'grant' | 'challenge' | 'technology' | 'societal_need' | 'market_gap';
  title: string;
  description?: string;
  sourceUrl?: string;
  sourceDomain?: string;
  tags?: string[];
  intersectingDomains?: string[];
  rawData?: Record<string, unknown>;
}

export interface InnovationSignal {
  id: string;
  signalType: string;
  title: string;
  description: string;
  tags: string[];
  innovationProbability: number;
  adoptionForecastYrs: number;
  breakthroughPotential: number;
  intersectingDomains: string[];
  opportunityMap: Record<string, unknown>;
  detectedAt: string;
}

export interface InnovationOpportunity {
  id: string;
  title: string;
  description: string;
  domains: string[];
  opportunityScore: number;
  timeHorizonYrs: number;
  marketSizeUsd: number;
  keyDependencies: string[];
  recommendedActions: string[];
  status: string;
  signalCount: number;
}

// Domain intersection scoring — pairs that historically produce breakthroughs
const DOMAIN_SYNERGIES: Record<string, string[]> = {
  'ai': ['biology', 'climate', 'materials', 'health', 'agriculture'],
  'blockchain': ['identity', 'carbon', 'supply_chain', 'governance', 'finance'],
  'synthetic_biology': ['agriculture', 'materials', 'medicine', 'carbon'],
  'quantum': ['cryptography', 'materials', 'drug_discovery', 'optimization'],
  'satellite': ['agriculture', 'carbon', 'biodiversity', 'disaster_response'],
  'iot': ['agriculture', 'health', 'energy', 'water', 'biodiversity'],
  'regenerative_agriculture': ['carbon', 'biodiversity', 'food_security', 'water'],
};

class InnovationGenesisEngine {

  private scoreInnovationProbability(input: InnovationSignalInput): number {
    let score = 0.4; // baseline
    // More intersecting domains = higher probability
    const domains = input.intersectingDomains ?? [];
    score += Math.min(0.3, domains.length * 0.06);
    // Known high-synergy domain pairs
    for (const d of domains) {
      const synergies = DOMAIN_SYNERGIES[d] ?? [];
      const overlap = domains.filter(x => synergies.includes(x)).length;
      score += overlap * 0.04;
    }
    // Signal type weights
    const typeBoosts: Record<string, number> = {
      paper: 0.05, patent: 0.08, startup: 0.10,
      grant: 0.06, challenge: 0.04, technology: 0.07,
      societal_need: 0.03, market_gap: 0.09,
    };
    score += typeBoosts[input.signalType] ?? 0;
    return Math.round(Math.min(0.99, score) * 1000) / 1000;
  }

  private estimateAdoptionForecast(input: InnovationSignalInput, probability: number): number {
    // Higher probability = faster adoption
    const base = 12; // years
    const reduction = probability * 8;
    const typeAdjust: Record<string, number> = {
      startup: -2, technology: -1, paper: 2, patent: 1,
      grant: 0, challenge: -1, societal_need: 3, market_gap: -1,
    };
    return Math.max(1, Math.round((base - reduction + (typeAdjust[input.signalType] ?? 0)) * 10) / 10);
  }

  private buildOpportunityMap(input: InnovationSignalInput): Record<string, unknown> {
    const domains = input.intersectingDomains ?? [];
    const opportunities: string[] = [];
    for (const d of domains) {
      const synergies = DOMAIN_SYNERGIES[d] ?? [];
      for (const s of synergies) {
        if (!domains.includes(s)) {
          opportunities.push(`${d} × ${s}`);
        }
      }
    }
    return {
      unexploredIntersections: opportunities.slice(0, 5),
      primaryDomain: domains[0] ?? 'general',
      convergenceScore: Math.min(1, domains.length / 5),
    };
  }

  async ingestSignal(input: InnovationSignalInput): Promise<InnovationSignal> {
    const innovationProbability = this.scoreInnovationProbability(input);
    const adoptionForecastYrs = this.estimateAdoptionForecast(input, innovationProbability);
    const breakthroughPotential = Math.round(
      (innovationProbability * 0.6 + Math.min(1, (input.intersectingDomains?.length ?? 0) / 5) * 0.4) * 1000
    ) / 1000;
    const opportunityMap = this.buildOpportunityMap(input);

    const result = await query(
      `INSERT INTO innovation_signals (
        signal_type, title, description, source_url, source_domain,
        tags, innovation_probability, adoption_forecast_yrs, breakthrough_potential,
        intersecting_domains, opportunity_map, raw_data
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        input.signalType, input.title, input.description ?? '',
        input.sourceUrl ?? null, input.sourceDomain ?? null,
        input.tags ?? [], innovationProbability, adoptionForecastYrs, breakthroughPotential,
        input.intersectingDomains ?? [], JSON.stringify(opportunityMap),
        JSON.stringify(input.rawData ?? {}),
      ]
    );

    await invalidateCache('innovation:*');
    logger.info('[Innovation] Signal ingested', { title: input.title, innovationProbability });
    return this.mapSignalRow(result.rows[0]);
  }

  async getTopSignals(limit = 20, signalType?: string): Promise<InnovationSignal[]> {
    const VALID_TYPES = new Set(['paper','patent','startup','grant','challenge','technology','societal_need','market_gap']);
    const safeType = signalType && VALID_TYPES.has(signalType) ? signalType : undefined;
    return cacheWithRedis(`innovation:signals:${safeType ?? 'all'}:${limit}`, 300, async () => {
      const result = await query(
        `SELECT * FROM innovation_signals
         WHERE ($1::TEXT IS NULL OR signal_type = $1)
         ORDER BY innovation_probability DESC, breakthrough_potential DESC
         LIMIT $2`,
        [safeType ?? null, limit]
      );
      return result.rows.map((r: any) => this.mapSignalRow(r));
    });
  }

  async detectOpportunities(): Promise<InnovationOpportunity[]> {
    return cacheWithRedis('innovation:opportunities', 600, async () => {
      const result = await query(
        `SELECT * FROM innovation_opportunities
         WHERE status IN ('emerging','validated')
         ORDER BY opportunity_score DESC LIMIT 20`
      );
      return result.rows.map((r: any) => this.mapOpportunityRow(r));
    });
  }

  async createOpportunity(data: {
    title: string;
    description: string;
    domains: string[];
    signalIds: string[];
    opportunityScore: number;
    timeHorizonYrs: number;
    marketSizeUsd: number;
    keyDependencies: string[];
    recommendedActions: string[];
  }): Promise<InnovationOpportunity> {
    const result = await query(
      `INSERT INTO innovation_opportunities (
        title, description, domains, signal_ids, opportunity_score,
        time_horizon_yrs, market_size_usd, key_dependencies, recommended_actions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        data.title, data.description, data.domains, data.signalIds,
        data.opportunityScore, data.timeHorizonYrs, data.marketSizeUsd,
        data.keyDependencies, JSON.stringify(data.recommendedActions),
      ]
    );
    await invalidateCache('innovation:opportunities');
    return this.mapOpportunityRow(result.rows[0]);
  }

  private mapSignalRow(r: Record<string, unknown>): InnovationSignal {
    return {
      id: r.id as string,
      signalType: r.signal_type as string,
      title: r.title as string,
      description: r.description as string,
      tags: (r.tags as string[]) ?? [],
      innovationProbability: parseFloat(r.innovation_probability as string),
      adoptionForecastYrs: parseFloat(r.adoption_forecast_yrs as string),
      breakthroughPotential: parseFloat(r.breakthrough_potential as string),
      intersectingDomains: (r.intersecting_domains as string[]) ?? [],
      opportunityMap: (r.opportunity_map as Record<string, unknown>) ?? {},
      detectedAt: r.detected_at as string,
    };
  }

  private mapOpportunityRow(r: Record<string, unknown>): InnovationOpportunity {
    return {
      id: r.id as string,
      title: r.title as string,
      description: r.description as string,
      domains: (r.domains as string[]) ?? [],
      opportunityScore: parseFloat(r.opportunity_score as string),
      timeHorizonYrs: parseFloat(r.time_horizon_yrs as string),
      marketSizeUsd: parseFloat(r.market_size_usd as string),
      keyDependencies: (r.key_dependencies as string[]) ?? [],
      recommendedActions: (r.recommended_actions as string[]) ?? [],
      status: r.status as string,
      signalCount: ((r.signal_ids as string[]) ?? []).length,
    };
  }
}

export const innovationGenesisEngine = new InnovationGenesisEngine();
export default innovationGenesisEngine;
