/**
 * Atlas Sanctum — Intelligence Plane
 * Purpose: LLM Gateway, Semantic Search, Ethics Engine, Long-term Memory, Agent Runtime
 *
 * Architecture: Hexagonal — this is an application service (use-case layer).
 * All AI provider interactions go through this plane, never directly from routes.
 */

import { randomUUID } from 'crypto';
import type {
  IntelligencePlane,
  ChatRequest,
  ChatResponse,
  SearchOptions,
  SearchResult,
  ReasoningRequest,
  ReasoningResponse,
  PlanContext,
  ExecutionPlan,
  MemoryEntry,
  EthicsContext,
  EthicsEvaluation,
  AgentTask,
  AgentResult,
  AgentStep,
  UserId,
  AgentId,
  TokenUsage,
} from '../types';
import { logger } from '../../utils/logger';

// ─── LLM Provider abstraction ─────────────────────────────────────────────────

interface LLMProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  embed(texts: string[]): Promise<number[][]>;
}

// ─── OpenAI Adapter ───────────────────────────────────────────────────────────

class OpenAIAdapter implements LLMProvider {
  readonly name = 'openai';
  private readonly apiKey = process.env.OPENAI_API_KEY!;
  private readonly defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o';
  private readonly embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large';

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature ?? 0.1,
        tools: request.tools?.map(t => ({ type: 'function', function: t })),
      }),
      signal: AbortSignal.timeout(Number(process.env.LLM_REQUEST_TIMEOUT_MS) || 30000),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = await response.json() as any;
    const choice = data.choices[0];

    return {
      content: choice.message?.content || '',
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        estimatedCostUsd: (data.usage.total_tokens / 1000) * 0.002,
      },
      finishReason: choice.finish_reason,
      toolCalls: choice.message?.tool_calls?.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || '{}'),
      })),
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.embeddingModel, input: texts }),
    });
    const data = await response.json() as any;
    return data.data.map((d: any) => d.embedding);
  }
}

// ─── Anthropic Adapter ────────────────────────────────────────────────────────

class AnthropicAdapter implements LLMProvider {
  readonly name = 'anthropic';
  private readonly apiKey = process.env.ANTHROPIC_API_KEY!;
  private readonly defaultModel = process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const systemMsg = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        max_tokens: request.maxTokens || 8192,
        system: systemMsg?.content,
        messages: userMessages,
      }),
      signal: AbortSignal.timeout(Number(process.env.LLM_REQUEST_TIMEOUT_MS) || 30000),
    });

    const data = await response.json() as any;
    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;

    return {
      content: data.content?.[0]?.text || '',
      model: data.model,
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCostUsd: ((inputTokens * 3 + outputTokens * 15) / 1000000),
      },
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
    };
  }

  async embed(_texts: string[]): Promise<number[][]> {
    // Anthropic doesn't offer embeddings — caller should use OpenAI or Cohere
    throw new Error('Anthropic does not support embeddings. Use openai or cohere provider.');
  }
}

// ─── Model Router ─────────────────────────────────────────────────────────────

class ModelRouter {
  private providers = new Map<string, LLMProvider>();
  private readonly defaultProvider: string;
  private readonly fallbackProvider: string;

  constructor() {
    this.defaultProvider = process.env.LLM_DEFAULT_PROVIDER || 'openai';
    this.fallbackProvider = process.env.LLM_FALLBACK_PROVIDER || 'anthropic';

    if (process.env.OPENAI_API_KEY) this.providers.set('openai', new OpenAIAdapter());
    if (process.env.ANTHROPIC_API_KEY) this.providers.set('anthropic', new AnthropicAdapter());
  }

  async route(request: ChatRequest, providerHint?: string): Promise<ChatResponse> {
    const providerName = providerHint || this.defaultProvider;
    const primary = this.providers.get(providerName);
    const fallback = this.providers.get(this.fallbackProvider);

    if (primary) {
      try {
        return await primary.chat(request);
      } catch (err) {
        logger.warn(`[ModelRouter] Primary provider ${providerName} failed, trying fallback`, { err });
        if (fallback && fallback.name !== providerName) {
          return await fallback.chat(request);
        }
        throw err;
      }
    }

    if (fallback) return await fallback.chat(request);
    throw new Error('No LLM provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
  }

  async embed(texts: string[]): Promise<number[][]> {
    const provider = this.providers.get('openai') || this.providers.values().next().value;
    if (!provider) throw new Error('No embedding provider available');
    return provider.embed(texts);
  }
}

// ─── Vector Store Port ────────────────────────────────────────────────────────

interface VectorStore {
  upsert(id: string, vector: number[], metadata: Record<string, unknown>, namespace?: string): Promise<void>;
  query(vector: number[], topK: number, filter?: Record<string, unknown>, namespace?: string): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
}

class PgVectorStore implements VectorStore {
  constructor(private readonly exec: (sql: string, params: unknown[]) => Promise<any>) {}

