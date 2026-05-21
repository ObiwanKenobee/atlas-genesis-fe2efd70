# Atlas Sanctum Anti-Manipulation Engine

A defensive intelligence layer that detects gaming, deception, collusion, fraud, narrative distortion, and institutional sabotage across finance, governance, supply chains, and public systems.

## Overview

The Anti-Manipulation Engine is a real-time risk intelligence system that detects collusion, deception, and system gaming before they become institutional failure. It answers five critical questions continuously:

1. **Who is trying to game the system?**
2. **How are they doing it?**
3. **What damage could it cause if ignored?**
4. **What is the confidence level of the signal?**
5. **What intervention creates the least harm and highest containment?**

## Architecture

### Detection Classes

The engine detects five classes of manipulation:

#### A. Transaction Manipulation
- Wash activity
- Circular payments
- Invoice padding
- Ghost vendors
- Split payments to avoid thresholds
- Procurement irregularities
- Timing anomalies
- Treasury leakage

#### B. Identity Manipulation
- Synthetic identities
- Duplicate beneficiaries
- Role spoofing
- Unauthorized delegation
- Shell entity coordination
- Insider access abuse

#### C. Governance Manipulation
- Voting collusion
- Policy tampering
- Suspicious approval chains
- Silent override patterns
- Unusual last-minute changes
- Concentration of decision power

#### D. Information Manipulation
- Falsified reports
- Metric inflation
- Selective omission
- Coordinated narrative campaigns
- Dashboard poisoning
- Source inconsistency

#### E. Ecosystem Manipulation
- Cartel-like supplier behavior
- Regional collusion networks
- Market cornering
- Multi-actor coordinated extraction
- Subsidy farming
- Impact washing

## Core Modules

### 1. Event Ingestion Service
**File:** `services/antiManipulation/eventIngestionService.ts`

Ingests operational events from various source systems (ERP, procurement, finance, etc.).

**Key Functions:**
- `ingestEvent()` - Ingest single event
- `ingestEventBatch()` - Ingest multiple events
- `getEventsByEntity()` - Retrieve events for an entity
- `getEventStats()` - Get ingestion statistics

### 2. Entity Resolution Engine
**File:** `services/antiManipulation/entityResolutionService.ts`

Resolves when different records refer to the same actor using exact + fuzzy matching, graph linkage, and probabilistic identity resolution.

**Key Functions:**
- `upsertEntity()` - Create or update entity
- `createEntityLink()` - Create relationship between entities
- `findEntitiesBySharedAttribute()` - Find entities sharing attributes
- `resolveDuplicates()` - Find potential duplicate entities
- `getEntityNetwork()` - Get connected entities

### 3. Rules and Policy Engine
**File:** `services/antiManipulation/rulesEngine.ts`

Deterministic layer for catching known manipulation patterns fast.

**Default Rules:**
- Invoice Splitting (threshold-based)
- Circular Payments (pattern-based)
- Ghost Vendor (policy-based)
- Shared Bank Account (threshold-based)
- Synthetic Identity (pattern-based)
- Approval Clustering (threshold-based)
- Last-Minute Changes (sequence-based)
- Metric Inflation (threshold-based)
- Sensor Contradiction (pattern-based)
- Vendor Collusion (pattern-based)

**Key Functions:**
- `evaluateEvent()` - Evaluate event against all rules
- `getEnabledRules()` - Get active rules
- `upsertRule()` - Create or update rule
- `setRuleEnabled()` - Enable/disable rule

### 4. Anomaly Detection Service
**File:** `services/antiManipulation/anomalyDetectionService.ts`

Probabilistic layer for detecting new or subtle manipulation patterns.

**Detection Methods:**
- Peer deviation detection
- Temporal anomaly detection
- Behavioral drift detection
- Frequency anomaly detection
- Seasonal outlier detection

**Key Functions:**
- `detectAnomalies()` - Run all anomaly detection
- `getAnomalyScores()` - Get scores for entity
- `getHighSeverityAnomalies()` - Get high-risk anomalies

### 5. Graph Risk Engine
**File:** `services/antiManipulation/graphRiskEngine.ts`

Detects collusion and hidden coordination using graph analysis.

**Detection Methods:**
- Collusion cluster detection
- Circular flow detection
- Hidden hub detection
- Nepotism structure detection
- Procurement ring detection

**Key Functions:**
- `analyzeEntityNetwork()` - Analyze entity's network
- `getEntityNetworkForVisualization()` - Get network for UI
- `getGraphRiskScores()` - Get risk scores for entity

### 6. Narrative Consistency Engine
**File:** `services/antiManipulation/narrativeConsistencyEngine.ts`

Compares "what is being said" vs "what reality signals show."

**Analysis Types:**
- Operational claims verification
- Delivery claims verification
- Compliance claims verification
- Impact claims verification
- Financial claims verification
- Missing information detection

**Key Functions:**
- `analyzeNarrativeConsistency()` - Analyze narrative against evidence
- `getNarrativeAnalysis()` - Get analysis by ID
- `getLowConsistencyNarratives()` - Get inconsistent narratives

