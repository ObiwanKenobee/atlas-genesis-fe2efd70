# Atlas Sanctum Production Deployment Guide

## 🌍 Regenerative Architecture Production Setup

This guide covers deploying Atlas Sanctum's regenerative, non-CRUD architecture to production environments.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Redis (for rate limiting and caching)
- SSL certificates
- Environment variables configured

## Quick Production Setup

### 1. Environment Configuration

Create production `.env` file:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/atlas_sanctum_prod
REDIS_URL=redis://redis-host:6379

# Security
JWT_ACCESS_SECRET=your-super-secure-256-bit-secret-key-change-in-production
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://admin.your-domain.com

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com
FROM_NAME="Atlas Sanctum"

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Payment Processing
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

### 2. Database Setup

```bash
# Install PostgreSQL with PostGIS
sudo apt-get install postgresql-14 postgresql-14-postgis-3

# Create database
sudo -u postgres createdb atlas_sanctum_prod
sudo -u postgres psql atlas_sanctum_prod -c "CREATE EXTENSION postgis;"

# Run migrations
npm run migrate:regenerative
```

### 3. Build and Deploy

```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Start production server
npm start
```

## Architecture Overview

Atlas Sanctum implements a **regenerative, non-CRUD architecture** with these core services:

### 🔄 Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                          │
│              (Rate Limiting, Auth, CORS)                │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Regenerative Orchestrator                  │
│         (Coordinates all constraint layers)             │
└─┬─────────┬─────────┬─────────┬─────────┬──────────────┘
  │         │         │         │         │
  ▼         ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────────┐
│Ethical│ │Trust  │ │Verif. │ │Confid.│ │Temporal  │
│Engine │ │Service│ │Pipeline│ │State  │ │Logic     │
└───────┘ └───────┘ └───────┘ └───────┘ └──────────┘
```

### 🛡️ Constraint Layers

1. **Intent Layer** - User actions and data inputs
2. **Constraint Layer** - Ethics, identity, trust validation
3. **Reality Layer** - Verification, uncertainty, time
4. **Value Layer** - Capital allocation, exchange
5. **Governance Layer** - Collective decision and memory

## Production Features

### ✅ Verification Pipelines
- **Replaces**: Traditional "Create record" operations
- **Implementation**: Multi-stage verification (sensor + satellite + human)
- **Benefits**: Prevents greenwashing, makes reality the bottleneck

### ✅ Confidence-Weighted State
- **Replaces**: Boolean truth fields
- **Implementation**: Values with uncertainty, decay, and provenance
- **Benefits**: Encourages humility, enables better forecasting

### ✅ Ethical Constraint Engine
- **Replaces**: Role permissions
- **Implementation**: Hard/soft constraints with cost evaluation
- **Benefits**: Prevents morally destructive actions

### ✅ Trust Accumulation & Decay
- **Replaces**: User levels or badges
- **Implementation**: Logarithmic increases, exponential decay
- **Benefits**: Makes capture economically irrational

### ✅ Temporal Logic
- **Replaces**: Instant state changes
- **Implementation**: Seasonal checkpoints, delayed settlement
- **Benefits**: Aligns with natural cycles

## Deployment Options

### Option 1: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY dist/ ./dist/
COPY scripts/ ./scripts/

EXPOSE 4000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  atlas-backend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/atlas_sanctum
    depends_on:
      - db
      - redis

  db:
    image: postgis/postgis:14-3.2
    environment:
      POSTGRES_DB: atlas_sanctum
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Option 2: AWS Deployment

```bash
# Install AWS CLI and configure
aws configure

# Deploy using AWS App Runner or ECS
# See aws-deployment-config.json for full configuration
```

### Option 3: Heroku Deployment

```bash
# Create Heroku app
heroku create atlas-sanctum-prod

# Add PostgreSQL with PostGIS
heroku addons:create heroku-postgresql:standard-0
heroku pg:psql -c "CREATE EXTENSION postgis;"

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_ACCESS_SECRET=your-secret

# Deploy
git push heroku main

# Run migration
heroku run npm run migrate:regenerative
```

## Performance Optimization

### Database Indexing

The regenerative architecture includes optimized indexes:

```sql
-- Verification pipelines
CREATE INDEX idx_verification_pipelines_status ON verification_pipelines(status);
CREATE INDEX idx_verification_pipelines_entity ON verification_pipelines(entity_type, entity_id);

-- Confidence-weighted values
CREATE INDEX idx_confidence_values_entity ON confidence_weighted_values(entity_type, entity_id);
CREATE INDEX idx_confidence_values_updated ON confidence_weighted_values(last_updated);

-- Trust scores
CREATE INDEX idx_trust_scores_level ON trust_scores(trust_level);
CREATE INDEX idx_trust_contributions_user ON trust_contributions(user_id);

