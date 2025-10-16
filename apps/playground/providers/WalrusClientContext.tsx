'use client'

import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'
import { createContext, type ReactNode, useMemo } from 'react'
import { useNetworkConfig } from '@/configs/networkConfig'

function createWalrusClient(
  suiClient: SuiClient,
  network: 'mainnet' | 'testnet'
): WalrusClient {
  if (typeof window === 'undefined')
    throw new Error('WalrusClient can only be used in the browser.')

  return new WalrusClient({
    network,
    suiClient,
    uploadRelay: {
      timeout: 600000,
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        max: 1000
      }
    },
    wasmUrl:
      'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm'
  })
}

export const WalrusClientContext = createContext<WalrusClient | null>(null)
export const WalrusClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const suiClient = useSuiClient()
  const network = useNetworkConfig()
  const walrusClient = useMemo(
    () => createWalrusClient(suiClient, network.name),
    [suiClient, network]
  )

  return (
    <WalrusClientContext.Provider value={walrusClient}>
      {children}
    </WalrusClientContext.Provider>
  )
}
