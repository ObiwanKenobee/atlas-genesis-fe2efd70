/**
 * Enhanced NLP Service
 * Transformer-based Natural Language Processing for Atlas Humanitarian
 * 
 * Capabilities:
 * - Named Entity Recognition (NER)
 * - Sentiment Analysis with emotions
 * - Text Summarization (extractive & abstractive)
 * - Question Answering
 * - Text Classification
 * - Language Detection & Translation
 * - Keyword Extraction
 * - Text Embeddings
 */

import {
  ChatRequest,
  ChatResponse,
  EmbedRequest,
  EmbedResponse,
  AIConfiguration,
  AICapability,
  AIError,
  AIErrorCode
} from './types';
import { AIService, AIServiceFactory } from './aiService';
import { TelemetryService } from './observability/telemetry';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions
// ============================================================================

export interface NLPAnalysisResult {
  id: string;
  text: string;
  entities: ExtractedEntity[];
  sentiment: SentimentResult;
  summary: SummaryResult;
  classification: ClassificationResult;
  language: LanguageResult;
  keywords: KeywordResult;
  urgency: UrgencyResult;
  embeddings: number[];
  createdAt: string;
  processingTime: number;
}

export interface ExtractedEntity {
  id: string;
  text: string;
  type: EntityType;
  confidence: number;
  startPosition: number;
  endPosition: number;
  metadata?: EntityMetadata;
}

export type EntityType = 
  | 'PERSON' 
  | 'ORGANIZATION' 
  | 'LOCATION' 
  | 'DATE' 
  | 'MONEY' 
  | 'PROJECT'
  | 'TECHNOLOGY'
  | 'EVENT'
  | 'PHONE'
  | 'EMAIL'
  | 'URL'
  | 'QUANTITY';

export interface EntityMetadata {
  surfaceForm?: string;
  linkedUrl?: string;
  description?: string;
  normalizedValue?: string;
}

export interface SentimentResult {
  overall: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: EmotionScores;
  aspects?: AspectSentiment[];
}

export interface EmotionScores {
  joy: number;
  trust: number;
  fear: number;
  surprise: number;
  sadness: number;
  disgust: number;
  anger: number;
  anticipation: number;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: number;
  confidence: number;
  context?: string;
}

export interface SummaryResult {
  text: string;
  type: 'extractive' | 'abstractive';
  confidence: number;
  keyPoints: string[];
  wordCount: number;
  compressionRatio: number;
}

export interface ClassificationResult {
  primaryCategory: string;
  categories: CategoryScore[];
  confidence: number;
  taxonomyPath: string[];
}

export interface CategoryScore {
  category: string;
  score: number;
}

export interface LanguageResult {
  code: string;
  name: string;
  confidence: number;
  isTranslated: boolean;
  originalLanguage?: string;
}

export interface KeywordResult {
  keywords: KeywordScore[];
  nounPhrases: string[];
  entities: string[];
}

export interface KeywordScore {
  keyword: string;
  score: number;
  relevance: number;
}

export interface UrgencyResult {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: UrgencyIndicator[];
  reasoning: string;
}

export interface UrgencyIndicator {
  type: string;
  value: string;
  impact: number;
}

export interface QuestionAnsweringResult {
  question: string;
  answer: string;
  confidence: number;
  context: string;
  supportingEvidence: Evidence[];
  followUpQuestions?: string[];
}

export interface Evidence {
  text: string;
  position: { start: number; end: number };
  relevanceScore: number;
}

export interface TextComparisonResult {
  similarity: number;
  semanticSimilarity: number;
  lexicalSimilarity: number;
  differences: TextDifference[];
  commonThemes: string[];
}

export interface TextDifference {
  type: 'addition' | 'deletion' | 'modification';
  segment1?: string;
  segment2?: string;
  position: { start: number; end: number };
}

// ============================================================================
// Enhanced NLP Service Class
// ============================================================================

