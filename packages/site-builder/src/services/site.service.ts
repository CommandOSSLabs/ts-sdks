import { bcs } from '@mysten/sui/bcs'
import type { SuiClient } from '@mysten/sui/client'
import { deriveDynamicFieldID, fromBase64 } from '@mysten/sui/utils'
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
  Routes,
  SiteData,
  SiteDataDiff,
  SuiResource,
  WalrusSiteDisplayData,
  WSResources
} from '../types.ts'
import { ChainService } from './chain.service.ts'

const log = debug('site-builder:site-service')

// BCS struct for parsing Routes dynamic field from chain
const Address = bcs.bytes(32)
const RoutesStruct = bcs.struct('Routes', {
  routes_list: bcs.map(bcs.string(), bcs.string())
})
const DynamicFieldStruct = bcs.struct('DynamicField', {
  parentId: Address,
  name: bcs.vector(bcs.u8()),
  value: RoutesStruct
})

/** The name of the dynamic field containing the routes (matches ROUTES_FIELD in site.move) */
const ROUTES_FIELD = new TextEncoder().encode('routes')

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

    // Fetch resources and routes in parallel
    const [resources, routes] = await Promise.all([
      this.#fetchSiteResources(siteId),
      this.#fetchSiteRoutes(siteId)
    ])

    return {
      site_name: siteData.name,
      metadata: siteData,
      resources,
      routes
    }
  }

  /**
   * Build SiteData from WalrusFile array.
   *
   * This method:
   * 1. Builds resources from files
   * 2. Validates that provided routes point to existing resource paths
   * 3. Generates default routes if none are provided
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

    // Build a set of all resource paths for validation
    const resourcePaths = new Set(resources.map(r => r.path))

    // Validate and process routes
    const routes = this.#processRoutes(wsResources.routes, resourcePaths)

    return {
      resources,
      routes,
      site_name: wsResources.site_name,
      metadata: wsResources.metadata
    }
  }

  /**
   * Process routes: validate provided routes
   *
   * Routes map a route path (e.g., "/path1") to a resource path (e.g., "/index.html").
   * The Move contract validates that the resource path exists when inserting a route.
   *
   * @param providedRoutes - Routes provided via wsResources
   * @param resourcePaths - Set of all resource paths in the site
   * @returns Validated routes
   * @throws Error if any route points to a non-existent resource path
   */
  #processRoutes(
    providedRoutes: Routes | undefined,
    resourcePaths: Set<string>
  ): Routes | undefined {
    // If routes are provided, validate them
    if (providedRoutes && providedRoutes.length > 0) {
      const invalidRoutes: Array<{ route: string; target: string }> = []

      for (const [routePath, resourcePath] of providedRoutes) {
        // Check if the target resource path exists
        if (!resourcePaths.has(resourcePath)) {
          invalidRoutes.push({ route: routePath, target: resourcePath })
        }
      }

      if (invalidRoutes.length > 0) {
        const invalidList = invalidRoutes
          .map(
            r => `  - Route "${r.route}" -> "${r.target}" (resource not found)`
          )
          .join('\n')
        throw new Error(
          `Invalid routes: the following routes point to non-existent resources:\n${invalidList}\n` +
            `Available resource paths: ${Array.from(resourcePaths).join(', ')}`
        )
      }

      log('✅ Validated', providedRoutes.length, 'routes')
      return providedRoutes
    }
  }

  /**
   * Fetch routes from the site's Routes dynamic field.
   * Routes are stored as a dynamic field with name `b"routes"` (vector<u8>).
   */
  async #fetchSiteRoutes(siteId: string): Promise<Routes | undefined> {
    log('🛤️ Fetching routes for site:', siteId)

    // Derive the dynamic field ID for the routes field
    const routesMoveType = 'vector<u8>'
    const dynamicFieldId = deriveDynamicFieldID(
      siteId,
      routesMoveType,
      bcs.vector(bcs.u8()).serialize(ROUTES_FIELD).toBytes()
    )

    log('🔍 Routes dynamic field ID:', dynamicFieldId)

    const routesObj = await this.#suiClient.getObject({
      id: dynamicFieldId,
      options: { showBcs: true }
    })

    const objectData = routesObj.data
    if (
      !objectData ||
      !objectData.bcs ||
      objectData.bcs.dataType !== 'moveObject'
    ) {
      log('ℹ️ No routes dynamic field found for site')
      return undefined
    }

    // Parse the BCS data to extract routes
    const parsed = DynamicFieldStruct.parse(fromBase64(objectData.bcs.bcsBytes))
    const routesList = parsed.value.routes_list

    // Convert Map to array of tuples (our Routes type)
    const routes: Routes = Array.from(routesList.entries())
    log('✅ Fetched', routes.length, 'routes from chain')

    return routes.length > 0 ? routes : undefined
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
