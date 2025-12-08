import { mainPackage } from '@cmdoss/site-builder'
import { useSuiClient } from '@mysten/dapp-kit'
import type {
  DynamicFieldInfo,
  ObjectResponseError,
  SuiClient
} from '@mysten/sui/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from './keys'

interface WalrusSiteDisplayData {
  creator: string
  description: string
  image_url: string
  link: string
  project_url: string
  name: string
}

interface ResourceChainValue {
  type: string
  fields: {
    blob_hash: string
    blob_id: string
    headers: {
      type: string
      fields: {
        contents: Array<{
          type: string
          fields: {
            key: string
            value: string
          }
        }>
      }
    }
    path: string
    range: null | unknown
  }
}

interface ResourceData {
  blob_hash: string
  blob_id: string
  headers: { key: string; value: string }[]
  path: string
  // range: null | unknown // Not used currently
}

interface WalrusSiteData extends WalrusSiteDisplayData {
  id: string
  resources: ResourceData[]
}

function handleError(error: ObjectResponseError): never {
  switch (error.code) {
    case 'deleted':
      throw new Error('Walrus site has been deleted')
    case 'notExists':
      throw new Error('Walrus site does not exist')
    case 'displayError':
      throw new Error('Failed to fetch Walrus site display data')
    case 'dynamicFieldNotFound':
      throw new Error('Walrus site dynamic field not found')
    default:
      throw new Error(`Unknown error when fetching Walrus site!`)
  }
}

async function fetchSiteDynamicFields(
  suiClient: SuiClient,
  siteId: string
): Promise<DynamicFieldInfo[]> {
  const dynamicFields: DynamicFieldInfo[] = []
  let cursor: string | null = null
  while (true) {
    const page = await suiClient.getDynamicFields({ parentId: siteId, cursor })
    cursor = page.nextCursor
    dynamicFields.push(...page.data)
    if (!page.hasNextPage) break
  }
  return dynamicFields
}

async function fetchSiteResources(
  suiClient: SuiClient,
  siteId: string,
  packageId: string
) {
  const dynamicFields = await fetchSiteDynamicFields(suiClient, siteId)

  // console.log('🔍 Dynamic fields found:', dynamicFields)

  const resourcePaths = dynamicFields
    .filter(f => f.objectType === `${packageId}::site::Resource`)
    .filter(r => r.name.type === `${packageId}::site::ResourcePath`)

  // console.log('🔍 Resource paths found:', resourcePaths)

  // Fetch resource details
  const resources: ResourceData[] = []
  for (const rp of resourcePaths) {
    const resObj = await suiClient.getObject({
      id: rp.objectId,
      options: { showContent: true }
    })

    if (resObj.data?.content?.dataType !== 'moveObject')
      throw new Error('Invalid resource object data type')

    const fields = resObj.data?.content?.fields
    if (Array.isArray(fields)) throw new Error('Invalid resource object fields')
    if (!('value' in fields))
      throw new Error('Invalid resource object fields value')

    // console.log('🔍 Resource object fields:', fields)

    const resourceValue = fields.value as ResourceChainValue
    const result: ResourceData = {
      blob_hash: resourceValue.fields.blob_hash,
      blob_id: resourceValue.fields.blob_id,
      headers: resourceValue.fields.headers.fields.contents.map(c => c.fields),
      path: resourceValue.fields.path
    }
    resources.push(result)
  }
  return resources
}

async function fetchWalrusSiteData(
  suiClient: SuiClient,
  id: string,
  packageId: string
): Promise<WalrusSiteData> {
  // console.log('🔍 Fetching Walrus site data for ID:', id, packageId)
  // Fetch site object and display data
  const objRes = await suiClient.getObject({
    id,
    options: { showDisplay: true }
  })

  const error = objRes.data?.display?.error ?? objRes.error
  if (error) handleError(error)

  const data = objRes.data?.display?.data
  if (!data) throw new Error('No data returned for Walrus site')
  const siteData = data as unknown as WalrusSiteDisplayData
  // console.log('🔍 Fetched Walrus site display data:', siteData)
  const resources = await fetchSiteResources(suiClient, id, packageId)
  // console.log('🔍 Fetched Walrus site resources:', resources)
  const finalSiteData = { id, ...siteData, resources }
  // console.log('🔍 Fetched Walrus site data:', finalSiteData)
  return finalSiteData
}

