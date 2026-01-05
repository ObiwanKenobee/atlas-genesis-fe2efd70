#!/bin/bash

# Atlas Genesis Azure Health Check Script
# This script performs comprehensive health checks on the deployed Azure infrastructure

set -e

# Configuration
RESOURCE_GROUP="atlas-genesis-rg"
FRONTEND_APP="atlas-genesis-frontend"
BACKEND_APP="atlas-genesis-backend"
DATABASE_SERVER="atlas-genesis-db"
DATABASE_NAME="atlas_genesis"
CDN_ENDPOINT="atlas-genesis-frontend"
APP_INSIGHTS="atlas-genesis-insights"

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

# Check if Azure CLI is installed and logged in
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        error "Azure CLI is not installed"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        error "Not logged in to Azure"
        exit 1
    fi
    
    success "Azure CLI is ready"
}

# Check resource group exists
check_resource_group() {
    log "Checking resource group: $RESOURCE_GROUP"
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        success "Resource group exists"
    else
        error "Resource group not found"
        exit 1
    fi
}

# Check frontend App Service
check_frontend() {
    log "Checking frontend App Service: $FRONTEND_APP"
    
    # Check if App Service exists
    if ! az webapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "Frontend App Service not found"
        return 1
    fi
    
    # Check App Service state
    state=$(az webapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query state -o tsv)
    if [ "$state" != "Running" ]; then
        error "Frontend App Service is not running (state: $state)"
        return 1
    fi
    
    # Check HTTPS availability
    frontend_url="https://$FRONTEND_APP.azurewebsites.net"
    if curl -f -s -o /dev/null "$frontend_url"; then
        success "Frontend is accessible via HTTPS"
    else
        error "Frontend is not accessible via HTTPS"
        return 1
    fi
    
    # Check response time
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$frontend_url")
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
        warning "Frontend response time is slow: ${response_time}s"
    else
        success "Frontend response time is good: ${response_time}s"
    fi
    
    success "Frontend health check passed"
}

# Check backend Container App
check_backend() {
    log "Checking backend Container App: $BACKEND_APP"
    
    # Check if Container App exists
    if ! az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "Backend Container App not found"
        return 1
    fi
    
    # Check Container App state
    state=$(az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query properties.provisioningState -o tsv)
    if [ "$state" != "Succeeded" ]; then
        error "Backend Container App is not ready (state: $state)"
        return 1
    fi
    
    # Get Container App URL
    backend_url=$(az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)
    
    # Check health endpoint
    health_url="https://$backend_url/health"
    if curl -f -s -o /dev/null "$health_url"; then
        success "Backend health endpoint is responding"
    else
        error "Backend health endpoint is not responding"
        return 1
    fi
    
    # Check API endpoint
    api_url="https://$backend_url/api"
    if curl -f -s -o /dev/null "$api_url"; then
        success "Backend API endpoint is responding"
    else
        error "Backend API endpoint is not responding"
        return 1
    fi
    
    # Check response time
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$health_url")
    if (( $(echo "$response_time > 3.0" | bc -l) )); then
        warning "Backend response time is slow: ${response_time}s"
    else
        success "Backend response time is good: ${response_time}s"
    fi
    
    success "Backend health check passed"
}

