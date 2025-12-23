import {
  type IReadOnlyFileManager,
  type ISignAndExecuteTransaction,
  type ISponsorConfig,
  type IWalrusSiteBuilderSdk,
  mainPackage,
  objectIdToWalrusSiteUrl,
  suinsDomainToWalrusSiteUrl,
  WalrusSiteBuilderSdk
} from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { ALLOWED_METADATA, SuinsTransaction } from '@mysten/suins'
import type { WalletAccount } from '@mysten/wallet-standard'
import {
  MAINNET_WALRUS_PACKAGE_CONFIG,
  TESTNET_WALRUS_PACKAGE_CONFIG
} from '@mysten/walrus'
import { useStore } from '@nanostores/react'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useWalrusSiteQuery } from '~/queries'
import { useSuiNsDomainsQuery } from '~/queries/suins-domains.query'
import {
  isAssigningDomain,
  isDomainDialogOpen
} from '~/stores/site-domain.store'
import { siteMetadataStore } from '~/stores/site-metadata.store'
import {
  type SiteMetadata,
  type SiteMetadataUpdate,
  sitePublishingStore
} from '~/stores/site-publishing.store'
import { useSuiNsClient } from './useSuiNsClient'
import { useTransactionExecutor } from './useTransactionExecutor'
import { useWalrusClient } from './useWalrusClient'

export interface UseSitePublishingParams {
  /**
   * Site Object ID on chain. If not provided, a new site will be created upon publishing.
   */
  siteId?: string
  /**
   * Mandatory callback to prepare assets for publishing. It should return the `IFileManager` instance
   * containing the files to be published
   */
  onPrepareAssets: () => Promise<IReadOnlyFileManager>
  /**
   * Optional callback to update site metadata after publishing. The site ID will
   * be available in the `site` parameter.
   */
  onUpdateSiteMetadata?: (
    site: SiteMetadataUpdate
  ) => Promise<SiteMetadata | undefined>
  /** Optional callback when a domain is associated with the site. */
  onAssociatedDomain?: (nftId: string, siteId: string) => Promise<void>
  /** Optional callback for handling errors. */
  onError?: (msg: string) => void
  /** Optional callback when blobs are extended. */
  onExtendedBlobs?: (msg: string, txDigest?: string) => void
  /**
   * Sui and Query clients needed for on-chain operations.
   */
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
  }
  /** Current wallet account information. */
  currentAccount: WalletAccount | null

  /** Callback for signing and executing transactions. */
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
  /** Optional domain for the portal to view published site. */
  portalDomain?: string
  /** Whether to use HTTPS for the portal URL. */
  portalHttps?: boolean
}

