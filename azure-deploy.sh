#!/bin/bash

# Atlas Genesis Azure Deployment Script
# This script deploys the complete Atlas Genesis platform to Azure

set -e

# Configuration
RESOURCE_GROUP="atlas-genesis-rg"
LOCATION="eastus"
ENVIRONMENT="production"

# Application names
FRONTEND_APP="atlas-genesis-frontend"
BACKEND_APP="atlas-genesis-backend"
DATABASE_SERVER="atlas-genesis-db"
DATABASE_NAME="atlas_genesis"
KEY_VAULT="atlas-genesis-kv"
CDN_PROFILE="atlas-genesis-cdn"
CDN_ENDPOINT="atlas-genesis-frontend"
APP_INSIGHTS="atlas-genesis-insights"
CONTAINER_REGISTRY="atlasgenesisregistry"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        error "Azure CLI is not installed. Please install it first."
        echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    success "Azure CLI is installed"
}

# Check if logged in to Azure
check_login() {
    if ! az account show &> /dev/null; then
        error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    success "Logged in to Azure"
}

# Create resource group
create_resource_group() {
    log "Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags environment="$ENVIRONMENT" project="atlas-genesis"
    success "Resource group created"
}

# Deploy database
deploy_database() {
    log "Deploying Azure Database for PostgreSQL"
    
    # Check if database already exists
    if az postgres server show --name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        warning "Database server already exists"
    else
        az deployment group create \
            --resource-group "$RESOURCE_GROUP" \
            --template-file azure-database-config.json \
            --parameters \
                serverName="$DATABASE_SERVER" \
                databaseName="$DATABASE_NAME" \
                administratorLogin="atlasadmin" \
                administratorLoginPassword="$DB_PASSWORD" \
                location="$LOCATION" \
                skuName="GP_Gen5_4" \
                backupRetentionDays=35 \
                geoRedundantBackup="Enabled" \
                storageMB=10240
        
        success "Database deployed"
    fi
}

# Deploy Key Vault
deploy_keyvault() {
    log "Deploying Azure Key Vault"
    
    # Get current user's object ID
    USER_OBJECT_ID=$(az ad signed-in-user show --query objectId -o tsv)
    TENANT_ID=$(az account show --query tenantId -o tsv)
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file azure-keyvault-config.json \
        --parameters \
            keyVaultName="$KEY_VAULT" \
            location="$LOCATION" \
            tenantId="$TENANT_ID" \
            objectId="$USER_OBJECT_ID" \
            sku="standard"
    
    success "Key Vault deployed"
}

# Deploy Application Insights
deploy_app_insights() {
    log "Deploying Application Insights"
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file azure-application-insights.json \
        --parameters \
            appInsightsName="$APP_INSIGHTS" \
            location="$LOCATION" \
            applicationType="web" \
            retentionInDays=90
    
    success "Application Insights deployed"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend to Azure App Service"
    
    # Get Application Insights connection string
    APP_INSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" --query connectionString -o tsv)
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file azure-frontend-config.json \
        --parameters \
            webAppName="$FRONTEND_APP" \
            location="$LOCATION" \
            appServicePlanName="atlas-genesis-plan" \
            backendApiUrl="https://$BACKEND_APP.azurewebsites.net/api" \
            supabaseUrl="$SUPABASE_URL" \
            supabaseAnonKey="$SUPABASE_ANON_KEY"
    
    # Configure Application Insights for frontend
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$FRONTEND_APP" \
        --settings APPLICATIONINSIGHTS_CONNECTION_STRING="$APP_INSIGHTS_CONNECTION_STRING"
    
    success "Frontend deployed"
}

# Deploy backend
deploy_backend() {
    log "Deploying backend to Azure Container Apps"
    
    # Create Container Registry if it doesn't exist
    if ! az acr show --name "$CONTAINER_REGISTRY" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        az acr create \
            --resource-group "$RESOURCE_GROUP" \
            --name "$CONTAINER_REGISTRY" \
            --sku Basic \
            --admin-enabled true
    fi
    
    # Login to ACR
    az acr login --name "$CONTAINER_REGISTRY"
    
    # Build and push images
    log "Building and pushing Docker images"
    docker build -t "$CONTAINER_REGISTRY.azurecr.io/frontend:latest" ./
    docker build -t "$CONTAINER_REGISTRY.azurecr.io/backend:latest" ./backend/
    docker push "$CONTAINER_REGISTRY.azurecr.io/frontend:latest"
    docker push "$CONTAINER_REGISTRY.azurecr.io/backend:latest"
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file azure-backend-config.json \
        --parameters \
            containerAppName="$BACKEND_APP" \
            location="$LOCATION" \
            containerImage="$CONTAINER_REGISTRY.azurecr.io/backend:latest" \
            databaseServerName="$DATABASE_SERVER" \
            databaseName="$DATABASE_NAME" \
            databaseAdminLogin="atlasadmin" \
            databaseAdminPassword="$DB_PASSWORD" \
            frontendUrl="https://$FRONTEND_APP.azurewebsites.net"
    
    success "Backend deployed"
}

