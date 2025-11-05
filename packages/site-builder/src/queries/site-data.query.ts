import type {
  DynamicFieldInfo,
  ObjectResponseError,
  SuiClient
} from '@mysten/sui/client'
import { mainPackage } from '../lib'
import { isSupportedNetwork } from '../lib/utils'
import type { SiteData, SuiResource } from '../types'

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
  siteId: string
): Promise<SuiResource[]> {
  const network = suiClient.network
  if (!isSupportedNetwork(network))
    throw new Error(`Unsupported network: ${network}`)

  const packageId = mainPackage[network].packageId
  const dynamicFields = await fetchSiteDynamicFields(suiClient, siteId)
  const resourcePaths = dynamicFields
    .filter(f => f.objectType === `${packageId}::site::Resource`)
    .filter(r => r.name.type === `${packageId}::site::ResourcePath`)

  // Fetch resource details
  const resources: SuiResource[] = []
  for (const rp of resourcePaths) {
    const content = await suiClient
      .getObject({ id: rp.objectId, options: { showContent: true } })
      .then(res => res.data?.content)

    if (!content || content?.dataType !== 'moveObject')
      throw new Error('Invalid resource object data type')

    const fields = content.fields
    if (Array.isArray(fields)) throw new Error('Invalid resource object fields')
    if (!('value' in fields))
      throw new Error('Invalid resource object fields value')

    const { fields: resourceFields } = fields.value as ResourceChainValue
    const result: SuiResource = {
      blob_hash: resourceFields.blob_hash,
      blob_id: resourceFields.blob_id,
      headers: resourceFields.headers.fields.contents.map(c => c.fields),
      path: resourceFields.path
    }
    resources.push(result)
  }
  return resources
}

export async function getSiteDataFromChain(
  suiClient: SuiClient,
  siteId: string
): Promise<SiteData> {
  // Fetch site object and display data
  const objRes = await suiClient.getObject({
    id: siteId,
    options: { showDisplay: true }
  })

  const error = objRes.data?.display?.error ?? objRes.error
  if (error) handleError(error)

  const data = objRes.data?.display?.data
  if (!data) throw new Error('No data returned for Walrus site')
  const siteData = data as unknown as WalrusSiteDisplayData
  const resources = await fetchSiteResources(suiClient, siteId)

  return {
    site_name: siteData.name,
    metadata: siteData,
    resources
    // routes: [] // TODO: Fetch routes from chain
  }
}
