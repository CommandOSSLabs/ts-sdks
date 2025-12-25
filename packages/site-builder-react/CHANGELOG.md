# @cmdoss/site-builder-react

## 2.2.0

### Minor Changes

- f46c5a1: update link suins event handler

### Patch Changes

- Updated dependencies [f46c5a1]
  - @cmdoss/file-manager@2.2.0
  - @cmdoss/site-builder@2.2.0

## 2.1.0

### Minor Changes

- 0ba171d: buy-suins-and-extend-blob

### Patch Changes

- Updated dependencies [0ba171d]
  - @cmdoss/file-manager@2.1.0
  - @cmdoss/site-builder@2.1.0

## 2.0.0

### Minor Changes

- a689219: ## @cmdoss/site-builder

  ### Minor Changes

  - **Breaking**: `executeSiteUpdateFlow` now accepts an array of `IAsset` objects instead of an `IReadOnlyFileManager` instance. This decouples the SDK from specific file system implementations.
  - **Breaking**: Removed `IFileManager`, `IReadOnlyFileManager`, and `FileChangedCallback` interfaces.
  - **New**: Added `updateSiteMetadata` method to `WalrusSiteBuilderSdk` for updating site metadata.

  ## @cmdoss/file-manager

  ### Minor Changes

  - **Breaking**: `ZenFsFileManager` no longer implements the removed `IFileManager` interface.
  - **Fix**: Improved path normalization in `ZenFsFileManager`.

  ## @cmdoss/site-builder-react

  ### Minor Changes

  - **New**: Added `useStorageCostQuery` hook for calculating storage costs.
  - **Update**: Updated `useSitePublishing` to accept `assets` directly.
  - **Update**: `useZenfsFilesQuery` now returns `IAsset[]` with calculated hashes.

### Patch Changes

- Updated dependencies [a689219]
  - @cmdoss/file-manager@2.0.0
  - @cmdoss/site-builder@2.0.0

## 1.2.1

### Minor Changes

- 35dead1: remove wasm field in walrus client

### Patch Changes

- Updated dependencies [35dead1]
  - @cmdoss/file-manager@1.2.1
  - @cmdoss/site-builder@1.2.1

## 1.2.0

### Minor Changes

- a4e8041: handle ui change

### Patch Changes

- Updated dependencies [a4e8041]
  - @cmdoss/file-manager@1.2.0
  - @cmdoss/site-builder@1.2.0

## 1.0.1

### Minor Changes

- 57af66d: shorten type of sponsor config

### Patch Changes

- Updated dependencies [57af66d]
  - @cmdoss/file-manager@1.0.1
  - @cmdoss/site-builder@1.0.1

## 1.0.0

### Minor Changes

