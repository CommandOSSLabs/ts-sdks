import {
  type ISignAndExecuteTransaction,
  type ISponsorConfig,
  WalrusSiteBuilderSdk,
  type WSResources
} from '@cmdoss/walrus-site-builder'
import type { SuiClient } from '@mysten/sui/client'
import type { WalletAccount } from '@mysten/wallet-standard'
import type { WalrusClient } from '@mysten/walrus'
import type { QueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useWalrusSiteQuery } from '~/queries'
import { queryKeys } from '~/queries/keys'

export interface UseUpdateSiteMetadataParams {
  siteId: string
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    walrusClient: WalrusClient
  }
  currentAccount: WalletAccount | null
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

export interface UpdateSiteMetadataInput {
  siteName?: string
  metadata?: Partial<WSResources['metadata']>
}

export function useUpdateSiteMetadata({
  siteId,
  clients: { suiClient, queryClient, walrusClient },
  currentAccount,
  signAndExecuteTransaction,
  sponsorConfig
}: UseUpdateSiteMetadataParams) {
  const network = suiClient.network

  // Create SDK instance
  const sdk = useMemo(() => {
    if (!currentAccount || !suiClient || !walrusClient) return null

    return new WalrusSiteBuilderSdk(
      walrusClient,
      suiClient,
      currentAccount.address,
      signAndExecuteTransaction,
      sponsorConfig
    )
  }, [
    currentAccount,
    suiClient,
    walrusClient,
    signAndExecuteTransaction,
    sponsorConfig
  ])

  // Get current site data to merge with updates
  const { data: currentSiteData } = useWalrusSiteQuery(siteId, {
    suiClient,
    queryClient
  })

  // Mutation for updating site metadata
  const mutation = useMutation(
    {
      mutationFn: async ({
        siteName,
        metadata
      }: UpdateSiteMetadataInput): Promise<string> => {
        if (!sdk) {
          throw new Error('SDK not initialized')
        }

        // Merge with current site data - only update fields that are provided
        const finalSiteName =
          siteName !== undefined && siteName !== ''
            ? siteName
            : currentSiteData?.name || ''

        // Merge metadata: keep existing values for fields that are not provided
        // Only include fields that have actual values (not empty strings or undefined)
        const finalMetadata: WSResources['metadata'] = {}

        // Start with current site data (only include defined fields)
        if (currentSiteData) {
          if (currentSiteData.link) finalMetadata.link = currentSiteData.link
          if (currentSiteData.image_url)
            finalMetadata.image_url = currentSiteData.image_url
          if (currentSiteData.description)
            finalMetadata.description = currentSiteData.description
          if (currentSiteData.project_url)
            finalMetadata.project_url = currentSiteData.project_url
          if (currentSiteData.creator)
            finalMetadata.creator = currentSiteData.creator
        }

        // Override with provided values (only if they are not empty)
        if (
          metadata?.description !== undefined &&
          metadata.description !== ''
        ) {
          finalMetadata.description = metadata.description
        }
        if (
          metadata?.project_url !== undefined &&
          metadata.project_url !== ''
        ) {
          finalMetadata.project_url = metadata.project_url
        }
        if (metadata?.image_url !== undefined && metadata.image_url !== '') {
          finalMetadata.image_url = metadata.image_url
        }
        if (metadata?.link !== undefined && metadata.link !== '') {
          finalMetadata.link = metadata.link
        }
        if (metadata?.creator !== undefined && metadata.creator !== '') {
          finalMetadata.creator = metadata.creator
        }

        // Always include creator and link from current data if not provided
        // This ensures they are preserved even if not explicitly set in the update
        if (
          !finalMetadata.creator &&
          currentSiteData?.creator &&
          currentSiteData.creator !== ''
        ) {
          finalMetadata.creator = currentSiteData.creator
        }
        if (
          !finalMetadata.link &&
          currentSiteData?.link &&
          currentSiteData.link !== ''
        ) {
          finalMetadata.link = currentSiteData.link
        }

        const digest = await sdk.updateSiteMetadata(
          siteId,
          finalSiteName,
          finalMetadata
        )
        return digest
      },
      onSuccess: digest => {
        // Invalidate site query to refetch updated data
        queryClient.invalidateQueries({
          queryKey: queryKeys.walrusSite(siteId)
        })

        // Also invalidate sites list if needed
        if (currentAccount?.address) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.walrusSites(currentAccount.address, network)
          })
        }

        console.log('✅ Site metadata updated successfully:', digest)
      },
      onError: error => {
        console.error('❌ Failed to update site metadata:', error)
      }
    },
    queryClient
  )

  return {
    updateSiteMetadata: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data
  }
}
