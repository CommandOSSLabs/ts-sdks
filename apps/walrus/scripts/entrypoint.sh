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
# Start Walrus Service
# ===============================================

# General configuration
MODE=${MODE:-}
NETWORK=${NETWORK:-testnet}

# If MODE is not set, exit without running anything (CLI mode)
if [[ -z "${MODE}" ]]; then
  log_info "MODE not set. Container will be used as CLI tool only."
  log_info "Use MODE=publisher, MODE=aggregator, or MODE=daemon to start a service."
  exit 0
fi

# Run config generation
generate_configs

# ===============================================
# Common Configuration (shared across all modes)
# ===============================================

# Shared options
BIND_ADDRESS=${BIND_ADDRESS:-"[::]:31415"}
METRICS_ADDRESS=${METRICS_ADDRESS:-"[::]:27182"}
BLOCKLIST=${BLOCKLIST:-""}
MAX_BLOB_SIZE=${MAX_BLOB_SIZE:-""}

# ===============================================
# Publisher-specific Configuration
# ===============================================

# Required for publisher/daemon modes
SUB_WALLETS_DIR=${SUB_WALLETS_DIR:-/wallets}

# Publisher request handling
MAX_BODY_SIZE=${MAX_BODY_SIZE:-10240}
MAX_QUILT_BODY_SIZE=${MAX_QUILT_BODY_SIZE:-102400}
PUBLISHER_MAX_BUFFER_SIZE=${PUBLISHER_MAX_BUFFER_SIZE:-8}
PUBLISHER_MAX_CONCURRENT_REQUESTS=${PUBLISHER_MAX_CONCURRENT_REQUESTS:-8}
N_CLIENTS=${N_CLIENTS:-8}

# Publisher wallet refill settings
REFILL_INTERVAL=${REFILL_INTERVAL:-"1s"}
GAS_REFILL_AMOUNT=${GAS_REFILL_AMOUNT:-500000000}
WAL_REFILL_AMOUNT=${WAL_REFILL_AMOUNT:-500000000}
SUB_WALLETS_MIN_BALANCE=${SUB_WALLETS_MIN_BALANCE:-500000000}

# Publisher blob storage behavior
BURN_AFTER_STORE=${BURN_AFTER_STORE:-0}

# JWT authentication (publisher/daemon only)
JWT_DECODE_SECRET=${JWT_DECODE_SECRET:-""}
JWT_ALGORITHM=${JWT_ALGORITHM:-""}
JWT_EXPIRING_SEC=${JWT_EXPIRING_SEC:-""}
JWT_VERIFY_UPLOAD=${JWT_VERIFY_UPLOAD:-0}
JWT_CACHE_SIZE=${JWT_CACHE_SIZE:-10000}
JWT_CACHE_REFRESH_INTERVAL=${JWT_CACHE_REFRESH_INTERVAL:-"5s"}

# ===============================================
# Aggregator-specific Configuration
# ===============================================

# Aggregator request handling
AGGREGATOR_MAX_BUFFER_SIZE=${AGGREGATOR_MAX_BUFFER_SIZE:-320}
AGGREGATOR_MAX_CONCURRENT_REQUESTS=${AGGREGATOR_MAX_CONCURRENT_REQUESTS:-256}

# Aggregator response headers
ALLOWED_HEADERS=${ALLOWED_HEADERS:-"content-type authorization content-disposition content-encoding content-language content-location link"}
ALLOW_QUILT_PATCH_TAGS=${ALLOW_QUILT_PATCH_TAGS:-0}

# ===============================================
# Publisher Mode
# ===============================================

