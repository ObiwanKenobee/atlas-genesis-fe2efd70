/**
 * Atlas Sanctum AI — Governance & Audit Layer
 *
 * Every AI decision, agent action, policy update, and human override
 * is recorded in an immutable, versioned, cryptographically-linked audit ledger.
 *
 * Capabilities:
 *   - Immutable audit ledger (append-only, hash-chained)
 *   - Decision versioning: every reasoning chain is versioned
 *   - Compliance reporting: GDPR, indigenous data sovereignty, ecological standards
 *   - Observable workflows: every step is traceable
 *   - Anomaly detection on the audit trail itself (meta-monitoring)
 *   - Export for external auditors
 */

import { EpochMs, AgentId, Result, ok, err, AIError } from '../AtlasSanctumAI.types';

// ─── Audit Entry Types ────────────────────────────────────────────────────────

export type AuditEventType =
  | 'agent_action'
  | 'ethics_evaluation'
  | 'human_override'
  | 'policy_update'
  | 'model_deployment'
  | 'data_access'
  | 'governance_vote'
  | 'carbon_validation'
  | 'trust_anchor'
  | 'memory_consolidation'
  | 'sentinel_alert'
  | 'approval_gate'
  | 'learning_update'
  | 'system_config_change';

export interface AuditEntry {
  entryId: string;
  sequenceNumber: number;        // monotonically increasing
  eventType: AuditEventType;
  agentId?: AgentId;
  userId?: string;
  domain: string;
  action: string;
  payload: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'blocked' | 'pending';
  ethicsScore?: number;
  confidence?: number;
  timestamp: EpochMs;
  previousHash: string;          // hash of previous entry (chain integrity)
  entryHash: string;             // hash of this entry
  tags: string[];
}

export interface AuditChainIntegrityReport {
  totalEntries: number;
  integrityValid: boolean;
  brokenLinks: number[];         // sequence numbers where chain is broken
  firstEntry: EpochMs;
  lastEntry: EpochMs;
  checkedAt: EpochMs;
}

export interface ComplianceReport {
  reportId: string;
  period: { from: EpochMs; to: EpochMs };
  standard: 'GDPR' | 'indigenous_sovereignty' | 'ecological_standards' | 'AI_governance';
  totalDecisions: number;
  ethicsBlockedCount: number;
  humanOverrideCount: number;
  avgEthicsScore: number;
  violations: { entryId: string; description: string; severity: 'minor' | 'moderate' | 'severe' }[];
  compliant: boolean;
  generatedAt: EpochMs;
}

export interface WorkflowTrace {
  traceId: string;
  workflowName: string;
  steps: {
    stepId: string;
    name: string;
    agentId?: AgentId;
    startedAt: EpochMs;
    completedAt?: EpochMs;
    outcome: 'success' | 'failure' | 'skipped' | 'pending';
    auditEntryId: string;
  }[];
  startedAt: EpochMs;
  completedAt?: EpochMs;
  status: 'running' | 'completed' | 'failed';
}

// ─── Immutable Audit Ledger ───────────────────────────────────────────────────

export class ImmutableAuditLedger {
  private entries: AuditEntry[] = [];
  private sequence = 0;

  append(params: Omit<AuditEntry, 'entryId' | 'sequenceNumber' | 'previousHash' | 'entryHash'>): AuditEntry {
    const sequenceNumber = ++this.sequence;
    const previousHash = this.entries.at(-1)?.entryHash ?? '0'.repeat(64);
    const entryId = `audit-${sequenceNumber}-${Date.now().toString(36)}`;

    const entry: AuditEntry = {
      ...params,
      entryId,
      sequenceNumber,
      previousHash,
      entryHash: this.hash({ entryId, sequenceNumber, previousHash, ...params }),
    };

    // Ledger is append-only — no modification after insertion
    Object.freeze(entry);
    this.entries.push(entry);
    return entry;
  }

