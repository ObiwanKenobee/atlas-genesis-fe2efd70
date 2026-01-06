import { VerificationPipelineService } from './VerificationPipelineService';
import { ConfidenceWeightedStateService } from './ConfidenceWeightedStateService';
import { EthicalConstraintEngine } from './EthicalConstraintEngine';
import { TrustAccumulationService } from './TrustAccumulationService';
import { TemporalLogicService } from './TemporalLogicService';
import { query } from '../db';
import { logSecurityEvent } from '../utils/logger';

export interface RegenerativeAction {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  data: any;
  userId: string;
  context: Record<string, any>;
  timestamp: Date;
}

export interface ActionResult {
  actionId: string;
  status: 'approved' | 'denied' | 'pending_verification' | 'scheduled';
  verificationPipelineId?: string;
  ethicalEvaluation?: any;
  trustCheck?: any;
  temporalActionId?: string;
  reasoning: string[];
  nextSteps: string[];
  estimatedCompletion?: Date;
}

/**
 * Atlas Sanctum Regenerative Orchestrator
 * Coordinates all non-CRUD, ecosystem-native services
 */
export class RegenerativeOrchestrator {
  private verificationService: VerificationPipelineService;
  private confidenceService: ConfidenceWeightedStateService;
  private ethicalEngine: EthicalConstraintEngine;
  private trustService: TrustAccumulationService;
  private temporalService: TemporalLogicService;

  constructor() {
    this.verificationService = new VerificationPipelineService();
    this.confidenceService = new ConfidenceWeightedStateService();
    this.ethicalEngine = new EthicalConstraintEngine();
    this.trustService = new TrustAccumulationService();
    this.temporalService = new TemporalLogicService();
  }

  /**
   * Process regenerative action through all constraint layers
   * Intent → Constraint → Reality → Value → Governance
   */
  async processAction(action: RegenerativeAction): Promise<ActionResult> {
    const reasoning: string[] = [];
    const nextSteps: string[] = [];

    try {
      // 1. CONSTRAINT LAYER: Ethical evaluation
      const ethicalEvaluation = await this.ethicalEngine.evaluateAction(
        action.type,
        action.data,
        action.userId,
        action.context
      );

      if (ethicalEvaluation.overallResult === 'denied') {
        reasoning.push('Action denied due to ethical constraints');
        reasoning.push(...ethicalEvaluation.reasoning);
        
        return {
          actionId: action.id,
          status: 'denied',
          ethicalEvaluation,
          reasoning,
          nextSteps: ethicalEvaluation.alternatives || ['Review ethical constraints and modify action']
        };
      }

      // 2. CONSTRAINT LAYER: Trust verification
      const trustCheck = await this.trustService.checkTrustThreshold(
        action.userId,
        this.getRequiredTrustLevel(action.type)
      );

      if (!trustCheck.meets) {
        reasoning.push(`Insufficient trust level: ${trustCheck.current} (required: ${trustCheck.required})`);
        
        return {
          actionId: action.id,
          status: 'denied',
          trustCheck,
          reasoning,
          nextSteps: ['Build trust through verified contributions', 'Start with lower-impact actions']
        };
      }

      // 3. REALITY LAYER: Create verification pipeline
      const verificationPipeline = await this.verificationService.createPipeline(
        action.entityType,
        action.entityId,
        action.data,
        action.userId
      );

      reasoning.push('Verification pipeline created');
      nextSteps.push('Awaiting multi-source verification');

      // 4. TEMPORAL LAYER: Schedule based on ecological time
      const temporalConditions = this.getTemporalConditions(action.type, action.data);
      let temporalActionId: string | undefined;
      let estimatedCompletion: Date | undefined;

      if (temporalConditions.length > 0) {
        temporalActionId = await this.temporalService.scheduleAction(
          `finalize_${action.type}`,
          action.entityId,
          temporalConditions,
          [verificationPipeline.id],
          { originalActionId: action.id }
        );

        estimatedCompletion = new Date(Date.now() + this.estimateCompletionTime(temporalConditions));
        reasoning.push('Action scheduled with temporal constraints');
        nextSteps.push('Action will be finalized after verification and temporal conditions are met');
      }

      // 5. Log the orchestrated action
      await this.logOrchestration(action, {
        ethicalEvaluation,
        trustCheck,
        verificationPipelineId: verificationPipeline.id,
        temporalActionId
      });

      return {
        actionId: action.id,
        status: temporalActionId ? 'scheduled' : 'pending_verification',
        verificationPipelineId: verificationPipeline.id,
        ethicalEvaluation,
        trustCheck,
        temporalActionId,
        reasoning,
        nextSteps,
        estimatedCompletion
      };

    } catch (error) {
      reasoning.push(`Processing failed: ${(error as Error).message}`);
      
      logSecurityEvent('orchestration_error', action.userId, {
        actionId: action.id,
        actionType: action.type,
        error: (error as Error).message
      }, 'high');

      return {
        actionId: action.id,
        status: 'denied',
        reasoning,
        nextSteps: ['Contact support for assistance']
      };
    }
  }

