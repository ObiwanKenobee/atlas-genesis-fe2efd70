# Atlas Sanctum Regenerative Architecture

## Quick Start

1. **Run Migration**
```bash
cd backend
npm run migrate:regenerative
```

2. **Test Architecture**
```bash
npm run test:regenerative
```

3. **Start Server**
```bash
npm run dev
```

## Core Services

- **VerificationPipelineService** - Multi-stage verification instead of CRUD
- **ConfidenceWeightedStateService** - Data with uncertainty and decay
- **EthicalConstraintEngine** - Executable morality constraints
- **TrustAccumulationService** - Reputation as physics
- **TemporalLogicService** - Time as first-class citizen
- **RegenerativeOrchestrator** - Coordinates all services

## API Endpoints

- `POST /api/regenerative/actions` - Process regenerative actions
- `POST /api/regenerative/measurements` - Store confidence-weighted data
- `POST /api/regenerative/ethics/evaluate` - Evaluate ethical constraints
- `GET /api/regenerative/trust/:userId` - Get trust scores
- `GET /api/regenerative/health` - System health metrics

## Philosophy

**CRUD manages records. Atlas Sanctum manages consequences.**

The platform replaces traditional operations with:
- Verification pipelines instead of direct writes
- Confidence-weighted state instead of boolean truth
- Ethical constraints instead of role permissions
- Trust accumulation instead of user levels
- Temporal logic instead of instant changes

This enables scaling without collapsing through regenerative growth patterns.