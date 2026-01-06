import { query } from '../db';
import { logSecurityEvent } from '../utils/logger';

export interface TrustScore {
  userId: string;
  currentScore: number;
  baseScore: number;
  contributions: TrustContribution[];
  decayRate: number;
  lastUpdated: Date;
  trustLevel: 'untrusted' | 'emerging' | 'established' | 'verified' | 'exemplary';
  riskFactors: string[];
}

export interface TrustContribution {
  id: string;
  type: 'verification' | 'governance' | 'community' | 'impact' | 'violation';
  value: number;
  weight: number;
  timestamp: Date;
  description: string;
  verifiedBy?: string;
  decayApplied: boolean;
}

export interface TrustEvent {
  userId: string;
  eventType: string;
  impact: number;
  description: string;
  metadata: Record<string, any>;
}

export class TrustAccumulationService {
  private static readonly BASE_TRUST_SCORE = 0.5;
  private static readonly MAX_TRUST_SCORE = 1.0;
  private static readonly MIN_TRUST_SCORE = 0.0;
  private static readonly DECAY_RATE = 0.05; // 5% per month without activity
  private static readonly SEVERE_VIOLATION_PENALTY = 0.8; // 80% trust loss
  private static readonly FRAUD_PENALTY = 0.95; // 95% trust loss

  /**
   * Initialize trust score for new user
   */
  async initializeTrust(userId: string): Promise<TrustScore> {
    const trustId = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO trust_scores (
        id, user_id, current_score, base_score, decay_rate, 
        trust_level, created_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, 'emerging', NOW(), NOW())
    `, [
      trustId, userId, TrustAccumulationService.BASE_TRUST_SCORE,
      TrustAccumulationService.BASE_TRUST_SCORE, TrustAccumulationService.DECAY_RATE
    ]);

    return {
      userId,
      currentScore: TrustAccumulationService.BASE_TRUST_SCORE,
      baseScore: TrustAccumulationService.BASE_TRUST_SCORE,
      contributions: [],
      decayRate: TrustAccumulationService.DECAY_RATE,
      lastUpdated: new Date(),
      trustLevel: 'emerging',
      riskFactors: []
    };
  }

  /**
   * Trust increases logarithmically with verified contributions
   */
  async addTrustContribution(
    userId: string,
    type: 'verification' | 'governance' | 'community' | 'impact' | 'violation',
    rawValue: number,
    description: string,
    verifiedBy?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const contributionId = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate logarithmic increase (diminishing returns)
    const weight = this.calculateContributionWeight(type, rawValue);
    const adjustedValue = type === 'violation' ? -Math.abs(rawValue) : Math.log(1 + Math.abs(rawValue)) * weight;

    // Store contribution
    await query(`
      INSERT INTO trust_contributions (
        id, user_id, type, raw_value, adjusted_value, weight, 
        description, verified_by, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      contributionId, userId, type, rawValue, adjustedValue, weight,
      description, verifiedBy, JSON.stringify(metadata)
    ]);

    // Update trust score
    await this.recalculateTrustScore(userId);

