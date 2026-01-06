# Atlas Sanctum Regenerative Architecture API

## Overview

Atlas Sanctum replaces traditional CRUD operations with regenerative, ecosystem-native services that implement the 15 core improvements for production-ready platforms:

1. **Verification Pipelines** - Multi-stage verification flows
2. **Confidence-Weighted State** - Data with uncertainty and decay
3. **Ethical Constraint Evaluation** - Executable morality
4. **Trust Accumulation & Decay** - Reputation as physics
5. **Temporal Logic** - Time as first-class citizen
6. **Feedback Loops** - Learning without central control
7. **Cross-Domain Translation** - Metric translators
8. **Capital Routing Logic** - Money with memory
9. **Governance Weighting** - Wisdom over volume
10. **Failure Containment** - Graceful degradation
11. **Knowledge Crystallization** - Memory, not logs
12. **Refusal Mechanisms** - Saying no correctly
13. **Intergenerational Simulation** - Future impact modeling
14. **Provenance Graphs** - How things came to be
15. **Ecosystem Health Index** - System self-awareness

## Base URL

```
http://localhost:4000/api/regenerative
```

## Authentication

All endpoints require JWT Bearer token authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

## Core Concepts

### Regenerative Actions
Actions flow through constraint layers: Intent → Constraint → Reality → Value → Governance

### Verification Pipelines
Nothing becomes "real" until it survives multi-source scrutiny with confidence scoring.

### Confidence-Weighted Values
Every metric carries uncertainty, decay, and provenance - no boolean truth fields.

### Ethical Constraints
Hard constraints (never allowed) and soft constraints (allowed with cost).

### Trust Scores
Logarithmic increases, exponential decay, severe drops on harm/fraud.

### Temporal Logic
Actions unfold over ecological time with seasonal checkpoints and delayed settlement.

---

## API Endpoints

### 🔄 Regenerative Actions

#### Process Regenerative Action
```http
POST /api/regenerative/actions
```

Process an action through all constraint layers (ethical, trust, verification, temporal).

**Request Body:**
```json
{
  "type": "create_project",
  "entityType": "carbon_project", 
  "entityId": "proj_123",
  "data": {
    "name": "Forest Restoration Project",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "indigenousTerritory": false
    },
    "emissions": 500,
    "expectedImpact": {
      "co2Reduction": 1000,
      "biodiversityScore": 0.8
    }
  },
  "context": {
    "hasConsent": true,
    "communityApproval": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "action": {
    "actionId": "ra_1704380400000_abc123",
    "status": "scheduled",
    "verificationPipelineId": "vp_1704380400000_def456",
    "ethicalEvaluation": {
      "overallResult": "allowed",
      "totalCost": 0,
      "reasoning": ["Action passes all ethical constraints"]
    },
    "trustCheck": {
      "meets": true,
      "current": "established",
      "required": "established"
    },
    "temporalActionId": "ta_1704380400000_ghi789",
    "reasoning": [
      "Verification pipeline created",
      "Action scheduled with temporal constraints"
    ],
    "nextSteps": [
      "Awaiting multi-source verification",
      "Action will be finalized after verification and temporal conditions are met"
    ],
    "estimatedCompletion": "2024-01-05T12:00:00.000Z"
  }
}
```

#### Get Action Status
```http
GET /api/regenerative/actions/:actionId
```

---

### 🔍 Verification Pipelines

#### Create Verification Pipeline
```http
POST /api/regenerative/verification/pipelines
```

**Request Body:**
```json
{
  "entityType": "measurement",
  "entityId": "meas_123",
  "initialData": {
    "metric": "soil_carbon",
    "value": 2.5,
    "location": "field_a"
  }
}
```

**Response:**
```json
{
  "success": true,
  "pipeline": {
    "id": "vp_1704380400000_abc123",
    "entityType": "measurement",
    "entityId": "meas_123",
    "stages": [
      {
        "id": "vs_1704380400000_def456",
        "name": "ingestion",
        "status": "processing",
        "confidence": 0.1,
        "source": "sensor"
      }
    ],
    "overallConfidence": 0.1,
    "status": "ingesting"
  }
}
```

#### Add Parallel Verification
```http
POST /api/regenerative/verification/pipelines/:pipelineId/verify
```

