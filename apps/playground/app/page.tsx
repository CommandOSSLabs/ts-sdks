'use client'

import {
  type IReadOnlyFileManager,
  objectIdToWalrusSiteUrl
} from '@cmdoss/site-builder'
import {
  PublishButton,
  type SiteMetadata,
  type SiteMetadataUpdate,
  useZenFsWorkspace,
  useZenfsFilesQuery
} from '@cmdoss/site-builder-react'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { Introduction } from '@/components/Introduction'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import '@cmdoss/site-builder-react/styles.css'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient
} from '@mysten/dapp-kit'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { testFiles } from './files'

export default function Home() {
  const queryClient = useQueryClient()
  const suiClient = useSuiClient()

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
        for (const [path, content] of Object.entries(testFiles)) {
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
      return { ...site, imageUrl }
    },
    []
  )

  const handleBuilderError = useCallback((msg: string) => {
    console.error(msg)
    toast.error(msg)
  }, [])

  const addTestFiles = useCallback(async () => {
    if (!fm) {
      toast.error('FileManager not initialized')
      return
    }
    try {
      for (const [path, content] of Object.entries(testFiles)) {
        console.log('Adding test file:', path)
        await fm.writeFile(path, new TextEncoder().encode(content))
      }
      await refetchAssets()
      toast.success('Test files added')
    } catch (error) {
      console.error('Failed to create test files:', error)
    }
  }, [fm, refetchAssets])

  const clearWorkspace = useCallback(async () => {
    if (!fm) {
      toast.error('FileManager not initialized')
      return
    }
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
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Loading file system...
                </span>
              </div>
            </div>
          )}
          {!assets.length ? (
            <div className="space-y-4">
              <div className="pt-2">
                <Button
                  onClick={addTestFiles}
                  className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
                >
                  Add Test Files (HTML + SVG)
                </Button>
                <p className="text-xs text-gray-300 mt-2 text-center">
                  Creates index.html with Hello World and a glass of water SVG
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileExplorer className="h-[300px]" assets={assets} />

              <Button
                onClick={clearWorkspace}
                className="w-full text-[#97f0e5] hover:opacity-80 border border-[#97F0E599]"
              >
                Clear Files
              </Button>
            </div>
          )}

          <hr className="my-4 border-t border-neutral-400 dark:border-neutral-700" />
          <div className=" flex flex-col gap-2">
            {!currentAccount ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
                      disabled
                    >
                      Publish
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6} className="text-sm">
                  {!assets.length
                    ? 'Add files to publish your site'
                    : !currentAccount
                      ? 'Please connect your wallet to publish'
                      : ''}
                </TooltipContent>
              </Tooltip>
            ) : (
              <PublishButton
                onPrepareAssets={handlePrepareAssetsForBuilder}
                onUpdateSiteMetadata={handleUpdateSiteMetadataForBuilder}
                onError={handleBuilderError}
                currentAccount={currentAccount}
                clients={{ suiClient, queryClient }}
                signAndExecuteTransaction={signAndExecuteTransaction}
              >
                <Button className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]">
                  Publish
                </Button>
              </PublishButton>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
