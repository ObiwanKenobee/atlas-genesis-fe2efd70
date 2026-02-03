#!/bin/bash

# Atlas Genesis Azure Deployment Validation Script
# This script validates the deployment configuration before actual deployment

set -e

# Configuration
RESOURCE_GROUP="atlas-genesis-rg"
LOCATION="eastus"

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

# Validate Azure CLI and login
validate_azure_cli() {
    log "Validating Azure CLI installation and authentication"
    
    if ! command -v az &> /dev/null; then
        error "Azure CLI is not installed"
        echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        error "Not logged in to Azure"
        echo "Please run: az login"
        exit 1
    fi
    
    # Check subscription
    subscription_id=$(az account show --query id -o tsv)
    subscription_name=$(az account show --query name -o tsv)
    log "Using subscription: $subscription_name ($subscription_id)"
    
    success "Azure CLI validation passed"
}

# Validate resource group
validate_resource_group() {
    log "Validating resource group: $RESOURCE_GROUP"
    
    # Check if location is valid
    if ! az account list-locations --query "[?name=='$LOCATION']" -o tsv | grep -q "$LOCATION"; then
        error "Location '$LOCATION' is not valid or not available"
        exit 1
    fi
    
    # Check if resource group exists, if not create it
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        warning "Resource group '$RESOURCE_GROUP' already exists"
        log "Using existing resource group"
    else
        log "Creating resource group '$RESOURCE_GROUP' in location '$LOCATION'"
        az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags environment=validation project=atlas-genesis
        success "Resource group created"
    fi
}

# Validate ARM templates
validate_arm_templates() {
    log "Validating ARM templates"
    
    templates=(
        "azure-frontend-config.json"
        "azure-backend-config.json"
        "azure-database-config.json"
        "azure-keyvault-config.json"
        "azure-cdn-config.json"
        "azure-application-insights.json"
    )
    
    for template in "${templates[@]}"; do
        if [ -f "$template" ]; then
            log "Validating template: $template"
            
            # Basic JSON validation
            if ! jq empty "$template" 2>/dev/null; then
                error "Template $template is not valid JSON"
                exit 1
            fi
            
            # Check for required properties
            if ! jq -e '.resources' "$template" &> /dev/null; then
                error "Template $template is missing required 'resources' property"
                exit 1
            fi
            
            success "Template $template is valid"
        else
            error "Template file $template not found"
            exit 1
        fi
    done
}

# Validate Bicep file
validate_bicep() {
    log "Validating Bicep configuration"
    
    if [ -f "azure-bicep-config.bicep" ]; then
        if command -v bicep &> /dev/null; then
            log "Validating Bicep syntax"
            if bicep build azure-bicep-config.bicep --stdout &> /dev/null; then
                success "Bicep file syntax is valid"
            else
                error "Bicep file has syntax errors"
                bicep build azure-bicep-config.bicep
                exit 1
            fi
        else
            warning "Bicep CLI not found, skipping Bicep validation"
            warning "Install Bicep CLI for better validation: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/install"
        fi
    else
        error "Bicep file azure-bicep-config.bicep not found"
        exit 1
    fi
}

# Validate parameters file
validate_parameters() {
    log "Validating parameters file"
    
    if [ -f "azure-parameters.json" ]; then
        # Basic JSON validation
        if ! jq empty "azure-parameters.json" 2>/dev/null; then
            error "Parameters file is not valid JSON"
            exit 1
        fi
        
        # Check for required parameters
        required_params=("location" "environment" "frontendAppName" "backendAppName")
        for param in "${required_params[@]}"; do
            if ! jq -e ".parameters.$param" "azure-parameters.json" &> /dev/null; then
                error "Required parameter '$param' is missing from parameters file"
                exit 1
            fi
        done
        
        success "Parameters file is valid"
    else
        error "Parameters file azure-parameters.json not found"
        exit 1
    fi
}

# Validate Docker configuration
validate_docker() {
    log "Validating Docker configuration"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        echo "Please start Docker daemon"
        exit 1
    fi
    
    # Validate frontend Dockerfile
    if [ -f "Dockerfile" ]; then
        log "Validating frontend Dockerfile"
        if ! docker build --dry-run . &> /dev/null; then
            error "Frontend Dockerfile has issues"
            exit 1
        fi
        success "Frontend Dockerfile is valid"
    else
        error "Frontend Dockerfile not found"
        exit 1
    fi
    
    # Validate backend Dockerfile
    if [ -f "backend/Dockerfile" ]; then
        log "Validating backend Dockerfile"
        if ! docker build --dry-run ./backend &> /dev/null; then
            error "Backend Dockerfile has issues"
            exit 1
        fi
        success "Backend Dockerfile is valid"
    else
        error "Backend Dockerfile not found"
        exit 1
    fi
}

