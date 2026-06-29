/**
 * Atlas Sanctum — Coordination Plane
 * Purpose: DAO Governance, Quadratic Voting, Workflow Orchestration,
 *          Multi-Agent Delegation, Human Approval Gates, Notifications
 */

import { randomUUID } from 'crypto';
import type {
  CoordinationPlane,
  ProposalRequest,
  Proposal,
  VoteRequest,
  VoteResult,
  VoteTally,
  ExecutionResult,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStatus,
  NotificationRequest,
  BroadcastEvent,
  DelegationRequest,
  DelegationResult,
  ApprovalRequest,
  ApprovalToken,
} from '../types';
import { logger } from '../../utils/logger';

export class CoordinationPlaneService implements CoordinationPlane {
  readonly id = 'coordination' as const;

  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly redis: any,
    private readonly io: any // Socket.io instance
  ) {}

  // ── DAO Governance ─────────────────────────────────────────────────────────

  async createProposal(request: ProposalRequest): Promise<Proposal> {
    const id = randomUUID();
    const endsAt = new Date(Date.now() + request.votingPeriodHours * 3600_000);

    await this.dbQuery(
      `INSERT INTO governance_proposals
         (id, title, description, proposer_id, tenant_id, type, payload,
          quorum_pct, supermajority_pct, status, ends_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10,NOW())`,
      [
        id, request.title, request.description, request.proposerId,
        request.tenantId, request.type, JSON.stringify(request.payload),
        request.quorumPct, request.supermajorityPct ?? 50, endsAt,
      ]
    );

    await this.redis.setex(
      `sanctum:proposal:${id}`,
      request.votingPeriodHours * 3600,
      JSON.stringify({ id, status: 'active', votesFor: 0, votesAgainst: 0, votesAbstain: 0 })
    );

    logger.info('[CoordinationPlane] Proposal created', { id, type: request.type });

    return {
      id,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      endsAt,
    };
  }

  async castVote(vote: VoteRequest): Promise<VoteResult> {
    // Idempotency — prevent double voting
    const voteKey = `sanctum:vote:${vote.proposalId}:${vote.voterId}`;
    const alreadyVoted = await this.redis.exists(voteKey);
    if (alreadyVoted) throw new Error('Voter has already voted on this proposal');

    const voteId = randomUUID();
    // Quadratic voting: weight = sqrt(tokens) if weight provided, else 1
    const weight = vote.weight ? Math.sqrt(vote.weight) : 1;

    await this.dbQuery(
      `INSERT INTO governance_votes (id, proposal_id, voter_id, choice, weight, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [voteId, vote.proposalId, vote.voterId, vote.choice, weight, vote.reason || null]
    );

    // Update running tally in Redis (atomic)
    const field = `votes_${vote.choice}`;
    await this.redis.hincrbyfloat(`sanctum:tally:${vote.proposalId}`, field, weight);
    await this.redis.setex(voteKey, 30 * 24 * 3600, '1');

    logger.info('[CoordinationPlane] Vote recorded', { voteId, proposalId: vote.proposalId });
    return { voteId, recorded: true, weight };
  }

  async tallyVotes(proposalId: string): Promise<VoteTally> {
    const tally = await this.redis.hgetall(`sanctum:tally:${proposalId}`);

    const votesFor = parseFloat(tally?.votes_for ?? '0');
    const votesAgainst = parseFloat(tally?.votes_against ?? '0');
    const votesAbstain = parseFloat(tally?.votes_abstain ?? '0');
    const total = votesFor + votesAgainst + votesAbstain;

    const proposal = await this.dbQuery(
      'SELECT quorum_pct, supermajority_pct FROM governance_proposals WHERE id = $1',
      [proposalId]
    );
    const { quorum_pct, supermajority_pct } = proposal.rows[0] ?? { quorum_pct: 51, supermajority_pct: 50 };

    // Total eligible voters from tenant
    const eligibleResult = await this.dbQuery(
      `SELECT COUNT(*) AS count FROM users u
       JOIN governance_proposals p ON p.tenant_id = u.tenant_id
       WHERE p.id = $1 AND u.role != 'guest'`,
      [proposalId]
    );
    const eligible = parseInt(eligibleResult.rows[0]?.count ?? '1');
    const turnoutPct = eligible > 0 ? (total / eligible) * 100 : 0;
    const quorumReached = turnoutPct >= quorum_pct;
    const activePct = total > 0 ? (votesFor / total) * 100 : 0;
    const passed = quorumReached && activePct >= supermajority_pct;

    return { proposalId, votesFor, votesAgainst, votesAbstain, quorumReached, passed, turnoutPct };
  }

  async executeProposal(proposalId: string): Promise<ExecutionResult> {
    const tally = await this.tallyVotes(proposalId);
    if (!tally.passed) return { success: false, error: 'Proposal did not pass' };

    await this.dbQuery(
      `UPDATE governance_proposals SET status = 'executed', executed_at = NOW() WHERE id = $1`,
      [proposalId]
    );

    logger.info('[CoordinationPlane] Proposal executed', { proposalId });
    return { success: true };
  }

  // ── Workflow Engine (Temporal-compatible interface) ─────────────────────────

  async startWorkflow(definition: WorkflowDefinition): Promise<WorkflowInstance> {
    const instanceId = randomUUID();

    await this.dbQuery(
      `INSERT INTO workflow_instances (id, workflow_name, version, tenant_id, status, definition, started_at)
       VALUES ($1, $2, $3, $4, 'running', $5, NOW())`,
      [instanceId, definition.name, definition.version, definition.tenantId, JSON.stringify(definition)]
    );

    // Push to Temporal if configured, otherwise run inline
    if (process.env.TEMPORAL_HOST) {
      // Production: delegate to Temporal worker
      await this.redis.rpush(`sanctum:workflow:queue:${definition.name}`, JSON.stringify({ instanceId, definition }));
    } else {
      // Dev: simple sequential inline runner
      this.runWorkflowInline(instanceId, definition).catch(err =>
        logger.error('[CoordinationPlane] Inline workflow failed', { instanceId, err })
      );
    }

    return { instanceId, workflowName: definition.name, status: 'running', startedAt: new Date() };
  }

  async getWorkflowStatus(instanceId: string): Promise<WorkflowStatus> {
    const result = await this.dbQuery(
      'SELECT status, current_step, completed_steps, result FROM workflow_instances WHERE id = $1',
      [instanceId]
    );
    if (result.rowCount === 0) throw new Error(`Workflow instance not found: ${instanceId}`);
    const row = result.rows[0];
    return {
      instanceId,
      status: row.status,
      currentStep: row.current_step,
      completedSteps: row.completed_steps ?? [],
      result: row.result,
    };
  }

  private async runWorkflowInline(instanceId: string, definition: WorkflowDefinition): Promise<void> {
    const completedSteps: string[] = [];
    for (const step of definition.steps) {
      await this.dbQuery(
        'UPDATE workflow_instances SET current_step = $1 WHERE id = $2',
        [step.id, instanceId]
      );
      await new Promise(r => setTimeout(r, 100)); // Simulate work
      completedSteps.push(step.id);
    }
    await this.dbQuery(
      `UPDATE workflow_instances SET status = 'completed', completed_steps = $1, completed_at = NOW() WHERE id = $2`,
      [JSON.stringify(completedSteps), instanceId]
    );
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async sendNotification(notification: NotificationRequest): Promise<void> {
    // Dispatch to each channel asynchronously
    const tasks: Promise<void>[] = [];

    for (const channel of notification.channels) {
      switch (channel) {
        case 'websocket':
          tasks.push(this.sendWebSocketNotification(notification));
          break;
        case 'email':
          tasks.push(this.queueEmailNotification(notification));
          break;
        case 'push':
          tasks.push(this.queuePushNotification(notification));
          break;
        default:
          logger.debug('[CoordinationPlane] Notification channel not yet wired', { channel });
      }
    }

    await Promise.allSettled(tasks);
  }

  private async sendWebSocketNotification(notification: NotificationRequest): Promise<void> {
    if (!this.io) return;
    for (const userId of notification.recipientIds) {
      this.io.to(`user:${userId}`).emit('notification', {
        title: notification.title,
        body: notification.body,
        priority: notification.priority,
        data: notification.data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async queueEmailNotification(notification: NotificationRequest): Promise<void> {
    await this.redis.rpush('sanctum:queue:email', JSON.stringify({
      to: notification.recipientIds,
      subject: notification.title,
      text: notification.body,
      data: notification.data,
      queuedAt: new Date().toISOString(),
    }));
  }

  private async queuePushNotification(notification: NotificationRequest): Promise<void> {
    await this.redis.rpush('sanctum:queue:push', JSON.stringify({
      recipients: notification.recipientIds,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    }));
  }

  async broadcastEvent(event: BroadcastEvent): Promise<void> {
    if (this.io) {
      const room = event.tenantId ? `tenant:${event.tenantId}` : event.channel;
      this.io.to(room).emit(event.event, event.payload);
    }
    await this.redis.publish(`sanctum:broadcast:${event.channel}`, JSON.stringify(event));
  }

  // ── Multi-Agent Delegation ─────────────────────────────────────────────────

  async delegateTask(request: DelegationRequest): Promise<DelegationResult> {
    const delegationId = randomUUID();

    await this.dbQuery(
      `INSERT INTO agent_delegations (id, from_agent_id, to_agent_id, task, rationale, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [delegationId, request.fromAgentId, request.toAgentId, JSON.stringify(request.task), request.rationale]
    );

    // Push task to target agent's queue in Redis
    await this.redis.rpush(
      `sanctum:agent:queue:${request.toAgentId}`,
      JSON.stringify({ delegationId, task: request.task })
    );

    logger.info('[CoordinationPlane] Task delegated', {
      from: request.fromAgentId,
      to: request.toAgentId,
      taskId: request.task.id,
    });

    return {
      delegationId,
      assignedAgentId: request.toAgentId,
      estimatedCompletionMs: 30_000,
    };
  }

  // ── Human Approval Gates ───────────────────────────────────────────────────

  async requestApproval(approval: ApprovalRequest): Promise<ApprovalToken> {
    const tokenId = randomUUID();
    const approvalUrl = `${process.env.FRONTEND_URL}/approvals/${tokenId}`;

    await this.dbQuery(
      `INSERT INTO approval_requests
         (id, request_id, requested_by, action, context, approvers, urgency, status, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,NOW())`,
      [
        tokenId, approval.requestId, approval.requestedBy, approval.action,
        JSON.stringify(approval.context), JSON.stringify(approval.approvers),
        approval.urgency, approval.expiresAt,
      ]
    );

    // Notify approvers via websocket and email
    await this.sendNotification({
      recipientIds: approval.approvers,
      channels: ['websocket', 'email'],
      title: `Action Requires Approval: ${approval.action}`,
      body: `Urgency: ${approval.urgency}. Review at: ${approvalUrl}`,
      priority: approval.urgency === 'critical' ? 'urgent' : 'high',
      data: { approvalUrl, tokenId, requestId: approval.requestId },
    });

    return { tokenId, status: 'pending', approvalUrl };
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _instance: CoordinationPlaneService | null = null;

export async function getCoordinationPlane(
  dbQuery: (sql: string, params: unknown[]) => Promise<any>,
  redis: any,
  io: any
): Promise<CoordinationPlaneService> {
  if (!_instance) {
    _instance = new CoordinationPlaneService(dbQuery, redis, io);
    logger.info('[CoordinationPlane] Initialized');
  }
  return _instance;
}
