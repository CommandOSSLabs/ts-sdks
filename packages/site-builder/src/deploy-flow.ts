import type { ClientWithExtensions } from '@mysten/sui/experimental'
import type { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import type { Transaction } from '@mysten/sui/transactions'
import {
  type WalrusClient,
  WalrusFile,
  type WriteFilesFlow
} from '@mysten/walrus'
import debug from 'debug'
import { contentTypeFromFilePath } from './content'
import { getSHA256Hash, sha256ToU256 } from './lib'
import { mainPackage } from './lib/constants'
import { QUILT_PATCH_ID_INTERNAL_HEADER } from './lib/internal-constants'
import { getSiteIdFromResponse } from './lib/onchain-data-helpers'
import { extractPatchHex } from './lib/path-id'
import { computeSiteDataDiff, hasUpdate } from './lib/site-data.utils'
import { buildSiteCreationTx } from './lib/tx-builder'
import { blobIdBase64ToU256, isSupportedNetwork } from './lib/utils'
import { fetchBlobsPatches } from './queries/blobs-patches.query'
import { getSiteDataFromChain } from './queries/site-data.query'
import type {
  ICertifiedBlob,
  IReadOnlyFileManager,
  ISignAndExecuteTransaction,
  ITransaction,
  IUpdateWalrusSiteFlow,
  SiteData,
  SiteDataDiff,
  SuiResource,
  WSResources
} from './types'

const log = debug('site-builder:deploy-flow')

interface IState {
  siteUpdates?: SiteDataDiff
  writeFilesFlow?: WriteFilesFlow
  transactions: ITransaction[]
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
export class UpdateWalrusSiteFlow implements IUpdateWalrusSiteFlow {
  private state: IState = { transactions: [] }

  constructor(
    /**
     * The Sui client used for interacting with the Sui API.
     * Must also have the Walrus extension.
     */
    private client: ClientWithExtensions<
      { walrus: WalrusClient },
      SuiJsonRpcClient
    >,
    /**
     * The target file manager containing assets to be deployed.
     */
    private target: IReadOnlyFileManager,
    /**
     * The Walrus Site resources information.
     */
    private wsResource: WSResources,
    /**
     * The function used to sign and execute transactions.
     *
     * Get by calling `useSignAndExecuteTransaction` hook in `'@mysten/dapp-kit'`.
     *
     * ```ts
     * const { mutateAsync: signAndExecuteTransaction } =
     *   useSignAndExecuteTransaction({
     *     execute: async ({ bytes, signature }) =>
     *       await suiClient.executeTransactionBlock({
     *         transactionBlock: bytes,
     *         signature,
     *         options: {
     *           // Raw effects are required so the effects can be reported back to the wallet
     *           showRawEffects: true,
     *           // Select additional data to return
     *           showObjectChanges: true
     *         }
     *       })
     *   })
     * ```
     */
    private signAndExecuteTransaction: ISignAndExecuteTransaction,
    /**
     * The active wallet address.
     */
    private walletAddr: string
  ) {
    // Bind methods
    for (const method of [
      'prepareResources',
      'writeResources',
      'certifyResources',
      'writeSite'
    ] satisfies (keyof UpdateWalrusSiteFlow)[]) {
      // biome-ignore lint/suspicious/noExplicitAny: no issue
      this[method] = this[method].bind(this) as any
    }
  }

  async prepareResources(): Promise<void> {
    log('📦 Preparing files for upload...')
    const filesPaths = await this.target.listFiles()
    if (filesPaths.length === 0) throw new Error('Empty site')

    const files: WalrusFile[] = []
    for (const path of filesPaths) {
      log('» Reading file', path)
      const contents = await this.target.readFile(path)
      files.push(WalrusFile.from({ contents, identifier: path }))
    }

    // Step 1: Prepare the files for upload
    this.state.writeFilesFlow = this.client.walrus.writeFilesFlow({ files })

    log('📦 Getting', files.length, 'files ready for upload...')
    await this.state.writeFilesFlow.encode()
    log('✅ Files prepared successfully')
  }

  async writeResources(
    epochs: number | 'max',
    permanent = false
  ): Promise<void> {
    log('🚀 Starting asset upload...')
    const { writeFilesFlow } = this.state
    if (!writeFilesFlow) throw new Error('Must prepare resources first')

    // Step 2: Register the blob (triggered by user clicking a register button after the encode step)
    log('📝 Registering blob on chain...', { epochs, permanent })
    const tx = writeFilesFlow.register({
      deletable: !permanent,
      epochs: epochs === 'max' ? 57 : epochs,
      owner: this.walletAddr
    })
    const { digest } = await this.signAndExecuteTransaction({ transaction: tx })
    this.#recordTransaction(digest, 'Register blob on Walrus network')
    log('✅ Blob registered successfully with digest:', digest)

    // Step 3: Upload the data to storage nodes
    // This can be done immediately after the register step, or as a separate step the user initiates
    log('☁️ Uploading data to storage nodes...')
    await writeFilesFlow.upload({ digest })
    log('✅ Data uploaded successfully')
  }

  async certifyResources(): Promise<{ certifiedBlobs: ICertifiedBlob[] }> {
    log('🔐 Starting asset certification...')
    const { writeFilesFlow } = this.state
    if (!writeFilesFlow) throw new Error('Write files flow not initialized')

    const certifyTx = writeFilesFlow.certify()
    const res = await this.signAndExecuteTransaction({ transaction: certifyTx })
    this.#recordTransaction(res.digest, 'Certify blob storage')
    log('✅ Assets certified successfully', res)

    const certifiedFiles = await writeFilesFlow.listFiles()
    log('📁 Certified files:', certifiedFiles)

    const { siteUpdates, certifiedBlobs } =
      await this.#calculateSiteUpdates(certifiedFiles)
    this.state.siteUpdates = siteUpdates
    return { certifiedBlobs }
  }

  async writeSite(): Promise<{ siteId: string }> {
    const { siteUpdates } = this.state
    if (!hasUpdate(siteUpdates)) {
      if (!this.wsResource.object_id) throw new Error('No data to create site')
      log('⏭️ No site updates to apply')
      return { siteId: this.wsResource.object_id }
    }
    log('🔄 Starting site update...')

    const tx = this.#createSiteUpdateTransaction({
      siteId: this.wsResource.object_id,
      siteUpdates,
      ownerAddr: this.walletAddr
    })
    const res = await this.signAndExecuteTransaction({ transaction: tx })
    // this.#recordTransaction(res.digest, 'Update Walrus site metadata')
    if (this.wsResource.object_id) {
      log('✅ Site updated successfully', res)
      return { siteId: this.wsResource.object_id }
    }

    const siteId = getSiteIdFromResponse(this.walletAddr, res)
    if (!siteId) throw new Error('Could not find site ID from response')
    log('✅ Created new Walrus site with ID:', siteId)
    this.wsResource.object_id = siteId
    return { siteId }
  }

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
  }

  async #getSiteUpdates(
    siteId: string | undefined,
    siteData: SiteData
  ): Promise<SiteDataDiff> {
    log('⚡️ Getting site updates')
    const existingSiteData = !siteId
      ? { resources: [] } // Empty site data for new site
      : await getSiteDataFromChain(this.client as SuiJsonRpcClient, siteId)

    return computeSiteDataDiff(siteData, existingSiteData)
  }

  /**
   * Calculate the site data from the provided assets.
   * @param target The file manager containing the site assets.
   * @param wsResource The Walrus Site resources.
   * @returns The site data.
   */
  async #getNextSiteData(
    target: IReadOnlyFileManager,
    wsResource: WSResources
  ): Promise<SiteData> {
    log('⚡️ Calculating site data from assets')
    const resources: SuiResource[] = []
    for (const path of await target.listFiles()) {
      const content = await target.readFile(path)
      const resource: SuiResource = {
        path: path,
        blob_id: '<unknown>', // Blob ID will be filled in after upload
        blob_hash: sha256ToU256(await getSHA256Hash(content)).toString(),
        headers: wsResource.headers ?? [
          { key: 'content-encoding', value: 'identity' },
          { key: 'content-type', value: contentTypeFromFilePath(path) }
        ]
      }
      log(`» Resource:`, resource)
      resources.push(resource)
    }
    return {
      resources,
      routes: wsResource.routes,
      site_name: wsResource.site_name,
      metadata: wsResource.metadata
    }
  }

  /**
   * Create transaction to update a Walrus Site
   */
  #createSiteUpdateTransaction({
    ownerAddr,
    siteUpdates,
    siteId
  }: {
    siteId: string | undefined
    siteUpdates: SiteDataDiff
    ownerAddr: string
  }): Transaction {
    log('⚡️ Creating site update transaction')

    const network = this.client.network
    if (!isSupportedNetwork(network))
      throw new Error(`Unsupported network: ${network}`)
    const packageId = mainPackage[network].packageId

    return buildSiteCreationTx(siteId, siteUpdates, packageId, ownerAddr)
  }

  async #calculateSiteUpdates(
    files: Awaited<ReturnType<WriteFilesFlow['listFiles']>>
  ) {
    log('🔄 Calculating site updates with certified files...')
    const uniqueBlobIds = Array.from(new Set(files.map(f => f.blobId)))
    log('🔄 Fetching patches for blob IDs:', uniqueBlobIds)
    const patches = await fetchBlobsPatches(uniqueBlobIds, this.client.network)
    log('🧩 Fetched patches:', patches)
    const fileIdentifierByPatchId = new Map(
      patches.map(p => [p.patch_id, p.identifier])
    )
    const siteId = this.wsResource.object_id
    const siteData = await this.#getNextSiteData(this.target, this.wsResource)
    const hashByBlobId = new Map(
      siteData.resources.map(a => [a.path, a.blob_hash]) || []
    )
    const blobs: Array<ICertifiedBlob> = files.map(
      (file): ICertifiedBlob => ({
        patchId: file.id,
        blobId: file.blobId,
        suiObjectId: file.blobObject.id.id,
        endEpoch: file.blobObject.storage.end_epoch,
        identifier: fileIdentifierByPatchId.get(file.id) || 'unknown',
        blobHash:
          hashByBlobId.get(fileIdentifierByPatchId.get(file.id) || '') ?? ''
      })
    )
    log('✅ Certified blobs:', blobs)

    log('🔄 Updating site data with certified files...')
    const patchIdByPath = new Map(blobs.map(b => [b.identifier, b.patchId]))
    const blobIdByPath = new Map(blobs.map(b => [b.identifier, b.blobId]))
    siteData.resources.forEach(r => {
      const patchId = patchIdByPath.get(r.path)
      const blobId = blobIdByPath.get(r.path)
      if (!patchId) {
        log(`Blob ID for ${r.path} not found`)
        return
      }
      if (!blobId) {
        log(`Blob ID for ${r.path} not found`)
        return
      }
      r.blob_id = blobIdBase64ToU256(blobId).toString()
      r.headers.push({
        key: QUILT_PATCH_ID_INTERNAL_HEADER,
        value: extractPatchHex(patchId)
      })
    })
    log('✅ Updated state SiteData with certified files', siteData)

    const siteUpdates = await this.#getSiteUpdates(siteId, siteData)
    log('✅ Calculated site updates:', siteUpdates)
    return { certifiedBlobs: blobs, siteUpdates }
  }
}
