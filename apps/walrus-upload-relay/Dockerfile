FROM mysten/walrus-upload-relay:main-v1.40.0
COPY --from=hairyhenderson/gomplate:stable /gomplate /bin/gomplate
COPY ./templates /templates
COPY --chmod=755 ./scripts/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
