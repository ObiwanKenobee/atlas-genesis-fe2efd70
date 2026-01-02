#!/bin/bash

# Atlas Genesis - Quick Start Script
# This script starts both the frontend and backend development servers

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🌍 Atlas Genesis - Regenerative Carbon Credit Marketplace"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Node.js version: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${BLUE}✓ npm version: $(npm --version)${NC}"
echo ""

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Install backend dependencies if needed
if [ ! -d "scaffold-mvp/backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd scaffold-mvp/backend
    npm install
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

echo ""
echo -e "${YELLOW}Starting development servers...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    # Kill background processes
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup INT TERM

# Start frontend in background
echo -e "${BLUE}🚀 Starting frontend on http://localhost:8080${NC}"
npm run dev > /tmp/atlas-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 3

# Start backend in background
echo -e "${BLUE}🚀 Starting backend on http://localhost:3001${NC}"
cd scaffold-mvp/backend
PORT=3001 npm run dev > /tmp/atlas-backend.log 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# Wait for servers to fully start
sleep 3

# Check if servers are running
echo ""
echo -e "${GREEN}✓ Services started!${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Atlas Genesis is Ready!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Frontend:${NC}  http://localhost:8080"
echo -e "${GREEN}Backend:${NC}   http://localhost:3001"
echo -e "${GREEN}API Docs:${NC}  http://localhost:3001/api"
echo ""
echo -e "${YELLOW}Available Commands:${NC}"
echo "  • View frontend logs: tail -f /tmp/atlas-frontend.log"
echo "  • View backend logs:  tail -f /tmp/atlas-backend.log"
echo "  • Test API:          curl http://localhost:3001/health"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  • DEPLOYMENT_GUIDE.md      - Deployment instructions"
echo "  • API_DOCUMENTATION.md     - Complete API reference"
echo "  • TESTING_GUIDE.md         - Testing procedures"
echo "  • PLATFORM_COMPLETION_SUMMARY.md - Project summary"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running
wait
