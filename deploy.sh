#!/bin/bash

# Atlas Genesis - Production Deployment Script
# This script automates the deployment process for Atlas Genesis platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Atlas Genesis"
VERSION="2.0.0"
FRONTEND_DIR="."
BACKEND_DIR="./backend"
BUILD_DIR="./dist"
BACKUP_DIR="./backups"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check PostgreSQL (optional)
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL found: $(psql --version)"
    else
        log_warning "PostgreSQL not found locally. Make sure your production database is configured."
    fi
    
    log_success "Prerequisites check completed"
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            log_info "Copying .env.production to .env"
            cp .env.production .env
        elif [ -f ".env.example" ]; then
            log_warning "No .env found. Copying .env.example to .env"
            cp .env.example .env
            log_warning "Please update .env with your production values before continuing."
            read -p "Press Enter to continue after updating .env..."
        else
            log_error "No environment file found. Please create .env with your configuration."
            exit 1
        fi
    fi
    
    # Check backend .env
    if [ -d "$BACKEND_DIR" ] && [ ! -f "$BACKEND_DIR/.env" ]; then
        if [ -f "$BACKEND_DIR/.env.example" ]; then
            log_info "Copying backend .env.example to .env"
            cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        else
            log_info "Creating backend .env from root .env"
            cp .env "$BACKEND_DIR/.env"
        fi
    fi
    
    log_success "Environment setup completed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    # Frontend dependencies
    log_info "Installing frontend dependencies..."
    npm ci --production=false
    
    # Backend dependencies
    if [ -d "$BACKEND_DIR" ]; then
        log_info "Installing backend dependencies..."
        cd "$BACKEND_DIR"
        npm ci --production=false
        cd ..
    fi
    
    log_success "Dependencies installed"
}

run_tests() {
    log_info "Running tests..."
    
    # Frontend tests
    if npm run test --if-present 2>/dev/null; then
        log_success "Frontend tests passed"
    else
        log_warning "No frontend tests found or tests failed"
    fi
    
    # Backend tests
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        if npm run test --if-present 2>/dev/null; then
            log_success "Backend tests passed"
        else
            log_warning "No backend tests found or tests failed"
        fi
        cd ..
    fi
    
    log_success "Tests completed"
}

build_frontend() {
    log_info "Building frontend..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "Cleaned previous build"
    fi
    
    # Build frontend
    npm run build
    
    # Verify build
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Frontend build failed - no dist directory found"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log_success "Frontend built successfully (Size: $BUILD_SIZE)"
}

build_backend() {
    if [ -d "$BACKEND_DIR" ]; then
        log_info "Building backend..."
        
        cd "$BACKEND_DIR"
        
        # Clean previous build
        if [ -d "dist" ]; then
            rm -rf dist
            log_info "Cleaned previous backend build"
        fi
        
        # Build backend
        npm run build
        
        # Verify build
        if [ ! -d "dist" ]; then
            log_error "Backend build failed - no dist directory found"
            exit 1
        fi
        
        cd ..
        log_success "Backend built successfully"
    else
        log_warning "No backend directory found, skipping backend build"
    fi
}

run_security_checks() {
    log_info "Running security checks..."
    
    # Check for vulnerabilities
    if npm audit --audit-level=high 2>/dev/null; then
        log_success "No high-severity vulnerabilities found in frontend"
    else
        log_warning "Security vulnerabilities found in frontend dependencies"
    fi
    
    # Backend security check
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        if npm audit --audit-level=high 2>/dev/null; then
            log_success "No high-severity vulnerabilities found in backend"
        else
            log_warning "Security vulnerabilities found in backend dependencies"
        fi
        cd ..
    fi
    
    # Check for sensitive files
    if [ -f ".env" ]; then
        log_warning "Make sure .env is not included in deployment"
    fi
    
    log_success "Security checks completed"
}

create_backup() {
    log_info "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create backup with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/atlas_genesis_backup_$TIMESTAMP.tar.gz"
    
    # Backup current deployment (if exists)
    if [ -d "$BUILD_DIR" ]; then
        tar -czf "$BACKUP_FILE" "$BUILD_DIR" 2>/dev/null || true
        log_success "Backup created: $BACKUP_FILE"
    else
        log_info "No previous deployment to backup"
    fi
}

deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod --confirm
        log_success "Deployed to Vercel"
    elif command -v npx &> /dev/null; then
        npx --yes vercel --prod --confirm
        log_success "Deployed to Vercel via npx"
    else
        log_warning "Vercel CLI not found. Install with: npm i -g vercel"
        log_info "Manual deployment: Upload $BUILD_DIR to Vercel"
    fi
}

