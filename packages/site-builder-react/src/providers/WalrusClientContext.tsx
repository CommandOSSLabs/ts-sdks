import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'
import { createContext, type ReactNode, useMemo } from 'react'

function createWalrusClient(
  suiClient: SuiClient,
  network: string
): WalrusClient | null {
  if (typeof window === 'undefined') return null // SSR check
  if (network !== 'mainnet' && network !== 'testnet')
    throw new Error(`Unsupported network: ${network}`)

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
  const { network } = useSuiClientContext()
  const walrusClient = useMemo(
    () => createWalrusClient(suiClient, network),
    [suiClient, network]
  )

  return (
    <WalrusClientContext value={walrusClient}>{children}</WalrusClientContext>
  )
}
