import { query } from '../db';
import { logSecurityEvent } from '../utils/logger';

export interface VerificationStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'verified' | 'failed';
  confidence: number;
  timestamp: Date;
  source: 'sensor' | 'satellite' | 'human' | 'ai';
  metadata: Record<string, any>;
}

export interface VerificationPipeline {
  id: string;
  entityType: 'measurement' | 'project' | 'transaction' | 'claim';
  entityId: string;
  stages: VerificationStage[];
  overallConfidence: number;
  status: 'ingesting' | 'normalizing' | 'cross_validating' | 'scoring' | 'finalized' | 'rejected';
  finalizedAt?: Date;
  rejectionReason?: string;
}

export class VerificationPipelineService {
  private static readonly CONFIDENCE_THRESHOLD = 0.75;
  private static readonly FINALIZATION_DELAY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Ingest → normalize → cross-validate → confidence-score
   * Nothing becomes "real" until it survives scrutiny
   */
  async createPipeline(
    entityType: string,
    entityId: string,
    initialData: any,
    userId: string
  ): Promise<VerificationPipeline> {
    const pipelineId = `vp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create pipeline record
    await query(`
      INSERT INTO verification_pipelines (
        id, entity_type, entity_id, status, created_by, created_at
      ) VALUES ($1, $2, $3, 'ingesting', $4, NOW())
    `, [pipelineId, entityType, entityId, userId]);

    // Start ingestion stage
    const ingestionStage = await this.createStage(
      pipelineId,
      'ingestion',
      'processing',
      0.1,
      'sensor',
      { rawData: initialData }
    );

    logSecurityEvent('verification_pipeline_created', userId, {
      pipelineId,
      entityType,
      entityId
    }, 'low');

    return {
      id: pipelineId,
      entityType: entityType as any,
      entityId,
      stages: [ingestionStage],
      overallConfidence: 0.1,
      status: 'ingesting'
    };
  }

  /**
   * Parallel verification (sensor + satellite + human)
   */
  async addParallelVerification(
    pipelineId: string,
    sensorData?: any,
    satelliteData?: any,
    humanVerification?: any
  ): Promise<void> {
    const stages: Promise<VerificationStage>[] = [];

    if (sensorData) {
      stages.push(this.createStage(
        pipelineId,
        'sensor_verification',
        'processing',
        0.6,
        'sensor',
        sensorData
      ));
    }

    if (satelliteData) {
      stages.push(this.createStage(
        pipelineId,
        'satellite_verification',
        'processing',
        0.8,
        'satellite',
        satelliteData
      ));
    }

    if (humanVerification) {
      stages.push(this.createStage(
        pipelineId,
        'human_verification',
        'processing',
        0.9,
        'human',
        humanVerification
      ));
    }

    await Promise.all(stages);
    await this.updatePipelineStatus(pipelineId, 'cross_validating');
  }

  /**
   * Cross-validate data across sources
   */
  async crossValidate(pipelineId: string): Promise<number> {
    const stages = await this.getStages(pipelineId);
    const verificationStages = stages.filter(s => 
      s.name.includes('verification') && s.status === 'processing'
    );

    if (verificationStages.length < 2) {
      throw new Error('Insufficient verification sources for cross-validation');
    }

    // Calculate cross-validation confidence
    let totalConfidence = 0;
    let weightedSum = 0;
    let totalWeight = 0;

    for (const stage of verificationStages) {
      const weight = this.getSourceWeight(stage.source);
      weightedSum += stage.confidence * weight;
      totalWeight += weight;
    }

    totalConfidence = weightedSum / totalWeight;

    // Check for data consistency
    const consistencyScore = await this.calculateConsistency(verificationStages);
    const finalConfidence = totalConfidence * consistencyScore;

    // Create cross-validation stage
    await this.createStage(
      pipelineId,
      'cross_validation',
      finalConfidence >= VerificationPipelineService.CONFIDENCE_THRESHOLD ? 'verified' : 'failed',
      finalConfidence,
      'ai',
      {
        sourceCount: verificationStages.length,
        consistencyScore,
        rawConfidence: totalConfidence
      }
    );

    await this.updatePipelineStatus(pipelineId, 'scoring');
    return finalConfidence;
  }

  /**
   * Time-delayed finalization - prevents rushed decisions
   */
  async scheduleFinalization(pipelineId: string): Promise<void> {
    const finalizationTime = new Date(Date.now() + VerificationPipelineService.FINALIZATION_DELAY);
    
    await query(`
      UPDATE verification_pipelines 
      SET scheduled_finalization = $1 
      WHERE id = $2
    `, [finalizationTime, pipelineId]);

    // In production, this would trigger a background job
    setTimeout(() => {
      this.attemptFinalization(pipelineId);
    }, VerificationPipelineService.FINALIZATION_DELAY);
  }

  /**
   * Attempt to finalize pipeline after delay
   */
  private async attemptFinalization(pipelineId: string): Promise<void> {
    try {
      const pipeline = await this.getPipeline(pipelineId);
      if (!pipeline || pipeline.status === 'finalized') return;

      const crossValidationStage = pipeline.stages.find(s => s.name === 'cross_validation');
      if (!crossValidationStage) {
        await this.rejectPipeline(pipelineId, 'Missing cross-validation stage');
        return;
      }

      if (crossValidationStage.confidence >= VerificationPipelineService.CONFIDENCE_THRESHOLD) {
        await this.finalizePipeline(pipelineId);
      } else {
        await this.rejectPipeline(pipelineId, 'Insufficient confidence score');
      }
    } catch (error) {
      console.error(`Failed to finalize pipeline ${pipelineId}:`, error);
      await this.rejectPipeline(pipelineId, 'Finalization error');
    }
  }

  /**
   * Finalize pipeline - data becomes "real"
   */
  private async finalizePipeline(pipelineId: string): Promise<void> {
    await query(`
      UPDATE verification_pipelines 
      SET status = 'finalized', finalized_at = NOW() 
      WHERE id = $1
    `, [pipelineId]);

    // Trigger downstream effects (create actual records, update metrics, etc.)
    await this.triggerDownstreamEffects(pipelineId);

    logSecurityEvent('verification_pipeline_finalized', null, {
      pipelineId
    }, 'low');
  }

  /**
   * Reject pipeline
   */
  private async rejectPipeline(pipelineId: string, reason: string): Promise<void> {
    await query(`
      UPDATE verification_pipelines 
      SET status = 'rejected', rejection_reason = $1, finalized_at = NOW() 
      WHERE id = $2
    `, [reason, pipelineId]);

    logSecurityEvent('verification_pipeline_rejected', null, {
      pipelineId,
      reason
    }, 'medium');
  }

  /**
   * Get pipeline with all stages
   */
  async getPipeline(pipelineId: string): Promise<VerificationPipeline | null> {
    const pipelineResult = await query(`
      SELECT * FROM verification_pipelines WHERE id = $1
    `, [pipelineId]);

    if (pipelineResult.rowCount === 0) return null;

    const pipeline = pipelineResult.rows[0];
    const stages = await this.getStages(pipelineId);

    return {
      id: pipeline.id,
      entityType: pipeline.entity_type,
      entityId: pipeline.entity_id,
      stages,
      overallConfidence: this.calculateOverallConfidence(stages),
      status: pipeline.status,
      finalizedAt: pipeline.finalized_at,
      rejectionReason: pipeline.rejection_reason
    };
  }

  // Helper methods
  private async createStage(
    pipelineId: string,
    name: string,
    status: string,
    confidence: number,
    source: string,
    metadata: any
  ): Promise<VerificationStage> {
    const stageId = `vs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO verification_stages (
        id, pipeline_id, name, status, confidence, source, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [stageId, pipelineId, name, status, confidence, source, JSON.stringify(metadata)]);

    return {
      id: stageId,
      name,
      status: status as any,
      confidence,
      timestamp: new Date(),
      source: source as any,
      metadata
    };
  }

