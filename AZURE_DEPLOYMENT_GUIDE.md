# Atlas Genesis - Azure Deployment Guide

Complete guide for deploying the Atlas Genesis platform to Microsoft Azure cloud infrastructure.

## 🚀 Quick Start

### Prerequisites

- Azure CLI installed and configured
- Azure subscription with appropriate permissions
- Docker and Docker Compose
- Node.js 18+ and npm
- Azure DevOps or GitHub account for CI/CD

### One-Click Deployment

```bash
# Clone the repository
git clone https://github.com/atlas-genesis/atlas-genesis.git
cd atlas-genesis

# Run the deployment script
chmod +x azure-deploy.sh
./azure-deploy.sh
```

## 📋 Architecture Overview

The Azure deployment consists of the following components:

### Frontend Layer
- **Azure App Service**: Hosts the React frontend application
- **Azure CDN**: Global content delivery for static assets
- **Azure Front Door**: Global load balancing and WAF

### Backend Layer
- **Azure Container Apps**: Serverless container platform for backend services
- **Azure Container Registry**: Container image storage
- **Azure Functions**: Serverless functions for specific tasks

### Data Layer
- **Azure Database for PostgreSQL**: Managed PostgreSQL with PostGIS
- **Azure Cache for Redis**: Caching layer for performance

### Monitoring & Security
- **Azure Application Insights**: Application monitoring and telemetry
- **Azure Key Vault**: Secrets and certificate management
- **Azure Monitor**: Infrastructure monitoring and alerting

## 🏗️ Deployment Components

### 1. Infrastructure as Code

We provide both ARM templates and Bicep files for infrastructure deployment:

#### ARM Templates
- `azure-frontend-config.json` - Frontend App Service configuration
- `azure-backend-config.json` - Backend Container Apps configuration
- `azure-database-config.json` - PostgreSQL database setup
- `azure-keyvault-config.json` - Key Vault and secrets
- `azure-cdn-config.json` - CDN configuration
- `azure-application-insights.json` - Monitoring setup

#### Bicep Configuration
- `azure-bicep-config.bicep` - Complete infrastructure definition

### 2. CI/CD Pipeline

#### GitHub Actions
- `.github/workflows/azure-deploy.yml` - Complete deployment pipeline
- Automated testing, building, and deployment
- Multi-environment support (dev, staging, production)

#### Azure DevOps Pipeline
```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: 'atlas-genesis-variables'

stages:
- stage: Build
  jobs:
  - job: BuildApplication
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    
    - script: npm install
      displayName: 'Install dependencies'
    
    - script: npm run build
      displayName: 'Build application'

- stage: Deploy
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployToAzure
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureCLI@2
            inputs:
              azureSubscription: 'atlas-genesis-subscription'
              scriptType: 'bash'
              scriptLocation: 'inlineScript'
              inlineScript: |
                az deployment group create \
                  --resource-group $(resourceGroup) \
                  --template-file azure-bicep-config.bicep \
                  --parameters @parameters.json
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=https://atlas-genesis-backend.azurewebsites.net/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GA_MEASUREMENT_ID=GA-XXXXXXXXXX
```

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require

# Authentication
JWT_ACCESS_SECRET=your-super-secure-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-min-32-chars

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@atlas-genesis.com

# Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=your-app-insights-connection-string
```

### Azure Resource Configuration

#### Resource Group
```bash
az group create --name atlas-genesis-rg --location eastus
```

#### Key Vault Setup
```bash
az keyvault create --name atlas-genesis-kv --resource-group atlas-genesis-rg --location eastus
az keyvault secret set --vault-name atlas-genesis-kv --name "DatabasePassword" --value "your-password"
```

#### Application Insights
```bash
az monitor app-insights component create \
  --app atlas-genesis-insights \
  --location eastus \
  --resource-group atlas-genesis-rg \
  --application-type web
```

## 🚀 Deployment Steps

### Step 1: Infrastructure Setup

1. **Create Resource Group**
   ```bash
   az group create --name atlas-genesis-rg --location eastus
   ```

2. **Deploy Infrastructure**
   ```bash
   # Using Bicep
   az deployment group create \
     --resource-group atlas-genesis-rg \
     --template-file azure-bicep-config.bicep \
     --parameters @parameters.json

   # Using ARM templates
   az deployment group create \
     --resource-group atlas-genesis-rg \
     --template-file azure-database-config.json \
     --parameters serverName=atlas-genesis-db administratorLogin=atlasadmin
   ```

### Step 2: Container Registry Setup

```bash
# Create Container Registry
az acr create \
  --resource-group atlas-genesis-rg \
  --name atlasgenesisregistry \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name atlasgenesisregistry

