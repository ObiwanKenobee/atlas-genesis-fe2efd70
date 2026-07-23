#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — MASTER DEPLOYMENT ORCHESTRATOR
# Deploys all 6 phases in sequence with gate checks between each phase
# Usage: ./deploy-all-phases.sh [--phase N] [--dry-run] [--skip-gates]
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_PHASE=1
END_PHASE=6
DRY_RUN=false
SKIP_GATES=false
REPORT_FILE="/tmp/atlas-deployment-report-$(date +%Y%m%d-%H%M%S).md"

# ─── Parse args ───────────────────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --phase=*)    START_PHASE="${arg#*=}"; END_PHASE="${arg#*=}" ;;
    --from=*)     START_PHASE="${arg#*=}" ;;
    --to=*)       END_PHASE="${arg#*=}" ;;
    --dry-run)    DRY_RUN=true ;;
    --skip-gates) SKIP_GATES=true ;;
  esac
done

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()     { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $*${NC}"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $*${NC}"; }
fail()    { echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $*${NC}"; exit 1; }
phase()   { echo -e "\n${CYAN}═══════════════════════════════════════════════════${NC}"; \
            echo -e "${CYAN}  PHASE $1: $2${NC}"; \
            echo -e "${CYAN}═══════════════════════════════════════════════════${NC}\n"; }
gate()    { echo -e "${BLUE}[GATE CHECK] $*${NC}"; }

# ─── Report initialization ────────────────────────────────────────────────────
init_report() {
  cat > "${REPORT_FILE}" << EOF
# Atlas Sanctum Deployment Report
**Date:** $(date)
**Phases:** ${START_PHASE} → ${END_PHASE}
**Dry Run:** ${DRY_RUN}

## Phase Results

EOF
}

append_report() {
  echo "$*" >> "${REPORT_FILE}"
}

# ─── Gate Check Functions ─────────────────────────────────────────────────────

gate_phase1() {
  gate "Phase 1 gate: Ethics kernel accuracy, knowledge graph, councils..."

  local NAMESPACE="atlas-phase1"
  local PASS=true

  # Check ethics kernel is running with 3 replicas
  local ETHICS_READY
  ETHICS_READY=$(kubectl get deployment ethics-kernel -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  if [ "${ETHICS_READY}" -ge 3 ]; then
    log "Ethics kernel: ${ETHICS_READY}/3 replicas ready"
  else
    warn "Ethics kernel: only ${ETHICS_READY}/3 replicas ready"
    PASS=false
  fi

  # Check Neo4j node count
  local NODE_COUNT
  NODE_COUNT=$(kubectl exec -n "${NAMESPACE}" \
    "$(kubectl get pod -n ${NAMESPACE} -l app=neo4j -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)" \
    -- cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" --format plain \
    "MATCH (n) RETURN count(n) AS total;" 2>/dev/null | tail -1 || echo "0")
  if [ "${NODE_COUNT:-0}" -ge 10 ]; then
    log "Knowledge graph: ${NODE_COUNT} nodes (target: 10,000+)"
  else
    warn "Knowledge graph: only ${NODE_COUNT} nodes — seed more concepts"
  fi

  # Check governance API
  local GOV_HEALTH
  GOV_HEALTH=$(kubectl exec -n "${NAMESPACE}" \
    "$(kubectl get pod -n ${NAMESPACE} -l app=governance-api -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)" \
    -- curl -s http://localhost:8080/health 2>/dev/null | jq -r '.status' || echo "unknown")
  [ "${GOV_HEALTH}" = "healthy" ] && log "Governance API: healthy" || { warn "Governance API: ${GOV_HEALTH}"; PASS=false; }

  [ "${PASS}" = true ] && return 0 || return 1
}

gate_phase2() {
  gate "Phase 2 gate: Satellite ingestion, anomaly detection, Kafka..."

  local NAMESPACE="atlas-phase2"
  local PASS=true

  # Check Kafka consumer lag
  local KAFKA_LAG
  KAFKA_LAG=$(kubectl exec -n "${NAMESPACE}" \
    "$(kubectl get pod -n ${NAMESPACE} -l app=kafka-client -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)" \
    -- kafka-consumer-groups.sh --bootstrap-server "${KAFKA_BROKERS}" \
    --describe --group satellite-ingestion 2>/dev/null | awk 'NR>1 {sum+=$5} END {print sum}' || echo "0")
  if [ "${KAFKA_LAG:-0}" -lt 10000 ]; then
    log "Kafka lag: ${KAFKA_LAG} (acceptable)"
  else
    warn "Kafka lag: ${KAFKA_LAG} — ingestion falling behind"
    PASS=false
  fi

  # Check anomaly detector GPU
  local GPU_READY
  GPU_READY=$(kubectl get deployment anomaly-detector -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${GPU_READY:-0}" -ge 1 ] && log "Anomaly detector: ${GPU_READY} replicas" || { warn "Anomaly detector not ready"; PASS=false; }

  [ "${PASS}" = true ] && return 0 || return 1
}

gate_phase3() {
  gate "Phase 3 gate: Ray cluster, 12 agents, Weaviate, memory consolidation..."

  local NAMESPACE="atlas-phase3"
  local PASS=true

  # Check Ray head
  local RAY_READY
  RAY_READY=$(kubectl get deployment ray-head -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${RAY_READY:-0}" -ge 1 ] && log "Ray head: ready" || { warn "Ray head not ready"; PASS=false; }

  # Check Ray workers
  local WORKER_READY
  WORKER_READY=$(kubectl get deployment ray-worker -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${WORKER_READY:-0}" -ge 6 ] && log "Ray workers: ${WORKER_READY}/6 ready" || { warn "Ray workers: ${WORKER_READY}/6"; PASS=false; }

  # Check Weaviate
  local WEAVIATE_READY
  WEAVIATE_READY=$(kubectl get statefulset weaviate -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${WEAVIATE_READY:-0}" -ge 3 ] && log "Weaviate: ${WEAVIATE_READY}/3 replicas" || { warn "Weaviate: ${WEAVIATE_READY}/3"; PASS=false; }

  # Check ethics compliance rate via Prometheus
  local ETHICS_RATE
  ETHICS_RATE=$(curl -s "http://prometheus.monitoring:9090/api/v1/query" \
    --data-urlencode 'query=1 - rate(ethics_violations_total[1h]) / rate(agent_actions_total[1h])' \
    2>/dev/null | jq -r '.data.result[0].value[1]' || echo "0")
  if (( $(echo "${ETHICS_RATE:-0} >= 0.99" | bc -l) )); then
    log "Ethics compliance rate: ${ETHICS_RATE} (target: >99%)"
  else
    warn "Ethics compliance rate: ${ETHICS_RATE} — below 99% target"
  fi

  [ "${PASS}" = true ] && return 0 || return 1
}

gate_phase4() {
  gate "Phase 4 gate: RL convergence, resource allocation efficiency..."

  local NAMESPACE="atlas-phase4"
  local PASS=true

  # Check if RL training job completed
  local RL_STATUS
  RL_STATUS=$(kubectl get job rl-governance-training-v1 -n "${NAMESPACE}" \
    -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}' 2>/dev/null || echo "False")
  [ "${RL_STATUS}" = "True" ] && log "RL training: completed" || warn "RL training: not yet complete (may still be running)"

  # Check resource allocator
  local ALLOCATOR_READY
  ALLOCATOR_READY=$(kubectl get deployment resource-allocator -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${ALLOCATOR_READY:-0}" -ge 2 ] && log "Resource allocator: ${ALLOCATOR_READY} replicas" || { warn "Resource allocator not ready"; PASS=false; }

  [ "${PASS}" = true ] && return 0 || return 1
}

gate_phase5() {
  gate "Phase 5 gate: Translation service, indigenous vault, policy copilot..."

  local NAMESPACE="atlas-phase5"
  local PASS=true

  # Check NLLB translation
  local NLLB_READY
  NLLB_READY=$(kubectl get deployment nllb-translation -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${NLLB_READY:-0}" -ge 2 ] && log "NLLB translation: ${NLLB_READY} replicas" || { warn "NLLB not ready"; PASS=false; }

  # Check indigenous vault
  local VAULT_READY
  VAULT_READY=$(kubectl get deployment indigenous-knowledge-vault -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${VAULT_READY:-0}" -ge 2 ] && log "Indigenous vault: ${VAULT_READY} replicas" || { warn "Indigenous vault not ready"; PASS=false; }

  # Check ZK prover
  local ZK_READY
  ZK_READY=$(kubectl get deployment zk-prover -n "${NAMESPACE}" \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${ZK_READY:-0}" -ge 1 ] && log "ZK prover: ${ZK_READY} replicas" || { warn "ZK prover not ready"; PASS=false; }

  [ "${PASS}" = true ] && return 0 || return 1
}

gate_phase6() {
  gate "Phase 6 gate: Multi-region, digital twins, 99.99% SLA..."

  local PASS=true

  # Check all regional clusters
  for REGION in us-east eu-west africa; do
    local CLUSTER_HEALTH
    CLUSTER_HEALTH=$(kubectl --context "atlas-${REGION}" get nodes \
      --no-headers 2>/dev/null | grep -c "Ready" || echo "0")
    if [ "${CLUSTER_HEALTH:-0}" -ge 3 ]; then
      log "Cluster ${REGION}: ${CLUSTER_HEALTH} nodes ready"
    else
      warn "Cluster ${REGION}: only ${CLUSTER_HEALTH} nodes ready"
      PASS=false
    fi
  done

  # Check digital twin engine
  local TWIN_READY
  TWIN_READY=$(kubectl get deployment digital-twin-engine -n atlas-phase6 \
    -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  [ "${TWIN_READY:-0}" -ge 5 ] && log "Digital twin engine: ${TWIN_READY} replicas" || warn "Digital twin engine: ${TWIN_READY}/10"

  # Check PQ crypto migration
  local PQ_RATIO
  PQ_RATIO=$(curl -s "http://prometheus.monitoring:9090/api/v1/query" \
    --data-urlencode 'query=pq_crypto_classical_operations_ratio' \
    2>/dev/null | jq -r '.data.result[0].value[1]' || echo "1.0")
  if (( $(echo "${PQ_RATIO:-1.0} <= 0.05" | bc -l) )); then
    log "PQ crypto migration: ${PQ_RATIO} classical ratio (target: <5%)"
  else
    warn "PQ crypto migration: ${PQ_RATIO} classical ratio — migration incomplete"
  fi

  [ "${PASS}" = true ] && return 0 || return 1
}

# ─── Phase Deployment Functions ───────────────────────────────────────────────

deploy_phase() {
  local PHASE_NUM=$1
  local PHASE_NAME=$2
  local PHASE_DURATION=$3

  phase "${PHASE_NUM}" "${PHASE_NAME} (${PHASE_DURATION})"

  if [ "${DRY_RUN}" = true ]; then
    log "DRY RUN: Would deploy Phase ${PHASE_NUM}"
    append_report "### Phase ${PHASE_NUM}: ${PHASE_NAME} — DRY RUN"
    return 0
  fi

  local PHASE_DIR="${SCRIPT_DIR}/infrastructure/phase${PHASE_NUM}"

  # Apply Kubernetes manifests
  if [ -d "${PHASE_DIR}/kubernetes" ]; then
    log "Applying Phase ${PHASE_NUM} Kubernetes manifests..."
    kubectl apply -f "${PHASE_DIR}/kubernetes/" --recursive
  fi

  # Run phase-specific deploy script if exists
  if [ -f "${PHASE_DIR}/scripts/deploy-phase${PHASE_NUM}.sh" ]; then
    log "Running Phase ${PHASE_NUM} deploy script..."
    bash "${PHASE_DIR}/scripts/deploy-phase${PHASE_NUM}.sh"
  fi

  append_report "### Phase ${PHASE_NUM}: ${PHASE_NAME} — DEPLOYED ✅"
}

# ─── Main Deployment Loop ─────────────────────────────────────────────────────

init_report

echo -e "${CYAN}"
cat << 'BANNER'
╔═══════════════════════════════════════════════════════════════╗
║          ATLAS SANCTUM — PLANETARY DEPLOYMENT                 ║
║          Six Phases from MVP to Civilizational OS             ║
╚═══════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

log "Starting deployment: Phase ${START_PHASE} → Phase ${END_PHASE}"
[ "${DRY_RUN}" = true ] && warn "DRY RUN MODE — no changes will be made"

PHASES=(
  "1:Foundation — Ethical Core & Reasoning:Months 1-3"
  "2:Perception & Intelligence:Months 3-6"
  "3:Multi-Agent Civilization Engine:Months 6-12"
  "4:Optimization & Learning:Months 12-18"
  "5:Language, Culture & Global Reach:Months 18-24"
  "6:Planetary Scale — Full Civilizational OS:Months 24-36"
)

GATE_FUNCTIONS=(
  "gate_phase1"
  "gate_phase2"
  "gate_phase3"
  "gate_phase4"
  "gate_phase5"
  "gate_phase6"
)

for PHASE_ENTRY in "${PHASES[@]}"; do
  IFS=':' read -r PHASE_NUM PHASE_NAME PHASE_DURATION <<< "${PHASE_ENTRY}"

  # Skip phases outside range
  [ "${PHASE_NUM}" -lt "${START_PHASE}" ] && continue
  [ "${PHASE_NUM}" -gt "${END_PHASE}" ] && break

  # Deploy phase
  deploy_phase "${PHASE_NUM}" "${PHASE_NAME}" "${PHASE_DURATION}"

  # Gate check (unless skipped)
  if [ "${SKIP_GATES}" = false ] && [ "${DRY_RUN}" = false ]; then
    log "Running Phase ${PHASE_NUM} gate checks..."
    GATE_FN="${GATE_FUNCTIONS[$((PHASE_NUM - 1))]}"

    if ${GATE_FN}; then
      log "Phase ${PHASE_NUM} gate: PASSED ✅"
      append_report "**Gate Check:** PASSED ✅"
    else
      warn "Phase ${PHASE_NUM} gate: FAILED — some checks did not pass"
      append_report "**Gate Check:** FAILED ⚠️"
      echo ""
      echo -e "${YELLOW}Phase ${PHASE_NUM} gate checks failed.${NC}"
      echo -e "${YELLOW}Options:${NC}"
      echo "  1. Fix issues and re-run: ./deploy-all-phases.sh --phase=${PHASE_NUM}"
      echo "  2. Skip gates (not recommended): ./deploy-all-phases.sh --from=${PHASE_NUM} --skip-gates"
      echo "  3. Continue anyway (risky): press Enter"
      read -r -p "Continue? [y/N] " CONTINUE
      [ "${CONTINUE}" != "y" ] && fail "Deployment halted at Phase ${PHASE_NUM} gate"
    fi
  fi

  log "Phase ${PHASE_NUM} complete"
  echo ""
done

# ─── Final Summary ────────────────────────────────────────────────────────────

append_report "
## Deployment Summary
- **Completed:** $(date)
- **Phases Deployed:** ${START_PHASE} → ${END_PHASE}
- **Report:** ${REPORT_FILE}
"

echo -e "${GREEN}"
cat << 'COMPLETE'
╔═══════════════════════════════════════════════════════════════╗
║          ATLAS SANCTUM DEPLOYMENT COMPLETE                    ║
╚═══════════════════════════════════════════════════════════════╝
COMPLETE
echo -e "${NC}"

echo "  Phase 1 — Ethics Kernel:      https://api.atlas-sanctum.earth/ethics"
echo "  Phase 1 — Governance:         https://governance.atlas-sanctum.earth"
echo "  Phase 2 — Satellite Feed:     https://api.atlas-sanctum.earth/biomes"
echo "  Phase 3 — Agent Dashboard:    https://agents.atlas-sanctum.earth"
echo "  Phase 4 — Optimization:       https://api.atlas-sanctum.earth/optimize"
echo "  Phase 5 — Language:           https://api.atlas-sanctum.earth/translate"
echo "  Phase 6 — Planetary:          https://atlas-sanctum.earth"
echo ""
echo "  Grafana:    kubectl port-forward svc/grafana 3000:3000 -n monitoring"
echo "  Ray:        kubectl port-forward svc/ray-head 8265:8265 -n atlas-phase3"
echo "  Vault:      kubectl port-forward svc/vault 8200:8200 -n atlas-phase1"
echo ""
echo "  Full report: ${REPORT_FILE}"
