import { query } from '../db';

export interface ConfidenceWeightedValue {
  value: number;
  confidence: number;
  uncertainty: number;
  distribution: 'normal' | 'uniform' | 'exponential';
  parameters: Record<string, number>;
  lastUpdated: Date;
  decayRate: number;
  provenance: string[];
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
}

export class ConfidenceWeightedStateService {
  private static readonly DEFAULT_DECAY_RATE = 0.1; // 10% confidence loss per month
  private static readonly MIN_CONFIDENCE = 0.1;

  /**
   * Store values as distributions, not scalars
   */
  async storeValue(
    entityType: string,
    entityId: string,
    metric: string,
    value: number,
    confidence: number,
    distribution: 'normal' | 'uniform' | 'exponential' = 'normal',
    parameters: Record<string, number> = {},
    provenance: string[] = [],
    decayRate: number = ConfidenceWeightedStateService.DEFAULT_DECAY_RATE
  ): Promise<string> {
    const valueId = `cwv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const uncertainty = this.calculateUncertainty(confidence, distribution, parameters);
    
    await query(`
      INSERT INTO confidence_weighted_values (
        id, entity_type, entity_id, metric, value, confidence, uncertainty,
        distribution, parameters, provenance, decay_rate, created_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      valueId, entityType, entityId, metric, value, confidence, uncertainty,
      distribution, JSON.stringify(parameters), JSON.stringify(provenance), decayRate
    ]);

