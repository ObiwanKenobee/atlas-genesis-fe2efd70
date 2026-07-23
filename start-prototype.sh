#!/usr/bin/env bash
# Atlas Sanctum — Platform Launcher
# Usage:
#   ./start-prototype.sh              → backend + main frontend only
#   ./start-prototype.sh --all        → backend + main frontend + all 8 dashboards
#   ./start-prototype.sh --dashboard mission-command   → backend + one dashboard
#   ./start-prototype.sh --list       → list all dashboards and their ports

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ─── Dashboard registry ───────────────────────────────────────────────────────

declare -A DASH_DIR=(
  [mission-command]="src/dashboards/mission-command"
  [planetary-pulse]="src/dashboards/planetary-pulse"
  [trust-layer]="src/dashboards/trust-layer"
  [sentinel-hub]="src/dashboards/sentinel-hub"
  [terra-watch]="src/dashboards/terra-watch"
  [sanctum-nexus-core]="src/dashboards/sanctum-nexus-core"
  [sentinel-command]="src/dashboards/sentinel-command"
  [moral-compass-dashboard]="src/dashboards/moral-compass-dashboard"
)

declare -A DASH_PORT=(
  [mission-command]=5174
  [planetary-pulse]=5175
  [trust-layer]=5176
  [sentinel-hub]=5177
  [terra-watch]=5178
  [sanctum-nexus-core]=5179
  [sentinel-command]=5180
  [moral-compass-dashboard]=5181
)

declare -A DASH_DESC=(
  [mission-command]="Operational Intelligence — missions, signals, decisions"
  [planetary-pulse]="Earth Health Monitoring — live planetary vitals"
  [trust-layer]="Regenerative Trust Infrastructure — entity scoring"
  [sentinel-hub]="Humanitarian Crisis Response — Kibera incident command"
  [terra-watch]="Ecosystem Intelligence Centre — satellite & AI"
  [sanctum-nexus-core]="AI Governance & Agent Oversight — constitutional AI"
  [sentinel-command]="Strategic Intelligence & Risk — decision briefs"
  [moral-compass-dashboard]="Ethical Decision Analysis — moral compass viz"
)

# ─── Args ─────────────────────────────────────────────────────────────────────

MODE="core"     # core | all | single
SINGLE_DASH=""

for arg in "$@"; do
  case $arg in
    --all)     MODE="all" ;;
    --list)
      echo -e "\n${CYAN}Atlas Sanctum Dashboards:${NC}"
      for id in "${!DASH_DIR[@]}"; do
        echo -e "  ${GREEN}$id${NC}  (port ${DASH_PORT[$id]})"
        echo -e "    ${DASH_DIR[$id]}"
        echo -e "    ${DASH_DESC[$id]}"
      done
      echo ""
      exit 0
      ;;
    --dashboard)
      MODE="single"
      ;;
    mission-command|planetary-pulse|trust-layer|sentinel-hub|terra-watch|sanctum-nexus-core|sentinel-command|moral-compass-dashboard)
      SINGLE_DASH="$arg"
      ;;
  esac
done

# ─── Banner ───────────────────────────────────────────────────────────────────

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║   🌍 Atlas Sanctum — Platform Launcher              ║"
echo "  ║   Planetary Operating System for Regenerative Civ   ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Node check ───────────────────────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo -e "${YELLOW}✗ Node.js not found. Install from https://nodejs.org${NC}"; exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${YELLOW}✗ Node.js 18+ required (found v$(node -v))${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ─── Install deps ─────────────────────────────────────────────────────────────

echo -e "\n${YELLOW}→ Installing backend dependencies…${NC}"
cd "$ROOT/backend"
[ ! -d node_modules ] && npm install --silent

echo -e "${YELLOW}→ Installing main frontend dependencies…${NC}"
cd "$ROOT"
[ ! -d node_modules ] && npm install --silent

# ─── Kill stale processes ─────────────────────────────────────────────────────

PORTS_TO_CLEAR=(4000 8080)
if [ "$MODE" = "all" ]; then
  for id in "${!DASH_PORT[@]}"; do PORTS_TO_CLEAR+=("${DASH_PORT[$id]}"); done
elif [ "$MODE" = "single" ] && [ -n "$SINGLE_DASH" ]; then
  PORTS_TO_CLEAR+=("${DASH_PORT[$SINGLE_DASH]}")
