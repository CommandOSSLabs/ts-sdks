import type { SuiClient } from '@mysten/sui/client'
import type { WalrusFile } from '@mysten/walrus'
import debug from 'debug'
import { contentTypeFromFilePath } from '../content.ts'
import { handleSuiClientError } from '../lib/handleSuiClientError.ts'
import {
  getSHA256Hash,
  isSupportedNetwork,
  mainPackage,
  sha256ToU256
} from '../lib/index.ts'
import { computeSiteDataDiff } from '../lib/site-data.utils.ts'
import type {
  ResourceChainValue,
  SiteData,
  SiteDataDiff,
  SuiResource,
  WalrusSiteDisplayData,
  WSResources
} from '../types.ts'
import { ChainService } from './chain.service.ts'

const log = debug('site-builder:site-service')

export class SiteService {
  #suiClient: SuiClient
  #chainSrv: ChainService

  constructor(suiClient: SuiClient) {
    this.#suiClient = suiClient
    this.#chainSrv = new ChainService(suiClient)
  }

  /**
   * Calculate the diff between provided files and existing on-chain site data.
   *
   * @param files - The WalrusFile array containing files to be deployed
   * @param wsResources - The Walrus Site resources metadata (routes, headers, etc.)
   * @param siteId - The existing site ID to compare against. If undefined, all files are treated as new.
   * @returns The computed site data diff
   */
  async calculateSiteDiff(
    files: WalrusFile[],
    wsResources: WSResources
  ): Promise<SiteDataDiff> {
    log('📊 Calculating site diff...')

    // Build the next site data from provided files
    const nextSiteData = await this.#buildSiteDataFromFiles(files, wsResources)
    log(
      '📁 Built next site data with',
      nextSiteData.resources.length,
      'resources',
      nextSiteData
    )

    // If no siteId, treat as new site (compare against empty site)
    if (!wsResources.object_id) {
      log('🆕 No existing site ID, treating all resources as new')
      const emptySiteData: SiteData = { resources: [] }
      return computeSiteDataDiff(nextSiteData, emptySiteData)
    }

    // Fetch existing site data from chain
    log('🔗 Fetching existing site data for:', wsResources.object_id)
    const existingSiteData = await this.getSiteDataFromChain(
      wsResources.object_id
    )
    log(
      '📥 Fetched existing site with',
      existingSiteData.resources.length,
      'resources:',
      existingSiteData
    )

    return computeSiteDataDiff(nextSiteData, existingSiteData)
  }

  async getSiteDataFromChain(siteId: string): Promise<SiteData> {
    // Fetch site object and display data
    const objRes = await this.#suiClient.getObject({
      id: siteId,
      options: { showDisplay: true }
    })

    const error = objRes.data?.display?.error ?? objRes.error
    if (error) handleSuiClientError(error)

    const data = objRes.data?.display?.data
    if (!data) throw new Error('No data returned for Walrus site')
    const siteData = data as unknown as WalrusSiteDisplayData
    const resources = await this.#fetchSiteResources(siteId)

    return {
      site_name: siteData.name,
      metadata: siteData,
      resources
      // routes: [] // TODO: Fetch routes from chain
    }
  }

  /**
   * Build SiteData from WalrusFile array
   */
  async #buildSiteDataFromFiles(
    files: WalrusFile[],
    wsResources: WSResources
  ): Promise<SiteData> {
    const resources: SuiResource[] = []

    for (const file of files) {
      const content = await file.bytes()
      const path = (await file.getIdentifier()) ?? ''
      const resource: SuiResource = {
        path,
        blob_id: '<pending>', // Will be filled after upload
        blob_hash: sha256ToU256(await getSHA256Hash(content)).toString(),
        headers: wsResources.headers ?? [
          { key: 'content-encoding', value: 'identity' },
          { key: 'content-type', value: contentTypeFromFilePath(path) }
        ]
      }
      resources.push(resource)
    }

    return {
      resources,
      routes: wsResources.routes,
      site_name: wsResources.site_name,
      metadata: wsResources.metadata
    }
  }

  async #fetchSiteResources(siteId: string): Promise<SuiResource[]> {
    const network = this.#suiClient.network
    if (!isSupportedNetwork(network))
      throw new Error(`Unsupported network: ${network}`)

    const packageId = mainPackage[network].packageId
    const dynamicFields = await this.#chainSrv.fetchSiteDynamicFields(siteId)
    const resourcePaths = dynamicFields
      .filter(f => f.objectType === `${packageId}::site::Resource`)
      .filter(r => r.name.type === `${packageId}::site::ResourcePath`)

    // Fetch resource details
    const resources: SuiResource[] = []
    for (const rp of resourcePaths) {
      const content = await this.#suiClient
        .getObject({ id: rp.objectId, options: { showContent: true } })
        .then(res => res.data?.content)

      if (!content || content?.dataType !== 'moveObject')
        throw new Error('Invalid resource object data type')

      const fields = content.fields
      if (Array.isArray(fields))
        throw new Error('Invalid resource object fields')
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
}
