# Atlas Humanitarian Platform - Cloud Infrastructure Architecture

## Executive Summary

This document defines the comprehensive cloud infrastructure strategy for Atlas Humanitarian Platform, leveraging AWS, Google Cloud Platform, and Azure in a multi-cloud architecture optimized for global humanitarian operations.

---

## 1. Multi-Cloud Strategy

### 1.1 Provider Selection Rationale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-CLOUD STRATEGY OVERVIEW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │      AWS         │  │       GCP       │  │      Azure      │           │
│  │   (Primary)      │  │   (Secondary)   │  │   (Compliance)  │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │  • Compute      │  │  • Data/ML      │  │  • Microsoft    │           │
│  │  • Storage     │  │  • Analytics    │  │    Integration │           │
│  │  • Networking │  │  • AI Services  │  │  • Enterprise  │           │
│  │  • Security   │  │  • Kubernetes   │  │    Services    │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Service Allocation by Provider

| Service Category | Primary | Secondary | Justification |
|-----------------|---------|-----------|---------------|
| **Compute (VMs)** | AWS EC2 | GCP Compute | AWS mature ecosystem, GCP cost-effective |
| **Kubernetes** | GCP GKE | AWS EKS | GKE first-party, EKS enterprise |
| **Serverless** | AWS Lambda | GCP Cloud Functions | Lambda maturity, Cloud Functions simplicity |
| **Containers** | AWS ECS | Azure ACI | ECS native AWS, ACI serverless containers |
| **Object Storage** | AWS S3 | GCP Cloud Storage | S3 industry standard, GCS analytics |
| **Databases** | AWS RDS | GCP Cloud SQL | RDS managed, Cloud SQL PostgreSQL |
| **Data Warehouse** | GCP BigQuery | AWS Redshift | BigQuery serverless, Redshift mature |
| **AI/ML** | GCP Vertex AI | AWS SageMaker | GCP AI heritage, SageMaker enterprise |
| **CDN** | AWS CloudFront | GCP Cloud CDN | CloudFront global, Cloud CDN integrated |
| **DNS** | AWS Route53 | Azure DNS | Route53 reliability, Azure DNS integration |
| **Monitoring** | Datadog | GCP Ops | Datadog multi-cloud, GCP native |

### 1.3 Geographic Distribution

```
                    GLOBAL INFRASTRUCTURE
                    
    ┌─────────────────────────────────────────────────────────┐
    │                    PRIMARY: AWS (US-EAST)                │
    │  • Main application deployment                          │
    │  • Primary database (RDS Multi-AZ)                      │
    │  • S3 storage with cross-region replication             │
    │  • Route53 for global DNS                              │
    └─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ GCP (EUROPE)  │    │  AZURE (ASIA) │    │ AWS (SA)      │
│ • GKE cluster │    │ • Regional    │    │ • DR target   │
│ • BigQuery    │    │   compliance  │    │ • Data sync   │
│ • AI services │    │ • Enterprise  │    │ • Latency opt │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 1.4 Multi-Cloud Service Definitions

```hcl
# terraform/modules/multi_cloud/providers.tf

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  # Remote state for collaboration
  backend "s3" {
    bucket         = "atlas-terraform-state"
    key            = "global/multi-cloud/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# AWS Provider - Primary
provider "aws" {
  alias   = "primary"
  region  = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "AtlasHumanitarian"
      Environment = var.environment
      ManagedBy   = "Terraform"
      MultiCloud  = "true"
    }
  }
}

# GCP Provider - Secondary
provider "google" {
  alias   = "secondary"
  region  = "europe-west1"
  project = "atlas-humanitarian-gcp"
  
  user_agent = "terraform"
}

