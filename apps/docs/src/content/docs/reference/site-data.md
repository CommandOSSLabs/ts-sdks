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
  resources: Resource[]
  routes?: Routes
  metadata?: Metadata
  site_name?: string
}
```

## Properties

### `resources`
Array of all resources (files) that make up the site.

**Type:** [`Resource`](/reference/resource)[]

**Required:** Yes

Each resource represents a file with its path, content information, and on-chain metadata.

<Tabs>
  <TabItem label="Basic resources">

```typescript
const siteData: SiteData = {
  resources: [
    {
      full_path: '/index.html',
      unencoded_size: 1024,
      info: {
        path: '/index.html',
        blob_id: 'abc123...',
        blob_id_le_u256: 1234567890n,
        blob_hash: new Uint8Array(32),
        blob_hash_le_u256: 9876543210n,
        headers: {
          'content-type': 'text/html',
          'content-encoding': 'identity'
        }
      }
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
      full_path: '/index.html',
      unencoded_size: 1024,
      info: {
        path: '/index.html',
        blob_id: 'html123...',
        blob_id_le_u256: 1234567890n,
        blob_hash: new Uint8Array(32),
        blob_hash_le_u256: 9876543210n,
        headers: { 'content-type': 'text/html' }
      }
    },
    {
      full_path: '/style.css',
      unencoded_size: 512,
      info: {
        path: '/style.css',
        blob_id: 'css456...',
        blob_id_le_u256: 2345678901n,
        blob_hash: new Uint8Array(32),
        blob_hash_le_u256: 8765432109n,
        headers: { 'content-type': 'text/css' }
      }
    }
  ]
};
```

  </TabItem>
</Tabs>

### `routes`
The routes for the site, mapping URL patterns to resource paths.

**Type:** [`Routes`](/reference/routes) (optional)

**Default:** `undefined`

Routes define how URLs are mapped to specific resources. This is optional and can be undefined for sites without custom routing.

<Tabs>
  <TabItem label="Simple routing">

```typescript
const siteData: SiteData = {
  resources: [...],
  routes: {
    '/': '/index.html',
    '/about': '/about.html'
  }
};
```

  </TabItem>
  <TabItem label="Advanced routing">

```typescript
const siteData: SiteData = {
  resources: [...],
  routes: {
    '/': '/index.html',
    '/api/v1/*': '/api/index.html',
    '/docs/*': '/docs/index.html',
    '/assets/*': '/static/*'
  }
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

### Creating SiteData from Assets

<Tabs>
  <TabItem label="Using ResourceManager">

```typescript
import { ResourceManager } from '@cmdoss/site-builder';

const resourceManager = new ResourceManager(walrusClient, wsResources);
const siteData = await resourceManager.getSiteData(assets);

console.log('Site data created:', {
  resourceCount: siteData.resources.length,
  routes: siteData.routes,
  siteName: siteData.site_name
});
```

  </TabItem>
  <TabItem label="Manual construction">

```typescript
const siteData: SiteData = {
  resources: assets.map(asset => ({
    full_path: asset.path,
    unencoded_size: asset.content.length,
    info: {
      path: asset.path,
      blob_id: '<unknown>',
      blob_id_le_u256: 0n,
      blob_hash: asset.hash,
      blob_hash_le_u256: asset.hashU256,
      headers: {
        'content-type': contentTypeFromFilePath(asset.path),
        'content-encoding': 'identity'
      }
    }
  })),
  routes: {
    '/': '/index.html',
    '/about': '/about.html'
  },
  metadata: {
    description: 'My decentralized website',
    creator: 'Developer'
  },
  site_name: 'My Site'
};
```

  </TabItem>
</Tabs>

### Using SiteData in Deploy Flow

```typescript
// Get site data from assets
const siteData = await sdk.getSiteData(assets, wsResources);

// Create deploy flow
const deployFlow = sdk.deployFlow(assets, wsResources);

// The deploy flow will use the site data for:
// - Preparing assets for upload
// - Creating blockchain transactions
// - Updating site metadata
// - Managing resource lifecycle

await deployFlow.prepareAssets();
await deployFlow.uploadAssets(57, false);
await deployFlow.certifyAssets();
await deployFlow.updateSite();
```

### SiteData Diff and Updates

```typescript
// Get current site data
const currentSiteData = await sdk.getSiteData(currentAssets, wsResources);

// Get updated site data
const updatedSiteData = await sdk.getSiteData(updatedAssets, updatedWsResources);

// Compare for differences
const siteUpdates = await sdk.getSiteUpdates({
  siteData: updatedSiteData,
  siteId: existingSiteId
});

console.log('Updates needed:', {
  resourceOps: siteUpdates.resource_ops.length,
  routeOps: siteUpdates.route_ops.length,
  metadataOp: siteUpdates.metadata_op,
  siteNameOp: siteUpdates.site_name_op
});
```

## Data Flow

The `SiteData` interface is central to the deployment process:

1. **Creation**: Built from assets and WSResources configuration
2. **Processing**: Resources are processed and metadata is applied
3. **Comparison**: Compared with existing site data to determine updates
4. **Deployment**: Used to create blockchain transactions
5. **Storage**: Site information is stored on-chain

## Related Types

- [`Resource`](/reference/resource) - Individual file resource structure
- [`Routes`](/reference/routes) - Route mapping interface
- [`Metadata`](/reference/metadata) - Site metadata interface
- [`SiteDataDiff`](/reference/site-data-diff) - Differences between site data versions
- [`IAsset`](/reference/i-asset) - Asset interface for file processing
- [`WSResources`](/reference/ws-resources) - Site configuration interface
