#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — PHASE 1 DEPLOYMENT SCRIPT
# Foundation: Ethical Core, Knowledge Graph, Governance, Trust Anchoring
# Usage: ./deploy-phase1.sh [--dry-run] [--skip-terraform]
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

PHASE="phase1"
NAMESPACE="atlas-phase1"
REGION="us-east-1"
CLUSTER_NAME="atlas-sanctum-phase1"
DRY_RUN=false
SKIP_TERRAFORM=false

# ─── Parse args ───────────────────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --dry-run)        DRY_RUN=true ;;
    --skip-terraform) SKIP_TERRAFORM=true ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] ✅ $*"; }
warn() { echo "[$(date '+%H:%M:%S')] ⚠️  $*"; }
fail() { echo "[$(date '+%H:%M:%S')] ❌ $*"; exit 1; }

# ─── Prerequisites ────────────────────────────────────────────────────────────
log "Checking prerequisites..."
command -v terraform  >/dev/null || fail "terraform not found"
command -v kubectl    >/dev/null || fail "kubectl not found"
command -v helm       >/dev/null || fail "helm not found"
command -v aws        >/dev/null || fail "aws CLI not found"
command -v jq         >/dev/null || fail "jq not found"

aws sts get-caller-identity >/dev/null || fail "AWS credentials not configured"
log "Prerequisites OK"

# ─── Step 1: Terraform Infrastructure ────────────────────────────────────────
if [ "$SKIP_TERRAFORM" = false ]; then
  log "Deploying Phase 1 infrastructure via Terraform..."
  cd infrastructure/phase1/terraform

  terraform init \
    -backend-config="bucket=atlas-terraform-state" \
    -backend-config="key=phase1/terraform.tfstate" \
    -backend-config="region=${REGION}"

  terraform validate || fail "Terraform validation failed"

  if [ "$DRY_RUN" = true ]; then
    terraform plan -out=phase1.tfplan
    log "Dry run complete. Review phase1.tfplan before applying."
    exit 0
  fi

  terraform apply -auto-approve -parallelism=10
  log "Terraform apply complete"
  cd ../../..
fi

# ─── Step 2: Configure kubectl ────────────────────────────────────────────────
log "Configuring kubectl for EKS cluster..."
aws eks update-kubeconfig \
  --region "${REGION}" \
  --name "${CLUSTER_NAME}" \
  --alias atlas-phase1

kubectl cluster-info || fail "Cannot connect to EKS cluster"

# ─── Step 3: Install cluster-level tools ──────────────────────────────────────
log "Installing cert-manager..."
helm repo add jetstack https://charts.jetstack.io --force-update
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.0 \
  --set installCRDs=true \
  --wait --timeout 5m

log "Installing NGINX Ingress..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.autoscaling.enabled=true \
  --set controller.autoscaling.minReplicas=2 \
  --set controller.autoscaling.maxReplicas=10 \
  --wait --timeout 5m

log "Installing Istio (service mesh for mTLS)..."
helm repo add istio https://istio-release.storage.googleapis.com/charts --force-update
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system \
  --set pilot.traceSampling=1.0 \
  --wait --timeout 5m

# ─── Step 4: Deploy Phase 1 namespace and core services ───────────────────────
log "Applying Phase 1 Kubernetes manifests..."
kubectl apply -f infrastructure/phase1/kubernetes/phase1-core.yaml

log "Waiting for ethics-kernel rollout..."
kubectl rollout status deployment/ethics-kernel -n "${NAMESPACE}" --timeout=5m

log "Waiting for governance-api rollout..."
kubectl rollout status deployment/governance-api -n "${NAMESPACE}" --timeout=5m

log "Waiting for Neo4j StatefulSet..."
kubectl rollout status statefulset/neo4j -n "${NAMESPACE}" --timeout=10m

log "Waiting for Vault StatefulSet..."
kubectl rollout status statefulset/vault -n "${NAMESPACE}" --timeout=5m