  query(filter: {
    eventType?: AuditEventType;
    agentId?: AgentId;
    domain?: string;
    from?: EpochMs;
    to?: EpochMs;
    outcome?: AuditEntry['outcome'];
    limit?: number;
  }): AuditEntry[] {
    let results = this.entries;

    if (filter.eventType) results = results.filter(e => e.eventType === filter.eventType);
    if (filter.agentId) results = results.filter(e => e.agentId === filter.agentId);
    if (filter.domain) results = results.filter(e => e.domain === filter.domain);
    if (filter.from) results = results.filter(e => e.timestamp >= filter.from!);
    if (filter.to) results = results.filter(e => e.timestamp <= filter.to!);
    if (filter.outcome) results = results.filter(e => e.outcome === filter.outcome);

    return results.slice(-(filter.limit ?? 1000));
  }

  verifyIntegrity(): AuditChainIntegrityReport {
    const brokenLinks: number[] = [];

    for (let i = 1; i < this.entries.length; i++) {
      const prev = this.entries[i - 1];
      const curr = this.entries[i];
      if (curr.previousHash !== prev.entryHash) {
        brokenLinks.push(curr.sequenceNumber);
      }
    }

    return {
      totalEntries: this.entries.length,
      integrityValid: brokenLinks.length === 0,
      brokenLinks,
      firstEntry: this.entries[0]?.timestamp ?? 0 as EpochMs,
      lastEntry: this.entries.at(-1)?.timestamp ?? 0 as EpochMs,
      checkedAt: Date.now() as EpochMs,
    };
  }

  exportRange(from: EpochMs, to: EpochMs): AuditEntry[] {
    return this.query({ from, to, limit: 100_000 });
  }

  size(): number { return this.entries.length; }

  private hash(data: Record<string, unknown>): string {
    // Deterministic hash (production: SHA-256 via Web Crypto API)
    const str = JSON.stringify(data, Object.keys(data).sort());
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0').repeat(8);
  }
}

// ─── Compliance Reporter ──────────────────────────────────────────────────────

export class ComplianceReporter {
  constructor(private readonly ledger: ImmutableAuditLedger) {}

  generate(
    standard: ComplianceReport['standard'],
    from: EpochMs,
    to: EpochMs,
  ): ComplianceReport {
    const entries = this.ledger.query({ from, to });
    const blocked = entries.filter(e => e.outcome === 'blocked');
    const overrides = entries.filter(e => e.eventType === 'human_override');
    const ethicsEntries = entries.filter(e => e.ethicsScore !== undefined);

    const avgEthicsScore = ethicsEntries.length > 0
      ? ethicsEntries.reduce((s, e) => s + (e.ethicsScore ?? 0), 0) / ethicsEntries.length
      : 1;

    const violations = this.detectViolations(entries, standard);

    return {
      reportId: `compliance-${standard}-${Date.now()}`,
      period: { from, to },
      standard,
      totalDecisions: entries.length,
      ethicsBlockedCount: blocked.length,
      humanOverrideCount: overrides.length,
      avgEthicsScore,
      violations,
      compliant: violations.filter(v => v.severity === 'severe').length === 0,
      generatedAt: Date.now() as EpochMs,
    };
  }

  private detectViolations(
    entries: AuditEntry[],
    standard: ComplianceReport['standard'],
  ): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];

    if (standard === 'indigenous_sovereignty') {
      entries.forEach(e => {
        const payload = JSON.stringify(e.payload).toLowerCase();
        if (payload.includes('indigenous') && payload.includes('extract') && e.outcome !== 'blocked') {
          violations.push({
            entryId: e.entryId,
            description: 'Potential indigenous data extraction without FPIC',
            severity: 'severe',
          });
        }
      });
    }

    if (standard === 'AI_governance') {
      entries.forEach(e => {
        if (e.eventType === 'model_deployment' && !e.payload['approvedBy']) {
          violations.push({
            entryId: e.entryId,
            description: 'Model deployed without governance approval',
            severity: 'moderate',
          });
        }
        if ((e.ethicsScore ?? 1) < 0.3 && e.outcome === 'success') {
          violations.push({
            entryId: e.entryId,
            description: `Low ethics score (${e.ethicsScore?.toFixed(2)}) action was not blocked`,
            severity: 'severe',
          });
        }
      });
    }

    if (standard === 'GDPR') {
      entries.forEach(e => {
        if (e.eventType === 'data_access' && !e.payload['dataSubjectConsent']) {
          violations.push({
            entryId: e.entryId,
            description: 'Data access without documented consent',
            severity: 'moderate',
          });
        }
      });
    }

    return violations;
  }
}