    return valueId;
  }

  /**
   * Retrieve value with current confidence (after decay)
   */
  async getValue(
    entityType: string,
    entityId: string,
    metric: string
  ): Promise<ConfidenceWeightedValue | null> {
    const result = await query(`
      SELECT * FROM confidence_weighted_values 
      WHERE entity_type = $1 AND entity_id = $2 AND metric = $3
      ORDER BY last_updated DESC
      LIMIT 1
    `, [entityType, entityId, metric]);

    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    const currentConfidence = this.applyDecay(
      row.confidence,
      row.decay_rate,
      row.last_updated
    );

    return {
      value: row.value,
      confidence: currentConfidence,
      uncertainty: this.recalculateUncertainty(row.uncertainty, currentConfidence, row.confidence),
      distribution: row.distribution,
      parameters: JSON.parse(row.parameters || '{}'),
      lastUpdated: row.last_updated,
      decayRate: row.decay_rate,
      provenance: JSON.parse(row.provenance || '[]')
    };
  }

  /**
   * Get confidence interval for a value
   */
  async getConfidenceInterval(
    entityType: string,
    entityId: string,
    metric: string,
    confidenceLevel: number = 0.95
  ): Promise<ConfidenceInterval | null> {
    const value = await this.getValue(entityType, entityId, metric);
    if (!value) return null;

    const interval = this.calculateConfidenceInterval(value, confidenceLevel);
    return interval;
  }

  /**
   * Update value with new measurement
   */
  async updateValue(
    entityType: string,
    entityId: string,
    metric: string,
    newValue: number,
    newConfidence: number,
    newProvenance: string[] = []
  ): Promise<void> {
    const existing = await this.getValue(entityType, entityId, metric);
    
    if (!existing) {
      await this.storeValue(entityType, entityId, metric, newValue, newConfidence, 'normal', {}, newProvenance);
      return;
    }

    // Bayesian update combining old and new information
    const combinedValue = this.bayesianUpdate(existing, newValue, newConfidence);
    const combinedProvenance = [...existing.provenance, ...newProvenance];

    await query(`
      UPDATE confidence_weighted_values 
      SET value = $1, confidence = $2, uncertainty = $3, 
          provenance = $4, last_updated = NOW()
      WHERE entity_type = $5 AND entity_id = $6 AND metric = $7
    `, [
      combinedValue.value,
      combinedValue.confidence,
      combinedValue.uncertainty,
      JSON.stringify(combinedProvenance),
      entityType,
      entityId,
      metric
    ]);
  }

  /**
   * Apply automatic decay over time without refresh
   */
  private applyDecay(
    originalConfidence: number,
    decayRate: number,
    lastUpdated: Date
  ): number {
    const monthsElapsed = (Date.now() - lastUpdated.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const decayedConfidence = originalConfidence * Math.exp(-decayRate * monthsElapsed);
    
    return Math.max(decayedConfidence, ConfidenceWeightedStateService.MIN_CONFIDENCE);
  }

  /**
   * Calculate uncertainty from confidence and distribution
   */
  private calculateUncertainty(
    confidence: number,
    distribution: string,
    parameters: Record<string, number>
  ): number {
    // Base uncertainty inversely related to confidence
    let baseUncertainty = 1 - confidence;

    // Adjust based on distribution type
    switch (distribution) {
      case 'normal':
        return baseUncertainty * (parameters.stdDev || 1);
      case 'uniform':
        return baseUncertainty * (parameters.range || 1);
      case 'exponential':
        return baseUncertainty * (parameters.lambda || 1);
      default:
        return baseUncertainty;
    }
  }

  /**
   * Recalculate uncertainty after confidence decay
   */
  private recalculateUncertainty(
    originalUncertainty: number,
    currentConfidence: number,
    originalConfidence: number
  ): number {
    const confidenceRatio = currentConfidence / originalConfidence;
    return originalUncertainty / confidenceRatio;
  }

  /**
   * Calculate confidence interval based on distribution
   */
  private calculateConfidenceInterval(
    value: ConfidenceWeightedValue,
    confidenceLevel: number
  ): ConfidenceInterval {
    const alpha = 1 - confidenceLevel;
    const zScore = this.getZScore(1 - alpha / 2);

    let lower: number, upper: number;

    switch (value.distribution) {
      case 'normal':
        const stdDev = value.parameters.stdDev || value.uncertainty;
        lower = value.value - zScore * stdDev;
        upper = value.value + zScore * stdDev;
        break;
      
      case 'uniform':
        const range = value.parameters.range || value.uncertainty;
        lower = value.value - range / 2;
        upper = value.value + range / 2;
        break;
      
      case 'exponential':
        // For exponential distribution, confidence intervals are asymmetric
        const lambda = value.parameters.lambda || 1 / value.uncertainty;
        lower = Math.max(0, value.value - Math.log(2 / alpha) / lambda);
        upper = value.value + Math.log(2 / alpha) / lambda;
        break;
      
      default:
        lower = value.value - value.uncertainty;
        upper = value.value + value.uncertainty;
    }

    return {
      lower,
      upper,
      confidence: confidenceLevel
    };
  }

  /**
   * Bayesian update combining old and new measurements
   */
  private bayesianUpdate(
    existing: ConfidenceWeightedValue,
    newValue: number,
    newConfidence: number
  ): { value: number; confidence: number; uncertainty: number } {
    // Weight by confidence (precision)
    const existingPrecision = existing.confidence;
    const newPrecision = newConfidence;
    const totalPrecision = existingPrecision + newPrecision;

    // Weighted average
    const combinedValue = (existing.value * existingPrecision + newValue * newPrecision) / totalPrecision;
    
    // Combined confidence (precision adds up in Bayesian updating)
    const combinedConfidence = Math.min(0.99, totalPrecision / (totalPrecision + 1));
    
    // Recalculate uncertainty
    const combinedUncertainty = this.calculateUncertainty(combinedConfidence, existing.distribution, existing.parameters);

    return {
      value: combinedValue,
      confidence: combinedConfidence,
      uncertainty: combinedUncertainty
    };
  }

  /**
   * Get Z-score for normal distribution
   */
  private getZScore(probability: number): number {
    // Simplified Z-score calculation for common confidence levels
    const zScores: Record<string, number> = {
      '0.90': 1.28,
      '0.95': 1.645,
      '0.975': 1.96,
      '0.99': 2.33,
      '0.995': 2.58
    };

    const key = probability.toFixed(3);
    return zScores[key] || 1.96; // Default to 95% confidence
  }

  /**
   * Get all values for an entity with current confidence
   */
  async getEntityValues(
    entityType: string,
    entityId: string
  ): Promise<Record<string, ConfidenceWeightedValue>> {
    const result = await query(`
      SELECT DISTINCT ON (metric) *
      FROM confidence_weighted_values 
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY metric, last_updated DESC
    `, [entityType, entityId]);

    const values: Record<string, ConfidenceWeightedValue> = {};

    for (const row of result.rows) {
      const currentConfidence = this.applyDecay(
        row.confidence,
        row.decay_rate,
        row.last_updated
      );

      values[row.metric] = {
        value: row.value,
        confidence: currentConfidence,
        uncertainty: this.recalculateUncertainty(row.uncertainty, currentConfidence, row.confidence),
        distribution: row.distribution,
        parameters: JSON.parse(row.parameters || '{}'),
        lastUpdated: row.last_updated,
        decayRate: row.decay_rate,
        provenance: JSON.parse(row.provenance || '[]')
      };
    }

    return values;
  }

  /**
   * Clean up values with confidence below minimum threshold
   */
  async cleanupLowConfidenceValues(): Promise<number> {
    const result = await query(`
      DELETE FROM confidence_weighted_values 
      WHERE confidence * EXP(-decay_rate * EXTRACT(EPOCH FROM (NOW() - last_updated)) / (30 * 24 * 3600)) < $1
    `, [ConfidenceWeightedStateService.MIN_CONFIDENCE]);

    return result.rowCount || 0;
  }
}