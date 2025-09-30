---
title: WalrusSiteBuilderSdk class
description: Reference docs for the main Site Builder SDK class
badge:
    text: Class
    variant: tip
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`WalrusSiteBuilderSdk`](/reference/walrus-site-builder-sdk) class is the main entry point for the Site Builder SDK. It provides methods for creating deploy flows, managing sites, and interacting with the Walrus and Sui networks.

## Constructor

```typescript
new WalrusSiteBuilderSdk(
  walrus: WalrusClient,
  sui: SuiClient,
  activeAccount: WalletAccount,
  signAndExecuteTransaction: ISignAndExecuteTransaction,
  wallet: WalletWithRequiredFeatures,
  config?: IWalrusSiteConfig
)
```

### Parameters

#### `walrus`
The Walrus client used for interacting with the Walrus API.

**Type:** `WalrusClient`

#### `sui`
The Sui client used for interacting with the Sui API.

**Type:** `SuiClient`

#### `activeAccount`
The active wallet account.

**Type:** `WalletAccount`

#### `signAndExecuteTransaction`
The function used to sign and execute transactions. Get by calling `useSignAndExecuteTransaction` hook.

**Type:** `ISignAndExecuteTransaction`

#### `wallet`
The wallet used for interacting with the user's wallet.

**Type:** `WalletWithRequiredFeatures`

#### `config`
The Walrus Site Builder SDK configuration.

**Type:** [`IWalrusSiteConfig`](/reference/i-walrus-site-config) (optional)

## Methods

### `deployFlow(assets, wsResource?)`

Creates a deploy flow for deploying a Walrus Site.

**Returns:** [`IWalrusSiteDeployFlow`](/reference/i-walrus-site-deploy-flow)

#### Parameters

##### `assets`
The assets to be deployed.

**Type:** [`IAsset`](/reference/i-asset)[]

##### `wsResource`
The Walrus resources configuration.

**Type:** [`WSResources`](/reference/ws-resources) (optional)

#### Example usage

<Tabs>
  <TabItem label="Basic deployment">

```typescript
const deployFlow = sdk.deployFlow(assets);

// Execute deployment steps
await deployFlow.prepareAssets();
await deployFlow.uploadAssets(57, false);
await deployFlow.certifyAssets();
await deployFlow.updateSite();
await deployFlow.cleanupAssets();
```

  </TabItem>
  <TabItem label="With site configuration">

```typescript
const wsResources: WSResources = {
  site_name: 'My Decentralized Site',
  metadata: {
    description: 'A site built with Site Builder SDK',
    creator: 'Developer Name'
  },
  routes: {
    '/': '/index.html',
    '/about': '/about.html'
  }
};

const deployFlow = sdk.deployFlow(assets, wsResources);
```

  </TabItem>
</Tabs>

### `createSiteUpdateTransaction(params)`

Creates a transaction to update a Walrus Site.

**Returns:** `Transaction`

#### Parameters

##### `params.siteId`
The ID of the site to update (optional for new sites).

**Type:** `string` (optional)

##### `params.siteData`
The site data containing resources, routes, and metadata.

**Type:** [`SiteData`](/reference/site-data)

##### `params.ownerAddr`
The address of the site owner.

**Type:** `string`

#### Example usage

```typescript
const transaction = sdk.createSiteUpdateTransaction({
  siteId: '0x123...',
  siteData: {
    resources: [...],
    routes: { '/': '/index.html' },
    metadata: { description: 'Updated site' },
    site_name: 'My Site'
  },
  ownerAddr: '0xabc...'
});

const result = await signAndExecuteTransaction({ transaction });
```

### `getSiteUpdates(params)`

Gets site updates for a Walrus Site by comparing current and new site data.

**Returns:** `Promise<`[`SiteDataDiff`](/reference/site-data-diff)`>`

#### Parameters

##### `params.siteData`
The new site data to compare against.

**Type:** [`SiteData`](/reference/site-data)

##### `params.siteId`
The ID of the existing site (optional).

**Type:** `string` (optional)

#### Example usage

```typescript
const siteUpdates = await sdk.getSiteUpdates({
  siteData: newSiteData,
  siteId: '0x123...'
});

console.log('Resource operations:', siteUpdates.resource_ops);
console.log('Route operations:', siteUpdates.route_ops);
console.log('Metadata update:', siteUpdates.metadata_op);
```

### `getSiteData(assets, wsResource)`

Gets the site data from the provided assets and Walrus resources.

**Returns:** `Promise<`[`SiteData`](/reference/SiteData)`>`

#### Parameters

##### `assets`
The assets to process.

**Type:** [`IAsset`](/reference/i-asset)[]

##### `wsResource`
The Walrus resources configuration.

**Type:** [`WSResources`](/reference/WSResources)

#### Example usage

```typescript
const siteData = await sdk.getSiteData(assets, wsResources);

console.log('Resources:', siteData.resources.length);
console.log('Routes:', siteData.routes);
console.log('Site name:', siteData.site_name);
```

## Properties

### `walrus`
The Walrus client instance.

**Type:** `WalrusClient`

### `sui`
The Sui client instance.

**Type:** `SuiClient`

### `activeAccount`
The active wallet account.

**Type:** `WalletAccount`

### `signAndExecuteTransaction`
The transaction signing function.

**Type:** `ISignAndExecuteTransaction`

### `wallet`
The wallet instance.

**Type:** `WalletWithRequiredFeatures`

### `config`
The SDK configuration.

**Type:** [`IWalrusSiteConfig`](/reference/i-walrus-site-config)

## Complete Example

<Tabs>
  <TabItem label="Setup">

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';

// Initialize SDK with required dependencies
const sdk = new WalrusSiteBuilderSdk(
  walrusClient,
  suiClient,
  activeAccount,
  signAndExecuteTransaction,
  wallet,
  {
    package: '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799',
    gasBudget: 1000000
  }
);
```

  </TabItem>
  <TabItem label="Deploy Flow">

```typescript
// Prepare assets
const assets: IAsset[] = [
  {
    path: '/index.html',
    content: new TextEncoder().encode('<h1>Hello World</h1>'),
    hash: new Uint8Array(32),
    hashU256: 0n
  }
];

// Configure site
const wsResources: WSResources = {
  site_name: 'My Site',
  metadata: {
    description: 'A decentralized website',
    creator: 'Developer'
  }
};

// Create and execute deploy flow
const deployFlow = sdk.deployFlow(assets, wsResources);

deployFlow.addEventListener('progress', (event) => {
  console.log('Deploy status:', event.detail.status);
});

deployFlow.addEventListener('transaction', (event) => {
  console.log('Transaction:', event.detail.transaction);
});

await deployFlow.prepareAssets();
await deployFlow.uploadAssets(57, false);
await deployFlow.certifyAssets();
await deployFlow.updateSite();
await deployFlow.cleanupAssets();
```

  </TabItem>
</Tabs>

## Related Types

- [`IWalrusSiteConfig`](/reference/i-walrus-site-config) - SDK configuration
- [`WSResources`](/reference/ws-resources) - Site resources and metadata
- [`SiteData`](/reference/site-data) - Complete site data structure
- [`IAsset`](/reference/i-asset) - Asset interface
- [`IWalrusSiteDeployFlow`](/reference/i-walrus-site-deploy-flow) - Deploy flow interface
