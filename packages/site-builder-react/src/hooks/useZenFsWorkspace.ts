import { ZenFsFileManager } from '@cmdoss/file-manager'
import type { IFileManager } from '@cmdoss/site-builder'
import { useEffect, useState } from 'react'

export function useZenFsWorkspace(workspaceDir = '/workspace') {
  const [loading, setLoading] = useState(true)
  const [fileManager, setFileManager] = useState<IFileManager | null>(null)

  // Initialize ZenFS and load existing files
  useEffect(() => {
    setLoading(true)
    const fm: IFileManager = new ZenFsFileManager(workspaceDir)
    setFileManager(fm)

    fm.initialize()
      .then(() => {
        setLoading(false)
      })
      .catch(error => {
        console.error('Error initializing ZenFS FileManager:', error)
        setLoading(false)
      })
    // Cleanup on unmount
  }, [workspaceDir])

  return {
    loading,
    fileManager
  }
}
