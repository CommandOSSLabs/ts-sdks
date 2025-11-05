import { objectIdToWalrusSiteUrl } from '@cmdoss/site-builder'
import { useSuiClientContext } from '@mysten/dapp-kit'
import { useMemo } from 'react'

export function useDefaultWalrusSiteUrl(siteId: string | null | undefined) {
  const { network } = useSuiClientContext()
  const walrusSiteUrl = useMemo(() => {
    if (!siteId) return null
    if (network === 'mainnet')
      return objectIdToWalrusSiteUrl(siteId, 'wal.app', true)
    return objectIdToWalrusSiteUrl(siteId)
  }, [siteId, network])
  return walrusSiteUrl
}
