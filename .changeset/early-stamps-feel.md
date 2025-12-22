---
"@cmdoss/site-builder-react": minor
"@cmdoss/file-manager": minor
"@cmdoss/site-builder": minor
---

## @cmdoss/site-builder

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
