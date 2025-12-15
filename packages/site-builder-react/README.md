# @cmdoss/site-builder-react

React components for building and publishing sites to Walrus network with SuiNS domain integration.

## Installation

```bash
pnpm add @cmdoss/site-builder-react
```

## Features

- 🎨 **Vanilla Extract Styling** - Type-safe, zero-runtime CSS with light/dark theme support
- 🔧 **Nanostores State Management** - Lightweight and performant state management
- � **TypeScript First** - Full type safety out of the box
- 🌐 **Walrus Sites** - Deploy to decentralized Walrus network
- 🔗 **SuiNS Integration** - Associate your sites with .sui domains

## Quick Start

### Use PublishButton Component

The `PublishButton` component handles the entire publishing workflow including UI, state management, and wallet interactions:

```tsx
import { PublishButton } from '@cmdoss/site-builder-react'
import type { IReadOnlyFileManager } from '@cmdoss/site-builder'
import { SuiClient } from '@mysten/sui/client'
import { QueryClient } from '@tanstack/react-query'

function MyApp() {
  const suiClient = new SuiClient({ url: '...' })
  const queryClient = new QueryClient()

  return (
    <PublishButton
      siteId={existingSiteId} // Optional: pass existing site ID to update
      clients={{ suiClient, queryClient }}
      currentAccount={walletAccount}
      signAndExecuteTransaction={signAndExecuteTransaction}
      portalDomain="walrus.site"
      portalHttps={true}
      onPrepareAssets={async () => {
        // Return IReadOnlyFileManager with files to publish
        return fileManager
      }}
      onUpdateSiteMetadata={async (site) => {
        // Optional: Save site metadata to your backend
      }}
      onAssociatedDomain={async (nftId, siteId) => {
        // Optional: Handle domain association callback
      }}
      onError={(msg) => console.error(msg)}
    />
  )
}
```

## Components

### PublishButton

Main component that includes PublishMenu, PublishModal, and SuiNsModal. It wraps everything with a ThemeProvider automatically.

```tsx
import { PublishButton } from '@cmdoss/site-builder-react'

<PublishButton
  siteId={siteId}
  clients={{ suiClient, queryClient }}
  currentAccount={currentAccount}
  signAndExecuteTransaction={signAndExecuteTransaction}
  portalDomain="walrus.site"
  portalHttps={true}
  onPrepareAssets={handlePrepareAssets}
  onUpdateSiteMetadata={handleUpdateMetadata}
  onAssociatedDomain={handleAssociate}
  onError={handleError}
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
<PublishMenu
  siteId={siteId}
  network="mainnet"
  portalDomain="walrus.site"
  portalHttps={true}
  onPublishClick={handlePublishClick}
  onDomainClick={handleDomainClick}
>
  <button>Publish</button>
</PublishMenu>

<PublishModal
  siteId={siteId}
  clients={{ suiClient, queryClient }}
  onDeploy={handleDeploy}
  onSaveMetadata={handleSave}
/>

<SuiNsModal
  siteId={siteId}
  currentAccount={currentAccount}
  portalDomain="walrus.site"
  portalHttps={true}
  clients={{ suiClient, queryClient }}
  onAssociateDomain={handleAssociate}
/>
```

## Hooks

### useSitePublishing

Main hook for site publishing logic:

```tsx
import { useSitePublishing } from '@cmdoss/site-builder-react'

const publishing = useSitePublishing({
  siteId: string | undefined,
  clients: { suiClient: SuiClient, queryClient: QueryClient },
  currentAccount: WalletAccount | null,
  signAndExecuteTransaction: ISignAndExecuteTransaction,
  portalDomain?: string,
  portalHttps?: boolean,
  onPrepareAssets: () => Promise<IReadOnlyFileManager>,
  onUpdateSiteMetadata?: (site: SiteMetadataUpdate) => Promise<SiteMetadata | undefined>,
  onAssociatedDomain?: (nftId: string, siteId: string) => Promise<void>,
  onError?: (msg: string) => void
})

// Access state
publishing.state.isDeployed
publishing.state.walrusSiteUrl
publishing.state.isWorking
publishing.state.deployStatus
publishing.state.deployStatusText
publishing.state.deployStepIndex
publishing.state.nsDomains
publishing.state.isLoadingNsDomains
publishing.state.associatedDomains
publishing.state.isEditingSiteMetadata
publishing.state.isSavingSiteMetadata
// ... more state

// Access actions
publishing.actions.handleRunDeploymentStep()
publishing.actions.handleSaveSiteMetadata()
publishing.actions.handleAssociateDomain(nftId, siteId)
publishing.actions.handleOpenPublishingDialog()
publishing.actions.handleOpenDomainDialog()
publishing.actions.handleCancelEditingSiteMetadata()
```

## Stores

Direct access to nanostores:

```tsx
import {
  sitePublishingStore,
  siteMetadataStore,
  isDomainDialogOpen,
  isAssigningDomain
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
import { Button, Input, Label, Textarea, Banner, Stepper } from '@cmdoss/site-builder-react'

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

The package uses vanilla-extract with a ThemeProvider. The `PublishButton` component automatically wraps children with the ThemeProvider. You can customize themes by overriding CSS variables:

```css
:root, .light {
  --colors-background: #ffffff;
  --colors-foreground: #09090b;
  --colors-muted: #f4f4f5;
  --colors-mutedForeground: #71717a;
  --colors-border: #e4e4e7;
  --colors-primary: #18181b;
  --colors-primaryForeground: #fafafa;
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
  UseSitePublishingParams,
  SiteMetadata,
  SiteMetadataUpdate
} from '@cmdoss/site-builder-react'
```

## License

MIT