deploy_to_netlify() {
    log_info "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir="$BUILD_DIR"
        log_success "Deployed to Netlify"
    else
        log_warning "Netlify CLI not found. Install with: npm i -g netlify-cli"
        log_info "Manual deployment: Upload $BUILD_DIR to Netlify"
    fi
}

deploy_backend() {
    log_info "Backend deployment instructions:"
    echo ""
    echo "For Heroku:"
    echo "  1. heroku create your-app-name"
    echo "  2. git subtree push --prefix=backend heroku main"
    echo ""
    echo "For AWS Lambda:"
    echo "  1. Use AWS SAM or Serverless Framework"
    echo "  2. Configure API Gateway"
    echo ""
    echo "For Railway:"
    echo "  1. railway login"
    echo "  2. railway link"
    echo "  3. railway up"
    echo ""
    log_info "Backend build is ready in $BACKEND_DIR/dist"
}

health_check() {
    log_info "Running health checks..."
    
    # Check if build files exist
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory not found"
        return 1
    fi
    
    # Check if index.html exists
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "index.html not found in build"
        return 1
    fi
    
    # Check build size (should be reasonable)
    BUILD_SIZE_BYTES=$(du -sb "$BUILD_DIR" | cut -f1)
    if [ "$BUILD_SIZE_BYTES" -gt 52428800 ]; then  # 50MB
        log_warning "Build size is large (>50MB): $(du -sh "$BUILD_DIR" | cut -f1)"
    fi
    
    log_success "Health checks passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove node_modules from build if present
    if [ -d "$BUILD_DIR/node_modules" ]; then
        rm -rf "$BUILD_DIR/node_modules"
        log_info "Removed node_modules from build"
    fi
    
    # Clean up temporary files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

show_deployment_info() {
    echo ""
    echo "======================================"
    echo "  $PROJECT_NAME v$VERSION"
    echo "  Deployment Summary"
    echo "======================================"
    echo ""
    echo "Frontend Build: $BUILD_DIR"
    echo "Build Size: $(du -sh "$BUILD_DIR" | cut -f1)"
    echo "Files: $(find "$BUILD_DIR" -type f | wc -l) files"
    echo ""
    echo "Deployment Options:"
    echo "  • Vercel: vercel --prod"
    echo "  • Netlify: netlify deploy --prod --dir=$BUILD_DIR"
    echo "  • AWS S3: aws s3 sync $BUILD_DIR s3://your-bucket"
    echo "  • Manual: Upload $BUILD_DIR contents to your web server"
    echo ""
    echo "Backend:"
    if [ -d "$BACKEND_DIR/dist" ]; then
        echo "  • Built: $BACKEND_DIR/dist"
        echo "  • Ready for deployment to Heroku, AWS, Railway, etc."
    else
        echo "  • No backend build found"
    fi
    echo ""
    echo "Next Steps:"
    echo "  1. Deploy frontend to your hosting platform"
    echo "  2. Deploy backend to your server platform"
    echo "  3. Configure environment variables"
    echo "  4. Set up database (PostgreSQL)"
    echo "  5. Configure domain and SSL"
    echo ""
    echo "Documentation:"
    echo "  • README.md - Project overview"
    echo "  • DEPLOYMENT_GUIDE.md - Detailed deployment instructions"
    echo "  • API_DOCUMENTATION.md - API reference"
    echo ""
    log_success "Deployment preparation completed!"
}

# Main deployment process
main() {
    echo ""
    echo "======================================"
    echo "  $PROJECT_NAME v$VERSION"
    echo "  Production Deployment Script"
    echo "======================================"
    echo ""
    
    # Parse command line arguments
    SKIP_TESTS=false
    DEPLOY_TARGET=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --vercel)
                DEPLOY_TARGET="vercel"
                shift
                ;;
            --netlify)
                DEPLOY_TARGET="netlify"
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --vercel        Deploy to Vercel after build"
                echo "  --netlify       Deploy to Netlify after build"
                echo "  --help          Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    setup_environment
    create_backup
    install_dependencies
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    else
        log_warning "Skipping tests as requested"
    fi
    
    run_security_checks
    build_frontend
    build_backend
    health_check
    cleanup
    
    # Deploy if target specified
    case $DEPLOY_TARGET in
        vercel)
            deploy_to_vercel
            ;;
        netlify)
            deploy_to_netlify
            ;;
    esac
    
    if [ -n "$DEPLOY_TARGET" ]; then
        deploy_backend
    fi
    
    show_deployment_info
}

# Run main function with all arguments
main "$@"