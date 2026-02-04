/**
 * AI Services Index - All AI Capabilities for Atlas Sanctum
 * Production-ready barrel exports for all AI services
 */

// ============================================
// BASE CLIENT & ERROR TYPES
// ============================================

export { 
  AIServiceError,
  apiClient,
  globalCache,
  LRUCache,
  success,
  failure,
  type Result,
  type APIRequestConfig,
  type APIResponse,
  type AIServiceName,
  type ErrorSeverity,
  type AIErrorContext,
} from './baseClient';

// ============================================
// NLP SERVICE
// ============================================

export { 
  nlpService, 
  default as nlpServiceDefault,
  NLPService,
} from './nlpService';

export type {
  NLPAnalysis,
  EntityMetadata,
  Entity,
  EmotionScores,
  SentimentScore,
  Topic,
  DetectedLanguage,
  ReadabilityScore,
  TranslationRequest,
  TranslationResponse,
  TextClassificationRequest,
  ClassificationCategory,
  ClassificationResponse,
} from './nlpService';

// ============================================
// VISION SERVICE
// ============================================

export { 
  visionService, 
  default as visionServiceDefault,
  VisionService,
} from './visionService';

export type {
  VisionAnalysis,
  LandCoverClassification,
  ChangeEvent,
  BoundingBox,
  DetectedFeature,
  VegetationIndex,
  RiskAssessment,
  RiskAlert,
  SpeciesRecognition,
  FireRiskAssessment,
  FireHotspot,
} from './visionService';

// ============================================
// PREDICTION SERVICES (All in one file)
// ============================================

export { 
  predictionService,
  anomalyService,
  recommendationService,
  forecastingService,
  knowledgeGraphService,
  reinforcementLearningService,
  PredictionService,
  AnomalyService,
  RecommendationService,
  ForecastingService,
  KnowledgeGraphService,
  ReinforcementLearningService,
} from './predictionService';

export type {
  // Common
  ImpactMetrics,
  TimeWindow,
  LocationBounds,
  
  // Coordinates (re-exported from predictionService)
  Coordinates,
  
  // Prediction Service
  PriceForecast,
  SuccessPrediction,
  RiskFactor,
  ClimateRisk,
  ClimateRiskDetail,
  AdaptationStrategy,
  ImpactPrediction,
  
  // Anomaly Service
  TransactionMetadata,
  Transaction,
  AnomalyResult,
  AnomalyFlag,
  SensorReadingMetadata,
  SensorReading,
  
  // Recommendation Service
  RecommendationMetadata,
  Recommendation,
  InvestmentHistory,
  UserProfile,
  PortfolioProjectAllocation,
  PortfolioSuggestion,
  
  // Forecasting Service
  TimeSeriesForecast,
  ModelMetrics,
  SeasonalityPattern,
  
  // Knowledge Graph Service
  GraphNodeProperties,
  GraphNode,
  GraphRelationshipProperties,
  GraphRelationship,
  QueryFilters,
  QueryResult,
  
  // RL Service
  PortfolioAllocation,
  MarketConditionMetrics,
  PortfolioState,
  RLPolicyMetadata,
  RLPolicy,
  AlternativeAction,
  RLFeedback,
} from './predictionService';

// ============================================
// REACT HOOKS
// ============================================

export * from '../../hooks/useAI';

// ============================================
// REACT CONTEXT
// ============================================

export { 
  AIProvider, 
  useAI,
  useNLPService,
  useVisionService,
  usePredictionService,
  useRecommendationService,
} from '../../contexts/AIContext';
