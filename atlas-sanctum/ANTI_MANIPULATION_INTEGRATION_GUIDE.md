# Atlas Sanctum Anti-Manipulation Engine - Integration Guide

## Quick Start

### 1. Database Setup

Run the migration to create the Anti-Manipulation Engine tables:

```bash
psql -d your_database -f atlas-sanctum/backend/db/migrations/002_anti_manipulation_engine.sql
```

This creates:
- 11 core tables for entities, events, rules, alerts, cases, interventions
- Seed data with demo entities, rules, and cases
- Indexes for performance optimization

### 2. Backend Integration

The Anti-Manipulation Engine services are located in:
```
atlas-sanctum/backend/src/services/antiManipulation/
```

Import services in your code:

```typescript
import {
  ingestEvent,
  upsertEntity,
  evaluateEvent,
  detectAnomalies,
  analyzeEntityNetwork,
  calculateRiskScore,
  createCase,
  createIntervention
} from './services/antiManipulation';
```

### 3. API Routes

Add the Anti-Manipulation routes to your Express app:

```typescript
import antiManipulationRoutes from './routes/antiManipulationRoutes';

app.use('/api', antiManipulationRoutes);
```

This exposes 30+ endpoints under `/api/v1/`.

### 4. Frontend Components

Add the dashboard components to your React app:

```typescript
import ControlTower from './components/antiManipulation/ControlTower';
import InvestigationWorkspace from './components/antiManipulation/InvestigationWorkspace';
import NetworkGraph from './components/antiManipulation/NetworkGraph';
import NarrativeIntegrityDashboard from './components/antiManipulation/NarrativeIntegrityDashboard';
import InterventionConsole from './components/antiManipulation/InterventionConsole';
import AuditLedger from './components/antiManipulation/AuditLedger';
```

## Usage Examples

### Example 1: Ingest and Detect

```typescript
// 1. Create an entity
const vendor = upsertEntity({
  entityType: 'vendor',
  externalId: 'ERP-V-882',
  attributes: {
    name: 'Alpha Supply Ltd',
    address: 'Nairobi',
    phone: '+254700123456'
  }
});

// 2. Ingest events
const event1 = ingestEvent({
  eventType: 'invoice_submitted',
  sourceSystem: 'procurement_erp',
  timestamp: '2026-03-22T12:00:00Z',
  entityRefs: [vendor.id],
  payload: { amount: 9800, invoice_number: 'INV-8832' }
});

const event2 = ingestEvent({
  eventType: 'invoice_submitted',
  sourceSystem: 'procurement_erp',
  timestamp: '2026-03-22T12:05:00Z',
  entityRefs: [vendor.id],
  payload: { amount: 9500, invoice_number: 'INV-8833' }
});

// 3. Run detection
const events = getEventsByEntity(vendor.id);
const ruleAlerts = evaluateEvent(event1, vendor, events);
const anomalyScores = detectAnomalies(vendor.id, events, vendor);

// 4. Calculate risk score
const avgAnomalyScore = anomalyScores.length > 0
  ? anomalyScores.reduce((a, b) => a + b.score, 0) / anomalyScores.length
  : 0;

const riskScoreResult = calculateRiskScore(
  ruleAlerts,
  avgAnomalyScore,
  0, // graph score
  0  // narrative score
);

console.log('Risk Score:', riskScoreResult.overallScore);
console.log('Confidence:', riskScoreResult.confidence);
console.log('Findings:', riskScoreResult.explanation);
```

### Example 2: Create Case and Intervention

```typescript
// 1. Create a case
const newCase = createCase(
  'Suspicious Procurement Ring - Alpha Supply Ltd',
  'Multiple indicators suggest coordinated manipulation',
  [vendor.id],
  ['alert_001', 'alert_002'],
  riskScoreResult,
  'high'
);

// 2. Determine appropriate intervention
const intervention = determineIntervention(
  newCase.riskScore,
  newCase.confidence
);

// 3. Create intervention
const interventionRecord = createIntervention(
  newCase.id,
  intervention.action,
  intervention.level,
  intervention.reason
);

// 4. Execute intervention
const executed = executeIntervention(interventionRecord.id, 'user_123');
console.log('Intervention executed:', executed.status);
```

### Example 3: Analyze Narrative Consistency

```typescript
// 1. Analyze narrative against evidence
const analysis = analyzeNarrativeConsistency(
  'report_77',
  [
    '95% of sensors are operational',
    'No delays in last-mile delivery',
    'All supplies delivered on time'
  ],
  evidenceEvents, // Array of events
  vendor
);

console.log('Consistency Score:', analysis.consistencyScore);
console.log('Contradictions:', analysis.contradictions);
console.log('Omissions:', analysis.omissions);
```

### Example 4: Graph Analysis