export function useSitePublishing({
  siteId,
  onPrepareAssets,
  onUpdateSiteMetadata,
  onAssociatedDomain,
  onError,
  onExtendedBlobs,
  currentAccount,
  signAndExecuteTransaction,
  sponsorConfig,
  portalDomain,
  portalHttps,
  clients: { suiClient, queryClient }
}: UseSitePublishingParams) {
  const suinsClient = useSuiNsClient(suiClient)
  const walrusClient = useWalrusClient(suiClient)
  const [isExtending, setIsExtending] = useState(false)
  // Transaction executor with sponsor support
  const txExecutor = useTransactionExecutor({
    suiClient,
    walletAddress: currentAccount?.address,
    signAndExecuteTransaction,
    sponsorConfig
  })

  const sdk: IWalrusSiteBuilderSdk | undefined = useMemo(() => {
    if (!suiClient || !walrusClient || !currentAccount) return
    return new WalrusSiteBuilderSdk(
      walrusClient,
      suiClient,
      currentAccount.address,
      signAndExecuteTransaction,
      sponsorConfig
    )
  }, [
    suiClient,
    walrusClient,
    currentAccount,
    signAndExecuteTransaction,
    sponsorConfig
  ])

  const {
    data: nsDomains,
    isLoading: isLoadingNsDomains,
    isError: isErrorNsDomains
  } = useSuiNsDomainsQuery(currentAccount, { suiClient, queryClient })

  const { data: walrusSiteData } = useWalrusSiteQuery(siteId, {
    suiClient,
    queryClient
  })

  // Store state
  const isPublishDialogOpen = useStore(sitePublishingStore.isPublishDialogOpen)
  const isWorking = useStore(sitePublishingStore.isWorking)
  const certifiedBlobs = useStore(sitePublishingStore.certifiedBlobs)
  const deployStatus = useStore(sitePublishingStore.deployStatus)
  const deployStatusText = useStore(sitePublishingStore.deployStatusText)
  const deployStepIndex = useStore(sitePublishingStore.deploymentStepIndex)

  const epochs = useStore(siteMetadataStore.epochs)
  const title = useStore(siteMetadataStore.title)
  const imageUrl = useStore(siteMetadataStore.imageUrl)
  const link = useStore(siteMetadataStore.link)
  const description = useStore(siteMetadataStore.description)
  const isEditingSiteMetadata = useStore(siteMetadataStore.isDirty)
  const isSavingSiteMetadata = useStore(siteMetadataStore.loading)
  const isAssigning = useStore(isAssigningDomain)

  // Derived state
  const isDeployed = !!siteId
  const walrusSiteUrl = useMemo(() => {
    if (!siteId) return null
    return objectIdToWalrusSiteUrl(siteId, portalDomain, portalHttps)
  }, [siteId, portalDomain, portalHttps])

  const associatedDomains = nsDomains.filter(d => d.walrusSiteId === siteId)

  // Sync site data to store
  useEffect(() => {
    if (!walrusSiteData) return
    console.log('🔄 Syncing Walrus site data to store', walrusSiteData)
    siteMetadataStore.originalTitle.set(walrusSiteData.name ?? '')
    siteMetadataStore.originalDescription.set(walrusSiteData.description ?? '')
    siteMetadataStore.originalImageUrl.set(walrusSiteData.image_url ?? null)
    siteMetadataStore.originalProjectUrl.set(walrusSiteData.project_url ?? null)
    siteMetadataStore.originalLink.set(walrusSiteData.link ?? '')
    siteMetadataStore.reset()
  }, [walrusSiteData])

  // Actions
  const handleRunDeploymentStep = async () => {
    if (!sdk) return onError?.('SDK not initialized')
    if (imageUrl instanceof File) return onError?.('Please upload image first.')
    const siteMetadata: SiteMetadata = {
      id: siteId,
      title,
      description,
      imageUrl: imageUrl ?? undefined,
      link: siteMetadataStore.link.get() ?? undefined,
      projectUrl: siteMetadataStore.projectUrl.get() ?? undefined
    }
    const result = await sitePublishingStore.runDeploymentStep(
      sdk,
      siteMetadata,
      onPrepareAssets
    )
    if (!result.ok) return onError?.(result.error || 'Deployment failed')
    siteMetadata.id = result.data // Update site ID after deployment
    await onUpdateSiteMetadata?.(siteMetadata)
    siteMetadataStore.commitChanges()
  }

  const handleSaveSiteMetadata = async () => {
    if (!onUpdateSiteMetadata) {
      siteMetadataStore.commitChanges()
      return
    }

    siteMetadataStore.loading.set(true)
    try {
      const result = await onUpdateSiteMetadata({
        id: siteId,
        title: siteMetadataStore.title.get(),
        description: siteMetadataStore.description.get(),
        imageUrl: siteMetadataStore.imageUrl.get() ?? undefined,
        link: siteMetadataStore.link.get() ?? undefined,
        projectUrl: siteMetadataStore.projectUrl.get() ?? undefined
      })
      if (!result) throw new Error('Failed to save site metadata')

      if (result.title) siteMetadataStore.title.set(result.title)
      if (result.description)
        siteMetadataStore.description.set(result.description)
      if (result.imageUrl) siteMetadataStore.imageUrl.set(result.imageUrl)
      siteMetadataStore.link.set(result.link ?? '')
      siteMetadataStore.projectUrl.set(result.projectUrl ?? '')

      siteMetadataStore.commitChanges()
    } finally {
      siteMetadataStore.loading.set(false)
    }
  }

  const handleAssociateDomain = async (
    nftId: string,
    siteId: string,
    suiNSName: string
  ) => {
    if (!suinsClient) return onError?.('SuiNS client not available')
    if (!nftId) return onError?.('No domain selected')
    if (!txExecutor) return onError?.('Transaction executor not available')

    isAssigningDomain.set(true)
    try {
      try {
        const transaction = new Transaction()
        const suinsTransaction = new SuinsTransaction(suinsClient, transaction)
        suinsTransaction.setUserData({
          nft: nftId,
          key: ALLOWED_METADATA.walrusSiteId,
          value: siteId
        })

        const digest = await txExecutor.execute({
          transaction,
          description: 'Associate domain with Walrus site'
        })

        await suiClient.waitForTransaction({ digest })

        // Invalidate all SuiNS queries to refetch updated domain data
        await queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey[0]
            return key === 'suins-domains' || key === 'suins-domain-detail'
          }
        })

        siteMetadataStore.suiNSUrl.set(
          suinsDomainToWalrusSiteUrl(suiNSName, portalDomain, portalHttps)
        )

        await onAssociatedDomain?.(nftId, siteId)
      } catch (e) {
        console.error('🚨 Failed to update SuiNS metadata:', e)
        onError?.('Failed to update SuiNS metadata')
      }
    } finally {
      isAssigningDomain.set(false)
    }
  }

  function handleOpenDomainDialog() {
    isDomainDialogOpen.set(true)
  }
  function handleOpenPublishingDialog() {
    sitePublishingStore.isPublishDialogOpen.set(true)
  }

  const handleExtendBlobs = async (extendEpochs: number) => {
    if (
      !walrusClient ||
      !currentAccount ||
      !walrusSiteData?.resources ||
      walrusSiteData.resources.length === 0
    ) {
      onError?.('Cannot extend blobs: missing required data')
      return
    }

    if (!extendEpochs || extendEpochs <= 0 || extendEpochs > 365) {
      onError?.('Invalid epoch count. Must be between 1 and 365')
      return
    }

    if (!txExecutor) {
      onError?.('Transaction executor not available')
      return
    }

    setIsExtending(true)
    try {
      const blobType = await walrusClient.getBlobType()

      // Determine network-specific constants
      const walCoinType =
        mainPackage[suiClient.network as keyof typeof mainPackage]
          .walrusCoinType
      const walrusPackageId =
        mainPackage[suiClient.network as keyof typeof mainPackage]
          .walrusPackageId
      const systemObjectId =
        suiClient.network === 'mainnet'
          ? MAINNET_WALRUS_PACKAGE_CONFIG.systemObjectId
          : TESTNET_WALRUS_PACKAGE_CONFIG.systemObjectId

      // Map blob_id to blobObjectId
      const blobIdToObjectIdMap = new Map<string, string>()
      let cursor: string | null | undefined = null
      let hasNextPage = true

      while (hasNextPage) {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: blobType },
          options: { showContent: true },
          cursor
        })

        // console.log endEpochs
        console.log('walrusSiteData.resources', walrusSiteData.resources)

        for (const resource of walrusSiteData.resources) {
          const blobId = resource.blob_id

          for (const obj of ownedObjects.data) {
            if (obj.data?.content && 'fields' in obj.data.content) {
              const fields = obj.data.content.fields as Record<string, unknown>
              if ('blob_id' in fields) {
                const objBlobId = String(fields.blob_id)
                if (objBlobId === blobId && !blobIdToObjectIdMap.has(blobId)) {
                  blobIdToObjectIdMap.set(blobId, obj.data.objectId)
                  break
                }
              }
            }
          }
        }

        hasNextPage = ownedObjects.hasNextPage
        cursor = ownedObjects.nextCursor
      }

      if (blobIdToObjectIdMap.size === 0) {
        throw new Error(
          'No blob objects found for this site. Make sure you own the blob objects.'
        )
      }

      const tx = new Transaction()
      tx.setSender(currentAccount.address)

      const walCoin = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: walCoinType
      })

      if (walCoin.data.length === 0) {
        throw new Error(
          `No WAL coins found in wallet. Please acquire WAL tokens first.`
        )
      }

      // Merge all WAL coins
      if (walCoin.data.length > 1) {
        tx.mergeCoins(
          tx.object(walCoin.data[0].coinObjectId),
          walCoin.data.slice(1).map(coin => tx.object(coin.coinObjectId))
        )
      }

      // Extend all blobs by adding epochs to their current expiration
      for (const [_blobId, objectId] of blobIdToObjectIdMap.entries()) {
        tx.moveCall({
          package: walrusPackageId,
          module: 'system',
          function: 'extend_blob',
          arguments: [
            tx.object(systemObjectId),
            tx.object(objectId),
            tx.pure.u32(extendEpochs),
            tx.object(walCoin.data[0].coinObjectId)
          ]
        })
      }

      const digest = await txExecutor.execute({
        transaction: tx,
        description: `Extending ${blobIdToObjectIdMap.size} blob(s) by ${extendEpochs} epoch(s)`
      })

      // Wait for transaction to complete
      await suiClient.waitForTransaction({ digest })

      // Invalidate queries to refetch updated data
      await queryClient.invalidateQueries({
        predicate: query => {
          const key = query.queryKey
          return (
            (Array.isArray(key) &&
              (key[0] === 'walrus-site' || key[0] === 'walrus-sites')) ||
            false
          )
        }
      })

      onExtendedBlobs?.(
        `Successfully extended ${blobIdToObjectIdMap.size} blob(s) by ${extendEpochs} epoch(s)`,
        digest
      )
    } catch (error) {
      console.error('Error extending blobs:', error)
      onError?.(
        `Failed to extend blobs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsExtending(false)
    }
  }

  return {
    state: {
      isDeployed,
      isAssigning,
      isExtending,
      isPublishDialogOpen,
      isWorking,
      certifiedBlobs,
      epochs,
      title,
      iconUrl: imageUrl,
      description,
      link,
      isEditingSiteMetadata,
      deployStatus,
      deployStatusText,
      deployStepIndex,
      walrusSiteUrl,
      nsDomains,
      isLoadingNsDomains,
      isErrorNsDomains,
      isSavingSiteMetadata,
      associatedDomains
    },
    actions: {
      handleRunDeploymentStep,
      handleSaveSiteMetadata,
      handleAssociateDomain,
      handleExtendBlobs,
      handleOpenDomainDialog,
      handleOpenPublishingDialog,
      handleCancelEditingSiteMetadata: siteMetadataStore.reset
    }
  }
}
