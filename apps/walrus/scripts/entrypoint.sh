#!/bin/bash

set -euo pipefail

# ===============================================
# Help functions
# ===============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Generate configuration files using gomplate
generate_configs() {
  echo
  echo "=========================================="
  echo "  STEP 1: GENERATING CONFIGURATIONS"
  echo "=========================================="
  log_info "Generating configuration files using gomplate..."

  if [[ ! -d "/templates" ]]; then
    log_error "Templates directory not found at /templates"
    exit 1
  fi

  # Create config directory if it doesn't exist
  mkdir -p /config

  # Process templates with gomplate
  if ! gomplate --input-dir /templates --output-dir /config; then
    log_error "Failed to generate configuration files"
    exit 1
  fi

  log_info "Configuration files generated successfully"
}

# ===============================================
# Start Walrus Publisher
# ===============================================

# Run config generation
generate_configs

# General configuration
NETWORK=${NETWORK:-testnet}

# Publisher Configuration variables
PUBLISHER_WALLETS_DIR=${PUBLISHER_WALLETS_DIR:-/publisher-wallets}
PUBLISHER_BIND_ADDRESS=${PUBLISHER_BIND_ADDRESS:-"[::]:8080"}
PUBLISHER_METRICS_ADDRESS=${PUBLISHER_METRICS_ADDRESS:-"[::]:27182"}
PUBLISHER_MAX_BODY_SIZE=${PUBLISHER_MAX_BODY_SIZE:-10240}
PUBLISHER_MAX_QUILT_BODY_SIZE=${PUBLISHER_MAX_QUILT_BODY_SIZE:-10240}
PUBLISHER_MAX_BUFFER_SIZE=${PUBLISHER_MAX_BUFFER_SIZE:-8}
PUBLISHER_CONCURRENT_REQUESTS=${PUBLISHER_CONCURRENT_REQUESTS:-8}
PUBLISHER_N_CLIENTS=${PUBLISHER_N_CLIENTS:-1}
PUBLISHER_REFILL_INTERVAL=${PUBLISHER_REFILL_INTERVAL:-"1s"}
PUBLISHER_GAS_REFILL_AMOUNT=${PUBLISHER_GAS_REFILL_AMOUNT:-500000000}
PUBLISHER_WAL_REFILL_AMOUNT=${PUBLISHER_WAL_REFILL_AMOUNT:-500000000}
PUBLISHER_SUB_WALLETS_MIN_BALANCE=${PUBLISHER_SUB_WALLETS_MIN_BALANCE:-500000000}
PUBLISHER_BURN_AFTER_STORE=${PUBLISHER_BURN_AFTER_STORE:-0}
PUBLISHER_JWT_DECODE_SECRET=${PUBLISHER_JWT_DECODE_SECRET:-""}
PUBLISHER_JWT_ALGORITHM=${PUBLISHER_JWT_ALGORITHM:-""}
PUBLISHER_JWT_EXPIRING_SEC=${PUBLISHER_JWT_EXPIRING_SEC:-""}
PUBLISHER_JWT_VERIFY_UPLOAD=${PUBLISHER_JWT_VERIFY_UPLOAD:-0}
PUBLISHER_JWT_CACHE_SIZE=${PUBLISHER_JWT_CACHE_SIZE:-""}
PUBLISHER_JWT_CACHE_REFRESH_INTERVAL=${PUBLISHER_JWT_CACHE_REFRESH_INTERVAL:-""}

# Prepare extra arguments
EXTRA_ARGS=()
if [[ "${PUBLISHER_BURN_AFTER_STORE}" == "1" ]]; then
  EXTRA_ARGS+=("--burn-after-store")
fi

if [[ -n "${PUBLISHER_JWT_DECODE_SECRET}" ]]; then
  EXTRA_ARGS+=("--jwt-decode-secret" "${PUBLISHER_JWT_DECODE_SECRET}")
fi

if [[ -n "${PUBLISHER_JWT_ALGORITHM}" ]]; then
  EXTRA_ARGS+=("--jwt-algorithm" "${PUBLISHER_JWT_ALGORITHM}")
fi

if [[ -n "${PUBLISHER_JWT_EXPIRING_SEC}" ]]; then
  EXTRA_ARGS+=("--jwt-expiring-sec" "${PUBLISHER_JWT_EXPIRING_SEC}")
fi

if [[ "${PUBLISHER_JWT_VERIFY_UPLOAD}" == "1" ]]; then
  EXTRA_ARGS+=("--jwt-verify-upload")
fi

if [[ -n "${PUBLISHER_JWT_CACHE_SIZE}" ]]; then
  EXTRA_ARGS+=("--jwt-cache-size" "${PUBLISHER_JWT_CACHE_SIZE}")
fi

if [[ -n "${PUBLISHER_JWT_CACHE_REFRESH_INTERVAL}" ]]; then
  EXTRA_ARGS+=("--jwt-cache-refresh-interval" "${PUBLISHER_JWT_CACHE_REFRESH_INTERVAL}")
fi

# Create publisher wallets directory if it doesn't exist
mkdir -p ${PUBLISHER_WALLETS_DIR}

log_info "Starting Walrus Publisher in ${NETWORK} network... (Process ID: $$, Container ID: $(hostname))"

walrus publisher \
  --bind-address "${PUBLISHER_BIND_ADDRESS}" \
  --config "/config/client-config.yml" \
  --metrics-address "${PUBLISHER_METRICS_ADDRESS}" \
  --wallet "/config/wallet-config.yml" \
  --max-body-size "${PUBLISHER_MAX_BODY_SIZE}" \
  --max-quilt-body-size "${PUBLISHER_MAX_QUILT_BODY_SIZE}" \
  --publisher-max-buffer-size "${PUBLISHER_MAX_BUFFER_SIZE}" \
  --publisher-max-concurrent-requests "${PUBLISHER_CONCURRENT_REQUESTS}" \
  --n-clients "${PUBLISHER_N_CLIENTS}" \
  --refill-interval "${PUBLISHER_REFILL_INTERVAL}" \
  --sub-wallets-dir "${PUBLISHER_WALLETS_DIR}" \
  --gas-refill-amount "${PUBLISHER_GAS_REFILL_AMOUNT}" \
  --wal-refill-amount "${PUBLISHER_WAL_REFILL_AMOUNT}" \
  --sub-wallets-min-balance "${PUBLISHER_SUB_WALLETS_MIN_BALANCE}" \
  "${EXTRA_ARGS[@]}"
