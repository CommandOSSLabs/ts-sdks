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
  suiClient: SuiClient,
  walletAddr: string,
  signAndExecuteTransaction: ISignAndExecuteTransaction
)
```

### Parameters

#### `walrus`
The Walrus client used for interacting with the Walrus API.

**Type:** `WalrusClient`

#### `suiClient`
The Sui client used for interacting with the Sui API.

**Type:** `SuiClient`

#### `walletAddr`
The active wallet address.

**Type:** `string`

#### `signAndExecuteTransaction`
The function used to sign and execute transactions. Get by calling `useSignAndExecuteTransaction` hook in `@mysten/dapp-kit`.

**Type:** `ISignAndExecuteTransaction`

```typescript
// Example: Getting signAndExecuteTransaction from dapp-kit
const { mutateAsync: signAndExecuteTransaction } =
  useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true
        }
      })
  })
```

## Methods

### `executeSiteUpdateFlow(target, wsResource)`

Creates a deploy flow for deploying a Walrus Site.

**Returns:** [`IUpdateWalrusSiteFlow`](/reference/i-update-walrus-site-flow)

#### Parameters

##### `target`
The file manager containing assets to be deployed.

**Type:** [`IReadOnlyFileManager`](/reference/i-read-only-file-manager)

##### `wsResource`
The Walrus resources configuration.

**Type:** [`WSResources`](/reference/ws-resources)

#### Example usage

<Tabs>
  <TabItem label="Basic deployment">

```typescript
import { ZenFsFileManager } from '@cmdoss/file-manager';

const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();

const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResource);

// Execute deployment steps
await deployFlow.prepareResources();
await deployFlow.encodeResources();
await deployFlow.writeResources(57, false);
const { certifiedBlobs } = await deployFlow.certifyResources();
const { siteId } = await deployFlow.writeSite();
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
  routes: [
    ['/*', '/index.html']  // SPA routing
  ]
};

const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);
```

  </TabItem>
</Tabs>

## Properties

### `walrus`
The Walrus client instance.

**Type:** `WalrusClient`

### `suiClient`
The Sui client instance.

**Type:** `SuiClient`

### `walletAddr`
The active wallet address.

**Type:** `string`

### `signAndExecuteTransaction`
The transaction signing function.

**Type:** `ISignAndExecuteTransaction`

## Complete Example

<Tabs>
  <TabItem label="Setup">

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';
import { ZenFsFileManager } from '@cmdoss/file-manager';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { WalrusClient } from '@mysten/walrus';

// In a React component
const suiClient = useSuiClient();
const currentAccount = useCurrentAccount();
const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
  execute: async ({ bytes, signature }) =>
    await suiClient.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: {
        showRawEffects: true,
        showObjectChanges: true
      }
    })
});

const walrusClient = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space'
});

// Initialize SDK
const sdk = new WalrusSiteBuilderSdk(
  walrusClient,
  suiClient,
  currentAccount?.address ?? '',
  signAndExecuteTransaction
);
```

  </TabItem>
  <TabItem label="Deploy Flow">

```typescript
import { ZenFsFileManager } from '@cmdoss/file-manager';

// Initialize file manager
const fileManager = new ZenFsFileManager('/workspace');
await fileManager.initialize();

// Add files to the workspace
await fileManager.writeFile('/index.html', new TextEncoder().encode('<h1>Hello World</h1>'));
await fileManager.writeFile('/style.css', new TextEncoder().encode('body { color: blue; }'));

// Configure site
const wsResources: WSResources = {
  site_name: 'My Site',
  metadata: {
    description: 'A decentralized website',
    creator: 'Developer'
  },
  routes: [
    ['/*', '/index.html']  // SPA fallback route
  ]
};

// Create and execute deploy flow
const deployFlow = sdk.executeSiteUpdateFlow(fileManager, wsResources);

// Step 1: Prepare resources
await deployFlow.prepareResources();

// Step 2: Encode resources into blobs
await deployFlow.encodeResources();

// Step 3: Write resources to Walrus (epochs, permanent)
await deployFlow.writeResources(57, false);

// Step 4: Certify resources on-chain
const { certifiedBlobs } = await deployFlow.certifyResources();
console.log('Certified blobs:', certifiedBlobs.length);

// Step 5: Write site to blockchain
const { siteId } = await deployFlow.writeSite();
console.log('Site deployed with ID:', siteId);

// Get transaction history
const transactions = deployFlow.getTransactions();
console.log('Transactions:', transactions);
```

  </TabItem>
</Tabs>

## Related Types

- [`WSResources`](/reference/ws-resources) - Site resources and metadata
- [`SiteData`](/reference/site-data) - Complete site data structure
- [`SiteDataDiff`](/reference/site-data-diff) - Site data differences for updates
- [`IReadOnlyFileManager`](/reference/i-read-only-file-manager) - File manager interface for reading site files
- [`IUpdateWalrusSiteFlow`](/reference/i-update-walrus-site-flow) - Deploy flow interface
- [`ITransaction`](/reference/i-transaction) - Transaction information
- [`ICertifiedBlob`](/reference/i-certified-blob) - Certified blob information