# Azure Provider - Compliance
provider "azurerm" {
  alias               = "compliance"
  subscription_id     = var.azure_subscription_id
  tenant_id          = var.azure_tenant_id
  client_id          = var.azure_client_id
  client_secret      = var.azure_client_secret
  features {}
  
  user_agent = "terraform"
}
```

---

## 2. Serverless Architecture Framework

### 2.1 Workload Classification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKLOAD CLASSIFICATION MATRIX                             │
├──────────────────────┬────────────────────┬──────────────────────────────────┤
│     Serverless       │  Containerized    │           Rationale             │
├──────────────────────┼────────────────────┼──────────────────────────────────┤
│ • Event processing   │ • Long-running API │ • Stateless, short-duration     │
│ • Webhooks          │ • Background jobs  │ • Variable traffic patterns     │
│ • File processing   │ • ML inference     │ • Predictable traffic          │
│ • Scheduled tasks   │ • Real-time chat   │ • Persistent connections        │
│ • Data pipelines    │ • Batch processing │ • Complex dependencies          │
│ • Notifications     │ • Media processing │ • GPU/ML requirements           │
│ • API endpoints     │ • Database proxies │ • Cold start critical           │
└──────────────────────┴────────────────────┴──────────────────────────────────┘
```

### 2.2 Serverless Workload Specifications

```typescript
// serverless/workloads.yaml

workloads:
  # Event-Driven Processing
  documentProcessor:
    provider: aws
    service: lambda
    memory: 1024
    timeout: 300
    runtime: nodejs18.x
    triggers:
      - s3://atlas-documents/*
      - sqs:DocumentProcessingQueue
    layers:
      - arn:aws:lambda:us-east-1:123456789:layer:common-utils:1
    
  # Real-time Stream Processing
  streamProcessor:
    provider: aws
    service: kinesis
    shards: 10
    retention: 24
    consumer: lambda
    
  # Scheduled Tasks
  reportGenerator:
    provider: gcp
    service: cloud_scheduler
    schedule: "0 0 * * *"
    timezone: UTC
    function: report-generation-function
    
  # API Endpoints
  apiGateway:
    provider: aws
    service: apigwv2
    protocol: HTTP
    cors:
      allowed_origins: ["https://*.atlas.org"]
      allowed_methods: ["GET", "POST", "PUT", "DELETE"]
    
  # Event Queues
  messageQueue:
    provider: aws
    service: sqs
    fifo: true
    visibility_timeout: 300
    message_retention: 86400
    dead_letter:
      queue: dead-letter-queue
      max_receives: 3
```

### 2.3 Lambda Function Architecture

```typescript
// serverless/lambda/base-function.ts

import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics } from '@aws-lambda-powertools/metrics';

interface BaseHandlerConfig {
    serviceName: string;
    logLevel?: string;
    powertoolsNamespace?: string;
}

export abstract class BaseLambdaFunction {
    protected logger: Logger;
    protected tracer: Tracer;
    protected metrics: Metrics;
    
    constructor(config: BaseHandlerConfig) {
        this.logger = new Logger({
            serviceName: config.serviceName,
            logLevel: config.logLevel || 'INFO',
        });
        
        this.tracer = new Tracer({
            serviceName: config.serviceName,
            powertoolsNamespace: config.powertoolsNamespace,
        });
        
        this.metrics = new Metrics({
            namespace: 'AtlasHumanitarian',
            serviceName: config.serviceName,
        });
    }
    
    protected abstract execute(event: any): Promise<any>;
    
    handler: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
        const startTime = Date.now();
        
        try {
            this.logger.addContext(context);
            this.tracer.addContext(event);
            
            // Cold start detection
            if (context.functionName && !this.tracer.getRootDimension()) {
                this.metrics.addMetric('ColdStart', 'Count', 1);
            }
            
            const result = await this.execute(event);
            
            // Success metrics
            this.metrics.addMetric('InvocationSuccess', 'Count', 1);
            this.metrics.addMetric('Latency', 'Milliseconds', Date.now() - startTime);
            
            return {
                statusCode: 200,
                body: JSON.stringify(result),
                headers: this.getCorsHeaders(),
            };
        } catch (error) {
            this.logger.error('Function execution failed', { error });
            this.metrics.addMetric('InvocationError', 'Count', 1);
            
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Internal server error' }),
                headers: this.getCorsHeaders(),
            };
        }
    };
    
    private getCorsHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        };
    }
}
```

