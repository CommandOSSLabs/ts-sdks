import {
  getSHA256Hash,
  type IAsset,
  sha256ToU256,
  ZenFsFileManager
} from '@cmdoss/site-builder'
import { useEffect, useMemo, useState } from 'react'

export function useZenFsWorkspace(workspaceDir = '/workspace') {
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<IAsset[]>([])
  const [fileManager, setFileManager] = useState<ZenFsFileManager | null>(null)
  const totalSize = useMemo(
    () => assets.reduce((sum, f) => sum + f.content.byteLength, 0),
    [assets]
  )

  // Initialize ZenFS and load existing files
  useEffect(() => {
    setLoading(true)
    const fm = new ZenFsFileManager(workspaceDir)
    setFileManager(fm)

    // Load existing files once the file manager is ready
    fm.ready.then(async () => {
      try {
        const assets: IAsset[] = []
        const files = await fm.listFiles()
        console.log('Existing files in workspace:', files)
        for (const filePath of files) {
          const content = await fm.readFile(filePath)
          const hash = await getSHA256Hash(content)
          const hashU256 = sha256ToU256(hash)
          assets.push({
            path: filePath,
            content,
            hash,
            hashU256
          })
        }
        setAssets(assets)
      } catch (error) {
        console.error('Error setting up ZenFS:', error)
      } finally {
        setLoading(false)
      }
    })

    // Watch for changes in the workspace directory
    fm.onFileChange(async changed => {
      try {
        setLoading(true)

        switch (changed.type) {
          case 'removed':
            setAssets(prev => prev.filter(f => f.path !== changed.path))
            break
          case 'updated': {
            const hash = await getSHA256Hash(changed.content)
            const hashU256 = sha256ToU256(hash)
            const newFile: IAsset = {
              path: changed.path,
              content: changed.content,
              hash,
              hashU256
            }
            setAssets(prev => {
              const existingIdx = prev.findIndex(f => f.path === changed.path)
              if (existingIdx >= 0) {
                const updated = [...prev]
                updated[existingIdx] = newFile
                return updated
              }
              return [...prev, newFile]
            })
            break
          }
        }
      } catch (error) {
        console.error('Error reading workspace directory:', error)
      } finally {
        setLoading(false)
      }
    })

    // Cleanup on unmount
    return () => fm.unmount()
  }, [workspaceDir])

  /**
   * Helper to clear all files in the ZenFS workspace
   */
  const clear = async () => {
    setLoading(true)
    try {
      await fileManager?.clear()
      setAssets([])
    } catch (error) {
      console.error('Error clearing workspace directory:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    assets,
    totalSize,
    clear,
    fileManager
  }
}