# ─── Step 5: Initialize Vault ─────────────────────────────────────────────────
log "Initializing HashiCorp Vault..."
VAULT_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=vault -o jsonpath='{.items[0].metadata.name}')

# Check if already initialized
VAULT_STATUS=$(kubectl exec -n "${NAMESPACE}" "${VAULT_POD}" -- vault status -format=json 2>/dev/null || echo '{"initialized":false}')
INITIALIZED=$(echo "${VAULT_STATUS}" | jq -r '.initialized')

if [ "${INITIALIZED}" = "false" ]; then
  log "Initializing Vault (first time)..."
  kubectl exec -n "${NAMESPACE}" "${VAULT_POD}" -- \
    vault operator init -key-shares=5 -key-threshold=3 -format=json \
    > /tmp/vault-init-keys.json
  warn "CRITICAL: Vault init keys saved to /tmp/vault-init-keys.json — store securely in AWS Secrets Manager NOW"
  warn "Run: aws secretsmanager put-secret-value --secret-id atlas/phase1/vault/init-keys --secret-string file:///tmp/vault-init-keys.json"
else
  log "Vault already initialized"
fi

# ─── Step 6: Seed Neo4j Knowledge Graph ───────────────────────────────────────
log "Seeding Neo4j with planetary knowledge graph..."
NEO4J_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=neo4j -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n "${NAMESPACE}" "${NEO4J_POD}" -- cypher-shell \
  -u neo4j -p "$(kubectl get secret neo4j-credentials -n ${NAMESPACE} -o jsonpath='{.data.password}' | base64 -d)" \
  --format plain << 'CYPHER'
// Seed Phase 1: Core planetary concepts
CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (n:Concept) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT axiom_id   IF NOT EXISTS FOR (n:Axiom)   REQUIRE n.id IS UNIQUE;

MERGE (cc:Concept {id: 'carbon-cycle',            label: 'Carbon Cycle',            domain: 'ecology'})
MERGE (bd:Concept {id: 'biodiversity',             label: 'Biodiversity',            domain: 'ecology'})
MERGE (hf:Concept {id: 'human-flourishing',        label: 'Human Flourishing',       domain: 'ethics'})
MERGE (re:Concept {id: 'regenerative-economics',   label: 'Regenerative Economics',  domain: 'economics'})
MERGE (ir:Axiom   {id: 'indigenous-rights',        label: 'Indigenous Rights',       domain: 'governance', immutable: true})
MERGE (sc:Concept {id: 'soil-carbon',              label: 'Soil Carbon',             domain: 'ecology'})
MERGE (bz:Concept {id: 'bioregional-zone',         label: 'Bioregional Zone',        domain: 'geography'})
MERGE (ec:Concept {id: 'ethics-council',           label: 'Ethics Council',          domain: 'governance'})
MERGE (zt:Concept {id: 'zero-trust',               label: 'Zero Trust Security',     domain: 'security'})
MERGE (riu:Concept{id: 'regenerative-impact-unit', label: 'Regenerative Impact Unit',domain: 'economics'})

// Relationships
MERGE (cc)-[:SUPPORTS {weight: 0.9}]->(bd)
MERGE (bd)-[:ENABLES  {weight: 0.85}]->(hf)
MERGE (re)-[:PROMOTES {weight: 0.8}]->(hf)
MERGE (ir)-[:GROUNDS  {weight: 1.0}]->(re)
MERGE (sc)-[:PART_OF  {weight: 0.95}]->(cc)
MERGE (bz)-[:GOVERNS  {weight: 0.9}]->(sc)
MERGE (ec)-[:VALIDATES{weight: 1.0}]->(ir)
MERGE (riu)-[:MEASURES {weight: 0.9}]->(re)

RETURN count(*) AS nodes_created;
CYPHER

log "Knowledge graph seeded"