---

## 3. Containerization Strategy

### 3.1 Standardized Base Images

```dockerfile
# dockerfiles/node/Dockerfile

# =============================================================================
# ATLAS HUMANITARY - NODE.JS BASE IMAGE
# =============================================================================
# Built on Amazon Linux 2023 with Node.js 18 LTS
# Security: Regular vulnerability scanning, minimal attack surface
# =============================================================================

FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS base

# Install dependencies
RUN dnf update -y && \
    dnf install -y \
        curl \
        jq \
        tini \
        && dnf clean all && \
    rm -rf /var/cache/dnf/*

# Install Node.js 18 LTS
RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && \
    dnf install -y nodejs && \
    npm install -g npm@latest

# Create non-root user
RUN groupadd --gid 1001 nodeapp && \
    useradd --uid 1001 --gid nodeapp --shell /bin/bash --create-home nodeapp

# Set ownership
RUN chown -R nodeapp:nodeapp /home/nodeapp

WORKDIR /home/nodeapp

EXPOSE 3000

USER nodeapp

CMD ["tini", "--", "node", "dist/index.js"]
```

### 3.2 Multi-Stage Build Process

```dockerfile
# dockerfiles/api/Dockerfile

# =============================================================================
# MULTI-STAGE BUILD PROCESS
# =============================================================================
# Stage 1: Dependencies
# Stage 2: Build
# Stage 3: Test
# Stage 4: Production
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1: DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2: BUILD
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Copy source and installed dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3: SECURITY SCANNING
# ─────────────────────────────────────────────────────────────────────────────
FROM aquasec/trivy:latest AS security-scan

COPY --from=build /app/package*.json /app/
COPY --from=build /app/dist /app/dist

# Run Trivy vulnerability scan
RUN trivy fs --exit-code 1 --severity HIGH,CRITICAL /app || \
    (echo "Vulnerabilities found!" && exit 1)

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 4: PRODUCTION
# ─────────────────────────────────────────────────────────────────────────────
FROM atlas/node:base AS production

WORKDIR /home/nodeapp

# Copy production dependencies and built code
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["tini", "--", "node", "dist/main.js"]
```

### 3.3 Image Versioning Policy

```yaml
# .github/workflows/image-versioning.yaml

name: Image Versioning

on:
  push:
    branches: [main, develop]
    paths:
      - 'dockerfiles/**'
      - 'src/**'

env:
  ECR_REPOSITORY: atlas-humanitarian
  IMAGE_TAG_PREFIX: ${{ github.ref == 'refs/heads/main' && 'release' || 'dev' }}

jobs:
  versioning:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      short_sha: ${{ steps.version.outputs.short_sha }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate version
        id: version
        run: |
          # Semantic versioning: MAJOR.MINOR.PATCH-{sha}
          SHA=$(git rev-parse --short ${{ github.sha }})
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            # Release: Increment patch from last tag
            VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0")
            PATCH=$(echo $VERSION | cut -d. -f3)
            NEW_PATCH=$((PATCH + 1))
            VERSION=$(echo $VERSION | sed "s/[0-9]*$/$(printf '%03d' $NEW_PATCH)/")
            echo "version=$VERSION-$SHA" >> $GITHUB_OUTPUT
          else
            # Development: Date-based versioning
            DATE=$(date +%Y.%m.%d)
            echo "version=$DATE-dev-$SHA" >> $GITHUB_OUTPUT
          fi
          echo "short_sha=$SHA" >> $GITHUB_OUTPUT
      
      - name: Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.ECR_REPOSITORY }}
          tags: |
            type=sha
            type=ref,event=branch
            type=raw,value=${{ steps.version.outputs.version }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 4. Kubernetes Architecture

### 4.1 Cluster Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER TOPOLOGY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     AWS EKS - PRODUCTION                               │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │                     CONTROL PLANE                               │  │  │
│  │  │  • 3 API servers across AZs                                    │  │  │
│  │  │  • Managed etcd                                                │  │  │
│  │  │  • API server autoscaling                                      │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │                     NODE POOLS                                │  │  │
│  │  │                                                               │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │  │
│  │  │  │   general    │  │   memory     │  │   compute    │       │  │  │
│  │  │  │  t3.xlarge  │  │   r6g.2xl   │  │   c6i.4xl   │       │  │  │
│  │  │  │   6 nodes   │  │   4 nodes   │  │   3 nodes   │       │  │  │
│  │  │  │  Spot 60%   │  │   On-Demand │  │   On-Demand │       │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      GCP GKE - SECONDARY                             │  │
│  │  • Same topology as production                                       │  │
│  │  • Used for development and disaster recovery                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Namespace Organization

```yaml
# k8s/namespaces.yaml

