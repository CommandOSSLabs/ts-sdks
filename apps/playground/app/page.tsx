'use client'

import {
  type ISponsorConfig,
  objectIdToWalrusSiteUrl
} from '@cmdoss/walrus-site-builder'
import {
  isUpdateMetadataModalOpen,
  type SiteMetadata,
  type SiteMetadataUpdate,
  siteMetadataStore,
  UpdateMetadataModal,
  useZenFsWorkspace,
  useZenfsFilesQuery
} from '@cmdoss/walrus-site-builder-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Introduction } from '@/components/Introduction'
import { CardContent } from '@/components/ui/card'
import { useNetworkConfig } from '@/configs/networkConfig'
import { $siteId, $suiNSUrl } from '@/stores/siteStore'
import '@cmdoss/walrus-site-builder-react/styles.css'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSignTransaction,
  useSuiClient
} from '@mysten/dapp-kit'
import { SuinsClient } from '@mysten/suins'
import { WalrusClient } from '@mysten/walrus'
import { useStore } from '@nanostores/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AssetsSection from '@/components/AssetsSection'
import PublishedSiteInfo from '@/components/PublishedSiteInfo'
import PublishSection from '@/components/PublishSection'
import { PlaygroundSponsorApiClient } from '@/lib/sponsor-client'
import { testFilesSet1, testFilesSet2 } from './files'

export default function Home() {
  const queryClient = useQueryClient()
  const suiClient = useSuiClient()
  const networkConfig = useNetworkConfig()
  const [isAddingFiles, setIsAddingFiles] = useState(false)
  const [isClearingWorkspace, setIsClearingWorkspace] = useState(false)
  const siteId = useStore($siteId)
  const updateMetadataModalOpen = useStore(isUpdateMetadataModalOpen)
  const suinsClient = useMemo(
    () => new SuinsClient({ network: networkConfig.name, client: suiClient }),
    [networkConfig.name, suiClient]
  )
  const walrusClient = useMemo(
    () =>
      new WalrusClient({
        suiClient,
        network: networkConfig.name,
        uploadRelay: {
          // Official Walrus upload relay
          host: `https://upload-relay.${networkConfig.name}.walrus.space`,
          sendTip: { max: 100000000 }
        }
      }),
    [networkConfig.name, suiClient]
  )

  // Fix hydration issues by syncing siteId from nanostores manually on the client
  // useEffect(() => $siteId.listen(v => setSiteId(v)), [])

  // Sponsor config state
  const [sponsorEnabled, setSponsorEnabled] = useState(false)
  const [sponsorUrl, setSponsorUrl] = useState('http://localhost:8787')

  // Handle sponsor config changes
  const handleSponsorConfigChange = useCallback(
    (enabled: boolean, url: string) => {
      setSponsorEnabled(enabled)
      setSponsorUrl(url)
    },
    []
  )

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

  const { mutateAsync: signTransaction } = useSignTransaction()

  // Create sponsor config when enabled
  const sponsorConfig: ISponsorConfig | undefined = useMemo(() => {
    if (!sponsorEnabled || !currentAccount?.address) {
      return undefined
    }

    return {
      apiClient: new PlaygroundSponsorApiClient(sponsorUrl),
      signTransaction
    }
  }, [sponsorEnabled, sponsorUrl, currentAccount?.address, signTransaction])

  const handleUpdateSiteMetadataForBuilder = useCallback(
    async (site: SiteMetadataUpdate): Promise<SiteMetadata> => {
      // Playground has no backend; return the provided site to satisfy types
      // but convert imageUrl to string if it's a File object
      let imageUrl = ''
      if (typeof site.imageUrl === 'string') {
        imageUrl = site.imageUrl
      } else if (site.imageUrl instanceof File) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(site.imageUrl as File)
        })
      }

      if (site.id) {
        console.log('💾 Storing published site ID:', site.id)
        $siteId.set(site.id) // Store published site ID persistently
      }

      const result: SiteMetadata = { ...site, imageUrl }
      console.log('💾 Updated site metadata:', result)

      return result
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

  // Sync suiNSUrl with localStorage
  useEffect(() => {
    // Load from localStorage on mount
    const storedSuiNSUrl = $suiNSUrl.get()
    if (storedSuiNSUrl.length > 0) {
      // Set to store and also to original to prevent reset
      siteMetadataStore.suiNSUrl.set(storedSuiNSUrl)
      siteMetadataStore.originalSuiNSUrl.set(
        storedSuiNSUrl.map(item => ({ ...item }))
      )
    }

    // Listen to store changes and sync to localStorage
    const unsubscribe = siteMetadataStore.suiNSUrl.listen(value => {
      $suiNSUrl.set([...value])
    })

    return () => {
      unsubscribe()
    }
  }, [])

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
              onUpdateSiteMetadata={handleUpdateSiteMetadataForBuilder}
              onError={handleBuilderError}
              signAndExecuteTransaction={signAndExecuteTransaction}
              sponsorConfig={sponsorConfig}
              onSponsorConfigChange={handleSponsorConfigChange}
              sponsorEnabled={sponsorEnabled}
              sponsorUrl={sponsorUrl}
              clients={{ suiClient, queryClient, suinsClient, walrusClient }}
            />

            {siteId && (
              <>
                <PublishedSiteInfo
                  siteId={siteId}
                  network={networkConfig.network}
                  onClearSiteId={() => {
                    $siteId.set('')
                    siteMetadataStore.suiNSUrl.set([])
                    $suiNSUrl.set([])
                  }}
                  onUpdateMetadata={() => isUpdateMetadataModalOpen.set(true)}
                />
                <UpdateMetadataModal
                  siteId={siteId}
                  isOpen={updateMetadataModalOpen}
                  onOpenChange={isUpdateMetadataModalOpen.set}
                  onSuccess={(digest: string) => {
                    toast.success(
                      `Site metadata updated successfully! Digest: ${digest.slice(0, 8)}...`
                    )
                    console.log('✅ Site metadata updated:', digest)
                  }}
                  onError={(error: Error) => {
                    toast.error(`Failed to update metadata: ${error.message}`)
                    console.error('❌ Failed to update metadata:', error)
                  }}
                  clients={{
                    suiClient,
                    queryClient,
                    walrusClient
                  }}
                  currentAccount={currentAccount}
                  signAndExecuteTransaction={signAndExecuteTransaction}
                  sponsorConfig={sponsorConfig}
                />
              </>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
