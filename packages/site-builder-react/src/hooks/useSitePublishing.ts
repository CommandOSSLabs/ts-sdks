import {
  type IFileManager,
  type IWalrusSiteBuilderSdk,
  objectIdToWalrusSiteUrl,
  WalrusSiteBuilderSdk
} from '@cmdoss/site-builder'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext
} from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { ALLOWED_METADATA, SuinsTransaction } from '@mysten/suins'
import { useStore } from '@nanostores/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useWalrusSiteQuery } from '~/queries'
import { queryKeys } from '~/queries/keys'
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
  onPrepareAssets: () => Promise<IFileManager>
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
}

export function useSitePublishing({
  siteId,
  onPrepareAssets,
  onUpdateSiteMetadata,
  onAssociatedDomain,
  onError
}: UseSitePublishingParams) {
  const queryClient = useQueryClient()
  const suinsClient = useSuiNsClient()
  const suiClient = useSuiClient()
  const walrusClient = useWalrusClient()
  const currentAccount = useCurrentAccount()
  const { network } = useSuiClientContext()
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

  const sdk: IWalrusSiteBuilderSdk | undefined = useMemo(() => {
    if (!walrusClient || !currentAccount) return
    return new WalrusSiteBuilderSdk(
      walrusClient,
      currentAccount.address,
      signAndExecuteTransaction
    )
  }, [walrusClient, currentAccount, signAndExecuteTransaction])

  const {
    data: nsDomains,
    isLoading: isLoadingNsDomains,
    isError: isErrorNsDomains
  } = useSuiNsDomainsQuery()

  const { data: walrusSiteData } = useWalrusSiteQuery(siteId)

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
    return network === 'mainnet'
      ? objectIdToWalrusSiteUrl(siteId, 'wal.app', true)
      : objectIdToWalrusSiteUrl(siteId)
  }, [siteId, network])

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

  const handleAssociateDomain = async (nftId: string, siteId: string) => {
    if (!suinsClient) return onError?.('SuiNS client not available')
    if (!nftId) return onError?.('No domain selected')

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
        const { digest } = await signAndExecuteTransaction({ transaction })
        await suiClient.waitForTransaction({ digest })
        queryClient.invalidateQueries({
          queryKey: queryKeys.suinsDomainDetail(nftId, network)
        })
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

  return {
    state: {
      isDeployed,
      isAssigning,
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
      handleOpenDomainDialog,
      handleOpenPublishingDialog,
      handleCancelEditingSiteMetadata: siteMetadataStore.reset
    }
  }
}