---
# Production Namespaces
apiVersion: v1
kind: Namespace
metadata:
  name: atlas-production
  labels:
    environment: production
    team: platform
    cost-center: "atlas-core"
    data-classification: "confidential"
    
---
apiVersion: v1
kind: Namespace
metadata:
  name: atlas-staging
  labels:
    environment: staging
    team: platform
    cost-center: "atlas-staging"
    data-classification: "internal"
    
---
apiVersion: v1
kind: Namespace
metadata:
  name: atlas-development
  labels:
    environment: development
    team: engineering
    cost-center: "atlas-dev"
    data-classification: "public"
    
---
# Team-based Namespaces
apiVersion: v1
kind: Namespace
metadata:
  name: team-frontend
  labels:
    team: frontend
    environment: production
    
---
apiVersion: v1
kind: Namespace
metadata:
  name: team-backend
  labels:
    team: backend
    environment: production
    
---
apiVersion: v1
kind: Namespace
metadata:
  name: team-data
  labels:
    team: data
    environment: production
```

### 4.3 Resource Quotas and Limits

```yaml
# k8s/resource-quotas.yaml

apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quotas
  namespace: atlas-production
spec:
  hard:
    cpu: "100"
    memory: 200Gi
    pods: "200"
    services: "50"
    replicasets: "50"
    secrets: "100"
    configmaps: "100"
    persistentvolumeclaims: "50"
    
---
apiVersion: v1
kind: LimitRange
metadata:
  name: production-limits
  namespace: atlas-production
spec:
  limits:
    - type: Container
      min:
        cpu: 100m
        memory: 128Mi
      max:
        cpu: "8"
        memory: 16Gi
      default:
        cpu: 500m
        memory: 1Gi
      defaultRequest:
        cpu: 200m
        memory: 256Mi
    - type: Pod
      max:
        cpu: "16"
        memory: 32Gi
        
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: frontend-quotas
  namespace: team-frontend
spec:
  hard:
    cpu: "20"
    memory: 40Gi
    pods: "50"
    services: "10"
```

### 4.4 Network Policies

```yaml
# k8s/network-policies.yaml

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: atlas-production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Allow from ingress-nginx controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
          
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
  namespace: team-backend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: team-frontend
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000
          
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-allow-backend
  namespace: atlas-data
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: team-backend
      ports:
        - protocol: TCP
          port: 5432
          # PostgreSQL
        - protocol: TCP
          port: 27017
          # MongoDB
```

### 4.5 Auto-Scaling Configuration

```yaml
# k8s/horizontal-pod-autoscaler.yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: team-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60

---
apiVersion: autoscaling/v2
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
  namespace: team-backend
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  updatePolicy:
    updateMode: Auto
  resourcePolicy:
    containerPolicies:
      - containerName: api
        minAllowed:
          cpu: 200m
          memory: 256Mi
        maxAllowed:
          cpu: 8
          memory: 16Gi
