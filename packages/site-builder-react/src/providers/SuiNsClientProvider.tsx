import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { SuinsClient } from '@mysten/suins'
import { createContext, type ReactNode, useMemo } from 'react'

function createSuinsClient(
  client: SuiClient,
  network: string
): SuinsClient | null {
  if (typeof window === 'undefined') return null // SSR check
  if (network !== 'mainnet' && network !== 'testnet')
    throw new Error(`Unsupported network: ${network}`)

  return new SuinsClient({ network, client })
}

export const SuiNsClientContext = createContext<SuinsClient | null>(null)
export const SuiNsClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { network } = useSuiClientContext()
  const suiClient = useSuiClient()
  const suinsClient = useMemo(
    () => createSuinsClient(suiClient, network),
    [suiClient, network]
  )

  return <SuiNsClientContext value={suinsClient}>{children}</SuiNsClientContext>
}
