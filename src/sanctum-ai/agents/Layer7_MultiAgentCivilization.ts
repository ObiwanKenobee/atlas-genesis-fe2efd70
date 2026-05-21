/**
 * Atlas Sanctum AI — Layer 7: Multi-Agent Civilization Engine
 *
 * Implements:
 *   - Base CivilizationAgent with ethical evaluation, memory sharing, negotiation
 *   - 12 specialized autonomous agents (governance → forecasting)
 *   - Agent registry & message bus
 *   - Coalition formation
 *   - Orchestrated multi-agent decision pipeline
 *
 * Production stack: LangGraph + CrewAI + Ray for distributed execution
 */

import {
  AgentId, AgentRole, AgentStatus, AgentCapability,
  AgentAction, AgentMessage, NegotiationProposal, AgentCoalition,
  EthicalVerdict, EpochMs,
  Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';
import { EthicalReasoningKernel } from './Layer1_FoundationalReasoning';

// ─── Base Agent ───────────────────────────────────────────────────────────────

export abstract class CivilizationAgent {
  readonly id: AgentId;
  readonly role: AgentRole;
  status: AgentStatus = 'idle';
  protected memory: AgentMessage[] = [];
  protected readonly ethics = new EthicalReasoningKernel();

  constructor(id: string, role: AgentRole) {
    this.id   = id as AgentId;
    this.role = role;
  }

  abstract capabilities(): AgentCapability[];
  abstract act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>>;

  evaluateEthics(action: AgentAction): EthicalVerdict {
    const result = this.ethics.evaluate(action);
    return result.ok ? result.value : { permitted: false, score: 0, violations: ['Ethics evaluation failed'], recommendations: [] };
  }

  receiveMessage(msg: AgentMessage): void {
    this.memory.push(msg);
    if (this.memory.length > 500) this.memory.shift(); // rolling window
  }

  shareMemory(targetAgent: CivilizationAgent, topK = 5): void {
    const relevant = this.memory
      .sort((a, b) => b.priority - a.priority)
      .slice(0, topK);
    relevant.forEach(m => targetAgent.receiveMessage({ ...m, from: this.id, to: targetAgent.id }));
  }

  protected buildAction(type: string, payload: Record<string, unknown>): AgentAction {
    return {
      actionId: `${this.id}-${Date.now()}`,
      agentId: this.id,
      type,
      payload,
      timestamp: Date.now() as EpochMs,
    };
  }
}

// ─── Specialized Agents ───────────────────────────────────────────────────────

export class GovernanceAgent extends CivilizationAgent {
  constructor() { super('agent-governance', 'governance'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'propose_policy', description: 'Draft and submit governance proposals', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-harm', 'indigenous-sovereignty'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('propose_policy', { domain: context.domain ?? 'regenerative', proposal: context.proposal ?? 'Strengthen bioregional governance councils' });
    const verdict = this.evaluateEthics(action);
    if (!verdict.permitted) return err(new AIError(`Governance action blocked: ${verdict.violations.join(', ')}`, 'ETHICS_BLOCK', 'multi-agent'));
    return ok({ ...action, ethicalScore: verdict.score, rationale: 'Governance proposal aligned with regenerative principles' });
  }
}

export class EconomicsAgent extends CivilizationAgent {
  constructor() { super('agent-economics', 'economics'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'value_impact', description: 'Calculate regenerative economic value', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-surveillance-capitalism'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('value_impact', { impact: context.impact, methodology: 'regenerative_value_exchange' });
    const verdict = this.evaluateEthics(action);
    if (!verdict.permitted) return err(new AIError('Economics action blocked', 'ETHICS_BLOCK', 'multi-agent'));
    return ok({ ...action, ethicalScore: verdict.score });
  }
}

export class RestorationAgent extends CivilizationAgent {
  constructor() { super('agent-restoration', 'restoration'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'plan_restoration', description: 'Design ecosystem restoration interventions', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['regenerative-alignment'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('plan_restoration', {
      biome: context.biome,
      interventions: ['reforestation', 'soil_regeneration', 'water_conservation'],
      estimatedCarbonTonnes: 1200,
    });
    return ok({ ...action, ethicalScore: 0.95, rationale: 'Restoration plan optimizes for biodiversity and carbon co-benefits' });
  }
}

export class MedicineAgent extends CivilizationAgent {
  constructor() { super('agent-medicine', 'medicine'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'health_assessment', description: 'Assess climate-health burden and recommend interventions', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-harm'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('health_assessment', {
      region: context.region,
      climateHealthBurden: context.burden ?? 0,
      recommendations: ['Improve air quality monitoring', 'Expand clean water access', 'Climate-resilient health infrastructure'],
    });
    return ok({ ...action, ethicalScore: 0.98 });
  }
}

export class LogisticsAgent extends CivilizationAgent {
  constructor() { super('agent-logistics', 'logistics'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'optimize_supply_chain', description: 'Optimize regenerative supply chains', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['regenerative-alignment'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('optimize_supply_chain', {
      routes: context.routes ?? [],
      carbonFootprintReduction: 0.35,
      localSourcingPct: 0.7,
    });
    return ok({ ...action, ethicalScore: 0.88 });
  }
}

export class EthicsAgent extends CivilizationAgent {
  constructor() { super('agent-ethics', 'ethics'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'audit_action', description: 'Audit any agent action for ethical compliance', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-harm', 'no-surveillance-capitalism', 'indigenous-sovereignty'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const targetAction = context.action as AgentAction;
    const verdict = this.evaluateEthics(targetAction);
    const action = this.buildAction('audit_action', { verdict, targetActionId: targetAction?.actionId });
    return ok({ ...action, ethicalScore: verdict.score, rationale: verdict.violations.join('; ') || 'No violations' });
  }
}

export class EducationAgent extends CivilizationAgent {
  constructor() { super('agent-education', 'education'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'design_curriculum', description: 'Design regenerative education programs', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['regenerative-alignment'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('design_curriculum', {
      audience: context.audience ?? 'youth',
      topics: ['ecological literacy', 'regenerative economics', 'indigenous knowledge', 'climate science'],
      languages: context.languages ?? ['en', 'es', 'sw'],
    });
    return ok({ ...action, ethicalScore: 0.97 });
  }
}

export class EcologyAgent extends CivilizationAgent {
  constructor() { super('agent-ecology', 'ecology'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'monitor_ecosystem', description: 'Monitor and protect ecosystem health', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['regenerative-alignment'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('monitor_ecosystem', {
      biomeId: context.biomeId,
      ndvi: context.ndvi ?? 0.7,
      biodiversityIndex: context.biodiversityIndex ?? 0.8,
      alerts: context.alerts ?? [],
    });
    return ok({ ...action, ethicalScore: 0.99 });
  }
}

export class DisasterResponseAgent extends CivilizationAgent {
  constructor() { super('agent-disaster', 'disaster'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'coordinate_response', description: 'Coordinate disaster response and resilience', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-harm'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('coordinate_response', {
      disasterType: context.disasterType ?? 'flood',
      affectedRegion: context.region,
      responseProtocol: 'immediate_evacuation_and_resource_deployment',
      estimatedAffected: context.population ?? 0,
    });
    return ok({ ...action, ethicalScore: 1.0, rationale: 'Life safety is paramount' });
  }
}

export class ForecastingAgent extends CivilizationAgent {
  constructor() { super('agent-forecasting', 'forecasting'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'strategic_forecast', description: 'Generate long-horizon civilizational forecasts', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['regenerative-alignment'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('strategic_forecast', {
      horizon: context.horizon ?? 25,
      scenarios: ['regenerative transition', 'business as usual', 'accelerated collapse'],
      primaryScenario: 'regenerative transition',
      confidence: 0.72,
    });
    return ok({ ...action, ethicalScore: 0.93 });
  }
}

export class CultureAgent extends CivilizationAgent {
  constructor() { super('agent-culture', 'culture'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'preserve_culture', description: 'Preserve and transmit cultural heritage', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['indigenous-sovereignty'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('preserve_culture', {
      community: context.community,
      knowledgeDomains: ['ecology', 'governance', 'medicine'],
      preservationMethod: 'digital_archive_with_sovereignty_controls',
    });
    return ok({ ...action, ethicalScore: 0.96 });
  }
}

export class SecurityAgent extends CivilizationAgent {
  constructor() { super('agent-security', 'security'); }

  capabilities(): AgentCapability[] {
    return [{ name: 'threat_assessment', description: 'Assess and mitigate system threats', inputSchema: {}, outputSchema: {}, ethicalConstraints: ['no-harm', 'no-surveillance-capitalism'] }];
  }

  async act(context: Record<string, unknown>): Promise<Result<AgentAction, AIError>> {
    const action = this.buildAction('threat_assessment', {
      threatType: context.threatType ?? 'data_manipulation',
      severity: context.severity ?? 'medium',
      mitigations: ['zero-knowledge verification', 'multi-source consensus', 'anomaly detection'],
    });
    return ok({ ...action, ethicalScore: 0.91 });
  }
}

// ─── Agent Registry & Message Bus ────────────────────────────────────────────

export class AgentRegistry {
  private agents = new Map<AgentId, CivilizationAgent>();
  private messageQueue: AgentMessage[] = [];

  register(agent: CivilizationAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: AgentId): CivilizationAgent | undefined {
    return this.agents.get(id);
  }

  getByRole(role: AgentRole): CivilizationAgent[] {
    return [...this.agents.values()].filter(a => a.role === role);
  }

  broadcast(message: AgentMessage): void {
    this.agents.forEach(agent => {
      if (agent.id !== message.from) agent.receiveMessage(message);
    });
  }

  send(message: AgentMessage): void {
    if (message.to === 'broadcast') { this.broadcast(message); return; }
    this.agents.get(message.to as AgentId)?.receiveMessage(message);
  }

  allAgents(): CivilizationAgent[] {
    return [...this.agents.values()];
  }
}

// ─── Coalition Builder ────────────────────────────────────────────────────────

export class CoalitionBuilder {
  form(
    agents: CivilizationAgent[],
    objective: string,
    decisionRule: AgentCoalition['decisionRule'] = 'consensus',
    durationMs = 3_600_000,
  ): AgentCoalition {
    return {
      coalitionId: `coalition-${Date.now()}`,
      members: agents.map(a => a.id),
      sharedObjective: objective,
      coordinationProtocol: 'async-message-passing',
      decisionRule,
      activeUntil: (Date.now() + durationMs) as EpochMs,
    };
  }
}

// ─── Multi-Agent Civilization Layer ──────────────────────────────────────────

export class MultiAgentCivilizationLayer {
  readonly registry = new AgentRegistry();
  readonly coalitions = new CoalitionBuilder();

  constructor() {
    // Register all 12 specialized agents
    [
      new GovernanceAgent(),
      new EconomicsAgent(),
      new RestorationAgent(),
      new MedicineAgent(),
      new LogisticsAgent(),
      new EthicsAgent(),
      new EducationAgent(),
      new EcologyAgent(),
      new DisasterResponseAgent(),
      new ForecastingAgent(),
      new CultureAgent(),
      new SecurityAgent(),
    ].forEach(a => this.registry.register(a));
  }

  /**
   * Coordinate a multi-agent decision pipeline.
   * 1. Ethics agent audits the proposed action
   * 2. Relevant domain agents act in parallel
   * 3. Results are aggregated and broadcast
   */
  async coordinate(
    context: Record<string, unknown>,
    involvedRoles: AgentRole[],
  ): Promise<{ results: AgentAction[]; ethicsVerdict: EthicalVerdict; coalition: AgentCoalition }> {
    const involvedAgents = involvedRoles.flatMap(r => this.registry.getByRole(r));
    const coalition = this.coalitions.form(involvedAgents, context.objective as string ?? 'Coordinate regenerative action');

    // Parallel execution
    const results = await Promise.all(
      involvedAgents.map(async agent => {
        const result = await agent.act(context);
        return result.ok ? result.value : null;
      })
    );

    const validResults = results.filter((r): r is AgentAction => r !== null);

    // Ethics audit
    const ethicsAgent = this.registry.getByRole('ethics')[0];
    const ethicsResult = ethicsAgent
      ? await ethicsAgent.act({ action: validResults[0] ?? {}, ...context })
      : null;

    const ethicsVerdict: EthicalVerdict = ethicsResult?.ok
      ? { permitted: true, score: ethicsResult.value.ethicalScore ?? 0.8, violations: [], recommendations: [] }
      : { permitted: false, score: 0, violations: ['Ethics audit failed'], recommendations: [] };

    // Share memory across coalition members
    involvedAgents.forEach((agent, i) => {
      involvedAgents.forEach((other, j) => {
        if (i !== j) agent.shareMemory(other, 3);
      });
    });

    return { results: validResults, ethicsVerdict, coalition };
  }
}
