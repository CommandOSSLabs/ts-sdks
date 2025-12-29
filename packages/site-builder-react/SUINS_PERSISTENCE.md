# SuiNS Domain Persistence Guide

This guide explains how to implement persistent storage for SuiNS domain associations in your application. The `@cmdoss/site-builder-react` package provides a flexible architecture that allows you to use any storage mechanism (localStorage, database, API, etc.) for persisting domain associations.

## Overview

The package uses `siteMetadataStore.suiNSUrl` to manage domain associations in memory. The store contains an array of objects with the following structure:

```typescript
Array<{ suins: string; nftId: string }>
```

Where:
- `suins`: The domain URL or domain name (e.g., `"mydomain"`)
- `nftId`: The SuiNS NFT object ID

## Implementation Flow

### 1. Load Data on Component Mount

When your application component mounts, load persisted domain associations from your storage (localStorage, database, etc.) and initialize the store:

```typescript
import { useEffect } from 'react'
import { siteMetadataStore } from '@cmdoss/site-builder-react'

function MyApp() {
  useEffect(() => {
    // Load from your storage (localStorage, database, API, etc.)
    const storedDomains = loadFromStorage() // Your storage implementation
    
    if (storedDomains.length > 0) {
      // Set to store
      siteMetadataStore.suiNSUrl.set(storedDomains)
      // Also set to original to prevent reset
      siteMetadataStore.originalSuiNSUrl.set(
        storedDomains.map(item => ({ ...item }))
      )
    }

    // Optional: Listen to store changes and sync to your storage
    const unsubscribe = siteMetadataStore.suiNSUrl.listen(value => {
      saveToStorage([...value]) // Your storage implementation
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // ... rest of your component
}
```

### 2. Implement `onAssociatedDomain` Callback

The `onAssociatedDomain` callback is called after a domain is successfully associated on-chain. In this callback, you should:

1. Update the store with the new domain association
2. Persist the updated data to your storage

```typescript
import { PublishButton, siteMetadataStore } from '@cmdoss/site-builder-react'

function MyComponent() {
  return (
    <PublishButton
      siteId={siteId}
      assets={assets}
      clients={clients}
      currentAccount={currentAccount}
      signAndExecuteTransaction={signAndExecuteTransaction}
      portalDomain="your-portal-domain.com"
      portalHttps={true}
      onAssociatedDomain={async (nftId, siteId, suiNSName) => {
        // 1. Get current domains from store
        const currentDomains = siteMetadataStore.suiNSUrl.get()
        
        // 2. Create domain entry
        // Note: suiNSName is the domain name (e.g., "mydomain")
        // You can convert it to URL using suinsDomainToWalrusSiteUrl if needed
        const domainEntry = { suins: suiNSName, nftId }
        
        // 3. Update store: replace existing entry or add new one
        const existingIndex = currentDomains.findIndex(d => d.nftId === nftId)
        const updatedDomains =
          existingIndex >= 0
            ? currentDomains.map((d, i) =>
                i === existingIndex ? domainEntry : d
              )
            : [...currentDomains, domainEntry]
        
        // 4. Update store
        siteMetadataStore.suiNSUrl.set(updatedDomains)
        
        // 5. Persist to your storage
        await saveToStorage([...updatedDomains]) // Your storage implementation
      }}
    />
  )
}
```

### 3. Handle Domain Removal

When clearing site data (e.g., when siteId is cleared), also clear domain associations:

```typescript
function handleClearSite() {
  // Clear site ID
  setSiteId('')
  
  // Clear domain associations from store
  siteMetadataStore.suiNSUrl.set([])
  
  // Clear from your storage
  clearFromStorage() // Your storage implementation
}
```

## Complete Example: localStorage Implementation

Here's a complete example using localStorage (similar to the playground app):

