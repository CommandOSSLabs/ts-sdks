import { useQuery } from '@tanstack/react-query'
import { useWalrusClient } from '@/hooks/useWalrusClient'
import { queryKeys } from './queryKeys'

// Hook for getting current epoch
export function useCurrentEpoch() {
  const walrusClient = useWalrusClient()

  return useQuery({
    queryKey: queryKeys.currentEpoch(),
    queryFn: async () => {
      if (!walrusClient) throw new Error('WalrusClient not initialized')
      const systemState = await walrusClient.systemState()
      return systemState?.committee.epoch
    },
    enabled: !!walrusClient,
    staleTime: 30 * 1000 // 30 seconds
  })
}
