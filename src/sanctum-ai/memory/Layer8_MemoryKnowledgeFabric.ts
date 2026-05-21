/**
 * Atlas Sanctum AI — Layer 8: Memory & Knowledge Fabric
 *
 * Implements:
 *   - Long-term civilization memory store
 *   - Vector similarity search (Weaviate adapter interface)
 *   - Knowledge graph persistence
 *   - Ecosystem intelligence archives
 *   - Historical reasoning system
 */

import {
  CivilizationMemory, MemoryId, VectorSearchQuery,
  EcosystemArchive, AgentId, EpochMs,
  Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';

// ─── Vector Store (Weaviate adapter) ─────────────────────────────────────────

export class VectorStore {
  private store: CivilizationMemory[] = [];

  /**
   * Production: replaces in-memory store with Weaviate client.
   * import weaviate from 'weaviate-ts-client';
   */
  async upsert(memory: CivilizationMemory): Promise<void> {
    const idx = this.store.findIndex(m => m.memoryId === memory.memoryId);
    if (idx >= 0) this.store[idx] = memory;
    else this.store.push(memory);
  }

  async search(query: VectorSearchQuery): Promise<CivilizationMemory[]> {
    // Cosine similarity (simplified — production uses ANN index)
    const scored = this.store
      .filter(m => m.embeddings.length === query.queryEmbedding.length)
      .map(m => ({ memory: m, score: this.cosineSimilarity(query.queryEmbedding, m.embeddings) }))
      .filter(({ score }) => score >= (query.minSimilarity ?? 0))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.topK);

    return scored.map(s => s.memory);
  }

  async delete(memoryId: MemoryId): Promise<void> {
    this.store = this.store.filter(m => m.memoryId !== memoryId);
  }

  size(): number { return this.store.length; }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot   += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

// ─── Civilization Memory Manager ─────────────────────────────────────────────

export class CivilizationMemoryManager {
  private readonly vectorStore = new VectorStore();
  private readonly decayScheduler: Map<MemoryId, NodeJS.Timeout> = new Map();

  async store(memory: CivilizationMemory): Promise<Result<MemoryId, AIError>> {
    await this.vectorStore.upsert(memory);

    // Schedule decay for non-permanent memories
    if (memory.decayRate > 0) {
      const decayMs = (1 / memory.decayRate) * 86_400_000; // days → ms
      const timer = setTimeout(() => this.decay(memory.memoryId), decayMs);
      this.decayScheduler.set(memory.memoryId, timer);
    }

    return ok(memory.memoryId);
  }

  async recall(query: VectorSearchQuery): Promise<CivilizationMemory[]> {
    return this.vectorStore.search(query);
  }

  async recallByType(type: CivilizationMemory['type'], topK = 10): Promise<CivilizationMemory[]> {
    const dummyEmbedding = new Float32Array(128).fill(0.1);
    const results = await this.vectorStore.search({ queryEmbedding: dummyEmbedding, topK: 1000 });
    return results.filter(m => m.type === type).slice(0, topK);
  }

  async recallByAgent(agentId: AgentId, topK = 20): Promise<CivilizationMemory[]> {
    const dummyEmbedding = new Float32Array(128).fill(0.1);
    const results = await this.vectorStore.search({ queryEmbedding: dummyEmbedding, topK: 1000 });
    return results.filter(m => m.sourceAgents.includes(agentId)).slice(0, topK);
  }

  private async decay(memoryId: MemoryId): Promise<void> {
    await this.vectorStore.delete(memoryId);
    this.decayScheduler.delete(memoryId);
  }

  stats(): { totalMemories: number; scheduledDecays: number } {
    return {
      totalMemories: this.vectorStore.size(),
      scheduledDecays: this.decayScheduler.size,
    };
  }
}

// ─── Ecosystem Intelligence Archive ──────────────────────────────────────────

export class EcosystemIntelligenceArchive {
  private archives = new Map<string, EcosystemArchive>();

  record(biomeId: string, snapshot: EcosystemArchive['historicalData'][0]): void {
    const archive = this.archives.get(biomeId) ?? {
      biomeId,
      historicalData: [],
      baselineYear: new Date().getFullYear(),
      trendAnalysis: {},
    };
    archive.historicalData.push(snapshot);
    archive.trendAnalysis = this.computeTrends(archive.historicalData);
    this.archives.set(biomeId, archive);
  }

  getArchive(biomeId: string): EcosystemArchive | undefined {
    return this.archives.get(biomeId);
  }

  getBaseline(biomeId: string): EcosystemArchive['historicalData'][0] | undefined {
    const archive = this.archives.get(biomeId);
    return archive?.historicalData[0];
  }

  compareToBaseline(biomeId: string): {
    ndviChange: number;
    carbonChange: number;
    speciesChange: number;
    trend: 'improving' | 'stable' | 'degrading';
  } | null {
    const archive = this.archives.get(biomeId);
    if (!archive || archive.historicalData.length < 2) return null;

    const baseline = archive.historicalData[0];
    const latest   = archive.historicalData.at(-1)!;

    const ndviChange    = latest.ndvi - baseline.ndvi;
    const carbonChange  = latest.carbonStock - baseline.carbonStock;
    const speciesChange = latest.speciesCount - baseline.speciesCount;
    const avgChange     = (ndviChange + carbonChange / 100 + speciesChange / 100) / 3;

    return {
      ndviChange,
      carbonChange,
      speciesChange,
      trend: avgChange > 0.05 ? 'improving' : avgChange < -0.05 ? 'degrading' : 'stable',
    };
  }

  private computeTrends(data: EcosystemArchive['historicalData']): Record<string, number> {
    if (data.length < 2) return {};
    const first = data[0];
    const last  = data.at(-1)!;
    const years = (last.timestamp - first.timestamp) / (365.25 * 86_400_000);
    if (years === 0) return {};

    return {
      ndviTrendPerYear:    (last.ndvi - first.ndvi) / years,
      carbonTrendPerYear:  (last.carbonStock - first.carbonStock) / years,
      speciesTrendPerYear: (last.speciesCount - first.speciesCount) / years,
    };
  }
}

// ─── Historical Reasoning System ─────────────────────────────────────────────

export class HistoricalReasoningSystem {
  private readonly archive: EcosystemIntelligenceArchive;
  private readonly memory: CivilizationMemoryManager;

  constructor(archive: EcosystemIntelligenceArchive, memory: CivilizationMemoryManager) {
    this.archive = archive;
    this.memory  = memory;
  }

  async findAnalogues(
    currentState: Record<string, number>,
    topK = 3,
  ): Promise<CivilizationMemory[]> {
    // Encode current state as embedding (production: use sentence transformer)
    const embedding = new Float32Array(128);
    Object.values(currentState).forEach((v, i) => { if (i < 128) embedding[i] = v; });

    return this.memory.recall({ queryEmbedding: embedding, topK, minSimilarity: 0.5 });
  }

  async generateLessonsLearned(biomeId: string): Promise<string[]> {
    const comparison = this.archive.compareToBaseline(biomeId);
    if (!comparison) return ['Insufficient historical data'];

    const lessons: string[] = [];
    if (comparison.ndviChange < -0.1) lessons.push('Vegetation loss detected — review land-use policies');
    if (comparison.carbonChange < -50) lessons.push('Carbon stock declining — prioritize reforestation');
    if (comparison.speciesChange < -5) lessons.push('Biodiversity loss — establish protected corridors');
    if (comparison.trend === 'improving') lessons.push('Restoration interventions showing positive results');

    return lessons.length > 0 ? lessons : ['Ecosystem stable — maintain current interventions'];
  }
}

// ─── Memory & Knowledge Fabric Layer ─────────────────────────────────────────

export class MemoryKnowledgeFabricLayer {
  readonly memory    = new CivilizationMemoryManager();
  readonly ecosystem = new EcosystemIntelligenceArchive();
  readonly history   = new HistoricalReasoningSystem(
    new EcosystemIntelligenceArchive(),
    new CivilizationMemoryManager(),
  );

  async consolidate(agentId: AgentId, content: string, type: CivilizationMemory['type']): Promise<MemoryId> {
    const embedding = new Float32Array(128).fill(Math.random()); // production: embed(content)
    const memory: CivilizationMemory = {
      memoryId: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` as MemoryId,
      type,
      content,
      embeddings: embedding,
      tags: [type, agentId],
      importance: 0.7,
      createdAt: Date.now() as EpochMs,
      lastAccessedAt: Date.now() as EpochMs,
      decayRate: type === 'cultural' || type === 'ecological' ? 0 : 0.01,
      sourceAgents: [agentId],
    };
    const result = await this.memory.store(memory);
    return result.ok ? result.value : memory.memoryId;
  }
}
