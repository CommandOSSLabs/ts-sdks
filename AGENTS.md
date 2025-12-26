# AI Coding Agent Instructions for ts-sdks

## Project Overview

**ts-sdks** is a monorepo containing TypeScript SDKs and applications for deploying decentralized websites on the Sui blockchain ecosystem using Walrus decentralized storage.

- **Monorepo Tool**: Turbo + pnpm workspaces
- **Code Style**: Biome (linter/formatter), single quotes, no semicolons
- **Testing**: Node.js built-in test runner (`node --test`)
- **Language**: TypeScript 5.9+
- **Build Tool**: tsdown (for bundling SDK packages)

## Architecture & Key Packages

### Core Packages

1. **[@cmdoss/walrus-site-builder](packages/site-builder)** - Core SDK
   - Manages site deployment lifecycle: prepare → upload → certify → register
   - Entry point: `WalrusSiteBuilderSdk` class (initiates `UpdateWalrusSiteFlow`)
   - Flow stages: `prepareResources()` → `writeResources()` → `certifyResources()` → `writeSite()`
   - Key dependencies: `@mysten/sui`, `@mysten/walrus`
   - Uses `debug` module with namespace `site-builder:*` for logging

2. **[@cmdoss/file-manager](packages/file-manager)** - File System Abstraction
   - `ZenFsFileManager` wraps ZenFS virtual filesystem
   - Implements `IFileManager` interface for cross-platform file operations
   - Workspace directory concept: tracks workspace boundaries within virtual FS

3. **[@cmdoss/walrus-site-builder-react](packages/site-builder-react)** - React Integration
   - React Query hooks for blockchain queries
   - Nanostores for lightweight state management (theme, site data)
   - Vanilla Extract CSS with theme system
   - Radix UI + Lucide icons for components

### Applications

- **apps/docs** - Astro documentation site
- **apps/playground** - Next.js interactive demo showcasing all SDK features
- **apps/walrus-sites-portal** - Web interface for site management

## Critical Data Flow Patterns

### Site Deployment Flow

```text
IReadOnlyFileManager (virtual filesystem)
  ↓
UpdateWalrusSiteFlow.prepareResources()
  → Computes resource diff (added/modified/deleted files)
  → Generates blob hashes using SHA256
  ↓
.writeResources(numEpochs, isLatest)
  → Uses Walrus WriteFilesFlow to upload blobs
  → Returns blob IDs and certificates
  ↓
.certifyResources()
  → Retrieves on-chain blob patch data
  → Associates certificates with on-chain records
  ↓
.writeSite()
  → Creates/updates Site object on Sui blockchain
  → Registers resource mappings and routes
```

### Resource Diff Computation

- `computeSiteDataDiff()` ([site-data.utils.ts](packages/site-builder/src/lib/site-data.utils.ts)) compares old vs new file trees
- Tracks operations: `unchanged | added | modified | deleted` per file
- Critical for efficiency: only uploads/certifies changed files

## Developer Workflows

### Setup & Installation

```bash
# Install dependencies (uses pnpm)
pnpm install

# This is a monorepo - always use pnpm workspaces
# Packages can reference each other with "workspace:*" protocol
```

### Development

```bash
# Watch mode across all packages
pnpm dev

# Watch specific package
pnpm --filter @cmdoss/walrus-site-builder dev
```

### Building & Testing

```bash
# Turbo orchestrates all builds in dependency order
pnpm build              # Full build across monorepo
pnpm test              # Run all tests (Node test runner)
pnpm test:watch        # Watch mode testing
pnpm test:coverage     # Coverage report (excluded: **/*.test.ts files)

# Code quality
pnpm check             # Biome lint/format check
pnpm check:fix         # Auto-fix formatting issues
pnpm check:types       # TypeScript type checking
```

### Publishing

```bash
# Uses Changesets workflow
pnpm publish-packages  # Updates versions and publishes all packages to npm
```

## Code Style & Conventions

### Formatting (Biome)

- **Quotes**: Single quotes only
- **Semicolons**: Not required (removed in formatting)
- **Trailing commas**: None
- **Arrow function parens**: Only when necessary
- **Indent**: 2 spaces

### Pre-commit Hooks (Lefthook)

- Automatically runs `biome check --write` on staged files
- Stages fixed files automatically
- Always runs on: `.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}`

### Debugging

- Uses `debug` module throughout
- Enable with `DEBUG=site-builder:*` or `DEBUG=*` environment variable
- Namespace patterns: `site-builder:*`, `file-manager:*`, etc.

## TypeScript Patterns

### Interface-Based Architecture

All major components use interfaces prefixed with `I`:

- `IFileManager` - File operations contract
- `IWalrusSiteBuilderSdk` - SDK public contract
- `IUpdateWalrusSiteFlow` - Deployment flow contract
- `ISignAndExecuteTransaction` - Wallet signing contract

This enables:

- Easy mocking in tests
- Clear dependency boundaries
- Browser/Node.js compatible implementations

### Type Definition Structure

Critical types in [types.ts](packages/site-builder/src/types.ts):

- `WSResources` - Site metadata, routes, version info
- `SiteData` - On-chain site representation
- `SiteDataDiff` - Computed changes for deployment
- `ICertifiedBlob` - Walrus blob reference + on-chain data

## External Dependencies

### Critical Peer Dependencies (must be installed by consumer)

- `@mysten/sui` - Sui blockchain client & transactions
- `@mysten/walrus` - Walrus storage client (`WalrusClient`, `WriteFilesFlow`)
- `@mysten/wallet-standard` - Standard wallet interface
- `@mysten/dapp-kit` - React hooks for wallet connection (React package only)

### Key Libraries

- `@zenfs/core`, `@zenfs/dom`, `@zenfs/archives` - Virtual filesystem in browser
- `@tanstack/react-query` - Server state management (React package)
- `nanostores` - Lightweight client state (React package)
- `tsdown` - Used to build packages (like esbuild but simpler)

## Common Tasks

### Adding New Site Resource Type

1. Update `WSResources` type in [types.ts](packages/site-builder/src/types.ts)
2. Handle in `buildSiteCreationTx()` ([tx-builder.ts](packages/site-builder/src/lib/tx-builder.ts))
3. Update diff computation in [site-data.utils.ts](packages/site-builder/src/lib/site-data.utils.ts)
4. Add test case for diff logic

### Adding React Hook

1. Create in [site-builder-react/src/hooks](packages/site-builder-react/src/hooks/)
2. Use `@tanstack/react-query` for async queries
3. Export from [index.ts](packages/site-builder-react/src/index.ts)
4. Include TypeScript types

### Debugging Deployment Issues

- Check `debug` output: `DEBUG=site-builder:* pnpm test`
- Inspect transaction building in `buildSiteCreationTx()`
- Verify resource diff computation: ensure old vs new trees are correctly compared
- Check on-chain blob data retrieval: [blobs-patches.query.ts](packages/site-builder/src/queries/blobs-patches.query.ts)

## Network Support

Check [isSupportedNetwork()](packages/site-builder/src/lib/utils.ts) before deploying:

- Only certain Sui networks have Walrus integration
- Network validation prevents invalid deployments

## Notes for AI Agents

- **When modifying site-builder**: Run full test suite - deployment logic is complex and easily broken
- **Cross-package changes**: Use `pnpm build` to verify dependency graph
- **Browser compatibility**: Some Node.js APIs won't work; use ZenFS abstractions
- **Wallet integration**: `signAndExecuteTransaction` must be provided by consumer's wallet integration
- **Type safety**: Prefer interfaces over implementations; makes mocking/testing easier
