# Walrus Sites Portal

A self-hosted portal server for serving [Walrus Sites](https://docs.walrus.site/) - decentralized websites stored on the Sui blockchain and Walrus decentralized storage.

## Overview

This package provides a Docker Compose configuration to run the official Walrus Sites portal server locally. The portal acts as a gateway that:

- Resolves Walrus Site domains (base36 object IDs)
- Fetches site content from Walrus aggregators
- Serves decentralized websites through a standard HTTP interface

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- Network access to Sui RPC and Walrus aggregator endpoints

## Quick Start

```bash
# Start the portal server
pnpm dev

# Or directly with Docker Compose
docker compose up
```

The portal will be available at `http://localhost:3003`.

## Configuration

The portal is configured via environment variables in [compose.yaml](compose.yaml):

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_ALLOWLIST` | Enable site allowlist | `false` |
| `ENABLE_BLOCKLIST` | Enable site blocklist | `false` |
| `LANDING_PAGE_OID_B36` | Base36 object ID for the landing page | See config |
| `PORTAL_DOMAIN_NAME_LENGTH` | Expected domain name length | `21` |
| `RPC_URL_LIST` | Sui RPC endpoint(s) | Testnet fullnode |
| `PREMIUM_RPC_URL_LIST` | Premium Sui RPC endpoint(s) | Testnet fullnode |
| `SUINS_CLIENT_NETWORK` | SuiNS network for name resolution | `testnet` |
| `AGGREGATOR_URL` | Walrus aggregator URL | Testnet aggregator |
| `SITE_PACKAGE` | Walrus Sites package ID on Sui | Testnet package |
| `B36_DOMAIN_RESOLUTION_SUPPORT` | Enable base36 domain resolution | `true` |

## Network Configuration

This configuration is set up for **Sui Testnet**. To use a different network:

1. Update `RPC_URL_LIST` and `PREMIUM_RPC_URL_LIST` with appropriate RPC endpoints
2. Change `SUINS_CLIENT_NETWORK` to match (e.g., `mainnet`)
3. Update `AGGREGATOR_URL` to the correct Walrus aggregator
4. Update `SITE_PACKAGE` to the correct package ID for that network

### Mainnet Configuration

```yaml
environment:
  - RPC_URL_LIST=https://fullnode.mainnet.sui.io
  - PREMIUM_RPC_URL_LIST=https://fullnode.mainnet.sui.io
  - SUINS_CLIENT_NETWORK=mainnet
  - AGGREGATOR_URL=https://aggregator.walrus-mainnet.walrus.space
  - SITE_PACKAGE=<mainnet-package-id>
```

## Accessing Sites

Once the portal is running, you can access Walrus Sites by:

1. **Direct URL**: `http://<site-object-id-base36>.localhost:3003`
2. **Health Check**: `http://localhost:3003/__wal__/healthz`

## Docker Image

This setup uses the official Mysten Labs Walrus Sites portal image:

```text
mysten/walrus-sites-server-portal:mainnet-v2.1.1
```

Check [Docker Hub](https://hub.docker.com/r/mysten/walrus-sites-server-portal) for available tags.

## Troubleshooting

### Health Check Failing

The container includes a health check that pings `/__wal__/healthz`. If it fails:

- Ensure the container has network access to the configured RPC and aggregator URLs
- Check container logs: `docker compose logs walrus-sites-portal`

### Site Not Loading

- Verify the site object ID is correct and exists on the configured network
- Ensure `B36_DOMAIN_RESOLUTION_SUPPORT` is enabled for base36 IDs
- Check that `SITE_PACKAGE` matches the network where the site was deployed

## Related

- [Walrus Sites Documentation](https://docs.walrus.site/)
- [@cmdoss/walrus-site-builder](../../packages/site-builder) - SDK for deploying Walrus Sites
- [Playground App](../playground) - Interactive demo for site deployment
