---
title: API Reference
description: Complete API reference for Site Builder SDK.
---

import { Card, CardGrid } from '@astrojs/starlight/components';

The Site Builder SDK provides a comprehensive TypeScript API for building and deploying decentralized websites on Walrus + Sui. This reference covers all classes, functions, types, and interfaces available in the SDK.

## Core Classes

<CardGrid stagger>
	<Card title="WalrusSiteBuilderSdk" icon="rocket" link="/reference/walrus-site-builder-sdk">
		Main SDK class for interacting with Walrus and Sui networks. Provides site creation, deployment, and management capabilities.
	</Card>
	<Card title="WalrusSiteDeployFlow" icon="deploy">
		Manages the complete deployment flow from asset preparation to site updates on-chain.
	</Card>
	<Card title="SiteManager" icon="setting">
		Handles site operations including updates, metadata management, and transaction creation.
	</Card>
	<Card title="ResourceManager" icon="folder">
		Manages site resources, file processing, and asset organization.
	</Card>
	<Card title="ZenFsFileManager" icon="file">
		Browser-based file system manager using ZenFS for workspace operations.
	</Card>
</CardGrid>

## Configuration Types

<CardGrid stagger>
	<Card title="IWalrusSiteConfig" icon="gear">
		Configuration interface for Walrus Site Builder SDK settings including package ID and gas budget.
	</Card>
	<Card title="WSResources" icon="database" link="/reference/ws-resources">
		Walrus Site Resources & Metadata configuration including headers, routes, and site metadata.
	</Card>
	<Card title="Metadata" icon="tag" link="/reference/metadata">
		Site metadata including link, image URL, description, project URL, and creator information.
	</Card>
	<Card title="Routes" icon="route">
		Route mapping interface for defining URL patterns and their corresponding resources.
	</Card>
</CardGrid>

## Data Types

<CardGrid stagger>
	<Card title="SiteData" icon="web" link="/reference/site-data">
		Complete site data structure containing resources, routes, metadata, and site name.
	</Card>
	<Card title="SiteDataDiff" icon="diff">
		Represents differences between current and updated site data for efficient updates.
	</Card>
	<Card title="Resource" icon="file">
		File resource with full path, size information, and on-chain metadata.
	</Card>
	<Card title="SuiResource" icon="blockchain">
		On-chain resource information including blob ID, hash, headers, and byte ranges.
	</Card>
	<Card title="IAsset" icon="package" link="/reference/i-asset">
		Asset interface containing path, content, and hash information for file processing.
	</Card>
</CardGrid>

## Transaction & Flow Types

<CardGrid stagger>
	<Card title="ITransaction" icon="transaction">
		Transaction information including digest, description, and timestamp.
	</Card>
	<Card title="ICertifiedBlob" icon="certificate">
		Certified blob information with blob ID, Sui object ID, end epoch, and patch details.
	</Card>
	<Card title="DeployStatus" icon="status">
		Enumeration of deployment flow statuses from Idle to Completed/Failed.
	</Card>
	<Card title="IFlowListener" icon="listener">
		Type-safe event listener for deployment flow progress and transaction events.
	</Card>
</CardGrid>

## Content & File Types

<CardGrid stagger>
	<Card title="ContentType" icon="type" link="/reference/content-type">
		Comprehensive enum of MIME types for content classification and HTTP headers.
	</Card>
	<Card title="IFileManager" icon="folder-open">
		Interface for file system operations including read, write, and change monitoring.
	</Card>
	<Card title="FileChangeCallback" icon="notification">
		Callback function type for file system change events (created, updated, removed).
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

// Initialize the SDK
const sdk = new WalrusSiteBuilderSdk(
  walrusClient,
  suiClient,
  activeAccount,
  signAndExecuteTransaction,
  wallet,
  config
);

// Create a deploy flow
const deployFlow = sdk.deployFlow(assets, siteResources);

// Execute deployment steps
await deployFlow.prepareAssets();
await deployFlow.uploadAssets(57, false);
await deployFlow.certifyAssets();
await deployFlow.updateSite();
await deployFlow.cleanupAssets();
```

## Navigation

Use the sidebar to explore specific API references:
- **Classes**: Core SDK classes and their methods
- **Types**: TypeScript interfaces and type definitions  
- **Functions**: Utility functions and helpers
- **Enums**: Enumerations and constants

Each reference page includes detailed parameter descriptions, return types, usage examples, and cross-references to related types.
