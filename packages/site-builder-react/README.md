# @cmdoss/site-builder-react

React components for building and publishing sites to Walrus network with SuiNS domain integration.

## Installation

```bash
pnpm add @cmdoss/site-builder-react
```

## Features

- 🎨 **Vanilla Extract Styling** - Type-safe, zero-runtime CSS with light/dark theme support
- 🔧 **Nanostores State Management** - Lightweight and performant state management
- 🚀 **Radix UI Components** - Accessible, composable UI primitives
- 📦 **TypeScript First** - Full type safety out of the box
- 🌐 **Walrus Sites** - Deploy to decentralized Walrus network
- 🔗 **SuiNS Integration** - Associate your sites with .sui domains

## Quick Start

### 1. Setup Theme

Wrap your app with the theme class:

```tsx
import { lightTheme, darkTheme } from '@cmdoss/site-builder-react'

function App() {
  const isDark = // your dark mode state
  
  return (
    <div className={isDark ? darkTheme : lightTheme}>
      {/* Your app */}
    </div>
  )
}
```

### 2. Configure Network

```tsx
import { networkConfigStore } from '@cmdoss/site-builder-react'

// Set network (testnet or mainnet)
networkConfigStore.setNetwork('mainnet')
```

### 3. Use PublishButton Component

```tsx
import { PublishButton, useSitePublishing } from '@cmdoss/site-builder-react'
import { WalrusSiteBuilderSdk } from '@cmdoss/site-builder'

function MyApp() {
  const publishing = useSitePublishing({
    site: mySite, // Your site data
    nsDomains: myDomains, // SuiNS domains owned by user
    walrusSitePortalDomain: 'walrus.site',
    walrusSitePortalSsl: true,
    sdk: walrusSdk, // WalrusSiteBuilderSdk instance
    onBuildPackage: async () => {
      // Build your site and return package URL
      return { success: true, packageUrl: '...' }
    },
    onSaveSiteMetadata: async (params) => {
      // Save site metadata to your backend
    },
    onAssociateDomain: async (nftId, siteId) => {
      // Associate SuiNS domain with site
    }
  })

  return (
    <PublishButton
      site={publishing.state.site}
      walrusSiteUrl={publishing.state.walrusSiteUrl}
      nsDomains={publishing.state.nsDomains}
      isLoadingDomains={publishing.state.isLoadingNsDomains}
      onDeploy={publishing.actions.handleRunDeploymentStep}
      onSaveMetadata={publishing.actions.handleSaveSiteMetadata}
      onAssociateDomain={publishing.actions.handleAssociateDomain}
    />
  )
}
```

## Components

### PublishButton

Main component that includes PublishMenu, PublishModal, and SuiNsModal.

```tsx
<PublishButton
  site={site}
  walrusSiteUrl={walrusSiteUrl}
  nsDomains={nsDomains}
  onDeploy={handleDeploy}
  onSaveMetadata={handleSave}
  onAssociateDomain={handleAssociate}
>
  {/* Optional: custom trigger button */}
  <Button>My Custom Publish Button</Button>
</PublishButton>
```

### Individual Components

You can also use components separately:

```tsx
import { PublishMenu, PublishModal, SuiNsModal } from '@cmdoss/site-builder-react'

// Use individually
<PublishMenu site={site} walrusSiteUrl={url}>
  <button>Publish</button>
</PublishMenu>

<PublishModal onDeploy={handleDeploy} />

<SuiNsModal 
  site={site}
  nsDomains={domains}
  onAssociateDomain={handleAssociate}
/>
```

## Hooks

### useSitePublishing

Main hook for site publishing logic:

```tsx
const publishing = useSitePublishing({
  site: Site | null,
  nsDomains?: SuiNsDomain[],
  isLoadingNsDomains?: boolean,
  isErrorNsDomains?: boolean,
  isSavingSiteMetadata?: boolean,
  walrusSitePortalDomain: string,
  walrusSitePortalSsl?: boolean,
  onBuildPackage: () => Promise<BuildResult>,
  onSaveSiteMetadata?: (params) => Promise<void>,
  onAssociateDomain?: (nftId, siteId) => Promise<void>,
  sdk?: IWalrusSiteBuilderSdk
})

// Access state
publishing.state.isDeployed
publishing.state.walrusSiteUrl
publishing.state.isWorking
// ... more state

// Access actions
publishing.actions.handleRunDeploymentStep()
publishing.actions.handleSaveSiteMetadata()
publishing.actions.handleAssociateDomain(nftId, siteId)
// ... more actions
```

## Stores

Direct access to nanostores:

```tsx
import { 
  sitePublishingStore,
  siteMetadataStore,
  isDomainDialogOpen,
  networkConfigStore
} from '@cmdoss/site-builder-react'

// Read state
const isOpen = sitePublishingStore.isPublishDialogOpen.get()

// Update state
sitePublishingStore.isPublishDialogOpen.set(true)

// Subscribe to changes (in React)
import { useStore } from '@nanostores/react'
const isOpen = useStore(sitePublishingStore.isPublishDialogOpen)
```

## UI Components

Base UI components with vanilla-extract styling:

```tsx
import { Button, Input, Label, Textarea } from '@cmdoss/site-builder-react'

<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="gradient">Gradient</Button>

<Label htmlFor="name">Name</Label>
<Input id="name" placeholder="Enter name" />

<Textarea rows={4} placeholder="Description" />
```

### Button Variants

- `default` - Primary button style
- `outline` - Outlined button
- `ghost` - Transparent button
- `destructive` - Danger/delete button
- `gradient` - Gradient button (blue to cyan)

### Button Sizes

- `sm` - Small (2rem height)
- `default` - Default (2.5rem height)
- `lg` - Large (3rem height)
- `icon` - Square icon button (2.5rem)

## Theme Customization

The package uses vanilla-extract with CSS variables. You can customize the theme by overriding CSS variables:

```css
.light {
  --colors-background: #ffffff;
  --colors-foreground: #09090b;
  /* ... other variables */
}

.dark {
  --colors-background: #09090b;
  --colors-foreground: #fafafa;
  /* ... other variables */
}
```

## TypeScript Types

All components and hooks are fully typed:

```tsx
import type { 
  Site,
  SuiNsDomain,
  UseSitePublishingParams 
} from '@cmdoss/site-builder-react'
```

## License

MIT