# Deploy CDN
deploy_cdn() {
    log "Deploying Azure CDN"
    
    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file azure-cdn-config.json \
        --parameters \
            cdnProfileName="$CDN_PROFILE" \
            cdnEndpointName="$CDN_ENDPOINT" \
            location="$LOCATION" \
            originHostName="$FRONTEND_APP.azurewebsites.net"
    
    success "CDN deployed"
}

# Configure database
configure_database() {
    log "Configuring database"
    
    # Wait for database to be ready
    sleep 60
    
    # Run migrations
    log "Running database migrations"
    cd backend
    npm run migrate
    cd ..
    
    success "Database configured"
}

# Configure SSL and custom domains
configure_ssl() {
    log "Configuring SSL certificates"
    
    # Note: This would require purchasing and uploading SSL certificates
    # For now, we'll use Azure's managed certificates
    
    warning "SSL configuration requires manual setup of custom domains and certificates"
    warning "Please visit Azure Portal to configure custom domains and SSL"
}

# Configure monitoring and alerts
configure_monitoring() {
    log "Configuring monitoring and alerts"
    
    # Create alert rules
    az monitor metrics alert create \
        --name "High CPU Usage" \
        --resource-group "$RESOURCE_GROUP" \
        --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$BACKEND_APP" \
        --condition "avg CpuPercentage > 80" \
        --description "Alert when CPU usage is high" \
        --evaluation-frequency "5m" \
        --window-size "5m"
    
    success "Monitoring configured"
}

# Run health checks
health_check() {
    log "Running health checks"
    
    sleep 120  # Wait for deployment to stabilize
    
    # Check frontend
    if curl -f "https://$FRONTEND_APP.azurewebsites.net" &> /dev/null; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    # Check backend
    if curl -f "https://$BACKEND_APP.azurewebsites.net/health" &> /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check CDN
    if curl -f "https://$CDN_ENDPOINT.azureedge.net" &> /dev/null; then
        success "CDN is healthy"
    else
        error "CDN health check failed"
    fi
}

# Display deployment summary
show_summary() {
    log "Deployment Summary"
    echo ""
    echo "========================================"
    echo "Atlas Genesis Platform Deployment Complete"
    echo "========================================"
    echo ""
    echo "Frontend URL: https://$FRONTEND_APP.azurewebsites.net"
    echo "Backend API: https://$BACKEND_APP.azurewebsites.net"
    echo "CDN URL: https://$CDN_ENDPOINT.azureedge.net"
    echo "Database Server: $DATABASE_SERVER.postgres.database.azure.com"
    echo "Application Insights: $APP_INSIGHTS"
    echo "Key Vault: $KEY_VAULT"
    echo ""
    echo "Next Steps:"
    echo "1. Configure custom domains and SSL certificates"
    echo "2. Set up additional monitoring and alerting"
    echo "3. Configure backup and disaster recovery"
    echo "4. Test the application thoroughly"
    echo ""
    echo "For support, visit: https://github.com/atlas-genesis/atlas-genesis"
    echo "========================================"
}

# Main deployment function
main() {
    log "Starting Atlas Genesis Azure Deployment"
    
    # Check prerequisites
    check_azure_cli
    check_login
    
    # Get sensitive information
    read -s -p "Enter database password: " DB_PASSWORD
    echo ""
    read -p "Enter Supabase URL: " SUPABASE_URL
    read -s -p "Enter Supabase anonymous key: " SUPABASE_ANON_KEY
    echo ""
    
    # Run deployment steps
    create_resource_group
    deploy_database
    deploy_keyvault
    deploy_app_insights
    deploy_frontend
    deploy_backend
    deploy_cdn
    configure_database
    configure_ssl
    configure_monitoring
    health_check
    show_summary
    
    success "Deployment completed successfully!"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"