import type { SuiTransactionBlockResponse } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import type {
  SignedTransaction,
  SuiSignAndExecuteTransactionInput,
  SuiSignTransactionInput
} from '@mysten/wallet-standard'

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

// export declare function useSignTransaction({ mutationKey, ...mutationOptions }?: UseSignTransactionMutationOptions): UseMutationResult<UseSignTransactionResult, UseSignTransactionError, UseSignTransactionArgs>;
// export {};

/**
 * The function used to sign transactions.
 *
 * Get by calling `useSignTransaction` hook in `'@mysten/dapp-kit'`.
 */
type UseSignTransactionArgs = PartialBy<
  Omit<SuiSignTransactionInput, 'transaction'>,
  'account' | 'chain'
> & {
  transaction: Transaction | string
}
/**
 * The function used to sign and execute transactions.
 *
 * Get by calling `useSignAndExecuteTransaction` hook in `'@mysten/dapp-kit'`.
 */
export type ISignAndExecuteTransaction = (
  variables: UseSignAndExecuteTransactionArgs
) => Promise<SuiTransactionBlockResponse>

/**
 * The function used to sign transactions.
 */
export type ISignTransaction = (
  variables: UseSignTransactionArgs
) => Promise<SignedTransaction>

/**
 * The function used to sponsor transactions.
 */
export interface ISponsorConfig {
  /**
   * The API client used to sponsor transactions.
   */
  apiClient: ISponsorApiClient | null
  /**
   * The function used to sign transactions.
   */
  signTransaction: ISignTransaction
}

/**
 * The API client used to sponsor transactions.
 */
export interface ISponsorApiClient {
  sponsorTransaction: ({
    transaction
  }: {
    transaction: Transaction
  }) => Promise<{ bytes: string; digest: string }>
  executeTransaction: ({
    digest,
    signature
  }: {
    digest: string
    signature: string
  }) => Promise<{ digest: string }>
}

// ##########################################################################
// #region Core Entity Types
// ##########################################################################

/**
 * Information about a transaction executed during the deploy flow.
 */
export interface ITransaction {
  digest: string
  description: string
  timestamp: number
}

/**
 * Information about a certified blob.
 *
 * This struct mirrors the information that is stored on chain.
 */
export interface ICertifiedBlob {
  blobId: string
  suiObjectId: string
  endEpoch: number
  patchId: string
  identifier: string
  blobHash: string
}

// #endregion

// ##########################################################################
// #region Configuration Types
// ##########################################################################

/**
 * Callback invoked when a file is changed (added, updated, or removed)
 */
export type FileChangedCallback = (arg: {
  type: 'updated' | 'removed'
  path: string
}) => void

/**
 * File Manager interface for managing site files.
 */
export interface IFileManager extends IReadOnlyFileManager {
  /** Write a file to the workspace */
  writeFile(path: string, content: Uint8Array): Promise<void>
  /** Delete a file from the workspace */
  deleteFile(path: string): Promise<void>
}

/**
 * Read-only File Manager interface for reading site files.
 */
export interface IReadOnlyFileManager {
  /** Initialize the file manager */
  initialize(): Promise<void>
  /** Read a file from the workspace */
  readFile(path: string): Promise<Uint8Array>
  /** List all files in the workspace recursively */
  listFiles(): Promise<string[]>
  /** Get the total size of all files in the workspace */
  getSize(): Promise<number>
  /** The workspace path */
  readonly workspaceDir: string
}

/**
 * The routes for a site
 */
export type Routes = Array<[string, string]>

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
  headers?: { key: string; value: string }[]
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
  headers: Array<{ key: string; value: string }>
  /** The blob ID of the resource as a U256 (U256 from 32 little endian bytes). */
  blob_id: string
  /** The hash of the blob contents as a U256 (U256 from 32 little endian bytes). */
  blob_hash: string
  /** Byte ranges for the resource. */
  range?: { start?: number; end?: number }
}

// #endregion

// ##########################################################################
// #region Site Data Types
// ##########################################################################

/**
 * Walrus Site Data. Used for fetching existing site data and computing diffs.
 */
export interface SiteData {
  resources: SuiResource[]
  routes?: Routes
  metadata?: Metadata
  site_name?: string
}

/**
 * Calculated Walrus Site Data Diff. Used for building transactions and updates operations.
 */
export interface SiteDataDiff {
  resources: { op: 'created' | 'deleted' | 'unchanged'; data: SuiResource }[]
  routes: { op: 'noop' } | { op: 'update'; data: Routes }
  metadata: { op: 'noop' } | { op: 'update'; data: Metadata }
  site_name: { op: 'noop' } | { op: 'update'; data: string }
}

/**
 * Asset to be deployed.
 *
 * @deprecated Use `IReadOnlyFileManager` to pass assets instead.
 */
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

/**
 * Represents the deployment flow for a Walrus site.
 *
 * When the transactions to upload a blob are signed by a wallet in a browser,
 * some wallets will use popups to prompt the user for a signature. If the
 * popups are not opened in direct response to a user interaction,
 * they may be blocked by the browser.
 *
 * To avoid this, we need to ensure that we execute the transactions that
 * register and certify the blob in separate events handlers by creating
 * separate buttons for the user to click for each step.
 */
export interface IUpdateWalrusSiteFlow {
  /**
   * Prepares the site's resources for deployment.
   */
  prepareResources(): Promise<void>

  /**
   * Writes the site's resources to Walrus.
   * @param epochs The number of epochs to store the blobs for.
   * @param permanent Make the stored resources permanent.
   */
  writeResources(epochs: number | 'max', permanent?: boolean): Promise<void>

  /**
   * Certifies the written resources.
   */
  certifyResources(): Promise<{ certifiedBlobs: ICertifiedBlob[] }>

  /**
   * Update the Walrus Site on-chain with the certified resources and metadata.
   * @return The site ID after the update.
   */
  writeSite(): Promise<{ siteId: string }>

  /** Get the list of transactions executed during the flow */
  getTransactions(): ITransaction[]
}

// #endregion

// ##########################################################################
// #region SDK Types
// ##########################################################################

/**
 * Walrus Site Builder SDK interface.
 */
export interface IWalrusSiteBuilderSdk {
  /**
   * Start a deploy flow for deploying a Walrus Site.
   */
  executeSiteUpdateFlow(
    target: IReadOnlyFileManager,
    wsResource?: WSResources
  ): IUpdateWalrusSiteFlow
}

// #endregion
