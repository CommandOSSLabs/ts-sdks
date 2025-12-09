import { objectIdToWalrusSiteUrl } from '@cmdoss/site-builder'
import { useMemo } from 'react'

export function useDefaultWalrusSiteUrl(
  siteId: string | null | undefined,
  network: 'mainnet' | 'testnet' = 'testnet'
): string | null {
  const walrusSiteUrl = useMemo(() => {
    if (!siteId) return null
    if (network === 'mainnet')
      return objectIdToWalrusSiteUrl(siteId, 'wal.app', true)
    return objectIdToWalrusSiteUrl(siteId)
  }, [siteId, network])
  return walrusSiteUrl
}
