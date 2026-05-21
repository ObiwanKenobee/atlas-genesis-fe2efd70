#!/bin/bash

# Atlas Sanctum MVP - Quick Start Script
# This script sets up and starts the Atlas Sanctum MVP backend

set -e

echo "🚀 Atlas Sanctum MVP - Quick Start"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found${NC}"
    echo "Please install PostgreSQL 14+ with PostGIS extension"
    echo "Ubuntu: sudo apt install postgresql postgresql-contrib postgis"
    echo "macOS: brew install postgresql postgis"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL installed${NC}"

# Check Redis (optional)
if command -v redis-cli &> /dev/null; then
    echo -e "${GREEN}✅ Redis installed${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not found (optional for background jobs)${NC}"
fi

echo ""
echo "Setting up Atlas Sanctum MVP..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your database credentials${NC}"
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check database connection
echo ""
echo "Checking database connection..."
if ! psql -U postgres -d atlas_sanctum -c "SELECT 1" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Cannot connect to database${NC}"
    echo ""
    echo "Please ensure:"
    echo "1. PostgreSQL is running"
    echo "2. Database 'atlas_sanctum' exists"
    echo "3. PostGIS extension is enabled"
    echo ""
    echo "To create database:"
    echo "  sudo -u postgres psql"
    echo "  CREATE DATABASE atlas_sanctum;"
    echo "  \\c atlas_sanctum"
    echo "  CREATE EXTENSION IF NOT EXISTS postgis;"
    echo "  \\q"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"

# Run migrations
echo ""
echo "Running database migrations..."
npm run migrate

# Seed database
echo ""
echo "Seeding database with initial data..."
npm run seed

# Build application
echo ""
echo "Building application..."
npm run build

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Starting Atlas Sanctum API..."
echo ""

# Start the application
npm run dev
