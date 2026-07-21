/**
 * Atlas Sanctum — Covenant Registry
 *
 * The central registry for all covenants in the system.
 * Every relationship is a versioned constitutional agreement.
 * Nothing changes without constitutional review.
 *
 * Responsibilities:
 *   - Register, activate, suspend, and terminate covenants
 *   - Verify participant authority before any action
 *   - Track obligation fulfillment
 *   - Emit covenant lifecycle events
 *   - Provide constitutional health metrics
 */

import {
  Covenant, CovenantId, CovenantLayer, ParticipantId,
  ConstitutionVersion, EpochMs, CovenantStatus, AuditRecord, Amendment,
  CovenantResult, CovenantError, covenantOk, covenantErr,
} from './CovenantTypes';

// ─── Covenant Lifecycle Events ────────────────────────────────────────────────

export type CovenantEvent =
  | { type: 'registered';  covenantId: CovenantId; timestamp: EpochMs }
  | { type: 'activated';   covenantId: CovenantId; timestamp: EpochMs }
  | { type: 'suspended';   covenantId: CovenantId; reason: string; timestamp: EpochMs }
  | { type: 'amended';     covenantId: CovenantId; amendment: Amendment; timestamp: EpochMs }
  | { type: 'terminated';  covenantId: CovenantId; reason: string; timestamp: EpochMs }
  | { type: 'audited';     covenantId: CovenantId; record: AuditRecord; timestamp: EpochMs };

export type CovenantEventHandler = (event: CovenantEvent) => void;

// ─── Obligation Tracker ───────────────────────────────────────────────────────

export interface ObligationStatus {
  covenantId: CovenantId;
  participantId: ParticipantId;
  obligation: string;
  fulfilled: boolean;
  dueAt?: EpochMs;
  fulfilledAt?: EpochMs;
  evidence?: string;
}

// ─── Covenant Registry ────────────────────────────────────────────────────────

export class CovenantRegistry {
  private covenants    = new Map<CovenantId, Covenant>();
  private obligations  = new Map<string, ObligationStatus>();  // key: `${covenantId}::${participantId}::${obligation}`
  private eventHandlers: CovenantEventHandler[] = [];

  // ─── Registration ──────────────────────────────────────────────────────────

