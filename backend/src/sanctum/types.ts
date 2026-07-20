/**
 * Atlas Sanctum — Civilizational Operating System
 * Core Types: Five Planes, Domain Events, Agent Contracts
 *
 * Architecture: Clean Architecture + DDD + Hexagonal
 * Every public interface is a Port. Implementations are Adapters.
 */

// ═══════════════════════════════════════════════════════════
// DOMAIN PRIMITIVES
// ═══════════════════════════════════════════════════════════

export type PlaneId = 'intelligence' | 'trust' | 'value' | 'coordination' | 'planetary';
export type TenantId = string;
export type UserId = string;
export type AgentId = string;
export type CorrelationId = string;
export type EventId = string;

export interface Timestamp {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AggregateRoot {
  readonly id: string;
  readonly version: number;
  readonly events: DomainEvent[];
}

// ═══════════════════════════════════════════════════════════
// DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════

export interface DomainEvent<T = unknown> {
  readonly id: EventId;
  readonly type: string;
  readonly plane: PlaneId;
  readonly tenantId: TenantId;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly payload: T;
  readonly metadata: EventMetadata;
  readonly occurredAt: Date;
  readonly version: number;
}

export interface EventMetadata {
  readonly correlationId: CorrelationId;
  readonly causationId?: string;
  readonly userId?: UserId;
  readonly agentId?: AgentId;
  readonly source: string;
  readonly schemaVersion: number;
}

// ═══════════════════════════════════════════════════════════
// EVENT BUS PORT (Hexagonal — primary port)
// ═══════════════════════════════════════════════════════════

export interface EventBusPort {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  publishBatch<T>(events: DomainEvent<T>[]): Promise<void>;
  subscribe<T>(
    pattern: EventPattern,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Promise<Subscription>;
  unsubscribe(subscriptionId: string): Promise<void>;
}

export interface EventPattern {
  type?: string | RegExp;
  plane?: PlaneId;
  aggregateType?: string;
}

export interface EventHandler<T = unknown> {
  (event: DomainEvent<T>): Promise<void>;
}

export interface Subscription {
  readonly id: string;
  readonly pattern: EventPattern;
  unsubscribe(): Promise<void>;
}

export interface SubscriptionOptions {
  durable?: boolean;
  retryPolicy?: RetryPolicy;
  deadLetterQueue?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

// ═══════════════════════════════════════════════════════════
// FIVE PLANES — Interface Contracts
// ═══════════════════════════════════════════════════════════

/**
 * INTELLIGENCE PLANE
 * Purpose: AI reasoning, memory, knowledge, agent orchestration
 */
export interface IntelligencePlane {
  readonly id: 'intelligence';
  chat(request: ChatRequest): Promise<ChatResponse>;
  embed(texts: string[]): Promise<number[][]>;
  semanticSearch(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  reason(problem: ReasoningRequest): Promise<ReasoningResponse>;
  plan(goal: string, context: PlanContext): Promise<ExecutionPlan>;
  remember(memory: MemoryEntry): Promise<void>;
  recall(query: string, userId: UserId): Promise<MemoryEntry[]>;
  runAgent(agentId: AgentId, task: AgentTask): Promise<AgentResult>;
  evaluateEthics(content: string, context: EthicsContext): Promise<EthicsEvaluation>;
}

/**
 * TRUST PLANE
 * Purpose: Identity, credentials, blockchain anchoring, ZK proofs
 */
export interface TrustPlane {
  readonly id: 'trust';
  createDID(subject: IdentitySubject): Promise<DecentralizedIdentity>;
  resolveDID(did: string): Promise<DIDDocument>;
  issueCredential(request: CredentialRequest): Promise<VerifiableCredential>;
  verifyCredential(credential: VerifiableCredential): Promise<VerificationResult>;
  anchorOnChain(record: ChainRecord): Promise<ChainAnchor>;
  verifyOnChain(anchor: ChainAnchor): Promise<boolean>;
  generateProof(statement: ProofStatement): Promise<ZKProof>;
  verifyProof(proof: ZKProof, statement: ProofStatement): Promise<boolean>;
  checkZeroTrust(context: ZeroTrustContext): Promise<TrustScore>;
}

/**
 * VALUE PLANE
 * Purpose: Treasury, RIU marketplace, bonds, payments, carbon credits
 */
export interface ValuePlane {
  readonly id: 'value';
  getMarketStats(): Promise<MarketStats>;
  createListing(listing: ListingRequest): Promise<Listing>;
  executeTrade(trade: TradeRequest): Promise<Transaction>;
  mintCredits(request: CreditMintRequest): Promise<CarbonCredit[]>;
  retireCredits(creditIds: string[]): Promise<RetirementCertificate>;
  getTreasuryBalance(tenantId: TenantId): Promise<TreasuryBalance>;
  rebalanceTreasury(tenantId: TenantId): Promise<RebalanceResult>;
  getBondYield(bondId: string): Promise<BondYield>;
  processPayment(payment: PaymentRequest): Promise<PaymentResult>;
}

/**
 * COORDINATION PLANE
 * Purpose: Governance, DAO voting, workflows, notifications, multi-agent collaboration
 */
export interface CoordinationPlane {
  readonly id: 'coordination';
  createProposal(proposal: ProposalRequest): Promise<Proposal>;
  castVote(vote: VoteRequest): Promise<VoteResult>;
  tallyVotes(proposalId: string): Promise<VoteTally>;
  executeProposal(proposalId: string): Promise<ExecutionResult>;
  startWorkflow(definition: WorkflowDefinition): Promise<WorkflowInstance>;
  getWorkflowStatus(instanceId: string): Promise<WorkflowStatus>;
  sendNotification(notification: NotificationRequest): Promise<void>;
  broadcastEvent(event: BroadcastEvent): Promise<void>;
  delegateTask(task: DelegationRequest): Promise<DelegationResult>;
  requestApproval(approval: ApprovalRequest): Promise<ApprovalToken>;
}

/**
 * PLANETARY PLANE
 * Purpose: Satellite data, IoT, climate metrics, ecosystem monitoring, digital twin
 */
export interface PlanetaryPlane {
  readonly id: 'planetary';
  ingestMeasurement(measurement: PlanetaryMeasurement): Promise<void>;
  queryMeasurements(filter: MeasurementFilter): Promise<PlanetaryMeasurement[]>;
  getSatelliteImagery(request: ImageryRequest): Promise<SatelliteImage>;
  computeNDVI(region: GeoBoundingBox, date: Date): Promise<NDVIResult>;
  getCarbonFlux(region: GeoBoundingBox, period: DateRange): Promise<CarbonFluxResult>;
  getBiodiversityIndex(region: GeoBoundingBox): Promise<BiodiversityResult>;
  detectAnomaly(series: TimeSeries): Promise<AnomalyDetectionResult>;
  simulateClimate(scenario: ClimateScenario): Promise<ClimateSimulationResult>;
  getDigitalTwinState(entityId: string): Promise<DigitalTwinState>;
  updateDigitalTwin(entityId: string, update: Partial<DigitalTwinState>): Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// INTELLIGENCE PLANE TYPES
// ═══════════════════════════════════════════════════════════

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  tools?: AITool[];
  userId?: UserId;
  sessionId?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  toolCalls?: ToolCall[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filter?: Record<string, unknown>;
  namespace?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, unknown>;
}

export interface ReasoningRequest {
  question: string;
  context?: string;
  evidence?: string[];
  reasoningDepth?: 'shallow' | 'deep' | 'exhaustive';
}

export interface ReasoningResponse {
  conclusion: string;
  reasoning: ReasoningStep[];
  confidence: number;
  sources: string[];
  uncertainties: string[];
}

export interface ReasoningStep {
  step: number;
  thought: string;
  evidence?: string;
}

export interface PlanContext {
  availableTools: string[];
  constraints: string[];
  timeHorizon?: string;
  resources?: Record<string, unknown>;
}

export interface ExecutionPlan {
  goal: string;
  steps: PlanStep[];
  estimatedDurationMs: number;
  requiredApprovals: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanStep {
  id: string;
  name: string;
  tool: string;
  parameters: Record<string, unknown>;
  dependsOn: string[];
  requiresApproval: boolean;
  estimatedDurationMs: number;
}

export interface MemoryEntry {
  id?: string;
  userId: UserId;
  sessionId?: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  content: string;
  embedding?: number[];
  importance: number; // 0-1
  tags: string[];
  expiresAt?: Date;
}

export interface EthicsContext {
  plane: PlaneId;
  action: string;
  userId?: UserId;
  agentId?: AgentId;
  stakes?: 'low' | 'medium' | 'high' | 'civilizational';
}

export interface EthicsEvaluation {
  passed: boolean;
  score: number; // 0-1
  violations: EthicsViolation[];
  recommendations: string[];
  requiresHumanReview: boolean;
  auditTrail: string;
}

export interface EthicsViolation {
  principle: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  description: string;
}

// ═══════════════════════════════════════════════════════════
// AGENT TYPES
// ═══════════════════════════════════════════════════════════

export type AgentType =
  | 'finance' | 'health' | 'research' | 'investment'
  | 'infrastructure' | 'policy' | 'emergency' | 'education'
  | 'legal' | 'citizen_assistant' | 'executive_assistant'
  | 'climate';

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  input: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deadline?: Date;
  requiresApproval: boolean;
  maxSteps?: number;
  allowedTools: string[];
}

export interface AgentResult {
  taskId: string;
  agentId: AgentId;
  status: 'completed' | 'failed' | 'awaiting_approval' | 'cancelled';
  output?: Record<string, unknown>;
  error?: string;
  steps: AgentStep[];
  totalDurationMs: number;
  tokensUsed: number;
}

export interface AgentStep {
  stepNumber: number;
  thought: string;
  action?: string;
  actionInput?: Record<string, unknown>;
  observation?: string;
  durationMs: number;
  requiresApproval: boolean;
  approved?: boolean;
}

// ═══════════════════════════════════════════════════════════
// TRUST PLANE TYPES
// ═══════════════════════════════════════════════════════════

export interface IdentitySubject {
  type: 'person' | 'organization' | 'device' | 'agent';
  attributes: Record<string, unknown>;
  tenantId: TenantId;
}

export interface DecentralizedIdentity {
  did: string;
  document: DIDDocument;
  privateKeyJwk?: string; // Only returned at creation, never stored
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  created: Date;
  updated: Date;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk: Record<string, unknown>;
}

export interface CredentialRequest {
  issuerId: string;
  subjectDid: string;
  type: string;
  claims: Record<string, unknown>;
  expiresAt?: Date;
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: Record<string, unknown>;
  proof: CredentialProof;
}

export interface CredentialProof {
  type: string;
  created: Date;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface VerificationResult {
  valid: boolean;
  checks: VerificationCheck[];
  errors: string[];
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface ChainRecord {
  type: string;
  contentHash: string;
  metadata: Record<string, unknown>;
  chain: 'ethereum' | 'polygon' | 'cardano' | 'cosmos';
}

export interface ChainAnchor {
  txHash: string;
  chain: string;
  blockNumber: number;
  timestamp: Date;
  contentHash: string;
}

export interface ProofStatement {
  claim: string;
  publicInputs: Record<string, unknown>;
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  verificationKey?: string;
}

export interface ZeroTrustContext {
  userId?: UserId;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  requestedResource: string;
  authMethod: string;
  mfaVerified: boolean;
  lastActivity?: Date;
}

export interface TrustScore {
  score: number; // 0-100
  level: 'untrusted' | 'low' | 'medium' | 'high' | 'verified';
  factors: TrustFactor[];
  accessGranted: boolean;
  sessionDurationMs: number;
  stepUpRequired: boolean;
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number;
  detail: string;
}

// ═══════════════════════════════════════════════════════════
// VALUE PLANE TYPES
// ═══════════════════════════════════════════════════════════

export interface MarketStats {
  totalRiusCirculating: number;
  totalTradingVolumeUsd: number;
  currentPriceUsd: number;
  priceChange24hPct: number;
  activeBuyers: number;
  activeSellers: number;
  liquidityDepthUsd: number;
  lastUpdated: Date;
}

export interface ListingRequest {
  sellerId: UserId;
  tenantId: TenantId;
  quantity: number;
  pricePerUnitUsd: number;
  assetType: 'RIU' | 'carbon_credit' | 'bond' | 'impact_certificate';
  metadata: Record<string, unknown>;
  expiresAt?: Date;
}

export interface Listing {
  id: string;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  sellerId: UserId;
  quantity: number;
  remainingQuantity: number;
  pricePerUnitUsd: number;
  assetType: string;
  createdAt: Date;
}

export interface TradeRequest {
  buyerId: UserId;
  listingId: string;
  quantity: number;
  maxPricePerUnitUsd?: number;
  paymentMethod: 'fiat' | 'crypto' | 'token';
}

export interface Transaction {
  id: string;
  buyerId: UserId;
  sellerId: UserId;
  quantity: number;
  pricePerUnitUsd: number;
  totalUsd: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  chainTxHash?: string;
  completedAt?: Date;
}

export interface CreditMintRequest {
  projectId: string;
  quantity: number;
  verificationData: Record<string, unknown>;
  methodology: string;
  vintage: number;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  serialNumber: string;
  quantity: number;
  vintage: number;
  status: 'active' | 'retired' | 'pending';
  chainTokenId?: string;
}

export interface RetirementCertificate {
  id: string;
  creditIds: string[];
  totalQuantity: number;
  retiredBy: UserId;
  purpose: string;
  ipfsHash: string;
  chainTxHash: string;
}

export interface TreasuryBalance {
  tenantId: TenantId;
  fiatUsd: number;
  cryptoUsdEquivalent: number;
  riuValue: number;
  totalUsd: number;
  reserveRatio: number;
  lastRebalanced: Date;
}

export interface RebalanceResult {
  executedTrades: number;
  newReserveRatio: number;
  costUsd: number;
}

export interface BondYield {
  bondId: string;
  faceValue: number;
  currentYield: number;
  maturityDate: Date;
  couponRate: number;
  rating: string;
}

export interface PaymentRequest {
  userId: UserId;
  amountUsd: number;
  currency: string;
  provider: 'stripe' | 'paystack' | 'coinbase' | 'crypto';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  paymentId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amountUsd: number;
  providerTransactionId?: string;
}

// ═══════════════════════════════════════════════════════════
// COORDINATION PLANE TYPES
// ═══════════════════════════════════════════════════════════

export interface ProposalRequest {
  title: string;
  description: string;
  proposerId: UserId;
  tenantId: TenantId;
  type: 'parameter_change' | 'treasury' | 'policy' | 'emergency' | 'grant';
  payload: Record<string, unknown>;
  votingPeriodHours: number;
  quorumPct: number;
  supermajorityPct?: number;
}

export interface Proposal {
  id: string;
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  endsAt: Date;
  executedAt?: Date;
  chainTxHash?: string;
}

export interface VoteRequest {
  proposalId: string;
  voterId: UserId;
  choice: 'for' | 'against' | 'abstain';
  weight?: number; // Quadratic voting weight
  reason?: string;
}

export interface VoteResult {
  voteId: string;
  recorded: boolean;
  weight: number;
  chainTxHash?: string;
}

export interface VoteTally {
  proposalId: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumReached: boolean;
  passed?: boolean;
  turnoutPct: number;
}

export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  gasUsed?: number;
  error?: string;
}

export interface WorkflowDefinition {
  name: string;
  version: string;
  steps: WorkflowStep[];
  timeout?: number;
  tenantId: TenantId;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'parallel' | 'wait' | 'approval';
  handler: string;
  input?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}

export interface WorkflowInstance {
  instanceId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'suspended';
  startedAt: Date;
}

export interface WorkflowStatus {
  instanceId: string;
  status: string;
  currentStep?: string;
  completedSteps: string[];
  result?: Record<string, unknown>;
}

export interface NotificationRequest {
  recipientIds: UserId[];
  channels: ('email' | 'sms' | 'push' | 'websocket' | 'webhook')[];
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, unknown>;
}

export interface BroadcastEvent {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
  tenantId?: TenantId;
}

export interface DelegationRequest {
  fromAgentId: AgentId;
  toAgentId: AgentId;
  task: AgentTask;
  rationale: string;
}

export interface DelegationResult {
  delegationId: string;
  assignedAgentId: AgentId;
  estimatedCompletionMs: number;
}

export interface ApprovalRequest {
  requestId: string;
  requestedBy: AgentId | UserId;
  action: string;
  context: Record<string, unknown>;
  approvers: UserId[];
  expiresAt: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApprovalToken {
  tokenId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvalUrl: string;
}

// ═══════════════════════════════════════════════════════════
// PLANETARY PLANE TYPES
// ═══════════════════════════════════════════════════════════

export interface PlanetaryMeasurement {
  id?: string;
  projectId: string;
  source: 'satellite' | 'ground_sensor' | 'iot' | 'manual' | 'drone';
  type: 'co2' | 'ndvi' | 'soil_carbon' | 'biodiversity' | 'water' | 'temperature' | 'custom';
  value: number;
  unit: string;
  location: GeoPoint;
  confidence: number; // 0-1
  timestamp: Date;
  rawData?: Record<string, unknown>;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface GeoBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MeasurementFilter {
  projectId?: string;
  type?: string;
  dateRange?: DateRange;
  bounds?: GeoBoundingBox;
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

export interface ImageryRequest {
  bounds: GeoBoundingBox;
  date: Date;
  provider: 'sentinel2' | 'landsat8' | 'planet' | 'maxar';
  bands?: string[];
  resolution?: number;
}

export interface SatelliteImage {
  id: string;
  provider: string;
  capturedAt: Date;
  bounds: GeoBoundingBox;
  bands: Record<string, number[][]>;
  cloudCoveragePct: number;
  downloadUrl?: string;
}

export interface NDVIResult {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  trend: 'improving' | 'degrading' | 'stable';
  pixelMap?: number[][];
}

export interface CarbonFluxResult {
  netFluxTonnesCo2: number;
  sequestrationTonnes: number;
  emissionsTonnes: number;
  uncertainty: number;
  methodology: string;
}

export interface BiodiversityResult {
  shannonIndex: number;
  speciesCount: number;
  endemicSpeciesPct: number;
  threatenedSpeciesPct: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TimeSeries {
  entityId: string;
  metric: string;
  points: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  quality?: number;
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  baselineStats: BaselineStats;
  algorithm: string;
}

export interface Anomaly {
  timestamp: Date;
  value: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'dip' | 'trend_change' | 'missing';
}

export interface BaselineStats {
  mean: number;
  stdDev: number;
  p95: number;
  p5: number;
}

export interface ClimateScenario {
  name: string;
  rcp: '2.6' | '4.5' | '6.0' | '8.5';
  timeHorizonYears: number;
  region: GeoBoundingBox;
  interventions?: ClimateIntervention[];
}

export interface ClimateIntervention {
  type: string;
  magnitude: number;
  startYear: number;
}

export interface ClimateSimulationResult {
  scenario: string;
  temperatureChangeDegC: number;
  precipitationChangePct: number;
  seaLevelRiseMm: number;
  extremeEventFrequencyMultiplier: number;
  confidence: number;
  yearlyProjections: YearlyProjection[];
}

export interface YearlyProjection {
  year: number;
  temperatureDegC: number;
  precipitationMm: number;
  carbonPpmv: number;
}

export interface DigitalTwinState {
  entityId: string;
  entityType: string;
  physicalState: Record<string, unknown>;
  virtualState: Record<string, unknown>;
  lastSyncedAt: Date;
  divergence: number; // 0-1 how much virtual differs from physical
  predictions: DigitalTwinPrediction[];
}

export interface DigitalTwinPrediction {
  metric: string;
  predictedValue: number;
  confidence: number;
  horizon: Date;
}

// ═══════════════════════════════════════════════════════════
// RESULT TYPE (Railway-oriented programming)
// ═══════════════════════════════════════════════════════════

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}