```

---

## 5. Secrets Management

### 5.1 AWS Secrets Manager Integration

```yaml
# k8s/secrets/external-secrets.yaml

apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
  namespace: atlas-production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: atlas-production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
    - secretKey: host
      remoteRef:
        key: atlas/production/database/host
    - secretKey: port
      remoteRef:
        key: atlas/production/database/port
        property: port
    - secretKey: username
      remoteRef:
        key: atlas/production/database/username
    - secretKey: password
      remoteRef:
        key: atlas/production/database/password
        property: password
```

---

## 6. CI/CD Pipeline Definitions

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/atlas-ci-cd.yaml

name: Atlas Humanitarian CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: atlas-humanitarian
  TERRAFORM_PATH: infrastructure/terraform
  K8S_NAMESPACE: atlas-${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

jobs:
  # ─────────────────────────────────────────────────────────────────────────
  # BUILD AND TEST
  # ─────────────────────────────────────────────────────────────────────────
  build-test:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
      
      - name: Generate version
        id: version
        run: |
          SHA=$(git rev-parse --short ${{ github.sha }})
          VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0")
          echo "version=$VERSION-$SHA" >> $GITHUB_OUTPUT
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: |
            ${{ secrets.ECR_URL }}/atlas-api:${{ steps.version.outputs.version }}
            ${{ secrets.ECR_URL }}/atlas-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Push Docker metadata
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.ECR_URL }}/atlas-api
          tags: |
            type=sha
            type=ref,event=branch
            
      - name: Vulnerability scan
        uses: aquasec/trivy-action@master
        with:
          scan-type: 'image'
          scan-ref: ${{ secrets.ECR_URL }}/atlas-api:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
  
  # ─────────────────────────────────────────────────────────────────────────
  # TERRAFORM INFRASTRUCTURE
  # ─────────────────────────────────────────────────────────────────────────
  terraform:
    runs-on: ubuntu-latest
    needs: build-test
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/GitHubActionsRole
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.0
      
      - name: Terraform init
        working-directory: ${{ env.TERRAFORM_PATH }}
        run: |
          terraform init \
            -backend-config="bucket=${{ secrets.TERRAFORM_STATE_BUCKET }}" \
            -backend-config="dynamodb_table=${{ secrets.TERRAFORM_LOCK_TABLE }}"
      
      - name: Terraform validate
        working-directory: ${{ env.TERRAFORM_PATH }}
        run: terraform validate
      
      - name: Terraform plan
        working-directory: ${{ env.TERRAFORM_PATH }}
        run: |
          terraform plan \
            -var="environment=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}" \
            -var="image_version=${{ needs.build-test.outputs.version }}" \
            -out=tfplan
      
      - name: Terraform apply
        if: github.ref == 'refs/heads/main'
        working-directory: ${{ env.TERRAFORM_PATH }}
        run: terraform apply tfplan
  
  # ─────────────────────────────────────────────────────────────────────────
  # KUBERNETES DEPLOYMENT
  # ─────────────────────────────────────────────────────────────────────────
  deploy-k8s:
    runs-on: ubuntu-latest
    needs: [build-test, terraform]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/GitHubActionsRole
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Setup kubectl
        uses: azure/setup-helm@v4
        with:
          version: '3.12'
      
      - name: Update Kubernetes manifests
        run: |
          sed -i 's|image: .*|image: ${{ secrets.ECR_URL }}/atlas-api:${{ needs.build-test.outputs.version }}|' k8s/deployments/*.yaml
      
      - name: Deploy to Kubernetes
        uses: bitovi/github-actions-k8s-deploy@main
        with:
          clusterName: ${{ secrets.EKS_CLUSTER_NAME }}
          namespace: ${{ env.K8S_NAMESPACE }}
          manifests: |
            k8s/namespaces.yaml
            k8s/deployments/api.yaml
            k8s/services/api.yaml
            k8s/ingresses/api.yaml
          images: |
            ${{ secrets.ECR_URL }}/atlas-api:${{ needs.build-test.outputs.version }}
      
      - name: Health check
        run: |
          kubectl rollout status deployment/api -n ${{ env.K8S_NAMESPACE }} --timeout=5m
          kubectl wait --for=condition=ready pod -l app=api -n ${{ env.K8S_NAMESPACE }} --timeout=5m
      
      - name: Smoke tests
        run: |
          curl -f https://api.atlas.org/health || exit 1
```