fi

for PORT in "${PORTS_TO_CLEAR[@]}"; do
  PID=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}→ Freeing port $PORT${NC}"
    kill -9 $PID 2>/dev/null || true
  fi
done

# ─── Track PIDs for cleanup ───────────────────────────────────────────────────

PIDS=()
cleanup() {
  echo -e "\n${YELLOW}→ Shutting down all processes…${NC}"
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
  echo -e "${GREEN}✓ Done${NC}"
}
trap cleanup EXIT INT TERM

# ─── Start backend ────────────────────────────────────────────────────────────

echo -e "\n${GREEN}→ Starting backend (mock DB) on http://localhost:4000${NC}"
cd "$ROOT/backend"
USE_MOCK_DB=true PORT=4000 npx ts-node-dev --transpile-only --respawn src/index.ts \
  > /tmp/atlas-backend.log 2>&1 &
PIDS+=($!)

# Wait for backend
echo -n "  Waiting for backend"
for i in $(seq 1 25); do
  sleep 1; echo -n "."
  if curl -sf http://localhost:4000/health &>/dev/null; then
    echo -e " ${GREEN}ready!${NC}"; break
  fi
  if [ $i -eq 25 ]; then echo -e " ${YELLOW}(backend still starting)${NC}"; fi
done

# ─── Start main frontend ──────────────────────────────────────────────────────

echo -e "\n${GREEN}→ Starting main frontend on http://localhost:8080${NC}"
cd "$ROOT"
VITE_API_URL=http://localhost:4000/api npx vite --port 8080 > /tmp/atlas-frontend.log 2>&1 &
PIDS+=($!)

# ─── Start dashboard(s) ───────────────────────────────────────────────────────

start_dashboard() {
  local id="$1"
  local dir="$ROOT/${DASH_DIR[$id]}"
  local port="${DASH_PORT[$id]}"

  if [ ! -d "$dir" ]; then
    echo -e "${YELLOW}  ⚠ $id not found at $dir, skipping${NC}"
    return
  fi

  echo -e "${GREEN}  → $id on http://localhost:$port${NC}"
  cd "$dir"

  # Install deps if needed (silent, only on first run)
  if [ ! -d node_modules ]; then
    echo -e "    Installing deps for $id…"
    npm install --silent 2>/dev/null || true
  fi

  VITE_API_URL=http://localhost:4000/api npx vite --port "$port" --host \
    > "/tmp/atlas-$id.log" 2>&1 &
  PIDS+=($!)
}

if [ "$MODE" = "all" ]; then
  echo -e "\n${CYAN}→ Starting all 8 dashboards…${NC}"
  for id in "${!DASH_DIR[@]}"; do start_dashboard "$id"; done
elif [ "$MODE" = "single" ] && [ -n "$SINGLE_DASH" ]; then
  echo -e "\n${CYAN}→ Starting dashboard: $SINGLE_DASH${NC}"
  start_dashboard "$SINGLE_DASH"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

sleep 2
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  🚀 Atlas Sanctum is running"
echo -e ""
echo -e "  ${BOLD}Dashboard Hub:${NC}      ${GREEN}http://localhost:8080/hub${NC}"
echo -e "  ${BOLD}Marketplace:${NC}        http://localhost:8080/prototype"
echo -e "  ${BOLD}Main Platform:${NC}      http://localhost:8080"
echo -e "  ${BOLD}Backend API:${NC}        http://localhost:4000/api"
echo -e "  ${BOLD}API Health:${NC}         http://localhost:4000/health"

if [ "$MODE" = "all" ]; then
  echo -e ""
  echo -e "  ${BOLD}Specialist Dashboards:${NC}"
  for id in mission-command planetary-pulse trust-layer sentinel-hub terra-watch sanctum-nexus-core sentinel-command moral-compass-dashboard; do
    [ -n "${DASH_PORT[$id]}" ] && echo -e "    $id → http://localhost:${DASH_PORT[$id]}"
  done
elif [ "$MODE" = "single" ] && [ -n "$SINGLE_DASH" ]; then
  echo -e "  ${BOLD}$SINGLE_DASH:${NC}  http://localhost:${DASH_PORT[$SINGLE_DASH]}"
fi

echo -e ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop all services"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

wait