    logSecurityEvent('trust_contribution_added', userId, {
      contributionId,
      type,
      adjustedValue,
      description
    }, 'low');
  }

  /**
   * Apply severe drops on harm or fraud
   */
  async applyViolationPenalty(
    userId: string,
    violationType: 'minor' | 'major' | 'severe' | 'fraud',
    description: string,
    evidence: Record<string, any> = {}
  ): Promise<void> {
    let penaltyMultiplier: number;
    
    switch (violationType) {
      case 'minor':
        penaltyMultiplier = 0.1; // 10% reduction
        break;
      case 'major':
        penaltyMultiplier = 0.3; // 30% reduction
        break;
      case 'severe':
        penaltyMultiplier = TrustAccumulationService.SEVERE_VIOLATION_PENALTY;
        break;
      case 'fraud':
        penaltyMultiplier = TrustAccumulationService.FRAUD_PENALTY;
        break;
    }

    const currentTrust = await this.getTrustScore(userId);
    if (!currentTrust) return;

    const penaltyValue = currentTrust.currentScore * penaltyMultiplier;
    
    await this.addTrustContribution(
      userId,
      'violation',
      penaltyValue,
      `${violationType.toUpperCase()} VIOLATION: ${description}`,
      'system',
      { violationType, evidence }
    );

    // Log severe violations
    if (violationType === 'severe' || violationType === 'fraud') {
      logSecurityEvent('severe_trust_violation', userId, {
        violationType,
        penaltyValue,
        description,
        evidence
      }, 'critical');
    }
  }

  /**
   * Get current trust score with decay applied
   */
  async getTrustScore(userId: string): Promise<TrustScore | null> {
    const result = await query(`
      SELECT * FROM trust_scores WHERE user_id = $1
    `, [userId]);

    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    
    // Get contributions
    const contributions = await this.getTrustContributions(userId);
    
    // Apply decay
    const decayedScore = this.applyDecay(row.current_score, row.decay_rate, row.last_updated);
    
    // Determine trust level
    const trustLevel = this.determineTrustLevel(decayedScore);
    
    // Get risk factors
    const riskFactors = await this.assessRiskFactors(userId, contributions);

    // Update if decay was applied
    if (decayedScore !== row.current_score) {
      await query(`
        UPDATE trust_scores 
        SET current_score = $1, trust_level = $2, last_updated = NOW()
        WHERE user_id = $3
      `, [decayedScore, trustLevel, userId]);
    }

    return {
      userId,
      currentScore: decayedScore,
      baseScore: row.base_score,
      contributions,
      decayRate: row.decay_rate,
      lastUpdated: new Date(),
      trustLevel,
      riskFactors
    };
  }

  /**
   * Trust decays exponentially without activity
   */
  private applyDecay(currentScore: number, decayRate: number, lastUpdated: Date): number {
    const monthsElapsed = (Date.now() - lastUpdated.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const decayedScore = currentScore * Math.exp(-decayRate * monthsElapsed);
    
    return Math.max(decayedScore, TrustAccumulationService.MIN_TRUST_SCORE);
  }

  /**
   * Recalculate trust score based on all contributions
   */
  private async recalculateTrustScore(userId: string): Promise<void> {
    const contributions = await this.getTrustContributions(userId);
    
    // Start with base score
    let totalScore = TrustAccumulationService.BASE_TRUST_SCORE;
    
    // Add logarithmic contributions
    for (const contribution of contributions) {
      totalScore += contribution.value * contribution.weight;
    }
    
    // Ensure within bounds
    totalScore = Math.max(
      TrustAccumulationService.MIN_TRUST_SCORE,
      Math.min(TrustAccumulationService.MAX_TRUST_SCORE, totalScore)
    );
    
    const trustLevel = this.determineTrustLevel(totalScore);
    
    await query(`
      UPDATE trust_scores 
      SET current_score = $1, trust_level = $2, last_updated = NOW()
      WHERE user_id = $3
    `, [totalScore, trustLevel, userId]);
  }

  /**
   * Get trust contributions for user
   */
  private async getTrustContributions(userId: string): Promise<TrustContribution[]> {
    const result = await query(`
      SELECT * FROM trust_contributions 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      value: row.adjusted_value,
      weight: row.weight,
      timestamp: row.created_at,
      description: row.description,
      verifiedBy: row.verified_by,
      decayApplied: row.decay_applied || false
    }));
  }

  /**
   * Calculate contribution weight based on type and value
   */
  private calculateContributionWeight(
    type: string,
    value: number
  ): number {
    const baseWeights = {
      verification: 0.3,
      governance: 0.25,
      community: 0.2,
      impact: 0.4,
      violation: 1.0 // Full weight for violations
    };

    const baseWeight = baseWeights[type as keyof typeof baseWeights] || 0.1;
    
    // Adjust weight based on value magnitude (diminishing returns)
    const magnitudeAdjustment = Math.min(1.0, Math.log(1 + Math.abs(value)) / 10);
    
    return baseWeight * magnitudeAdjustment;
  }

  /**
   * Determine trust level based on score
   */
  private determineTrustLevel(score: number): 'untrusted' | 'emerging' | 'established' | 'verified' | 'exemplary' {
    if (score < 0.2) return 'untrusted';
    if (score < 0.4) return 'emerging';
    if (score < 0.6) return 'established';
    if (score < 0.8) return 'verified';
    return 'exemplary';
  }

  /**
   * Assess risk factors for user
   */
  private async assessRiskFactors(userId: string, contributions: TrustContribution[]): Promise<string[]> {
    const riskFactors: string[] = [];
    
    // Check for recent violations
    const recentViolations = contributions.filter(c => 
      c.type === 'violation' && 
      Date.now() - c.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
    );
    
    if (recentViolations.length > 0) {
      riskFactors.push('recent_violations');
    }
    
    // Check for rapid trust changes
    const recentContributions = contributions.filter(c =>
      Date.now() - c.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
    );
    
    if (recentContributions.length > 10) {
      riskFactors.push('high_activity');
    }
    
    // Check for unverified contributions
    const unverifiedContributions = contributions.filter(c => !c.verifiedBy);
    if (unverifiedContributions.length > contributions.length * 0.5) {
      riskFactors.push('low_verification_rate');
    }
    
    return riskFactors;
  }

  /**
   * Get trust rankings for governance weighting
   */
  async getTrustRankings(limit: number = 100): Promise<TrustScore[]> {
    const result = await query(`
      SELECT user_id FROM trust_scores 
      ORDER BY current_score DESC 
      LIMIT $1
    `, [limit]);

    const rankings: TrustScore[] = [];
    
    for (const row of result.rows) {
      const trustScore = await this.getTrustScore(row.user_id);
      if (trustScore) {
        rankings.push(trustScore);
      }
    }
    
    return rankings;
  }

  /**
   * Check if user meets minimum trust threshold for action
   */
  async checkTrustThreshold(
    userId: string,
    requiredLevel: 'emerging' | 'established' | 'verified' | 'exemplary'
  ): Promise<{ meets: boolean; current: string; required: string }> {
    const trustScore = await this.getTrustScore(userId);
    
    if (!trustScore) {
      return { meets: false, current: 'none', required: requiredLevel };
    }
    
    const levelHierarchy = ['untrusted', 'emerging', 'established', 'verified', 'exemplary'];
    const currentIndex = levelHierarchy.indexOf(trustScore.trustLevel);
    const requiredIndex = levelHierarchy.indexOf(requiredLevel);
    
    return {
      meets: currentIndex >= requiredIndex,
      current: trustScore.trustLevel,
      required: requiredLevel
    };
  }

  /**
   * Batch update trust scores (for periodic maintenance)
   */
  async batchUpdateTrustScores(): Promise<number> {
    const result = await query(`
      SELECT user_id FROM trust_scores 
      WHERE last_updated < NOW() - INTERVAL '1 day'
    `);

    let updatedCount = 0;
    
    for (const row of result.rows) {
      try {
        await this.recalculateTrustScore(row.user_id);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update trust score for user ${row.user_id}:`, error);
      }
    }
    
    return updatedCount;
  }
}