---

## 7. Cost Optimization

### 7.1 Reserved Capacity Planning

```yaml
# terraform/modules/cost_optimization/reserved_instances.tf

# Compute - Reserved Instances
resource "aws_ec2_reserved_instances" "general_compute" {
  instance_type         = "t3.xlarge"
  instance_platform     = "Linux/UNIX"
  availability_zone     = "us-east-1a"
  instance_count        = 10
  offering_type         = "All Upfront"
  start                 = formatdate("YYYY-MM-DD", timestamp())
  duration              = 31536000  # 1 year
}

resource "aws_ec2_reserved_instances" "memory_optimized" {
  instance_type         = "r6g.2xlarge"
  instance_platform     = "Linux/UNIX"
  availability_zone     = "us-east-1a"
  instance_count        = 4
  offering_type         = "All Upfront"
  duration              = 31536000
}

# RDS Reserved Instances
resource "aws_db_reserved_instances" "primary_db" {
  instance_count        = 2
  offering_type         = "All Upfront"
  db_instance_class     = "db.r6g.2xlarge"
  multi_az              = true
  db_instance_identifier = "atlas-primary"
}

# ElastiCache Reserved Nodes
resource "aws_elasticache_reserved_node" "cache_node" {
  instance_count        = 2
  offering_type         = "All Upfront"
  node_type             = "cache.r6g.2xlarge"
  num_cache_nodes       = 2
}
```

### 7.2 Spot Instance Strategy

```yaml
# terraform/modules/eks/node_groups.tf

resource "aws_eks_node_group" "general_spot" {
  cluster_name    = aws_eks_cluster.atlas.name
  node_group_name = "general-spot"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = module.vpc.private_subnets
  
  scaling_config {
    desired_size = 6
    max_size     = 20
    min_size     = 3
  }
  
  # Spot instances for cost optimization
  capacity_type  = "SPOT"
  
  instance_types = ["t3.xlarge", "t3.2xlarge", "m5.xlarge"]
  
  labels = {
    workload-type = "general"
    cost-optimized = "true"
    spot-enabled = "true"
  }
  
  taints = []
  
  update_config {
    max_unavailable_percentage = 10
  }
  
  lifecycle {
    create_before_destroy = true
    ignore_changes = [scaling_config[0].desired_size]
  }
}

resource "aws_eks_node_group" "compute_ondemand" {
  cluster_name    = aws_eks_cluster.atlas.name
  node_group_name = "compute-ondemand"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = module.vpc.private_subnets
  
  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }
  
  capacity_type  = "ON_DEMAND"
  
  instance_types = ["c6i.4xlarge", "c5.4xlarge"]
  
  labels = {
    workload-type = "compute"
    performance-critical = "true"
  }
  
  taints = [
    {
      key    = "workload-type"
      value  = "compute"
      effect = "NO_SCHEDULE"
    }
  ]
}
```

### 7.3 Cost Monitoring Dashboard

