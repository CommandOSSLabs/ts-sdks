import type { SuiClient } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import {
  type WalrusClient,
  WalrusFile,
  type WriteFilesFlow
} from '@mysten/walrus'
import debug from 'debug'
import { mainPackage } from './lib/constants'
import { QUILT_PATCH_ID_INTERNAL_HEADER } from './lib/internal-constants'
import { getSiteIdFromResponse } from './lib/onchain-data-helpers'
import { extractPatchHex } from './lib/path-id'
import { hasUpdate } from './lib/site-data.utils'
import { buildSiteCreationTx } from './lib/tx-builder'
import { blobIdBase64ToU256, isSupportedNetwork } from './lib/utils'
import { fetchBlobsPatches } from './queries/blobs-patches.query'
import { SiteService } from './services/site.service'
import { TransactionExecutorService } from './services/transaction-executor.service'
import type {
  ICertifiedBlob,
  IReadOnlyFileManager,
  ISignAndExecuteTransaction,
  ISponsorConfig,
  ITransaction,
  IUpdateWalrusSiteFlow,
  SiteDataDiff,
  WSResources
} from './types'

const log = debug('site-builder:deploy-flow')

interface IState {
  files?: Record<string, WalrusFile>
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
  private siteSvc: SiteService
  private txExecutor: TransactionExecutorService

  constructor(
    /**
     * The Walrus client used for interacting with the Walrus API.
     */
    private walrus: WalrusClient,
    /**
     * The Sui client used for interacting with the Sui API.
     */
    private suiClient: SuiClient,
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
     * The sponsor configuration for handling sponsored transactions.
     */
    private sponsorConfig: ISponsorConfig | undefined,
    /**
     * The active wallet address.
     */
    private walletAddr: string
  ) {
    this.siteSvc = new SiteService(this.suiClient)
    this.txExecutor = new TransactionExecutorService({
      suiClient: this.suiClient,
      walletAddress: this.walletAddr,
      signAndExecuteTransaction: this.signAndExecuteTransaction,
      sponsorConfig: this.sponsorConfig
    })

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

  async prepareResources(): Promise<SiteDataDiff> {
    log('📦 Preparing files for upload...')
    const filesPaths = await this.target.listFiles()
    if (filesPaths.length === 0) throw new Error('Empty site')

    const files: Record<string, WalrusFile> = {}
    for (const path of filesPaths) {
      log('» Reading file', path)
      const contents = await this.target.readFile(path)
      files[path] = WalrusFile.from({ contents, identifier: path })
    }
    this.state.files = files

    const diff = await this.siteSvc.calculateSiteDiff(
      Object.values(files),
      this.wsResource
    )
    this.state.siteUpdates = diff
    return diff
  }

  async encodeResources(): Promise<void> {
    const diff = this.state.siteUpdates
    const files = this.state.files
    if (!diff) throw new Error('Must prepare resources first')
    if (!files) throw new Error('No files to encode')

    const changedFiles =
      diff.resources
        .filter(r => r.op === 'created')
        .map(r => files[r.data.path]) || []

    // Step 1: Prepare the files for upload (only changed files)
    this.state.writeFilesFlow = this.walrus.writeFilesFlow({
      files: changedFiles
    })

    log('🎼 Encoding', changedFiles.length, 'files...', changedFiles)
    await this.state.writeFilesFlow.encode()
    log('✅ Files encoded successfully')
  }

  async writeResources(
    epochs: number | 'max',
    permanent = false
  ): Promise<void> {
    log('🚀 Starting asset upload...')
    const { writeFilesFlow } = this.state
    if (!writeFilesFlow) throw new Error('Must encode resources first')

    // Step 2: Register the blob (triggered by user clicking a register button after the encode step)
    log('📝 Registering blob on chain...', { epochs, permanent })
    const tx = writeFilesFlow.register({
      deletable: !permanent,
      epochs: epochs === 'max' ? 57 : epochs,
      owner: this.walletAddr
    })

    const digest = await this.txExecutor.execute({
      transaction: tx,
      description: 'Register blob on Walrus network',
      onTransactionRecorded: this.#recordTransaction.bind(this)
    })

    // Step 3: Upload the data to storage nodes
    // This can be done immediately after the register step, or as a separate step the user initiates
    log('☁️ Uploading data to storage nodes...')
    await writeFilesFlow.upload({ digest })
    log('✅ Data uploaded successfully')
  }

  async certifyResources(): Promise<void> {
    log('🔐 Starting asset certification...')
    const { writeFilesFlow } = this.state
    if (!writeFilesFlow) throw new Error('Write files flow not initialized')

    const certifyTx = writeFilesFlow.certify()

    await this.txExecutor.execute({
      transaction: certifyTx,
      description: 'Certify blob storage',
      onTransactionRecorded: this.#recordTransaction.bind(this)
    })

    log('✅ Assets certified successfully')
    await this.#fetchAndUpdateBlobPatches()
  }

  /** Fetches patches for certified blobs and updates the site data accordingly */
  async #fetchAndUpdateBlobPatches() {
    const certifiedFiles = await this.state.writeFilesFlow?.listFiles()
    if (!certifiedFiles?.length) throw new Error('No certified files found')
    log('📁 Certified files:', certifiedFiles)

    const uniqueBlobIds = Array.from(new Set(certifiedFiles.map(f => f.blobId)))
    log('🔄 Fetching patches for blob IDs:', uniqueBlobIds)
    const patches = await fetchBlobsPatches(
      uniqueBlobIds,
      this.suiClient.network
    )
    log('🧩 Fetched patches:', patches)

    const fileIdentifierByPatchId = new Map(
      patches.map(p => [p.patch_id, p.identifier])
    )
    const hashByBlobId = new Map(
      this.state.siteUpdates?.resources
        .filter(a => a.op === 'created')
        .map(a => [a.data.path, a.data.blob_hash]) || []
    )

    const blobs: Array<ICertifiedBlob> = certifiedFiles.map(
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
    this.state.siteUpdates?.resources.forEach(r => {
      if (r.op !== 'created') return
      const patchId = patchIdByPath.get(r.data.path)
      const blobId = blobIdByPath.get(r.data.path)
      if (!patchId) {
        log(`Blob ID for ${r.data.path} not found`)
        return
      }
      if (!blobId) {
        log(`Blob ID for ${r.data.path} not found`)
        return
      }
      r.data.blob_id = blobIdBase64ToU256(blobId).toString()
      r.data.headers.push({
        key: QUILT_PATCH_ID_INTERNAL_HEADER,
        value: extractPatchHex(patchId)
      })
    })
    log(
      '✅ Updated state SiteData with certified files',
      this.state.siteUpdates
    )
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

    const res = await this.txExecutor.executeWithResponse({
      transaction: tx,
      description: 'Update Walrus site metadata',
      onTransactionRecorded: this.#recordTransaction.bind(this)
    })

    console.log('🔍 Transaction response:', res)

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
  #recordTransaction(transaction: ITransaction): void {
    if (!this.state.transactions) {
      this.state.transactions = []
    }
    this.state.transactions.push(transaction)
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

    const network = this.suiClient.network
    if (!isSupportedNetwork(network))
      throw new Error(`Unsupported network: ${network}`)
    const packageId = mainPackage[network].packageId

    return buildSiteCreationTx(siteId, siteUpdates, packageId, ownerAddr)
  }
}
