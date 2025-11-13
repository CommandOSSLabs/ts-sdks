import {
  isSupportedNetwork,
  type SuiClientWithWalrus
} from '@cmdoss/site-builder'
import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { createContext, type ReactNode, useEffect, useState } from 'react'

async function createWalrusClient(
  suiClient: SuiJsonRpcClient | null
): Promise<SuiClientWithWalrus | null> {
  if (typeof window === 'undefined') return null // SSR check
  if (!suiClient) return null

  // Dynamically import to avoid SSR issues
  const { walrus } = await import('@mysten/walrus')
  const network = suiClient.network
  if (!isSupportedNetwork(network))
    throw new Error(`Unsupported network: ${network}`)
  console.log('Creating WalrusClient for network:', network)

  return suiClient.$extend(
    walrus({
      wasmUrl:
        'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
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
  ) => Promise<SuiClientWithWalrus | null>
}> = ({ children, createClient = createWalrusClient }) => {
  const suiClient = useSuiClient()
  const [walrusClient, setWalrusClient] = useState<SuiClientWithWalrus | null>(
    null
  )
  useEffect(() => {
    if (!suiClient) return
    Promise.all([createClient(suiClient)]).then(([client]) =>
      setWalrusClient(client)
    )
  }, [suiClient, createClient])
  return (
    <WalrusClientContext.Provider value={walrusClient}>
      {children}
    </WalrusClientContext.Provider>
  )
}
WalrusClientProvider.displayName = 'WalrusClientProvider'
