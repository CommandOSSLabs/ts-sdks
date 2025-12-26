import {
  Transaction,
  type TransactionArgument,
  type TransactionObjectArgument,
  type TransactionResult
} from '@mysten/sui/transactions'
import type { Metadata, SuiResource } from '~/types'

export class WalrusSiteTransaction extends Transaction {
  constructor(
    /** Walrus Site Package ID */
    public packageId: string
  ) {
    super()
  }

  /** Create New Range Option */
  site_newRangeOption(range?: {
    start?: number
    end?: number
  }): TransactionObjectArgument {
    return this.moveCall({
      target: `${this.packageId}::site::new_range_option`,
      arguments: [
        this.pure.option('u64', range?.start),
        this.pure.option('u64', range?.end)
      ]
    })
  }

  /** Create New Resource */
  site_newResource(
    data: SuiResource,
    rangeObj?: TransactionArgument
  ): TransactionObjectArgument {
    return this.moveCall({
      target: `${this.packageId}::site::new_resource`,
      arguments: [
        this.pure.string(data.path),
        this.pure.u256(data.blob_id),
        this.pure.u256(data.blob_hash),
        ...(rangeObj ? [rangeObj] : [])
      ]
    })
  }

  /** Create New Metadata */
  site_newMetadata(data: Metadata): TransactionResult {
    return this.moveCall({
      target: `${this.packageId}::metadata::new_metadata`,
      arguments: [
        this.pure.option('string', data.link),
        this.pure.option('string', data.image_url),
        this.pure.option('string', data.description),
        this.pure.option('string', data.project_url),
        this.pure.option('string', data.creator)
      ]
    })
  }

  /** Create New Site */
  site_newSite(name: string, metadata: TransactionArgument) {
    return this.moveCall({
      target: `${this.packageId}::site::new_site`,
      arguments: [this.pure.string(name), metadata]
    })
  }

  /** Update Site Name */
  site_updateName(site: TransactionObjectArgument, name: string) {
    return this.moveCall({
      target: `${this.packageId}::site::update_name`,
      arguments: [site, this.pure.string(name)]
    })
  }

  /** Add Header to Resource */
  site_addHeader(
    resource: TransactionObjectArgument,
    key: string,
    value: string
  ) {
    return this.moveCall({
      target: `${this.packageId}::site::add_header`,
      arguments: [resource, this.pure.string(key), this.pure.string(value)]
    })
  }

  /** Add Resource to Site */
  site_addResource(
    site: TransactionObjectArgument,
    resource: TransactionObjectArgument
  ) {
    return this.moveCall({
      target: `${this.packageId}::site::add_resource`,
      arguments: [site, resource]
    })
  }

  site_createRoutes(site: TransactionObjectArgument) {
    return this.moveCall({
      target: `${this.packageId}::site::create_routes`,
      arguments: [site]
    })
  }

  site_insertRoute(
    site: TransactionObjectArgument,
    name: string,
    value: string
  ) {
    return this.moveCall({
      target: `${this.packageId}::site::insert_route`,
      arguments: [site, this.pure.string(name), this.pure.string(value)]
    })
  }

  /**
   * Adds the move calls to remove the routes object.
   */
  site_remoteRoutes(site: TransactionObjectArgument) {
    return this.moveCall({
      target: `${this.packageId}::site::remove_all_routes_if_exist`,
      arguments: [site]
    })
  }

  /** @deprecated Use site_remoteRoutes instead */
  site_removeAllRoutesIfExist(site: TransactionObjectArgument) {
    return this.moveCall({
      target: `${this.packageId}::site::remove_all_routes_if_exist`,
      arguments: [site]
    })
  }

  site_updateMetadata(
    site: TransactionObjectArgument,
    metadata: TransactionArgument
  ) {
    return this.moveCall({
      target: `${this.packageId}::site::update_metadata`,
      arguments: [site, metadata]
    })
  }

  site_removeResourceIfExists(
    site: TransactionObjectArgument,
    resourcePath: string
  ) {
    return this.moveCall({
      target: `${this.packageId}::site::remove_resource_if_exists`,
      arguments: [site, this.pure.string(resourcePath)]
    })
  }

  /** Burn the site */
  site_burn(site: TransactionObjectArgument) {
    return this.moveCall({
      target: `${this.packageId}::site::burn`,
      arguments: [site]
    })
  }
}