```typescript
import { useEffect } from 'react'
import { PublishButton, siteMetadataStore } from '@cmdoss/site-builder-react'
import { persistentAtom } from '@nanostores/persistent'

// Create persistent atom for localStorage
const $suiNSUrl = persistentAtom<Array<{ suins: string; nftId: string }>>(
  'PUBLISHED_SUINS_URL',
  [],
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
)

function MyApp() {
  // Load from localStorage on mount
  useEffect(() => {
    const storedSuiNSUrl = $suiNSUrl.get()
    
    if (storedSuiNSUrl.length > 0) {
      // Set to store and original
      siteMetadataStore.suiNSUrl.set(storedSuiNSUrl)
      siteMetadataStore.originalSuiNSUrl.set(
        storedSuiNSUrl.map(item => ({ ...item }))
      )
    }

    // Listen to store changes and sync to localStorage
    const unsubscribe = siteMetadataStore.suiNSUrl.listen(value => {
      $suiNSUrl.set([...value])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <PublishButton
      siteId={siteId}
      assets={assets}
      clients={clients}
      currentAccount={currentAccount}
      signAndExecuteTransaction={signAndExecuteTransaction}
      portalDomain="localhost:3003"
      onAssociatedDomain={async (nftId, _siteId, suiNSName) => {
        const currentDomains = siteMetadataStore.suiNSUrl.get()
        const domainEntry = { suins: suiNSName, nftId }

        // Update store
        const existingIndex = currentDomains.findIndex(d => d.nftId === nftId)
        const updatedDomains =
          existingIndex >= 0
            ? currentDomains.map((d, i) =>
                i === existingIndex ? domainEntry : d
              )
            : [...currentDomains, domainEntry]

        siteMetadataStore.suiNSUrl.set(updatedDomains)
        // Sync to localStorage
        $suiNSUrl.set([...updatedDomains])
      }}
    />
  )
}
```

## Complete Example: Database/API Implementation

Here's an example using a database or API:

```typescript
import { useEffect } from 'react'
import { PublishButton, siteMetadataStore } from '@cmdoss/site-builder-react'

async function loadDomainsFromDB(userId: string) {
  const response = await fetch(`/api/users/${userId}/domains`)
  return response.json()
}

async function saveDomainsToDB(userId: string, domains: Array<{ suins: string; nftId: string }>) {
  await fetch(`/api/users/${userId}/domains`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(domains)
  })
}

function MyApp() {
  const userId = getCurrentUserId() // Your user ID retrieval

  // Load from database on mount
  useEffect(() => {
    async function loadDomains() {
      const storedDomains = await loadDomainsFromDB(userId)
      
      if (storedDomains.length > 0) {
        siteMetadataStore.suiNSUrl.set(storedDomains)
        siteMetadataStore.originalSuiNSUrl.set(
          storedDomains.map(item => ({ ...item }))
        )
      }
    }
    
    loadDomains()
  }, [userId])

  return (
    <PublishButton
      siteId={siteId}
      assets={assets}
      clients={clients}
      currentAccount={currentAccount}
      signAndExecuteTransaction={signAndExecuteTransaction}
      portalDomain="your-portal.com"
      onAssociatedDomain={async (nftId, _siteId, suiNSName) => {
        const currentDomains = siteMetadataStore.suiNSUrl.get()
        const domainEntry = { suins: suiNSName, nftId }

        // Update store
        const existingIndex = currentDomains.findIndex(d => d.nftId === nftId)
        const updatedDomains =
          existingIndex >= 0
            ? currentDomains.map((d, i) =>
                i === existingIndex ? domainEntry : d
              )
            : [...currentDomains, domainEntry]

        siteMetadataStore.suiNSUrl.set(updatedDomains)
        
        // Persist to database
        await saveDomainsToDB(userId, updatedDomains)
      }}
    />
  )
}
```

## Key Points

1. **Package Independence**: The `@cmdoss/site-builder-react` package does not depend on any specific storage mechanism. It only manages in-memory state via `siteMetadataStore`.

2. **Store Management**: The package automatically updates `siteMetadataStore.suiNSUrl` when domains are associated. Your `onAssociatedDomain` callback should handle persistence.

3. **Data Flow**:
   - On mount: Load from storage → Set to store
   - On associate: Package updates store → Your callback persists to storage
   - On change: Listen to store changes → Sync to storage (optional)

4. **Original State**: Always set `originalSuiNSUrl` when loading data to prevent accidental resets when the store's `reset()` method is called.

5. **Domain URL Format**: The `suins` field can contain either:
   - Domain name: `"mydomain"`
   - Full URL: `"http://mydomain.localhost:3003"` or `"https://mydomain.wal.app"`
   
   Use `suinsDomainToWalrusSiteUrl()` from `@cmdoss/site-builder` to convert domain names to URLs if needed.

## Type Definitions

```typescript
type SuiNSDomainEntry = {
  suins: string  // Domain URL or name
  nftId: string  // SuiNS NFT object ID
}

type SuiNSDomainArray = Array<SuiNSDomainEntry>
```

## See Also

- [PublishButton Component](./README.md#publishbutton) - Main component documentation
- [siteMetadataStore](./src/stores/site-metadata.store.ts) - Store implementation
- [Playground Example](../../apps/playground/app/page.tsx) - Complete localStorage implementation



