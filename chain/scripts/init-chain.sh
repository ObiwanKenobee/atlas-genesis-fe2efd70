#!/usr/bin/env bash
# scripts/init-chain.sh — Initialize a local sanctum-1 devnet node
set -euo pipefail

BINARY="sanctumd"
CHAIN_ID="sanctum-1"
MONIKER="sanctum-local"
HOME_DIR="$HOME/.sanctumd"
DENOM="usan"

echo "==> Initializing $CHAIN_ID node..."
$BINARY init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR"

echo "==> Adding genesis admin key..."
$BINARY keys add admin --keyring-backend test --home "$HOME_DIR"

ADMIN_ADDR=$($BINARY keys show admin -a --keyring-backend test --home "$HOME_DIR")

echo "==> Adding genesis account: $ADMIN_ADDR"
$BINARY genesis add-genesis-account "$ADMIN_ADDR" \
  "10000000000${DENOM},1000000000uhlt,1000000000ureg" \
  --home "$HOME_DIR"

echo "==> Creating genesis validator transaction..."
$BINARY genesis gentx admin "1000000000${DENOM}" \
  --chain-id "$CHAIN_ID" \
  --moniker "$MONIKER" \
  --keyring-backend test \
  --home "$HOME_DIR"

echo "==> Collecting gentxs..."
$BINARY genesis collect-gentxs --home "$HOME_DIR"

echo "==> Validating genesis..."
$BINARY genesis validate --home "$HOME_DIR"

echo ""
echo "✅ Chain initialized. Start with:"
echo "   $BINARY start --home $HOME_DIR"
