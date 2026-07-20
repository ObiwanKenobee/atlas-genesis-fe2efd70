/**
 * Atlas Sanctum — Domain Event Catalog
 *
 * This is the authoritative list of all domain events published on the
 * internal event bus. Every event type used in publish() or subscribe()
 * MUST be declared here.
 *
 * Naming convention: {context}.{entity}.{past-tense-verb}
 *
 * Schema versioning: increment schemaVersion when adding required fields.
 * Never remove or rename fields — add new optional fields instead.
 * Breaking changes require a new event type.
 */

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface DomainEvent<T = Record<string, unknown>> {
  /** Unique event ID (UUID v4) */
  id: string;
  /** Event type — matches a key in EventTypes */
  type: EventType;
  /** Schema version for forward-compatible consumers */
  schemaVersion: number;
  /** ISO 8601 timestamp */
  occurredAt: string;
  /** Correlation ID for distributed tracing */
  correlationId: string;
  /** Bounded context that published this event */
  source: BoundedContext;
  /** Event payload */
  payload: T;
}

// ─── Bounded Contexts ─────────────────────────────────────────────────────────

export type BoundedContext =
  | 'identity'
  | 'marketplace'
  | 'intelligence'
  | 'governance'
  | 'finance'
  | 'measurement'
  | 'knowledge'
  | 'notifications';

// ─── Event Type Registry ──────────────────────────────────────────────────────

export const EventTypes = {
  // Identity
  IDENTITY_USER_REGISTERED:    'identity.user.registered',
  IDENTITY_USER_VERIFIED:      'identity.user.verified',
  IDENTITY_USER_MFA_ENABLED:   'identity.user.mfa_enabled',
  IDENTITY_USER_LOCKED:        'identity.user.locked',
  IDENTITY_ORG_CREATED:        'identity.org.created',
  IDENTITY_DID_ANCHORED:       'identity.did.anchored',
  IDENTITY_API_KEY_CREATED:    'identity.api_key.created',
  IDENTITY_API_KEY_REVOKED:    'identity.api_key.revoked',

  // Marketplace
  MARKETPLACE_PROJECT_SUBMITTED: 'marketplace.project.submitted',
  MARKETPLACE_PROJECT_VERIFIED:  'marketplace.project.verified',
  MARKETPLACE_PROJECT_REJECTED:  'marketplace.project.rejected',
  MARKETPLACE_CREDIT_ISSUED:     'marketplace.credit.issued',
  MARKETPLACE_CREDIT_RETIRED:    'marketplace.credit.retired',
  MARKETPLACE_TRANSACTION_COMPLETED: 'marketplace.transaction.completed',

  // Governance
  GOVERNANCE_PROPOSAL_CREATED:  'governance.proposal.created',
  GOVERNANCE_PROPOSAL_PASSED:   'governance.proposal.passed',
  GOVERNANCE_PROPOSAL_REJECTED: 'governance.proposal.rejected',
  GOVERNANCE_VOTE_CAST:         'governance.vote.cast',
  GOVERNANCE_POLICY_ACTIVATED:  'governance.policy.activated',

  // Finance
  FINANCE_SUBSCRIPTION_STARTED:   'finance.subscription.started',
  FINANCE_SUBSCRIPTION_CANCELLED: 'finance.subscription.cancelled',
  FINANCE_PAYMENT_SUCCEEDED:      'finance.payment.succeeded',
  FINANCE_PAYMENT_FAILED:         'finance.payment.failed',
  FINANCE_INVOICE_GENERATED:      'finance.invoice.generated',

  // Measurement
  MEASUREMENT_OBSERVATION_INGESTED: 'measurement.observation.ingested',
  MEASUREMENT_ANOMALY_DETECTED:     'measurement.anomaly.detected',
  MEASUREMENT_INDICATOR_UPDATED:    'measurement.indicator.updated',

  // Intelligence
  INTELLIGENCE_QUERY_COMPLETED:      'intelligence.query.completed',
  INTELLIGENCE_FORECAST_GENERATED:   'intelligence.forecast.generated',
  INTELLIGENCE_AGENT_RUN_COMPLETED:  'intelligence.agent.run_completed',
  INTELLIGENCE_INJECTION_BLOCKED:    'intelligence.injection.blocked',

  // Notifications
  NOTIFICATIONS_EMAIL_SENT:     'notifications.email.sent',
  NOTIFICATIONS_PUSH_DELIVERED: 'notifications.push.delivered',
  NOTIFICATIONS_WEBHOOK_FIRED:  'notifications.webhook.fired',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

// ─── Typed Payloads ───────────────────────────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

export interface UserVerifiedPayload {
  userId: string;
  verificationType: 'email' | 'phone' | 'kyc';
}

export interface ProjectSubmittedPayload {
  projectId: string;
  submittedBy: string;
  projectType: string;
  estimatedCredits: number;
}

export interface ProjectVerifiedPayload {
  projectId: string;
  verifiedBy: string;
  creditsIssued: number;
  onChainRef: string;
}

export interface CreditIssuedPayload {
  creditId: string;
  projectId: string;
  tonnes: number;
  vintage: number;
  onChainRef: string;
  issuedTo: string;
}

export interface CreditRetiredPayload {
  creditId: string;
  retiredBy: string;
  tonnes: number;
  retirementCertificateId: string;
  onChainRef: string;
}

export interface PaymentSucceededPayload {
  paymentId: string;
  userId: string;
  amountCents: number;
  currency: string;
  provider: 'stripe' | 'paypal' | 'paystack' | 'crypto';
  metadata: Record<string, unknown>;
}

export interface ObservationIngestedPayload {
  observationId: string;
  sourceId: string;
  indicator: string;
  value: number;
  unit: string;
  location?: { lat: number; lng: number };
  observedAt: string;
}

export interface AnomalyDetectedPayload {
  anomalyId: string;
  indicator: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedValue: number;
  expectedRange: { min: number; max: number };
  location?: { lat: number; lng: number };
}

export interface AgentRunCompletedPayload {
  runId: string;
  agentId: string;
  agentType: string;
  taskType: string;
  status: 'completed' | 'failed' | 'awaiting_approval' | 'cancelled';
  tokensUsed: number;
  durationMs: number;
  correlationId: string;
}

export interface InjectionBlockedPayload {
  requestId: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  patterns: string[];
  input: string; // truncated, PII-stripped
}

export interface GovernanceProposalCreatedPayload {
  proposalId: string;
  title: string;
  proposedBy: string;
  votingEndsAt: string;
  onChainRef?: string;
}

export interface GovernanceVoteCastPayload {
  proposalId: string;
  voterId: string;
  vote: 'yes' | 'no' | 'abstain';
  weight: number;
  onChainRef?: string;
}
