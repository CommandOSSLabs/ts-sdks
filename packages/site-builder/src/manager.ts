import type { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import type { WalrusClient } from '@mysten/walrus'
import type {
  IWalrusSiteConfig,
  Metadata,
  SiteData,
  SiteDataDiff
} from './types'

const DEFAULT_SITE_NAME = 'My Walrus Site'
const DEFAULT_SITE_METADATA: Metadata = {
  image_url: 'https://www.walrus.xyz/walrus-site',
  description: 'A walrus site created using Wal-0!',
  creator: 'Wal-0 Team'
}
const DEFAULT_WALRUS_SITE_CONFIG: IWalrusSiteConfig = {
  // Latest Walrus Site Package, get from https://raw.githubusercontent.com/MystenLabs/walrus-sites/refs/heads/mainnet/sites-config.yaml
  package: '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799'
}
export class SiteManager {
  constructor(
    public walrus: WalrusClient,
    public sui: SuiClient,
    public config: IWalrusSiteConfig = DEFAULT_WALRUS_SITE_CONFIG
  ) {}

  async getSiteUpdates(
    data: SiteData,
    siteId: string | undefined
  ): Promise<SiteDataDiff> {
    const existingSite = siteId
      ? await this.getExistingSiteFromChain(siteId)
      : this.createEmptySiteData()

    return this.diffSiteData(data, existingSite)
  }

  /**
   * Create transaction to update a Walrus Site
   */
  createSiteUpdateTransaction(
    siteData: SiteData,
    ownerAddr: string,
    siteId: string | undefined
  ): Transaction {
    console.log('Starting to update site resources on chain')

    const tx = new Transaction()
    if (siteId) {
      // TODO: Implement site update logic
      throw new Error('Updating existing site is not implemented yet')
    } else {
      const metadata = siteData.metadata ?? DEFAULT_SITE_METADATA
      // Create metadata
      const createdMetadata = tx.moveCall({
        target: `${this.config.package}::metadata::new_metadata`,
        arguments: [
          tx.pure.option('string', metadata.link),
          tx.pure.option('string', metadata.image_url),
          tx.pure.option('string', metadata.description),
          tx.pure.option('string', metadata.project_url),
          tx.pure.option('string', metadata.creator)
        ]
      })
      // Create Site
      // TODO: handle site update
      const createdSite = tx.moveCall({
        target: `${this.config.package}::site::new_site`,
        arguments: [
          tx.pure.string(siteData.site_name ?? DEFAULT_SITE_NAME),
          createdMetadata
        ]
      })

      // Update site name
      tx.moveCall({
        target: `${this.config.package}::site::update_name`,
        arguments: [
          createdSite,
          tx.pure.string(siteData.site_name ?? DEFAULT_SITE_NAME)
        ]
      })

      // Add Resources
      for (const resource of siteData.resources) {
        const range = resource.info.range
        // if (!range || (!range.start && !range.end)) continue
        const createdRange = tx.moveCall({
          target: `${this.config.package}::site::new_range_option`,
          arguments: [
            tx.pure.option('u64', range?.start),
            tx.pure.option('u64', range?.end)
          ]
        })

        const createdResource = tx.moveCall({
          target: `${this.config.package}::site::new_resource`,
          arguments: [
            tx.pure.string(resource.full_path),
            tx.pure.u256(resource.info.blob_id_le_u256),
            tx.pure.u256(resource.info.blob_hash_le_u256),
            createdRange
          ]
        })

        // Add Headers
        for (const [key, value] of Object.entries(resource.info.headers)) {
          tx.moveCall({
            target: `${this.config.package}::site::add_header`,
            arguments: [
              createdResource,
              tx.pure.string(key),
              tx.pure.string(value)
            ]
          })
        }

        tx.moveCall({
          target: `${this.config.package}::site::add_resource`,
          arguments: [createdSite, createdResource]
        })
      }

      // Add Routes
      if (siteData.routes) {
        // Create Routes Object
        tx.moveCall({
          target: `${this.config.package}::site::create_routes`,
          arguments: [createdSite]
        })
        // Insert routes
        for (const [path, res] of Object.entries(siteData.routes || {})) {
          tx.moveCall({
            target: `${this.config.package}::site::insert_route`,
            arguments: [createdSite, tx.pure.string(path), tx.pure.string(res)]
          })
        }
      }
      // Transfer site ownership
      tx.transferObjects([createdSite], tx.pure.address(ownerAddr))
      return tx
    }
  }

  // Helper methods
  private async getExistingSiteFromChain(_siteId: string): Promise<SiteData> {
    //  TODO: Implementation would fetch site data from Sui blockchain
    // For now, return empty site data
    return this.createEmptySiteData()
  }

  private createEmptySiteData(): SiteData {
    return {
      resources: [],
      routes: undefined,
      metadata: undefined,
      site_name: undefined
    }
  }

  private diffSiteData(next: SiteData, current: SiteData): SiteDataDiff {
    const resource_ops: SiteDataDiff['resource_ops'] = []
    const route_ops: SiteDataDiff['route_ops'] = []

    // Create maps for efficient lookup by path
    const currentResMap = new Map(
      current.resources.map(res => [res.full_path, res])
    )
    const nextResMap = new Map(next.resources.map(res => [res.full_path, res]))

    // Find created and updated resources
    for (const [path, nextResource] of nextResMap) {
      const currentResource = currentResMap.get(path)

      if (!currentResource) {
        // Resource is new - create operation
        resource_ops.push({ type: 'created', resource: nextResource })
      } else {
        // Resource exists - check if it has changed by comparing hash
        if (nextResource.info.blob_hash !== currentResource.info.blob_hash) {
          resource_ops.push({ type: 'updated', resource: nextResource })
        }
      }
    }

    // Find deleted resources
    for (const [path, currentResource] of currentResMap) {
      if (!nextResMap.has(path)) {
        resource_ops.push({ type: 'deleted', resource: currentResource })
      }
    }

    // Compare routes
    const currentRoutes = current.routes || {}
    const nextRoutes = next.routes || {}

    const currentRoutePaths = new Set(Object.keys(currentRoutes))
    const nextRoutePaths = new Set(Object.keys(nextRoutes))

    // Find created and updated routes
    for (const path of nextRoutePaths) {
      if (!currentRoutePaths.has(path)) {
        // Route is new
        route_ops.push({ type: 'created', path, resource: nextRoutes[path] })
      } else if (currentRoutes[path] !== nextRoutes[path]) {
        // Route has changed
        route_ops.push({ type: 'updated', path, resource: nextRoutes[path] })
      }
    }

    // Find deleted routes
    for (const path of currentRoutePaths) {
      if (!nextRoutePaths.has(path)) {
        route_ops.push({
          type: 'deleted',
          path,
          resource: currentRoutes[path]
        })
      }
    }

    // Compare metadata
    const metadata_op = this.compareMetadata(current.metadata, next.metadata)
      ? 'update'
      : 'noop'

    // Compare site name
    const site_name_op =
      current.site_name !== next.site_name ? 'update' : 'noop'

    return {
      resource_ops,
      route_ops,
      metadata_op,
      site_name_op
    }
  }

  /**
   * Compare metadata objects for differences
   */
  private compareMetadata(current?: Metadata, next?: Metadata): boolean {
    // If both are undefined or null, no change
    if (!current && !next) return false

    // If one is defined and the other isn't, there's a change
    if (!current || !next) return true

    // Compare metadata objects by stringifying them
    // This is a simple comparison - for more complex metadata structures,
    // a deep comparison function would be more appropriate
    return JSON.stringify(current) !== JSON.stringify(next)
  }
}