  /**
   * Process measurement data through confidence-weighted state
   */
  async processMeasurement(
    entityType: string,
    entityId: string,
    metric: string,
    value: number,
    confidence: number,
    source: string,
    userId: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    // Store with confidence weighting
    const valueId = await this.confidenceService.storeValue(
      entityType,
      entityId,
      metric,
      value,
      confidence,
      'normal',
      { source, ...metadata },
      [source, userId]
    );

    // Add trust contribution for measurement
    await this.trustService.addTrustContribution(
      userId,
      'verification',
      confidence * 10, // Scale confidence to contribution value
      `Provided ${metric} measurement for ${entityType}`,
      source === 'verified_sensor' ? 'system' : undefined,
      { metric, value, confidence, source }
    );

    return valueId;
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    verificationBacklog: number;
    averageConfidence: number;
    trustDistribution: Record<string, number>;
    ethicalViolations: number;
    temporalActionsScheduled: number;
    overallHealth: 'healthy' | 'warning' | 'critical';
  }> {
    // Get verification backlog
    const verificationResult = await query(`
      SELECT COUNT(*) as backlog 
      FROM verification_pipelines 
      WHERE status IN ('ingesting', 'normalizing', 'cross_validating', 'scoring')
    `);
    const verificationBacklog = parseInt(verificationResult.rows[0].backlog);

    // Get average confidence
    const confidenceResult = await query(`
      SELECT AVG(confidence) as avg_confidence 
      FROM confidence_weighted_values 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    const averageConfidence = parseFloat(confidenceResult.rows[0].avg_confidence || '0');

    // Get trust distribution
    const trustResult = await query(`
      SELECT trust_level, COUNT(*) as count 
      FROM trust_scores 
      GROUP BY trust_level
    `);
    const trustDistribution: Record<string, number> = {};
    trustResult.rows.forEach(row => {
      trustDistribution[row.trust_level] = parseInt(row.count);
    });

    // Get ethical violations
    const ethicalResult = await query(`
      SELECT COUNT(*) as violations 
      FROM ethical_evaluations 
      WHERE result = 'denied' 
      AND created_at > NOW() - INTERVAL '24 hours'
    `);
    const ethicalViolations = parseInt(ethicalResult.rows[0].violations);

    // Get temporal actions
    const temporalResult = await query(`
      SELECT COUNT(*) as scheduled 
      FROM temporal_actions 
      WHERE status = 'scheduled'
    `);
    const temporalActionsScheduled = parseInt(temporalResult.rows[0].scheduled);

    // Determine overall health
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (verificationBacklog > 1000 || averageConfidence < 0.5 || ethicalViolations > 50) {
      overallHealth = 'critical';
    } else if (verificationBacklog > 500 || averageConfidence < 0.7 || ethicalViolations > 20) {
      overallHealth = 'warning';
    }

    return {
      verificationBacklog,
      averageConfidence,
      trustDistribution,
      ethicalViolations,
      temporalActionsScheduled,
      overallHealth
    };
  }

  /**
   * Process feedback loop - compare predicted vs actual outcomes
   */
  async processFeedback(
    predictionId: string,
    actualOutcome: any,
    confidence: number
  ): Promise<void> {
    // Get original prediction
    const predictionResult = await query(`
      SELECT * FROM predictions WHERE id = $1
    `, [predictionId]);

    if (predictionResult.rowCount === 0) {
      throw new Error('Prediction not found');
    }

    const prediction = predictionResult.rows[0];
    const predictedOutcome = JSON.parse(prediction.predicted_outcome);

    // Calculate accuracy
    const accuracy = this.calculatePredictionAccuracy(predictedOutcome, actualOutcome);

    // Store feedback
    await query(`
      INSERT INTO feedback_loops (
        id, prediction_id, predicted_outcome, actual_outcome, 
        accuracy, confidence, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      `fl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      predictionId,
      JSON.stringify(predictedOutcome),
      JSON.stringify(actualOutcome),
      accuracy,
      confidence
    ]);

    // Update trust based on prediction accuracy
    if (prediction.created_by) {
      const trustContribution = accuracy * 5; // Scale accuracy to trust contribution
      await this.trustService.addTrustContribution(
        prediction.created_by,
        'verification',
        trustContribution,
        `Prediction accuracy: ${(accuracy * 100).toFixed(1)}%`,
        'system',
        { predictionId, accuracy }
      );
    }
  }

  /**
   * Get required trust level for action type
   */
  private getRequiredTrustLevel(actionType: string): 'emerging' | 'established' | 'verified' | 'exemplary' {
    const trustRequirements: Record<string, any> = {
      'create_project': 'established',
      'verify_measurement': 'verified',
      'governance_proposal': 'verified',
      'large_transaction': 'exemplary',
      'ecosystem_intervention': 'exemplary',
      'default': 'emerging'
    };

    return trustRequirements[actionType] || trustRequirements.default;
  }

  /**
   * Get temporal conditions for action type
   */
  private getTemporalConditions(actionType: string, data: any): any[] {
    const conditions: any[] = [];

    // Add verification delay for all actions
    conditions.push({
      type: 'verification_delay',
      parameters: {}
    });

    // Add specific conditions based on action type
    switch (actionType) {
      case 'ecosystem_intervention':
        conditions.push({
          type: 'seasonal',
          parameters: { season: data.preferredSeason || 'spring' }
        });
        break;
      
      case 'governance_proposal':
        conditions.push({
          type: 'consensus_period',
          parameters: {}
        });
        break;
      
      case 'large_transaction':
        conditions.push({
          type: 'cooling_off',
          parameters: {}
        });
        break;
    }

    return conditions;
  }

  /**
   * Estimate completion time based on conditions
   */
  private estimateCompletionTime(conditions: any[]): number {
    let totalTime = 0;

    for (const condition of conditions) {
      switch (condition.type) {
        case 'verification_delay':
          totalTime += 24 * 60 * 60 * 1000; // 24 hours
          break;
        case 'consensus_period':
          totalTime += 7 * 24 * 60 * 60 * 1000; // 7 days
          break;
        case 'cooling_off':
          totalTime += 30 * 24 * 60 * 60 * 1000; // 30 days
          break;
        case 'seasonal':
          totalTime += 90 * 24 * 60 * 60 * 1000; // Up to 90 days for next season
          break;
        case 'maturation':
          totalTime += (condition.parameters.days || 30) * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return totalTime;
  }

  /**
   * Calculate prediction accuracy
   */
  private calculatePredictionAccuracy(predicted: any, actual: any): number {
    // Simplified accuracy calculation
    // In production, this would be more sophisticated based on data types
    
    if (typeof predicted === 'number' && typeof actual === 'number') {
      const error = Math.abs(predicted - actual) / Math.max(predicted, actual, 1);
      return Math.max(0, 1 - error);
    }
    
    if (typeof predicted === 'boolean' && typeof actual === 'boolean') {
      return predicted === actual ? 1 : 0;
    }
    
    // For objects, compare key similarity
    if (typeof predicted === 'object' && typeof actual === 'object') {
      const predictedKeys = Object.keys(predicted);
      const actualKeys = Object.keys(actual);
      const commonKeys = predictedKeys.filter(key => actualKeys.includes(key));
      return commonKeys.length / Math.max(predictedKeys.length, actualKeys.length);
    }
    
    return predicted === actual ? 1 : 0;
  }

  /**
   * Log orchestration details
   */
  private async logOrchestration(
    action: RegenerativeAction,
    results: {
      ethicalEvaluation: any;
      trustCheck: any;
      verificationPipelineId: string;
      temporalActionId?: string;
    }
  ): Promise<void> {
    await query(`
      INSERT INTO orchestration_logs (
        id, action_id, action_type, user_id, ethical_result, 
        trust_result, verification_pipeline_id, temporal_action_id, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      `ol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action.id,
      action.type,
      action.userId,
      results.ethicalEvaluation.overallResult,
      results.trustCheck.meets,
      results.verificationPipelineId,
      results.temporalActionId
    ]);

    logSecurityEvent('action_orchestrated', action.userId, {
      actionId: action.id,
      actionType: action.type,
      ethicalResult: results.ethicalEvaluation.overallResult,
      trustMet: results.trustCheck.meets,
      verificationPipelineId: results.verificationPipelineId
    }, 'low');
  }

  /**
   * Periodic maintenance tasks
   */
  async performMaintenance(): Promise<{
    trustScoresUpdated: number;
    lowConfidenceValuesRemoved: number;
    temporalActionsProcessed: number;
    overdueCheckpoints: number;
  }> {
    // Update trust scores
    const trustScoresUpdated = await this.trustService.batchUpdateTrustScores();
    
    // Clean up low confidence values
    const lowConfidenceValuesRemoved = await this.confidenceService.cleanupLowConfidenceValues();
    
    // Process temporal actions
    const temporalActionsProcessed = await this.temporalService.processTemporalActions();
    
    // Get overdue checkpoints count
    const overdueCheckpoints = (await this.temporalService.getOverdueCheckpoints()).length;

    return {
      trustScoresUpdated,
      lowConfidenceValuesRemoved,
      temporalActionsProcessed,
      overdueCheckpoints
    };
  }
}