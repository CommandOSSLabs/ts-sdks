'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { useWalrusClient } from './useWalrusClient'

// Hook for getting current epoch
export function useCurrentEpoch() {
  const walrusClient = useWalrusClient()

  return useQuery({
    queryKey: queryKeys.currentEpoch(),
    queryFn: async () => {
      const systemState = await walrusClient.systemState()
      return systemState.committee.epoch
    },
    staleTime: 30 * 1000 // 30 seconds
  })
}
