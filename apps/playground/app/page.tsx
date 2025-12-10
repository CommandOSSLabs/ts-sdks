'use client'

import {
  type IReadOnlyFileManager,
  objectIdToWalrusSiteUrl
} from '@cmdoss/site-builder'
import {
  type SiteMetadata,
  type SiteMetadataUpdate,
  useZenFsWorkspace,
  useZenfsFilesQuery
} from '@cmdoss/site-builder-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Introduction } from '@/components/Introduction'
import { CardContent } from '@/components/ui/card'
import { useNetworkConfig } from '@/configs/networkConfig'
import { $siteId } from '@/stores/siteStore'
import '@cmdoss/site-builder-react/styles.css'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient
} from '@mysten/dapp-kit'
import { useStore } from '@nanostores/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import AssetsSection from '@/components/AssetsSection'
import PublishedSiteInfo from '@/components/PublishedSiteInfo'
import PublishSection from '@/components/PublishSection'
import { testFilesSet1, testFilesSet2 } from './files'

export default function Home() {
  const queryClient = useQueryClient()
  const suiClient = useSuiClient()
  const siteId = useStore($siteId)
  const networkConfig = useNetworkConfig()
  const [isAddingFiles, setIsAddingFiles] = useState(false)
  const [isClearingWorkspace, setIsClearingWorkspace] = useState(false)

  const { loading, fileManager: fm } = useZenFsWorkspace(
    '/sites/site-01',
    '/sites',
    queryClient
  )
  const { data: assets = [], refetch: refetchAssets } = useZenfsFilesQuery(fm, {
    queryClient
  })
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      execute: async ({ bytes, signature }) =>
        await suiClient.executeTransactionBlock({
          transactionBlock: bytes,
          signature,
          options: {
            showRawEffects: true,
            showEffects: true
          }
        })
    })

  // Site Builder handlers
  const handlePrepareAssetsForBuilder =
    useCallback(async (): Promise<IReadOnlyFileManager> => {
      if (!fm) throw new Error('FileManager not initialized')

      try {
        for (const [path, content] of Object.entries(testFilesSet1)) {
          console.log('Adding test file:', path)
          await fm.writeFile(path, new TextEncoder().encode(content))
        }
      } catch (error) {
        console.error('Failed to create test files:', error)
      }
      return fm
    }, [fm])

  const handleUpdateSiteMetadataForBuilder = useCallback(
    async (site: SiteMetadataUpdate): Promise<SiteMetadata> => {
      // Playground has no backend; return the provided site to satisfy types
      // but convert imageUrl to string if it's a File object
      const imageUrl =
        typeof site.imageUrl === 'string'
          ? site.imageUrl
          : typeof site.imageUrl === 'object'
            ? URL.createObjectURL(site.imageUrl)
            : ''

      if (site.id) {
        console.log('💾 Storing published site ID:', site.id)
        $siteId.set(site.id) // Store published site ID persistently
      }

      return { ...site, imageUrl }
    },
    []
  )

  const handleBuilderError = useCallback((msg: string) => {
    console.error(msg)
    toast.error(msg)
  }, [])

  const addTestFiles = useCallback(
    async (fileSet: Record<string, string>, setName: string) => {
      if (!fm) {
        toast.error('FileManager not initialized')
        return
      }
      setIsAddingFiles(true)
      try {
        for (const [path, content] of Object.entries(fileSet)) {
          console.log('Adding test file:', path)
          await fm.writeFile(path, new TextEncoder().encode(content))
        }
        await refetchAssets()
        toast.success(`${setName} added`)
      } catch (error) {
        console.error('Failed to create test files:', error)
      } finally {
        setIsAddingFiles(false)
      }
    },
    [fm, refetchAssets]
  )

  const addTestFilesSet1 = useCallback(
    () => addTestFiles(testFilesSet1, 'Sample Files Set #1'),
    [addTestFiles]
  )

  const addTestFilesSet2 = useCallback(
    () => addTestFiles(testFilesSet2, 'Sample Files Set #2'),
    [addTestFiles]
  )

  const clearWorkspace = useCallback(async () => {
    if (!fm) {
      toast.error('FileManager not initialized')
      return
    }
    setIsClearingWorkspace(true)
    try {
      const files = await fm.listFiles()
      for (const file of files) {
        await fm.deleteFile(file)
      }
      await refetchAssets()
      toast.success('Workspace cleared')
    } catch (error) {
      console.error('Failed to clear workspace:', error)
      toast.error('Failed to clear workspace')
    } finally {
      setIsClearingWorkspace(false)
    }
  }, [fm, refetchAssets])

  // Debugging: expose utility to window
  useEffect(() => {
    Object.assign(window, { objectIdToWalrusSiteUrl })
  }, [])

  return (
    <div className="container mx-auto p-6">
      <AnimatedBackground />
      <Introduction />
      <div className="flex flex-col items-center gap-6 w-full mx-auto">
        <CardContent className="relative w-full">
          <h1 className="mb-1">Assets</h1>

          <AssetsSection
            loading={loading}
            assets={assets}
            onAddTestFilesSet1={addTestFilesSet1}
            onAddTestFilesSet2={addTestFilesSet2}
            onClearWorkspace={clearWorkspace}
            isAddingFiles={isAddingFiles}
            isClearingWorkspace={isClearingWorkspace}
          />

          <hr className="my-4 border-t border-neutral-400 dark:border-neutral-700" />

          <div className="flex flex-col gap-2">
            <PublishSection
              siteId={siteId}
              currentAccount={currentAccount}
              assets={assets}
              onPrepareAssets={handlePrepareAssetsForBuilder}
              onUpdateSiteMetadata={handleUpdateSiteMetadataForBuilder}
              onError={handleBuilderError}
              signAndExecuteTransaction={signAndExecuteTransaction}
              clients={{ suiClient, queryClient }}
            />

            {siteId && (
              <PublishedSiteInfo
                siteId={siteId}
                network={networkConfig.network}
                onClearSiteId={() => $siteId.set('')}
              />
            )}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
