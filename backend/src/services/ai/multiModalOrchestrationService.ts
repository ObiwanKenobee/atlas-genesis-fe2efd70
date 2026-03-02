/**
 * Multi-Modal AI Orchestration Service
 * Unified interface for combining NLP, Vision, and Knowledge Graph capabilities
 * 
 * Capabilities:
 * - Unified query processing across modalities
 * - Cross-modal reasoning
 * - Context-aware multi-modal synthesis
 * - Intelligent routing to specialized services
 */

import { v4 as uuidv4 } from 'uuid';
import { TelemetryService } from './observability/telemetry';
import { getEnhancedNLPService, NLPAnalysisResult, NLPAnalysisOptions } from './enhancedNLPService';
import { getVisionService, VisionAnalysisResult, VisionAnalysisOptions } from './visionService';
import { getKnowledgeGraphService, KnowledgeGraphService, Entity, Relationship } from './knowledgeGraphService';
import { AIConfiguration } from './types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface MultiModalQuery {
  text?: string;
  imageUrls?: string[];
  context?: QueryContext;
  options?: OrchestrationOptions;
}

export interface QueryContext {
  userId?: string;
  sessionId?: string;
  domain?: string;
  previousQuery?: string;
  entities?: string[];
  location?: { lat: number; lng: number; radius?: number };
  timeRange?: { start: string; end: string };
}

export interface OrchestrationOptions {
  includeNLP?: boolean;
  includeVision?: boolean;
  includeKnowledgeGraph?: boolean;
  requireVerification?: boolean;
  maxLatency?: number;
  confidenceThreshold?: number;
}

export interface MultiModalResponse {
  id: string;
  query: MultiModalQuery;
  results: ModalityResult[];
  synthesis: SynthesizedResponse;
  confidence: number;
  processingTime: number;
  metadata: ResponseMetadata;
  createdAt: string;
}

export interface ModalityResult {
  modality: 'nlp' | 'vision' | 'knowledge_graph';
  result: any;
  confidence: number;
  latency: number;
  source: string;
}

export interface SynthesizedResponse {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  entities: ExtractedEntityInfo[];
  relationships: RelationshipInfo[];
  nextSteps: NextStep[];
  confidence: number;
}

export interface ExtractedEntityInfo {
  id?: string;
  name: string;
  type: string;
  source: string;
  confidence: number;
  properties?: Record<string, any>;
}

export interface RelationshipInfo {
  source: string;
  target: string;
  type: string;
  strength: number;
  origin: 'knowledge_graph' | 'inferred' | 'nlp' | 'vision';
}

export interface NextStep {
  action: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  type: 'query' | 'visualization' | 'action' | 'escalation';
}

export interface ResponseMetadata {
  modalitiesUsed: string[];
  partialFailures: string[];
  cacheHit: boolean;
  modelVersions: Record<string, string>;
  tokensUsed?: { prompt: number; completion: number };
}

export interface UnifiedSearchResult {
  query: string;
  textResults: NLPAnalysisResult[];
  imageResults: VisionAnalysisResult[];
  graphEntities: Entity[];
  graphRelationships: Relationship[];
  synthesized: SynthesizedResponse;
  totalConfidence: number;
}

// ============================================================================
// Multi-Modal Orchestration Service Class
// ============================================================================

