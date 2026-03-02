/**
 * AI Services Index
 * Unified export module for all AI services
 * 
 * Services:
 * - Enhanced NLP Service (Transformer-based)
 * - Vision Service (Computer Vision/CNN)
 * - Knowledge Graph Service
 * - Multi-Modal Orchestration Service
 * - Base AI Service (Provider management)
 */

// ============================================================================
// Types Export
// ============================================================================

export * from './types';

// ============================================================================
// Base AI Service
// ============================================================================

export {
  AIService,
  AIServiceFactory
} from './aiService';

// ============================================================================
// Enhanced NLP Service
// ============================================================================

export {
  EnhancedNLPService,
  getEnhancedNLPService,
  resetNLPService,
  NLPAnalysisOptions,
  NLPAnalysisResult,
  ExtractedEntity,
  EntityType,
  SentimentResult,
  EmotionScores,
  SummaryResult,
  ClassificationResult,
  LanguageResult,
  KeywordResult,
  KeywordScore,
  UrgencyResult,
  UrgencyIndicator,
  QuestionAnsweringResult,
  Evidence,
  TextComparisonResult,
  TextDifference,
  EntityMetadata
} from './enhancedNLPService';

// ============================================================================
// Vision Service
// ============================================================================

export {
  VisionService,
  getVisionService,
  resetVisionService,
  VisionAnalysisOptions,
  VisionAnalysisResult,
  ImageClassification,
  ClassificationLabel,
  DetectedObject,
  BoundingBox,
  SceneUnderstanding,
  PeopleDetection,
  FaceDetection,
  FaceAttributes,
  LandCoverClassification,
  LandCoverBreakdown,
  LandUseChange,
  VegetationIndex,
  SeasonalComparison,
  ChangeDetectionResult,
  ChangeEvent,
  ChangeType,
  DamageAssessment,
  StructureDamage,
  AreaDamage,
  SafeRoute,
  TextExtractionResult,
  TextBlock,
  SafetyAssessment,
  Hazard
} from './visionService';

// ============================================================================
// Knowledge Graph Service
// ============================================================================

export {
  KnowledgeGraphService,
  getKnowledgeGraphService,
  resetKnowledgeGraphService,
  KnowledgeGraph,
  Entity,
  EntityType as KGEntityType,
  EntityProperties,
  Relationship,
  RelationshipType as KGRelationshipType,
  RelationshipProperties,
  GraphStatistics,
  SearchQuery,
  SearchResult,
  PathResult,
  TraversalResult,
  EntityResolutionResult,
  DuplicateGroup,
  MergedEntity,
  InferenceResult,
  InferredRelationship,
  GraphQuery
} from './knowledgeGraphService';

// ============================================================================
// Multi-Modal Orchestration Service
// ============================================================================

export {
  MultiModalOrchestrationService,
  getMultiModalOrchestrationService,
  resetOrchestrationService,
  MultiModalQuery,
  QueryContext,
  OrchestrationOptions,
  MultiModalResponse,
  ModalityResult,
  SynthesizedResponse,
  ExtractedEntityInfo,
  RelationshipInfo,
  NextStep,
  ResponseMetadata,
  UnifiedSearchResult
} from './multiModalOrchestrationService';

// ============================================================================
// Provider Exports
// ============================================================================

export {
  OpenAIProvider
} from './providers/openai';

export {
  IAIProvider,
  AIProviderConfig,
  ProviderHealth,
  ProviderUsage,
  AICapability
} from './providers/base';

// ============================================================================
// Resilience Exports
// ============================================================================

export {
  CircuitBreaker,
  CircuitBreakerConfig,
  CircuitState,
  CircuitBreakerMetrics,
  RetryPolicy,
  RetryConfig,
  RequestQueue,
  QueueConfig
} from './resilience';

// ============================================================================
// Observability Exports
// ============================================================================

export {
  TelemetryService,
  TelemetryConfig,
  LogLevel,
  LogEntry,
  MetricsSnapshot
} from './observability/telemetry';

// ============================================================================
// Quick Access Functions
// ============================================================================

/**
 * Get all AI services initialized with default configuration
 */
export function getAIServices() {
  return {
    nlp: getEnhancedNLPService(),
    vision: getVisionService(),
    knowledgeGraph: getKnowledgeGraphService(),
    orchestration: getMultiModalOrchestrationService()
  };
}

/**
 * Process a complete multi-modal query
 */
export async function processCompleteQuery(
  text?: string,
  imageUrls?: string[],
  context?: QueryContext
) {
  const orchestration = getMultiModalOrchestrationService();
  return orchestration.processQuery({ text, imageUrls, context });
}

/**
 * Analyze text with all NLP capabilities
 */
export async function analyzeText(text: string) {
  const nlp = getEnhancedNLPService();
  return nlp.analyzeText(text);
}

/**
 * Analyze image with all vision capabilities
 */
export async function analyzeImage(imageUrl: string, options?: VisionAnalysisOptions) {
  const vision = getVisionService();
  return vision.analyzeImage(imageUrl, options);
}

/**
 * Query or update knowledge graph
 */
export function useKnowledgeGraph() {
  return getKnowledgeGraphService();
}

// ============================================================================
// Version Information
// ============================================================================

export const AIServicesVersion = '1.0.0';
export const AIServicesBuildDate = new Date().toISOString();
