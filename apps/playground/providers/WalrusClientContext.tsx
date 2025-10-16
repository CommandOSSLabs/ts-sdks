'use client'

import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import type { WalrusClient } from '@mysten/walrus'
import { createContext, type ReactNode, useEffect, useState } from 'react'
import { useNetworkConfig } from '@/configs/networkConfig'

async function createWalrusClient(
  suiClient: SuiClient,
  network: 'mainnet' | 'testnet'
): Promise<WalrusClient> {
  if (typeof window === 'undefined')
    throw new Error('WalrusClient can only be used in the browser.')

  const { WalrusClient } = await import('@mysten/walrus')
  return new WalrusClient({
    network,
    suiClient,
    uploadRelay: {
      timeout: 600000,
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        max: 1000
      }
    }
  })
}

export const WalrusClientContext = createContext<WalrusClient | null>(null)
export const WalrusClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const suiClient = useSuiClient()
  const network = useNetworkConfig()
  const [walrusClient, setWalrusClient] = useState<WalrusClient | null>(null)
  useEffect(() => {
    createWalrusClient(suiClient, network.name).then(setWalrusClient)
  }, [suiClient, network])

  return (
    <WalrusClientContext.Provider value={walrusClient}>
      {children}
    </WalrusClientContext.Provider>
  )
}