export function useWalrusSiteQuery(id: string | undefined) {
  const suiClient = useSuiClient()
  const { network } = suiClient
  const packageId = useMemo(
    () => mainPackage[network as keyof typeof mainPackage].packageId,
    [network]
  )

  return useQuery({
    queryKey: queryKeys.walrusSite(id),
    queryFn: async () => {
      if (!id) throw new Error('No site ID provided')
      return fetchWalrusSiteData(suiClient, id, packageId)
    },
    enabled: !!id
  })
}

async function fetchWalrusSitesListPaginated(
  suiClient: SuiClient,
  address: string,
  packageId: string,
  limit?: number,
  cursorParam?: string | null
): Promise<{
  sites: WalrusSiteData[]
  nextCursor: string | null
  hasNextPage: boolean
}> {
  try {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${packageId}::site::Site`
      },
      options: { showDisplay: true, showType: true },
      cursor: cursorParam,
      limit: limit || 50
    })

    // console.log('🔍 Response:', response)

    if (!response.data || response.data.length === 0) {
      return {
        sites: [],
        nextCursor: response.nextCursor || null,
        hasNextPage: response.hasNextPage
      }
    }

    const siteObjects = response.data
      .filter(obj => {
        // Filter for Site objects
        if (!obj.data) {
          console.warn('Object missing data:', obj)
          return false
        }

        // Check for display errors
        if (obj.data.display?.error) {
          console.warn(
            'Display error for site:',
            obj.data.objectId,
            obj.data.display.error
          )
          return false
        }

        // Verify it's a Site type
        const type = obj.data.type
        if (!type || type !== `${packageId}::site::Site`) {
          return false
        }

        // Must have objectId
        if (!obj.data.objectId) {
          console.warn('Object missing objectId:', obj)
          return false
        }

        return true
      })
      .map(obj => {
        // obj.data is guaranteed to exist due to filter above
        if (!obj.data) return null

        // Access display data from obj.data.display.data
        const display = obj.data.display?.data
        if (!display) {
          console.warn('No display data for site:', obj.data.objectId)
          return null
        }

        const displayData = display as unknown as WalrusSiteDisplayData

        // Validate required fields
        if (!displayData.name) {
          console.warn('Site missing name:', obj.data.objectId)
          return null
        }

        return {
          id: obj.data.objectId,
          name: displayData.name,
          description: displayData.description || '',
          image_url: displayData.image_url || '',
          link: displayData.link || '',
          project_url: displayData.project_url || '',
          creator: displayData.creator || '',
          resources: [] as ResourceData[]
        }
      })
      .filter((site): site is WalrusSiteData => site !== null)

    return {
      sites: siteObjects,
      nextCursor: response.nextCursor || null,
      hasNextPage: response.hasNextPage
    }
  } catch (error) {
    console.error('Error fetching Walrus sites list:', error)
    throw error
  }
}

export function useWalrusSitesQuery(
  address: string | undefined,
  options?: {
    limit?: number
    cursor?: string | null
  }
) {
  const suiClient = useSuiClient()
  const { network } = suiClient
  const packageId = useMemo(
    () => mainPackage[network as keyof typeof mainPackage].packageId,
    [network]
  )

  // console.log('🔍 Fetching Walrus sites list for address:', address, packageId)

  const sitesListQuery = useQuery({
    queryKey: [
      ...queryKeys.walrusSites(address, network),
      options?.cursor,
      options?.limit
    ],
    queryFn: async () => {
      if (!address) return { sites: [], nextCursor: null, hasNextPage: false }
      return fetchWalrusSitesListPaginated(
        suiClient,
        address,
        packageId,
        options?.limit,
        options?.cursor
      )
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // Return paginated data directly - no need to fetch full details for list view
  return {
    data: sitesListQuery.data?.sites ?? [],
    nextCursor: sitesListQuery.data?.nextCursor ?? null,
    hasNextPage: sitesListQuery.data?.hasNextPage ?? false,
    isLoading: sitesListQuery.isLoading,
    isError: sitesListQuery.isError,
    error: sitesListQuery.error
  }
}
