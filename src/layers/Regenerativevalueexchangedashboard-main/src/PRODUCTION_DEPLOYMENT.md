# RVE Platform - Production Deployment Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React + TypeScript + Vite                                     │
│  - UI Components (14 major sections)                            │
│  - State Management (React hooks)                               │
│  - Real-time WebSocket connections                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER                          │
│  - REST API Client (retry, timeout, auth)                       │
│  - Type-safe endpoints                                          │
│  - Rate limiting & error handling                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY & AUTH LAYER                       │
│  - Wallet-based authentication (MetaMask, WalletConnect)        │
│  - JWT token management                                         │
│  - Role-based access control (RBAC)                            │
│  - Input validation & sanitization                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                             │
│  - Multi-chain support (Ethereum, Polygon, Arbitrum, Optimism) │
│  - Smart contract interactions                                  │
│  - Event listeners & transaction management                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML SERVICE LAYER                        │
│  - Prediction models (carbon, biodiversity, impact)             │
│  - Computer vision (satellite imagery analysis)                 │
│  - NLP (document extraction, translation)                       │
│  - Time series forecasting                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER (PostgreSQL)                 │
│  - Users & Authentication                                       │
│  - Assets & Custodians                                         │
│  - Governance & Voting                                         │
│  - Trading & Transactions                                      │
│  - Impact Reports & Verifications                              │
│  - DeFi (Pools, Farms, Staking)                               │
│  - Audit Logs                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONITORING & LOGGING                          │
│  - Application logs (debug, info, warn, error, fatal)          │
│  - Performance metrics                                          │
│  - Error tracking (Sentry)                                     │
│  - Health checks                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### Backend Infrastructure

- [ ] **Database Setup**
  - PostgreSQL 14+ with PostGIS extension
  - Run schema from `/config/database.schema.sql`
  - Set up connection pooling (recommended: 10-50 connections)
  - Enable automated backups (daily + transaction logs)
  - Set up read replicas for scaling

- [ ] **Cache Layer**
  - Redis 6+ for session storage and caching
  - Configure persistence (AOF + RDB)
  - Set up Redis Cluster for HA

- [ ] **Message Queue**
  - RabbitMQ or Apache Kafka for async processing
  - Queues: oracle-verification, impact-reports, notifications

### Blockchain Infrastructure

- [ ] **Smart Contracts**
  - Deploy contracts to target networks
  - Verify contracts on block explorers
  - Set up multi-sig wallets for admin functions
  - Configure contract upgradeability (proxy patterns)

- [ ] **RPC Providers**
  - Primary: Alchemy/Infura (enterprise plan)
  - Backup: QuickNode or self-hosted nodes
  - Set up load balancing and failover

### External Services

- [ ] **AI/ML Services**
  - Deploy ML models (TensorFlow Serving or custom API)
  - Set up GPU instances for image processing
  - Configure auto-scaling based on queue depth

- [ ] **Storage**
  - IPFS cluster for decentralized storage
  - S3/GCS for centralized backups
  - CDN for static assets (CloudFront/CloudFlare)

- [ ] **Monitoring**
  - Sentry for error tracking
  - Datadog/Prometheus for metrics
  - PagerDuty for alerts
  - LogDNA/ELK for log aggregation

---

## 🚀 Deployment Steps

### 1. Environment Configuration

```bash
# Copy and configure environment variables
cp .env.example .env

# CRITICAL: Update these values
# - JWT_SECRET: Use strong random string (256+ bits)
# - Database credentials
# - Blockchain RPC URLs and contract addresses
# - API keys for external services
```

### 2. Database Migration

```bash
# Connect to PostgreSQL
psql -U postgres -h your-db-host

# Create database
CREATE DATABASE rve_db;
\c rve_db

# Run schema
\i config/database.schema.sql

# Verify tables
\dt

# Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_performance 
ON users(wallet_address, verified, created_at);

# Set up automated backups
# For AWS RDS: Enable automated backups in console
# For self-hosted: Set up pg_dump cron job
```

### 3. Build Frontend

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build for production
npm run build

# Output will be in /dist folder
```

### 4. Deploy Frontend

**Option A: Static Hosting (Vercel/Netlify)**
```bash
# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod --dir=dist
```

**Option B: Self-Hosted (Nginx)**
```nginx
# /etc/nginx/sites-available/rve