**Request Body:**
```json
{
  "sensorData": {
    "value": 2.5,
    "confidence": 0.8,
    "sensorId": "soil_sensor_001"
  },
  "satelliteData": {
    "value": 2.4,
    "confidence": 0.9,
    "satellite": "sentinel-2"
  },
  "humanVerification": {
    "value": 2.6,
    "confidence": 0.7,
    "verifiedBy": "field_expert_123"
  }
}
```

#### Get Pipeline Status
```http
GET /api/regenerative/verification/pipelines/:pipelineId
```

---

### 📊 Confidence-Weighted Measurements

#### Store Measurement
```http
POST /api/regenerative/measurements
```

**Request Body:**
```json
{
  "entityType": "carbon_project",
  "entityId": "proj_123",
  "metric": "co2_sequestered",
  "value": 1250.5,
  "confidence": 0.85,
  "source": "verified_sensor",
  "metadata": {
    "sensorId": "co2_sensor_001",
    "calibrationDate": "2024-01-01",
    "weatherConditions": "clear"
  }
}
```

**Response:**
```json
{
  "success": true,
  "measurementId": "cwv_1704380400000_abc123",
  "message": "Measurement processed with confidence weighting"
}
```

#### Get Confidence-Weighted Value
```http
GET /api/regenerative/measurements/:entityType/:entityId/:metric
```

**Response:**
```json
{
  "success": true,
  "value": {
    "value": 1250.5,
    "confidence": 0.82,
    "uncertainty": 0.18,
    "distribution": "normal",
    "parameters": {
      "source": "verified_sensor"
    },
    "lastUpdated": "2024-01-04T12:00:00.000Z",
    "decayRate": 0.1,
    "provenance": ["verified_sensor", "user_123"]
  },
  "confidenceInterval": {
    "lower": 1200.3,
    "upper": 1300.7,
    "confidence": 0.95
  }
}
```

#### Get All Entity Measurements
```http
GET /api/regenerative/measurements/:entityType/:entityId
```

---

### ⚖️ Ethical Constraints

#### Evaluate Action Ethics
```http
POST /api/regenerative/ethics/evaluate
```

**Request Body:**
```json
{
  "actionType": "ecosystem_intervention",
  "actionData": {
    "location": {
      "indigenousTerritory": true
    },
    "emissions": 1200,
    "impact": {
      "biodiversityScore": 0.3
    }
  },
  "context": {
    "hasConsent": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "actionId": "ea_1704380400000_abc123",
    "constraints": [
      {
        "constraintId": "ec_indigenous_consent",
        "constraintName": "Indigenous Land Consent",
        "type": "hard",
        "violated": true,
        "severity": "critical",
        "cost": 0,
        "reasoning": "Action affects indigenous land without consent",
        "suggestedAlternative": "Obtain community consent before proceeding"
      }
    ],
    "overallResult": "denied",
    "totalCost": 0,
    "reasoning": [
      "HARD VIOLATION: Action affects indigenous land without consent"
    ],
    "alternatives": [
      "Obtain community consent before proceeding"
    ]
  },
  "message": "Action violates ethical constraints"
}
```

#### Create Ethical Constraint
```http
POST /api/regenerative/ethics/constraints
```

**Request Body:**
```json
{
  "name": "Water Usage Limit",
  "type": "soft",
  "category": "environmental",
  "rule": "!exceedsWaterLimit(action.waterUsage, params.maxWater)",
  "parameters": {
    "maxWater": 1000,
    "actionTypes": ["irrigation", "processing"]
  },
  "violationCost": 150
}
```

---

### 🤝 Trust Scores

#### Get User Trust Score
```http
GET /api/regenerative/trust/:userId
```

**Response:**
```json
{
  "success": true,
  "trustScore": {
    "userId": "user_123",
    "currentScore": 0.72,
    "baseScore": 0.50,
    "contributions": [
      {
        "id": "tc_1704380400000_abc123",
        "type": "verification",
        "value": 0.15,
        "weight": 0.3,
        "timestamp": "2024-01-04T10:00:00.000Z",
        "description": "Provided soil_carbon measurement for carbon_project",
        "verifiedBy": "system"
      }
    ],
    "decayRate": 0.05,
    "lastUpdated": "2024-01-04T12:00:00.000Z",
    "trustLevel": "verified",
    "riskFactors": []
  }
}
```

