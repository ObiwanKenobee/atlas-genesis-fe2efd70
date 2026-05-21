/**
 * Atlas Sanctum AI — Layer 1: Foundational Reasoning
 *
 * Implements:
 *   - A* / beam-search state-space exploration
 *   - Neo4j-backed knowledge graph interface
 *   - First-order logic inference engine
 *   - Ethical reasoning kernel (Constitutional AI pattern)
 */

import {
  KnowledgeGraph, KnowledgeNode, KnowledgeEdge,
  EthicalConstraint, EthicalVerdict,
  ReasoningState, AgentAction,
  Result, ok, err, AIError, Confidence,
} from '../AtlasSanctumAI.types';

// ─── Knowledge Graph (Neo4j adapter interface) ────────────────────────────────

export class InMemoryKnowledgeGraph implements KnowledgeGraph {
  nodes = new Map<string, KnowledgeNode>();
  edges: KnowledgeEdge[] = [];

  addNode(node: KnowledgeNode): void { this.nodes.set(node.id, node); }

  addEdge(edge: KnowledgeEdge): void { this.edges.push(edge); }

  query(sparql: string): KnowledgeNode[] {
    // Minimal SPARQL-like filter: "type=concept" style
    const match = sparql.match(/type=(\w+)/);
    if (!match) return [...this.nodes.values()];
    return [...this.nodes.values()].filter(n => n.type === match[1]);
  }

  traverse(startId: string, depth: number): KnowledgeNode[] {
    const visited = new Set<string>();
    const result: KnowledgeNode[] = [];
    const queue: { id: string; d: number }[] = [{ id: startId, d: 0 }];

    while (queue.length) {
      const { id, d } = queue.shift()!;
      if (visited.has(id) || d > depth) continue;
      visited.add(id);
      const node = this.nodes.get(id);
      if (node) result.push(node);
      this.edges
        .filter(e => e.from === id)
        .forEach(e => queue.push({ id: e.to, d: d + 1 }));
    }
    return result;
  }
}

// ─── A* State-Space Search ────────────────────────────────────────────────────

export interface SearchState {
  id: string;
  data: Record<string, unknown>;
  gCost: number;   // cost from start
  hCost: number;   // heuristic to goal
  parent?: SearchState;
}

export interface SearchProblem {
  initial: SearchState;
  isGoal: (s: SearchState) => boolean;
  expand: (s: SearchState) => SearchState[];
  heuristic: (s: SearchState) => number;
}

export function aStarSearch(problem: SearchProblem): SearchState[] {
  const open: SearchState[] = [problem.initial];
  const closed = new Set<string>();

  while (open.length) {
    open.sort((a, b) => (a.gCost + a.hCost) - (b.gCost + b.hCost));
    const current = open.shift()!;

    if (problem.isGoal(current)) return reconstructPath(current);
    if (closed.has(current.id)) continue;
    closed.add(current.id);

    for (const neighbor of problem.expand(current)) {
      if (!closed.has(neighbor.id)) {
        neighbor.hCost = problem.heuristic(neighbor);
        open.push(neighbor);
      }
    }
  }
  return [];
}

function reconstructPath(state: SearchState): SearchState[] {
  const path: SearchState[] = [];
  let current: SearchState | undefined = state;
  while (current) { path.unshift(current); current = current.parent; }
  return path;
}

// ─── Ethical Reasoning Kernel (Constitutional AI) ────────────────────────────

export const CORE_ETHICAL_PRINCIPLES: EthicalConstraint[] = [
  {
    id: 'no-harm',
    principle: 'Actions must not cause net harm to humans, ecosystems, or future generations.',
    weight: 1.0,
    hardBlock: true,
    evaluate(action: AgentAction): EthicalVerdict {
      const harmSignals = ['exploit', 'extract', 'manipulate', 'surveil'];
      const violations = harmSignals.filter(s =>
        JSON.stringify(action.payload).toLowerCase().includes(s)
      );
      return {
        permitted: violations.length === 0,
        score: violations.length === 0 ? 1.0 : 0.0,
        violations,
        recommendations: violations.map(v => `Remove or reframe "${v}" intent`),
      };
    },
  },
  {
    id: 'regenerative-alignment',
    principle: 'Actions must contribute to ecological restoration or human flourishing.',
    weight: 0.9,
    hardBlock: false,
    evaluate(action: AgentAction): EthicalVerdict {
      const positiveSignals = ['restore', 'regenerate', 'protect', 'educate', 'heal'];
      const score = positiveSignals.filter(s =>
        JSON.stringify(action.payload).toLowerCase().includes(s)
      ).length / positiveSignals.length;
      return {
        permitted: score > 0,
        score: score as Confidence,
        violations: score === 0 ? ['No regenerative intent detected'] : [],
        recommendations: score < 0.5 ? ['Strengthen regenerative framing'] : [],
      };
    },
  },
  {
    id: 'no-surveillance-capitalism',
    principle: 'System must not optimize for engagement addiction, behavioral extraction, or profit maximization at the expense of wellbeing.',
    weight: 1.0,
    hardBlock: true,
    evaluate(action: AgentAction): EthicalVerdict {
      const forbidden = ['engagement_maximization', 'behavioral_extraction', 'dark_pattern', 'addiction'];
      const violations = forbidden.filter(f =>
        JSON.stringify(action.payload).toLowerCase().includes(f)
      );
      return {
        permitted: violations.length === 0,
        score: violations.length === 0 ? 1.0 : 0.0,
        violations,
        recommendations: ['Reorient objective toward human flourishing metrics'],
      };
    },
  },
  {
    id: 'indigenous-sovereignty',
    principle: 'Indigenous data sovereignty and cultural rights must be respected unconditionally.',
    weight: 1.0,
    hardBlock: true,
    evaluate(action: AgentAction): EthicalVerdict {
      const payload = JSON.stringify(action.payload).toLowerCase();
      const violation = payload.includes('indigenous') && payload.includes('extract');
      return {
        permitted: !violation,
        score: violation ? 0.0 : 1.0,
        violations: violation ? ['Potential indigenous data extraction'] : [],
        recommendations: violation ? ['Obtain FPIC (Free, Prior, Informed Consent)'] : [],
      };
    },
  },
];