server {
    listen 80;
    server_name rve.network www.rve.network;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rve.network www.rve.network;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/rve.network/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rve.network/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    root /var/www/rve/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://ws-backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 5. Deploy Backend API

**Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Docker Compose**
```yaml
version: '3.8'

services:
  api:
    image: rve-api:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgis/postgis:14-3.2
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: rve_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  ws-server:
    image: rve-websocket:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=${REDIS_URL}

volumes:
  postgres_data:
  redis_data:
```

### 6. Deploy AI/ML Services

```bash
# Deploy TensorFlow Serving models
docker run -p 8501:8501 \
  --mount type=bind,source=/path/to/models,target=/models/rve \
  -e MODEL_NAME=carbon_prediction \
  tensorflow/serving

# Deploy custom AI API
docker run -p 8502:8502 \
  rve-ai-service:latest \
  --gpus all
```

---

## 🔒 Security Hardening

### 1. API Security

```typescript
// Rate limiting per IP
const ipRateLimiter = new RateLimiter(60000, 100); // 100 req/min

// Rate limiting per user
const userRateLimiter = new RateLimiter(60000, 1000); // 1000 req/min

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
  maxAge: 86400
};

// Request validation middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Prevent large payloads
```

### 2. Database Security

```sql
-- Create read-only user for replicas
CREATE USER rve_readonly WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE rve_db TO rve_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rve_readonly;

-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON users
    USING (id = current_user_id());

-- Encrypt sensitive columns
-- Use pgcrypto for column-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN email_encrypted BYTEA;
UPDATE users SET email_encrypted = pgp_sym_encrypt(email, 'encryption_key');
```

### 3. Smart Contract Security

```solidity
// Implement emergency pause
import "@openzeppelin/contracts/security/Pausable.sol";

contract RVEToken is Pausable {
    function transfer(address to, uint256 amount) 
        public 
        whenNotPaused 
        returns (bool) 
    {
        // Transfer logic
    }
}

// Rate limiting for sensitive functions
mapping(address => uint256) public lastActionTime;
uint256 public constant ACTION_COOLDOWN = 1 hours;

modifier rateLimit() {
    require(
        block.timestamp >= lastActionTime[msg.sender] + ACTION_COOLDOWN,
        "Action on cooldown"
    );
    lastActionTime[msg.sender] = block.timestamp;
    _;
}
```

---

## 📊 Monitoring & Alerting

### Application Metrics

```typescript
// Define custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

// Track business metrics
const assetsCreated = new prometheus.Counter({
  name: 'assets_created_total',
  help: 'Total number of assets created'
});

const tradingVolume = new prometheus.Gauge({
  name: 'trading_volume_usd',
  help: 'Trading volume in USD'
});
```

### Alert Rules

```yaml
# Prometheus alert rules
groups:
  - name: rve_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_connections / pg_settings_max_connections > 0.8
        for: 2m
        annotations:
          summary: "Database connection pool almost exhausted"
          
      - alert: BlockchainRPCDown
        expr: up{job="blockchain-rpc"} == 0
        for: 1m
        annotations:
          summary: "Blockchain RPC endpoint is down"
```

---

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Build and push Docker images
          docker build -t rve-api:${{ github.sha }} .
          docker push rve-api:${{ github.sha }}
          
          # Update Kubernetes deployment
          kubectl set image deployment/rve-api \
            rve-api=rve-api:${{ github.sha }}
          
          # Run database migrations
          kubectl exec -it migration-pod -- \
            npm run migrate:up
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Partition large tables
CREATE TABLE asset_prices_2024 PARTITION OF asset_prices
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW daily_trading_stats AS
SELECT 
    DATE(created_at) as date,
    asset_id,
    COUNT(*) as trade_count,
    SUM(amount) as volume,
    AVG(price) as avg_price
FROM transactions
WHERE type IN ('buy', 'sell')
GROUP BY DATE(created_at), asset_id;

CREATE UNIQUE INDEX ON daily_trading_stats (date, asset_id);

-- Refresh materialized view (schedule with cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_trading_stats;
```

### Frontend Performance

```typescript
// Code splitting
const TradingInterface = lazy(() => import('./components/TradingInterface'));
const Governance = lazy(() => import('./components/Governance'));

// Memoization
const MemoizedChart = memo(Chart, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

// Service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 🆘 Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Full backup: Daily at 2 AM UTC
   - Incremental: Every 6 hours
   - Retention: 30 days
   - Test restores: Weekly

2. **Smart Contract State**
   - Export contract state to IPFS daily
   - Keep checksums in centralized DB
   - Test contract migration quarterly

3. **User Data**
   - Encrypted backups to S3 Glacier
   - 7-year retention for compliance
   - Geographic redundancy (3 regions)

### Incident Response Plan

```bash
# Runbook for critical incidents

# 1. Database failure
pg_dump -h backup-db -U admin rve_db > emergency_backup.sql
psql -h new-db -U admin rve_db < emergency_backup.sql

# 2. Smart contract pause
cast send --rpc-url $ETH_RPC \
  --private-key $ADMIN_KEY \
  $CONTRACT_ADDRESS \
  "pause()"

# 3. Rollback deployment
kubectl rollout undo deployment/rve-api
vercel rollback
```

---

## 📞 Support Contacts

- **DevOps Lead**: ops@rve.network
- **Security Team**: security@rve.network  
- **On-Call**: +1-XXX-XXX-XXXX (PagerDuty)

---

**Last Updated**: 2025-01-03
**Version**: 1.0.0