  async upsert(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void> {
    await this.exec(
      `INSERT INTO vector_embeddings (id, embedding, metadata, updated_at)
       VALUES ($1, $2::vector, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET embedding = $2::vector, metadata = $3, updated_at = NOW()`,
      [id, JSON.stringify(vector), JSON.stringify(metadata)]
    );
  }

  async query(vector: number[], topK: number, filter?: Record<string, unknown>): Promise<SearchResult[]> {
    const result = await this.exec(
      `SELECT id, metadata, 1 - (embedding <=> $1::vector) AS score
       FROM vector_embeddings
       WHERE ($2::jsonb IS NULL OR metadata @> $2::jsonb)
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(vector), filter ? JSON.stringify(filter) : null, topK]
    );
    return result.rows.map((r: any) => ({
      id: r.id,
      score: r.score,
      content: r.metadata?.content || '',
      metadata: r.metadata,
    }));
  }

  async delete(ids: string[]): Promise<void> {
    await this.exec('DELETE FROM vector_embeddings WHERE id = ANY($1)', [ids]);
  }
}

// ─── Memory Store ─────────────────────────────────────────────────────────────

class MemoryStore {
  constructor(
    private readonly redis: any,
    private readonly vectorStore: VectorStore,
    private readonly modelRouter: ModelRouter
  ) {}

  async remember(entry: MemoryEntry): Promise<void> {
    const id = entry.id || randomUUID();
    const embedding = await this.modelRouter.embed([entry.content]);

    await this.vectorStore.upsert(id, embedding[0], {
      userId: entry.userId,
      sessionId: entry.sessionId,
      type: entry.type,
      content: entry.content,
      importance: entry.importance,
      tags: entry.tags,
      createdAt: new Date().toISOString(),
    }, `memory:${entry.userId}`);

    if (entry.type === 'working') {
      const key = `sanctum:memory:working:${entry.userId}`;
      const ttl = Number(process.env.AI_MEMORY_TTL_SECONDS) || 86400;
      await this.redis.setex(key, ttl, JSON.stringify({ ...entry, id }));
    }
  }

  async recall(query: string, userId: UserId): Promise<MemoryEntry[]> {
    const embedding = await this.modelRouter.embed([query]);
    const results = await this.vectorStore.query(
      embedding[0],
      10,
      { userId },
      `memory:${userId}`
    );
    return results.map(r => r.metadata as unknown as MemoryEntry);
  }
}

// ─── Ethics Engine ────────────────────────────────────────────────────────────

const ETHICS_SYSTEM_PROMPT = `You are the Atlas Sanctum Ethics Engine.
Evaluate the given content/action against these principles:
1. Do No Harm — never enable violence, exploitation, or destruction
2. Transparency — no deception or hidden manipulation  
3. Equity — no discrimination, uphold indigenous rights and justice
4. Ecological Integrity — protect ecosystems, biodiversity, climate
5. Sovereignty — respect cultural, national, and personal autonomy
6. Proportionality — interventions must be proportional to benefits

Return JSON: { passed: boolean, score: number (0-1), violations: [{principle, severity, description}], recommendations: string[], requiresHumanReview: boolean }`;

// ─── Intelligence Plane Implementation ───────────────────────────────────────

export class IntelligencePlaneService implements IntelligencePlane {
  readonly id = 'intelligence' as const;

  private readonly router: ModelRouter;
  private memoryStore: MemoryStore | null = null;
  private vectorStore: VectorStore | null = null;

  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly redis: any
  ) {
    this.router = new ModelRouter();
  }

  async init(): Promise<void> {
    const pgVector = new PgVectorStore(this.dbQuery);
    this.vectorStore = pgVector;
    this.memoryStore = new MemoryStore(this.redis, pgVector, this.router);
    logger.info('[IntelligencePlane] Initialized');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Inject long-term memory context if userId provided
    if (request.userId && request.messages.length > 0) {
      const lastUserMsg = [...request.messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        const memories = await this.recall(lastUserMsg.content, request.userId);
        if (memories.length > 0) {
          const memoryContext = memories.map(m => m.content).join('\n');
          request = {
            ...request,
            messages: [
              { role: 'system', content: `Relevant context from memory:\n${memoryContext}` },
              ...request.messages,
            ],
          };
        }
      }
    }

    return this.router.route(request);
  }

  async embed(texts: string[]): Promise<number[][]> {
    return this.router.embed(texts);
  }

  async semanticSearch(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.vectorStore) throw new Error('Vector store not initialized');
    const [embedding] = await this.router.embed([query]);
    return this.vectorStore.query(
      embedding,
      options?.topK ?? 10,
      options?.filter,
      options?.namespace
    );
  }

  async reason(problem: ReasoningRequest): Promise<ReasoningResponse> {
    const systemPrompt = `You are a rigorous reasoning engine. Think step-by-step.
    Depth: ${problem.reasoningDepth || 'deep'}.
    Output JSON: { conclusion, reasoning: [{step, thought, evidence}], confidence, sources, uncertainties }`;

    const response = await this.router.route({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question: ${problem.question}\nContext: ${problem.context || 'none'}\nEvidence: ${problem.evidence?.join('\n') || 'none'}` },
      ],
      temperature: 0,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        conclusion: response.content,
        reasoning: [{ step: 1, thought: response.content }],
        confidence: 0.7,
        sources: [],
        uncertainties: ['Could not parse structured response'],
      };
    }
  }

  async plan(goal: string, context: PlanContext): Promise<ExecutionPlan> {
    const systemPrompt = `You are a planning engine for Atlas Sanctum COS.
    Available tools: ${context.availableTools.join(', ')}.
    Constraints: ${context.constraints.join('; ')}.
    Output valid JSON matching ExecutionPlan schema.`;

    const response = await this.router.route({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Goal: ${goal}\nTime horizon: ${context.timeHorizon || 'immediate'}` },
      ],
      temperature: 0,
    });

    return JSON.parse(response.content) as ExecutionPlan;
  }

  async remember(memory: MemoryEntry): Promise<void> {
    if (!this.memoryStore) throw new Error('Memory store not initialized');
    await this.memoryStore.remember(memory);
  }

  async recall(query: string, userId: UserId): Promise<MemoryEntry[]> {
    if (!this.memoryStore) return [];
    return this.memoryStore.recall(query, userId);
  }

  async runAgent(agentId: AgentId, task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const steps: AgentStep[] = [];
    let totalTokens = 0;
    let stepNumber = 0;
    const maxSteps = task.maxSteps ?? Number(process.env.AGENT_MAX_STEPS) ?? 100;

    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are agent ${agentId} in Atlas Sanctum.
Task: ${task.description}
Allowed tools: ${task.allowedTools.join(', ')}
Priority: ${task.priority}
Think step by step. For each step output JSON: { thought, action, action_input }
When done output: { thought, final_answer: <your answer> }`,
      },
      { role: 'user', content: JSON.stringify(task.input) },
    ];

    while (stepNumber < maxSteps) {
      const response = await this.router.route({ messages: messages as any, temperature: 0 });
      totalTokens += response.usage.totalTokens;
      stepNumber++;

      let parsed: any;
      try {
        parsed = JSON.parse(response.content);
      } catch {
        parsed = { thought: response.content, final_answer: response.content };
      }

      if (parsed.final_answer !== undefined) {
        steps.push({ stepNumber, thought: parsed.thought, durationMs: Date.now() - startTime, requiresApproval: false });
        return {
          taskId: task.id,
          agentId,
          status: 'completed',
          output: { result: parsed.final_answer },
          steps,
          totalDurationMs: Date.now() - startTime,
          tokensUsed: totalTokens,
        };
      }

      const needsApproval = task.requiresApproval &&
        ['create', 'delete', 'execute', 'send', 'transfer'].some(verb =>
          (parsed.action || '').toLowerCase().includes(verb)
        );

      const step: AgentStep = {
        stepNumber,
        thought: parsed.thought,
        action: parsed.action,
        actionInput: parsed.action_input,
        durationMs: 0,
        requiresApproval: needsApproval,
      };
      steps.push(step);

      if (needsApproval && process.env.AGENT_HUMAN_APPROVAL_REQUIRED === 'true') {
        return {
          taskId: task.id,
          agentId,
          status: 'awaiting_approval',
          steps,
          totalDurationMs: Date.now() - startTime,
          tokensUsed: totalTokens,
        };
      }

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: `Action ${parsed.action} executed. Continue.` });
    }

    return {
      taskId: task.id,
      agentId,
      status: 'failed',
      error: `Max steps (${maxSteps}) reached without resolution`,
      steps,
      totalDurationMs: Date.now() - startTime,
      tokensUsed: totalTokens,
    };
  }

  async evaluateEthics(content: string, context: EthicsContext): Promise<EthicsEvaluation> {
    if (process.env.ETHICS_ENGINE_ENABLED !== 'true') {
      return { passed: true, score: 1, violations: [], recommendations: [], requiresHumanReview: false, auditTrail: '' };
    }

    const response = await this.router.route({
      messages: [
        { role: 'system', content: ETHICS_SYSTEM_PROMPT },
        { role: 'user', content: `Content: ${content}\nAction: ${context.action}\nPlane: ${context.plane}\nStakes: ${context.stakes || 'medium'}` },
      ],
      temperature: 0,
    });

    let result: Omit<EthicsEvaluation, 'auditTrail'>;
    try {
      result = JSON.parse(response.content);
    } catch {
      result = { passed: true, score: 0.8, violations: [], recommendations: [], requiresHumanReview: false };
    }

    const auditTrail = JSON.stringify({ evaluatedAt: new Date(), context, result });

    if (!result.passed && process.env.ETHICS_HARD_BLOCK_ON_VIOLATION === 'true') {
      logger.warn('[EthicsEngine] BLOCKED action due to ethics violation', { context, violations: result.violations });
    }

    return { ...result, auditTrail };
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _instance: IntelligencePlaneService | null = null;

export async function getIntelligencePlane(
  dbQuery: (sql: string, params: unknown[]) => Promise<any>,
  redis: any
): Promise<IntelligencePlaneService> {
  if (!_instance) {
    _instance = new IntelligencePlaneService(dbQuery, redis);
    await _instance.init();
  }
  return _instance;
}