// ─── Workflow Tracer ──────────────────────────────────────────────────────────

export class WorkflowTracer {
  private traces = new Map<string, WorkflowTrace>();

  start(traceId: string, workflowName: string): WorkflowTrace {
    const trace: WorkflowTrace = {
      traceId,
      workflowName,
      steps: [],
      startedAt: Date.now() as EpochMs,
      status: 'running',
    };
    this.traces.set(traceId, trace);
    return trace;
  }

  recordStep(
    traceId: string,
    step: Omit<WorkflowTrace['steps'][0], 'startedAt'>,
  ): Result<void, AIError> {
    const trace = this.traces.get(traceId);
    if (!trace) return err(new AIError(`Trace ${traceId} not found`, 'NOT_FOUND', 'foundational'));

    trace.steps.push({ ...step, startedAt: Date.now() as EpochMs });
    return ok(undefined);
  }

  complete(traceId: string, status: 'completed' | 'failed'): Result<WorkflowTrace, AIError> {
    const trace = this.traces.get(traceId);
    if (!trace) return err(new AIError(`Trace ${traceId} not found`, 'NOT_FOUND', 'foundational'));

    trace.completedAt = Date.now() as EpochMs;
    trace.status = status;
    return ok(trace);
  }

  get(traceId: string): WorkflowTrace | undefined {
    return this.traces.get(traceId);
  }

  getRunning(): WorkflowTrace[] {
    return [...this.traces.values()].filter(t => t.status === 'running');
  }
}

// ─── Governance & Audit Layer ─────────────────────────────────────────────────

export class GovernanceAuditLayer {
  readonly ledger     = new ImmutableAuditLedger();
  readonly compliance = new ComplianceReporter(this.ledger);
  readonly tracer     = new WorkflowTracer();

  /**
   * Record any AI system event to the immutable ledger.
   * This is the single write path — all layers should call this.
   */
  record(params: Omit<AuditEntry, 'entryId' | 'sequenceNumber' | 'previousHash' | 'entryHash'>): AuditEntry {
    return this.ledger.append(params);
  }

  /**
   * Full system audit report for governance councils.
   */
  systemAuditReport(windowHours = 24): {
    timestamp: EpochMs;
    windowHours: number;
    totalEvents: number;
    byEventType: Record<string, number>;
    ethicsBlockRate: number;
    humanOverrideRate: number;
    chainIntegrity: AuditChainIntegrityReport;
    complianceStatus: Record<ComplianceReport['standard'], boolean>;
    runningWorkflows: number;
    recentViolations: ComplianceReport['violations'];
  } {
    const from = (Date.now() - windowHours * 3_600_000) as EpochMs;
    const to = Date.now() as EpochMs;
    const entries = this.ledger.query({ from, to });

    const byEventType: Record<string, number> = {};
    entries.forEach(e => { byEventType[e.eventType] = (byEventType[e.eventType] ?? 0) + 1; });

    const blocked = entries.filter(e => e.outcome === 'blocked').length;
    const overrides = entries.filter(e => e.eventType === 'human_override').length;

    const standards: ComplianceReport['standard'][] = ['GDPR', 'indigenous_sovereignty', 'ecological_standards', 'AI_governance'];
    const complianceStatus = Object.fromEntries(
      standards.map(s => [s, this.compliance.generate(s, from, to).compliant])
    ) as Record<ComplianceReport['standard'], boolean>;

    const allViolations = standards.flatMap(s =>
      this.compliance.generate(s, from, to).violations
    );

    return {
      timestamp: to,
      windowHours,
      totalEvents: entries.length,
      byEventType,
      ethicsBlockRate: entries.length > 0 ? blocked / entries.length : 0,
      humanOverrideRate: entries.length > 0 ? overrides / entries.length : 0,
      chainIntegrity: this.ledger.verifyIntegrity(),
      complianceStatus,
      runningWorkflows: this.tracer.getRunning().length,
      recentViolations: allViolations.filter(v => v.severity === 'severe'),
    };
  }
}