start_publisher() {
  log_info "Starting Walrus Publisher in ${NETWORK} network... (Process ID: $$, Container ID: $(hostname))"

  # Prepare extra arguments
  EXTRA_ARGS=()
  
  if [[ -n "${BLOCKLIST}" ]]; then
    EXTRA_ARGS+=("--blocklist" "${BLOCKLIST}")
  fi

  if [[ -n "${MAX_BLOB_SIZE}" ]]; then
    EXTRA_ARGS+=("--max-blob-size" "${MAX_BLOB_SIZE}")
  fi

  if [[ "${BURN_AFTER_STORE}" == "1" ]]; then
    EXTRA_ARGS+=("--burn-after-store")
  fi

  if [[ -n "${JWT_DECODE_SECRET}" ]]; then
    EXTRA_ARGS+=("--jwt-decode-secret" "${JWT_DECODE_SECRET}")
  fi

  if [[ -n "${JWT_ALGORITHM}" ]]; then
    EXTRA_ARGS+=("--jwt-algorithm" "${JWT_ALGORITHM}")
  fi

  if [[ -n "${JWT_EXPIRING_SEC}" ]]; then
    EXTRA_ARGS+=("--jwt-expiring-sec" "${JWT_EXPIRING_SEC}")
  fi

  if [[ "${JWT_VERIFY_UPLOAD}" == "1" ]]; then
    EXTRA_ARGS+=("--jwt-verify-upload")
  fi

  if [[ -n "${JWT_CACHE_SIZE}" ]]; then
    EXTRA_ARGS+=("--jwt-cache-size" "${JWT_CACHE_SIZE}")
  fi

  if [[ -n "${JWT_CACHE_REFRESH_INTERVAL}" ]]; then
    EXTRA_ARGS+=("--jwt-cache-refresh-interval" "${JWT_CACHE_REFRESH_INTERVAL}")
  fi

  # Create wallets directory if it doesn't exist
  mkdir -p ${SUB_WALLETS_DIR}

  walrus publisher \
    --bind-address "${BIND_ADDRESS}" \
    --config "/config/client-config.yml" \
    --metrics-address "${METRICS_ADDRESS}" \
    --wallet "/config/wallet-config.yml" \
    --max-body-size "${MAX_BODY_SIZE}" \
    --max-quilt-body-size "${MAX_QUILT_BODY_SIZE}" \
    --publisher-max-buffer-size "${PUBLISHER_MAX_BUFFER_SIZE}" \
    --publisher-max-concurrent-requests "${PUBLISHER_MAX_CONCURRENT_REQUESTS}" \
    --n-clients "${N_CLIENTS}" \
    --refill-interval "${REFILL_INTERVAL}" \
    --sub-wallets-dir "${SUB_WALLETS_DIR}" \
    --gas-refill-amount "${GAS_REFILL_AMOUNT}" \
    --wal-refill-amount "${WAL_REFILL_AMOUNT}" \
    --sub-wallets-min-balance "${SUB_WALLETS_MIN_BALANCE}" \
    "${EXTRA_ARGS[@]}"
}

# ===============================================
# Aggregator Mode
# ===============================================

start_aggregator() {
  log_info "Starting Walrus Aggregator in ${NETWORK} network... (Process ID: $$, Container ID: $(hostname))"

  # Prepare extra arguments
  EXTRA_ARGS=()
  
  if [[ -n "${BLOCKLIST}" ]]; then
    EXTRA_ARGS+=("--blocklist" "${BLOCKLIST}")
  fi

  if [[ -n "${MAX_BLOB_SIZE}" ]]; then
    EXTRA_ARGS+=("--max-blob-size" "${MAX_BLOB_SIZE}")
  fi

  if [[ "${ALLOW_QUILT_PATCH_TAGS}" == "1" ]]; then
    EXTRA_ARGS+=("--allow-quilt-patch-tags-in-response")
  fi

  # Add allowed headers
  for header in ${ALLOWED_HEADERS}; do
    EXTRA_ARGS+=("--allowed-headers" "${header}")
  done

  walrus aggregator \
    --bind-address "${BIND_ADDRESS}" \
    --config "/config/client-config.yml" \
    --metrics-address "${METRICS_ADDRESS}" \
    --wallet "/config/wallet-config.yml" \
    --aggregator-max-buffer-size "${AGGREGATOR_MAX_BUFFER_SIZE}" \
    --aggregator-max-concurrent-requests "${AGGREGATOR_MAX_CONCURRENT_REQUESTS}" \
    "${EXTRA_ARGS[@]}"
}

