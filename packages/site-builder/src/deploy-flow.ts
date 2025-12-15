import type { SuiClient } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import {
  type WalrusClient,
  WalrusFile,
  type WriteFilesFlow
} from '@mysten/walrus'
import debug from 'debug'
import { mainPackage } from './lib/constants'
import { getSiteIdFromResponse } from './lib/onchain-data-helpers'
import { hasUpdate } from './lib/site-data.utils'
import { buildSiteCreationTx } from './lib/tx-builder'
import { isSupportedNetwork } from './lib/utils'
import { SiteService } from './services/site.service'
import type {
  IReadOnlyFileManager,
  ISignAndExecuteTransaction,
  ITransaction,
  IUpdateWalrusSiteFlow,
  SiteDataDiff,
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

    const diff = await this.siteSvc.calculateSiteDiff(
      Object.values(files),
      this.wsResource
    )
    this.state.siteUpdates = diff

    if (!hasUpdate(diff)) {
      log('⏭️ No changes detected, skipping...')
      return diff
    }
    const changedFiles =
      diff.resources
        .filter(r => r.op === 'created')
        .map(r => files[r.data.path]) || []
    log('⚡️ Detected', changedFiles.length, 'changed files:', changedFiles)

    // Step 1: Prepare the files for upload (only changed files)
    this.state.writeFilesFlow = this.walrus.writeFilesFlow({
      files: changedFiles
    })

    log('📦 Getting', changedFiles.length, 'files ready for upload...')
    await this.state.writeFilesFlow.encode()
    log('✅ Files prepared successfully')
    return diff
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

  async certifyResources(): Promise<void> {
    log('🔐 Starting asset certification...')
    const { writeFilesFlow } = this.state
    if (!writeFilesFlow) throw new Error('Write files flow not initialized')

    const certifyTx = writeFilesFlow.certify()
    const res = await this.signAndExecuteTransaction({ transaction: certifyTx })
    this.#recordTransaction(res.digest, 'Certify blob storage')
    log('✅ Assets certified successfully', res)
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
