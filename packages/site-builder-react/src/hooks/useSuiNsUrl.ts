import { useSuiClient } from '@mysten/dapp-kit'
import { useMemo } from 'react'
import { mainPackage } from '~/lib/constants'

export function useSuiNsUrl() {
  const { network } = useSuiClient()
  const suinsUrl = useMemo(
    () => mainPackage[network as keyof typeof mainPackage]?.suinsUrl,
    [network]
  )
  return suinsUrl
}
