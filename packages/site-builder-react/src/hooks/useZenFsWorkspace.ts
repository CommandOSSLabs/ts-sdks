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
      .then(() => setLoading(false))
      .catch(error => {
        console.error('Error initializing ZenFS FileManager:', error)
        setLoading(false)
      })
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['zenfs', workspaceDir]
        })
      })
    // Cleanup on unmount
  }, [workspaceDir, mountDir, queryClient])

  return {
    loading,
    fileManager
  }
}