export class MultiModalOrchestrationService {
  private nlpService: ReturnType<typeof getEnhancedNLPService>;
  private visionService: ReturnType<typeof getVisionService>;
  private kgService: KnowledgeGraphService;
  private telemetry: TelemetryService;
  private cache: Map<string, { response: MultiModalResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(config?: AIConfiguration) {
    this.telemetry = new TelemetryService({
      serviceName: 'multimodal-orchestration-service',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      enableConsole: true,
      enableFile: false,
      enableExternal: false,
      samplingRate: 1,
      correlationIdHeader: 'X-Correlation-ID',
      piiFilterPatterns: []
    });

    this.nlpService = getEnhancedNLPService(config);
    this.visionService = getVisionService(config);
    this.kgService = getKnowledgeGraphService();
  }

  /**
   * Process a multi-modal query
   */
  async processQuery(query: MultiModalQuery): Promise<MultiModalResponse> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      this.telemetry.info('Processing multi-modal query', { 
        correlationId, 
        hasText: !!query.text,
        imageCount: query.imageUrls?.length || 0
      });

      const options = query.options || {};
      const results: ModalityResult[] = [];
      const partialFailures: string[] = [];

      // Process text with NLP if provided
      if (query.text && options.includeNLP !== false) {
        try {
          const nlpStartTime = Date.now();
          const nlpResult = await this.processText(query.text, query.context);
          
          results.push({
            modality: 'nlp',
            result: nlpResult,
            confidence: nlpResult.confidence || 0.9,
            latency: Date.now() - nlpStartTime,
            source: 'enhancedNLPService'
          });
        } catch (error) {
          partialFailures.push('nlp');
          this.telemetry.warn('NLP processing failed', { error: (error as Error).message });
        }
      }

      // Process images with Vision if provided
      if (query.imageUrls && query.imageUrls.length > 0 && options.includeVision !== false) {
        try {
          const visionStartTime = Date.now();
          const visionResults = await this.processImages(query.imageUrls, query.context);
          
          results.push({
            modality: 'vision',
            result: visionResults,
            confidence: this.calculateVisionConfidence(visionResults),
            latency: Date.now() - visionStartTime,
            source: 'visionService'
          });
        } catch (error) {
          partialFailures.push('vision');
          this.telemetry.warn('Vision processing failed', { error: (error as Error).message });
        }
      }

      // Query Knowledge Graph if context entities provided
      if (query.context?.entities && options.includeKnowledgeGraph !== false) {
        try {
          const kgStartTime = Date.now();
          const kgResult = await this.queryKnowledgeGraph(query.context.entities);
          
          results.push({
            modality: 'knowledge_graph',
            result: kgResult,
            confidence: 0.85,
            latency: Date.now() - kgStartTime,
            source: 'knowledgeGraphService'
          });
        } catch (error) {
          partialFailures.push('knowledge_graph');
          this.telemetry.warn('Knowledge Graph query failed', { error: (error as Error).message });
        }
      }

      // Synthesize results
      const synthesis = await this.synthesizeResults(query, results);
      
      const overallConfidence = this.calculateOverallConfidence(results);

      const response: MultiModalResponse = {
        id: correlationId,
        query,
        results,
        synthesis,
        confidence: overallConfidence,
        processingTime: Date.now() - startTime,
        metadata: {
          modalitiesUsed: results.map(r => r.modality),
          partialFailures,
          cacheHit: false,
          modelVersions: {
            nlp: 'gpt-4-turbo',
            vision: 'gpt-4-vision',
            kg: '1.0.0'
          }
        },
        createdAt: new Date().toISOString()
      };

      this.telemetry.info('Multi-modal query completed', { 
        correlationId, 
        processingTime: response.processingTime,
        confidence: overallConfidence,
        modalitiesUsed: response.metadata.modalitiesUsed.length
      });

      return response;
    } catch (error) {
      this.telemetry.error('Multi-modal query failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Analyze image and extract text (multimodal)
   */
  async analyzeImageWithText(imageUrl: string, question?: string): Promise<VisionAnalysisResult & { nlpAnalysis?: any }> {
    const correlationId = uuidv4();

    try {
      // Run vision and NLP in parallel
      const [visionResult, nlpResult] = await Promise.all([
        this.visionService.analyzeImage(imageUrl, { 
          analyzeLandCover: true,
          assessDamage: true 
        }),
        this.nlpService.analyzeText(question || 'Describe what you see in this image')
      ]);

      return {
        ...visionResult,
        nlpAnalysis: nlpResult
      };
    } catch (error) {
      this.telemetry.error('Image-text analysis failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Compare images with text context
   */
  async compareImagesWithContext(
    imageUrls: string[],
    context: string
  ): Promise<{
    comparison: any;
    insights: string[];
    recommendations: string[];
  }> {
    const correlationId = uuidv4();

    try {
      // Analyze all images in parallel
      const imageResults = await Promise.all(
        imageUrls.map(url => this.visionService.analyzeImage(url))
      );

      // Get NLP context analysis
      const contextAnalysis = await this.nlpService.analyzeText(context);

      // Compare using NLP
      const comparisonPrompt = `Compare these ${imageResults.length} images based on the context provided.
      
Context: ${context}

Image descriptions:
${imageResults.map((r, i) => `Image ${i + 1}: ${r.scene.description}`).join('\n')}

Provide:
1. Key differences
2. Common patterns
3. Changes or developments
4. Actionable insights`;

      const comparison = await this.nlpService.analyzeText(comparisonPrompt);

      return {
        comparison,
        insights: comparison.keywords?.keywords?.slice(0, 5).map((k: any) => k.keyword) || [],
        recommendations: contextAnalysis.sentiment?.label === 'negative' 
          ? ['Immediate attention required', 'Risk mitigation recommended']
          : ['Continue monitoring', 'Standard procedures apply']
      };
    } catch (error) {
      this.telemetry.error('Image comparison failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Entity extraction and knowledge graph enrichment
   */
  async extractEntitiesAndEnrich(
    text: string,
    imageUrls?: string[]
  ): Promise<{
    entities: ExtractedEntityInfo[];
    relationships: RelationshipInfo[];
    graphUpdates: { entities: any[]; relationships: any[] };
  }> {
    const correlationId = uuidv4();

    try {
      // Extract entities from text
      const nlpResult = await this.nlpService.extractEntities(text);
      
      // Extract entities from images
      let imageEntities: ExtractedEntityInfo[] = [];
      if (imageUrls && imageUrls.length > 0) {
        const imageResults = await Promise.all(
          imageUrls.map(url => this.visionService.analyzeImage(url))
        );
        
        imageEntities = imageResults.flatMap(r => 
          r.objects.map(obj => ({
            id: uuidv4(),
            name: obj.label,
            type: 'DETECTED_OBJECT',
            source: 'vision',
            confidence: obj.confidence,
            properties: obj.attributes
          }))
        );
      }

      // Merge entities
      const allEntities = [
        ...nlpResult.map(e => ({
          id: e.id,
          name: e.text,
          type: e.type,
          source: 'nlp',
          confidence: e.confidence,
          properties: e.metadata
        })),
        ...imageEntities
      ];

      // Query knowledge graph for related entities
      const entityNames = allEntities.slice(0, 5).map(e => e.name);
      const kgEntities = await this.queryKnowledgeGraph(entityNames);

      // Generate inferred relationships
      const relationships = this.generateRelationships(allEntities, kgEntities);

      // Prepare graph updates
      const graphUpdates = {
        entities: allEntities.map(e => ({
          type: e.type,
          name: e.name,
          properties: { ...e.properties, source: e.source, confidence: e.confidence },
          confidence: e.confidence
        })),
        relationships: relationships.map(r => ({
          sourceName: r.source,
          targetName: r.target,
          type: r.type,
          properties: { strength: r.strength }
        }))
      };

      return { entities: allEntities, relationships, graphUpdates };
    } catch (error) {
      this.telemetry.error('Entity enrichment failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Humanitarian situation assessment
   */
  async assessSituation(
    reports: { text: string; imageUrl?: string }[]
  ): Promise<{
    overallAssessment: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    keyIssues: string[];
    affectedGroups: string[];
    recommendations: NextStep[];
    resourceNeeds: string[];
  }> {
    const correlationId = uuidv4();

    try {
      // Process all reports in parallel
      const reportAnalyses = await Promise.all(
        reports.map(async (report) => {
          const [textAnalysis, visionAnalysis] = await Promise.all([
            this.nlpService.analyzeText(report.text),
            report.imageUrl 
              ? this.visionService.assessSafety(report.imageUrl)
              : null
          ]);

          return { text: textAnalysis, vision: visionAnalysis };
        })
      );

      // Synthesize assessments
      const synthesisPrompt = `Synthesize these humanitarian situation reports into a comprehensive assessment.
      
Reports analyzed: ${reports.length}

Report summaries:
${reportAnalyses.map((a, i) => `Report ${i + 1}: ${a.text.summary?.text || 'No summary'}`).join('\n')}

Urgency levels: ${reportAnalyses.map(a => a.text.urgency?.level || 'unknown').join(', ')}

Provide JSON:
{
  "overallAssessment": "comprehensive situation summary",
  "urgency": "low|medium|high|critical",
  "keyIssues": ["issue 1", "issue 2"],
  "affectedGroups": ["group 1", "group 2"],
  "recommendations": [{"action": "action", "priority": "high|medium|low", "type": "query|visualization|action|escalation"}],
  "resourceNeeds": ["need 1", "need 2"]
}`;

      const assessment = await this.nlpService.analyzeText(synthesisPrompt);
      
      // Parse the response
      const parsed = this.parseAssessment(assessment);

      return {
        overallAssessment: parsed.overallAssessment || 'Assessment completed',
        urgency: parsed.urgency || 'medium',
        keyIssues: parsed.keyIssues || [],
        affectedGroups: parsed.affectedGroups || [],
        recommendations: parsed.recommendations || [],
        resourceNeeds: parsed.resourceNeeds || []
      };
    } catch (error) {
      this.telemetry.error('Situation assessment failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Generate comprehensive report from multi-modal data
   */
  async generateReport(
    title: string,
    data: { text?: string; images?: string[]; metrics?: Record<string, number> }
  ): Promise<{
    report: string;
    sections: string[];
    visualizations: string[];
    confidence: number;
  }> {
    const correlationId = uuidv4();

    try {
      // Process inputs
      const [nlpAnalysis, visionResults] = await Promise.all([
        data.text ? this.nlpService.analyzeText(data.text) : null,
        data.images?.length 
          ? Promise.all(data.images.map(url => this.visionService.analyzeImage(url)))
          : []
      ]);

      // Generate report using NLP
      const reportPrompt = `Generate a comprehensive report based on the following data.
      
Title: ${title}

Text Analysis Summary: ${nlpAnalysis?.summary?.text || 'No text data'}

Key Findings: ${nlpAnalysis?.keywords?.keywords?.slice(0, 10).map((k: any) => k.keyword).join(', ') || 'None'}

Sentiment: ${nlpAnalysis?.sentiment?.label || 'Unknown'}
Urgency: ${nlpAnalysis?.urgency?.level || 'Unknown'}

Vision Analysis: ${visionResults?.length || 0} images analyzed
${visionResults?.map((r, i) => `Image ${i + 1}: ${r.classification.primaryLabel}`).join('\n') || ''}

Metrics: ${JSON.stringify(data.metrics || {})}

Generate a well-structured report with sections.`;

      const report = await this.nlpService.analyzeText(reportPrompt);
      
      const sections = report.summary?.keyPoints || ['Executive Summary', 'Analysis', 'Conclusions'];
      const visualizations = visionResults?.map(r => r.imageUrl) || [];

      return {
        report: report.summary?.text || 'Report generated',
        sections,
        visualizations,
        confidence: nlpAnalysis?.confidence || 0.8
      };
    } catch (error) {
      this.telemetry.error('Report generation failed', error as Error, { correlationId });
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async processText(text: string, context?: QueryContext): Promise<any> {
    const options: NLPAnalysisOptions = {
      includeEmotions: true,
      includeUrgency: true
    };

    return this.nlpService.analyzeText(text, options);
  }

  private async processImages(imageUrls: string[], context?: QueryContext): Promise<VisionAnalysisResult[]> {
    const options: VisionAnalysisOptions = {
      analyzeLandCover: true,
      analyzeVegetation: true,
      assessDamage: true
    };

    return Promise.all(imageUrls.map(url => this.visionService.analyzeImage(url, options)));
  }

  private async queryKnowledgeGraph(entityNames: string[]): Promise<{
    entities: Entity[];
    relationships: Relationship[];
  }> {
    const results = entityNames.map(name => 
      this.kgService.search(this.getDefaultGraphId(), {
        query: name,
        limit: 3
      })
    );

    const allEntities = results.flatMap(r => r.entities);
    const allRelationships = allEntities.flatMap(e => 
      this.kgService.getEntityRelationships(this.getDefaultGraphId(), e.id)
    );

    return { entities: allEntities, relationships: allRelationships };
  }

  private async synthesizeResults(query: MultiModalQuery, results: ModalityResult[]): Promise<SynthesizedResponse> {
    const synthesisPrompt = `Synthesize results from multiple AI modalities into a unified response.
    
Query: ${query.text || 'Image analysis query'}
Modalities processed: ${results.map(r => r.modality).join(', ')}

Results summary:
${results.map(r => {
  if (r.modality === 'nlp') return `NLP: ${JSON.stringify(r.result.summary || r.result)}`;
  if (r.modality === 'vision') return `Vision: ${r.result.classification?.primaryLabel || 'Analysis'}`;
  return `KG: ${r.result.entities?.length || 0} entities`;
}).join('\n')}

Provide JSON:
{
  "summary": "concise summary of findings",
  "keyFindings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1"],
  "entities": [{"name": "entity", "type": "type"}],
  "relationships": [{"source": "s", "target": "t", "type": "type"}],
  "nextSteps": [{"action": "action", "priority": "medium", "type": "query"}],
  "confidence": 0.0-1.0
}`;

    try {
      const synthesis = await this.nlpService.analyzeText(synthesisPrompt);
      
      return {
        summary: synthesis.summary?.text || 'Analysis completed',
        keyFindings: synthesis.keywords?.keywords?.slice(0, 5).map((k: any) => k.keyword) || [],
        recommendations: [synthesis.sentiment?.label === 'negative' ? 'Immediate review needed' : 'Continue monitoring'],
        entities: [],
        relationships: [],
        nextSteps: [{ action: 'Review analysis', description: 'Review the detailed results', priority: 'medium', type: 'query' }],
        confidence: 0.8
      };
    } catch {
      return {
        summary: 'Multi-modal analysis completed',
        keyFindings: [],
        recommendations: ['Manual review recommended'],
        entities: [],
        relationships: [],
        nextSteps: [],
        confidence: 0.7
      };
    }
  }

  private calculateVisionConfidence(results: VisionAnalysisResult[]): number {
    if (results.length === 0) return 0;
    const confidences = results.map(r => r.classification.confidence);
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  private calculateOverallConfidence(results: ModalityResult[]): number {
    if (results.length === 0) return 0;
    const weights = { nlp: 0.4, vision: 0.4, knowledge_graph: 0.2 };
    let totalWeight = 0;
    let weightedSum = 0;

    results.forEach(r => {
      const weight = weights[r.modality] || 0.2;
      weightedSum += r.confidence * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private generateRelationships(
    entities: ExtractedEntityInfo[],
    kgResult: { entities: Entity[]; relationships: Relationship[] }
  ): RelationshipInfo[] {
    const relationships: RelationshipInfo[] = [];

    // Match extracted entities with knowledge graph entities
    const entityMap = new Map(entities.map(e => [e.name.toLowerCase(), e]));
    
    kgResult.relationships.forEach(r => {
      const source = entityMap.get(r.sourceId.toLowerCase());
      const target = entityMap.get(r.targetId.toLowerCase());
      
      if (source && target) {
        relationships.push({
          source: source.name,
          target: target.name,
          type: r.type,
          strength: r.confidence,
          source: 'knowledge_graph'
        });
      }
    });

    // Generate inferred relationships
    for (let i = 0; i < Math.min(entities.length, 5); i++) {
      for (let j = i + 1; j < Math.min(entities.length, 5); j++) {
        if (entities[i].type !== entities[j].type) {
          relationships.push({
            source: entities[i].name,
            target: entities[j].name,
            type: 'RELATED_TO',
            strength: 0.6,
            origin: 'inferred'
          });
        }
      }
    }

    return relationships;
  }

  private parseAssessment(analysis: any): any {
    try {
      const text = analysis.summary?.text || JSON.stringify(analysis);
      // Simple parsing - in production, use structured prompting
      return {
        overallAssessment: text.substring(0, 200),
        urgency: analysis.urgency?.level || 'medium',
        keyIssues: analysis.keywords?.keywords?.slice(0, 3).map((k: any) => k.keyword) || [],
        affectedGroups: [],
        recommendations: [{ action: 'Review', priority: 'medium', type: 'query' as const }],
        resourceNeeds: []
      };
    } catch {
      return {
        overallAssessment: 'Assessment completed',
        urgency: 'medium' as const,
        keyIssues: [],
        affectedGroups: [],
        recommendations: [],
        resourceNeeds: []
      };
    }
  }

  private getDefaultGraphId(): string {
    // Return the first available graph or create one
    const graphs = this.kgService.getAllGraphs();
    if (graphs.length > 0) {
      return graphs[0].id;
    }
    
    // Create a default graph
    const graph = this.kgService.createGraph('Default Graph', 'Default knowledge graph for multi-modal queries');
    return graph.id;
  }
}

// ============================================================================
// Service Factory
// ============================================================================

let orchestrationServiceInstance: MultiModalOrchestrationService | null = null;

export function getMultiModalOrchestrationService(config?: AIConfiguration): MultiModalOrchestrationService {
  if (!orchestrationServiceInstance) {
    orchestrationServiceInstance = new MultiModalOrchestrationService(config);
  }
  return orchestrationServiceInstance;
}

export function resetOrchestrationService(): void {
  orchestrationServiceInstance = null;
}

// ============================================================================
// Export all AI services
// ============================================================================

export {
  getEnhancedNLPService,
  resetNLPService,
  NLPAnalysisOptions,
  NLPAnalysisResult,
  ExtractedEntity,
  SentimentResult,
  SummaryResult,
  ClassificationResult
} from './enhancedNLPService';

export {
  getVisionService,
  resetVisionService,
  VisionAnalysisOptions,
  VisionAnalysisResult,
  ImageClassification,
  DetectedObject,
  LandCoverClassification,
  VegetationIndex,
  DamageAssessment
} from './visionService';

export {
  getKnowledgeGraphService,
  resetKnowledgeGraphService,
  KnowledgeGraph,
  Entity,
  Relationship,
  EntityType,
  RelationshipType,
  SearchQuery,
  SearchResult
} from './knowledgeGraphService';
