import type { WalrusClient } from '@mysten/walrus'
import { type QueryClient, useQuery } from '@tanstack/react-query'
import { queryKeys } from './keys'

export function useStorageCostQuery(
  fileSize: number | null,
  epochs: number,
  clients: {
    queryClient: QueryClient
    walrusClient: WalrusClient
  }
) {
  const { walrusClient, queryClient } = clients
  return useQuery(
    {
      queryKey: queryKeys.storageCost(fileSize, epochs),
      queryFn: async () => {
        if (!walrusClient) throw new Error('Walrus client not available')
        if (fileSize === null) throw new Error('Invalid file size')
        const storageCost = await walrusClient.storageCost(fileSize, epochs)
        return {
          storageCost: storageCost.storageCost.toString(),
          writeCost: storageCost.writeCost.toString(),
          totalCost: storageCost.totalCost.toString()
        }
      },
      enabled:
        !!walrusClient && fileSize !== null && fileSize > 0 && epochs > 0,
      staleTime: 5 * 60 * 1000 // 5 minutes
    },
    queryClient
  )
}
