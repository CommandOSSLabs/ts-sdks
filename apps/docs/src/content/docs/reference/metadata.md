---
title: Metadata interface
description: Reference docs for the site metadata interface
badge:
    text: Interface
    variant: note
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`Metadata`](/reference/metadata) interface defines the metadata attributes used for site display and social sharing. It contains information about the site such as description, creator, and social links that are stored on-chain and used for site presentation.

## Definition

```typescript
interface Metadata {
  link?: string
  image_url?: string
  description?: string
  project_url?: string
  creator?: string
}
```

## Properties

### `link`
The main link URL for the site.

**Type:** `string` (optional)

**Default:** `undefined`

This is typically the URL where the site is hosted or the primary landing page URL.

<Tabs>
  <TabItem label="Walrus site URL">

```typescript
const metadata: Metadata = {
  link: 'https://mysite.walrus.xyz',
  description: 'My decentralized website'
};
```

  </TabItem>
  <TabItem label="Custom domain">

```typescript
const metadata: Metadata = {
  link: 'https://mysite.com',
  description: 'My custom domain site'
};
```

  </TabItem>
</Tabs>

### `image_url`
The URL of the site's main image or Open Graph image.

**Type:** `string` (optional)

**Default:** `undefined`

This image is used for social sharing, site previews, and display purposes. Should be a publicly accessible URL.

<Tabs>
  <TabItem label="Social sharing image">

```typescript
const metadata: Metadata = {
  link: 'https://mysite.walrus.xyz',
  image_url: 'https://mysite.walrus.xyz/og-image.png',
  description: 'My decentralized website'
};
```

  </TabItem>
  <TabItem label="External image URL">

```typescript
const metadata: Metadata = {
  image_url: 'https://example.com/site-preview.jpg',
  description: 'Site with external preview image'
};
```

  </TabItem>
</Tabs>

### `description`
A brief description of the site.

**Type:** `string` (optional)

**Default:** `undefined`

This description is used for site previews, search results, and social sharing. Should be concise and descriptive.

<Tabs>
  <TabItem label="Simple description">

```typescript
const metadata: Metadata = {
  description: 'A decentralized website built with Site Builder SDK'
};
```

  </TabItem>
  <TabItem label="Detailed description">

```typescript
const metadata: Metadata = {
  description: 'A modern decentralized website showcasing the power of Walrus and Sui blockchain technology. Built with Site Builder SDK for seamless deployment and management.'
};
```

  </TabItem>
</Tabs>

### `project_url`
The URL of the project repository or homepage.

**Type:** `string` (optional)

**Default:** `undefined`

This is typically a link to the GitHub repository, project documentation, or related project information.

<Tabs>
  <TabItem label="GitHub repository">

```typescript
const metadata: Metadata = {
  project_url: 'https://github.com/user/my-walrus-site',
  description: 'Open source decentralized website'
};
```

  </TabItem>
  <TabItem label="Project documentation">

```typescript
const metadata: Metadata = {
  project_url: 'https://docs.mysite.com',
  description: 'Documentation for my decentralized project'
};
```

  </TabItem>
</Tabs>

### `creator`
The name or identifier of the site creator.

**Type:** `string` (optional)

**Default:** `undefined`

This identifies who created or maintains the site. Can be a personal name, organization name, or pseudonym.

<Tabs>
  <TabItem label="Personal name">

```typescript
const metadata: Metadata = {
  creator: 'John Doe',
  description: 'Personal portfolio website'
};
```

  </TabItem>
  <TabItem label="Organization">

```typescript
const metadata: Metadata = {
  creator: 'CommandOSS Labs',
  description: 'Official documentation site'
};
```

  </TabItem>
  <TabItem label="Pseudonym">

```typescript
const metadata: Metadata = {
  creator: 'CryptoDev123',
  description: 'Developer blog and tutorials'
};
```

  </TabItem>
</Tabs>

## Usage Examples

### Basic Metadata

