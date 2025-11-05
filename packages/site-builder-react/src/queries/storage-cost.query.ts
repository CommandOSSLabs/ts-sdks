import { useQuery } from '@tanstack/react-query'
import { useWalrusClient } from '~/hooks'
import { queryKeys } from './keys'

export function useStorageCostQuery(fileSize: number, epochs: number) {
  const walrusClient = useWalrusClient()
  return useQuery({
    queryKey: queryKeys.storageCost(fileSize, epochs),
    queryFn: async () => {
      if (!walrusClient) throw new Error('Walrus client not available')
      const storageCost = await walrusClient.storageCost(fileSize, epochs)
      return {
        storageCost: storageCost.storageCost.toString(),
        writeCost: storageCost.writeCost.toString(),
        totalCost: storageCost.totalCost.toString()
      }
    },
    enabled: !!walrusClient && fileSize > 0 && epochs > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
