import type { SuiClient } from '@mysten/sui/client'
import { mainPackage } from '@mysten/suins'
import type { WalletAccount } from '@mysten/wallet-standard'
import { type QueryClient, useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSuiNsClient } from '~/hooks/useSuiNsClient'
import { nonNull } from '~/lib/nonNull'
import { queryKeys } from './keys'

export type SuiNsDomain = {
  name: string
  objectId: string
  expiresAt?: number
}

export interface SuiNsDomainDetail {
  name: string
  avatar?: string
  expirationTimestampMs?: number
  nftId: string
  walrusSiteId?: string
  targetAddress?: string
  walrusSiteUrl: string
}

export interface ISuiNsDomainQuery {
  isLoading: boolean
  isError: boolean
  data: Array<SuiNsDomainDetail>
}

export function useSuiNsDomainsQuery(
  currentAccount: WalletAccount | null,
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
  }
): ISuiNsDomainQuery {
  const { suiClient, queryClient } = clients
  const { network } = suiClient
  const suinsClient = useSuiNsClient(suiClient)

  const onchainDataQuery = useQuery(
    {
      queryKey: queryKeys.suinsDomains(currentAccount?.address, network),
      queryFn: async () => {
        if (!currentAccount?.address) return []

        try {
          let allDomains: SuiNsDomain[] = []
          let hasNextPage = true
          let cursor: string | null | undefined

          // Get the appropriate SuiNS package ID based on network
          const suinsPackageId =
            mainPackage[network as keyof typeof mainPackage]?.packageIdV1

          if (!suinsPackageId) {
            console.warn(`SuiNS not supported on network: ${network}`)
            return []
          }

          console.log('suinsPackageId', suinsPackageId)

          // Fetch all SuiNS domain NFTs owned by the address
          console.log(
            'suinsPackageId',
            `${suinsPackageId}::suins_registration::SuinsRegistration`
          )
          while (hasNextPage) {
            const response = await suiClient.getOwnedObjects({
              owner: currentAccount.address,
              filter: {
                StructType: `${suinsPackageId}::suins_registration::SuinsRegistration`
              },
              options: { showContent: true, showType: true, showDisplay: true },
              cursor
            })

            console.log('response', response)

            // Extract domain data from the response
            const domains = response.data
              .filter(obj => obj.data?.content?.dataType === 'moveObject')
              .map(obj => {
                const content = obj.data?.content
                const fields =
                  content && 'fields' in content
                    ? (content.fields as Record<string, unknown>)
                    : {}

                return {
                  name: (fields?.domain_name as string) || '',
                  objectId: obj.data?.objectId || '',
                  expiresAt: fields?.expiration_timestamp_ms
                    ? Number(fields.expiration_timestamp_ms)
                    : undefined
                }
              })
              .filter(domain => domain.name) // Filter out any invalid entries

            allDomains = [...allDomains, ...domains]
            hasNextPage = response.hasNextPage
            cursor = response.nextCursor
          }

          return allDomains
        } catch (error) {
          console.error('Error fetching SuiNS domains:', error)
          return []
        }
      },
      enabled: !!currentAccount?.address,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    queryClient
  )

  // TODO: improve this with batching if supported by SuinsClient
  const domains = useQueries(
    {
      queries:
        onchainDataQuery.data?.map(domain => ({
          queryKey: queryKeys.suinsDomainDetail(domain.name, network),
          queryFn: async () => await suinsClient?.getNameRecord(domain.name),
          enabled: !!suinsClient && !!domain.name
        })) ?? []
    },
    queryClient
  )

  const isLoading = useMemo(
    () => onchainDataQuery.isLoading || domains.some(d => d.isLoading),
    [onchainDataQuery.isLoading, domains]
  )
  const isError = useMemo(
    () => onchainDataQuery.isError || domains.some(d => d.isError),
    [onchainDataQuery.isError, domains]
  )
  const data = useMemo(
    () =>
      domains
        .map(d => d.data)
        .filter(nonNull)
        .map(
          r =>
            <SuiNsDomainDetail>{
              name: r.name.slice(0, -4), // remove ".sui" suffix
              avatar: r.avatar,
              expirationTimestampMs: Number(r.expirationTimestampMs),
              nftId: r.nftId,
              walrusSiteId: r.walrusSiteId,
              targetAddr: r.targetAddress,
              walrusSiteUrl:
                network === 'mainnet'
                  ? `https://${r.name.slice(0, -4)}.wal.app`
                  : `http://${r.name.slice(0, -4)}.localhost:3000`
            }
        ),
    [domains, network]
  )

  return { isLoading, isError, data }
}
