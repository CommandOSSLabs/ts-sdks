#!/bin/bash

set -euo pipefail

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

    log_info "Configuration files generated successfully:"
    ls -lah /config
}

# Start walrus upload relay
start_relay() {
    echo
    echo "=========================================="
    echo "  STEP 2: STARTING WALRUS UPLOAD RELAY"
    echo "=========================================="
    log_info "Starting Walrus Upload Relay server..."

    # Check if required config files exist
    local required_configs=("/config/relay-config.yml" "/config/client-config.yml")
    for config in "${required_configs[@]}"; do
        if [[ ! -f "$config" ]]; then
            log_error "Required config file not found: $config"
            exit 1
        else
            log_info "Found required config file: $config"
            echo "» Contents of $config:"
            cat "$config"
        fi
    done

    # Check if walrus-upload-relay binary exists
    if [[ ! -f "/opt/walrus/bin/walrus-upload-relay" ]]; then
        log_error "Walrus upload relay binary not found at /opt/walrus/bin/walrus-upload-relay"
        exit 1
    fi

    local host="${HOST:-[::]}"
    local port="${PORT:-3000}"

    if [[ -z "$host" ]]; then
        host='[::]'
    fi

    # Normalize IPv6 hosts so we always pass a valid host:port pair.
    # - If host is already bracketed (e.g. [::]), keep as-is.
    # - If host contains ':' (IPv6) but is not bracketed, wrap in brackets.
    # - Otherwise (IPv4/hostname), keep as-is.
    if [[ "$host" == \[*\] ]]; then
        :
    elif [[ "$host" == *:* ]]; then
        host="[$host]"
    fi

    local server_address="${host}:${port}"

    log_info "Starting walrus-upload-relay on ${server_address}..."
    log_info "Using relay config: /config/relay-config.yml"
    log_info "Using walrus config: /config/client-config.yml"

    # Execute the walrus-upload-relay as the main process (PID 1)
    exec /opt/walrus/bin/walrus-upload-relay \
        --relay-config /config/relay-config.yml \
        --walrus-config /config/client-config.yml \
        --server-address="${server_address}"
}

# Main execution
log_info "Starting Walrus Upload Relay... (Process ID: $$, Container ID: $(hostname))"

# Run the startup process
generate_configs
start_relay