### 7. Case Scoring and Intervention Engine
**File:** `services/antiManipulation/caseScoringEngine.ts`

Turns noisy signals into action with composite risk scoring.

**Risk Score Formula:**
```
Overall Risk Score =
0.25 * Rule Severity
+ 0.20 * Statistical Anomaly Score
+ 0.25 * Graph Collusion Score
+ 0.15 * Narrative Contradiction Score
+ 0.10 * Access Abuse Score
+ 0.05 * Historical Recurrence Score
```

**Intervention Levels:**
- **Level 0:** Observe (log signal, no disruption)
- **Level 1:** Soft flag (notify analyst, add to watchlist)
- **Level 2:** Friction (require second approver, enhanced verification)
- **Level 3:** Containment (pause disbursement, lock procurement)
- **Level 4:** Escalation (open investigation, notify compliance)
- **Level 5:** Automated enforcement (smart contract deny, vendor blocklist)

**Key Functions:**
- `calculateRiskScore()` - Calculate composite risk score
- `createCase()` - Create investigation case
- `determineIntervention()` - Determine appropriate intervention
- `createIntervention()` - Create intervention action
- `executeIntervention()` - Execute pending intervention

## API Endpoints

### Event Ingestion
- `POST /v1/events` - Ingest single event
- `POST /v1/events/batch` - Ingest multiple events
- `GET /v1/events/:id` - Get event by ID
- `GET /v1/events/entity/:entityId` - Get events for entity
- `GET /v1/events/stats` - Get event statistics

### Entity Management
- `POST /v1/entities/upsert` - Create or update entity
- `GET /v1/entities/:id` - Get entity by ID
- `GET /v1/entities/type/:type` - Get entities by type
- `GET /v1/entities/search` - Search entities
- `POST /v1/entities/:id/links` - Create entity link
- `GET /v1/entities/:id/links` - Get entity links
- `GET /v1/entities/:id/network` - Get entity network
- `GET /v1/entities/stats` - Get entity statistics

### Detection
- `POST /v1/detect/run` - Run detection on demand

### Rules
- `GET /v1/rules` - Get all rules
- `GET /v1/rules/enabled` - Get enabled rules
- `GET /v1/rules/:id` - Get rule by ID
- `PUT /v1/rules/:id` - Update rule
- `POST /v1/rules/:id/enable` - Enable/disable rule
- `GET /v1/rules/stats` - Get rule statistics

### Anomalies
- `GET /v1/anomalies/entity/:entityId` - Get anomalies for entity
- `GET /v1/anomalies/stats` - Get anomaly statistics

### Graph Risk
- `GET /v1/graph-risk/entity/:entityId` - Get graph risks for entity
- `GET /v1/graph-risk/stats` - Get graph risk statistics

### Narrative Analysis
- `POST /v1/narratives/analyze` - Analyze narrative consistency
- `GET /v1/narratives/:id` - Get analysis by ID
- `GET /v1/narratives/document/:documentId` - Get analyses for document
- `GET /v1/narratives/stats` - Get narrative statistics

### Cases
- `POST /v1/cases` - Create case
- `GET /v1/cases` - Get all cases
- `GET /v1/cases/:id` - Get case by ID
- `PUT /v1/cases/:id/status` - Update case status
- `POST /v1/cases/:id/assign` - Assign case
- `GET /v1/cases/stats` - Get case statistics

### Interventions
- `POST /v1/interventions` - Create intervention
- `GET /v1/interventions/:id` - Get intervention by ID
- `GET /v1/interventions/case/:caseId` - Get interventions for case
- `POST /v1/interventions/:id/execute` - Execute intervention
- `GET /v1/interventions/stats` - Get intervention statistics

## Database Schema

### Core Tables