  register(covenant: Covenant): CovenantResult<Covenant> {
    if (this.covenants.has(covenant.id)) {
      return covenantErr(new CovenantError(
        `Covenant ${covenant.id} already registered`,
        'DUPLICATE_COVENANT', covenant.layer, covenant.id,
      ));
    }
    if (!covenant.purpose.trim()) {
      return covenantErr(new CovenantError(
        'Covenant must declare a purpose',
        'MISSING_PURPOSE', covenant.layer,
      ));
    }
    if (!covenant.participants.length) {
      return covenantErr(new CovenantError(
        'Covenant must have at least one participant',
        'NO_PARTICIPANTS', covenant.layer,
      ));
    }

    this.covenants.set(covenant.id, covenant);
    this.initObligations(covenant);
    this.emit({ type: 'registered', covenantId: covenant.id, timestamp: Date.now() as EpochMs });
    return covenantOk(covenant);
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  activate(id: CovenantId): CovenantResult<Covenant> {
    return this.transition(id, 'active', 'activated');
  }

  suspend(id: CovenantId, reason: string): CovenantResult<Covenant> {
    const result = this.transition(id, 'suspended', 'suspended', reason);
    if (result.ok) this.emit({ type: 'suspended', covenantId: id, reason, timestamp: Date.now() as EpochMs });
    return result;
  }

  terminate(id: CovenantId, reason: string): CovenantResult<Covenant> {
    const result = this.transition(id, 'terminated', 'terminated', reason);
    if (result.ok) this.emit({ type: 'terminated', covenantId: id, reason, timestamp: Date.now() as EpochMs });
    return result;
  }

  // ─── Amendment ─────────────────────────────────────────────────────────────

  amend(id: CovenantId, amendment: Amendment): CovenantResult<Covenant> {
    const covenant = this.covenants.get(id);
    if (!covenant) return covenantErr(new CovenantError('Covenant not found', 'NOT_FOUND', 'justice', id));
    if (covenant.status !== 'active') {
      return covenantErr(new CovenantError('Only active covenants may be amended', 'INVALID_STATE', covenant.layer, id));
    }
    if (!amendment.approvedBy.length) {
      return covenantErr(new CovenantError('Amendment requires at least one approver', 'UNAPPROVED_AMENDMENT', covenant.layer, id));
    }

    const updated: Covenant = {
      ...covenant,
      version: amendment.version,
      amendmentHistory: [...covenant.amendmentHistory, amendment],
      status: 'amended' as CovenantStatus,
    };
    this.covenants.set(id, updated);
    this.emit({ type: 'amended', covenantId: id, amendment, timestamp: Date.now() as EpochMs });
    return covenantOk(updated);
  }

  // ─── Audit ─────────────────────────────────────────────────────────────────

  audit(id: CovenantId, record: AuditRecord): CovenantResult<Covenant> {
    const covenant = this.covenants.get(id);
    if (!covenant) return covenantErr(new CovenantError('Covenant not found', 'NOT_FOUND', 'justice', id));
    const updated: Covenant = {
      ...covenant,
      auditHistory: [...covenant.auditHistory, record],
    };
    this.covenants.set(id, updated);
    this.emit({ type: 'audited', covenantId: id, record, timestamp: Date.now() as EpochMs });
    return covenantOk(updated);
  }

  // ─── Authority Verification ────────────────────────────────────────────────

  hasAuthority(participantId: ParticipantId, permission: string): boolean {
    return [...this.covenants.values()].some(c =>
      c.status === 'active' &&
      c.participants.includes(participantId) &&
      c.permissions.includes(permission),
    );
  }

  getActiveCovenants(participantId: ParticipantId): Covenant[] {
    return [...this.covenants.values()].filter(c =>
      c.status === 'active' && c.participants.includes(participantId),
    );
  }

  // ─── Obligation Tracking ───────────────────────────────────────────────────

  fulfillObligation(covenantId: CovenantId, participantId: ParticipantId, obligation: string, evidence?: string): CovenantResult<ObligationStatus> {
    const key = obligationKey(covenantId, participantId, obligation);
    const status = this.obligations.get(key);
    if (!status) return covenantErr(new CovenantError('Obligation not found', 'NOT_FOUND', 'justice', covenantId));
    const updated: ObligationStatus = { ...status, fulfilled: true, fulfilledAt: Date.now() as EpochMs, evidence };
    this.obligations.set(key, updated);
    return covenantOk(updated);
  }

  getUnfulfilledObligations(participantId: ParticipantId): ObligationStatus[] {
    return [...this.obligations.values()].filter(o => o.participantId === participantId && !o.fulfilled);
  }

  // ─── Health Metrics ────────────────────────────────────────────────────────

  healthReport(): {
    total: number;
    byStatus: Record<CovenantStatus, number>;
    byLayer: Record<CovenantLayer, number>;
    criticalViolations: number;
    obligationFulfillmentRate: number;
  } {
    const all = [...this.covenants.values()];
    const allObs = [...this.obligations.values()];

    const byStatus = {} as Record<CovenantStatus, number>;
    const byLayer  = {} as Record<CovenantLayer, number>;

    all.forEach(c => {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
      byLayer[c.layer]   = (byLayer[c.layer]   ?? 0) + 1;
    });

    const criticalViolations = all.flatMap(c => c.auditHistory)
      .filter(a => a.severity === 'critical' && !a.resolved).length;

    const fulfilled = allObs.filter(o => o.fulfilled).length;
    const obligationFulfillmentRate = allObs.length ? fulfilled / allObs.length : 1;

    return { total: all.length, byStatus, byLayer, criticalViolations, obligationFulfillmentRate };
  }

  get(id: CovenantId): Covenant | undefined {
    return this.covenants.get(id);
  }

  all(): Covenant[] {
    return [...this.covenants.values()];
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(handler: CovenantEventHandler): void {
    this.eventHandlers.push(handler);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private transition(id: CovenantId, status: CovenantStatus, eventType: string, reason?: string): CovenantResult<Covenant> {
    const covenant = this.covenants.get(id);
    if (!covenant) return covenantErr(new CovenantError('Covenant not found', 'NOT_FOUND', 'justice', id));
    const updated = { ...covenant, status };
    this.covenants.set(id, updated);
    return covenantOk(updated);
  }

  private initObligations(covenant: Covenant): void {
    covenant.participants.forEach(participantId => {
      covenant.obligations.forEach(obligation => {
        const key = obligationKey(covenant.id, participantId, obligation);
        this.obligations.set(key, {
          covenantId: covenant.id,
          participantId,
          obligation,
          fulfilled: false,
        });
      });
    });
  }

  private emit(event: CovenantEvent): void {
    this.eventHandlers.forEach(h => h(event));
  }
}

function obligationKey(covenantId: CovenantId, participantId: ParticipantId, obligation: string): string {
  return `${covenantId}::${participantId}::${obligation}`;
}
