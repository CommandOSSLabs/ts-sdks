import { isSupportedNetwork } from '@cmdoss/site-builder'
import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'
import { createContext, type ReactNode, useMemo } from 'react'

function createWalrusClient(suiClient: SuiClient): WalrusClient | null {
  if (typeof window === 'undefined') return null // SSR check
  if (!suiClient) return null
  const network = suiClient.network
  if (!isSupportedNetwork(network))
    throw new Error(`Unsupported network: ${network}`)
  console.log('Creating WalrusClient for network:', network)

  return new WalrusClient({
    network,
    suiClient,
    uploadRelay: {
      timeout: 600000,
      host: `https://upload-relay.${network}.walrus.space`,
      sendTip: {
        max: 100000000
      }
    }
  })
}

export const WalrusClientContext = createContext<WalrusClient | null>(null)
export const WalrusClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const suiClient = useSuiClient()
  const walrusClient = useMemo(() => createWalrusClient(suiClient), [suiClient])

  return (
    <WalrusClientContext.Provider value={walrusClient}>
      {children}
    </WalrusClientContext.Provider>
  )
}
WalrusClientProvider.displayName = 'WalrusClientProvider'
