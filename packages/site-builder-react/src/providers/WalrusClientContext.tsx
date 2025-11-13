import {
  isSupportedNetwork,
  type SuiClientWithWalrus
} from '@cmdoss/site-builder'
import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { walrus } from '@mysten/walrus'
import { createContext, type ReactNode, useMemo } from 'react'

function createWalrusClient(
  suiClient: SuiJsonRpcClient | null
): SuiClientWithWalrus | null {
  if (typeof window === 'undefined') return null // SSR check
  if (!suiClient) return null
  const network = suiClient.network
  if (!isSupportedNetwork(network))
    throw new Error(`Unsupported network: ${network}`)
  console.log('Creating WalrusClient for network:', network)

  return suiClient.$extend(
    walrus({
      uploadRelay: {
        timeout: 600000,
        host: `https://upload-relay.${network}.walrus.space`,
        sendTip: { max: 100000000 }
      }
    })
  )
}

export const WalrusClientContext = createContext<SuiClientWithWalrus | null>(
  null
)
export const WalrusClientProvider: React.FC<{
  children: ReactNode
  createClient?: (
    suiClient: SuiJsonRpcClient | null
  ) => SuiClientWithWalrus | null
}> = ({ children, createClient = createWalrusClient }) => {
  const suiClient = useSuiClient()
  const walrusClient = useMemo(
    () => createClient(suiClient),
    [suiClient, createClient]
  )
  return (
    <WalrusClientContext.Provider value={walrusClient}>
      {children}
    </WalrusClientContext.Provider>
  )
}
WalrusClientProvider.displayName = 'WalrusClientProvider'
