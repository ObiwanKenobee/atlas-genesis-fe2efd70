/**
 * Atlas Sanctum — Base Agent (ReAct Architecture)
 * All specialized agents extend this class.
 * Implements: Plan → Act → Observe → Reflect loop with:
 *   - Long-term memory
 *   - Tool calling
 *   - Human approval gates
 *   - Delegation to peer agents
 *   - Ethics pre-check
 *   - Observability
 */

import { randomUUID } from 'crypto';
import type { AgentTask, AgentResult, AgentStep, AgentType } from '../../sanctum/types';
import { logger } from '../../utils/logger';

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
  execute(args: Record<string, unknown>): Promise<unknown>;
}

export interface AgentConfig {
  agentId: string;
  agentType: AgentType;
  systemPrompt: string;
  tools: Tool[];
  maxSteps?: number;
  temperature?: number;
  requiresApprovalFor?: string[]; // Tool names that require human approval
}

export abstract class BaseAgent {
  protected readonly agentId: string;
  protected readonly agentType: AgentType;
  protected tools = new Map<string, Tool>();

  constructor(protected readonly config: AgentConfig) {
    this.agentId = config.agentId;
    this.agentType = config.agentType;
    for (const tool of config.tools) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Run the agent on a task. Returns a result when:
   * - final_answer is produced
   * - max steps reached
   * - human approval required (status = 'awaiting_approval')
   */
  async run(task: AgentTask, intelligencePlane: any, coordinationPlane: any): Promise<AgentResult> {
    const startTime = Date.now();
    const steps: AgentStep[] = [];
    let totalTokens = 0;
    const maxSteps = task.maxSteps ?? this.config.maxSteps ?? 30;

    // Pre-flight ethics check
    const ethics = await intelligencePlane.evaluateEthics(JSON.stringify(task.input), {
      plane: 'coordination',
      action: task.type,
      agentId: this.agentId,
      stakes: task.priority === 'urgent' ? 'high' : 'medium',
    });

    if (!ethics.passed) {
      return {
        taskId: task.id,
        agentId: this.agentId,
        status: 'failed',
        error: `Ethics check failed: ${ethics.violations.map(v => v.description).join('; ')}`,
        steps: [],
        totalDurationMs: Date.now() - startTime,
        tokensUsed: 0,
      };
    }

    // Recall relevant memory
    const memories = await intelligencePlane.recall(task.description, 'agent-' + this.agentId);
    const memoryContext = memories.map((m: any) => m.content).join('\n');

    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `${this.config.systemPrompt}

Available tools:
${Array.from(this.tools.values()).map(t => `- ${t.name}: ${t.description}`).join('\n')}

Memory context:
${memoryContext || 'No prior context'}

Respond with JSON only:
Thinking: { "thought": "...", "action": "tool_name", "action_input": {...} }
Done: { "thought": "...", "final_answer": "..." }`,
      },
      { role: 'user', content: `Task: ${task.description}\nInput: ${JSON.stringify(task.input)}` },
    ];

    for (let step = 1; step <= maxSteps; step++) {
      const stepStart = Date.now();
      const response = await intelligencePlane.chat({
        messages,
        temperature: this.config.temperature ?? 0,
        maxTokens: 2048,
      });
      totalTokens += response.usage.totalTokens;

      let parsed: any;
      try {
        parsed = JSON.parse(response.content);
      } catch {
        parsed = { thought: response.content, final_answer: response.content };
      }

      if (parsed.final_answer !== undefined) {
        steps.push({
          stepNumber: step,
          thought: parsed.thought,
          durationMs: Date.now() - stepStart,
          requiresApproval: false,
          approved: true,
        });

        // Store outcome in memory
        await intelligencePlane.remember({
          userId: 'agent-' + this.agentId,
          type: 'episodic',
          content: `Task "${task.description}" → ${parsed.final_answer}`,
          importance: 0.6,
          tags: [this.agentType, task.type],
        });

        return {
          taskId: task.id,
          agentId: this.agentId,
          status: 'completed',
          output: { result: parsed.final_answer },
          steps,
          totalDurationMs: Date.now() - startTime,
          tokensUsed: totalTokens,
        };
      }

      const toolName = parsed.action as string;
      const needsApproval = this.config.requiresApprovalFor?.includes(toolName) || task.requiresApproval;

      const agentStep: AgentStep = {
        stepNumber: step,
        thought: parsed.thought,
        action: toolName,
        actionInput: parsed.action_input,
        durationMs: 0,
        requiresApproval: needsApproval,
      };

      if (needsApproval && process.env.AGENT_HUMAN_APPROVAL_REQUIRED === 'true') {
        steps.push({ ...agentStep, durationMs: Date.now() - stepStart });
        await coordinationPlane.requestApproval({
          requestId: randomUUID(),
          requestedBy: this.agentId,
          action: `${this.agentType} agent: ${toolName}`,
          context: { taskId: task.id, step, action: toolName, input: parsed.action_input },
          approvers: [],
          expiresAt: new Date(Date.now() + Number(process.env.AGENT_APPROVAL_TIMEOUT_MS || 86400000)),
          urgency: task.priority === 'urgent' ? 'high' : 'medium',
        });
        return {
          taskId: task.id,
          agentId: this.agentId,
          status: 'awaiting_approval',
          steps,
          totalDurationMs: Date.now() - startTime,
          tokensUsed: totalTokens,
        };
      }

      // Execute the tool
      let observation: string;
      const tool = this.tools.get(toolName);
      if (!tool) {
        observation = `Error: tool '${toolName}' not found. Available: ${Array.from(this.tools.keys()).join(', ')}`;
      } else {
        try {
          const result = await tool.execute(parsed.action_input ?? {});
          observation = typeof result === 'string' ? result : JSON.stringify(result);
        } catch (err) {
          observation = `Tool error: ${(err as Error).message}`;
        }
      }

      agentStep.observation = observation;
      agentStep.durationMs = Date.now() - stepStart;
      steps.push(agentStep);

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: `Observation: ${observation}` });
    }

    return {
      taskId: task.id,
      agentId: this.agentId,
      status: 'failed',
      error: `Max steps (${maxSteps}) exhausted`,
      steps,
      totalDurationMs: Date.now() - startTime,
      tokensUsed: totalTokens,
    };
  }
}