# Build and push images
docker build -t atlasgenesisregistry.azurecr.io/frontend:latest ./
docker build -t atlasgenesisregistry.azurecr.io/backend:latest ./backend/
docker push atlasgenesisregistry.azurecr.io/frontend:latest
docker push atlasgenesisregistry.azurecr.io/backend:latest
```

### Step 3: Application Deployment

1. **Deploy Backend**
   ```bash
   az deployment group create \
     --resource-group atlas-genesis-rg \
     --template-file azure-backend-config.json \
     --parameters containerImage=atlasgenesisregistry.azurecr.io/backend:latest
   ```

2. **Deploy Frontend**
   ```bash
   az deployment group create \
     --resource-group atlas-genesis-rg \
     --template-file azure-frontend-config.json \
     --parameters webAppName=atlas-genesis-frontend
   ```

3. **Deploy CDN**
   ```bash
   az deployment group create \
     --resource-group atlas-genesis-rg \
     --template-file azure-cdn-config.json \
     --parameters cdnEndpointName=atlas-genesis-frontend
   ```

### Step 4: Configuration

1. **Configure Application Settings**
   ```bash
   # Frontend settings
   az webapp config appsettings set \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-frontend \
     --settings VITE_API_URL=https://atlas-genesis-backend.azurewebsites.net/api

   # Backend settings
   az webapp config appsettings set \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-backend \
     --settings DATABASE_URL="postgresql://atlasadmin:password@atlas-genesis-db.postgres.database.azure.com:5432/atlas_genesis?sslmode=require"
   ```

2. **Configure CORS**
   ```bash
   az webapp cors add \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-backend \
     --allowed-origins "https://atlas-genesis-frontend.azurewebsites.net"
   ```

3. **Configure SSL**
   ```bash
   # Enable HTTPS-only
   az webapp update --resource-group atlas-genesis-rg --name atlas-genesis-frontend --https-only true
   ```

### Step 5: Database Setup

1. **Run Migrations**
   ```bash
   cd backend
   npm run migrate
   ```

2. **Seed Initial Data**
   ```bash
   npm run seed
   ```

## 🔍 Monitoring and Observability

### Application Insights Configuration

1. **Enable Application Insights**
   ```bash
   az webapp config appsettings set \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-backend \
     --settings APPLICATIONINSIGHTS_CONNECTION_STRING="$(az monitor app-insights component show --app atlas-genesis-insights --resource-group atlas-genesis-rg --query connectionString -o tsv)"
   ```

2. **Configure Telemetry**
   ```javascript
   // In your backend application
   const appInsights = require('applicationinsights');
   appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
   appInsights.start();
   ```

### Azure Monitor Alerts

```bash
# Create alert for high CPU usage
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group atlas-genesis-rg \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/atlas-genesis-rg/providers/Microsoft.Web/sites/atlas-genesis-backend" \
  --condition "avg CpuPercentage > 80" \
  --description "Alert when CPU usage is high" \
  --evaluation-frequency "5m" \
  --window-size "5m"

# Create alert for high memory usage
az monitor metrics alert create \
  --name "High Memory Usage" \
  --resource-group atlas-genesis-rg \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/atlas-genesis-rg/providers/Microsoft.Web/sites/atlas-genesis-backend" \
  --condition "avg MemoryPercentage > 80" \
  --description "Alert when memory usage is high" \
  --evaluation-frequency "5m" \
  --window-size "5m"