#### Get Trust Rankings
```http
GET /api/regenerative/trust/rankings?limit=50
```

**Response:**
```json
{
  "success": true,
  "rankings": [
    {
      "rank": 1,
      "trustLevel": "exemplary",
      "currentScore": 0.95
    },
    {
      "rank": 2,
      "trustLevel": "verified",
      "currentScore": 0.87
    }
  ],
  "total": 50
}
```

---

### ⏰ Temporal Actions

#### Schedule Temporal Action
```http
POST /api/regenerative/temporal/schedule
```

**Request Body:**
```json
{
  "actionType": "finalize_verification",
  "entityId": "proj_123",
  "conditions": [
    {
      "type": "verification_delay",
      "parameters": {}
    },
    {
      "type": "seasonal",
      "parameters": {
        "season": "spring"
      }
    }
  ],
  "dependencies": ["vp_1704380400000_abc123"],
  "metadata": {
    "priority": "high"
  }
}
```

#### Create Seasonal Checkpoints
```http
POST /api/regenerative/temporal/seasonal-checkpoints
```

**Request Body:**
```json
{
  "ecosystemType": "temperate_forest",
  "year": 2024,
  "expectedMetrics": {
    "co2_sequestration": 1000,
    "biodiversity_index": 0.8,
    "soil_health": 0.75
  }
}
```

---

### 🏥 System Health

#### Get System Health
```http
GET /api/regenerative/health
```

**Response:**
```json
{
  "success": true,
  "health": {
    "verificationBacklog": 45,
    "averageConfidence": 0.78,
    "trustDistribution": {
      "untrusted": 12,
      "emerging": 156,
      "established": 89,
      "verified": 34,
      "exemplary": 9
    },
    "ethicalViolations": 3,
    "temporalActionsScheduled": 23,
    "overallHealth": "healthy"
  },
  "timestamp": "2024-01-04T12:00:00.000Z"
}
```

#### Perform Maintenance
```http
POST /api/regenerative/maintenance
```

**Response:**
```json
{
  "success": true,
  "results": {
    "trustScoresUpdated": 156,
    "lowConfidenceValuesRemoved": 23,
    "temporalActionsProcessed": 8,
    "overdueCheckpoints": 2
  },
  "message": "System maintenance completed"
}
```

---

### 🔄 Feedback Processing

#### Submit Prediction Feedback
```http
POST /api/regenerative/feedback
```

**Request Body:**
```json
{
  "predictionId": "pred_123",
  "actualOutcome": {
    "co2Sequestered": 1150,
    "biodiversityImprovement": 0.15
  },
  "confidence": 0.9
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "details": "Detailed error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limits

- General API: 100 requests/minute
- Authentication: 10 requests/minute
- Verification pipelines: 50 requests/minute
- System health: 20 requests/minute

---

## Database Schema

The regenerative architecture uses these core tables:

- `verification_pipelines` - Multi-stage verification flows
- `verification_stages` - Individual verification steps
- `confidence_weighted_values` - Measurements with uncertainty
- `ethical_constraints` - Executable moral rules
- `ethical_evaluations` - Constraint evaluation results
- `trust_scores` - User reputation scores
- `trust_contributions` - Trust-building actions
- `temporal_actions` - Time-based scheduled actions
- `seasonal_checkpoints` - Ecosystem monitoring points
- `feedback_loops` - Learning from predictions
- `orchestration_logs` - Action processing audit trail

---

## Migration

Run the regenerative architecture migration:

```bash
cd backend
npm run migrate:regenerative
```

Or manually:

```bash
node scripts/run-regenerative-migration.ts
```

---

## Philosophy

**CRUD manages records. Atlas Sanctum manages consequences.**

The platform's power comes from:
- **Time** - Ecological rhythms over app speed
- **Verification** - Multi-source truth over single claims
- **Ethics** - Executable morality over role permissions
- **Memory** - Provenance graphs over flat records
- **Restraint** - System can slow itself down

This enables scaling without collapsing through regenerative, not extractive, growth patterns.