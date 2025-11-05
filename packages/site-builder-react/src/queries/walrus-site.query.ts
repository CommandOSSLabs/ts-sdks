import { mainPackage } from '@cmdoss/site-builder'
import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit'
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

  console.log('🔍 Dynamic fields found:', dynamicFields)

  const resourcePaths = dynamicFields
    .filter(f => f.objectType === `${packageId}::site::Resource`)
    .filter(r => r.name.type === `${packageId}::site::ResourcePath`)

  console.log('🔍 Resource paths found:', resourcePaths)

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

    console.log('🔍 Resource object fields:', fields)

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
  console.log('🔍 Fetching Walrus site data for ID:', id, packageId)
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
  console.log('🔍 Fetched Walrus site display data:', siteData)
  const resources = await fetchSiteResources(suiClient, id, packageId)
  console.log('🔍 Fetched Walrus site resources:', resources)
  const finalSiteData = { id, ...siteData, resources }
  console.log('🔍 Fetched Walrus site data:', finalSiteData)
  return finalSiteData
}

export function useWalrusSiteQuery(id: string | undefined) {
  const suiClient = useSuiClient()
  const { network } = useSuiClientContext()
  console.log('🔍 Network:', network)
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