-- Temporal actions
CREATE INDEX idx_temporal_actions_scheduled ON temporal_actions(scheduled_for);
```

### Caching Strategy

```javascript
// Redis caching for frequently accessed data
const cacheConfig = {
  trustScores: { ttl: 300 }, // 5 minutes
  confidenceValues: { ttl: 600 }, // 10 minutes
  ethicalConstraints: { ttl: 3600 }, // 1 hour
  systemHealth: { ttl: 60 } // 1 minute
};
```

### Rate Limiting

```javascript
// Production rate limits
const rateLimits = {
  general: { windowMs: 60000, max: 100 },
  auth: { windowMs: 60000, max: 10 },
  verification: { windowMs: 60000, max: 50 },
  ethics: { windowMs: 60000, max: 30 }
};
```

## Monitoring & Observability

### Health Checks

```bash
# System health endpoint
curl https://api.your-domain.com/api/regenerative/health

# Response includes:
# - Verification backlog
# - Average confidence scores
# - Trust distribution
# - Ethical violations
# - Temporal actions scheduled
# - Overall health status
```

### Logging

```javascript
// Winston logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Metrics Collection

Key metrics to monitor:

- **Verification Pipeline Metrics**
  - Pipeline creation rate
  - Average verification time
  - Confidence score distribution
  - Pipeline failure rate

- **Trust System Metrics**
  - Trust score distribution
  - Trust decay rates
  - Violation frequency
  - Trust contribution patterns

- **Ethical Constraint Metrics**
  - Constraint violation rate
  - Hard vs soft violations
  - Ethical cost distribution
  - Refusal reasons

- **Temporal Logic Metrics**
  - Scheduled action backlog
  - Seasonal checkpoint completion
  - Time-locked attestation status

## Security Considerations

### Production Security Checklist

- [ ] JWT secrets are 256-bit random keys
- [ ] Database connections use SSL
- [ ] API rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Input validation is comprehensive
- [ ] Security headers are set
- [ ] Audit logging is enabled
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies are regularly updated
- [ ] Security monitoring is in place

### Security Headers

```javascript
// Helmet.js security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Maintenance & Operations

### Automated Maintenance

```bash
# Schedule daily maintenance (cron job)
0 2 * * * /usr/bin/curl -X POST https://api.your-domain.com/api/regenerative/maintenance

# Maintenance tasks include:
# - Trust score updates
# - Confidence value cleanup
# - Temporal action processing
# - System health checks
```

### Backup Strategy

```bash
# Database backup
pg_dump $DATABASE_URL > atlas_sanctum_backup_$(date +%Y%m%d).sql

# Automated daily backups
0 1 * * * /path/to/backup-script.sh
```

### Scaling Considerations

1. **Horizontal Scaling**
   - Load balancer with multiple backend instances
   - Database read replicas
   - Redis cluster for caching

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Implement connection pooling

3. **Microservices Migration**
   - Split services into separate containers
   - Use message queues for inter-service communication
   - Implement service discovery

## API Documentation

Full API documentation available at:
- Development: `http://localhost:4000/api`
- Production: `https://api.your-domain.com/api`
- Regenerative API: `/docs/REGENERATIVE_API_DOCUMENTATION.md`

## Troubleshooting

### Common Issues

1. **High Verification Backlog**
   ```bash
   # Check pipeline status
   curl https://api.your-domain.com/api/regenerative/health
   
   # Scale verification workers
   # Increase database connection pool
   ```

2. **Low Confidence Scores**
   ```bash
   # Review data sources
   # Check sensor calibration
   # Verify satellite data feeds
   ```

3. **Trust Score Issues**
   ```bash
   # Review trust contributions
   # Check for violations
   # Verify decay calculations
   ```

4. **Temporal Action Delays**
   ```bash
   # Check seasonal conditions
   # Review dependency chains
   # Verify time-based constraints
   ```

### Performance Tuning

```sql
-- Database performance queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
SELECT * FROM pg_stat_user_tables ORDER BY seq_tup_read DESC;

-- Index usage analysis
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats WHERE tablename IN (
  'verification_pipelines',
  'confidence_weighted_values',
  'trust_scores'
);
```

## Support & Documentation

- **Architecture Documentation**: `/docs/REGENERATIVE_API_DOCUMENTATION.md`
- **Database Schema**: `/backend/db/migrations/20260104_regenerative_architecture.sql`
- **Service Documentation**: Individual service files in `/backend/src/services/`
- **API Examples**: Test files in `/backend/tests/`

## Philosophy

> **CRUD manages records. Atlas Sanctum manages consequences.**

The regenerative architecture ensures:
- **Time** over speed
- **Verification** over claims
- **Ethics** over permissions
- **Memory** over logs
- **Restraint** over growth

This enables **scaling without collapsing** through regenerative patterns that strengthen the system over time.

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: January 4, 2026  

🌍 **Building a regenerative future, one verified action at a time.** 🌱