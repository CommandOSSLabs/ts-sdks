# CommandOSS TypeScript SDKs

A comprehensive collection of TypeScript SDKs for building and deploying decentralized websites on the Sui blockchain ecosystem, powered by Walrus decentralized storage.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Sui](https://img.shields.io/badge/Sui-Blockchain-4F46E5.svg)](https://sui.io/)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-06B6D4.svg)](https://walrus.xyz/)

## 🚀 Features

- **🌐 Decentralized Website Deployment**: Deploy static websites directly to Walrus storage with Sui blockchain integration
- **📁 Advanced File Management**: Browser-based file system using ZenFS with full TypeScript support
- **⚛️ React Integration**: Ready-to-use React hooks and components for seamless integration
- **🔧 Type-Safe**: Comprehensive TypeScript definitions throughout all packages
- **🧪 Testing Ready**: Built-in test suites and development tools
- **📱 Cross-Platform**: Works in both Node.js and browser environments

## 📚 Documentation

For comprehensive documentation, tutorials, and API reference, visit: **<https://ts-sdks.cmdoss.xyz>**

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@cmdoss/walrus-site-builder] | `0.1.0` | Core SDK for deploying decentralized websites on Walrus + Sui |
| [@cmdoss/walrus-site-builder-react] | `0.1.0` | React hooks and components for site-builder integration |
| [@cmdoss/file-manager] | `0.1.0` | Browser-based file system management with ZenFS |

## 🏗️ Apps

| App | Description |
|-----|-------------|
| **docs** | Comprehensive documentation site built with Astro + Starlight |
| **playground** | Interactive demo application showcasing all SDK features |

## 🛠️ Quick Start

### Installation

```bash
# Install the core SDK
npm install @cmdoss/walrus-site-builder

# For React applications
npm install @cmdoss/walrus-site-builder-react @cmdoss/file-manager

# Peer dependencies (required)
npm install @mysten/sui @mysten/wallet-standard @mysten/walrus
```

### Basic Usage

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/walrus-site-builder'
import { ZenFsFileManager } from '@cmdoss/file-manager'
import { WalrusClient } from '@mysten/walrus'
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'

// Initialize file manager
const fileManager = new ZenFsFileManager('/workspace')
await fileManager.initialize()

// Add your files
await fileManager.writeFile('/index.html', new TextEncoder().encode('<h1>Hello Walrus!</h1>'))

// Initialize the SDK
const sdk = new WalrusSiteBuilderSdk(
  walrusClient,
  suiClient,
  walletAddr,
  signAndExecuteTransaction
)

// Configure site resources
const wsResources = {
  site_name: 'My Site',
  metadata: { description: 'A decentralized website' },
  routes: [['/*', '/index.html']] as [string, string][]
}

// Create and execute deploy flow
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources)
await deployFlow.prepareResources()
await deployFlow.writeResources(5, false) // Store for 5 epochs
const { certifiedBlobs } = await deployFlow.certifyResources()
const { siteId } = await deployFlow.writeSite()
```

### React Integration

```typescript
import { useZenFsWorkspace } from '@cmdoss/walrus-site-builder-react'

function MyComponent() {
  const { assets, loading, fileManager } = useZenFsWorkspace()
  
  const addFile = async () => {
    await fileManager?.writeFile('/hello.txt', 'Hello World!')
  }
  
  return (
    <div>
      <button onClick={addFile}>Add File</button>
      {loading ? 'Loading...' : `${assets.length} files loaded`}
    </div>
  )
}
```

## 🏛️ Architecture

This monorepo is built with:

- **🔧 Turborepo**: High-performance build system for monorepos
- **📦 PNPM**: Fast, disk space efficient package manager
- **🎯 TypeScript**: Type-safe development with strict configuration
- **🧪 Node.js Test Runner**: Built-in testing without external dependencies
- **🎨 Biome**: Fast formatter and linter for consistent code style

### Package Architecture

```text
packages/
├── site-builder/          # Core SDK - Walrus + Sui integration
│   ├── src/
│   │   ├── sdk.ts        # Main SDK class
│   │   ├── deploy-flow.ts # Deployment orchestration
│   │   ├── manager.ts    # Site management
│   │   ├── resource.ts   # Resource handling
│   │   └── types.ts      # TypeScript definitions
│   └── package.json
├── site-builder-react/    # React integration layer
│   ├── src/
│   │   └── useZenFsWorkspace.ts # File system hook
│   └── package.json
└── file-manager/          # Browser file system
    ├── src/
    │   └── file-manager.ts # ZenFS implementation
    └── package.json
