/**
 * RVE AI/ML Service Integration
 * Interfaces for AI-powered predictions, optimizations, and insights
 */

import { apiClient } from '../api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface PredictionInput {
  projectId: string;
  metrics: string[];
  timeframe: number; // days
  historicalData?: Record<string, number[]>;
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timeframe: number;
}

export interface Optimization {
  id: string;
  title: string;
  description: string;
  impact: {
    metric: string;
    expectedChange: number;
    unit: string;
  };
  confidence: number;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  prerequisites?: string[];
}

export interface AnomalyDetection {
  detected: boolean;
  type?: 'spike' | 'drop' | 'pattern_break';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  possibleCauses: string[];
  recommendations: string[];
}

export interface ImpactForecast {
  projectId: string;
  timeframe: number;
  metrics: {
    [key: string]: {
      current: number;
      forecast: number[];
      confidence: number[];
      scenarios: {
        best: number[];
        expected: number[];
        worst: number[];
      };
    };
  };
}

// ============================================================================
// AI SERVICE
// ============================================================================

export class AIService {
  /**
   * Get impact predictions for a project
   */
  async getPredictions(input: PredictionInput): Promise<Prediction[]> {
    try {
      const response = await apiClient.post<{ data: Prediction[] }>(
        '/ai/predictions',
        input
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get predictions:', error);
      throw error;
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizations(projectId: string): Promise<Optimization[]> {
    try {
      const response = await apiClient.get<{ data: Optimization[] }>(
        `/ai/optimizations/${projectId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get optimizations:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies in impact data
   */
  async detectAnomalies(
    projectId: string,
    metric: string,
    data: number[]
  ): Promise<AnomalyDetection> {
    try {
      const response = await apiClient.post<{ data: AnomalyDetection }>(
        '/ai/anomaly-detection',
        { projectId, metric, data }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      throw error;
    }
  }

  /**
   * Generate impact forecast with scenarios
   */
  async getImpactForecast(
    projectId: string,
    timeframe: number,
    metrics: string[]
  ): Promise<ImpactForecast> {
    try {
      const response = await apiClient.post<{ data: ImpactForecast }>(
        '/ai/forecast',
        { projectId, timeframe, metrics }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get forecast:', error);
      throw error;
    }
  }

  /**
   * Analyze satellite imagery
   */
  async analyzeSatelliteImage(
    imageUrl: string,
    analysisType: 'vegetation' | 'water' | 'land_use' | 'deforestation'
  ): Promise<{
    confidence: number;
    metrics: Record<string, number>;
    changeDetection?: {
      areaChanged: number;
      percentageChange: number;
      changeType: string;
    };
  }> {
    try {
      const response = await apiClient.post('/ai/satellite-analysis', {
        imageUrl,
        analysisType,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze satellite image:', error);
      throw error;
    }
  }

  /**
   * Get AI-generated report summary
   */
  async generateReportSummary(reportId: string): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    riskFactors: string[];
  }> {
    try {
      const response = await apiClient.post(`/ai/summarize-report/${reportId}`, {});
      return response.data;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw error;
    }
  }

  /**
   * Predict asset price movement
   */
  async predictAssetPrice(
    assetId: string,
    timeframe: number
  ): Promise<{
    currentPrice: number;
    predictions: Array<{
      timestamp: string;
      price: number;
      confidence: number;
    }>;
    factors: Array<{
      name: string;
      impact: number;
      direction: 'positive' | 'negative';
    }>;
  }> {
    try {
      const response = await apiClient.get(
        `/ai/price-prediction/${assetId}?timeframe=${timeframe}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to predict price:', error);
      throw error;
    }
  }

  /**
   * Calculate carbon sequestration from images
   */
  async calculateCarbonFromImages(images: string[]): Promise<{
    estimatedCarbon: number;
    confidence: number;
    methodology: string;
    breakdown: {
      soilCarbon: number;
      biomassCarbon: number;
      vegetationCarbon: number;
    };
  }> {
    try {
      const response = await apiClient.post('/ai/carbon-estimation', { images });
      return response.data;
    } catch (error) {
      console.error('Failed to calculate carbon:', error);
      throw error;
    }
  }

  /**
   * Verify impact claims using AI
   */
  async verifyImpactClaim(
    claim: {
      metric: string;
      reportedValue: number;
      evidence: string[];
      historicalData?: number[];
    }
  ): Promise<{
    verified: boolean;
    confidence: number;
    discrepancies: string[];
    verificationMethod: string;
    reasoning: string;
  }> {
    try {
      const response = await apiClient.post('/ai/verify-claim', claim);
      return response.data;
    } catch (error) {
      console.error('Failed to verify claim:', error);
      throw error;
    }
  }
}

// ============================================================================
// COMPUTER VISION SERVICE
// ============================================================================

export class ComputerVisionService {
  /**
   * Detect tree count from drone/satellite imagery
   */
  async countTrees(imageUrl: string): Promise<{
    count: number;
    confidence: number;
    treeDensity: number;
    speciesDetected?: string[];
  }> {
    const response = await apiClient.post('/ai/cv/count-trees', { imageUrl });
    return response.data;
  }

  /**
   * Measure vegetation health index
   */
  async measureVegetationHealth(imageUrl: string): Promise<{
    ndvi: number; // Normalized Difference Vegetation Index
    healthScore: number; // 0-100
    stressAreas: Array<{ x: number; y: number; severity: number }>;
  }> {
    const response = await apiClient.post('/ai/cv/vegetation-health', { imageUrl });
    return response.data;
  }

  /**
   * Detect deforestation or land use change
   */
  async detectLandChange(
    beforeImageUrl: string,
    afterImageUrl: string
  ): Promise<{
    changeDetected: boolean;
    areaChanged: number; // hectares
    changeType: 'deforestation' | 'reforestation' | 'urban_expansion' | 'agriculture';
    confidence: number;
    changeMap: string; // URL to visualization
  }> {
    const response = await apiClient.post('/ai/cv/detect-change', {
      beforeImageUrl,
      afterImageUrl,
    });
    return response.data;
  }

  /**
   * Identify wildlife from camera trap images
   */
  async identifyWildlife(imageUrl: string): Promise<{
    species: string[];
    count: number;
    confidence: number;
    boundingBoxes: Array<{
      species: string;
      x: number;
      y: number;
      width: number;
      height: number;
      confidence: number;
    }>;
  }> {
    const response = await apiClient.post('/ai/cv/identify-wildlife', { imageUrl });
    return response.data;
  }
}

// ============================================================================
// NLP SERVICE
// ============================================================================

export class NLPService {
  /**
   * Extract key information from documents
   */
  async extractInformation(
    documentText: string,
    extractionType: 'metrics' | 'locations' | 'dates' | 'entities'
  ): Promise<Record<string, any>> {
    const response = await apiClient.post('/ai/nlp/extract', {
      text: documentText,
      type: extractionType,
    });
    return response.data;
  }

  /**
   * Sentiment analysis of community reports
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number; // -1 to 1
    aspects: Array<{
      topic: string;
      sentiment: string;
      score: number;
    }>;
  }> {
    const response = await apiClient.post('/ai/nlp/sentiment', { text });
    return response.data;
  }

  /**
   * Translate traditional knowledge
   */
  async translateKnowledge(
    text: string,
    fromLanguage: string,
    toLanguage: string,
    preserveCulturalContext: boolean = true
  ): Promise<{
    translatedText: string;
    confidence: number;
    culturalNotes?: string[];
  }> {
    const response = await apiClient.post('/ai/nlp/translate', {
      text,
      fromLanguage,
      toLanguage,
      preserveCulturalContext,
    });
    return response.data;
  }
}

// ============================================================================
// TIME SERIES ANALYSIS
// ============================================================================

export class TimeSeriesService {
  /**
   * Forecast future values
   */
  async forecast(
    data: number[],
    periods: number,
    seasonality?: number
  ): Promise<{
    forecast: number[];
    lowerBound: number[];
    upperBound: number[];
    confidence: number;
  }> {
    const response = await apiClient.post('/ai/timeseries/forecast', {
      data,
      periods,
      seasonality,
    });
    return response.data;
  }

  /**
   * Detect trends and patterns
   */
  async detectTrends(data: number[]): Promise<{
    trend: 'increasing' | 'decreasing' | 'stable' | 'cyclic';
    slope: number;
    seasonality: boolean;
    changePoints: number[];
  }> {
    const response = await apiClient.post('/ai/timeseries/trends', { data });
    return response.data;
  }
}

// Singleton instances
export const aiService = new AIService();
export const cvService = new ComputerVisionService();
export const nlpService = new NLPService();
export const timeSeriesService = new TimeSeriesService();
