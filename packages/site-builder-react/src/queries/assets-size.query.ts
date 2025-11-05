import type { IReadOnlyFileManager } from '@cmdoss/site-builder'
import { useQuery } from '@tanstack/react-query'
import { useWalrusClient } from '~/hooks'
import { queryKeys } from './keys'

export function useAssetsSizeQuery(
  onPrepareAssets: () => Promise<IReadOnlyFileManager>
) {
  const walrusClient = useWalrusClient()
  return useQuery({
    queryKey: queryKeys.assetsSize(onPrepareAssets),
    queryFn: async () => {
      if (!walrusClient) throw new Error('Walrus client not available')
      // calculate all file size in the workspace
      const fm = await onPrepareAssets()
      let fileSize = 0
      const files = await fm.listFiles()
      for (const file of files) {
        const content = await fm.readFile(file)
        fileSize += content.byteLength
      }
      return fileSize
    },
    enabled: !!onPrepareAssets,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
