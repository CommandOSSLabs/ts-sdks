# Walrus Docker Image

Official Docker image containing the latest Sui and Walrus binaries with a pre-configured Walrus Publisher service.

**Docker Hub:** [cmdoss/walrus](https://hub.docker.com/r/cmdoss/walrus)

## Features

- **Latest Binaries**: Pre-installed `sui` (v1.63.2) and `walrus` (v1.40.3) binaries
- **Multi-Architecture**: Supports `amd64` and `arm64`
- **Configurable**: Environment variable-based configuration using [Gomplate](https://gomplate.ca/)
- **Pre-configured Publisher**: Ready-to-run Walrus Publisher service with sensible defaults
- **Network Support**: testnet (default), mainnet

## Quick Start

```bash
docker run -p 8080:8080 cmdoss/walrus:latest
```

The Walrus Publisher will start on port 8080 with testnet configuration.

## Environment Variables

### Network Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NETWORK` | `testnet` | Network to use (`testnet`, `mainnet`) |

### Publisher Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLISHER_BIND_ADDRESS` | `[::]:8080` | HTTP server bind address |
| `PUBLISHER_METRICS_ADDRESS` | `[::]:27182` | Metrics endpoint address |
| `PUBLISHER_MAX_BODY_SIZE` | `10240` | Maximum upload body size (KB) |
| `PUBLISHER_MAX_QUILT_BODY_SIZE` | `10240` | Maximum quilt body size (KB) |
| `PUBLISHER_MAX_BUFFER_SIZE` | `8` | Maximum buffer size |
| `PUBLISHER_CONCURRENT_REQUESTS` | `8` | Max concurrent requests |
| `PUBLISHER_N_CLIENTS` | `1` | Number of Walrus clients |
| `PUBLISHER_REFILL_INTERVAL` | `1s` | Wallet refill interval |
| `PUBLISHER_GAS_REFILL_AMOUNT` | `500000000` | SUI gas refill amount (MIST) |
| `PUBLISHER_WAL_REFILL_AMOUNT` | `500000000` | WAL token refill amount |
| `PUBLISHER_SUB_WALLETS_MIN_BALANCE` | `500000000` | Minimum sub-wallet balance |
| `PUBLISHER_BURN_AFTER_STORE` | `0` | Burn WAL tokens after store (1=yes, 0=no) |
| `PUBLISHER_WALLETS_DIR` | `/publisher-wallets` | Directory for sub-wallets |

### JWT Authentication (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLISHER_JWT_DECODE_SECRET` | - | JWT secret for verification |
| `PUBLISHER_JWT_ALGORITHM` | - | JWT algorithm (e.g., `HS256`) |
| `PUBLISHER_JWT_EXPIRING_SEC` | - | JWT expiration time |
| `PUBLISHER_JWT_VERIFY_UPLOAD` | `0` | Verify JWT on upload (1=yes, 0=no) |
| `PUBLISHER_JWT_CACHE_SIZE` | - | JWT cache size |
| `PUBLISHER_JWT_CACHE_REFRESH_INTERVAL` | - | JWT cache refresh interval |

## Usage Examples

### Run with Custom Configuration

```bash
docker run -p 8080:8080 \
  -e NETWORK=mainnet \
  -e PUBLISHER_MAX_BODY_SIZE=20480 \
  -e PUBLISHER_CONCURRENT_REQUESTS=16 \
  cmdoss/walrus:latest
```

### Run with JWT Authentication

```bash
docker run -p 8080:8080 \
  -e PUBLISHER_JWT_DECODE_SECRET="your-secret-key" \
  -e PUBLISHER_JWT_ALGORITHM="HS256" \
  -e PUBLISHER_JWT_VERIFY_UPLOAD=1 \
  cmdoss/walrus:latest
```

### Use with Docker Compose

```yaml
version: '3.8'
services:
  walrus:
    image: cmdoss/walrus:latest
    ports:
      - "8080:8080"
      - "27182:27182"  # Metrics
    environment:
      NETWORK: testnet
      PUBLISHER_MAX_BODY_SIZE: 20480
    volumes:
      - ./wallets:/publisher-wallets
```

### Custom Wallet Configuration

Mount your own wallet and configuration files:

```bash
docker run -p 8080:8080 \
  -v $(pwd)/config:/config \
  -v $(pwd)/wallets:/publisher-wallets \
  cmdoss/walrus:latest
```

Configuration files in `/config`:

- `client-config.yml` - Walrus client configuration
- `wallet-config.yml` - Sui wallet configuration
- `keystore-config.json` - Keystore configuration
- `sites-config.yml` - Sites configuration

## Exposed Ports

- **8080**: HTTP API (Publisher service)
- **27182**: Metrics endpoint

## Binary Usage

You can also use the `sui` and `walrus` binaries directly:

```bash
# Check Sui version
docker run cmdoss/walrus:latest sui --version

# Check Walrus version
docker run cmdoss/walrus:latest walrus --version

# Run custom Walrus commands
docker run cmdoss/walrus:latest walrus --help
```

## Architecture Support

- `linux/amd64` (x86_64)
- `linux/arm64` (aarch64)

## License

This image packages binaries from:

- [Sui](https://github.com/MystenLabs/sui) - Apache 2.0
- [Walrus](https://github.com/MystenLabs/walrus) - Apache 2.0
