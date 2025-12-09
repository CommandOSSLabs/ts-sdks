---
title: API Reference
description: Complete API reference for Site Builder SDK.
---

<!-- import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components'; -->

The Site Builder SDK provides a comprehensive TypeScript API for building and deploying decentralized websites on Walrus + Sui. This reference covers all classes, functions, types, and interfaces available in the SDK.

## Core Classes

<CardGrid stagger>
	<LinkCard title="WalrusSiteBuilderSdk" icon="rocket" href="/reference/walrus-site-builder-sdk">
		Main SDK class for interacting with Walrus and Sui networks. Provides site deployment and management capabilities.
	</LinkCard>
	<Card title="UpdateWalrusSiteFlow" icon="deploy">
		Manages the complete deployment flow from resource preparation to site updates on-chain.
	</Card>
	<Card title="ZenFsFileManager" icon="file">
		Browser-based file system manager using ZenFS for workspace operations.
	</Card>
</CardGrid>

## Configuration Types

<CardGrid stagger>
	<LinkCard title="WSResources" icon="database" href="/reference/ws-resources">
		Walrus Site Resources & Metadata configuration including headers, routes, and site metadata.
	</LinkCard>
	<LinkCard title="Metadata" icon="tag" href="/reference/metadata">
		Site metadata including link, image URL, description, project URL, and creator information.
	</LinkCard>
</CardGrid>

## Data Types

<CardGrid stagger>
	<LinkCard title="SiteData" icon="web" href="/reference/site-data">
		Complete site data structure containing resources, routes, metadata, and site name.
	</LinkCard>
	<Card title="SiteDataDiff" icon="diff">
		Represents differences between current and updated site data for efficient updates.
	</Card>
	<Card title="SuiResource" icon="blockchain">
		On-chain resource information including blob ID, hash, headers, and byte ranges.
	</Card>
	<LinkCard title="IAsset (Deprecated)" icon="package" href="/reference/i-asset">
		Legacy asset interface. Use IReadOnlyFileManager instead.
	</LinkCard>
</CardGrid>

## Transaction & Flow Types

<CardGrid stagger>
	<Card title="ITransaction" icon="transaction">
		Transaction information including digest, description, and timestamp.
	</Card>
	<Card title="ICertifiedBlob" icon="certificate">
		Certified blob information with blob ID, Sui object ID, end epoch, and patch details.
	</Card>
	<Card title="IUpdateWalrusSiteFlow" icon="status">
		Interface for the deployment flow with methods: prepareResources, writeResources, certifyResources, writeSite.
	</Card>
</CardGrid>

## Content & File Types

<CardGrid stagger>
	<LinkCard title="ContentType" icon="type" href="/reference/content-type">
		Comprehensive enum of MIME types for content classification and HTTP headers.
	</LinkCard>
	<Card title="IFileManager" icon="folder-open">
		Full interface for file system operations including read, write, and change monitoring.
	</Card>
	<Card title="IReadOnlyFileManager" icon="folder">
		Read-only file manager interface for passing to the deploy flow.
	</Card>
	<Card title="FileChangedCallback" icon="notification">
		Callback function type for file system change events (updated, removed).
	</Card>
</CardGrid>

## Utility Functions

<CardGrid stagger>
	<Card title="Content Type Utils" icon="tools">
		Functions for determining content types from file extensions and paths.
	</Card>
	<Card title="Hash Utils" icon="hash">
		Utility functions for hash calculations and blob ID conversions.
	</Card>
	<Card title="Path Utils" icon="path">
		Path manipulation utilities for file system operations.
	</Card>
	<Card title="Object Utils" icon="object">
		Utility functions for object ID extraction and owner address resolution.
	</Card>
</CardGrid>

## Quick Start

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';
import { ZenFsFileManager } from '@cmdoss/file-manager';

// Initialize file manager
const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();

// Initialize the SDK
const sdk = new WalrusSiteBuilderSdk(
  walrusClient,
  suiClient,
  walletAddr,
  signAndExecuteTransaction
);

// Configure site resources
const wsResources = {
  site_name: 'My Site',
  metadata: { description: 'A decentralized website' },
  routes: [['/*', '/index.html']] as [string, string][]
};

// Create and execute deploy flow
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

await deployFlow.prepareResources();
await deployFlow.writeResources(57, false);
const { certifiedBlobs } = await deployFlow.certifyResources();
const { siteId } = await deployFlow.writeSite();
```

## Navigation

Use the sidebar to explore specific API references:
- **Classes**: Core SDK classes and their methods
- **Types**: TypeScript interfaces and type definitions  
- **Functions**: Utility functions and helpers
- **Enums**: Enumerations and constants

Each reference page includes detailed parameter descriptions, return types, usage examples, and cross-references to related types.
