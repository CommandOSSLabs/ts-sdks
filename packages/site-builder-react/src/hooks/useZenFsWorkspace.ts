import { ZenFsFileManager } from '@cmdoss/file-manager'
import type { IFileManager } from '@cmdoss/site-builder'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function useZenFsWorkspace(
  workspaceDir = '/workspace',
  mountDir = '/workspace',
  queryClient: QueryClient
) {
  const [loading, setLoading] = useState(true)
  const [fileManager, setFileManager] = useState<IFileManager | null>(null)

  // Initialize ZenFS and load existing files
  useEffect(() => {
    setLoading(true)
    console.log('Initializing ZenFS FileManager at', workspaceDir)
    const fm: IFileManager = new ZenFsFileManager(workspaceDir, mountDir)
    setFileManager(fm)

    fm.initialize()
      .catch(() => {
        // Ignore errors during initialization
      })
      .then(async () => {
        // Invalidate queries to refresh file listings
        await queryClient.invalidateQueries({
          queryKey: ['zenfs', workspaceDir]
        })
      })
      .finally(() => setLoading(false))
    // Cleanup on unmount
  }, [workspaceDir, mountDir, queryClient])

  return {
    loading,
    fileManager
  }
}
