import { WalrusFile, type WriteFilesFlow } from '@mysten/walrus'
import { QUILT_PATCH_ID_INTERNAL_HEADER } from './lib/constatnts'
import { extractPatchHex } from './lib/path-id'
import { blobIdBase64ToU256, getSiteIdFromResponse } from './lib/utils'
import type {
  IAsset,
  ICertifiedBlob,
  IFlowListener,
  ITransaction,
  IWalrusSiteBuilderSdk,
  SiteData,
  SiteDataDiff,
  WSResources
} from './types'

interface IState {
  siteData?: SiteData
  siteUpdates?: SiteDataDiff
  writeFilesFlow?: WriteFilesFlow
  certifiedBlobs: ICertifiedBlob[]
  transactions: ITransaction[]
}

/**
 * Response item for a patch in a quilt.
 *
 * > Fetched from https://github.com/MystenLabs/walrus/blob/main/crates/walrus-service/aggregator_openapi.yamlv1/quilts/{quilt_id}/patches
 */
interface QuiltPatchItem {
  /** The identifier of the patch (e.g., filename). */
  identifier: string
  /** The QuiltPatchId for this patch, encoded as URL-safe base64. */
  patch_id: string
  /** Tags for the patch. */
  tags: Record<string, string>
}

const DEFAULT_AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space'

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

function isUpdateRequired(diff: SiteDataDiff): boolean {
  if (diff.metadata_op !== 'noop') return true
  if (diff.site_name_op !== 'noop') return true
  if (diff.route_ops.length) return true
  if (diff.resource_ops.length) return true
  return false
}

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
export class WalrusSiteDeployFlow extends EventTarget {
  private state: IState = {
    transactions: [],
    certifiedBlobs: []
  }

  constructor(
    /**
     * The WalrusSiteBuilderSdk instance.
     *
     * Used interface to avoid circular dependency issues.
     */
    private sdk: IWalrusSiteBuilderSdk,
    /**
     * The assets to be deployed.
     */
    public assets: IAsset[],
    /**
     * The resources associated with the site.
     */
    public siteSettings: WSResources = {}
  ) {
    super()
    // Bind methods
    for (const method of [
      'prepareAssets',
      'uploadAssets',
      'certifyAssets',
      'updateSite',
      'cleanupAssets'
    ] satisfies (keyof WalrusSiteDeployFlow)[]) {
      // biome-ignore lint/suspicious/noExplicitAny: no issue
      this[method] = this[method].bind(this) as any
    }
  }

