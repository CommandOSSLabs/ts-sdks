![Walrus](https://docs.wal.app/img/logo.svg)

# Deploy and Host Walrus Publisher/Aggregator on Railway

Walrus Publisher and Aggregator are services that enable interaction with Walrus decentralized storage on the Sui blockchain. The Publisher uploads and manages blobs, while the Aggregator retrieves and serves stored content. Run them independently or combined in Daemon mode for a complete storage solution.

## About Hosting Walrus Publisher/Aggregator

Hosting Walrus services involves running HTTP endpoints that interact with the Walrus decentralized storage network on Sui blockchain. The Publisher service accepts blob uploads via REST API, manages parallel transactions through sub-wallets, and stores data across the Walrus network with configurable redundancy. The Aggregator service retrieves and serves blobs on-demand with efficient caching and concurrent request handling. Both services support JWT authentication, metrics monitoring, and can operate on testnet or mainnet networks. The containerized deployment handles wallet management, network configuration, and resource optimization automatically.

## Common Use Cases

- **Decentralized Content Hosting**: Host websites, images, videos, and static assets on Walrus with guaranteed availability
- **API Gateway for dApps**: Provide your decentralized applications with reliable blob storage and retrieval endpoints
- **Multi-Tenant Storage Service**: Run a Publisher with JWT authentication to offer secure blob storage as a service
- **CDN Alternative**: Deploy Aggregators globally to serve Walrus content with low latency and high throughput
- **Backup and Archival**: Store application data, backups, and archives with cryptographic verification

## Dependencies for Walrus Publisher/Aggregator Hosting

- **Sui Blockchain Access**: Connection to Sui network RPC endpoints (testnet or mainnet)
- **Wallet Keystore** (Publisher/Daemon only): Sui private key with sufficient SUI and WAL tokens for gas and storage fees
- **Persistent Storage**: Volume mount for `/wallets` directory to persist sub-wallets across restarts

### ⚠️ IMPORTANT - Token Requirements for Publisher/Daemon Mode

The Publisher and Daemon modes create sub-wallets to handle concurrent blob uploads. Each sub-wallet requires funding with both SUI (for gas) and WAL tokens (for storage fees).

**Default Configuration:**
- **8 sub-wallets** are created by default (configurable with `N_CLIENTS`)
- Each sub-wallet maintains **0.5-1.0 SUI** and **0.5-1.0 WAL** in steady state
- Automatic refill from main wallet when balance drops below threshold
- **Minimum Main Wallet Balance**: Ensure your main wallet has sufficient tokens to fund all sub-wallets (e.g., 8-10+ SUI and 8-10+ WAL for default setup)

**Cost Implications:**
- Every blob store operation consumes SUI (gas) and WAL (storage) tokens
- Higher concurrency (`N_CLIENTS`) requires proportionally more tokens distributed across sub-wallets
- **Secure your Publisher endpoint** - unauthorized access can rapidly drain your wallet
- Consider JWT authentication (`JWT_VERIFY_UPLOAD=1`) to control access

For production deployments, monitor wallet balances and set up alerts to avoid service interruption due to insufficient funds.

### Deployment Dependencies

- **Docker Image**: [cmdoss/walrus](https://hub.docker.com/r/cmdoss/walrus) - Multi-architecture container with Sui and Walrus binaries
- **Official Documentation**: [Walrus Sites](https://docs.wal.app/) - Learn more about the Walrus protocol
- **Sui Documentation**: [Sui Docs](https://docs.sui.io/) - Understand the underlying blockchain platform
- **GitHub Repository**: [CommandOSSLabs/ts-sdks](https://github.com/CommandOSSLabs/ts-sdks) - Source code and configuration templates

### Implementation Details

#### Environment Variables

**Required for all modes:**
```bash
MODE=publisher          # or 'aggregator', 'daemon'
NETWORK=testnet        # or 'mainnet'
```

**Required for Publisher/Daemon modes:**
```bash
SUI_KEYSTORE=suiprivkey...  # Your Sui private key from ~/.sui/sui_config/sui.keystore
```

**Optional JWT Authentication (Publisher/Daemon):**
```bash
JWT_DECODE_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_VERIFY_UPLOAD=1
```

**Performance Tuning:**
```bash
N_CLIENTS=16                                    # Parallel Walrus clients
PUBLISHER_MAX_CONCURRENT_REQUESTS=16            # Upload concurrency
AGGREGATOR_MAX_CONCURRENT_REQUESTS=512          # Download concurrency
MAX_BODY_SIZE=20480                             # Max upload size (KB)
```

#### Health Check Endpoints

- **HTTP API**: `http://localhost:31415` - Main service endpoint
- **Metrics**: `http://localhost:27182/metrics` - Prometheus metrics for monitoring

#### Volume Mounts

Mount `/wallets` volume for Publisher/Daemon modes to persist sub-wallet state across container restarts.

## Why Deploy Walrus Publisher/Aggregator on Railway?

<!-- Recommended: Keep this section as shown below -->
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Walrus Publisher/Aggregator on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
<!-- End recommended section -->