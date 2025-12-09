---
title: WSResources interface
description: Reference docs for the Walrus Site Resources & Metadata configuration
badge:
    text: Interface
    variant: note
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`WSResources`](/reference/ws-resources) interface represents the deserialized object of the file's `ws-resource.json` contents from Walrus Site Builder Rust SDK. It contains all the configuration needed for a Walrus site including headers, routes, metadata, and site information.

## Definition

```typescript
interface WSResources {
  headers?: { key: string; value: string }[]
  routes?: Array<[string, string]>
  metadata?: Metadata
  site_name?: string
  object_id?: string
  ignore?: string[]
}
```

## Properties

### `headers`
The HTTP headers to be set for the resources.

**Type:** `{ key: string; value: string }[]` (optional)

**Default:** `undefined`

Headers are applied to all resources unless overridden by specific resource headers.

<Tabs>
  <TabItem label="Basic headers">

```typescript
const wsResources: WSResources = {
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=3600' },
    { key: 'X-Content-Type-Options', value: 'nosniff' }
  ]
};
```

  </TabItem>
  <TabItem label="Security headers">

```typescript
const wsResources: WSResources = {
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
  ]
};
```

  </TabItem>
</Tabs>

### `routes`
The routes for a site, mapping URL patterns to resource paths.

**Type:** `Array<[string, string]>` (optional)

**Default:** `undefined`

Routes define how URLs are mapped to specific resources. Each route is a tuple of `[pattern, target]`.

<Tabs>
  <TabItem label="Basic routing">

```typescript
const wsResources: WSResources = {
  routes: [
    ['/', '/index.html'],
    ['/about', '/about.html'],
    ['/contact', '/contact.html']
  ]
};
```

  </TabItem>
  <TabItem label="SPA routing">

```typescript
const wsResources: WSResources = {
  routes: [
    ['/*', '/index.html'],  // All routes serve index.html for SPA
  ]
};
```

  </TabItem>
</Tabs>

### `metadata`
The attributes used inside the Display object for site metadata.

**Type:** [`Metadata`](/reference/metadata) (optional)

**Default:** `undefined`

Metadata includes information about the site such as description, creator, and social links.

<Tabs>
  <TabItem label="Basic metadata">

```typescript
const wsResources: WSResources = {
  metadata: {
    description: 'A decentralized website built with Site Builder SDK',
    creator: 'Developer Name',
    project_url: 'https://github.com/user/repo'
  }
};
```

  </TabItem>
  <TabItem label="Complete metadata">

```typescript
const wsResources: WSResources = {
  metadata: {
    link: 'https://mysite.walrus.xyz',
    image_url: 'https://mysite.walrus.xyz/og-image.png',
    description: 'A modern decentralized website',
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

The site name is used for display purposes and can be updated after deployment.

```typescript
const wsResources: WSResources = {
  site_name: 'My Decentralized Website'
};
```

### `object_id`
The object ID of the published site.

**Type:** `string` (optional)

**Default:** `undefined`

This parameter is automatically set by the `deploy` command to store information about the Site object being used. On subsequent calls to the `deploy` command, this parameter is used to update the site.

**Note:** Do not manually set this value unless you know the exact object ID of an existing site.

```typescript
const wsResources: WSResources = {
  object_id: '0x1234567890abcdef...'  // Auto-populated after deployment
};
```

### `ignore`
The paths to ignore when publishing/updating.

**Type:** `string[]` (optional)

**Default:** `undefined`

**Note:** Currently not supported by the Walrus Site Builder TS SDK.

```typescript
const wsResources: WSResources = {
  ignore: [
    '*.log',
    'node_modules/**',
    '.git/**'
  ]
};
```

## Complete Example

<Tabs>
  <TabItem label="Minimal configuration">

```typescript
const wsResources: WSResources = {
  site_name: 'My Site'
};
```

  </TabItem>
  <TabItem label="Full configuration">

```typescript
const wsResources: WSResources = {
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=3600' },
    { key: 'X-Content-Type-Options', value: 'nosniff' }
  ],
  routes: [
    ['/', '/index.html'],
    ['/about', '/about.html'],
    ['/*', '/index.html']  // SPA fallback
  ],
  metadata: {
    link: 'https://mysite.walrus.xyz',
    image_url: 'https://mysite.walrus.xyz/og-image.png',
    description: 'A modern decentralized website',
    project_url: 'https://github.com/user/repo',
    creator: 'Developer Name'
  },
  site_name: 'My Decentralized Website'
};
```

  </TabItem>
  <TabItem label="With deployment">

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';
import { ZenFsFileManager } from '@cmdoss/file-manager';

const wsResources: WSResources = {
  site_name: 'My Site',
  metadata: {
    description: 'A decentralized website',
    creator: 'Developer'
  },
  routes: [
    ['/', '/index.html']
  ]
};

const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();

const sdk = new WalrusSiteBuilderSdk(/* ... */);
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

// After successful deployment, object_id will be populated
console.log('Site object ID:', wsResources.object_id);
```

  </TabItem>
</Tabs>

## Usage in Deploy Flow

The `WSResources` interface is used throughout the deployment process:

1. **Initial Setup**: Define your site configuration
2. **Asset Processing**: Headers are applied to resources
3. **Route Mapping**: Routes are registered on-chain
4. **Metadata Storage**: Site metadata is stored in the blockchain
5. **Object Tracking**: `object_id` is updated after deployment

## Related Types

- [`Metadata`](/reference/metadata) - Site metadata interface
- [`SiteData`](/reference/site-data) - Complete site data structure
- [`WalrusSiteBuilderSdk`](/reference/walrus-site-builder-sdk) - Main SDK class
- [`IReadOnlyFileManager`](/reference/i-read-only-file-manager) - File manager interface