# Check database
check_database() {
    log "Checking Azure Database for PostgreSQL: $DATABASE_SERVER"
    
    # Check if database server exists
    if ! az postgres server show --name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "Database server not found"
        return 1
    fi
    
    # Check database server state
    state=$(az postgres server show --name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" --query state -o tsv)
    if [ "$state" != "Ready" ]; then
        error "Database server is not ready (state: $state)"
        return 1
    fi
    
    # Check if database exists
    if ! az postgres db show --name "$DATABASE_NAME" --server-name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "Database not found"
        return 1
    fi
    
    # Check connection (this would require actual credentials)
    # For now, we'll just check if the server is accessible
    server_fqdn=$(az postgres server show --name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" --query fullyQualifiedDomainName -o tsv)
    if nc -z -w5 "${server_fqdn}" 5432; then
        success "Database server is accessible"
    else
        error "Database server is not accessible"
        return 1
    fi
    
    success "Database health check passed"
}

# Check CDN
check_cdn() {
    log "Checking Azure CDN: $CDN_ENDPOINT"
    
    # Check if CDN endpoint exists
    if ! az cdn endpoint show --name "$CDN_ENDPOINT" --profile-name "$CDN_PROFILE" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "CDN endpoint not found"
        return 1
    fi
    
    # Check CDN endpoint state
    state=$(az cdn endpoint show --name "$CDN_ENDPOINT" --profile-name "$CDN_PROFILE" --resource-group "$RESOURCE_GROUP" --query resourceState -o tsv)
    if [ "$state" != "Running" ]; then
        error "CDN endpoint is not running (state: $state)"
        return 1
    fi
    
    # Check CDN accessibility
    cdn_url="https://$CDN_ENDPOINT.azureedge.net"
    if curl -f -s -o /dev/null "$cdn_url"; then
        success "CDN is accessible"
    else
        error "CDN is not accessible"
        return 1
    fi
    
    success "CDN health check passed"
}

# Check Application Insights
check_app_insights() {
    log "Checking Application Insights: $APP_INSIGHTS"
    
    # Check if Application Insights exists
    if ! az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        error "Application Insights not found"
        return 1
    fi
    
    # Check Application Insights state
    state=$(az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" --query provisioningState -o tsv)
    if [ "$state" != "Succeeded" ]; then
        error "Application Insights is not ready (state: $state)"
        return 1
    fi
    
    success "Application Insights health check passed"
}

# Check Key Vault
check_key_vault() {
    log "Checking Azure Key Vault"
    
    # Get Key Vault name from resource group
    key_vault_name=$(az keyvault list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    
    if [ -z "$key_vault_name" ]; then
        error "Key Vault not found in resource group"
        return 1
    fi
    
    # Check Key Vault state
    if az keyvault show --name "$key_vault_name" &> /dev/null; then
        success "Key Vault is accessible"
    else
        error "Key Vault is not accessible"
        return 1
    fi
    
    success "Key Vault health check passed"
}

# Check container registry
check_container_registry() {
    log "Checking Azure Container Registry"
    
    # Get Container Registry name from resource group
    registry_name=$(az acr list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    
    if [ -z "$registry_name" ]; then
        error "Container Registry not found in resource group"
        return 1
    fi
    
    # Check Container Registry state
    state=$(az acr show --name "$registry_name" --query provisioningState -o tsv)
    if [ "$state" != "Succeeded" ]; then
        error "Container Registry is not ready (state: $state)"
        return 1
    fi
    
    success "Container Registry health check passed"
}

# Check monitoring and alerts
check_monitoring() {
    log "Checking monitoring and alerting"
    
    # Check if alerts exist
    alerts_count=$(az monitor metrics alert list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv)
    
    if [ "$alerts_count" -gt 0 ]; then
        success "Found $alerts_count alert rules"
    else
        warning "No alert rules found"
    fi
    
    # Check Application Insights telemetry
    app_insights_id=$(az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" --query id -o tsv)
    
    # Check recent telemetry (last 1 hour)
    recent_telemetry=$(az monitor metrics list --resource "$app_insights_id" --metric "requests/count" --time-grain "PT1H" --query "value[0].timeseries[0].data[-1].total" -o tsv 2>/dev/null || echo "0")
    
    if [ "$recent_telemetry" -gt 0 ]; then
        success "Application Insights is receiving telemetry"
    else
        warning "No recent telemetry found in Application Insights"
    fi
    
    success "Monitoring health check passed"
}

# Check security configuration
check_security() {
    log "Checking security configuration"
    
    # Check if HTTPS is enforced for frontend
    https_only=$(az webapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query httpsOnly -o tsv)
    if [ "$https_only" = "true" ]; then
        success "HTTPS is enforced for frontend"
    else
        error "HTTPS is not enforced for frontend"
        return 1
    fi
    
    # Check if database has SSL enforcement
    ssl_enforcement=$(az postgres server show --name "$DATABASE_SERVER" --resource-group "$RESOURCE_GROUP" --query sslEnforcement -o tsv)
    if [ "$ssl_enforcement" = "Enabled" ]; then
        success "SSL enforcement is enabled for database"
    else
        error "SSL enforcement is not enabled for database"
        return 1
    fi
    
    success "Security configuration check passed"
}

# Generate health report
generate_report() {
    log "Generating health report"
    
    report_file="health-report-$(date +%Y%m%d-%H%M%S).json"
    
    # Collect resource information
    resources_info=$(az resource list --resource-group "$RESOURCE_GROUP" --query "[].{name:name, type:type, location:location, provisioningState:properties.provisioningState}" -o json)
    
    # Create report
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "resourceGroup": "$RESOURCE_GROUP",
  "resources": $resources_info,
  "summary": {
    "totalResources": $(az resource list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv),
    "runningResources": $(az resource list --resource-group "$RESOURCE_GROUP" --query "[?properties.provisioningState=='Succeeded'] | length(@)" -o tsv)
  }
}
EOF
    
    success "Health report generated: $report_file"
}

# Main health check function
main() {
    log "Starting Atlas Genesis Azure Health Check"
    echo "=========================================="
    
    # Run all health checks
    check_azure_cli
    check_resource_group
    check_frontend
    check_backend
    check_database
    check_cdn
    check_app_insights
    check_key_vault
    check_container_registry
    check_monitoring
    check_security
    
    # Generate report
    generate_report
    
    echo "=========================================="
    success "All health checks passed successfully!"
    log "Health check completed at $(date)"
}

# Handle script interruption
trap 'error "Health check interrupted"; exit 1' INT TERM

# Run main function
main "$@"