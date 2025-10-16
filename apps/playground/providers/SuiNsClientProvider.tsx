'use client'

import { useSuiClient } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import { SuinsClient } from '@mysten/suins'
import { createContext, type ReactNode, useMemo } from 'react'
import { useNetworkConfig } from '@/configs/networkConfig'

function createSuinsClient(
  client: SuiClient,
  network: 'mainnet' | 'testnet'
): SuinsClient | null {
  if (typeof window === 'undefined') return null

  return new SuinsClient({ network, client })
}

export const SuiNsClientContext = createContext<SuinsClient | null>(null)
export const SuiNsClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const suiClient = useSuiClient()
  const network = useNetworkConfig()
  const suinsClient = useMemo(
    () => createSuinsClient(suiClient, network.name),
    [suiClient, network]
  )

  return <SuiNsClientContext value={suinsClient}>{children}</SuiNsClientContext>
}
