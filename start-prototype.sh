#!/usr/bin/env bash
# Atlas Sanctum — Prototype Launcher
# Starts backend (mock DB, no PostgreSQL needed) + frontend
# Usage: ./start-prototype.sh

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║   🌍 Atlas Sanctum Prototype         ║"
echo "  ║   Regenerative Impact Units          ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# Check Node
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required (found v$(node -v))${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Install backend deps
echo -e "\n${YELLOW}→ Installing backend dependencies…${NC}"
cd "$BACKEND"
if [ ! -d node_modules ]; then
  npm install --silent
fi

# Install frontend deps
echo -e "${YELLOW}→ Installing frontend dependencies…${NC}"
cd "$FRONTEND"
if [ ! -d node_modules ]; then
  npm install --silent
fi

# Ensure backend .env uses mock DB (no DATABASE_HOST set)
if grep -q "^DATABASE_HOST=" "$BACKEND/.env" 2>/dev/null; then
  echo -e "${YELLOW}⚠ DATABASE_HOST is set — backend will attempt real DB connection${NC}"
else
  echo -e "${GREEN}✓ Backend will use mock database (no PostgreSQL needed)${NC}"
fi

# Kill any existing processes on our ports
for PORT in 4000 8080; do
  PID=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}→ Freeing port $PORT (PID $PID)${NC}"
    kill -9 $PID 2>/dev/null || true
  fi
done

echo -e "\n${GREEN}→ Starting backend on http://localhost:4000${NC}"
cd "$BACKEND"
USE_MOCK_DB=true PORT=4000 npx ts-node-dev --respawn --transpile-only src/index.ts &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in $(seq 1 20); do
  sleep 1
  echo -n "."
  if curl -sf http://localhost:4000/health &>/dev/null; then
    echo -e " ${GREEN}ready!${NC}"
    break
  fi
  if [ $i -eq 20 ]; then
    echo -e " ${YELLOW}(timeout — backend may still be starting)${NC}"
  fi
done

echo -e "\n${GREEN}→ Starting frontend on http://localhost:8080${NC}"
cd "$FRONTEND"
VITE_API_URL=http://localhost:4000/api npx vite --port 8080 &
FRONTEND_PID=$!

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  🚀 Atlas Sanctum Prototype is running"
echo -e ""
echo -e "  Prototype (start here):  ${GREEN}http://localhost:8080/prototype${NC}"
echo -e "  Full platform:           http://localhost:8080"
echo -e "  Backend API:             http://localhost:4000/api"
echo -e "  API Health:              http://localhost:4000/health"
echo -e ""
echo -e "  The prototype at /prototype has the complete user journey:"
echo -e "    1. Browse verified regenerative projects"
echo -e "    2. Submit a new project for verification"
echo -e "    3. Purchase RIUs from any project"
echo -e ""
echo -e "  Press Ctrl+C to stop all services"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}→ Shutting down…${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Done${NC}"
}
trap cleanup EXIT INT TERM

wait