export class EnhancedNLPService {
  private aiService: AIService;
  private telemetry: TelemetryService;
  private embeddingCache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor(config?: AIConfiguration) {
    this.telemetry = new TelemetryService({
      serviceName: 'enhanced-nlp-service',
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
   * Comprehensive NLP analysis combining multiple capabilities
   */
  async analyzeText(text: string, options?: NLPAnalysisOptions): Promise<NLPAnalysisResult> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      this.telemetry.info('Starting NLP analysis', { correlationId, textLength: text.length });

      // Run analyses in parallel for efficiency
      const [
        entities,
        sentiment,
        summary,
        classification,
        language,
        keywords,
        urgency,
        embeddings
      ] = await Promise.all([
        this.extractEntities(text),
        this.analyzeSentiment(text),
        this.summarizeText(text, options?.summaryLength),
        this.classifyText(text),
        this.detectLanguage(text),
        this.extractKeywords(text),
        this.assessUrgency(text),
        this.getEmbeddings(text)
      ]);

      const processingTime = Date.now() - startTime;

      const result: NLPAnalysisResult = {
        id: correlationId,
        text,
        entities,
        sentiment,
        summary,
        classification,
        language,
        keywords,
        urgency,
        embeddings,
        createdAt: new Date().toISOString(),
        processingTime
      };

      this.telemetry.info('NLP analysis completed', { 
        correlationId, 
        processingTime,
        entityCount: entities.length,
        sentimentLabel: sentiment.label
      });

      return result;
    } catch (error) {
      this.telemetry.error('NLP analysis failed', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Named Entity Recognition
   * Extracts entities using LLM-based extraction with structured prompting
   */
  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    const prompt = this.buildEntityExtractionPrompt(text);
    
    try {
      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `You are an expert Named Entity Recognition (NER) system. Extract entities from the given text with high precision.
            
Output format (JSON array only, no markdown):
[
  {
    "text": "entity text",
    "type": "PERSON|ORGANIZATION|LOCATION|DATE|MONEY|PROJECT|TECHNOLOGY|EVENT|PHONE|EMAIL|URL|QUANTITY",
    "confidence": 0.0-1.0,
    "startPosition": number,
    "endPosition": number,
    "metadata": {
      "description": "optional context"
    }
  }
]

Rules:
- Return empty array if no entities found
- Use PERSON for individuals
- Use ORGANIZATION for companies, NGOs, governments
- Use LOCATION for places, regions, countries
- Use DATE for temporal expressions
- Use MONEY for monetary values
- Use PROJECT for project names
- Use TECHNOLOGY for technical terms
- Use EVENT for events, conferences, incidents`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        correlationId: uuidv4()
      });

      const entities = this.parseEntityResponse(response.choices[0].message.content);
      return entities;
    } catch (error) {
      this.telemetry.warn('Entity extraction failed, returning empty', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Sentiment Analysis with emotion detection
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const prompt = `Analyze the sentiment and emotions in this text. Return a JSON object:

{
  "overall": -1.0 to 1.0,
  "label": "positive|negative|neutral|mixed",
  "confidence": 0.0-1.0,
  "emotions": {
    "joy": 0.0-1.0,
    "trust": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0,
    "sadness": 0.0-1.0,
    "disgust": 0.0-1.0,
    "anger": 0.0-1.0,
    "anticipation": 0.0-1.0
  },
  "aspects": [
    {
      "aspect": "specific topic",
      "sentiment": -1.0 to 1.0,
      "confidence": 0.0-1.0,
      "context": "relevant text"
    }
  ]
}

Text: ${text}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      const result = this.parseJSONResponse<SentimentResult>(response.choices[0].message.content);
      
      // Ensure all emotion scores exist
      result.emotions = {
        joy: 0, trust: 0, fear: 0, surprise: 0,
        sadness: 0, disgust: 0, anger: 0, anticipation: 0,
        ...result.emotions
      };

      return result;
    } catch (error) {
      this.telemetry.warn('Sentiment analysis failed', { error: (error as Error).message });
      return {
        overall: 0,
        label: 'neutral',
        confidence: 0,
        emotions: { joy: 0, trust: 0, fear: 0, surprise: 0, sadness: 0, disgust: 0, anger: 0, anticipation: 0 }
      };
    }
  }

  /**
   * Text Summarization
   */
  async summarizeText(text: string, maxLength?: number): Promise<SummaryResult> {
    const targetLength = maxLength || Math.ceil(text.length * 0.3);
    const type: 'extractive' | 'abstractive' = text.length > 1000 ? 'abstractive' : 'extractive';

    const prompt = `Summarize the following text. 

Target length: ~${targetLength} words
Type: ${type}

${type === 'extractive' 
  ? 'Extract the most important sentences verbatim.' 
  : 'Generate a concise summary that captures the key points in your own words.'}

Also provide:
- 3-5 key points as a JSON array
- The compression ratio (summary/original word count)

Text:
${text}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        correlationId: uuidv4()
      });

      const content = response.choices[0].message.content;
      const lines = content.split('\n');
      
      const summaryText = lines[0]?.replace(/^(Summary|Abstract):?\s*/i, '') || content;
      const keyPointsMatch = content.match(/key points?[:\s]*([\s\S]*?)(?:\n\n|$)/i);
      const keyPoints = keyPointsMatch 
        ? this.parseJSONArray<string>(keyPointsMatch[1])
        : [];

      const summaryWordCount = summaryText.split(/\s+/).length;
      const originalWordCount = text.split(/\s+/).length;

      return {
        text: summaryText,
        type,
        confidence: 0.85,
        keyPoints,
        wordCount: summaryWordCount,
        compressionRatio: summaryWordCount / originalWordCount
      };
    } catch (error) {
      this.telemetry.warn('Summarization failed', { error: (error as Error).message });
      return {
        text: text.substring(0, targetLength * 5),
        type: 'extractive',
        confidence: 0,
        keyPoints: [],
        wordCount: targetLength,
        compressionRatio: 0.3
      };
    }
  }