```

## 🚦 Development

### Prerequisites

- Node.js 18+
- PNPM 8+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/CommandOSSLabs/ts-sdks.git
cd ts-sdks

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev              # Start all packages in watch mode
pnpm build            # Build all packages
pnpm test             # Run all tests

# Code Quality
pnpm check            # Run Biome linter
pnpm check:fix        # Fix linting issues automatically
pnpm check:types      # Type check all packages

# Publishing
pnpm publish-packages # Build, test, and publish to npm
```

### Project Structure

```text
ts-sdks/
├── apps/
│   ├── docs/                    # Documentation site (Astro)
│   └── playground/              # Demo application (Next.js)
├── packages/
│   ├── site-builder/            # Core SDK
│   ├── site-builder-react/      # React integration
│   └── file-manager/            # File system management
├── configs/
│   ├── tsconfig.base.json       # Base TypeScript config
│   └── tsconfig.library.json    # Library-specific config
├── package.json                 # Root package configuration
├── turbo.json                   # Turborepo configuration
└── README.md                    # This file
```

## 🌟 Key Features Explained

### Decentralized Website Deployment

Deploy static websites directly to Walrus decentralized storage with automatic Sui blockchain integration:

- **Asset Management**: Automatic file processing, compression, and optimization
- **Blob Storage**: Efficient storage on Walrus with configurable retention periods
- **Site Certification**: Blockchain-verified asset integrity and ownership
- **Update Management**: Seamless site updates with diff-based optimization

### Browser-Based File System

Full file system operations in the browser using ZenFS:

- **Multiple Backends**: IndexedDB, ZIP, and ISO support
- **Real-time Updates**: File change notifications and reactive updates
- **Type Safety**: Full TypeScript integration with proper error handling
- **Memory Efficient**: Handles large files without blocking the UI

### React Integration

Production-ready React hooks and components:

- **useZenFsWorkspace**: Complete file system management in React
- **Automatic State Management**: Reactive file updates and loading states
- **Error Boundaries**: Proper error handling and user feedback
- **Performance Optimized**: Minimal re-renders and efficient updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper tests
4. Run the test suite (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 CommandOSS™ Team

## 🙏 Acknowledgments

- Built on [Sui](https://sui.io/) blockchain infrastructure
- Powered by [Walrus](https://walrus.xyz/) decentralized storage
- File operations using [ZenFS](https://github.com/zen-fs/core)
- Inspired by the [Rust Walrus Sites implementation](https://github.com/MystenLabs/walrus-sites)

## 🔗 Links

- **Documentation**: <https://ts-sdks.cmdoss.xyz>
- **GitHub**: <https://github.com/CommandOSSLabs/ts-sdks>
- **NPM Organization**: <https://www.npmjs.com/org/cmdoss>
- **Website**: <https://cmdoss.xyz>

---

<p align="center">
  <strong>Built with ❤️ by the CommandOSS Team</strong>
</p>

[@cmdoss/walrus-site-builder]: https://www.npmjs.com/package/@cmdoss/walrus-site-builder
[@cmdoss/walrus-site-builder-react]: https://www.npmjs.com/package/@cmdoss/walrus-site-builder-react
[@cmdoss/file-manager]: https://www.npmjs.com/package/@cmdoss/file-manager
