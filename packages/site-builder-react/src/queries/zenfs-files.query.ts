import type { IReadOnlyFileManager } from '@cmdoss/site-builder'
import { type QueryClient, useQuery } from '@tanstack/react-query'

interface IAsset {
  path: string
  content: Uint8Array
}

export function useZenfsFilesQuery(
  fm: IReadOnlyFileManager | null,
  clients: {
    queryClient: QueryClient
  }
) {
  const { queryClient } = clients
  return useQuery(
    {
      queryKey: ['zenfs-files', fm?.workspaceDir],
      queryFn: async () => {
        const files = (await fm?.listFiles()) ?? []
        const assets: IAsset[] = []
        for (const path of files) {
          const content = await fm?.readFile(path)
          if (content) assets.push({ path, content })
        }
        return assets
      },
      enabled: !!fm,
      staleTime: 5 * 60 * 1000 // 5 minutes
    },
    queryClient
  )
}