```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0, "y": 0,
      "width": 12, "height": 6,
      "properties": {
        "title": "Daily Spend",
        "view": "timeSeries",
        "stacked": true,
        "region": "us-east-1",
        "metrics": [
          ["AWS/Billing", "EstimatedCharges", "ServiceName", "EC2", { "label": "EC2" }],
          ["AWS/Billing", "EstimatedCharges", "ServiceName", "RDS", { "label": "RDS" }],
          ["AWS/Billing", "EstimatedCharges", "ServiceName", "S3", { "label": "S3" }],
          ["AWS/Billing", "EstimatedCharges", "ServiceName", "Lambda", { "label": "Lambda" }]
        ],
        "period": 86400,
        "stat": "Sum"
      }
    },
    {
      "type": "metric",
      "x": 12, "y": 0,
      "width": 12, "height": 6,
      "properties": {
        "title": "Cost by Environment",
        "view": "bar",
        "region": "us-east-1",
        "metrics": [
          ["Estimated/Cost", "Environment", "Production", { "label": "Production" }],
          ["Estimated/Cost", "Environment", "Staging", { "label": "Staging" }],
          ["Estimated/Cost", "Environment", "Development", { "label": "Development" }]
        ]
      }
    }
  ]
}
```

---

## 8. Compliance Framework

### 8.1 Security Controls

```yaml
# terraform/modules/security/guardrails.tf

# AWS Config Rules for Compliance

resource "aws_config_config_rule" "s3_public_read_prohibited" {
  name = "s3-public-read-prohibited"
  
  source {
    owner             = "AWS"
    source_detail     = ""
    custom_identifier  = "S3PublicReadProhibited"
  }
  
  scope {
    compliance_types = ["IT_GENERAL_CONTROLS"]
  }
}

resource "aws_config_config_rule" "encrypted_volumes" {
  name = "encrypted-volumes"
  
  source {
    owner             = "AWS"
    source_detail     = ""
    custom_identifier  = "EncryptedVolumes"
  }
}

# IAM Policies

resource "aws_iam_policy" "least_privilege_lambda" {
  name = "atlas-lambda-least-privilege"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::atlas-data-${var.environment}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:atlas/*"
      },
      {
        Effect = "Deny"
        NotAction = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
        Condition = {
          StringNotEquals = {
            "aws:ResourceTag/Project": "AtlasHumanitarian"
          }
        }
      }
    ]
  })
}
```

### 8.2 Audit Logging

```yaml
# terraform/modules/security/cloudtrail.tf

resource "aws_cloudtrail" "atlas" {
  name                          = "atlas-cloudtrail"
  s3_bucket_name                = aws_s3_bucket.logs.id
  s3_key_prefix                = "cloudtrail/"
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  is_organization_trail         = true
  
  event_selector {
    read_write_type = "All"
    include_management_events = true
    
    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::atlas-data-*/*"]
    }
  }
  
  tags = {
    Project     = "AtlasHumanitarian"
    Environment = var.environment
    Compliance  = "SOC2|GDPR"
  }
}

resource "aws_cloudtrail" "atlas_events" {
  name                  = "atlas-data-events"
  s3_bucket_name        = aws_s3_bucket.logs.id
  s3_key_prefix         = "data-events/"
  include_global_service_events = false
  enable_log_file_validation = true
  
  event_selector {
    read_write_type = "ReadOnly"
    data_resource {
      type   = "AWS::RDS::DBInstance"
      values = ["arn:aws:rds:*:*:db:*"]
    }
  }
}
```

---

## Summary

This cloud infrastructure architecture provides:

1. **Multi-Cloud Strategy**: Optimal service allocation across AWS (primary), GCP (secondary), and Azure (compliance)

2. **Serverless Framework**: Workload classification for serverless vs containerized deployments

3. **Container Strategy**: Standardized Docker images, multi-stage builds, security scanning, semantic versioning

4. **Kubernetes Architecture**: Production-ready EKS cluster with node pools, namespaces, quotas, network policies

5. **CI/CD Pipelines**: Automated GitHub Actions workflows for build, test, deploy

6. **Cost Optimization**: Reserved instances, spot strategy, cost monitoring dashboards

7. **Compliance**: Security controls, audit logging, GDPR alignment