```

## 🔒 Security Configuration

### Azure Key Vault Integration

1. **Store Secrets in Key Vault**
   ```bash
   az keyvault secret set --vault-name atlas-genesis-kv --name "JWT-Access-Secret" --value "your-jwt-secret"
   az keyvault secret set --vault-name atlas-genesis-kv --name "Database-Password" --value "your-db-password"
   ```

2. **Configure App Service to Use Key Vault**
   ```bash
   az webapp config appsettings set \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-backend \
     --settings JWT_ACCESS_SECRET="@Microsoft.KeyVault(SecretUri=https://atlas-genesis-kv.vault.azure.net/secrets/JWT-Access-Secret)"
   ```

### Network Security

1. **Configure Network Security Groups**
   ```bash
   az network nsg create --resource-group atlas-genesis-rg --name atlas-genesis-nsg --location eastus
   az network nsg rule create --resource-group atlas-genesis-rg --nsg-name atlas-genesis-nsg --name Allow-HTTPS --protocol Tcp --direction Inbound --access Allow --priority 100 --source-address-prefixes Internet --source-port-ranges "*" --destination-address-prefixes "*" --destination-port-ranges 443
   ```

2. **Enable Azure WAF**
   ```bash
   az network front-door waf-policy create \
     --resource-group atlas-genesis-rg \
     --name atlas-genesis-waf \
     --mode Detection \
     --rule-set-type OWASP \
     --rule-set-version 3.2
   ```

## 📊 Performance Optimization

### Azure CDN Configuration

1. **Enable Compression**
   ```bash
   az cdn endpoint update \
     --resource-group atlas-genesis-rg \
     --profile-name atlas-genesis-cdn \
     --name atlas-genesis-frontend \
     --enable-compression true
   ```

2. **Configure Caching Rules**
   ```bash
   az cdn endpoint rule add \
     --resource-group atlas-genesis-rg \
     --profile-name atlas-genesis-cdn \
     --name atlas-genesis-frontend \
     --order 1 \
     --rule-name "Cache Static Assets" \
     --match-conditions urlPath beginsWith "/static/" \
     --actions cacheExpiration setSeconds=86400 behavior=Override
   ```

### Database Optimization

1. **Enable Query Performance Insights**
   ```bash
   az postgres server configuration set \
     --resource-group atlas-genesis-rg \
     --server-name atlas-genesis-db \
     --name log_min_duration_statement \
     --value 1000
   ```

2. **Configure Connection Pooling**
   ```javascript
   // In your backend application
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The provided GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) includes:

- **Build Stage**: Install dependencies, build frontend and backend
- **Test Stage**: Run unit tests and integration tests
- **Deploy Stage**: Deploy to Azure using ARM templates
- **Post-Deploy Stage**: Run health checks and notify

### Environment-Specific Deployments

1. **Development Environment**
   ```yaml
   environment: development
   variables:
     - group: 'atlas-genesis-dev-variables'
   ```

2. **Staging Environment**
   ```yaml
   environment: staging
   variables:
     - group: 'atlas-genesis-staging-variables'
   ```

3. **Production Environment**
   ```yaml
   environment: production
   variables:
     - group: 'atlas-genesis-prod-variables'
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check Azure CLI authentication: `az account show`
   - Verify resource group exists: `az group show --name atlas-genesis-rg`
   - Check deployment logs: `az deployment group show --name deployment-name --resource-group atlas-genesis-rg`

2. **Database Connection Issues**
   - Verify firewall rules allow connections
   - Check connection string format
   - Ensure SSL mode is required

3. **Application Startup Issues**
   - Check Application Insights logs
   - Verify environment variables are set correctly
   - Check container logs: `az containerapp logs show --name atlas-genesis-backend --resource-group atlas-genesis-rg`

### Health Checks

```bash
# Check frontend health
curl -f https://atlas-genesis-frontend.azurewebsites.net

# Check backend health
curl -f https://atlas-genesis-backend.azurewebsites.net/health

# Check database connectivity
az postgres server show --name atlas-genesis-db --resource-group atlas-genesis-rg
```

## 📈 Scaling

### Auto-Scaling Configuration

1. **App Service Auto-Scaling**
   ```bash
   az monitor autoscale create \
     --resource-group atlas-genesis-rg \
     --resource atlas-genesis-frontend \
     --resource-type Microsoft.Web/sites \
     --name atlas-genesis-frontend-autoscale \
     --min-count 1 \
     --max-count 10 \
     --default-count 2
   ```

2. **Container Apps Auto-Scaling**
   ```bash
   az containerapp update \
     --name atlas-genesis-backend \
     --resource-group atlas-genesis-rg \
     --min-replicas 1 \
     --max-replicas 20
   ```

## 📞 Support

For deployment issues or questions:

1. Check the [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
2. Review Application Insights telemetry
3. Check Azure Monitor alerts and logs
4. Contact the Atlas Genesis development team

## 📝 License

This deployment guide is part of the Atlas Genesis project, licensed under MIT License.

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0
**Status**: Production Ready