```typescript
const metadata: Metadata = {
  description: 'My first decentralized website'
};
```

### Complete Metadata

<Tabs>
  <TabItem label="Personal site">

```typescript
const metadata: Metadata = {
  link: 'https://johndoe.walrus.xyz',
  image_url: 'https://johndoe.walrus.xyz/profile.jpg',
  description: 'Personal portfolio and blog of John Doe, blockchain developer',
  project_url: 'https://github.com/johndoe/portfolio',
  creator: 'John Doe'
};
```

  </TabItem>
  <TabItem label="Project site">

```typescript
const metadata: Metadata = {
  link: 'https://myproject.walrus.xyz',
  image_url: 'https://myproject.walrus.xyz/logo.png',
  description: 'Decentralized application for managing digital assets on Sui blockchain',
  project_url: 'https://github.com/myorg/myproject',
  creator: 'MyOrg Team'
};
```

  </TabItem>
</Tabs>

### Using Metadata in Site Configuration

```typescript
import { WSResources } from '@cmdoss/walrus-site-builder';

const wsResources: WSResources = {
  site_name: 'My Decentralized Site',
  metadata: {
    link: 'https://mysite.walrus.xyz',
    image_url: 'https://mysite.walrus.xyz/preview.png',
    description: 'A modern decentralized website built with Site Builder SDK',
    project_url: 'https://github.com/user/mysite',
    creator: 'Developer Name'
  },
  routes: {
    '/': '/index.html'
  }
};
```

### Dynamic Metadata Generation

```typescript
function createMetadata(siteInfo: {
  name: string;
  description: string;
  creator: string;
  githubRepo?: string;
  customDomain?: string;
}): Metadata {
  const metadata: Metadata = {
    description: siteInfo.description,
    creator: siteInfo.creator
  };
  
  if (siteInfo.customDomain) {
    metadata.link = `https://${siteInfo.customDomain}`;
    metadata.image_url = `https://${siteInfo.customDomain}/og-image.png`;
  } else {
    metadata.link = `https://${siteInfo.name.toLowerCase().replace(/\s+/g, '')}.walrus.xyz`;
  }
  
  if (siteInfo.githubRepo) {
    metadata.project_url = `https://github.com/${siteInfo.githubRepo}`;
  }
  
  return metadata;
}

// Usage
const siteMetadata = createMetadata({
  name: 'My Awesome Site',
  description: 'An awesome decentralized website',
  creator: 'Awesome Developer',
  githubRepo: 'awesome-dev/awesome-site',
  customDomain: 'awesome-site.com'
});
```

## Metadata in Deployment

Metadata is processed during the deployment flow:

1. **Configuration**: Metadata is defined in WSResources
2. **Processing**: Metadata is included in SiteData
3. **Transaction**: Metadata is stored on-chain via blockchain transactions
4. **Display**: Metadata is used for site presentation and social sharing

```typescript
// Metadata flows through the deployment process
const wsResources: WSResources = {
  metadata: {
    description: 'My site',
    creator: 'Developer'
  }
};

const siteData = await sdk.getSiteData(assets, wsResources);
const deployFlow = sdk.deployFlow(assets, wsResources);

// Metadata is automatically included in the deployment
await deployFlow.updateSite();
```

## Best Practices

### Description Guidelines
- Keep descriptions concise but informative
- Include relevant keywords for discoverability
- Aim for 120-160 characters for optimal display

### Image Guidelines
- Use high-quality images (recommended: 1200x630px)
- Ensure images are publicly accessible
- Consider using WebP format for better compression

### Link Guidelines
- Use HTTPS URLs
- Ensure URLs are accessible and stable
- Consider using custom domains for professional sites

## Related Types

- [`WSResources`](/reference/ws-resources) - Site configuration that includes metadata
- [`SiteData`](/reference/site-data) - Complete site data that includes metadata
- [`Routes`](/reference/routes) - Route configuration for the site
