/**
 * Enhanced Vision Service
 * Computer Vision capabilities for Atlas Humanitarian
 * 
 * Capabilities:
 * - Image Classification
 * - Object Detection
 * - Land Cover Classification
 * - Change Detection
 * - Vegetation Index Analysis
 * - Damage Assessment
 * - Document OCR
 * - Scene Understanding
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ChatRequest,
  EmbedRequest,
  EmbedResponse,
  AIConfiguration,
  AIError
} from './types';
import { AIService, AIServiceFactory } from './aiService';
import { TelemetryService } from './observability/telemetry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface VisionAnalysisResult {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  classification: ImageClassification;
  objects: DetectedObject[];
  scene: SceneUnderstanding;
  landCover?: LandCoverClassification;
  vegetationIndex?: VegetationIndex;
  changeDetection?: ChangeDetectionResult;
  damageAssessment?: DamageAssessment;
  textExtraction?: TextExtractionResult;
  safetyAssessment: SafetyAssessment;
  createdAt: string;
  processingTime: number;
}

export interface ImageClassification {
  primaryLabel: string;
  confidence: number;
  labels: ClassificationLabel[];
  taxonomyPath: string[];
}

export interface ClassificationLabel {
  label: string;
  confidence: number;
  hierarchy: string[];
}

export interface DetectedObject {
  id: string;
  boundingBox: BoundingBox;
  label: string;
  confidence: number;
  attributes?: Record<string, any>;
  trackingId?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'pixel' | 'percentage';
}

export interface SceneUnderstanding {
  description: string;
  context: string;
  activities: string[];
  objects: string[];
  people?: PeopleDetection;
  environment: string;
  timeOfDay?: string;
  weather?: string;
}

export interface PeopleDetection {
  count: number;
  density: 'low' | 'medium' | 'high';
  crowdDetected: boolean;
  boundingBoxes?: BoundingBox[];
  faces?: FaceDetection[];
}

export interface FaceDetection {
  boundingBox: BoundingBox;
  confidence: number;
  attributes?: FaceAttributes;
}

export interface FaceAttributes {
  age?: { min: number; max: number; estimate: number };
  gender?: { male: number; female: number };
  emotion?: { happy: number; neutral: number; sad: number };
  occlusion?: { eyes: boolean; mouth: boolean };
}

export interface LandCoverClassification {
  primary: string;
  secondary?: string;
  confidence: number;
  breakdown: LandCoverBreakdown;
  landUseChange?: LandUseChange;
}

export interface LandCoverBreakdown {
  forest: number;
  water: number;
  urban: number;
  agriculture: number;
  barren: number;
  wetland: number;
  ice: number;
  developed: number;
}

export interface LandUseChange {
  previous: string;
  current: string;
  changeDate: string;
  severity: 'low' | 'medium' | 'high';
}

export interface VegetationIndex {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  ndviInterpretation: 'healthy' | 'stressed' | 'degraded' | 'barren' | 'water';
  evi?: number; // Enhanced Vegetation Index
  ndwi?: number; // Normalized Difference Water Index
  savi?: number; // Soil Adjusted Vegetation Index
  ndre?: number; // Red Edge Index
  gci?: number; // Green Chlorophyll Index
  seasonalComparison?: SeasonalComparison;
  recommendations?: string[];
}

export interface SeasonalComparison {
  previousNdvi: number;
  currentNdvi: number;
  change: number;
  changePercentage: number;
  trend: 'improving' | 'stable' | 'declining';
  assessment: string;
}

export interface ChangeDetectionResult {
  changesDetected: boolean;
  confidence: number;
  changes: ChangeEvent[];
  overallChangeType: string;
  affectedArea: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
}

export interface ChangeEvent {
  id: string;
  type: ChangeType;
  boundingBox: BoundingBox;
  confidence: number;
  area: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  beforeImage?: string;
  afterImage?: string;
}

export type ChangeType = 
  | 'deforestation'
  | 'reforestation'
  | 'urbanization'
  | 'fire'
  | 'flood'
  | 'erosion'
  | 'restoration'
  | 'logging'
  | 'mining'
  | 'construction'
  | 'damage'
  | 'vegetation_loss'
  | 'vegetation_gain'
  | 'water_level_change'
  | 'new_structure';

export interface DamageAssessment {
  overallDamageLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'catastrophic';
  damageScore: number; // 0-1
  affectedStructures: StructureDamage[];
  affectedAreas: AreaDamage[];
  casualtyRisk?: 'low' | 'medium' | 'high';
  rescuePriority?: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  safeRoutes?: SafeRoute[];
}

export interface StructureDamage {
  type: 'building' | 'road' | 'bridge' | 'utility' | 'infrastructure';
  damageLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'destroyed';
  count: number;
  boundingBox?: BoundingBox;
  confidence: number;
}

export interface AreaDamage {
  region: string;
  damageLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'catastrophic';
  areaKm2: number;
  populationAffected?: number;
  coordinates?: { lat: number; lng: number };
}

export interface SafeRoute {
  description: string;
  coordinates: { lat: number; lng: number }[];
  status: 'clear' | 'partial' | 'blocked';
  recommendation: string;
}

export interface TextExtractionResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  language?: string;
  documentType?: string;
  structuredData?: Record<string, any>;
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  type: 'paragraph' | 'heading' | 'table' | 'list' | 'signature' | 'handwritten' | 'printed';
}

export interface SafetyAssessment {
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  hazards: Hazard[];
  recommendedActions: string[];
  confidence: number;
}

export interface Hazard {
  type: string;
  location: BoundingBox;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// ============================================================================
// Vision Service Class
// ============================================================================

export class VisionService {
  private aiService: AIService;
  private telemetry: TelemetryService;

  constructor(config?: AIConfiguration) {
    this.telemetry = new TelemetryService({
      serviceName: 'vision-service',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      enableConsole: true,
      enableFile: false,
      enableExternal: false,
      samplingRate: 1,
      correlationIdHeader: 'X-Correlation-ID',
      piiFilterPatterns: []
    });
    
    this.aiService = AIServiceFactory.create(config);
  }

  /**
   * Comprehensive vision analysis
   */
  async analyzeImage(imageUrl: string, options?: VisionAnalysisOptions): Promise<VisionAnalysisResult> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      this.telemetry.info('Starting vision analysis', { correlationId, imageUrl });

      const [
        classification,
        objects,
        scene,
        text,
        safety
      ] = await Promise.all([
        this.classifyImage(imageUrl),
        this.detectObjects(imageUrl),
        this.understandScene(imageUrl),
        this.extractText(imageUrl),
        this.assessSafety(imageUrl)
      ]);

      // Run additional analyses in parallel if requested
      const [
        landCover,
        vegetation,
        changeDetection,
        damage
      ] = await Promise.all([
        options?.analyzeLandCover ? this.classifyLandCover(imageUrl) : Promise.resolve(undefined),
        options?.analyzeVegetation ? this.analyzeVegetationIndex(imageUrl) : Promise.resolve(undefined),
        options?.detectChanges ? this.detectChanges(imageUrl) : Promise.resolve(undefined),
        options?.assessDamage ? this.assessDamage(imageUrl) : Promise.resolve(undefined)
      ]);

      const processingTime = Date.now() - startTime;

      const result: VisionAnalysisResult = {
        id: correlationId,
        imageUrl,
        classification,
        objects,
        scene,
        textExtraction: text,
        safetyAssessment: safety,
        landCover,
        vegetationIndex: vegetation,
        changeDetection,
        damageAssessment: damage,
        createdAt: new Date().toISOString(),
        processingTime
      };

      this.telemetry.info('Vision analysis completed', { 
        correlationId, 
        processingTime,
        primaryLabel: classification.primaryLabel,
        objectCount: objects.length,
        safetyLevel: safety.riskLevel
      });

      return result;
    } catch (error) {
      this.telemetry.error('Vision analysis failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Image Classification using vision-language models
   */
  async classifyImage(imageUrl: string): Promise<ImageClassification> {
    const prompt = `Classify this image with high precision. Return JSON:

{
  "primaryLabel": "main subject or scene",
  "confidence": 0.0-1.0,
  "labels": [
    {
      "label": "description",
      "confidence": 0.0-1.0,
      "hierarchy": ["category", "subcategory", "specific"]
    }
  ],
  "taxonomyPath": ["level1", "level2", "level3"]
}

Focus on humanitarian, environmental, and development contexts.
Consider: disaster damage, infrastructure, vegetation, water bodies, buildings, people activities.`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.1,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<ImageClassification>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Image classification failed', { error: (error as Error).message });
      return {
        primaryLabel: 'Unknown',
        confidence: 0,
        labels: [],
        taxonomyPath: []
      };
    }
  }

  /**
   * Object Detection
   */
  async detectObjects(imageUrl: string): Promise<DetectedObject[]> {
    const prompt = `Detect and locate all significant objects in this image. Return JSON array:

[
  {
    "id": "unique-id",
    "boundingBox": {
      "x": 0-100 (percentage from left),
      "y": 0-100 (percentage from top),
      "width": 0-100 (percentage width),
      "height": 0-100 (percentage height),
      "unit": "percentage"
    },
    "label": "object name",
    "confidence": 0.0-1.0,
    "attributes": {
      "color": "dominant color",
      "size": "small|medium|large",
      "condition": "good|damaged|partial"
    }
  }
]

Detect: people, vehicles, buildings, roads, water bodies, vegetation, fires, smoke, debris, infrastructure, animals, signs.`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.1,
        max_tokens: 1000,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<DetectedObject[]>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Object detection failed', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Scene Understanding
   */
  async understandScene(imageUrl: string): Promise<SceneUnderstanding> {
    const prompt = `Analyze and describe this scene comprehensively. Return JSON:

{
  "description": "2-3 sentence description",
  "context": "where/when this might be happening",
  "activities": ["activity 1", "activity 2"],
  "objects": ["key object 1", "key object 2"],
  "people": {
    "count": number,
    "density": "low|medium|high",
    "crowdDetected": true/false
  },
  "environment": "indoor|outdoor|urban|rural|natural",
  "timeOfDay": "dawn|morning|afternoon|evening|night",
  "weather": "clear|cloudy|rainy|foggy|stormy"
}

Be specific about humanitarian-relevant details.`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      const result = this.parseVisionResponse<SceneUnderstanding>(response.choices[0].message.content);
      
      // Ensure people detection exists
      if (!result.people) {
        result.people = { count: 0, density: 'low', crowdDetected: false };
      }

      return result;
    } catch (error) {
      this.telemetry.warn('Scene understanding failed', { error: (error as Error).message });
      return {
        description: 'Unable to analyze scene',
        context: 'Unknown',
        activities: [],
        objects: [],
        environment: 'unknown',
        recommendations: [],
        confidence: 0
      };
    }
  }

  /**
   * Text Extraction (OCR)
   */
  async extractText(imageUrl: string): Promise<TextExtractionResult> {
    const prompt = `Extract all text from this image. Return JSON:

{
  "text": "full extracted text with proper formatting",
  "confidence": 0.0-1.0,
  "blocks": [
    {
      "text": "block text",
      "confidence": 0.0-1.0,
      "boundingBox": {
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "unit": "percentage"
      },
      "type": "paragraph|heading|table|list|signature|handwritten|printed"
    }
  ],
  "language": "detected language code",
  "documentType": "if applicable (sign, document, poster, etc.)",
  "structuredData": {
    "extracted fields": "values"
  }
}`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.1,
        max_tokens: 2000,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<TextExtractionResult>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Text extraction failed', { error: (error as Error).message });
      return {
        text: '',
        confidence: 0,
        blocks: []
      };
    }
  }

  /**
   * Safety Assessment
   */
  async assessSafety(imageUrl: string): Promise<SafetyAssessment> {
    const prompt = `Assess the safety of this scene. Return JSON:

{
  "isSafe": true/false,
  "riskLevel": "low|medium|high|critical",
  "hazards": [
    {
      "type": "fire|flood|debris|instability|chemical|biological|violence|other",
      "location": {
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "unit": "percentage"
      },
      "severity": "low|medium|high|critical",
      "description": "what hazard"
    }
  ],
  "recommendedActions": ["action 1", "action 2"],
  "confidence": 0.0-1.0
}

Identify: fire, flood, structural damage, hazardous materials, unstable structures, violence, health hazards.`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      const result = this.parseVisionResponse<SafetyAssessment>(response.choices[0].message.content);
      
      // Ensure required fields
      if (!result.hazards) result.hazards = [];
      if (!result.recommendedActions) result.recommendedActions = [];

      return result;
    } catch (error) {
      this.telemetry.warn('Safety assessment failed', { error: (error as Error).message });
      return {
        isSafe: true,
        riskLevel: 'low',
        hazards: [],
        recommendedActions: [],
        confidence: 0
      };
    }
  }

  /**
   * Land Cover Classification
   */
  async classifyLandCover(imageUrl: string): Promise<LandCoverClassification> {
    const prompt = `Classify the land cover types in this satellite/aerial image. Return JSON:

{
  "primary": "main land cover type",
  "secondary": "secondary type if mixed",
  "confidence": 0.0-1.0,
  "breakdown": {
    "forest": 0.0-1.0,
    "water": 0.0-1.0,
    "urban": 0.0-1.0,
    "agriculture": 0.0-1.0,
    "barren": 0.0-1.0,
    "wetland": 0.0-1.0,
    "ice": 0.0-1.0,
    "developed": 0.0-1.0
  },
  "landUseChange": {
    "previous": "previous classification if changed",
    "current": "current classification",
    "changeDate": "approximate date of change if visible",
    "severity": "low|medium|high"
  }
}`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<LandCoverClassification>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Land cover classification failed', { error: (error as Error).message });
      return {
        primary: 'Unknown',
        confidence: 0,
        breakdown: { forest: 0, water: 0, urban: 0, agriculture: 0, barren: 0, wetland: 0, ice: 0, developed: 0 }
      };
    }
  }

  /**
   * Vegetation Index Analysis
   */
  async analyzeVegetationIndex(imageUrl: string): Promise<VegetationIndex> {
    const prompt = `Analyze vegetation health in this image. Return JSON:

{
  "ndvi": -1.0 to 1.0,
  "ndviInterpretation": "healthy|stressed|degraded|barren|water",
  "evi": -1.0 to 1.0,
  "ndwi": -1.0 to 1.0,
  "savi": -1.0 to 1.0,
  "ndre": -1.0 to 1.0,
  "gci": -1.0 to 1.0,
  "seasonalComparison": {
    "previousNdvi": number,
    "currentNdvi": number,
    "change": number,
    "changePercentage": number,
    "trend": "improving|stable|declining",
    "assessment": "brief analysis"
  },
  "recommendations": ["action 1", "action 2"]
}

NDVI interpretation:
- > 0.6: Healthy, dense vegetation
- 0.2-0.6: Moderate vegetation, some stress
- 0-0.2: Sparse vegetation, degraded
- < 0: Non-vegetated (water, soil, urban)`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<VegetationIndex>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Vegetation analysis failed', { error: (error as Error).message });
      return {
        ndvi: 0,
        ndviInterpretation: 'barren',
        recommendations: []
      };
    }
  }

  /**
   * Change Detection (requires comparison image)
   */
  async detectChanges(beforeImageUrl?: string, afterImageUrl?: string): Promise<ChangeDetectionResult> {
    if (!beforeImageUrl || !afterImageUrl) {
      // Analyze changes within a single image
      return this.detectChangesInSingleImage(afterImageUrl || beforeImageUrl!);
    }

    const prompt = `Compare these two satellite images to detect changes. Return JSON:

{
  "changesDetected": true/false,
  "confidence": 0.0-1.0,
  "changes": [
    {
      "id": "unique-id",
      "type": "deforestation|reforestation|urbanization|fire|flood|erosion|restoration|logging|mining|construction|damage|vegetation_loss|vegetation_gain|water_level_change|new_structure",
      "boundingBox": {
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "unit": "percentage"
      },
      "confidence": 0.0-1.0,
      "area": number,
      "severity": "low|medium|high|critical",
      "description": "what changed"
    }
  ],
  "overallChangeType": "primary change category",
  "affectedArea": number,
  "severity": "low|medium|high|critical",
  "recommendations": ["action 1", "action 2"]
}`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: beforeImageUrl } },
              { type: 'image_url', image_url: { url: afterImageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 1000,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<ChangeDetectionResult>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Change detection failed', { error: (error as Error).message });
      return {
        changesDetected: false,
        confidence: 0,
        changes: [],
        overallChangeType: 'none',
        affectedArea: 0,
        severity: 'low'
      };
    }
  }

  private async detectChangesInSingleImage(imageUrl: string): Promise<ChangeDetectionResult> {
    const prompt = `Analyze this image for visible changes or damage compared to typical conditions. Return JSON:

{
  "changesDetected": true/false,
  "confidence": 0.0-1.0,
  "changes": [
    {
      "id": "unique-id",
      "type": "damage|deforestation|fire|flood|erosion|construction|new_structure",
      "boundingBox": {
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "unit": "percentage"
      },
      "confidence": 0.0-1.0,
      "area": number,
      "severity": "low|medium|high|critical",
      "description": "observed change"
    }
  ],
  "overallChangeType": "primary observation",
  "affectedArea": number,
  "severity": "low|medium|high|critical",
  "recommendations": ["action 1"]
}`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<ChangeDetectionResult>(response.choices[0].message.content);
    } catch (error) {
      return {
        changesDetected: false,
        confidence: 0,
        changes: [],
        overallChangeType: 'none',
        affectedArea: 0,
        severity: 'low'
      };
    }
  }

  /**
   * Damage Assessment
   */
  async assessDamage(imageUrl: string): Promise<DamageAssessment> {
    const prompt = `Assess damage in this image. This is critical for humanitarian response. Return JSON:

{
  "overallDamageLevel": "none|minor|moderate|severe|catastrophic",
  "damageScore": 0.0-1.0,
  "affectedStructures": [
    {
      "type": "building|road|bridge|utility|infrastructure",
      "damageLevel": "none|minor|moderate|severe|destroyed",
      "count": number,
      "confidence": 0.0-1.0
    }
  ],
  "affectedAreas": [
    {
      "region": "area name if identifiable",
      "damageLevel": "none|minor|moderate|severe|catastrophic",
      "areaKm2": number,
      "populationAffected": number,
      "coordinates": {"lat": number, "lng": number}
    }
  ],
  "casualtyRisk": "low|medium|high",
  "rescuePriority": "low|medium|high|critical",
  "recommendations": ["immediate action 1", "immediate action 2"],
  "safeRoutes": [
    {
      "description": "route description",
      "coordinates": [{"lat": number, "lng": number}],
      "status": "clear|partial|blocked",
      "recommendation": "use with caution, etc."
    }
  ]
}

Be conservative and prioritize humanitarian safety.`;

    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        model: 'gpt-4-vision-preview',
        temperature: 0.2,
        max_tokens: 800,
        correlationId: uuidv4()
      });

      return this.parseVisionResponse<DamageAssessment>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Damage assessment failed', { error: (error as Error).message });
      return {
        overallDamageLevel: 'none',
        damageScore: 0,
        affectedStructures: [],
        affectedAreas: [],
        recommendations: ['Unable to assess - manual inspection required']
      };
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private parseVisionResponse<T>(content: string): T {
    try {
      const cleaned = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      this.telemetry.warn('Failed to parse vision response', { content });
      throw error;
    }
  }
}

// ============================================================================
// Options Interface
// ============================================================================

export interface VisionAnalysisOptions {
  analyzeLandCover?: boolean;
  analyzeVegetation?: boolean;
  detectChanges?: boolean;
  assessDamage?: boolean;
  focus?: string[];
}

// ============================================================================
// Service Factory
// ============================================================================

let visionServiceInstance: VisionService | null = null;

export function getVisionService(config?: AIConfiguration): VisionService {
  if (!visionServiceInstance) {
    visionServiceInstance = new VisionService(config);
  }
  return visionServiceInstance;
}

export function resetVisionService(): void {
  visionServiceInstance = null;
}
