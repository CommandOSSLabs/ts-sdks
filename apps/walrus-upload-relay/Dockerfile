ARG TARGETPLATFORM

FROM --platform=linux/amd64 mysten/walrus-upload-relay:main-v1.41.0 AS base-amd64
FROM --platform=linux/arm64 mysten/walrus-upload-relay:main-arm64-v1.41.0 AS base-arm64

FROM base-${TARGETPLATFORM#linux/} AS final
COPY --from=hairyhenderson/gomplate:stable /gomplate /bin/gomplate
COPY ./templates /templates
COPY --chmod=755 ./scripts/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