# ===============================================
# Daemon Mode
# ===============================================

start_daemon() {
  log_info "Starting Walrus Daemon in ${NETWORK} network... (Process ID: $$, Container ID: $(hostname))"

  # Prepare extra arguments
  EXTRA_ARGS=()
  
  if [[ -n "${BLOCKLIST}" ]]; then
    EXTRA_ARGS+=("--blocklist" "${BLOCKLIST}")
  fi

  if [[ -n "${MAX_BLOB_SIZE}" ]]; then
    EXTRA_ARGS+=("--max-blob-size" "${MAX_BLOB_SIZE}")
  fi

  if [[ "${BURN_AFTER_STORE}" == "1" ]]; then
    EXTRA_ARGS+=("--burn-after-store")
  fi

  if [[ -n "${JWT_DECODE_SECRET}" ]]; then
    EXTRA_ARGS+=("--jwt-decode-secret" "${JWT_DECODE_SECRET}")
  fi

  if [[ -n "${JWT_ALGORITHM}" ]]; then
    EXTRA_ARGS+=("--jwt-algorithm" "${JWT_ALGORITHM}")
  fi

  if [[ -n "${JWT_EXPIRING_SEC}" ]]; then
    EXTRA_ARGS+=("--jwt-expiring-sec" "${JWT_EXPIRING_SEC}")
  fi

  if [[ "${JWT_VERIFY_UPLOAD}" == "1" ]]; then
    EXTRA_ARGS+=("--jwt-verify-upload")
  fi

  if [[ -n "${JWT_CACHE_SIZE}" ]]; then
    EXTRA_ARGS+=("--jwt-cache-size" "${JWT_CACHE_SIZE}")
  fi

  if [[ -n "${JWT_CACHE_REFRESH_INTERVAL}" ]]; then
    EXTRA_ARGS+=("--jwt-cache-refresh-interval" "${JWT_CACHE_REFRESH_INTERVAL}")
  fi

  if [[ "${ALLOW_QUILT_PATCH_TAGS}" == "1" ]]; then
    EXTRA_ARGS+=("--allow-quilt-patch-tags-in-response")
  fi

  # Add allowed headers
  for header in ${ALLOWED_HEADERS}; do
    EXTRA_ARGS+=("--allowed-headers" "${header}")
  done

  # Create wallets directory if it doesn't exist
  mkdir -p ${SUB_WALLETS_DIR}

  walrus daemon \
    --bind-address "${BIND_ADDRESS}" \
    --config "/config/client-config.yml" \
    --metrics-address "${METRICS_ADDRESS}" \
    --wallet "/config/wallet-config.yml" \
    --max-body-size "${MAX_BODY_SIZE}" \
    --max-quilt-body-size "${MAX_QUILT_BODY_SIZE}" \
    --publisher-max-buffer-size "${PUBLISHER_MAX_BUFFER_SIZE}" \
    --publisher-max-concurrent-requests "${PUBLISHER_MAX_CONCURRENT_REQUESTS}" \
    --n-clients "${N_CLIENTS}" \
    --refill-interval "${REFILL_INTERVAL}" \
    --sub-wallets-dir "${SUB_WALLETS_DIR}" \
    --gas-refill-amount "${GAS_REFILL_AMOUNT}" \
    --wal-refill-amount "${WAL_REFILL_AMOUNT}" \
    --sub-wallets-min-balance "${SUB_WALLETS_MIN_BALANCE}" \
    --aggregator-max-buffer-size "${AGGREGATOR_MAX_BUFFER_SIZE}" \
    --aggregator-max-concurrent-requests "${AGGREGATOR_MAX_CONCURRENT_REQUESTS}" \
    "${EXTRA_ARGS[@]}"
}

# ===============================================
# Start Service Based on Mode
# ===============================================

case "${MODE}" in
  publisher)
    start_publisher
    ;;
  aggregator)
    start_aggregator
    ;;
  daemon)
    start_daemon
    ;;
  *)
    log_error "Invalid MODE: ${MODE}"
    log_error "Valid modes are: publisher, aggregator, daemon"
    exit 1
    ;;
esac