  private async getStages(pipelineId: string): Promise<VerificationStage[]> {
    const result = await query(`
      SELECT * FROM verification_stages 
      WHERE pipeline_id = $1 
      ORDER BY created_at ASC
    `, [pipelineId]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      confidence: row.confidence,
      timestamp: row.created_at,
      source: row.source,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  private async updatePipelineStatus(pipelineId: string, status: string): Promise<void> {
    await query(`
      UPDATE verification_pipelines SET status = $1 WHERE id = $2
    `, [status, pipelineId]);
  }

  private getSourceWeight(source: string): number {
    const weights = {
      sensor: 0.7,
      satellite: 0.9,
      human: 0.8,
      ai: 0.6
    };
    return weights[source as keyof typeof weights] || 0.5;
  }

  private async calculateConsistency(stages: VerificationStage[]): Promise<number> {
    // Simplified consistency calculation
    // In production, this would analyze actual data patterns
    const confidences = stages.map(s => s.confidence);
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / confidences.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (standardDeviation * 2));
  }

  private calculateOverallConfidence(stages: VerificationStage[]): number {
    if (stages.length === 0) return 0;
    
    const verifiedStages = stages.filter(s => s.status === 'verified');
    if (verifiedStages.length === 0) return 0;
    
    return verifiedStages.reduce((sum, stage) => sum + stage.confidence, 0) / verifiedStages.length;
  }

  private async triggerDownstreamEffects(pipelineId: string): Promise<void> {
    // This would trigger actual record creation, metric updates, etc.
    // Implementation depends on entity type
    console.log(`Triggering downstream effects for pipeline ${pipelineId}`);
  }
}