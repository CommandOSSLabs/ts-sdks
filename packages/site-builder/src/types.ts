import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import type {
  SuiSignAndExecuteTransactionInput,
  WalletAccount,
  WalletWithRequiredFeatures
} from '@mysten/wallet-standard'
import type { WalrusClient } from '@mysten/walrus'

// ##########################################################################
// #region Helper Types
// ##########################################################################

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<T>
type UseSignAndExecuteTransactionArgs = PartialBy<
  Omit<SuiSignAndExecuteTransactionInput, 'transaction'>,
  'account' | 'chain'
> & {
  transaction: Transaction | string
}
type ISignAndExecuteTransaction = (
  variables: UseSignAndExecuteTransactionArgs
) => Promise<SuiTransactionBlockResponse>

// #endregion

// ##########################################################################
// #region Core Entity Types
// ##########################################################################

export interface ITransaction {
  digest: string
  description: string
  timestamp: number
}

export interface ICertifiedBlob {
  blobId: string
  suiObjectId: string
  endEpoch: number
  patchId: string
  identifier: string
  blobHash: bigint
}

// #endregion

// ##########################################################################
// #region Configuration Types
// ##########################################################################

export interface IWalrusSiteConfig {
  package: string
  gasBudget?: number
  checkExtend?: boolean
}

/**
 * The routes for a site
 */
export interface Routes {
  [pattern: string]: string
}

/**
 * Metadata associated with a site.
 */
export interface Metadata {
  link?: string
  image_url?: string
  description?: string
  project_url?: string
  creator?: string
}

/**
 * Walrus Site Resources & Metadata
 *
 * _(Deserialized object of the file's `ws-resource.json` contents from Walrus Site Builder Rust SDK.)_
 */
export interface WSResources {
  /** The HTTP headers to be set for the resources. */
  headers?: Record<string, string>
  /** The routes for a site. */
  routes?: Routes
  /** The attributes used inside the Display object. */
  metadata?: Metadata
  /** The name of the site. */
  site_name?: string
  /**
   * The object ID of the published site.
   *
   * This parameter is automatically set by the `deploy` command to store
   * the information about the Site object being used, so there is no need
   * to manually keep track of it.
   * On subsequent calls to the `deploy` command, this parameter is used
   * to update the site.
   */
  object_id?: string
  /**
   * The paths to ignore when publishing/updating.
   *
   * **NOTE**: Currently not supported by the Walrus Site Builder TS SDK.
   */
  ignore?: string[]
}

// #endregion

// ##########################################################################
// #region Resources Types
// ##########################################################################

/**
 * Information about a resource.
 *
 * This struct mirrors the information that is stored on chain.
 */
export interface SuiResource {
  /** The relative path the resource will have on Sui. */
  path: string
  /** Response, Representation and Payload headers. */
  headers: Record<string, string>
  /** The blob ID of the resource. */
  blob_id: string
  /** The blob ID of the resource as a U256 (U256 from 32 little endian bytes). */
  blob_id_le_u256: bigint
  /** The hash of the blob contents. */
  blob_hash: Uint8Array
  /** The hash of the blob contents as a U256 (U256 from 32 little endian bytes). */
  blob_hash_le_u256: bigint
  /** Byte ranges for the resource. */
  range?: { start?: number; end?: number }
}

// Resource and site data structures
export interface Resource {
  /** The full path of the resource on disk. */
  full_path: string
  // full_path: string
  // content: Blob
  // content_type: ContentType
  // content_encoding: ContentEncoding
  /** The unencoded length of the resource. */
  unencoded_size: number
  /** Additional information that is stored on chain */
  info: SuiResource
}

// #endregion

// ##########################################################################
// #region Site Data Types
// ##########################################################################

export interface SiteData {
  resources: Resource[]
  routes?: Routes
  metadata?: Metadata
  site_name?: string
}