  // @ts-expect-error: Override the addEventListener method to provide strong typing for event listeners
  public override addEventListener<K extends keyof FlowEvents>(
    type: K,
    listener: IFlowListener<K>,
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener as EventListener, options)
  }
  /**
   * Get the list of recorded transactions.
   */
  getTransactions(): ITransaction[] {
    return this.state.transactions
  }

  /**
   * Record a transaction with its description.
   */
  #recordTransaction(digest: string, description: string): void {
    if (!this.state.transactions) {
      this.state.transactions = []
    }
    const transaction = {
      digest,
      description,
      timestamp: Date.now()
    }
    this.state.transactions.push(transaction)
    this.dispatchEvent(
      new CustomEvent('transaction', { detail: { transaction } })
    )
  }

  #emitProgress(status: DeployStatus, message?: string) {
    console.log(`[DeployFlow] Status: ${DeployStatus[status]}`, message || '')
    this.dispatchEvent(
      new CustomEvent('progress', { detail: { status, message } })
    )
  }

  /**
   * Prepares the assets for deployment.
   */
  async prepareAssets(): Promise<void> {
    if (this.assets.length === 0)
      return this.#emitProgress(DeployStatus.Failed, 'No assets to prepare')

    if (this.assets.some(a => !a.path.startsWith('/')))
      return this.#emitProgress(
        DeployStatus.Failed,
        'All asset paths must start with a leading slash (/)'
      )

    this.#emitProgress(
      DeployStatus.Preparing,
      'Preparing assets for deployment'
    )
    console.log('🚀 sdk', this.sdk, this.assets, this.siteSettings)
    const siteData = await this.sdk.getSiteData(this.assets, this.siteSettings)
    console.log('🚀 siteData', siteData)
    const siteId = this.siteSettings.object_id
    console.log('🚀 siteId', siteId)
    const siteUpdates = await this.sdk.getSiteUpdates({ siteData, siteId })
    console.log('🚀 siteUpdates', siteUpdates)
    console.log('🚀 siteData', siteData)
    this.state.siteUpdates = siteUpdates
    this.state.siteData = siteData

    if (!isUpdateRequired(siteUpdates))
      return this.#emitProgress(DeployStatus.Completed, 'Site is up to date')

    const files = siteUpdates.resource_ops
      .filter(op => op.type !== 'deleted')
      .map(op => this.assets.find(f => f.path === op.resource.full_path))
      .filter((f): f is IAsset => f !== undefined)
      .map(f => WalrusFile.from({ contents: f.content, identifier: f.path }))

    if (files.length === 0)
      return this.#emitProgress(DeployStatus.Completed, 'No assets')

    this.state.writeFilesFlow = this.sdk.walrus.writeFilesFlow({ files })

    console.log('📦 Preparing', files.length, 'files for upload')
    // Step 1: Create and encode the flow (can be done immediately when file is selected)
    this.#emitProgress(DeployStatus.Preparing, 'Encoding files for upload')
    await this.state.writeFilesFlow.encode()
    this.#emitProgress(DeployStatus.Preparing, 'Assets prepared')
  }

  /**
   * Uploads the assets to the server.
   */
  async uploadAssets(
    /**
     * The number of epochs to store the blobs for.
     *
     * Can be either a non-zero number of epochs or the special value `max`, which will store the blobs
     * for the maximum number of epochs allowed by the system object on chain.
     */
    epochs: number | 'max',
    /**
     * Make the stored resources permanent.
     *
     * By default, sites are deletable with site-builder delete command. By passing `true`,
     * the site is deleted only after `epochs` expiration. Make resources permanent
     * (non-deletable)
     */
    permanent: boolean = false
  ): Promise<void> {
    console.log('🚀 Starting asset upload...')
    const { siteUpdates, writeFilesFlow } = this.state
    console.log('🚀 Starting asset upload...', { siteUpdates, writeFilesFlow })
    if (!siteUpdates || !isUpdateRequired(siteUpdates)) {
      console.log('⏭️ No updates to upload')
      return
    }
    if (!writeFilesFlow)
      return this.#emitProgress(
        DeployStatus.Failed,
        'Must prepare assets before upload'
      )

    console.log('⚙️ Upload settings:', { epochs, permanent })

    const uploadCandidates = siteUpdates.resource_ops
      .filter(op => op.type !== 'deleted')
      .map(op => this.assets.find(f => f.path === op.resource.full_path))
      .filter((f): f is IAsset => f !== undefined)
      .map(f =>
        WalrusFile.from({
          contents:
            typeof f.content === 'string'
              ? new TextEncoder().encode(f.content)
              : f.content,
          identifier: f.path
        })
      )

    if (uploadCandidates.length === 0)
      return this.#emitProgress(
        DeployStatus.Completed,
        'No new or updated assets to upload'
      )

    console.log('📦 Uploading', uploadCandidates.length, 'files')
    // Step 2: Register the blob (triggered by user clicking a register button after the encode step)
    console.log('📝 Registering blob on chain...')
    const registerTx = writeFilesFlow.register({
      deletable: !permanent,
      epochs: epochs === 'max' ? 57 : epochs,
      owner: this.sdk.activeAccount.address
    })
    const { digest } = await this.sdk.signAndExecuteTransaction({
      transaction: registerTx
    })
    this.#recordTransaction(digest, 'Register blob on Walrus network')
    this.#emitProgress(
      DeployStatus.Updating,
      `Blob registered with digest: ${digest}`
    )

    // Step 3: Upload the data to storage nodes
    // This can be done immediately after the register step, or as a separate step the user initiates
    console.log('☁️ Uploading data to storage nodes...')
    await writeFilesFlow.upload({ digest })
    this.#emitProgress(DeployStatus.Uploading, 'Assets uploaded')
  }

  /**
   * Certifies the uploaded assets.
   */
  async certifyAssets(): Promise<ICertifiedBlob[]> {
    console.log('🔐 Starting asset certification...')
    const { siteUpdates, writeFilesFlow } = this.state
    if (!siteUpdates || !isUpdateRequired(siteUpdates) || !writeFilesFlow) {
      this.#emitProgress(DeployStatus.Failed, 'No updates to certify')
      return []
    }
    if (!writeFilesFlow) {
      this.#emitProgress(
        DeployStatus.Failed,
        'Must prepare and upload assets before certification'
      )
      return []
    }

    // Step 4: Certify the blob (triggered by user clicking a certify button after the blob is uploaded)
    this.#emitProgress(
      DeployStatus.Certifying,
      'Creating certification transaction...'
    )
    const certifyTx = writeFilesFlow.certify()
    const res = await this.sdk.signAndExecuteTransaction({
      transaction: certifyTx
    })
    this.#recordTransaction(res.digest, 'Certify blob storage')
    console.log('✅ Assets certified successfully', res)
    this.#emitProgress(
      DeployStatus.Certifying,
      `Assets certified with digest: ${res.digest}`
    )
    const files = await writeFilesFlow.listFiles()
    console.log('📁 Certified files:', files)
    const patches = await this.fetchBlobsPatches(
      // get unique blob IDs
      Array.from(new Set(files.map(f => f.blobId)))
    )
    console.log('🧩 Fetched patches:', patches)
    const fileIdentifierByPatchId = new Map(
      patches.map(p => [p.patch_id, p.identifier])
    )
    const hashByBlobId = new Map(
      this.state.siteData?.resources.map(a => [
        a.full_path,
        a.info.blob_hash_le_u256
      ]) || []
    )
    const blobs: Array<ICertifiedBlob> = files.map(
      (file): ICertifiedBlob => ({
        patchId: file.id,
        blobId: file.blobId,
        suiObjectId: file.blobObject.id.id,
        endEpoch: file.blobObject.storage.end_epoch,
        identifier: fileIdentifierByPatchId.get(file.id) || 'unknown',
        blobHash:
          hashByBlobId.get(fileIdentifierByPatchId.get(file.id) || '') ?? 0n
      })
    )
    console.log('✅ Certified blobs:', blobs)
    this.state.certifiedBlobs = blobs
    if (this.state.siteData) {
      console.log('🔄 Updating site data with certified blobs...')

      const patchIdByPath = new Map(blobs.map(b => [b.identifier, b.patchId]))
      const blobIdByPath = new Map(blobs.map(b => [b.identifier, b.blobId]))
      this.state.siteData.resources.forEach(r => {
        const patchId = patchIdByPath.get(r.full_path)
        const blobId = blobIdByPath.get(r.full_path)
        if (!patchId) {
          console.warn(`Blob ID for ${r.full_path} not found`)
          return
        }
        if (!blobId) {
          console.warn(`Blob ID for ${r.full_path} not found`)
          return
        }
        r.info.blob_id = blobId
        r.info.blob_id_le_u256 = blobIdBase64ToU256(blobId)
        r.info.headers[QUILT_PATCH_ID_INTERNAL_HEADER] =
          extractPatchHex(patchId)
      })
      console.log(
        '✅ Updated site data with certified blobs',
        this.state.siteData
      )
    }

    return blobs
  }

  /**
   * Updates the site metadata.
   */
  async updateSite(): Promise<string | undefined> {
    console.log('🔄 Starting site update...')
    const { siteData } = this.state
    if (!siteData) {
      console.log('⏭️ No site data to update')
      return
    }

    console.log('🏗️ Updating site metadata...')
    const tx = this.sdk.createSiteUpdateTransaction({
      siteId: this.siteSettings.object_id,
      siteData,
      ownerAddr: this.sdk.activeAccount.address
    })

    const res = await this.sdk.signAndExecuteTransaction({ transaction: tx })
    this.#recordTransaction(res.digest, 'Update Walrus site metadata')
    console.log('✅ Site updated successfully', res)
    const siteId = getSiteIdFromResponse(this.sdk.activeAccount.address, res)
    if (siteId) {
      console.log('📍 Site ID:', siteId)
      this.siteSettings.object_id = siteId
      return siteId
    } else {
      console.warn('Could not find the object ID for the updated Walrus site!')
    }
  }

  /**
   * Removes unused assets.
   */
  async cleanupAssets(): Promise<void> {
    console.log('🧹 Starting asset cleanup...')
    const { siteUpdates } = this.state
    if (!siteUpdates || !isUpdateRequired(siteUpdates)) {
      console.log('⏭️ No cleanup needed')
      return
    }

    const deleteCandidates = siteUpdates.resource_ops
      .filter(op => op.type === 'deleted')
      .map(op => op.resource.info.blob_id)
    if (deleteCandidates.length === 0) {
      console.log('ℹ️ No assets to delete')
      return
    }

    console.log('🗑️ Deleting', deleteCandidates.length, 'unused assets')
    const deleteTransactions = deleteCandidates.map(id =>
      this.sdk.walrus.deleteBlobTransaction({
        owner: this.sdk.activeAccount.address,
        blobObjectId: id
      })
    )

    // Execute each delete transaction and record them
    for (let i = 0; i < deleteTransactions.length; i++) {
      const tx = deleteTransactions[i]
      const res = await this.sdk.signAndExecuteTransaction({ transaction: tx })
      this.#recordTransaction(
        res.digest,
        `Delete unused blob ${i + 1}/${deleteTransactions.length}`
      )
    }
    console.log('✅ Asset cleanup completed')
  }

  /**
   * Helps fetch patches for a list of blob IDs.
   */
  private async fetchBlobsPatches(blobIds: string[]) {
    const patches: Array<QuiltPatchItem> = []
    for (const blobId of blobIds) {
      const res = await fetch(
        `${DEFAULT_AGGREGATOR_URL}/v1/quilts/${blobId}/patches`
      )
      const items = (await res.json()) as Array<QuiltPatchItem>

      // add only unique patches
      patches.push(
        ...items.filter(p => !patches.some(pt => pt.patch_id === p.patch_id))
      )
    }
    return patches
  }
}
