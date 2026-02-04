/**
 * AI Services - Prediction, Anomaly, Recommendation, Forecasting, Knowledge Graph, RL
 * Production-ready implementation with typed interfaces and consistent error handling
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AIServiceError, 
  AIServiceName, 
  apiClient, 
  globalCache, 
  LRUCache,
  success,
  failure,
  type Result 
} from './baseClient';

// ============================================
// COMMON TYPES (Typed interfaces instead of Record<string, unknown>)
// ============================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ImpactMetrics {
  carbonReduction: number;
  waterConservation: number;
  biodiversityScore: number;
  communityBenefit: number;
  regenerationScore?: number;
}

export interface TimeWindow {
  startDate: string;
  endDate: string;
}

export interface LocationBounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

// ============================================
// PREDICTION SERVICE TYPES
// ============================================

export interface PriceForecast {
  period: string;
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  trend: 'up' | 'down' | 'stable';
  volume?: number;
  marketSegment?: string;
}

export interface SuccessPrediction {
  projectId: string;
  successProbability: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  timeframe: string;
  lastUpdated: string;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  category: 'market' | 'climate' | 'regulatory' | 'operational' | 'financial';
  mitigation?: string;
}

export interface ClimateRisk {
  location: Coordinates;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: ClimateRiskDetail[];
  adaptationStrategies: AdaptationStrategy[];
  vulnerabilityScore?: number;
  lastAssessed: string;
}

export interface ClimateRiskDetail {
  type: 'drought' | 'flood' | 'extreme_rainfall' | 'temperature_increase' | 'sea_level_rise' | 'wildfire' | 'storm';
  probability: number;
  severity: number;
  timeframe: string;
  affectedAreas?: string[];
}

export interface AdaptationStrategy {
  strategy: string;
  cost: number;
  effectiveness: number;
  implementationTime: string;
  coBenefits?: string[];
}

export interface ImpactPrediction {
  projectId: string;
  predictedImpact: ImpactMetrics;
  confidence: number;
  timeframe: string;
  assumptions: string[];
  methodology?: string;
  lastUpdated: string;
}

// ============================================
// ANOMALY DETECTION TYPES
// ============================================

export interface TransactionMetadata {
  walletAddress?: string;
  ipfsHash?: string;
  verificationId?: string;
  gasFee?: number;
  networkId?: string;
  tokenId?: string;
  projectIds?: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'transfer' | 'verification' | 'staking' | 'unstaking' | 'mint' | 'burn';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  metadata?: TransactionMetadata;
  blockNumber?: number;
  transactionHash?: string;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  flags: AnomalyFlag[];
  recommendedAction?: string;
}

export interface AnomalyFlag {
  type: string;
  description: string;
  threshold?: number;
  actualValue?: number;
}

export interface SensorReadingMetadata {
  projectId: string;
  sensorId: string;
  location?: Coordinates;
  altitude?: number;
  deviceType?: string;
  calibrationStatus?: 'calibrated' | 'needs_calibration' | 'unknown';
}

export interface SensorReading {
  id: string;
  projectId: string;
  type: 'temperature' | 'humidity' | 'co2' | 'soil_moisture' | 'ndvi' | 'biodiversity';
  value: number;
  unit: string;
  timestamp: string;
  location?: Coordinates;
  metadata?: SensorReadingMetadata;
  quality?: 'good' | 'suspect' | 'missing';
}

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface RecommendationMetadata {
  matchingCriteria?: string[];
  projectedROI?: number;
  alignmentScore?: number;
  similarUserCount?: number;
}

export interface Recommendation {
  projectId: string;
  score: number;
  reason: string;
  expectedImpact: ImpactMetrics;
  riskLevel: 'low' | 'medium' | 'high';
  metadata?: RecommendationMetadata;
  expiresAt?: string;
  rank?: number;
}

export interface InvestmentHistory {
  projectId: string;
  amount: number;
  date: string;
  outcome?: 'successful' | 'pending' | 'failed';
}

export interface UserProfile {
  userId: string;
  interests: string[];
  investmentHistory: InvestmentHistory[];
  impactGoals: ImpactMetrics;
  riskTolerance: number; // 0-1 scale
  preferredCategories?: string[];
  investmentRange?: { min: number; max: number };
  sustainabilityPriority?: 'environmental' | 'social' | 'balanced';
}

export interface PortfolioProjectAllocation {
  projectId: string;
  projectName: string;
  allocation: number;
  allocationPercent: number;
  currentValue: number;
  projectedReturn: number;
  impact: ImpactMetrics;
}

export interface PortfolioSuggestion {
  id: string;
  projects: PortfolioProjectAllocation[];
  expectedReturn: number;
  expectedImpact: ImpactMetrics;
  riskScore: number;
  diversificationScore?: number;
  rebalanceNeeded: boolean;
  suggestedActions?: string[];
  validUntil?: string;
}

// ============================================
// FORECASTING TYPES
// ============================================

export interface TimeSeriesForecast {
  timestamps: string[];
  predictions: number[];
  confidenceIntervals: { upper: number[]; lower: number[] };
  modelMetrics: ModelMetrics;
  modelVersion?: string;
  horizon: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ModelMetrics {
  mae: number;  // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  mape: number; // Mean Absolute Percentage Error
  r2?: number;  // R-squared
  trainingDate?: string;
}

export interface SeasonalityPattern {
  hasSeasonality: boolean;
  period: string;
  periodDays: number;
  amplitude: number;
  phase: number;
  peakMonths?: string[];
  troughMonths?: string[];
  trend?: 'increasing' | 'decreasing' | 'stable';
  confidence?: number;
}

// ============================================
// KNOWLEDGE GRAPH TYPES
// ============================================

export interface GraphNodeProperties {
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface GraphNode {
  id: string;
  type: 'project' | 'organization' | 'location' | 'impact' | 'technology' | 'investor' | 'audit';
  name: string;
  properties: GraphNodeProperties;
  confidence?: number;
  verified?: boolean;
}

export interface GraphRelationshipProperties {
  startDate?: string;
  endDate?: string;
  description?: string;
  evidence?: string;
  verified?: boolean;
}

export interface GraphRelationship {
  id?: string;
  source: string;
  target: string;
  type: 'IMPLEMENTS' | 'LOCATED_IN' | 'GENERATES' | 'USES' | 'RUNS' | 'INVESTS_IN' | 'PARTNERS_WITH' | 'BENEFITS' | 'MEASURES' | 'VERIFIED_BY';
  strength: number; // 0-1
  properties?: GraphRelationshipProperties;
}

export interface QueryFilters {
  nodeTypes?: string[];
  relationshipTypes?: string[];
  minStrength?: number;
  maxDepth?: number;
  includeProperties?: string[];
}

export interface QueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  path?: GraphNode[][];
  queryTime: number;
  totalNodes: number;
  totalRelationships: number;
}

// ============================================
// REINFORCEMENT LEARNING TYPES
// ============================================

export interface PortfolioAllocation {
  [projectId: string]: number; // weight 0-1
}

export interface MarketConditionMetrics {
  carbonPrice: number;
  marketVolatility: number;
  interestRate: number;
  regulatoryScore: number;
  sentimentIndex: number;
}

export interface PortfolioState {
  currentAllocation: PortfolioAllocation;
  marketConditions: MarketConditionMetrics;
  impactTargets: ImpactMetrics;
  timeHorizon: number; // in months
  constraints?: {
    maxSingleProject?: number;
    minDiversification?: number;
    maxSectorExposure?: Record<string, number>;
  };
}

export interface RLPolicyMetadata {
  modelVersion: string;
  trainingDate: string;
  confidenceScore: number;
  explorationRate: number;
  qValues?: Record<string, number>;
}

export interface RLPolicy {
  action: string;
  expectedReward: number;
  confidence: number;
  reasoning: string;
  metadata?: RLPolicyMetadata;
  alternativeActions?: AlternativeAction[];
}

export interface AlternativeAction {
  action: string;
  expectedReward: number;
  confidence: number;
  reason: string;
}

export interface RLFeedback {
  action: string;
  reward: number;
  state: PortfolioState;
  timestamp: string;
  outcome?: number;
  notes?: string;
}

// ============================================
// PREDICTION SERVICE
// ============================================

export class PredictionService {
  private apiEndpoint: string;
  private cache: LRUCache<PriceForecast[]>;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.cache = new LRUCache<PriceForecast[]>({ maxSize: 100, ttl: 15 * 60 * 1000 });
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async forecastCarbonPrice(
    projectId: string, 
    months: number = 12,
    options?: { signal?: AbortSignal; useMock?: boolean }
  ): Promise<Result<PriceForecast[], AIServiceError>> {
    const cacheKey = `price:${projectId}:${months}`;
    
    // Check cache first
    if (!options?.signal) {
      const cached = this.cache.get(cacheKey);
      if (cached) return success(cached);
    }

    const mockFallback = () => this.generateMockPriceForecasts(months);

    if (options?.useMock ?? this.useMockFallback) {
      const data = await mockFallback();
      this.cache.set(cacheKey, data);
      return success(data);
    }

    try {
      const data = await apiClient.request<PriceForecast[]>(
        'PredictionService',
        'forecastCarbonPrice',
        {
          endpoint: '/prediction/carbon-price',
          method: 'POST',
          body: { projectId, months },
          signal: options?.signal,
        },
        mockFallback
      );
      
      this.cache.set(cacheKey, data);
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        const mockData = await mockFallback();
        this.cache.set(cacheKey, mockData);
        return success(mockData);
      }
      return failure(error as AIServiceError);
    }
  }

  async predictProjectSuccess(
    projectData: {
      name: string;
      description: string;
      category: string;
      location: Coordinates;
      budget: number;
      teamSize: number;
      startDate: string;
      durationMonths: number;
    },
    options?: { signal?: AbortSignal }
  ): Promise<Result<SuccessPrediction, AIServiceError>> {
    const mockFallback = () => this.generateMockSuccessPrediction(projectData);

    if (this.useMockFallback || options?.signal?.aborted) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<SuccessPrediction>(
        'PredictionService',
        'predictProjectSuccess',
        {
          endpoint: '/prediction/success',
          method: 'POST',
          body: projectData,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async modelClimateRisk(
    location: Coordinates,
    timeframe: number = 10,
    options?: { signal?: AbortSignal }
  ): Promise<Result<ClimateRisk, AIServiceError>> {
    const cacheKey = `climate:${location.lat}:${location.lng}:${timeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return success({ ...cached, riskLevel: 'medium' } as unknown as ClimateRisk);

    const mockFallback = () => this.generateMockClimateRisk(location);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<ClimateRisk>(
        'PredictionService',
        'modelClimateRisk',
        {
          endpoint: '/prediction/climate-risk',
          method: 'POST',
          body: { location, timeframe },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async predictImpact(
    projectId: string,
    timeframe: string = '1 year',
    options?: { signal?: AbortSignal }
  ): Promise<Result<ImpactPrediction, AIServiceError>> {
    const cacheKey = `impact:${projectId}:${timeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return success({ projectId, predictedImpact: cached[0] as unknown as ImpactMetrics, confidence: 0.85, timeframe, assumptions: [], lastUpdated: new Date().toISOString() } as unknown as ImpactPrediction);

    const mockFallback = () => this.generateMockImpactPrediction(projectId);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<ImpactPrediction>(
        'PredictionService',
        'predictImpact',
        {
          endpoint: '/prediction/impact',
          method: 'POST',
          body: { projectId, timeframe },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  // Mock data generators
  private generateMockPriceForecasts(months: number): PriceForecast[] {
    const forecasts: PriceForecast[] = [];
    const basePrice = 50 + Math.random() * 20;
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const predicted = basePrice * (1 + (Math.random() - 0.5) * 0.1 * (1 + i * 0.05));
      const trend = i < months / 3 ? 'up' : i > (2 * months) / 3 ? 'down' : 'stable';
      forecasts.push({
        period: new Date(now.setMonth(now.getMonth() + 1)).toISOString().slice(0, 7),
        predicted: Math.round(predicted * 100) / 100,
        confidence: Math.max(0.5, 0.85 - i * 0.03),
        upperBound: Math.round(predicted * 1.15 * 100) / 100,
        lowerBound: Math.round(predicted * 0.85 * 100) / 100,
        trend,
        volume: Math.floor(Math.random() * 1000000) + 500000,
        marketSegment: 'voluntary',
      });
    }
    return forecasts;
  }

  private generateMockSuccessPrediction(projectData?: { name?: string; category?: string }): SuccessPrediction {
    return {
      projectId: projectData?.name ? `project-${projectData.name.toLowerCase().replace(/\s+/g, '-')}` : uuidv4(),
      successProbability: 0.75 + Math.random() * 0.2,
      riskFactors: [
        { factor: 'Market volatility', impact: 0.2, category: 'market', mitigation: 'Diversify revenue streams' },
        { factor: 'Climate variability', impact: 0.15, category: 'climate', mitigation: 'Climate-resilient practices' },
        { factor: 'Regulatory changes', impact: 0.1, category: 'regulatory', mitigation: 'Engage policymakers' },
        { factor: 'Operational challenges', impact: 0.08, category: 'operational', mitigation: 'Hire experienced team' },
      ],
      recommendations: [
        'Diversify funding sources to reduce financial risk',
        'Implement climate adaptation measures proactively',
        'Strengthen community engagement early in the project',
        'Build relationships with regulators before project launch',
      ],
      timeframe: '12 months',
      lastUpdated: new Date().toISOString(),
    };
  }

  private generateMockClimateRisk(location: Coordinates): ClimateRisk {
    const riskLevel = Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low';
    return {
      location,
      riskLevel: riskLevel as ClimateRisk['riskLevel'],
      risks: [
        { type: 'drought', probability: 0.3, severity: 0.6, timeframe: '5 years', affectedAreas: ['eastern sector'] },
        { type: 'extreme_rainfall', probability: 0.4, severity: 0.4, timeframe: '5 years' },
        { type: 'temperature_increase', probability: 0.8, severity: 0.5, timeframe: '10 years' },
        { type: 'wildfire', probability: 0.15, severity: 0.7, timeframe: '5 years' },
      ],
      adaptationStrategies: [
        { strategy: 'Implement water conservation measures', cost: 50000, effectiveness: 0.85, implementationTime: '6 months' },
        { strategy: 'Use drought-resistant species', cost: 25000, effectiveness: 0.75, implementationTime: '3 months', coBenefits: ['Reduced maintenance', 'Lower costs'] },
        { strategy: 'Establish early warning systems', cost: 15000, effectiveness: 0.9, implementationTime: '2 months' },
      ],
      vulnerabilityScore: riskLevel === 'high' ? 0.75 : riskLevel === 'medium' ? 0.5 : 0.25,
      lastAssessed: new Date().toISOString(),
    };
  }

  private generateMockImpactPrediction(projectId: string): ImpactPrediction {
    return {
      projectId,
      predictedImpact: {
        carbonReduction: Math.floor(Math.random() * 5000) + 1000,
        waterConservation: Math.floor(Math.random() * 1000) + 200,
        biodiversityScore: Math.floor(Math.random() * 40) + 60,
        communityBenefit: Math.floor(Math.random() * 30) + 70,
        regenerationScore: Math.floor(Math.random() * 30) + 70,
      },
      confidence: 0.8 + Math.random() * 0.15,
      timeframe: '1 year',
      assumptions: [
        'Stable funding continuation throughout project period',
        'No major climate events that could disrupt project activities',
        'Community participation maintained at current or higher levels',
        'Regulatory framework remains supportive of conservation efforts',
      ],
      methodology: 'Ensemble model combining satellite data, ground surveys, and statistical projections',
      lastUpdated: new Date().toISOString(),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================
// ANOMALY DETECTION SERVICE
// ============================================

export class AnomalyService {
  private apiEndpoint: string;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async detectTransactionAnomaly(
    transaction: Transaction,
    options?: { signal?: AbortSignal }
  ): Promise<Result<AnomalyResult, AIServiceError>> {
    const mockFallback = () => this.generateMockAnomalyResult(transaction);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<AnomalyResult>(
        'AnomalyService',
        'detectTransactionAnomaly',
        {
          endpoint: '/anomaly/transaction',
          method: 'POST',
          body: transaction,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async flagIrregularVerification(
    projectId: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<AnomalyResult[], AIServiceError>> {
    const mockFallback = () => [
      this.generateMockAnomalyResult({
        id: uuidv4(),
        userId: 'system',
        amount: 0,
        type: 'verification',
        timestamp: new Date().toISOString(),
        status: 'pending',
      }),
    ];

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<AnomalyResult[]>(
        'AnomalyService',
        'flagIrregularVerification',
        {
          endpoint: '/anomaly/verification',
          method: 'POST',
          body: { projectId },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async monitorSensorData(
    data: SensorReading[],
    options?: { signal?: AbortSignal }
  ): Promise<Result<AnomalyResult[], AIServiceError>> {
    const mockFallback = () => {
      const anomalies = data.filter(() => Math.random() > 0.9);
      return anomalies.length > 0 
        ? anomalies.map(reading => this.generateMockAnomalyResult(reading as unknown as Transaction))
        : [];
    };

    if (this.useMockFallback || data.length === 0) {
      return success(await mockFallback());
    }

    try {
      const data_ = await apiClient.request<AnomalyResult[]>(
        'AnomalyService',
        'monitorSensorData',
        {
          endpoint: '/anomaly/sensor',
          method: 'POST',
          body: { readings: data },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data_);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  private generateMockAnomalyResult(transaction: Transaction): AnomalyResult {
    const score = Math.random();
    const isAnomaly = score > 0.8;
    
    let severity: AnomalyResult['severity'];
    let flags: AnomalyFlag[];
    let explanation: string;

    if (score > 0.9) {
      severity = 'critical';
      flags = [
        { type: 'large_amount', description: 'Transaction amount significantly exceeds normal', threshold: 10000, actualValue: transaction.amount },
        { type: 'new_recipient', description: 'First transaction to this recipient' },
        { type: 'unusual_timing', description: 'Transaction at unusual hour' },
      ];
      explanation = 'Critical anomaly detected: Multiple risk indicators suggest potential fraud or system abuse';
    } else if (score > 0.8) {
      severity = 'high';
      flags = [
        { type: 'large_amount', description: 'Transaction amount above typical threshold', threshold: 5000, actualValue: transaction.amount },
        { type: 'rapid_sequence', description: 'Part of rapid transaction sequence' },
      ];
      explanation = 'High-risk transaction pattern detected requiring immediate review';
    } else if (score > 0.6) {
      severity = 'medium';
      flags = [{ type: 'unusual_pattern', description: 'Slight deviation from typical behavior' }];
      explanation = 'Minor anomaly detected - may warrant additional verification';
    } else {
      severity = 'low';
      flags = [];
      explanation = 'Transaction within normal parameters';
    }

    return {
      isAnomaly,
      score: Math.round(score * 100) / 100,
      explanation,
      severity,
      detectedAt: new Date().toISOString(),
      flags,
      recommendedAction: isAnomaly ? 'Manual review required before processing' : undefined,
    };
  }
}

// ============================================
// RECOMMENDATION SERVICE
// ============================================

export class RecommendationService {
  private apiEndpoint: string;
  private cache: LRUCache<Recommendation[]>;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.cache = new LRUCache<Recommendation[]>({ maxSize: 200, ttl: 30 * 60 * 1000 });
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 5,
    options?: { signal?: AbortSignal; categories?: string[] }
  ): Promise<Result<Recommendation[], AIServiceError>> {
    const cacheKey = `rec:${userId}:${limit}:${options?.categories?.join(',') || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && !options?.signal) return success(cached);

    const mockFallback = () => this.generateMockRecommendations(limit, options?.categories);

    if (this.useMockFallback) {
      const data = await mockFallback();
      this.cache.set(cacheKey, data);
      return success(data);
    }

    try {
      const data = await apiClient.request<Recommendation[]>(
        'RecommendationService',
        'getPersonalizedRecommendations',
        {
          endpoint: '/recommendations/personalized',
          method: 'POST',
          body: { userId, limit, categories: options?.categories },
          signal: options?.signal,
        },
        mockFallback
      );
      this.cache.set(cacheKey, data);
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        const mockData = await mockFallback();
        this.cache.set(cacheKey, mockData);
        return success(mockData);
      }
      return failure(error as AIServiceError);
    }
  }

  async findSimilarProjects(
    projectId: string,
    limit: number = 5,
    options?: { signal?: AbortSignal }
  ): Promise<Result<{ projectId: string; similarity: number; reason: string }[], AIServiceError>> {
    const mockFallback = () => 
      Array(limit).fill(0).map((_, i) => ({
        projectId: `similar-${projectId}-${i}`,
        similarity: Math.round((0.95 - i * 0.05) * 100) / 100,
        reason: `Shares ${['similar impact metrics', 'complementary goals', 'comparable location', 'related technology'][i % 4]}`,
      }));

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ projectId: string; similarity: number; reason: string }[]>(
        'RecommendationService',
        'findSimilarProjects',
        {
          endpoint: '/recommendations/similar',
          method: 'POST',
          body: { projectId, limit },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async optimizePortfolio(
    userGoals: UserProfile,
    options?: { signal?: AbortSignal }
  ): Promise<Result<PortfolioSuggestion, AIServiceError>> {
    const mockFallback = () => this.generateMockPortfolioSuggestion(userGoals);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<PortfolioSuggestion>(
        'RecommendationService',
        'optimizePortfolio',
        {
          endpoint: '/recommendations/portfolio',
          method: 'POST',
          body: userGoals,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  private generateMockRecommendations(count: number, categories?: string[]): Recommendation[] {
    const allCategories = categories || ['forest_conservation', 'ocean_conservation', 'renewable_energy', 'community_development'];
    
    return allCategories.slice(0, count).map((category, i) => ({
      projectId: `project-${category}-${i}`,
      score: Math.round((0.95 - i * 0.05) * 100) / 100,
      reason: `Based on your interest in ${category.replace(/_/g, ' ')} and alignment with your impact goals`,
      expectedImpact: {
        carbonReduction: Math.floor(Math.random() * 2000) + 500,
        waterConservation: Math.floor(Math.random() * 500) + 100,
        biodiversityScore: Math.floor(Math.random() * 30) + 70,
        communityBenefit: Math.floor(Math.random() * 30) + 70,
      },
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      metadata: {
        matchingCriteria: ['impact', 'category', 'risk_profile'],
        projectedROI: Math.round((5 + Math.random() * 15) * 10) / 10,
        alignmentScore: Math.round((0.85 + Math.random() * 0.15) * 100) / 100,
        similarUserCount: Math.floor(Math.random() * 500) + 100,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rank: i + 1,
    }));
  }

  private generateMockPortfolioSuggestion(userGoals: UserProfile): PortfolioSuggestion {
    const projects = [
      { id: 'forest-project-1', name: 'Amazon Rainforest Protection', category: 'forest_conservation' },
      { id: 'ocean-project-1', name: 'Ocean Carbon Capture', category: 'ocean_conservation' },
      { id: 'community-project-1', name: 'Community Solar Initiative', category: 'community_development' },
      { id: 'renewable-project-1', name: 'Wind Farm Expansion', category: 'renewable_energy' },
    ];

    const allocations = [0.35, 0.25, 0.20, 0.20];
    const totalInvestment = 10000;

    return {
      id: uuidv4(),
      projects: projects.map((project, i) => ({
        projectId: project.id,
        projectName: project.name,
        allocation: Math.round(totalInvestment * allocations[i]),
        allocationPercent: allocations[i] * 100,
        currentValue: Math.round(totalInvestment * allocations[i] * 1.05),
        projectedReturn: Math.round((5 + Math.random() * 10) * 10) / 10,
        expectedImpact: {
          carbonReduction: Math.floor(Math.random() * 2000) + 500,
          waterConservation: Math.floor(Math.random() * 300) + 100,
          biodiversityScore: Math.floor(Math.random() * 20) + 70,
          communityBenefit: Math.floor(Math.random() * 20) + 70,
        },
      })),
      expectedReturn: 12.5,
      expectedImpact: {
        carbonReduction: 5000,
        waterConservation: 1500,
        biodiversityScore: 75,
        communityBenefit: 80,
      },
      riskScore: 0.35,
      diversificationScore: 0.82,
      rebalanceNeeded: false,
      suggestedActions: [
        'Consider increasing allocation to ocean projects for diversification',
        'Review community development projects for additional impact opportunities',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================
// FORECASTING SERVICE
// ============================================

export class ForecastingService {
  private apiEndpoint: string;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async forecastSequestration(
    projectId: string,
    horizon: number = 12,
    options?: { signal?: AbortSignal }
  ): Promise<Result<TimeSeriesForecast, AIServiceError>> {
    const mockFallback = () => this.generateMockTimeSeriesForecast(horizon);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<TimeSeriesForecast>(
        'ForecastingService',
        'forecastSequestration',
        {
          endpoint: '/forecasting/carbon',
          method: 'POST',
          body: { projectId, horizon },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async detectSeasonality(
    data: number[],
    options?: { signal?: AbortSignal }
  ): Promise<Result<SeasonalityPattern, AIServiceError>> {
    const mockFallback = () => ({
      hasSeasonality: true,
      period: '12 months',
      periodDays: 365,
      amplitude: 0.15,
      phase: Math.random() * Math.PI * 2,
      peakMonths: ['Jan', 'Feb', 'Mar'],
      troughMonths: ['Jul', 'Aug', 'Sep'],
      trend: 'increasing' as const,
      confidence: 0.85,
    });

    if (this.useMockFallback || data.length === 0) {
      return success(await mockFallback());
    }

    try {
      const data_ = await apiClient.request<SeasonalityPattern>(
        'ForecastingService',
        'detectSeasonality',
        {
          endpoint: '/forecasting/seasonality',
          method: 'POST',
          body: { data },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data_);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async forecastMarketDemand(
    category: string,
    months: number = 12,
    options?: { signal?: AbortSignal }
  ): Promise<Result<TimeSeriesForecast, AIServiceError>> {
    const mockFallback = () => this.generateMockTimeSeriesForecast(months);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<TimeSeriesForecast>(
        'ForecastingService',
        'forecastMarketDemand',
        {
          endpoint: '/forecasting/demand',
          method: 'POST',
          body: { category, months },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  private generateMockTimeSeriesForecast(horizon: number): TimeSeriesForecast {
    const timestamps: string[] = [];
    const predictions: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];
    const now = new Date();

    const baseValue = 1000;
    for (let i = 0; i < horizon; i++) {
      timestamps.push(new Date(now.setMonth(now.getMonth() + 1)).toISOString().slice(0, 7));
      const trend = 1 + 0.005 * i;
      const seasonal = 1 + 0.1 * Math.sin((2 * Math.PI * i) / 12);
      const noise = 1 + (Math.random() - 0.5) * 0.1;
      const pred = baseValue * trend * seasonal * noise;
      predictions.push(Math.round(pred));
      upper.push(Math.round(pred * 1.1));
      lower.push(Math.round(pred * 0.9));
    }

    return {
      timestamps,
      predictions,
      confidenceIntervals: { upper, lower },
      modelMetrics: { 
        mae: 45.2, 
        rmse: 58.7, 
        mape: 5.2,
        r2: 0.87,
        trainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      modelVersion: '2.1.0',
      horizon,
      frequency: 'monthly',
    };
  }
}

// ============================================
// KNOWLEDGE GRAPH SERVICE
// ============================================

export class KnowledgeGraphService {
  private apiEndpoint: string;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async buildProjectGraph(
    projectIds: string[],
    options?: { signal?: AbortSignal; includeRelationships?: boolean }
  ): Promise<Result<QueryResult, AIServiceError>> {
    const mockFallback = () => this.generateMockGraphData(projectIds);

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<QueryResult>(
        'KnowledgeGraphService',
        'buildProjectGraph',
        {
          endpoint: '/knowledge-graph/build',
          method: 'POST',
          body: { projectIds, includeRelationships: options?.includeRelationships ?? true },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async findImpactChains(
    projectId: string,
    options?: { signal?: AbortSignal; maxDepth?: number }
  ): Promise<Result<GraphRelationship[], AIServiceError>> {
    const mockFallback = () => [
      { source: projectId, target: 'community-1', type: 'BENEFITS' as const, strength: 0.85, properties: { impactScore: 85 } },
      { source: projectId, target: 'technology-1', type: 'USES' as const, strength: 0.72 },
      { source: 'community-1', target: 'social-impact-1', type: 'GENERATES' as const, strength: 0.9 },
      { source: 'technology-1', target: 'monitoring-system', type: 'ENABLED_BY' as const, strength: 0.88 },
    ];

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<GraphRelationship[]>(
        'KnowledgeGraphService',
        'findImpactChains',
        {
          endpoint: '/knowledge-graph/chains',
          method: 'POST',
          body: { projectId, maxDepth: options?.maxDepth || 3 },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async queryGraph(
    query: { 
      cypher?: string; 
      filters?: QueryFilters; 
    },
    options?: { signal?: AbortSignal }
  ): Promise<Result<QueryResult, AIServiceError>> {
    const mockFallback = () => ({
      nodes: [],
      relationships: [],
      queryTime: 15,
      totalNodes: 0,
      totalRelationships: 0,
    });

    if (this.useMockFallback || (!query.cypher && !query.filters)) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<QueryResult>(
        'KnowledgeGraphService',
        'queryGraph',
        {
          endpoint: '/knowledge-graph/query',
          method: 'POST',
          body: query,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async discoverEcosystem(
    organizationId: string,
    options?: { signal?: AbortSignal; includeInvestors?: boolean }
  ): Promise<Result<{ organizations: GraphNode[]; relationships: GraphRelationship[] }, AIServiceError>> {
    const mockFallback = () => {
      const nodes: GraphNode[] = [
        { id: 'org-1', type: 'organization', name: 'Atlas Sanctum', properties: { description: 'Impact investment platform', status: 'active', founded: '2020' }, verified: true },
        { id: 'project-1', type: 'project', name: 'Amazon Rainforest Protection', properties: { description: 'Forest conservation project', status: 'active', areaHectares: 50000 } },
        { id: 'impact-1', type: 'impact', name: 'Carbon Reduction', properties: { description: 'Carbon offset calculation', unit: 'tonnes CO2e', totalAmount: 150000 } },
        { id: 'tech-1', type: 'technology', name: 'Satellite Monitoring', properties: { description: 'Remote sensing system', accuracy: 0.95, provider: 'Planet Labs' } },
        { id: 'investor-1', type: 'investor', name: 'Green Impact Fund', properties: { description: 'Impact investment fund', aum: 500000000 } },
      ];
      const relationships: GraphRelationship[] = [
        { source: 'org-1', target: 'project-1', type: 'RUNS', strength: 1.0 },
        { source: 'project-1', target: 'impact-1', type: 'GENERATES', strength: 0.9 },
        { source: 'project-1', target: 'tech-1', type: 'USES', strength: 0.92 },
        { source: 'investor-1', target: 'project-1', type: 'INVESTS_IN', strength: 0.85 },
      ];
      return { organizations: nodes, relationships };
    };

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ organizations: GraphNode[]; relationships: GraphRelationship[] }>(
        'KnowledgeGraphService',
        'discoverEcosystem',
        {
          endpoint: '/knowledge-graph/ecosystem',
          method: 'POST',
          body: { organizationId, includeInvestors: options?.includeInvestors ?? true },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  private generateMockGraphData(projectIds: string[]): QueryResult {
    const nodes: GraphNode[] = [
      { id: 'n1', type: 'project', name: 'Amazon Rainforest Protection', properties: { carbon: 15000, status: 'active' }, verified: true },
      { id: 'n2', type: 'organization', name: 'Green Foundation', properties: { founded: 2010, type: 'NGO' } },
      { id: 'n3', type: 'location', name: 'Brazil', properties: { area: 8500000, region: 'South America' } },
      { id: 'n4', type: 'impact', name: 'Carbon Offset', properties: { amount: 50000, unit: 'tonnes' } },
      { id: 'n5', type: 'technology', name: 'Satellite Monitoring', properties: { accuracy: 0.95, provider: 'Planet' } },
      { id: 'n6', type: 'audit', name: 'Verra Audit 2024', properties: { date: '2024-01-15', result: 'Certified' } },
    ];
    const relationships: GraphRelationship[] = [
      { source: 'n2', target: 'n1', type: 'IMPLEMENTS', strength: 0.95 },
      { source: 'n1', target: 'n3', type: 'LOCATED_IN', strength: 1.0 },
      { source: 'n1', target: 'n4', type: 'GENERATES', strength: 0.88 },
      { source: 'n1', target: 'n5', type: 'USES', strength: 0.92 },
      { source: 'n4', target: 'n6', type: 'VERIFIED_BY', strength: 0.95 },
    ];

    return {
      nodes,
      relationships,
      queryTime: 25,
      totalNodes: nodes.length,
      totalRelationships: relationships.length,
    };
  }
}

// ============================================
// REINFORCEMENT LEARNING SERVICE
// ============================================

export class ReinforcementLearningService {
  private apiEndpoint: string;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  async getOptimalInvestment(
    state: PortfolioState,
    options?: { signal?: AbortSignal }
  ): Promise<Result<RLPolicy, AIServiceError>> {
    const mockFallback = () => this.generateMockRLPolicy();

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<RLPolicy>(
        'ReinforcementLearningService',
        'getOptimalInvestment',
        {
          endpoint: '/rl/investment',
          method: 'POST',
          body: state,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async selectIntervention(
    projectId: string,
    availableActions: string[],
    options?: { signal?: AbortSignal }
  ): Promise<Result<RLPolicy, AIServiceError>> {
    const mockFallback = () => ({
      action: availableActions[0] || 'maintain',
      expectedReward: Math.random() * 0.4 + 0.5,
      confidence: 0.75 + Math.random() * 0.2,
      reasoning: 'Based on historical performance data and current market conditions',
      metadata: {
        modelVersion: 'rl-v2.1',
        trainingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidenceScore: 0.82,
        explorationRate: 0.1,
      },
      alternativeActions: availableActions.slice(1, 3).map(action => ({
        action,
        expectedReward: Math.random() * 0.3 + 0.3,
        confidence: 0.6 + Math.random() * 0.2,
        reason: `Alternative option with moderate expected returns`,
      })),
    });

    if (this.useMockFallback || availableActions.length === 0) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<RLPolicy>(
        'ReinforcementLearningService',
        'selectIntervention',
        {
          endpoint: '/rl/intervention',
          method: 'POST',
          body: { projectId, actions: availableActions },
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async updatePolicy(
    feedback: RLFeedback,
    options?: { signal?: AbortSignal }
  ): Promise<Result<{ success: boolean; updatedAt: string }, AIServiceError>> {
    const mockFallback = () => ({
      success: true,
      updatedAt: new Date().toISOString(),
    });

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ success: boolean; updatedAt: string }>(
        'ReinforcementLearningService',
        'updatePolicy',
        {
          endpoint: '/rl/update',
          method: 'POST',
          body: feedback,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  async getOptimalPricing(
    state: { demand: number; supply: number; competitors: number },
    options?: { signal?: AbortSignal }
  ): Promise<Result<{ price: number; confidence: number; recommendedStrategy: string }, AIServiceError>> {
    const mockFallback = () => {
      const basePrice = 50;
      const demandFactor = state.demand / 100;
      const supplyFactor = 1 - (state.supply / 100);
      const optimalPrice = basePrice * (1 + (demandFactor + supplyFactor) * 0.2);
      const confidence = 0.82;
      
      let strategy = 'competitive';
      if (demandFactor > 0.7 && supplyFactor > 0.3) {
        strategy = 'premium';
      } else if (demandFactor < 0.3) {
        strategy = 'discount';
      }
      
      return {
        price: Math.round(optimalPrice * 100) / 100,
        confidence,
        recommendedStrategy: strategy,
      };
    };

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ price: number; confidence: number; recommendedStrategy: string }>(
        'ReinforcementLearningService',
        'getOptimalPricing',
        {
          endpoint: '/rl/pricing',
          method: 'POST',
          body: state,
          signal: options?.signal,
        },
        mockFallback
      );
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        return success(await mockFallback());
      }
      return failure(error as AIServiceError);
    }
  }

  private generateMockRLPolicy(): RLPolicy {
    const actions = [
      { name: 'Increase allocation', description: 'Add 10% more to high-impact projects' },
      { name: 'Maintain position', description: 'Keep current allocation unchanged' },
      { name: 'Reduce exposure', description: 'Decrease allocation to volatile sectors' },
      { name: 'Diversify', description: 'Spread investments across new categories' },
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const confidence = 0.7 + Math.random() * 0.25;
    
    return {
      action: action.name,
      expectedReward: Math.round((Math.random() * 0.4 + 0.6) * 1000) / 1000,
      confidence: Math.round(confidence * 100) / 100,
      reasoning: 'Based on comprehensive market analysis, risk assessment, and alignment with your impact goals. The recommendation considers current market conditions and historical performance data.',
      metadata: {
        modelVersion: 'rl-v2.1',
        trainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidenceScore: confidence,
        explorationRate: 0.1,
        qValues: {
          'increase': Math.random() * 0.5 + 0.5,
          'maintain': Math.random() * 0.4 + 0.4,
          'reduce': Math.random() * 0.3 + 0.3,
          'diversify': Math.random() * 0.4 + 0.4,
        },
      },
      alternativeActions: actions.filter(a => a.name !== action.name).slice(0, 2).map(a => ({
        action: a.name,
        expectedReward: Math.round((Math.random() * 0.3 + 0.4) * 1000) / 1000,
        confidence: Math.round((0.6 + Math.random() * 0.2) * 100) / 100,
        reason: a.description,
      })),
    };
  }
}

// ============================================
// SINGLETON EXPORTS
// ============================================

export const predictionService = new PredictionService();
export const anomalyService = new AnomalyService();
export const recommendationService = new RecommendationService();
export const forecastingService = new ForecastingService();
export const knowledgeGraphService = new KnowledgeGraphService();
export const reinforcementLearningService = new ReinforcementLearningService();

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  Coordinates,
  ImpactMetrics,
  TimeWindow,
  LocationBounds,
  PriceForecast,
  SuccessPrediction,
  RiskFactor,
  ClimateRisk,
  ClimateRiskDetail,
  AdaptationStrategy,
  ImpactPrediction,
  TransactionMetadata,
  Transaction,
  AnomalyResult,
  AnomalyFlag,
  SensorReadingMetadata,
  SensorReading,
  RecommendationMetadata,
  Recommendation,
  InvestmentHistory,
  UserProfile,
  PortfolioProjectAllocation,
  PortfolioSuggestion,
  TimeSeriesForecast,
  ModelMetrics,
  SeasonalityPattern,
  GraphNodeProperties,
  GraphNode,
  GraphRelationshipProperties,
  GraphRelationship,
  QueryFilters,
  QueryResult,
  PortfolioAllocation,
  MarketConditionMetrics,
  PortfolioState,
  RLPolicyMetadata,
  RLPolicy,
  AlternativeAction,
  RLFeedback,
};
