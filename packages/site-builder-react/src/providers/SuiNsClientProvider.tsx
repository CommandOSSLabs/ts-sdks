import { isSupportedNetwork } from '@cmdoss/site-builder'
import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { SuinsClient } from '@mysten/suins'
import { createContext, type ReactNode, useMemo } from 'react'

function createSuinsClient(client: SuiClient | null): SuinsClient | null {
  if (typeof window === 'undefined') return null // SSR check
  if (!client) return null
  const network = client.network
  if (!isSupportedNetwork(network))
    throw new Error(`Unsupported network: ${network}`)

  return new SuinsClient({ network, client })
}

export const SuiNsClientContext = createContext<SuinsClient | null>(null)
export const SuiNsClientProvider: React.FC<{
  children: ReactNode
  createClient?: (suiClient: SuiClient | null) => SuinsClient | null
}> = ({ children, createClient = createSuinsClient }) => {
  const suiClient = useSuiClient()
  const suinsClient = useMemo(
    () => createClient(suiClient),
    [suiClient, createClient]
  )

  return (
    <SuiNsClientContext.Provider value={suinsClient}>
      {children}
    </SuiNsClientContext.Provider>
  )
}
SuiNsClientProvider.displayName = 'SuiNsClientProvider'