# ─── Step 7: Deploy Bioregional Councils ──────────────────────────────────────
log "Seeding 3 bioregional ethics councils (Amazon, Sahel, Pacific)..."
kubectl exec -n "${NAMESPACE}" "${NEO4J_POD}" -- cypher-shell \
  -u neo4j -p "$(kubectl get secret neo4j-credentials -n ${NAMESPACE} -o jsonpath='{.data.password}' | base64 -d)" \
  --format plain << 'CYPHER'
MERGE (amazon:BioregionalCouncil {
  id: 'council-amazon',
  name: 'Amazon Basin Ethics Council',
  bioregion: 'Amazon',
  members: 12,
  indigenousRepPct: 0.67,
  languages: ['pt', 'es', 'indigenous-amazon'],
  status: 'active'
})
MERGE (sahel:BioregionalCouncil {
  id: 'council-sahel',
  name: 'Sahel Bioregional Ethics Council',
  bioregion: 'Sahel',
  members: 12,
  indigenousRepPct: 0.67,
  languages: ['fr', 'ar', 'hausa', 'fulani'],
  status: 'active'
})
MERGE (pacific:BioregionalCouncil {
  id: 'council-pacific',
  name: 'Pacific Islands Ethics Council',
  bioregion: 'Pacific',
  members: 12,
  indigenousRepPct: 0.75,
  languages: ['en', 'tok-pisin', 'fijian', 'samoan'],
  status: 'active'
})
RETURN count(*) AS councils_created;
CYPHER

# ─── Step 8: Validation ───────────────────────────────────────────────────────
log "Running Phase 1 validation checks..."

# Ethics kernel health
ETHICS_HEALTH=$(kubectl exec -n "${NAMESPACE}" \
  "$(kubectl get pod -n ${NAMESPACE} -l app=ethics-kernel -o jsonpath='{.items[0].metadata.name}')" \
  -- curl -s http://localhost:8080/health | jq -r '.status' 2>/dev/null || echo "unknown")

if [ "${ETHICS_HEALTH}" = "healthy" ]; then
  log "Ethics kernel: HEALTHY ✅"
else
  warn "Ethics kernel health: ${ETHICS_HEALTH} — check logs"
fi

# Neo4j node count
NODE_COUNT=$(kubectl exec -n "${NAMESPACE}" "${NEO4J_POD}" -- cypher-shell \
  -u neo4j -p "$(kubectl get secret neo4j-credentials -n ${NAMESPACE} -o jsonpath='{.data.password}' | base64 -d)" \
  --format plain "MATCH (n) RETURN count(n) AS total;" 2>/dev/null | tail -1 || echo "0")
log "Knowledge graph nodes: ${NODE_COUNT}"

# Governance API
GOVERNANCE_HEALTH=$(kubectl exec -n "${NAMESPACE}" \
  "$(kubectl get pod -n ${NAMESPACE} -l app=governance-api -o jsonpath='{.items[0].metadata.name}')" \
  -- curl -s http://localhost:8080/health | jq -r '.status' 2>/dev/null || echo "unknown")
log "Governance API: ${GOVERNANCE_HEALTH}"

# ─── Step 9: Summary ──────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ATLAS SANCTUM PHASE 1 DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo "  Ethics Kernel:    https://api.atlas-sanctum.earth/ethics"
echo "  Governance API:   https://governance.atlas-sanctum.earth"
echo "  Neo4j Browser:    kubectl port-forward svc/neo4j 7474:7474 -n ${NAMESPACE}"
echo "  Vault UI:         kubectl port-forward svc/vault 8200:8200 -n ${NAMESPACE}"
echo ""
echo "  SUCCESS METRICS TO VERIFY:"
echo "  □ Ethics kernel accuracy > 95% (run: ./scripts/test-ethics-kernel.sh)"
echo "  □ Knowledge graph nodes > 10,000 (current: ${NODE_COUNT})"
echo "  □ 3 bioregional councils active"
echo "  □ Blockchain anchoring operational"
echo "═══════════════════════════════════════════════════════════════"
