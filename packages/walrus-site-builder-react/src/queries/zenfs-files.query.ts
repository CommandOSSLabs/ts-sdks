import type { ZenFsFileManager } from '@cmdoss/file-manager'
import {
  getSHA256Hash,
  type IAsset,
  sha256ToU256
} from '@cmdoss/walrus-site-builder'
import { type QueryClient, useQuery } from '@tanstack/react-query'

export function useZenfsFilesQuery(
  fm: ZenFsFileManager | null,
  clients: {
    queryClient: QueryClient
  }
) {
  const { queryClient } = clients
  return useQuery(
    {
      queryKey: ['zenfs-files', fm?.workspaceDir],
      queryFn: async () => {
        if (!fm) return []
        const files = await fm.listFiles()
        const assets: IAsset[] = []
        for (const path of files) {
          const content = await fm?.readFile(path)
          if (!content) continue
          const hash = await getSHA256Hash(content)
          const hashU256 = sha256ToU256(hash)
          assets.push({ path, content, hashU256 })
        }
        return assets
      },
      enabled: !!fm,
      staleTime: 5 * 60 * 1000 // 5 minutes
    },
    queryClient
  )
}
