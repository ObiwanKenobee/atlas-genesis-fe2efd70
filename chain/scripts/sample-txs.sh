#!/usr/bin/env bash
# scripts/sample-txs.sh — Sample transactions for local devnet testing
# Requires: sanctumd running, jq installed
set -euo pipefail

BINARY="sanctumd"
NODE="http://localhost:26657"
CHAIN_ID="sanctum-1"
KB="--keyring-backend test"
FLAGS="--chain-id $CHAIN_ID --node $NODE --yes $KB"

echo "==> 1. Register provider identity"
$BINARY tx identity register USER '{"org":"Atlas Health Clinic"}' \
  --from admin $FLAGS

echo "==> 2. Register oracle"
$BINARY tx oracle register HUMAN \
  --from oracle1 $FLAGS

echo "==> 3. Submit health impact record"
$BINARY tx impact submit HEALTH patients_treated 250 \
  --from provider $FLAGS

echo "==> 4. Oracle 1 verifies impact"
$BINARY tx impact verify <IMPACT_ID> \
  --from oracle1 $FLAGS

echo "==> 5. Oracle 2 verifies impact"
$BINARY tx impact verify <IMPACT_ID> \
  --from oracle2 $FLAGS

echo "==> 6. Oracle 3 verifies impact (triggers VERIFIED + rewards)"
$BINARY tx impact verify <IMPACT_ID> \
  --from oracle3 $FLAGS

echo "==> 7. Query verified impact"
$BINARY query impact record <IMPACT_ID> --node $NODE

echo "==> 8. Create regeneration project"
$BINARY tx regeneration create-project "Amazon Reforestation" "Brazil, Para" \
  --from provider $FLAGS

echo "==> 9. Update project metrics"
$BINARY tx regeneration update-metrics <PROJECT_ID> 150.5 0.85 1000 \
  --from provider $FLAGS

echo "==> 10. Query active oracles"
$BINARY query oracle active-oracles --node $NODE