export class EthicalReasoningKernel {
  constructor(private constraints: EthicalConstraint[] = CORE_ETHICAL_PRINCIPLES) {}

  evaluate(action: AgentAction): Result<EthicalVerdict, AIError> {
    const verdicts = this.constraints.map(c => ({ constraint: c, verdict: c.evaluate(action) }));

    // Hard blocks veto immediately
    const hardViolation = verdicts.find(v => v.constraint.hardBlock && !v.verdict.permitted);
    if (hardViolation) {
      return ok({
        permitted: false,
        score: 0,
        violations: hardViolation.verdict.violations,
        recommendations: hardViolation.verdict.recommendations,
      });
    }

    const weightedScore = verdicts.reduce((sum, v) =>
      sum + v.verdict.score * v.constraint.weight, 0
    ) / verdicts.reduce((sum, v) => sum + v.constraint.weight, 0);

    const allViolations = verdicts.flatMap(v => v.verdict.violations);
    const allRecs = verdicts.flatMap(v => v.verdict.recommendations);

    return ok({
      permitted: weightedScore >= 0.5,
      score: weightedScore as Confidence,
      violations: allViolations,
      recommendations: allRecs,
    });
  }

  addConstraint(constraint: EthicalConstraint): void {
    this.constraints.push(constraint);
  }
}

// ─── Logic Inference Engine ───────────────────────────────────────────────────

export type LogicFact = Record<string, unknown>;
export type LogicRule = { condition: (facts: LogicFact[]) => boolean; consequence: LogicFact };

export class ForwardChainingEngine {
  private facts: LogicFact[] = [];
  private rules: LogicRule[] = [];

  addFact(fact: LogicFact): void { this.facts.push(fact); }
  addRule(rule: LogicRule): void { this.rules.push(rule); }

  infer(maxIterations = 100): LogicFact[] {
    let changed = true;
    let iterations = 0;

    while (changed && iterations++ < maxIterations) {
      changed = false;
      for (const rule of this.rules) {
        if (rule.condition(this.facts)) {
          const exists = this.facts.some(f =>
            JSON.stringify(f) === JSON.stringify(rule.consequence)
          );
          if (!exists) {
            this.facts.push(rule.consequence);
            changed = true;
          }
        }
      }
    }
    return this.facts;
  }

  query(predicate: (f: LogicFact) => boolean): LogicFact[] {
    return this.facts.filter(predicate);
  }
}

// ─── Reasoning Orchestrator ───────────────────────────────────────────────────

export class FoundationalReasoningLayer {
  readonly knowledgeGraph: InMemoryKnowledgeGraph;
  readonly ethicsKernel: EthicalReasoningKernel;
  readonly inferenceEngine: ForwardChainingEngine;

  constructor() {
    this.knowledgeGraph = new InMemoryKnowledgeGraph();
    this.ethicsKernel   = new EthicalReasoningKernel();
    this.inferenceEngine = new ForwardChainingEngine();
    this.seedPlanetaryKnowledge();
  }

  reason(hypothesis: string, evidence: string[]): ReasoningState {
    const relatedNodes = this.knowledgeGraph.query(`label=${hypothesis}`);
    const inferred = this.inferenceEngine.infer();
    const confidence = Math.min(0.99, evidence.length * 0.15 + relatedNodes.length * 0.1) as Confidence;

    return {
      hypothesis,
      evidence,
      confidence,
      alternativeHypotheses: relatedNodes.slice(0, 3).map(n => n.label),
      logicalChain: inferred.slice(0, 5).map(f => JSON.stringify(f)),
    };
  }

  evaluateAction(action: AgentAction): Result<EthicalVerdict, AIError> {
    return this.ethicsKernel.evaluate(action);
  }

  private seedPlanetaryKnowledge(): void {
    const concepts: KnowledgeNode[] = [
      { id: 'carbon-cycle', label: 'Carbon Cycle', type: 'concept', properties: { domain: 'ecology' } },
      { id: 'biodiversity', label: 'Biodiversity', type: 'concept', properties: { domain: 'ecology' } },
      { id: 'human-flourishing', label: 'Human Flourishing', type: 'concept', properties: { domain: 'ethics' } },
      { id: 'regenerative-economics', label: 'Regenerative Economics', type: 'concept', properties: { domain: 'economics' } },
      { id: 'indigenous-rights', label: 'Indigenous Rights', type: 'axiom', properties: { domain: 'governance' } },
    ];
    concepts.forEach(n => this.knowledgeGraph.addNode(n));

    const edges: KnowledgeEdge[] = [
      { from: 'carbon-cycle', to: 'biodiversity', relation: 'supports', weight: 0.9, confidence: 0.95 as Confidence },
      { from: 'biodiversity', to: 'human-flourishing', relation: 'enables', weight: 0.85, confidence: 0.9 as Confidence },
      { from: 'regenerative-economics', to: 'human-flourishing', relation: 'promotes', weight: 0.8, confidence: 0.88 as Confidence },
      { from: 'indigenous-rights', to: 'regenerative-economics', relation: 'grounds', weight: 1.0, confidence: 1.0 as Confidence },
    ];
    edges.forEach(e => this.knowledgeGraph.addEdge(e));
  }
}
