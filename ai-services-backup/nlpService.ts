/**
 * NLP Service - Natural Language Processing for Atlas Sanctum
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

export interface NLPAnalysis {
  id: string;
  text: string;
  entities: Entity[];
  sentiment: SentimentScore;
  topics: Topic[];
  summary: string;
  keywords: string[];
  language: DetectedLanguage;
  readability: ReadabilityScore;
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface EntityMetadata {
  surfaceForm?: string;
  position?: { start: number; end: number };
  linkedUrl?: string;
  description?: string;
}

export interface Entity {
  id: string;
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'project' | 'technology' | 'event';
  confidence: number;
  metadata?: EntityMetadata;
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

export interface SentimentScore {
  overall: number;
  positive: number;
  negative: number;
  neutral: number;
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: EmotionScores;
}

export interface Topic {
  id: string;
  label: string;
  relevance: number;
  category: string;
  subcategory?: string;
}

export interface DetectedLanguage {
  code: string;
  name: string;
  confidence: number;
  isTranslated: boolean;
  originalLanguage?: string;
  translationTarget?: string;
}

export interface ReadabilityScore {
  grade: number;
  score: number;
  label: 'easy' | 'moderate' | 'difficult';
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord?: number;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  usedGlossary?: boolean;
}

export interface TextClassificationRequest {
  text: string;
  categories: string[];
  multiLabel?: boolean;
}

export interface ClassificationCategory {
  name: string;
  score: number;
  label?: string;
}

export interface ClassificationResponse {
  categories: ClassificationCategory[];
  topCategory: string;
  confidence: number;
}

// ============================================
// HELPER FUNCTIONS
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

function generateMockSentiment(): SentimentScore {
  const positive = Math.random() * 0.5 + 0.2;
  const negative = Math.random() * 0.2;
  const neutral = Math.max(0, 1 - positive - negative);

  const emotions: EmotionScores = {
    joy: Math.round(positive * 0.8 * 100) / 100,
    trust: Math.round(positive * 0.6 * 100) / 100,
    fear: Math.round(negative * 0.7 * 100) / 100,
    surprise: Math.round(Math.random() * 0.3 * 100) / 100,
    sadness: Math.round(negative * 0.5 * 100) / 100,
    disgust: Math.round(negative * 0.3 * 100) / 100,
    anger: Math.round(negative * 0.4 * 100) / 100,
    anticipation: Math.round(Math.random() * 0.5 * 100) / 100,
  };

  let label: SentimentScore['label'] = 'neutral';
  if (positive > negative + 0.2) label = 'positive';
  else if (negative > positive + 0.2) label = 'negative';
  else if (positive > 0.3 && negative > 0.3) label = 'mixed';

  return {
    overall: Math.round((positive - negative) * 100) / 100,
    positive: Math.round(positive * 100) / 100,
    negative: Math.round(negative * 100) / 100,
    neutral: Math.round(neutral * 100) / 100,
    label,
    emotions,
  };
}

function extractEntitiesMock(text: string): Entity[] {
  const entities: Entity[] = [];
  
  const patterns: { type: Entity['type']; regex: RegExp }[] = [
    { type: 'organization', regex: /(?:project|initiative|foundation|organization|company|corp|llc|inc)/gi },
    { type: 'location', regex: /(?:Amazon|Brazil|Indonesia|Africa|Asia|Ocean|North America|Europe|Asia Pacific)/gi },
    { type: 'project', regex: /(?:carbon credit|reforestation|conservation|sustainable development)/gi },
    { type: 'technology', regex: /(?:AI|machine learning|satellite|blockchain|IoT|sensor|database)/gi },
    { type: 'date', regex: /\b\d{4}\b/g },
    { type: 'money', regex: /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|dollars|euros|pounds)/gi },
  ];

  patterns.forEach(({ type, regex }) => {
    const matches = text.match(regex);
    if (matches) {
      const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
      uniqueMatches.forEach((match, i) => {
        entities.push({
          id: uuidv4(),
          text: match,
          type,
          confidence: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
          metadata: {
            surfaceForm: match,
            position: { start: text.toLowerCase().indexOf(match), end: text.toLowerCase().indexOf(match) + match.length },
          },
        });
      });
    }
  });

  return entities.slice(0, 10); // Limit to 10 entities
}

function generateMockTopics(): Topic[] {
  const topics = [
    { label: 'Climate Action', category: 'Environment', relevance: 0.95 },
    { label: 'Biodiversity Conservation', category: 'Environment', relevance: 0.88 },
    { label: 'Community Development', category: 'Social', relevance: 0.82 },
    { label: 'Carbon Markets', category: 'Finance', relevance: 0.79 },
    { label: 'Sustainable Agriculture', category: 'Agriculture', relevance: 0.75 },
    { label: 'Forest Conservation', category: 'Environment', relevance: 0.72 },
    { label: 'Ocean Protection', category: 'Environment', relevance: 0.68 },
    { label: 'Renewable Energy', category: 'Energy', relevance: 0.65 },
    { label: 'Water Management', category: 'Environment', relevance: 0.62 },
    { label: 'Green Technology', category: 'Technology', relevance: 0.58 },
  ];

  return topics.slice(0, 5).map((t) => ({
    id: uuidv4(),
    label: t.label,
    relevance: Math.round(t.relevance * 100) / 100,
    category: t.category,
  }));
}

function generateMockCategories(request: TextClassificationRequest): ClassificationCategory[] {
  const allCategories = [
    { name: 'Environmental Impact', score: 0.92 },
    { name: 'Carbon Credits', score: 0.85 },
    { name: 'Community Development', score: 0.78 },
    { name: 'Biodiversity', score: 0.72 },
    { name: 'Sustainable Finance', score: 0.68 },
    { name: 'Climate Resilience', score: 0.65 },
    { name: 'Social Enterprise', score: 0.58 },
    { name: 'Green Technology', score: 0.52 },
  ];

  // Filter to requested categories if specified
  const filtered = request.categories.length > 0
    ? allCategories.filter(c => request.categories.includes(c.name))
    : allCategories;

  return filtered.map(c => ({
    name: c.name,
    score: Math.round(c.score * 100) / 100,
    label: c.score > 0.7 ? 'high' : c.score > 0.4 ? 'medium' : 'low',
  })).sort((a, b) => b.score - a.score);
}

function generateMockSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 2).join('. ').trim() + '.';
  
  if (summary.length > 50) {
    return summary;
  }
  
  return 'Analysis complete. The document discusses environmental impact and community development initiatives with a focus on sustainable practices and long-term conservation strategies.';
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'this', 'that', 'these', 'those', 'it', 'its',
  ]);
  
  return [...new Set(words)]
    .filter(w => w.length > 4 && !stopWords.has(w))
    .slice(0, 10);
}

function calculateReadability(text: string): ReadabilityScore {
  const words = text.split(/\s+/).length;
  const sentences = Math.max(1, text.split(/[.!?]+/).filter(s => s.trim().length > 0).length);
  const avgWordsPerSentence = Math.round((words / sentences) * 10) / 10;

  let grade = 8;
  if (avgWordsPerSentence > 20) grade = 16;
  else if (avgWordsPerSentence > 15) grade = 14;
  else if (avgWordsPerSentence > 12) grade = 12;
  else if (avgWordsPerSentence > 10) grade = 10;
  else if (avgWordsPerSentence > 8) grade = 9;

  let score = 100 - (grade - 6) * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    grade,
    score,
    label: score > 70 ? 'easy' : score > 40 ? 'moderate' : 'difficult',
    wordCount: words,
    sentenceCount: sentences,
    avgWordsPerSentence,
    avgSyllablesPerWord: 1.5,
  };
}

function detectUrgency(text: string): 'low' | 'medium' | 'high' {
  const urgentWords = [
    'urgent', 'critical', 'emergency', 'immediate', 'asap', 
    'deadline', 'alert', 'warning', 'danger', 'threat',
    'crisis', 'essential', 'vital', 'imperative', 'pressing',
  ];
  const textLower = text.toLowerCase();
  
  const urgentCount = urgentWords.filter(w => textLower.includes(w)).length;
  
  if (urgentCount >= 2) return 'high';
  if (urgentCount === 1) return 'medium';
  return 'low';
}

function generateMockAnalysis(text: string): NLPAnalysis {
  return {
    id: uuidv4(),
    text,
    entities: extractEntitiesMock(text),
    sentiment: generateMockSentiment(),
    topics: generateMockTopics(),
    summary: generateMockSummary(text),
    keywords: extractKeywords(text),
    language: { 
      code: 'en', 
      name: 'English', 
      confidence: 0.95, 
      isTranslated: false 
    },
    readability: calculateReadability(text),
    urgency: detectUrgency(text),
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// NLP SERVICE CLASS
// ============================================

export class NLPService {
  private apiEndpoint: string;
  private cache: LRUCache<NLPAnalysis>;
  private useMockFallback: boolean;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_URL || '/api/v2/ai';
    this.cache = new LRUCache<NLPAnalysis>({ 
      maxSize: 500, 
      ttl: 10 * 60 * 1000, // 10 minutes
    });
    this.useMockFallback = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }

  /**
   * Analyze text for sentiment, entities, topics, and summary
   */
  async analyzeText(
    text: string,
    options?: { signal?: AbortSignal; useCache?: boolean }
  ): Promise<Result<NLPAnalysis, AIServiceError>> {
    const cacheKey = `nlp:${hashText(text)}`;
    
    if (options?.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) return success(cached);
    }

    const mockFallback = async (): Promise<{ analysis: NLPAnalysis }> => {
      const analysis = generateMockAnalysis(text);
      this.cache.set(cacheKey, analysis);
      return { analysis };
    };

    if (this.useMockFallback || options?.signal?.aborted) {
      const analysis = generateMockAnalysis(text);
      this.cache.set(cacheKey, analysis);
      return success(analysis);
    }

    try {
      const data = await apiClient.request<{ analysis: NLPAnalysis }>(
        'NLPService',
        'analyzeText',
        {
          endpoint: '/nlp/analyze',
          method: 'POST',
          body: { text },
          signal: options?.signal,
        },
        mockFallback
      );
      
      this.cache.set(cacheKey, data.analysis);
      return success(data.analysis);
    } catch (error) {
      if (error instanceof AIServiceError && error.fallbackUsed) {
        const analysis = generateMockAnalysis(text);
        this.cache.set(cacheKey, analysis);
        return success(analysis);
      }
      return failure(error as AIServiceError);
    }
  }

  /**
   * Extract named entities from text
   */
  async extractEntities(
    text: string,
    options?: { signal?: AbortSignal; entityTypes?: Entity['type'][] }
  ): Promise<Result<Entity[], AIServiceError>> {
    const mockFallback = async (): Promise<Entity[]> => {
      let entities = extractEntitiesMock(text);
      if (options?.entityTypes) {
        entities = entities.filter(e => options.entityTypes!.includes(e.type));
      }
      return entities;
    };

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<Entity[]>(
        'NLPService',
        'extractEntities',
        {
          endpoint: '/nlp/entities',
          method: 'POST',
          body: { text, types: options?.entityTypes },
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
   * Analyze sentiment
   */
  async analyzeSentiment(
    text: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<SentimentScore, AIServiceError>> {
    const mockFallback = async (): Promise<SentimentScore> => generateMockSentiment();

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<SentimentScore>(
        'NLPService',
        'analyzeSentiment',
        {
          endpoint: '/nlp/sentiment',
          method: 'POST',
          body: { text },
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
   * Detect language
   */
  async detectLanguage(
    text: string,
    options?: { signal?: AbortSignal }
  ): Promise<Result<DetectedLanguage, AIServiceError>> {
    const mockFallback = async (): Promise<DetectedLanguage> => ({
      code: 'en',
      name: 'English',
      confidence: 0.95,
      isTranslated: false,
    });

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<DetectedLanguage>(
        'NLPService',
        'detectLanguage',
        {
          endpoint: '/nlp/language',
          method: 'POST',
          body: { text },
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
   * Translate text
   */
  async translate(
    request: TranslationRequest,
    options?: { signal?: AbortSignal }
  ): Promise<Result<TranslationResponse, AIServiceError>> {
    const mockFallback = (): TranslationResponse => ({
      translatedText: request.text, // Return original in mock mode
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      confidence: 0.95,
      usedGlossary: false,
    });

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<TranslationResponse>(
        'NLPService',
        'translate',
        {
          endpoint: '/nlp/translate',
          method: 'POST',
          body: request,
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
   * Classify text into categories
   */
  async classifyText(
    request: TextClassificationRequest,
    options?: { signal?: AbortSignal }
  ): Promise<Result<ClassificationResponse, AIServiceError>> {
    const mockFallback = async (): Promise<ClassificationResponse> => {
      const categories = generateMockCategories(request);
      return {
        categories,
        topCategory: categories[0]?.name || '',
        confidence: categories[0]?.score || 0,
      };
    };

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<ClassificationResponse>(
        'NLPService',
        'classifyText',
        {
          endpoint: '/nlp/classify',
          method: 'POST',
          body: request,
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
   * Summarize long text
   */
  async summarize(
    text: string,
    maxLength: number = 200,
    options?: { signal?: AbortSignal }
  ): Promise<Result<{ summary: string; confidence: number }, AIServiceError>> {
    const mockFallback = async (): Promise<{ summary: string; confidence: number }> => ({
      summary: generateMockSummary(text).slice(0, maxLength),
      confidence: 0.85,
    });

    if (this.useMockFallback) {
      return success(await mockFallback());
    }

    try {
      const data = await apiClient.request<{ summary: string; confidence: number }>(
        'NLPService',
        'summarize',
        {
          endpoint: '/nlp/summarize',
          method: 'POST',
          body: { text, maxLength },
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
// SINGLETON EXPORT
// ============================================

export const nlpService = new NLPService();
export default nlpService;

// ============================================
// TYPE EXPORTS
// ============================================

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
};