- 5b77a77: ## ⚠️ Breaking Changes

  ### `@cmdoss/site-builder`

  #### `IUpdateWalrusSiteFlow` interface changes

  - **`prepareResources()` return type changed** - Now returns `Promise<SiteDataDiff>` instead of `Promise<void>`. This allows consumers to inspect the computed diff before proceeding with upload. ([95d4f8c](https://github.com/CommandOSSLabs/ts-sdks/commit/95d4f8cb9668a3fe6f9cbd19f4319b15e5ec0fca))

    ```typescript
    // Before
    await flow.prepareResources();

    // After
    const diff = await flow.prepareResources();
    // Can now inspect diff before continuing
    ```

  - **`certifyResources()` return type changed** - Now returns `Promise<void>` instead of `Promise<{ certifiedBlobs: ICertifiedBlob[] }>`. Certified blob data is now handled internally. ([95d4f8c](https://github.com/CommandOSSLabs/ts-sdks/commit/95d4f8cb9668a3fe6f9cbd19f4319b15e5ec0fca))

    ```typescript
    // Before
    const { certifiedBlobs } = await flow.certifyResources();

    // After
    await flow.certifyResources();
    // Blob data is now managed internally
    ```

  #### `WalrusSiteBuilderSdk` constructor signature changed

  - **New optional `sponsorConfig` parameter** - Added as 5th constructor parameter for transaction sponsorship support. ([ba750bf](https://github.com/CommandOSSLabs/ts-sdks/commit/ba750bf5661267698c86b03faa87f1f2cbb67ab0))

    ```typescript
    // Before
    new WalrusSiteBuilderSdk(walrusClient, suiClient, walletAddr, signAndExecuteTransaction)

    // After (optional parameter added)
    new WalrusSiteBuilderSdk(walrusClient, suiClient, walletAddr, signAndExecuteTransaction, sponsorConfig?)
    ```

  #### `SiteDataDiff` type extended

  - **New resource operation types** - `resources[].op` now includes `'removedRoutes'` and `'burnedSite'` in addition to existing `'created' | 'deleted' | 'unchanged'`. ([6755667](https://github.com/CommandOSSLabs/ts-sdks/commit/675566785170b135e7bddfad9fb5f9750f7873b5))

  ### `@cmdoss/site-builder-react`

  #### `useSitePublishing` hook signature changed

  - **New optional `sponsorConfig` parameter** - Added to `UseSitePublishingParams` interface for transaction sponsorship. ([ba750bf](https://github.com/CommandOSSLabs/ts-sdks/commit/ba750bf5661267698c86b03faa87f1f2cbb67ab0))

    ```typescript
    // Before
    useSitePublishing({ ..., signAndExecuteTransaction })

    // After (optional parameter added)
    useSitePublishing({ ..., signAndExecuteTransaction, sponsorConfig? })
    ```

  #### `useWalrusClient` configuration changed

  - **`uploadRelay` configuration removed** - The upload relay configuration has been commented out/disabled. If you were relying on custom upload relay settings, this may affect your deployment behavior. ([ba750bf](https://github.com/CommandOSSLabs/ts-sdks/commit/ba750bf5661267698c86b03faa87f1f2cbb67ab0))

  ***

  ## New Features

  ### Site Management & Updates

  - **Implement SiteService for site management and diff calculation** ([6755667](https://github.com/CommandOSSLabs/ts-sdks/commit/675566785170b135e7bddfad9fb5f9750f7873b5)) - New service layer for managing site state, computing diffs, and handling resource transactions. Adds error handling for Sui client operations. [@toàn]

  - **Support update site title/metadata only** ([c82d457](https://github.com/CommandOSSLabs/ts-sdks/commit/c82d457be420453c38d1c8087a7c93dade18c1b2)) - Allow updating site metadata (title, description) without re-uploading all resources. Simplifies partial site updates. [@toàn]

  - **Implement fetchSiteRoutes** ([c61c638](https://github.com/CommandOSSLabs/ts-sdks/commit/c61c6383ae6510794cf31b2c7e67cd30a7adb2fa)) - New query function to fetch site routes from on-chain data. [@toàn]

  - **Add route validation** ([e5b2053](https://github.com/CommandOSSLabs/ts-sdks/commit/e5b20531f2ec9ff3b7301fc9730b327ec2de5ff8)) - Validates routes before deployment to catch configuration errors early. [@toàn]

  ### Transaction Sponsorship

  - **Implement transaction sponsorship feature with UI controls and backend integration** ([ba750bf](https://github.com/CommandOSSLabs/ts-sdks/commit/ba750bf5661267698c86b03faa87f1f2cbb67ab0)) - Adds transaction sponsorship support allowing users to have their transactions sponsored. Includes new `sponsor-client.ts` for backend integration and `AdvancedSettings` UI component. [@uyle]

  ### Blob & Certificate Handling

  - **Implement blob patch fetching and update site data with certified blobs** ([95d4f8c](https://github.com/CommandOSSLabs/ts-sdks/commit/95d4f8cb9668a3fe6f9cbd19f4319b15e5ec0fca)) - Enhanced deployment flow to properly fetch blob patches and associate certificates with on-chain records. [@toàn]

  ## Improvements

  - **Replace setTimeout with waitForTransaction** ([5e05334](https://github.com/CommandOSSLabs/ts-sdks/commit/5e05334c5192176b466b3793034ce923c2b7d2a8)) - Improved transaction handling reliability by using proper transaction confirmation instead of arbitrary timeouts. [@uyle]

  ## Testing

  - **Add comprehensive tests for SiteData utilities and diff computation** ([528322b](https://github.com/CommandOSSLabs/ts-sdks/commit/528322bacb7c73213b1c29c6d592e7bbcb9cbbfe)) - 800+ lines of test coverage for site data diff computation logic. [@toàn]

  - **Enhance site data diff tests for resource creation and deletion scenarios** ([b055839](https://github.com/CommandOSSLabs/ts-sdks/commit/b055839fbed5ca17bae6e3d610963ab9844a9a81)) - Extended test coverage for edge cases in resource lifecycle. [@toàn]

  - **Add SiteService tests** ([e5b2053](https://github.com/CommandOSSLabs/ts-sdks/commit/e5b20531f2ec9ff3b7301fc9730b327ec2de5ff8)) - Comprehensive test suite for the new SiteService. [@toàn]

  - **Add test coverage scripts and update workflow** ([857a8e0](https://github.com/CommandOSSLabs/ts-sdks/commit/857a8e09ddcd9489cd455ca9f1f847d3a88b4443)) - New `test:coverage` script and CI workflow integration. [@toàn]

  - **Add test:watch script** ([ac18306](https://github.com/CommandOSSLabs/ts-sdks/commit/ac183063799f6f3ff3f8ddc2d1baaad6f3f5bcfc)) - Development convenience for watching tests during development. [@toàn]

  ## Documentation

  - **Update README and AGENTS.md** ([2f1f4c5](https://github.com/CommandOSSLabs/ts-sdks/commit/2f1f4c5b53f016d458dea483f5040ec294b62ccc)) - Detailed usage examples, architecture overview, and comprehensive agent instructions. [@toàn]

  - **Add README for Walrus Sites Portal** ([8aa8a73](https://github.com/CommandOSSLabs/ts-sdks/commit/8aa8a73f6eda697ab31b0f60802b1b8402510588)) - Documentation for the portal application. [@toàn]

  ## Bug Fixes

  - **Fix build filters in docs workflow** ([db84bd2](https://github.com/CommandOSSLabs/ts-sdks/commit/db84bd2287622087d899948c5cee6f47b6ffbbdd)) - Corrected package names in CI workflow. [@toàn]

  - **Update tsdown version to 0.17.3** ([60d24ee](https://github.com/CommandOSSLabs/ts-sdks/commit/60d24ee1a4831ddc92ed5200b9a03f3a4a0a05f5)) - Fixed dependency version compatibility. [@toàn]

  ## CI/CD

  - **Add test and build steps to release workflow** ([6f1511b](https://github.com/CommandOSSLabs/ts-sdks/commit/6f1511becec04edd3497bc48220ebc007befe4a8)) - Ensures tests pass and build succeeds before releasing. [@toàn]

  - **Update changelog configuration** ([b9d1352](https://github.com/CommandOSSLabs/ts-sdks/commit/b9d135209df6e17c04011e0ec75e0cd30b02af39)) - Fixed changeset dependencies configuration. [@toàn]

  ## Contributors

  Thanks to the following contributors for this release:

  - [@toàn] (15 commits)
  - [@uyle] (3 commits)

  <!-- Reference Links -->

  [@toàn]: https://github.com/toanzzz
  [@uyle]: https://github.com/UyLeQuoc

### Patch Changes

- Updated dependencies [5b77a77]
  - @cmdoss/file-manager@1.0.0
  - @cmdoss/site-builder@1.0.0
