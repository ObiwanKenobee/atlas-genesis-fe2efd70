/**
 * AI Services - Comprehensive Tests
 * Production-ready test suite for all AI services
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ============================================
// MOCK CONFIGURATION
// ============================================

// Set up environment variables before imports
const originalImportMeta = globalThis.import.meta;
globalThis.import.meta = {
  env: {
    VITE_AI_API_URL: 'http://localhost:3001/api/v2/ai',
    VITE_USE_MOCK_DATA: 'true',
  },
} as any;

// ============================================
// TYPE GUARD
// ============================================

function isSuccess<T, E>(result: { ok: boolean; data?: T; error?: E }): result is { ok: true; data: T } {
  return result.ok === true && 'data' in result;
}

// ============================================
// TEST: BASE CLIENT & ERROR TYPES
// ============================================

describe('AIServiceError', async () => {
  const { AIServiceError } = await import('../baseClient');
  
  it('should create error with correct properties', () => {
    const error = new AIServiceError(
      'Test error message',
      'PredictionService',
      'testOperation',
      { 
        severity: 'high',
        isRetryable: true,
        endpoint: '/test',
        parameters: { id: '123' }
      }
    );
    
    expect(error.message).toBe('Test error message');
    expect(error.service).toBe('PredictionService');
    expect(error.operation).toBe('testOperation');
    expect(error.severity).toBe('high');
    expect(error.isRetryable).toBe(true);
    expect(error.fallbackUsed).toBe(false);
    expect(error.requestId).toBeDefined();
    expect(error.timestamp).toBeDefined();
    expect(error.context.endpoint).toBe('/test');
    expect(error.context.parameters).toEqual({ id: '123' });
  });

  it('should generate JSON representation', () => {
    const error = new AIServiceError(
      'Test error',
      'NLPService',
      'analyzeText'
    );
    
    const json = error.toJSON();
    
    expect(json.name).toBe('AIServiceError');
    expect(json.message).toBe('Test error');
    expect(json.service).toBe('NLPService');
    expect(json.operation).toBe('analyzeText');
    expect(json.requestId).toBeDefined();
    expect(json.timestamp).toBeDefined();
  });
});

describe('LRUCache', async () => {
  const { LRUCache } = await import('../baseClient');
  
  it('should store and retrieve values', () => {
    const cache = new LRUCache({ maxSize: 10, ttl: 60000 });
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should evict least recently used entries', () => {
    const cache = new LRUCache({ maxSize: 3, ttl: 60000 });
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.get('key1'); // Access key1 to make it recently used
    cache.set('key4', 'value4'); // Should evict key2
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeNull(); // Evicted
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should clear cache', () => {
    const cache = new LRUCache({ maxSize: 10, ttl: 60000 });
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeNull();
  });
});

// ============================================
// TEST: NLP SERVICE
// ============================================

describe('NLPService', async () => {
  const { nlpService } = await import('../nlpService');
  
  it('should analyze text and return NLPAnalysis', async () => {
    const text = 'This is a test document about climate change and environmental conservation.';
    
    const result = await nlpService.analyzeText(text);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.id).toBeDefined();
      expect(result.data.text).toBe(text);
      expect(result.data.sentiment).toBeDefined();
      expect(result.data.sentiment.label).toMatch(/^(positive|negative|neutral|mixed)$/);
      expect(result.data.entities).toBeInstanceOf(Array);
      expect(result.data.topics).toBeInstanceOf(Array);
      expect(result.data.keywords).toBeInstanceOf(Array);
    }
  });

  it('should extract entities from text', async () => {
    const text = 'The Amazon rainforest in Brazil is facing deforestation threats.';
    
    const result = await nlpService.extractEntities(text);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeInstanceOf(Array);
    }
  });

  it('should analyze sentiment', async () => {
    const positiveText = 'This amazing project will help save the planet!';
    const negativeText = 'This terrible deforestation is destroying everything.';
    
    const positiveResult = await nlpService.analyzeSentiment(positiveText);
    const negativeResult = await nlpService.analyzeSentiment(negativeText);
    
    if (isSuccess(positiveResult) && isSuccess(negativeResult)) {
      expect(positiveResult.data.positive).toBeGreaterThan(negativeResult.data.positive);
    }
  });

  it('should detect language', async () => {
    const englishText = 'This is a document in English language.';
    
    const result = await nlpService.detectLanguage(englishText);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.code).toBe('en');
      expect(result.data.name).toBe('English');
    }
  });
});

// ============================================
// TEST: VISION SERVICE
// ============================================

describe('VisionService', async () => {
  const { visionService } = await import('../visionService');
  
  it('should analyze satellite image', async () => {
    const imageUrl = 'https://example.com/satellite-image.jpg';
    
    const result = await visionService.analyzeSatelliteImage(imageUrl);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.id).toBeDefined();
      expect(result.data.landCover).toBeDefined();
      expect(result.data.vegetationIndex).toBeDefined();
      expect(result.data.riskAssessment).toBeDefined();
    }
  });

  it('should calculate vegetation index', async () => {
    const imageUrl = 'https://example.com/vegetation-image.jpg';
    
    const result = await visionService.calculateVegetationIndex(imageUrl);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.ndvi).toBeDefined();
      expect(result.data.ndvi).toBeGreaterThanOrEqual(-1);
      expect(result.data.ndvi).toBeLessThanOrEqual(1);
      expect(result.data.classification).toMatch(/^(healthy|stressed|degraded|barren|water)$/);
    }
  });

  it('should identify species from images', async () => {
    const imageUrl = 'https://example.com/camera-trap.jpg';
    
    const result = await visionService.identifySpecies(imageUrl);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach((species: any) => {
        expect(species.id).toBeDefined();
        expect(species.species).toBeDefined();
        expect(species.commonName).toBeDefined();
      });
    }
  });

  it('should assess fire risk', async () => {
    const imageUrl = 'https://example.com/dry-region.jpg';
    
    const result = await visionService.assessFireRisk(imageUrl);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.risk).toBeDefined();
      expect(result.data.riskLevel).toMatch(/^(low|moderate|high|extreme)$/);
    }
  });
});

// ============================================
// TEST: PREDICTION SERVICE
// ============================================

describe('PredictionService', async () => {
  const { predictionService } = await import('../predictionService');
  
  it('should forecast carbon price', async () => {
    const result = await predictionService.forecastCarbonPrice('project-1', 12);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.length).toBe(12);
      result.data.forEach((forecast: any) => {
        expect(forecast.period).toBeDefined();
        expect(forecast.predicted).toBeGreaterThan(0);
        expect(forecast.confidence).toBeGreaterThan(0);
        expect(forecast.confidence).toBeLessThanOrEqual(1);
        expect(forecast.trend).toMatch(/^(up|down|stable)$/);
      });
    }
  });

  it('should predict impact', async () => {
    const result = await predictionService.predictImpact('project-1', '1 year');
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.projectId).toBe('project-1');
      expect(result.data.predictedImpact).toBeDefined();
      expect(result.data.predictedImpact.carbonReduction).toBeGreaterThan(0);
    }
  });

  it('should model climate risk', async () => {
    const location = { lat: -3.4653, lng: -62.2159 };
    
    const result = await predictionService.modelClimateRisk(location, 10);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.location).toEqual(location);
      expect(result.data.riskLevel).toMatch(/^(low|medium|high|critical)$/);
      expect(result.data.risks).toBeInstanceOf(Array);
      expect(result.data.adaptationStrategies).toBeInstanceOf(Array);
    }
  });
});

// ============================================
// TEST: RECOMMENDATION SERVICE
// ============================================

describe('RecommendationService', async () => {
  const { recommendationService } = await import('../predictionService');
  
  it('should get personalized recommendations', async () => {
    const result = await recommendationService.getPersonalizedRecommendations('user-1', 5);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.length).toBeLessThanOrEqual(5);
      result.data.forEach((rec: any) => {
        expect(rec.projectId).toBeDefined();
        expect(rec.score).toBeGreaterThan(0);
        expect(rec.score).toBeLessThanOrEqual(1);
        expect(rec.riskLevel).toMatch(/^(low|medium|high)$/);
      });
    }
  });

  it('should find similar projects', async () => {
    const result = await recommendationService.findSimilarProjects('project-1', 3);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.length).toBe(3);
      result.data.forEach((project: any) => {
        expect(project.projectId).toBeDefined();
        expect(project.similarity).toBeGreaterThan(0);
        expect(project.similarity).toBeLessThanOrEqual(1);
      });
    }
  });
});

// ============================================
// TEST: ANOMALY SERVICE
// ============================================

describe('AnomalyService', async () => {
  const { anomalyService } = await import('../predictionService');
  
  it('should detect transaction anomalies', async () => {
    const transaction = {
      id: 'tx-1',
      userId: 'user-1',
      amount: 15000,
      type: 'purchase',
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
    };
    
    const result = await anomalyService.detectTransactionAnomaly(transaction);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.isAnomaly).toBeDefined();
      expect(result.data.score).toBeGreaterThanOrEqual(0);
      expect(result.data.score).toBeLessThanOrEqual(1);
      expect(result.data.severity).toMatch(/^(low|medium|high|critical)$/);
    }
  });

  it('should monitor sensor data', async () => {
    const readings = [
      {
        id: 'r1',
        projectId: 'project-1',
        type: 'temperature',
        value: 25.5,
        unit: 'celsius',
        timestamp: new Date().toISOString(),
      },
    ];
    
    const result = await anomalyService.monitorSensorData(readings);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeInstanceOf(Array);
    }
  });
});

// ============================================
// TEST: FORECASTING SERVICE
// ============================================

describe('ForecastingService', async () => {
  const { forecastingService } = await import('../predictionService');
  
  it('should forecast sequestration', async () => {
    const result = await forecastingService.forecastSequestration('project-1', 12);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.timestamps.length).toBe(12);
      expect(result.data.predictions.length).toBe(12);
      expect(result.data.modelMetrics).toBeDefined();
    }
  });

  it('should detect seasonality', async () => {
    const data = Array.from({ length: 24 }, (_, i) => 
      100 + 20 * Math.sin((2 * Math.PI * i) / 12) + Math.random() * 10
    );
    
    const result = await forecastingService.detectSeasonality(data);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.hasSeasonality).toBeDefined();
      expect(result.data.period).toBeDefined();
      expect(result.data.amplitude).toBeDefined();
    }
  });
});

// ============================================
// TEST: KNOWLEDGE GRAPH SERVICE
// ============================================

describe('KnowledgeGraphService', async () => {
  const { knowledgeGraphService } = await import('../predictionService');
  
  it('should build project graph', async () => {
    const result = await knowledgeGraphService.buildProjectGraph(['project-1', 'project-2']);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.nodes).toBeInstanceOf(Array);
      expect(result.data.relationships).toBeInstanceOf(Array);
      expect(result.data.queryTime).toBeDefined();
    }
  });

  it('should find impact chains', async () => {
    const result = await knowledgeGraphService.findImpactChains('project-1');
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeInstanceOf(Array);
    }
  });
});

// ============================================
// TEST: REINFORCEMENT LEARNING SERVICE
// ============================================

describe('ReinforcementLearningService', async () => {
  const { reinforcementLearningService } = await import('../predictionService');
  
  it('should get optimal investment', async () => {
    const state = {
      currentAllocation: { 'project-1': 0.4, 'project-2': 0.6 },
      marketConditions: { carbonPrice: 50, volatility: 0.2 },
      impactTargets: { carbonReduction: 5000 },
    };
    
    const result = await reinforcementLearningService.getOptimalInvestment(state);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.action).toBeDefined();
      expect(result.data.expectedReward).toBeDefined();
      expect(result.data.confidence).toBeGreaterThan(0);
      expect(result.data.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('should select intervention', async () => {
    const result = await reinforcementLearningService.selectIntervention(
      'project-1',
      ['increase_monitoring', 'expand_team', 'reduce_activities']
    );
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.action).toBeDefined();
      expect(result.data.alternativeActions).toBeInstanceOf(Array);
    }
  });

  it('should get optimal pricing', async () => {
    const result = await reinforcementLearningService.getOptimalPricing({
      demand: 70,
      supply: 40,
      competitors: 10,
    });
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.price).toBeGreaterThan(0);
      expect(result.data.recommendedStrategy).toBeDefined();
    }
  });

  it('should update policy', async () => {
    const feedback = {
      action: 'increase_allocation',
      reward: 0.8,
      state: {
        currentAllocation: {},
        marketConditions: {},
        impactTargets: {},
      },
      timestamp: new Date().toISOString(),
    };
    
    const result = await reinforcementLearningService.updatePolicy(feedback);
    
    expect(result.ok).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.success).toBe(true);
    }
  });
});

// ============================================
// RESTORE META
// ============================================

globalThis.importMeta = originalImportMeta;