  /**
   * Text Classification
   */
  async classifyText(text: string, taxonomy?: string[]): Promise<ClassificationResult> {
    const taxonomyPath = taxonomy || [
      'Humanitarian',
      'Emergency Response',
      'Healthcare',
      'Infrastructure',
      'Education',
      'Environment',
      'Governance',
      'Economy'
    ];

    const prompt = `Classify this text according to the following taxonomy.
Return a JSON object:
{
  "primaryCategory": "most relevant category",
  "categories": [{"category": "path.to.category", "score": 0.0-1.0}],
  "confidence": overall confidence,
  "taxonomyPath": ["level1", "level2", ...]
}

Taxonomy: ${taxonomyPath.join(' > ')}

Text:
${text}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<ClassificationResult>(response.choices[0].message.content);
    } catch (error) {
      this.telemetry.warn('Classification failed', { error: (error as Error).message });
      return {
        primaryCategory: 'Unclassified',
        categories: [],
        confidence: 0,
        taxonomyPath: []
      };
    }
  }

  /**
   * Language Detection
   */
  async detectLanguage(text: string): Promise<LanguageResult> {
    const prompt = `Detect the language of this text. Return JSON:
{
  "code": "ISO 639-1 code (e.g., en, es, fr)",
  "name": "Full language name",
  "confidence": 0.0-1.0
}

Text: ${text.substring(0, 500)}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<LanguageResult>(response.choices[0].message.content);
    } catch (error) {
      return { code: 'unknown', name: 'Unknown', confidence: 0 };
    }
  }

  /**
   * Keyword Extraction
   */
  async extractKeywords(text: string): Promise<KeywordResult> {
    const prompt = `Extract keywords, noun phrases, and entities from this text. Return JSON:
{
  "keywords": [{"keyword": "term", "score": 0.0-1.0, "relevance": 0.0-1.0}],
  "nounPhrases": ["phrase 1", "phrase 2"],
  "entities": ["entity 1", "entity 2"]
}

Prioritize humanitarian, environmental, and development terms.
Text: ${text}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<KeywordResult>(response.choices[0].message.content);
    } catch (error) {
      return { keywords: [], nounPhrases: [], entities: [] };
    }
  }

  /**
   * Urgency Assessment for humanitarian contexts
   */
  async assessUrgency(text: string): Promise<UrgencyResult> {
    const prompt = `Assess the urgency level of this humanitarian-related text. Return JSON:
{
  "level": "low|medium|high|critical",
  "score": 0.0-1.0,
  "indicators": [
    {"type": "temporal|immediate|implied", "value": "specific indicator", "impact": 0.0-1.0}
  ],
  "reasoning": "brief explanation"
}

Look for:
- Immediate needs (food, water, shelter, medical)
- Time-sensitive situations
- Escalating conditions
- Vulnerable populations
- Emergency keywords

Text: ${text}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<UrgencyResult>(response.choices[0].message.content);
    } catch (error) {
      return { level: 'medium', score: 0.5, indicators: [], reasoning: 'Assessment unavailable' };
    }
  }

  /**
   * Question Answering with context
   */
  async answerQuestion(question: string, context: string): Promise<QuestionAnsweringResult> {
    const prompt = `Answer the question based on the provided context. Return JSON:
{
  "answer": "your answer",
  "confidence": 0.0-1.0,
  "context": "relevant excerpt from source",
  "supportingEvidence": [
    {
      "text": "quote",
      "position": {"start": number, "end": number},
      "relevanceScore": 0.0-1.0
    }
  ],
  "followUpQuestions": ["question 1", "question 2"]
}

Rules:
- If the answer isn't in the context, say "I cannot answer based on the provided context"
- Provide citations for your claims
- Suggest relevant follow-up questions

Context:
${context}

Question: ${question}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<QuestionAnsweringResult>(response.choices[0].message.content);
    } catch (error) {
      return {
        question,
        answer: 'Unable to process question',
        confidence: 0,
        context: '',
        supportingEvidence: []
      };
    }
  }

  /**
   * Text Comparison
   */
  async compareTexts(text1: string, text2: string): Promise<TextComparisonResult> {
    const prompt = `Compare these two texts. Return JSON:
{
  "similarity": 0.0-1.0 (overall similarity),
  "semanticSimilarity": 0.0-1.0 (meaning-based),
  "lexicalSimilarity": 0.0-1.0 (word-based),
  "differences": [
    {
      "type": "addition|deletion|modification",
      "segment1": "text from first document (null if addition)",
      "segment2": "text from second document (null if deletion)",
      "position": {"start": number, "end": number}
    }
  ],
  "commonThemes": ["theme 1", "theme 2"]
}

Text 1: ${text1.substring(0, 2000)}
Text 2: ${text2.substring(0, 2000)}`;

    try {
      const response = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        correlationId: uuidv4()
      });

      return this.parseJSONResponse<TextComparisonResult>(response.choices[0].message.content);
    } catch (error) {
      return {
        similarity: 0,
        semanticSimilarity: 0,
        lexicalSimilarity: 0,
        differences: [],
        commonThemes: []
      };
    }
  }

  /**
   * Get Text Embeddings with caching
   */
  async getEmbeddings(text: string): Promise<number[]> {
    // Check cache
    const cacheKey = text.substring(0, 100);
    const cached = this.embeddingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.embedding;
    }

    try {
      const response = await this.aiService.embed({
        input: text,
        provider: 'openai',
        correlationId: uuidv4()
      });

      const embedding = response.data[0].embedding;
      
      // Cache the result
      this.embeddingCache.set(cacheKey, { embedding, timestamp: Date.now() });
      
      return embedding;
    } catch (error) {
      this.telemetry.warn('Embedding generation failed', { error: (error as Error).message });
      return [];
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildEntityExtractionPrompt(text: string): string {
    return `Extract named entities from the following text. Be thorough and accurate.

Text: ${text}`;
  }

  private parseEntityResponse(content: string): ExtractedEntity[] {
    try {
      // Try direct JSON parsing
      const entities = this.parseJSONArray<any>(content);
      
      return entities.map((e: any, index: number) => ({
        id: uuidv4(),
        text: e.text || '',
        type: e.type || 'PERSON',
        confidence: e.confidence || 0.8,
        startPosition: e.startPosition || 0,
        endPosition: e.endPosition || 0,
        metadata: e.metadata
      }));
    } catch {
      this.telemetry.warn('Failed to parse entity response', { content });
      return [];
    }
  }

  private parseJSONResponse<T>(content: string): T {
    // Remove markdown code blocks
    const cleaned = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from response
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          throw new Error('Failed to parse JSON response');
        }
      }
      throw new Error('Failed to parse JSON response');
    }
  }

  private parseJSONArray<T>(content: string): T[] {
    try {
      const cleaned = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return [];
    } catch {
      return [];
    }
  }
}

// ============================================================================
// Options Interface
// ============================================================================

export interface NLPAnalysisOptions {
  summaryLength?: number;
  entityTypes?: EntityType[];
  includeEmotions?: boolean;
  includeUrgency?: boolean;
  taxonomy?: string[];
}

// ============================================================================
// Service Factory
// ============================================================================

let nlpServiceInstance: EnhancedNLPService | null = null;

export function getEnhancedNLPService(config?: AIConfiguration): EnhancedNLPService {
  if (!nlpServiceInstance) {
    nlpServiceInstance = new EnhancedNLPService(config);
  }
  return nlpServiceInstance;
}

export function resetNLPService(): void {
  nlpServiceInstance = null;
}
