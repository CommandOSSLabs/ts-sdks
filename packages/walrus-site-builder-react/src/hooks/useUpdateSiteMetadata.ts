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
  siteName: string
  metadata: WSResources['metadata']
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

        const digest = await sdk.updateSiteMetadata(siteId, siteName, metadata)
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
