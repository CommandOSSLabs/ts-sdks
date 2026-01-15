# Walrus Docker Image

Official Docker image containing the latest Sui and Walrus binaries with a pre-configured Walrus Publisher service.

**Docker Hub:** [cmdoss/walrus](https://hub.docker.com/r/cmdoss/walrus)

## Features

- **Latest Binaries**: Pre-installed `sui` (v1.63.2) and `walrus` (v1.40.3) binaries
- **Multi-Architecture**: Supports `amd64` and `arm64`
- **Configurable**: Environment variable-based configuration using [Gomplate](https://gomplate.ca/)
- **Multiple Modes**: Run as Publisher, Aggregator, Daemon (combined), or CLI tool
- **Pre-configured Services**: Ready-to-run services with sensible defaults
- **Network Support**: testnet (default), mainnet

## Quick Start

### CLI Mode (default)

```bash
# Use as CLI tool without starting any service
docker run cmdoss/walrus:latest walrus --version
```

### Publisher Mode

```bash
# Start Walrus Publisher service
docker run -p 31415:31415 \
  -e MODE=publisher \
  -e SUI_KEYSTORE=your_private_key_here \
  cmdoss/walrus:latest
```

### Aggregator Mode

```bash
# Start Walrus Aggregator service (no wallet required)
docker run -p 31415:31415 \
  -e MODE=aggregator \
  cmdoss/walrus:latest
```

### Daemon Mode (Publisher + Aggregator)

```bash
# Start combined Publisher and Aggregator service
docker run -p 31415:31415 \
  -e MODE=daemon \
  -e SUI_KEYSTORE=your_private_key_here \
  cmdoss/walrus:latest
```

## Environment Variables

### General Configuration

| Variable       | Default   | Description                                                                               |
| -------------- | --------- | ----------------------------------------------------------------------------------------- |
| `MODE`         | -         | Service mode: `publisher`, `aggregator`, `daemon`, or unset for CLI mode                  |
| `NETWORK`      | `testnet` | Network to use (`testnet`, `mainnet`)                                                     |
| `SUI_KEYSTORE` | -         | **Required for publisher/daemon modes** Private key from `~/.sui/sui_config/sui.keystore` |

### Shared Configuration (All Modes)

| Variable          | Default      | Description                   |
| ----------------- | ------------ | ----------------------------- |
| `BIND_ADDRESS`    | `[::]:31415` | HTTP server bind address      |
| `METRICS_ADDRESS` | `[::]:27182` | Metrics endpoint address      |
| `BLOCKLIST`       | -            | Path to blocklist file (YAML) |
| `MAX_BLOB_SIZE`   | -            | Maximum blob size in bytes    |

### Publisher-Specific Configuration (publisher, daemon modes)

| Variable                            | Default     | Description                               |
| ----------------------------------- | ----------- | ----------------------------------------- |
| `SUB_WALLETS_DIR`                   | `/wallets`  | Directory for sub-wallets                 |
| `MAX_BODY_SIZE`                     | `10240`     | Maximum upload body size (KB)             |
| `MAX_QUILT_BODY_SIZE`               | `102400`    | Maximum quilt body size (KB)              |
| `PUBLISHER_MAX_BUFFER_SIZE`         | `8`         | Publisher max buffer size                 |
| `PUBLISHER_MAX_CONCURRENT_REQUESTS` | `8`         | Publisher max concurrent requests         |
| `N_CLIENTS`                         | `8`         | Number of Walrus clients                  |
| `REFILL_INTERVAL`                   | `1s`        | Wallet refill interval                    |
| `GAS_REFILL_AMOUNT`                 | `500000000` | SUI gas refill amount (MIST)              |
| `WAL_REFILL_AMOUNT`                 | `500000000` | WAL token refill amount                   |
| `SUB_WALLETS_MIN_BALANCE`           | `500000000` | Minimum sub-wallet balance                |
| `BURN_AFTER_STORE`                  | `0`         | Burn WAL tokens after store (1=yes, 0=no) |

### JWT Authentication (publisher, daemon modes)

| Variable                     | Default | Description                        |
| ---------------------------- | ------- | ---------------------------------- |
| `JWT_DECODE_SECRET`          | -       | JWT secret for verification        |
| `JWT_ALGORITHM`              | -       | JWT algorithm (e.g., `HS256`)      |
| `JWT_EXPIRING_SEC`           | -       | JWT expiration time (seconds)      |
| `JWT_VERIFY_UPLOAD`          | `0`     | Verify JWT on upload (1=yes, 0=no) |
| `JWT_CACHE_SIZE`             | `10000` | JWT cache size                     |
| `JWT_CACHE_REFRESH_INTERVAL` | `5s`    | JWT cache refresh interval         |

### Aggregator-Specific Configuration (aggregator, daemon modes)

| Variable                             | Default                                                                                                  | Description                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `AGGREGATOR_MAX_BUFFER_SIZE`         | `320`                                                                                                    | Aggregator max buffer size                       |
| `AGGREGATOR_MAX_CONCURRENT_REQUESTS` | `256`                                                                                                    | Aggregator max concurrent requests               |
| `ALLOWED_HEADERS`                    | `content-type authorization content-disposition content-encoding content-language content-location link` | Space-separated list of allowed response headers |
| `ALLOW_QUILT_PATCH_TAGS`             | `0`                                                                                                      | Allow quilt patch tags in response (1=yes, 0=no) |

## Usage Examples

### Run Publisher with Custom Configuration

```bash
docker run -p 31415:31415 \
  -e MODE=publisher \
  -e SUI_KEYSTORE=your_private_key_here \
  -e NETWORK=mainnet \
  -e MAX_BODY_SIZE=20480 \
  -e PUBLISHER_MAX_CONCURRENT_REQUESTS=16 \
  cmdoss/walrus:latest
```

### Run Publisher with JWT Authentication

```bash
docker run -p 31415:31415 \
  -e MODE=publisher \
  -e SUI_KEYSTORE=your_private_key_here \
  -e JWT_DECODE_SECRET="your-secret-key" \
  -e JWT_ALGORITHM="HS256" \
  -e JWT_VERIFY_UPLOAD=1 \
  cmdoss/walrus:latest
```

### Run Daemon Mode (Combined Publisher + Aggregator)

```bash
docker run -p 31415:31415 \
  -e MODE=daemon \
  -e SUI_KEYSTORE=your_private_key_here \
  -e N_CLIENTS=16 \
  -e AGGREGATOR_MAX_CONCURRENT_REQUESTS=512 \
  cmdoss/walrus:latest
```

### Use with Docker Compose

```yaml
version: '3.8'
services:
  walrus-publisher:
    image: cmdoss/walrus:latest
    ports:
      - "31415:31415"
      - "27182:27182"  # Metrics
    environment:
      MODE: publisher
      SUI_KEYSTORE: ${SUI_KEYSTORE}
      NETWORK: testnet
      MAX_BODY_SIZE: 20480
    volumes:
      - ./wallets:/wallets

  walrus-aggregator:
    image: cmdoss/walrus:latest
    ports:
      - "31416:31415"
      - "27183:27182"  # Metrics
    environment:
      MODE: aggregator
      NETWORK: testnet
      BIND_ADDRESS: "[::]:31415"

  walrus-daemon:
    image: cmdoss/walrus:latest
    ports:
      - "31417:31415"
      - "27184:27182"  # Metrics
    environment:
      MODE: daemon
      SUI_KEYSTORE: ${SUI_KEYSTORE}
      NETWORK: testnet
    volumes:
      - ./wallets:/wallets
```

### Custom Wallet Configuration

Mount your own wallet and configuration files:

```bash
docker run -p 31415:31415 \
  -e MODE=publisher \
  -e SUI_KEYSTORE=your_private_key_here \
  -v $(pwd)/config:/config \
  -v $(pwd)/wallets:/wallets \
  cmdoss/walrus:latest
```

Configuration files in `/config`:

- `client-config.yml` - Walrus client configuration
- `wallet-config.yml` - Sui wallet configuration
- `keystore-config.json` - Keystore configuration
- `sites-config.yml` - Sites configuration

## Exposed Ports

- **31415**: HTTP API (Publisher/Aggregator/Daemon service)
- **27182**: Metrics endpoint (Prometheus)

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