export interface SiteDataDiff {
  resource_ops: Array<{
    type: 'created' | 'updated' | 'deleted'
    resource: Resource
  }>
  route_ops: Array<{
    type: 'created' | 'updated' | 'deleted'
    path: string
    resource?: string
  }>
  metadata_op: 'noop' | 'update'
  site_name_op: 'noop' | 'update'
}

export interface IAsset {
  path: string
  content: Uint8Array
  /** SHA-256 hash of the file content */
  hash: Uint8Array
  /** SHA-256 hash of the file content as U256 little-endian */
  hashU256: bigint
}

// #endregion

// ##########################################################################
// #region Deploy Flow Types
// ##########################################################################

enum DeployStatus {
  Idle,
  Preparing,
  Uploading,
  Certifying,
  Updating,
  CleaningUp,
  Completed,
  Failed
}

// Define the event map, associating event names with CustomEvent types
interface FlowEvents {
  progress: CustomEvent<{ status: DeployStatus; message?: string }>
  transaction: CustomEvent<{ transaction: ITransaction }>
}

export type IFlowListener<K extends keyof FlowEvents = keyof FlowEvents> = (
  event: FlowEvents[K]
) => void

export interface IWalrusSiteDeployFlow {
  /**
   * The assets to be deployed.
   */
  assets: IAsset[]

  /**
   * The resources associated with the site.
   */
  siteSettings: WSResources

  /**
   * Override addEventListener with strong typing for event listeners
   */
  addEventListener<K extends keyof FlowEvents>(
    type: K,
    listener: IFlowListener<K> | null,
    options?: boolean | AddEventListenerOptions
  ): void

  /**
   * Get the list of recorded transactions.
   */
  getTransactions(): ITransaction[]

  /**
   * Prepares the assets for deployment.
   */
  prepareAssets(): Promise<void>

  /**
   * Uploads the assets to the server.
   * @param epochs The number of epochs to store the blobs for.
   * @param permanent Make the stored resources permanent.
   */
  uploadAssets(epochs: number | 'max', permanent?: boolean): Promise<void>

  /**
   * Certifies the uploaded assets.
   */
  certifyAssets(): Promise<ICertifiedBlob[]>

  /**
   * Updates the site with the new assets.
   */
  updateSite(): Promise<string | undefined>

  /**
   * Cleans up temporary assets and resources.
   */
  cleanupAssets(): Promise<void>
}

// #endregion

// ##########################################################################
// #region SDK Types
// ##########################################################################

export interface IWalrusSiteBuilderSdk {
  /**
   * The Walrus client used for interacting with the Walrus API.
   */
  walrus: WalrusClient

  /**
   * The Sui client used for interacting with the Sui API.
   */
  sui: SuiClient

  /**
   * The active wallet account.
   */
  activeAccount: WalletAccount

  /**
   * The function used to sign and execute transactions.
   */
  signAndExecuteTransaction: ISignAndExecuteTransaction

  /**
   * The wallet used for interacting with the user's wallet.
   */
  wallet: WalletWithRequiredFeatures

  /**
   * The Walrus Site Builder SDK configuration.
   */
  config: IWalrusSiteConfig

  /**
   * Create a deploy flow for deploying a Walrus Site.
   */
  deployFlow(assets: IAsset[], wsResource?: WSResources): IWalrusSiteDeployFlow

  /**
   * Create transaction to update a Walrus Site
   */
  createSiteUpdateTransaction(params: {
    siteId?: string
    siteData: SiteData
    ownerAddr: string
  }): Transaction

  /**
   * Get site updates for a Walrus Site
   */
  getSiteUpdates(params: {
    siteData: SiteData
    siteId?: string
  }): Promise<SiteDataDiff>

  /**
   * Get the site data from the provided assets.
   * @param assets The assets to process.
   * @param wsResource The Walrus resources.
   * @returns The site data.
   */
  getSiteData(assets: IAsset[], wsResource: WSResources): Promise<SiteData>
}

// #endregion
