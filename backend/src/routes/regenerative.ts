import express from 'express';
import { RegenerativeOrchestrator } from '../services/RegenerativeOrchestrator';
import { VerificationPipelineService } from '../services/VerificationPipelineService';
import { ConfidenceWeightedStateService } from '../services/ConfidenceWeightedStateService';
import { EthicalConstraintEngine } from '../services/EthicalConstraintEngine';
import { TrustAccumulationService } from '../services/TrustAccumulationService';
import { TemporalLogicService } from '../services/TemporalLogicService';
import { verifyAccessToken } from '../utils/auth';
import { logSecurityEvent } from '../utils/logger';

const router = express.Router();

// Initialize services
const orchestrator = new RegenerativeOrchestrator();
const verificationService = new VerificationPipelineService();
const confidenceService = new ConfidenceWeightedStateService();
const ethicalEngine = new EthicalConstraintEngine();
const trustService = new TrustAccumulationService();
const temporalService = new TemporalLogicService();

// Authentication middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    (req as any).user = { id: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// =====================================================
// REGENERATIVE ACTION PROCESSING
// =====================================================

/**
 * Process regenerative action through all constraint layers
 * POST /api/regenerative/actions
 */
router.post('/actions', requireAuth, async (req, res) => {
  try {
    const { type, entityType, entityId, data, context = {} } = req.body;
    const userId = (req as any).user.id;

    if (!type || !entityType || !entityId || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type, entityType, entityId, data'
      });
    }

    const action = {
      id: `ra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entityType,
      entityId,
      data,
      userId,
      context,
      timestamp: new Date()
    };

    const result = await orchestrator.processAction(action);

    res.json({
      success: true,
      action: result,
      message: result.status === 'approved' 
        ? 'Action approved and processed'
        : result.status === 'denied'
        ? 'Action denied due to constraints'
        : 'Action scheduled for processing'
    });

  } catch (error) {
    console.error('Action processing error:', error);
    res.status(500).json({
      error: 'Failed to process action',
      details: (error as Error).message
    });
  }
});

/**
 * Get action status
 * GET /api/regenerative/actions/:actionId
 */
router.get('/actions/:actionId', requireAuth, async (req, res) => {
  try {
    const { actionId } = req.params;
    
    // This would fetch from orchestration_logs table
    // Simplified implementation for now
    res.json({
      actionId,
      status: 'pending_verification',
      message: 'Action status tracking not yet implemented'
    });

  } catch (error) {
    console.error('Action status error:', error);
    res.status(500).json({
      error: 'Failed to get action status',
      details: (error as Error).message
    });
  }
});

// =====================================================
// VERIFICATION PIPELINES
// =====================================================

/**
 * Create verification pipeline
 * POST /api/regenerative/verification/pipelines
 */
router.post('/verification/pipelines', requireAuth, async (req, res) => {
  try {
    const { entityType, entityId, initialData } = req.body;
    const userId = (req as any).user.id;

    const pipeline = await verificationService.createPipeline(
      entityType,
      entityId,
      initialData,
      userId
    );

    res.json({
      success: true,
      pipeline,
      message: 'Verification pipeline created'
    });

  } catch (error) {
    console.error('Pipeline creation error:', error);
    res.status(500).json({
      error: 'Failed to create verification pipeline',
      details: (error as Error).message
    });
  }
});

/**
 * Add parallel verification data
 * POST /api/regenerative/verification/pipelines/:pipelineId/verify
 */
router.post('/verification/pipelines/:pipelineId/verify', requireAuth, async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { sensorData, satelliteData, humanVerification } = req.body;

    await verificationService.addParallelVerification(
      pipelineId,
      sensorData,
      satelliteData,
      humanVerification
    );

    res.json({
      success: true,
      message: 'Verification data added to pipeline'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Failed to add verification data',
      details: (error as Error).message
    });
  }
});

/**
 * Get verification pipeline status
 * GET /api/regenerative/verification/pipelines/:pipelineId
 */
router.get('/verification/pipelines/:pipelineId', requireAuth, async (req, res) => {
  try {
    const { pipelineId } = req.params;
    
    const pipeline = await verificationService.getPipeline(pipelineId);
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.json({
      success: true,
      pipeline
    });

  } catch (error) {
    console.error('Pipeline fetch error:', error);
    res.status(500).json({
      error: 'Failed to get pipeline',
      details: (error as Error).message
    });
  }
});

// =====================================================
// CONFIDENCE-WEIGHTED STATE
// =====================================================

/**
 * Store confidence-weighted measurement
 * POST /api/regenerative/measurements
 */
router.post('/measurements', requireAuth, async (req, res) => {
  try {
    const { entityType, entityId, metric, value, confidence, source, metadata = {} } = req.body;
    const userId = (req as any).user.id;

    if (!entityType || !entityId || !metric || value === undefined || !confidence || !source) {
      return res.status(400).json({
        error: 'Missing required fields: entityType, entityId, metric, value, confidence, source'
      });
    }

    const measurementId = await orchestrator.processMeasurement(
      entityType,
      entityId,
      metric,
      value,
      confidence,
      source,
      userId,
      metadata
    );

    res.json({
      success: true,
      measurementId,
      message: 'Measurement processed with confidence weighting'
    });

  } catch (error) {
    console.error('Measurement processing error:', error);
    res.status(500).json({
      error: 'Failed to process measurement',
      details: (error as Error).message
    });
  }
});

/**
 * Get confidence-weighted value
 * GET /api/regenerative/measurements/:entityType/:entityId/:metric
 */
router.get('/measurements/:entityType/:entityId/:metric', requireAuth, async (req, res) => {
  try {
    const { entityType, entityId, metric } = req.params;
    
    const value = await confidenceService.getValue(entityType, entityId, metric);
    
    if (!value) {
      return res.status(404).json({ error: 'Measurement not found' });
    }

    // Also get confidence interval
    const confidenceInterval = await confidenceService.getConfidenceInterval(
      entityType, entityId, metric, 0.95
    );

    res.json({
      success: true,
      value,
      confidenceInterval
    });

  } catch (error) {
    console.error('Measurement fetch error:', error);
    res.status(500).json({
      error: 'Failed to get measurement',
      details: (error as Error).message
    });
  }
});

/**
 * Get all measurements for entity
 * GET /api/regenerative/measurements/:entityType/:entityId
 */
router.get('/measurements/:entityType/:entityId', requireAuth, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const values = await confidenceService.getEntityValues(entityType, entityId);

    res.json({
      success: true,
      values,
      count: Object.keys(values).length
    });

  } catch (error) {
    console.error('Entity measurements fetch error:', error);
    res.status(500).json({
      error: 'Failed to get entity measurements',
      details: (error as Error).message
    });
  }
});

// =====================================================
// ETHICAL CONSTRAINTS
// =====================================================

/**
 * Evaluate action against ethical constraints
 * POST /api/regenerative/ethics/evaluate
 */
router.post('/ethics/evaluate', requireAuth, async (req, res) => {
  try {
    const { actionType, actionData, context = {} } = req.body;
    const userId = (req as any).user.id;

    if (!actionType || !actionData) {
      return res.status(400).json({
        error: 'Missing required fields: actionType, actionData'
      });
    }

    const evaluation = await ethicalEngine.evaluateAction(
      actionType,
      actionData,
      userId,
      context
    );

    res.json({
      success: true,
      evaluation,
      message: evaluation.overallResult === 'allowed' 
        ? 'Action passes ethical evaluation'
        : evaluation.overallResult === 'denied'
        ? 'Action violates ethical constraints'
        : 'Action allowed with ethical cost'
    });

  } catch (error) {
    console.error('Ethical evaluation error:', error);
    res.status(500).json({
      error: 'Failed to evaluate ethical constraints',
      details: (error as Error).message
    });
  }
});

/**
 * Create ethical constraint
 * POST /api/regenerative/ethics/constraints
 */
router.post('/ethics/constraints', requireAuth, async (req, res) => {
  try {
    const { name, type, category, rule, parameters = {}, violationCost = 0 } = req.body;
    const userId = (req as any).user.id;

    if (!name || !type || !category || !rule) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, category, rule'
      });
    }

    const constraintId = await ethicalEngine.createConstraint(
      name,
      type,
      category,
      rule,
      parameters,
      violationCost,
      userId
    );

    res.json({
      success: true,
      constraintId,
      message: 'Ethical constraint created'
    });

  } catch (error) {
    console.error('Constraint creation error:', error);
    res.status(500).json({
      error: 'Failed to create ethical constraint',
      details: (error as Error).message
    });
  }
});

// =====================================================
// TRUST SCORES
// =====================================================

/**
 * Get user trust score
 * GET /api/regenerative/trust/:userId
 */
router.get('/trust/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;

    // Users can only see their own trust score unless they're admin
    if (userId !== requestingUserId) {
      // Check if requesting user is admin (simplified check)
      // In production, implement proper role checking
      return res.status(403).json({ error: 'Access denied' });
    }

    const trustScore = await trustService.getTrustScore(userId);
    
    if (!trustScore) {
      return res.status(404).json({ error: 'Trust score not found' });
    }

    res.json({
      success: true,
      trustScore
    });

  } catch (error) {
    console.error('Trust score fetch error:', error);
    res.status(500).json({
      error: 'Failed to get trust score',
      details: (error as Error).message
    });
  }
});

/**
 * Get trust rankings (public, limited data)
 * GET /api/regenerative/trust/rankings
 */
router.get('/trust/rankings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    
    const rankings = await trustService.getTrustRankings(limit);
    
    // Return limited public data
    const publicRankings = rankings.map((score, index) => ({
      rank: index + 1,
      trustLevel: score.trustLevel,
      currentScore: Math.round(score.currentScore * 100) / 100,
      // Don't expose user IDs or detailed information
    }));

    res.json({
      success: true,
      rankings: publicRankings,
      total: rankings.length
    });

  } catch (error) {
    console.error('Trust rankings error:', error);
    res.status(500).json({
      error: 'Failed to get trust rankings',
      details: (error as Error).message
    });
  }
});

// =====================================================
// TEMPORAL ACTIONS
// =====================================================

/**
 * Schedule temporal action
 * POST /api/regenerative/temporal/schedule
 */
router.post('/temporal/schedule', requireAuth, async (req, res) => {
  try {
    const { actionType, entityId, conditions, dependencies = [], metadata = {} } = req.body;

    if (!actionType || !entityId || !conditions) {
      return res.status(400).json({
        error: 'Missing required fields: actionType, entityId, conditions'
      });
    }

    const temporalActionId = await temporalService.scheduleAction(
      actionType,
      entityId,
      conditions,
      dependencies,
      metadata
    );

    res.json({
      success: true,
      temporalActionId,
      message: 'Action scheduled with temporal constraints'
    });

  } catch (error) {
    console.error('Temporal scheduling error:', error);
    res.status(500).json({
      error: 'Failed to schedule temporal action',
      details: (error as Error).message
    });
  }
});

/**
 * Create seasonal checkpoints
 * POST /api/regenerative/temporal/seasonal-checkpoints
 */
router.post('/temporal/seasonal-checkpoints', requireAuth, async (req, res) => {
  try {
    const { ecosystemType, year, expectedMetrics } = req.body;

    if (!ecosystemType || !year || !expectedMetrics) {
      return res.status(400).json({
        error: 'Missing required fields: ecosystemType, year, expectedMetrics'
      });
    }

    const checkpointIds = await temporalService.createSeasonalCheckpoints(
      ecosystemType,
      year,
      expectedMetrics
    );

    res.json({
      success: true,
      checkpointIds,
      message: `Created ${checkpointIds.length} seasonal checkpoints`
    });

  } catch (error) {
    console.error('Seasonal checkpoint creation error:', error);
    res.status(500).json({
      error: 'Failed to create seasonal checkpoints',
      details: (error as Error).message
    });
  }
});

// =====================================================
// SYSTEM HEALTH & MONITORING
// =====================================================

/**
 * Get system health metrics
 * GET /api/regenerative/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await orchestrator.getSystemHealth();

    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      error: 'Failed to get system health',
      details: (error as Error).message
    });
  }
});

/**
 * Perform system maintenance
 * POST /api/regenerative/maintenance
 */
router.post('/maintenance', requireAuth, async (req, res) => {
  try {
    // Only allow admin users to trigger maintenance
    // In production, implement proper admin role checking
    
    const maintenanceResults = await orchestrator.performMaintenance();

    res.json({
      success: true,
      results: maintenanceResults,
      message: 'System maintenance completed'
    });

  } catch (error) {
    console.error('Maintenance error:', error);
    res.status(500).json({
      error: 'Failed to perform maintenance',
      details: (error as Error).message
    });
  }
});

// =====================================================
// FEEDBACK PROCESSING
// =====================================================

/**
 * Submit feedback on prediction accuracy
 * POST /api/regenerative/feedback
 */
router.post('/feedback', requireAuth, async (req, res) => {
  try {
    const { predictionId, actualOutcome, confidence } = req.body;

    if (!predictionId || !actualOutcome || confidence === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: predictionId, actualOutcome, confidence'
      });
    }

    await orchestrator.processFeedback(predictionId, actualOutcome, confidence);

    res.json({
      success: true,
      message: 'Feedback processed and trust updated'
    });

  } catch (error) {
    console.error('Feedback processing error:', error);
    res.status(500).json({
      error: 'Failed to process feedback',
      details: (error as Error).message
    });
  }
});

export default router;