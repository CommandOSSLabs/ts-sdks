import { useQuery } from '@tanstack/react-query'
import { walrusClient } from '../lib/walrus'
import { queryKeys } from './queryKeys'

// Hook for getting storage cost
export function useStorageCost(fileSize: number, epochs: number) {
  return useQuery({
    queryKey: queryKeys.storageCost(fileSize, epochs),
    queryFn: async () => {
      const storageCost = await walrusClient.storageCost(fileSize, epochs)
      return {
        storageCost: storageCost.storageCost.toString(),
        writeCost: storageCost.writeCost.toString(),
        totalCost: storageCost.totalCost.toString()
      }
    },
    enabled: fileSize > 0 && epochs > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
