---
title: IAsset interface
description: Reference docs for the asset interface used in file processing
badge:
    text: Interface
    variant: tip
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`IAsset`](/reference/i-asset) interface represents a file asset with its content, path, and hash information. It's used throughout the Site Builder SDK for processing files before deployment to the Walrus network.

## Definition

```typescript
interface IAsset {
  path: string
  content: Uint8Array
  hash: Uint8Array
  hashU256: bigint
}
```

## Properties

### `path`
The file path relative to the site root.

**Type:** `string`

**Required:** Yes

The path should start with a leading slash (`/`) and represent the file's location within the site structure.

<Tabs>
  <TabItem label="Basic paths">

```typescript
const assets: IAsset[] = [
  {
    path: '/index.html',
    content: new TextEncoder().encode('<h1>Hello World</h1>'),
    hash: new Uint8Array(32),
    hashU256: 0n
  },
  {
    path: '/style.css',
    content: new TextEncoder().encode('body { color: blue; }'),
    hash: new Uint8Array(32),
    hashU256: 0n
  }
];
```

  </TabItem>
  <TabItem label="Nested paths">

```typescript
const assets: IAsset[] = [
  {
    path: '/assets/images/logo.png',
    content: pngFileContent,
    hash: new Uint8Array(32),
    hashU256: 0n
  },
  {
    path: '/src/components/Button.tsx',
    content: new TextEncoder().encode('export const Button = () => <button>Click me</button>'),
    hash: new Uint8Array(32),
    hashU256: 0n
  }
];
```

  </TabItem>
</Tabs>

### `content`
The file content as a Uint8Array.

**Type:** `Uint8Array`

**Required:** Yes

The content should be the raw bytes of the file. For text files, use `TextEncoder` to convert strings to Uint8Array.

<Tabs>
  <TabItem label="Text content">

```typescript
const textAsset: IAsset = {
  path: '/index.html',
  content: new TextEncoder().encode(`
    <!DOCTYPE html>
    <html>
      <head><title>My Site</title></head>
      <body><h1>Hello World</h1></body>
    </html>
  `),
  hash: new Uint8Array(32),
  hashU256: 0n
};
```

  </TabItem>
  <TabItem label="Binary content">

```typescript
// For binary files like images, you'd typically load them from a file input or fetch
const binaryAsset: IAsset = {
  path: '/image.png',
  content: pngFileBytes, // Uint8Array from file
  hash: new Uint8Array(32),
  hashU256: 0n
};
```

  </TabItem>
</Tabs>

### `hash`
SHA-256 hash of the file content.

**Type:** `Uint8Array`

**Required:** Yes

The hash should be a 32-byte Uint8Array representing the SHA-256 hash of the file content.

```typescript
import { createHash } from 'crypto';

function createAsset(content: Uint8Array, path: string): IAsset {
  const hash = createHash('sha256').update(content).digest();
  const hashU256 = BigInt('0x' + Buffer.from(hash).toString('hex'));
  
  return {
    path,
    content,
    hash,
    hashU256
  };
}
```

### `hashU256`
SHA-256 hash of the file content as U256 (little-endian).

**Type:** `bigint`

**Required:** Yes

This is the same hash as the `hash` property but represented as a bigint in little-endian format for blockchain compatibility.

```typescript
function createAsset(content: Uint8Array, path: string): IAsset {
  const hash = createHash('sha256').update(content).digest();
  
  // Convert to little-endian bigint
  let hashU256 = 0n;
  for (let i = 0; i < hash.length; i++) {
    hashU256 += BigInt(hash[i]) << (8n * BigInt(i));
  }
  
  return {
    path,
    content,
    hash: new Uint8Array(hash),
    hashU256
  };
}
```

## Usage Examples

### Creating Assets from Files

<Tabs>
  <TabItem label="From File API">

```typescript
async function createAssetFromFile(file: File, path: string): Promise<IAsset> {
  const content = new Uint8Array(await file.arrayBuffer());
  const hash = await crypto.subtle.digest('SHA-256', content);
  
  // Convert hash to bigint (little-endian)
  let hashU256 = 0n;
  for (let i = 0; i < 32; i++) {
    hashU256 += BigInt(new Uint8Array(hash)[i]) << (8n * BigInt(i));
  }
  
  return {
    path: path.startsWith('/') ? path : `/${path}`,
    content,
    hash: new Uint8Array(hash),
    hashU256
  };
}

// Usage
const fileInput = document.getElementById('file') as HTMLInputElement;
const file = fileInput.files?.[0];
if (file) {
  const asset = await createAssetFromFile(file, '/uploads/image.png');
}
```

  </TabItem>
  <TabItem label="From Text Content">

```typescript
function createTextAsset(content: string, path: string): IAsset {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(content);
  
  // Calculate SHA-256 hash
  const hash = crypto.subtle.digest('SHA-256', bytes);
  let hashU256 = 0n;
  for (let i = 0; i < 32; i++) {
    hashU256 += BigInt(new Uint8Array(hash)[i]) << (8n * BigInt(i));
  }
  
  return {
    path: path.startsWith('/') ? path : `/${path}`,
    content: bytes,
    hash: new Uint8Array(hash),
    hashU256
  };
}

const htmlAsset = createTextAsset(
  '<h1>Hello World</h1>',
  '/index.html'
);
```

  </TabItem>
</Tabs>

### Using Assets in Deploy Flow

```typescript
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder';

// Create assets
const assets: IAsset[] = [
  {
    path: '/index.html',
    content: new TextEncoder().encode('<h1>Welcome</h1>'),
    hash: new Uint8Array(32),
    hashU256: 0n
  },
  {
    path: '/style.css',
    content: new TextEncoder().encode('body { font-family: Arial; }'),
    hash: new Uint8Array(32),
    hashU256: 0n
  }
];

// Use in SDK
const sdk = new WalrusSiteBuilderSdk(/* ... */);
const deployFlow = sdk.deployFlow(assets, wsResources);

await deployFlow.prepareAssets();
await deployFlow.uploadAssets(57, false);
await deployFlow.certifyAssets();
await deployFlow.updateSite();
```

### Asset Processing and Validation

```typescript
function validateAsset(asset: IAsset): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate path
  if (!asset.path.startsWith('/')) {
    errors.push('Path must start with leading slash');
  }
  
  // Validate content
  if (asset.content.length === 0) {
    errors.push('Content cannot be empty');
  }
  
  // Validate hash length
  if (asset.hash.length !== 32) {
    errors.push('Hash must be 32 bytes (SHA-256)');
  }
  
  // Validate hashU256
  if (asset.hashU256 < 0n) {
    errors.push('hashU256 must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
const asset: IAsset = {
  path: '/test.html',
  content: new TextEncoder().encode('test'),
  hash: new Uint8Array(32),
  hashU256: 0n
};

const validation = validateAsset(asset);
if (!validation.valid) {
  console.error('Asset validation failed:', validation.errors);
}
```

## Asset Lifecycle

Assets go through several stages in the deployment process:

1. **Creation**: Assets are created from files or content
2. **Processing**: Assets are processed by ResourceManager to create Resources
3. **Upload**: Assets are uploaded to Walrus storage
4. **Certification**: Assets are certified on the blockchain
5. **Registration**: Assets are registered in the site's resource list

## Related Types

- [`Resource`](/reference/resource) - Processed asset with additional metadata
- [`SuiResource`](/reference/sui-resource) - On-chain representation of asset
- [`SiteData`](/reference/site-data) - Collection of processed assets
- [`WSResources`](/reference/ws-resources) - Site configuration that may affect asset processing