```typescript
// 1. Create entity links
createEntityLink(vendor.id, person.id, 'director_of');
createEntityLink(vendor.id, account.id, 'paid_to');
createEntityLink(vendor.id, device.id, 'shares_device');

// 2. Analyze network
const links = getEntityLinks(vendor.id);
const graphScores = analyzeEntityNetwork(
  vendor.id,
  new Map([[vendor.id, vendor]]),
  links
);

console.log('Graph Risk Scores:', graphScores);
```

## API Examples

### Ingest Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "invoice_submitted",
    "sourceSystem": "procurement_erp",
    "timestamp": "2026-03-22T12:00:00Z",
    "entityRefs": ["vendor_123"],
    "payload": {
      "invoice_number": "INV-8832",
      "amount": 9800,
      "currency": "USD"
    }
  }'
```

### Run Detection

```bash
curl -X POST http://localhost:3000/api/v1/detect/run \
  -H "Content-Type: application/json" \
  -d '{
    "scopeType": "entity",
    "scopeId": "vendor_123",
    "includeGraph": true,
    "includeNarrativeChecks": true
  }'
```

### Create Case

```bash
curl -X POST http://localhost:3000/api/v1/cases \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Procurement Ring",
    "description": "Multiple risk signals detected",
    "entityIds": ["vendor_123", "vendor_456"],
    "alertIds": ["alert_001"],
    "priority": "high"
  }'
```

### Execute Intervention

```bash
curl -X POST http://localhost:3000/api/v1/interventions/int_001/execute \
  -H "Content-Type: application/json" \
  -d '{
    "executedBy": "user_123"
  }'
```

## Configuration

### Detection Rules

Rules are stored in the `detection_rules` table. You can:

1. **View existing rules:**
```sql
SELECT * FROM detection_rules WHERE enabled = true;
```

2. **Add custom rule:**
```sql
INSERT INTO detection_rules (id, name, description, rule_type, manipulation_class, condition, severity, weight)
VALUES (
  'rule_custom_001',
  'Custom Threshold Rule',
  'Detect when amount exceeds threshold',
  'threshold',
  'transaction',
  '{"field": "amount", "operator": "above", "threshold": 50000}',
  'high',
  0.30
);
```

3. **Enable/disable rule:**
```sql
UPDATE detection_rules SET enabled = false WHERE id = 'rule_001';
```

### Risk Scoring Weights

Adjust weights in `caseScoringEngine.ts`:

```typescript
const baseScore =
  0.25 * components.ruleSeverity +      // Adjust this
  0.20 * components.statisticalAnomaly + // Adjust this
  0.25 * components.graphCollusion +     // Adjust this
  0.15 * components.narrativeContradiction + // Adjust this
  0.10 * components.accessAbuse +        // Adjust this
  0.05 * components.historicalRecurrence; // Adjust this
```

### Intervention Policies

Modify intervention levels in `caseScoringEngine.ts`:

```typescript
export function determineIntervention(
  riskScore: number,
  confidence: number
): { action: InterventionAction; level: number; reason: string } {
  // Customize thresholds and actions here
  if (riskScore >= 80 && confidence >= 0.8) {
    return {
      action: 'pause_disbursement',
      level: 3,
      reason: 'High risk with high confidence'
    };
  }
  // ... more conditions
}
```

## Deployment

### Prerequisites

1. PostgreSQL database
2. Node.js 18+
3. React 18+ (for frontend)

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/atlas_sanctum
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
```

### Production Checklist

- [ ] Set up database backups
- [ ] Configure Redis for caching
- [ ] Set up Kafka for event streaming
- [ ] Configure authentication/authorization
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Set up SSL/TLS
- [ ] Configure CORS
- [ ] Set up logging aggregation
- [ ] Configure auto-scaling

## Monitoring

### Key Metrics to Monitor

1. **Event Ingestion Rate** - Events per second
2. **Detection Latency** - Time from event to alert
3. **False Positive Rate** - Alerts marked as false positive
4. **Case Resolution Time** - Time from case creation to resolution
5. **Intervention Success Rate** - Interventions executed successfully

### Health Checks

```bash
# Check API health
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/health/db

# Check Redis connection
curl http://localhost:3000/api/health/redis
```

## Troubleshooting

### Common Issues

1. **Events not being processed**
   - Check event ingestion service logs
   - Verify database connection
   - Check Kafka consumer group lag

2. **Rules not triggering**
   - Verify rule is enabled
   - Check rule condition syntax
   - Review event data structure

3. **High false positive rate**
   - Adjust rule weights
   - Increase confidence thresholds
   - Add more specific conditions

4. **Slow detection**
   - Add database indexes
   - Enable Redis caching
   - Optimize graph queries

## Support

For issues or questions:
1. Check the documentation in `ANTI_MANIPULATION_ENGINE.md`
2. Review the implementation summary in `ANTI_MANIPULATION_IMPLEMENTATION_SUMMARY.md`
3. Check the build completion report in `ANTI_MANIPULATION_BUILD_COMPLETE.md`

## License

Part of Atlas Sanctum - Humanitarian Intelligence Platform
