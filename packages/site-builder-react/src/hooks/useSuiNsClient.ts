import { isSupportedNetwork } from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { SuinsClient } from '@mysten/suins'
import { useMemo } from 'react'

export function useSuiNsClient(
  suiClient: SuiClient | null
): SuinsClient | null {
  return useMemo(() => {
    if (typeof window === 'undefined') return null // SSR check
    if (!suiClient) return null
    const network = suiClient?.network
    if (!isSupportedNetwork(network)) return null

    return new SuinsClient({ network, client: suiClient })
  }, [suiClient])
}
