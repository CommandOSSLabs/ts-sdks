###############################################################################
# Walrus image.
#
# Available publcly at: https://hub.docker.com/r/cmdoss/walrus
#
# It contains the following binaries:
# - sui
# - walrus
#
# Supported architectures:
# - amd64
# - arm64
###############################################################################

FROM alpine:3.23 AS base

#  Pre-defined build arguments https://docs.docker.com/build/building/multi-platform/
ARG TARGETARCH

# Set SUI & WALRUS version
ENV SUI_VERSION=v1.63.2
ENV WALRUS_VERSION=v1.40.3

# Set SUI & WALRUS network (mainnet, testnet, devnet)
ENV SUI_NETWORK=testnet
ENV WALRUS_NETWORK=testnet

# Determine binary architecture and download/install binaries
RUN set -eux; \
  case "$TARGETARCH" in \
    amd64) BIN_ARCH="x86_64" ;; \
    arm64) BIN_ARCH="aarch64" ;; \
    *) echo "Unsupported architecture: $TARGETARCH"; exit 1 ;; \
  esac; \
  BINARIES="sui walrus"; \
  for BIN in $BINARIES; do \
    case "$BIN" in \
      sui) \
        URL="https://github.com/MystenLabs/sui/releases/download/${SUI_NETWORK}-${SUI_VERSION}/sui-${SUI_NETWORK}-${SUI_VERSION}-ubuntu-${BIN_ARCH}.tgz"; \
        OUT="/tmp/sui.tar.gz"; \
        EXE="sui" \
        ;; \
      walrus) \
        URL="https://github.com/MystenLabs/walrus/releases/download/${WALRUS_NETWORK}-${WALRUS_VERSION}/walrus-${WALRUS_NETWORK}-${WALRUS_VERSION}-ubuntu-${BIN_ARCH}.tgz"; \
        OUT="/tmp/walrus.tar.gz"; \
        EXE="walrus" \
        ;; \
    esac; \
    wget -O "$OUT" "$URL"; \
    tar -xzf "$OUT" -C /tmp; \
    mv "/tmp/$EXE" "/usr/local/bin/$EXE"; \
    chmod +x "/usr/local/bin/$EXE"; \
    rm "$OUT"; \
  done

# Use Ubuntu 24.04 as runtime, since it's the only one that has glibc 2.39
FROM ubuntu:24.04 AS runtime

# Create a volume for storing wallets
VOLUME [ "/wallets" ]

# sui-tool needs libpq5 at runtime and uses git when fetching move dependencies during build
RUN apt-get update && apt-get install -y libpq5 libpq-dev ca-certificates git curl

# Copy the binaries from the base image
COPY --chmod=755 --from=base /usr/local/bin/sui /usr/local/bin/sui
COPY --chmod=755 --from=base /usr/local/bin/walrus /usr/local/bin/walrus
# Install Gomplate for templating
COPY --from=hairyhenderson/gomplate:stable /gomplate /bin/gomplate

# Copy the site-builder configuration files and scripts
COPY ./templates /templates
COPY --chmod=755 ./scripts/entrypoint.sh /entrypoint.sh

# Additional metadata
ARG BUILD_DATE
LABEL build-date=$BUILD_DATE

ENTRYPOINT ["/entrypoint.sh"]

# Expose port 8080 for the HTTP server
EXPOSE 8080
