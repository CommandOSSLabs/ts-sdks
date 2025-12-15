import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
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
import { SiteService } from './services/site.service'
import type {
  ICertifiedBlob,
  IReadOnlyFileManager,
  ISignAndExecuteTransaction,
  ISponsorConfig,
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
  private siteSvc: SiteService

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

    const files: Record<string, WalrusFile> = {}
    for (const path of filesPaths) {
      log('» Reading file', path)
      const contents = await this.target.readFile(path)
      files[path] = WalrusFile.from({ contents, identifier: path })
    }

    const diff = await this.siteSvc.calculateSiteDiff(
      Object.values(files),
      this.wsResource
    )
    log('✅ Site diff calculated', diff)

    if (!hasUpdate(diff)) {
      log('⏭️ No changes detected, skipping...')
      return
    }
    const changedFiles =
      diff.resources
        .filter(r => r.op === 'created')
        .map(r => files[r.data.path]) || []
    if (!changedFiles.length) {
      log('⏭️ No changed files detected, skipping...')
      // TODO: figure out how to skip to update site metadata
      return
    }
    log('⚡️ Detected', changedFiles.length, 'changed files:', changedFiles)

    // Step 1: Prepare the files for upload
    this.state.writeFilesFlow = this.walrus.writeFilesFlow({
      files: changedFiles
    })

    log('📦 Getting', changedFiles.length, 'files ready for upload...')
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

    let digest: string
    if (this.sponsorConfig?.apiClient) {
      digest = await this.#executeSponsoredTransaction(
        tx,
        'Register blob on Walrus network'
      )
    } else {
      digest = await this.#executeRegularTransaction(
        tx,
        'Register blob on Walrus network'
      )
    }

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

    if (this.sponsorConfig?.apiClient) {
      await this.#executeSponsoredTransaction(certifyTx, 'Certify blob storage')
    } else {
      const res = await this.signAndExecuteTransaction({
        transaction: certifyTx
      })
      this.#recordTransaction(res.digest, 'Certify blob storage')
      log('✅ Assets certified successfully', res)
    }

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

    let res: SuiTransactionBlockResponse
    if (this.sponsorConfig?.apiClient) {
      const digest = await this.#executeSponsoredTransaction(
        tx,
        'Update Walrus site metadata'
      )
      res = await this.suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true
        }
      })
      console.log('🔍 Sponsored transaction response:', res)
    } else {
      res = await this.signAndExecuteTransaction({ transaction: tx })
      console.log('🔍 Regular transaction response:', res)
      this.#recordTransaction(res.digest, 'Update Walrus site metadata')
    }

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
   * Handle sponsored transaction execution.
   */
  async #executeSponsoredTransaction(
    transaction: Transaction,
    description: string
  ): Promise<string> {
    if (!this.sponsorConfig?.apiClient) {
      throw new Error('Sponsor config not available')
    }

    log(`🎫 Executing sponsored transaction: ${description}`)

    // Step 1: Set sender
    transaction.setSenderIfNotSet(this.walletAddr)

    // Step 2: Request sponsorship
    const { bytes, digest: sponsorDigest } =
      await this.sponsorConfig.apiClient.sponsorTransaction({
        transaction
      })
    log(`✅ Transaction sponsored with digest: ${sponsorDigest}`)

    // Step 3: Sign the sponsored transaction
    const { signature } = await this.sponsorConfig.signTransaction({
      transaction: bytes
    })
    if (!signature) {
      throw new Error(
        'Failed to sign sponsored transaction: No signature returned'
      )
    }

    // Step 4: Execute the sponsored transaction
    const { digest: executeDigest } =
      await this.sponsorConfig.apiClient.executeTransaction({
        digest: sponsorDigest,
        signature: signature
      })
    log(`✅ Sponsored transaction executed: ${executeDigest}`)

    this.#recordTransaction(executeDigest, description)
    return executeDigest
  }

  /**
   * Handle regular (non-sponsored) transaction execution.
   */
  async #executeRegularTransaction(
    transaction: Transaction,
    description: string
  ): Promise<string> {
    const { digest } = await this.signAndExecuteTransaction({ transaction })
    this.#recordTransaction(digest, description)
    log(`✅ Regular transaction executed: ${digest}`)
    return digest
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
      : await getSiteDataFromChain(this.suiClient, siteId)

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

    const network = this.suiClient.network
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
    const patches = await fetchBlobsPatches(
      uniqueBlobIds,
      this.suiClient.network
    )
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
