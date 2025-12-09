---
title: SiteData interface
description: Reference docs for the complete site data structure
badge:
    text: Interface
    variant: success
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`SiteData`](/reference/site-data) interface represents the complete structure of a Walrus site, containing all resources, routes, metadata, and site information needed for deployment and management.

## Definition

```typescript
interface SiteData {
  resources: SuiResource[]
  routes?: Array<[string, string]>
  metadata?: Metadata
  site_name?: string
}
```

## Properties

### `resources`
Array of all resources (files) that make up the site.

**Type:** [`SuiResource`](/reference/sui-resource)[]

**Required:** Yes

Each resource represents a file with its path, blob ID, hash, and headers for on-chain storage.

<Tabs>
  <TabItem label="Basic resources">

```typescript
const siteData: SiteData = {
  resources: [
    {
      path: '/index.html',
      blob_id: 'abc123...',
      blob_hash: 'hash123...',
      headers: [
        { key: 'content-type', value: 'text/html' },
        { key: 'content-encoding', value: 'identity' }
      ]
    }
  ]
};
```

  </TabItem>
  <TabItem label="Multiple resources">

```typescript
const siteData: SiteData = {
  resources: [
    {
      path: '/index.html',
      blob_id: 'html123...',
      blob_hash: 'hashHtml...',
      headers: [{ key: 'content-type', value: 'text/html' }]
    },
    {
      path: '/style.css',
      blob_id: 'css456...',
      blob_hash: 'hashCss...',
      headers: [{ key: 'content-type', value: 'text/css' }]
    }
  ]
};
```

  </TabItem>
</Tabs>

### `routes`
The routes for the site, mapping URL patterns to resource paths.

**Type:** `Array<[string, string]>` (optional)

**Default:** `undefined`

Routes define how URLs are mapped to specific resources. Each route is a tuple of `[pattern, target]`. This is optional and can be undefined for sites without custom routing.

<Tabs>
  <TabItem label="Simple routing">

```typescript
const siteData: SiteData = {
  resources: [...],
  routes: [
    ['/', '/index.html'],
    ['/about', '/about.html']
  ]
};
```

  </TabItem>
  <TabItem label="Advanced routing">

```typescript
const siteData: SiteData = {
  resources: [...],
  routes: [
    ['/', '/index.html'],
    ['/*', '/index.html']  // SPA fallback
  ]
};
```

  </TabItem>
</Tabs>

### `metadata`
The site metadata including description, creator, and social links.

**Type:** [`Metadata`](/reference/metadata) (optional)

**Default:** `undefined`

Metadata provides information about the site for display purposes and social sharing.

<Tabs>
  <TabItem label="Basic metadata">

```typescript
const siteData: SiteData = {
  resources: [...],
  metadata: {
    description: 'A decentralized website',
    creator: 'Developer Name'
  }
};
```

  </TabItem>
  <TabItem label="Complete metadata">

```typescript
const siteData: SiteData = {
  resources: [...],
  metadata: {
    link: 'https://mysite.walrus.xyz',
    image_url: 'https://mysite.walrus.xyz/og-image.png',
    description: 'A modern decentralized website built with Site Builder SDK',
    project_url: 'https://github.com/user/repo',
    creator: 'Developer Name'
  }
};
```

  </TabItem>
</Tabs>

### `site_name`
The name of the site.

**Type:** `string` (optional)

**Default:** `undefined`

The site name is used for display purposes and identification.

```typescript
const siteData: SiteData = {
  resources: [...],
  site_name: 'My Decentralized Website'
};
```

## Usage Examples

### Creating SiteData

Site data is typically created automatically by the SDK during the deployment flow. You don't need to manually construct it:

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';
import { ZenFsFileManager } from '@cmdoss/file-manager';

// Initialize file manager with your files
const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();
await fileManager.writeFile('/index.html', new TextEncoder().encode('<h1>Hello</h1>'));

// The SDK handles site data creation internally
const sdk = new WalrusSiteBuilderSdk(walrusClient, suiClient, walletAddr, signAndExecuteTransaction);
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

// Site data is created and managed during the flow
await deployFlow.prepareResources();
await deployFlow.writeResources(57, false);
const { certifiedBlobs } = await deployFlow.certifyResources();
const { siteId } = await deployFlow.writeSite();
```

### Using the Deploy Flow

```typescript
import { ZenFsFileManager } from '@cmdoss/file-manager';

// Initialize file manager
const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();

// Configure site resources
const wsResources: WSResources = {
  site_name: 'My Site',
  metadata: {
    description: 'A decentralized website',
    creator: 'Developer'
  },
  routes: [
    ['/', '/index.html'],
    ['/*', '/index.html']  // SPA fallback
  ]
};

// Create and execute deploy flow
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

// The deploy flow handles:
// - Reading files from the file manager
// - Creating site data structure
// - Uploading to Walrus
// - Creating blockchain transactions

await deployFlow.prepareResources();
await deployFlow.writeResources(57, false);
const { certifiedBlobs } = await deployFlow.certifyResources();
const { siteId } = await deployFlow.writeSite();
```

### Site Updates

The deploy flow automatically computes differences when updating an existing site:

```typescript
// For updating an existing site, include the object_id in wsResources
const wsResources: WSResources = {
  object_id: '0x123...',  // Existing site ID
  site_name: 'Updated Site Name',
  metadata: {
    description: 'Updated description',
    creator: 'Developer'
  }
};

const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

// The flow will:
// 1. Fetch existing site data from chain
// 2. Compare with new file manager contents
// 3. Only upload changed resources
// 4. Update site metadata if changed

await deployFlow.prepareResources();
await deployFlow.writeResources(57, false);
const { certifiedBlobs } = await deployFlow.certifyResources();
const { siteId } = await deployFlow.writeSite();
```

## Data Flow

The `SiteData` interface is central to the deployment process:

1. **Creation**: Built from file manager contents and WSResources configuration
2. **Processing**: Resources are processed and metadata is applied
3. **Comparison**: Compared with existing site data to determine updates
4. **Deployment**: Used to create blockchain transactions
5. **Storage**: Site information is stored on-chain

## Related Types

- [`SuiResource`](/reference/sui-resource) - On-chain resource information
- [`SiteDataDiff`](/reference/site-data-diff) - Differences between site data versions
- [`Metadata`](/reference/metadata) - Site metadata interface
- [`WSResources`](/reference/ws-resources) - Site configuration interface
- [`IReadOnlyFileManager`](/reference/i-read-only-file-manager) - File manager interface
