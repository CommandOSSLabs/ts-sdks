import { useQuery } from '@tanstack/react-query'
import { walrusClient } from '../lib/walrus'
import { queryKeys } from './queryKeys'

// Hook for getting current epoch
export function useCurrentEpoch() {
  return useQuery({
    queryKey: queryKeys.currentEpoch(),
    queryFn: async () => {
      const systemState = await walrusClient.systemState()
      return systemState.committee.epoch
    },
    staleTime: 30 * 1000 // 30 seconds
  })
}
