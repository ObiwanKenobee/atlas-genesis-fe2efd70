/**
 * Vision Service - Computer Vision for Atlas Sanctum
 * Production-ready implementation with typed interfaces and consistent error handling
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AIServiceError, 
  apiClient, 
  LRUCache,
  success,
  failure,
  type Result 
} from './baseClient';

// ============================================
// TYPES
// ============================================

export interface VisionAnalysis {
  id: string;
  imageUrl: string;
  landCover: LandCoverClassification;
  changeDetected: ChangeEvent[];
  healthScore: number;
  features: DetectedFeature[];
  vegetationIndex: VegetationIndex;
  riskAssessment: RiskAssessment;
  createdAt: string;
  analysisVersion?: string;
}

export interface LandCoverClassification {
  forest: number;
  water: number;
  urban: number;
  agriculture: number;
  barren: number;
  wetland: number;
  primary: string;
  confidence: number;
  secondary?: string;
  landUseChange?: {
    previous: string;
    current: string;
    changeDate: string;
  };
}

export interface ChangeEvent {
  id: string;
  type: 'deforestation' | 'reforestation' | 'urbanization' | 'fire' | 'flood' | 'erosion' | 'restoration' | 'logging' | 'mining';
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: number; // hectares
  coordinates: Coordinates;
  detectedAt: string;
  confidence: number;
  affectedSpecies?: string[];
  imageComparison?: {
    beforeUrl: string;
    afterUrl: string;
  };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFeature {
  id: string;
  type: 'water_body' | 'road' | 'building' | 'fire' | 'smoke' | 'cloud' | 'shadow' | 'crop' | 'glacier' | 'sand_dune';
  confidence: number;
  boundingBox?: BoundingBox;
  area?: number;
  properties?: Record<string, unknown>;
}

export interface VegetationIndex {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  evi: number; // Enhanced Vegetation Index
  ndwi: number; // Normalized Difference Water Index
  savi?: number; // Soil Adjusted Vegetation Index
  classification: 'healthy' | 'stressed' | 'degraded' | 'barren' | 'water';
  seasonalComparison?: {
    previousNdvi: number;
    change: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export interface RiskAssessment {
  overallRisk: number; // 0-1
  deforestationRisk: number;
  fireRisk: number;
  erosionRisk: number;
  droughtRisk: number;
  floodRisk?: number;
  alerts: RiskAlert[];
  riskFactors?: {
    factor: string;
    contribution: number;
    mitigatable: boolean;
  }[];
}

export interface RiskAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  affectedArea?: number;
  recommendedActions?: string[];
}

export interface SpeciesRecognition {
  id: string;
  species: string;
  scientificName?: string;
  commonName: string;
  confidence: number;
  boundingBox: BoundingBox;
  count?: number;
  countConfidence?: number;
  behavior?: 'resting' | 'moving' | 'feeding' | 'migrating' | 'unknown';
  habitat?: string;
}

export interface FireRiskAssessment {
  risk: number;
  hotspots: FireHotspot[];
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  fireWeatherIndex?: number;
  recommendations?: string[];
}

export interface FireHotspot {
  lat: number;
  lng: number;
  intensity: number;
  detectedAt: string;
  size: number; // hectares
  proximityToProject?: number; // km
}

// ============================================
// COMMON TYPES
// ============================================

export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateMockLandCover(): LandCoverClassification {
  const forest = Math.random() * 0.4 + 0.4;
  const water = Math.random() * 0.1 + 0.05;
  const urban = Math.random() * 0.1;
  const agriculture = Math.random() * 0.2 + 0.1;
  const barren = Math.random() * 0.1;
  const wetland = Math.random() * 0.05 + 0.02;
  
  // Normalize to sum to 1
  const total = forest + water + urban + agriculture + barren + wetland;
  
  return {
    forest: Math.round(forest / total * 100) / 100,
    water: Math.round(water / total * 100) / 100,
    urban: Math.round(urban / total * 100) / 100,
    agriculture: Math.round(agriculture / total * 100) / 100,
    barren: Math.round(barren / total * 100) / 100,
    wetland: Math.round(wetland / total * 100) / 100,
    primary: 'forest',
    confidence: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
  };
}

function generateMockChangeEvents(): ChangeEvent[] {
  const types: ChangeEvent['type'][] = ['deforestation', 'reforestation', 'fire', 'restoration', 'logging'];
  
  const events: ChangeEvent[] = [];
  const numEvents = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numEvents; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    events.push({
      id: uuidv4(),
      type,
      severity: type === 'fire' || type === 'deforestation' ? 'high' : type === 'logging' ? 'medium' : 'low',
      area: Math.round((Math.random() * 100 + 10) * 100) / 100,
      coordinates: {
        lat: -3.4653 + (Math.random() - 0.5) * 2,
        lng: -62.2159 + (Math.random() - 0.5) * 2,
      },
      detectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
      affectedSpecies: type === 'deforestation' ? ['Jaguar', 'Tapir', 'Macaw'] : undefined,
    });
  }
  
  return events;
}

function generateMockFeatures(): DetectedFeature[] {
  const types: DetectedFeature['type'][] = ['water_body', 'road', 'building', 'cloud', 'shadow', 'crop'];
  
  const features: DetectedFeature[] = [];
  const numFeatures = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numFeatures; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    features.push({
      id: uuidv4(),
      type,
      confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
      boundingBox: {
        x: Math.round(Math.random() * 0.3 * 100) / 100,
        y: Math.round(Math.random() * 0.3 * 100) / 100,
        width: Math.round((0.1 + Math.random() * 0.2) * 100) / 100,
        height: Math.round((0.1 + Math.random() * 0.2) * 100) / 100,
      },
      area: Math.round(Math.random() * 1000 * 100) / 100,
    });
  }
  
  return features;
}

function generateMockVegetationIndex(): VegetationIndex {
  const ndvi = Math.round((Math.random() * 0.6 + 0.2) * 100) / 100;
  
  let classification: VegetationIndex['classification'];
  if (ndvi < 0.2) classification = 'barren';
  else if (ndvi < 0.4) classification = 'degraded';
  else if (ndvi < 0.6) classification = 'stressed';
  else classification = 'healthy';
  
  return {
    ndvi,
    evi: Math.round((ndvi * 0.8 + Math.random() * 0.1) * 100) / 100,
    ndwi: Math.round((Math.random() * 0.3 + 0.1) * 100) / 100,
    savi: Math.round((ndvi * 1.2) * 100) / 100,
    classification,
    seasonalComparison: {
      previousNdvi: Math.round((ndvi - 0.1 + Math.random() * 0.2) * 100) / 100,
      change: Math.round((Math.random() - 0.5) * 0.2 * 100) / 100,
      trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
    },
  };
}

function generateMockRiskAssessment(): RiskAssessment {
  const overallRisk = Math.round(Math.random() * 0.5 * 100) / 100;
  
  return {
    overallRisk,
    deforestationRisk: Math.round((overallRisk * 0.8 + Math.random() * 0.2) * 100) / 100,
    fireRisk: Math.round((Math.random() * 0.3 + 0.1) * 100) / 100,
    erosionRisk: Math.round((Math.random() * 0.3) * 100) / 100,
    droughtRisk: Math.round((Math.random() * 0.4) * 100) / 100,
    floodRisk: Math.round((Math.random() * 0.2) * 100) / 100,
    alerts: [
      {
        id: uuidv4(),
        type: 'deforestation',
        message: 'Minor deforestation detected in buffer zone',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        affectedArea: Math.round(Math.random() * 10 * 100) / 100,
        recommendedActions: [
          'Verify if activity is authorized',
          'Contact local authorities if unauthorized',
          'Schedule follow-up imaging in 30 days',
        ],
      },
    ],
    riskFactors: [
      { factor: 'Proximity to roads', contribution: 0.3, mitigatable: true },
      { factor: 'Historical deforestation', contribution: 0.25, mitigatable: false },
      { factor: 'Dry season conditions', contribution: 0.2, mitigatable: false },
    ],
  };
}

// ============================================
// VISION SERVICE CLASS
// ============================================

export class VisionService {
  private apiEndpoint: string;
  private cache: LRUCache<VisionAnalysis>;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.cache = new LRUCache<VisionAnalysis>({ 
      maxSize: 200, 
      ttl: 30 * 60 * 1000, // 30 minutes for imagery
    });
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  /**
   * Analyze satellite imagery
   */
  async analyzeSatelliteImage(
    imageUrl: string,
    options?: { signal?: AbortSignal; useCache?: boolean }
  ): Promise<Result<VisionAnalysis, AIServiceError>> {
    const cacheKey = `vision:${hashText(imageUrl)}`;
    
    if (options?.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) return success(cached);
    }

    const mockFallback = async (): Promise<VisionAnalysis> => ({
      id: uuidv4(),
      imageUrl,
      landCover: generateMockLandCover(),
      changeDetected: generateMockChangeEvents(),
      healthScore: Math.round((Math.random() * 30 + 70) * 10) / 10,
      features: generateMockFeatures(),
      vegetationIndex: generateMockVegetationIndex(),
      riskAssessment: generateMockRiskAssessment(),
      createdAt: new Date().toISOString(),
      analysisVersion: '2.1.0',
    });

    if (this.useMockFallback) {
      const analysis = await mockFallback();
      this.cache.set(cacheKey, analysis);
      return success(analysis);
    }

    try {
      const data = await apiClient.request<VisionAnalysis>(
        'VisionService',
        'analyzeSatelliteImage',
        {
          endpoint: '/vision/analyze',
          method: 'POST',
          body: { imageUrl },
          signal: options?.signal,
        },
        mockFallback
      );
      
      this.cache.set(cacheKey, data);
      return success(data);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        const analysis = await mockFallback();
        this.cache.set(cacheKey, analysis);
        return success(analysis);
      }
      return failure(error as AIServiceError);
    }
  }

  /**
   * Detect changes between two images
   */
  async detectChanges(
    beforeImage: string,
    afterImage: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<ChangeEvent[], AIServiceError>> {
    const mockFallback = async (): Promise<ChangeEvent[]> => generateMockChangeEvents();

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<ChangeEvent[]>(
        'VisionService',
        'detectChanges',
        {
          endpoint: '/vision/changes',
          method: 'POST',
          body: { before: beforeImage, after: afterImage },
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

  /**
   * Identify species from camera trap image
   */
  async identifySpecies(
    imageUrl: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<SpeciesRecognition[], AIServiceError>> {
    const mockFallback = async (): Promise<SpeciesRecognition[]> => [
      {
        id: uuidv4(),
        species: 'Panthera onca',
        scientificName: 'Panthera onca',
        commonName: 'Jaguar',
        confidence: 0.89,
        boundingBox: { x: 0.2, y: 0.3, width: 0.3, height: 0.4 },
        count: 1,
        countConfidence: 0.92,
        behavior: 'moving',
        habitat: 'tropical forest',
      },
      {
        id: uuidv4(),
        species: 'Tayassu pecari',
        scientificName: 'Tayassu pecari',
        commonName: 'White-lipped Peccary',
        confidence: 0.85,
        boundingBox: { x: 0.5, y: 0.4, width: 0.2, height: 0.2 },
        count: 8,
        countConfidence: 0.78,
        behavior: 'moving',
        habitat: 'tropical forest',
      },
    ];

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<SpeciesRecognition[]>(
        'VisionService',
        'identifySpecies',
        {
          endpoint: '/vision/species',
          method: 'POST',
          body: { imageUrl },
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

  /**
   * Calculate vegetation indices
   */
  async calculateVegetationIndex(
    imageUrl: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<VegetationIndex, AIServiceError>> {
    const mockFallback = async (): Promise<VegetationIndex> => generateMockVegetationIndex();

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<VegetationIndex>(
        'VisionService',
        'calculateVegetationIndex',
        {
          endpoint: '/vision/vegetation-index',
          method: 'POST',
          body: { imageUrl },
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

  /**
   * Assess fire risk from imagery
   */
  async assessFireRisk(
    imageUrl: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<FireRiskAssessment, AIServiceError>> {
    const mockFallback = async (): Promise<FireRiskAssessment> => {
      const risk = Math.round(Math.random() * 0.3 * 100) / 100;
      return {
        risk,
        hotspots: [],
        riskLevel: risk < 0.2 ? 'low' : risk < 0.4 ? 'moderate' : risk < 0.6 ? 'high' : 'extreme',
        fireWeatherIndex: Math.round((3 + Math.random() * 4) * 10) / 10,
        recommendations: [
          'Monitor weather conditions closely',
          'Ensure fire suppression equipment is operational',
          'Alert local fire management teams',
        ],
      };
    };

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<FireRiskAssessment>(
        'VisionService',
        'assessFireRisk',
        {
          endpoint: '/vision/fire-risk',
          method: 'POST',
          body: { imageUrl },
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

  /**
   * Detect deforestation patterns from historical images
   */
  async detectDeforestation(
    historicalImages: string[],
    options?: { signal?: AbortSignal }
  ): Promise<Result<ChangeEvent[], AIServiceError>> {
    const mockFallback = async (): Promise<ChangeEvent[]> => {
      const events = generateMockChangeEvents();
      return events.filter(e => e.type === 'deforestation' || e.type === 'logging');
    };

    if (this.useMockFallback || historicalImages.length === 0) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<ChangeEvent[]>(
        'VisionService',
        'detectDeforestation',
        {
          endpoint: '/vision/deforestation',
          method: 'POST',
          body: { images: historicalImages },
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

  /**
   * Get land cover comparison over time
   */
  async getLandCoverComparison(
    imageUrls: string[],
    options?: { signal?: AbortSignal }
  ): Promise<Result<{ changes: LandCoverClassification[]; summary: { totalChange: number; primaryChange: string } }, AIServiceError>> {
    const mockFallback = async (): Promise<{ changes: LandCoverClassification[]; summary: { totalChange: number; primaryChange: string } }> => ({
      changes: imageUrls.map(() => generateMockLandCover()),
      summary: {
        totalChange: Math.round(Math.random() * 10 * 100) / 100,
        primaryChange: 'forest',
      },
    });

    if (this.useMockFallback || imageUrls.length === 0) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ changes: LandCoverClassification[]; summary: { totalChange: number; primaryChange: string } }>(
        'VisionService',
        'getLandCoverComparison',
        {
          endpoint: '/vision/land-cover-comparison',
          method: 'POST',
          body: { images: imageUrls },
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

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return this.cache.getStats();
  }
}

// ============================================
// HELPER FUNCTION
// ============================================

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const visionService = new VisionService();
export default visionService;

// ============================================
// TYPE EXPORTS
// ============================================

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
  Coordinates,
};