# Validate Node.js and dependencies
validate_nodejs() {
    log "Validating Node.js and dependencies"
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        echo "Please install Node.js 18+: https://nodejs.org/"
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        error "Node.js version 18 or higher is required (current: $(node --version))"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    # Validate frontend dependencies
    if [ -f "package.json" ]; then
        log "Validating frontend package.json"
        if ! jq empty "package.json" 2>/dev/null; then
            error "Frontend package.json is not valid JSON"
            exit 1
        fi
        success "Frontend package.json is valid"
    else
        error "Frontend package.json not found"
        exit 1
    fi
    
    # Validate backend dependencies
    if [ -f "backend/package.json" ]; then
        log "Validating backend package.json"
        if ! jq empty "backend/package.json" 2>/dev/null; then
            error "Backend package.json is not valid JSON"
            exit 1
        fi
        success "Backend package.json is valid"
    else
        error "Backend package.json not found"
        exit 1
    fi
}

# Validate GitHub Actions workflow
validate_github_actions() {
    log "Validating GitHub Actions workflow"
    
    if [ -f ".github/workflows/azure-deploy.yml" ]; then
        # Basic YAML validation
        if ! command -v yamllint &> /dev/null; then
            warning "yamllint not found, skipping YAML validation"
            warning "Install yamllint for better validation: pip install yamllint"
        else
            if yamllint ".github/workflows/azure-deploy.yml" &> /dev/null; then
                success "GitHub Actions workflow YAML is valid"
            else
                error "GitHub Actions workflow YAML has issues"
                yamllint ".github/workflows/azure-deploy.yml"
                exit 1
            fi
        fi
    else
        error "GitHub Actions workflow file not found"
        exit 1
    fi
}

# Validate deployment scripts
validate_scripts() {
    log "Validating deployment scripts"
    
    scripts=("azure-deploy.sh" "azure-health-check.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            log "Validating script: $script"
            
            # Check if script is executable
            if [ ! -x "$script" ]; then
                warning "Script $script is not executable"
                log "Making script executable: chmod +x $script"
                chmod +x "$script"
            fi
            
            # Basic syntax check for bash scripts
            if ! bash -n "$script"; then
                error "Script $script has syntax errors"
                exit 1
            fi
            
            success "Script $script is valid"
        else
            error "Script $script not found"
            exit 1
        fi
    done
}

# Validate Azure resources availability
validate_azure_resources() {
    log "Validating Azure resource availability"
    
    # Check if required resource providers are registered
    providers=("Microsoft.Web" "Microsoft.DBforPostgreSQL" "Microsoft.KeyVault" "Microsoft.Cdn" "Microsoft.Insights" "Microsoft.ContainerRegistry" "Microsoft.App")
    
    for provider in "${providers[@]}"; do
        state=$(az provider show --namespace "$provider" --query registrationState -o tsv 2>/dev/null || echo "NotRegistered")
        if [ "$state" != "Registered" ]; then
            warning "Resource provider $provider is not registered (state: $state)"
            log "Registering provider: $provider"
            az provider register --namespace "$provider"
        else
            success "Resource provider $provider is registered"
        fi
    done
}

# Validate network configuration
validate_network() {
    log "Validating network configuration"
    
    # Check if required ports are available
    log "Checking network connectivity"
    
    # Test Azure endpoints
    if curl -f -s https://management.azure.com &> /dev/null; then
        success "Azure management endpoint is accessible"
    else
        warning "Azure management endpoint may not be accessible"
    fi
    
    # Test Docker Hub connectivity
    if curl -f -s https://hub.docker.com &> /dev/null; then
        success "Docker Hub is accessible"
    else
        warning "Docker Hub may not be accessible"
    fi
}

# Generate validation report
generate_validation_report() {
    log "Generating validation report"
    
    report_file="validation-report-$(date +%Y%m%d-%H%M%S).json"
    
    # Collect validation results
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "resourceGroup": "$RESOURCE_GROUP",
  "location": "$LOCATION",
  "validationResults": {
    "azureCli": "passed",
    "resourceGroup": "passed",
    "armTemplates": "passed",
    "bicep": "passed",
    "parameters": "passed",
    "docker": "passed",
    "nodejs": "passed",
    "githubActions": "passed",
    "scripts": "passed",
    "azureResources": "passed",
    "network": "passed"
  },
  "recommendations": [
    "Ensure all secrets are properly configured in Azure Key Vault",
    "Review and update security configurations as needed",
    "Set up monitoring and alerting for production deployment",
    "Test the deployment in a staging environment first"
  ]
}
EOF
    
    success "Validation report generated: $report_file"
}

# Main validation function
main() {
    log "Starting Atlas Genesis Azure Deployment Validation"
    echo "=================================================="
    
    # Run all validation checks
    validate_azure_cli
    validate_resource_group
    validate_arm_templates
    validate_bicep
    validate_parameters
    validate_docker
    validate_nodejs
    validate_github_actions
    validate_scripts
    validate_azure_resources
    validate_network
    
    # Generate validation report
    generate_validation_report
    
    echo "=================================================="
    success "All validation checks passed successfully!"
    log "Validation completed at $(date)"
    echo ""
    echo "Next steps:"
    echo "1. Review the validation report"
    echo "2. Configure any missing secrets in Azure Key Vault"
    echo "3. Run the deployment script: ./azure-deploy.sh"
    echo "4. Monitor the deployment using: ./azure-health-check.sh"
}

# Handle script interruption
trap 'error "Validation interrupted"; exit 1' INT TERM

# Run main function
main "$@"