**entities** - Core actors in the system
```sql
CREATE TABLE entities (
    id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    name VARCHAR(500) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}',
    risk_score INTEGER DEFAULT 0,
    watch_status VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**entity_links** - Relationships between entities
```sql
CREATE TABLE entity_links (
    id SERIAL PRIMARY KEY,
    from_entity_id VARCHAR(50) NOT NULL REFERENCES entities(id),
    to_entity_id VARCHAR(50) NOT NULL REFERENCES entities(id),
    link_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    confidence DECIMAL(5, 4) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**events** - Operational events from various systems
```sql
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) REFERENCES entities(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    amount DECIMAL(20, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    metadata JSONB NOT NULL DEFAULT '{}',
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**detection_rules** - Configurable rules for known patterns
```sql
CREATE TABLE detection_rules (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    manipulation_class VARCHAR(50) NOT NULL,
    condition JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    weight DECIMAL(5, 4) DEFAULT 0.25,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**alerts** - Detection signals from various engines
```sql
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    severity VARCHAR(20) NOT NULL,
    entity_id VARCHAR(50) NOT NULL REFERENCES entities(id),
    signal_sources JSONB NOT NULL DEFAULT '[]',
    explanation JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'open',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**cases** - Investigation cases promoted from alerts
```sql
CREATE TABLE cases (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    entity_ids JSONB NOT NULL DEFAULT '[]',
    alert_ids JSONB NOT NULL DEFAULT '[]',
    risk_score INTEGER NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    risk_factors JSONB NOT NULL DEFAULT '[]',
    recommended_action VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    owner VARCHAR(255),
    evidence_bundle_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**interventions** - Actions taken in response to cases
```sql
CREATE TABLE interventions (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) NOT NULL REFERENCES cases(id),
    action_type VARCHAR(50) NOT NULL,
    action_level INTEGER NOT NULL,
    reason TEXT NOT NULL,
    executed_by VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Ingest an Event
```typescript
import { ingestEvent } from './services/antiManipulation';

const event = ingestEvent({
  eventType: 'invoice_submitted',
  sourceSystem: 'procurement_erp',
  timestamp: '2026-03-22T12:00:00Z',
  entityRefs: ['vendor_123'],
  payload: {
    invoice_number: 'INV-8832',
    amount: 9800,
    currency: 'USD',
    submitted_by: 'user_44'
  }
});
```

### Create an Entity
```typescript
import { upsertEntity } from './services/antiManipulation';

const entity = upsertEntity({
  entityType: 'vendor',
  externalId: 'ERP-V-882',
  attributes: {
    name: 'Alpha Supply Ltd',
    address: 'Nairobi',
    phone: '+254700123456',
    bank_account_hash: 'abc123'
  }
});
```

### Run Detection
```typescript
import { 
  evaluateEvent,
  detectAnomalies,
  analyzeEntityNetwork,
  calculateRiskScore 
} from './services/antiManipulation';

// Run rule engine
const ruleAlerts = evaluateEvent(event, entity, relatedEvents);

// Run anomaly detection
const anomalyScores = detectAnomalies(entityId, events, entity);
const avgAnomalyScore = anomalyScores.reduce((a, b) => a + b.score, 0) / anomalyScores.length;

// Run graph analysis
const graphScores = analyzeEntityNetwork(entityId, entities, links);
const avgGraphScore = graphScores.reduce((a, b) => a + b.score, 0) / graphScores.length;

// Calculate composite risk score
const riskScore = calculateRiskScore(
  ruleAlerts,
  avgAnomalyScore,
  avgGraphScore,
  0 // narrative score
);
```

### Create a Case
```typescript
import { createCase, calculateRiskScore } from './services/antiManipulation';

const riskScoreResult = calculateRiskScore(ruleAlerts, anomalyScore, graphRiskScore, 0);

const newCase = createCase(
  'Suspicious Procurement Ring - Alpha Supply Ltd',
  'Multiple indicators suggest coordinated manipulation',
  ['vendor_001', 'vendor_002', 'person_001'],
  ['alert_001', 'alert_002'],
  riskScoreResult,
  'high'
);
```

### Create and Execute Intervention
```typescript
import { 
  createIntervention, 
  executeIntervention,
  determineIntervention 
} from './services/antiManipulation';

// Determine appropriate intervention
const intervention = determineIntervention(caseData.riskScore, caseData.confidence);

// Create intervention
const newIntervention = createIntervention(
  caseId,
  intervention.action,
  intervention.level,
  intervention.reason
);

// Execute intervention
const executed = executeIntervention(newIntervention.id, 'user_123');
```

## Detection Logic Stack

The engine uses a layered decision approach:

1. **Layer 1: Rule Hit** - Fast and explainable
2. **Layer 2: Statistical Anomaly** - Is this behavior abnormal?
3. **Layer 3: Graph Suspicion** - Is this event part of a suspicious network?
4. **Layer 4: Narrative Contradiction** - Do text claims conflict with evidence?
5. **Layer 5: Risk Fusion** - Combine all signals into one case score
6. **Layer 6: Intervention Selection** - Choose least destructive action

## Explainability

Every score answers:
- What triggered it
- What evidence supports it
- What model contributed
- What uncertainty exists
- What should happen next

## Best Practices

1. **Start with Rules** - Rules are interpretable and regulator-friendly
2. **Layer Detection** - Use rules for known patterns, anomaly detection for new ones
3. **Graph Analysis** - Graph intelligence catches collusion that individual analysis misses
4. **Narrative Verification** - Always verify claims against operational evidence
5. **Graduated Interventions** - Start with observation, escalate only when necessary
6. **Audit Everything** - Maintain immutable audit trails for all actions

## Future Enhancements

- [ ] Machine learning models for fraud classification
- [ ] Real-time streaming with Kafka integration
- [ ] Neo4j graph database for production
- [ ] Advanced NLP for narrative analysis
- [ ] Smart contract integration for automated enforcement
- [ ] Dashboard UI with React components
- [ ] Mobile alerts and notifications
- [ ] Integration with external fraud databases
- [ ] Multi-tenant support
- [ ] API rate limiting and authentication

## License

Part of Atlas Sanctum - Humanitarian Intelligence Platform
