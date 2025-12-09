# Site Builder Playground

An interactive playground for exploring and testing the Site Builder SDK capabilities. Build, deploy, and manage static sites on Walrus decentralized storage.

**🌐 Public Instance:** [https://playground.site-builder.cmdoss.xyz](https://playground.site-builder.cmdoss.xyz)

## Features

- **File Explorer** - Browse and view files stored on Walrus
- **Blob Content Viewer** - Inspect blob contents with syntax highlighting
- **Wallet Integration** - Connect your Sui wallet to interact with the network
- **Network Configuration** - Support for multiple Sui networks (mainnet, testnet)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# From the repository root
pnpm install
```

### Development

```bash
# Run the development server
pnpm dev

# Or from the repository root
pnpm --filter playground dev
```

Open [http://localhost:3000](http://localhost:3000) to view the playground.

## Project Structure

```text
apps/playground/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Shadcn UI components
│   └── file-explorer/ # File browsing components
├── hooks/           # Custom React hooks
├── configs/         # Network configurations
└── lib/             # Utility functions
```

## Related Packages

- [`@cmdoss/site-builder`](../../packages/site-builder) - Core Site Builder SDK
- [`@cmdoss/site-builder-react`](../../packages/site-builder-react) - React components and hooks

## License

See the repository root for license information.
