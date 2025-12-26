import type { SuiClient } from '@mysten/sui/client'
import type { WalrusClient } from '@mysten/walrus'
import debug from 'debug'
import { UpdateWalrusSiteFlow } from './deploy-flow'
import { isSupportedNetwork, mainPackage } from './lib'
import { buildSiteCreationTx } from './lib/tx-builder'
import { TransactionExecutorService } from './services'
import { SiteService } from './services/site.service'
import type {
  IAsset,
  ISignAndExecuteTransaction,
  ISponsorConfig,
  IUpdateWalrusSiteFlow,
  IWalrusSiteBuilderSdk,
  WSResources
} from './types'

const log = debug('site-builder:sdk')

/**
 * SDK for publishing Walrus Sites.
 */
export class WalrusSiteBuilderSdk implements IWalrusSiteBuilderSdk {
  private txExecutor: TransactionExecutorService

  constructor(
    /**
     * The Walrus client used for interacting with the Walrus API.
     */
    public walrus: WalrusClient,
    /**
     * The Sui client used for interacting with the Sui API.
     */
    public suiClient: SuiClient,
    /**
     * The active wallet account.
     */
    public walletAddr: string,
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
    public signAndExecuteTransaction: ISignAndExecuteTransaction,
    /**
     * The function used to sign transactions.
     */
    public sponsorConfig?: ISponsorConfig
  ) {
    this.txExecutor = new TransactionExecutorService({
      suiClient,
      walletAddress: this.walletAddr,
      signAndExecuteTransaction,
      sponsorConfig
    })
  }

  /**
   * Create a deploy flow for deploying a Walrus Site.
   */
  executeSiteUpdateFlow(
    assets: IAsset[],
    wsResource: WSResources
  ): IUpdateWalrusSiteFlow {
    return new UpdateWalrusSiteFlow(
      this.walrus,
      this.suiClient,
      assets,
      wsResource,
      this.signAndExecuteTransaction,
      this.sponsorConfig,
      this.walletAddr
    )
  }

  async updateSiteMetadata(
    siteId: string,
    siteName: string,
    metadata: WSResources['metadata']
  ): Promise<string> {
    const siteSvc = new SiteService(this.suiClient)
    const siteUpdates = await siteSvc.calculateSiteDiff([], {
      object_id: siteId,
      site_name: siteName,
      metadata
    })

    log('🔄 Starting site update...')

    const network = this.suiClient.network
    if (!isSupportedNetwork(network))
      throw new Error(`Unsupported network: ${network}`)
    const packageId = mainPackage[network].packageId

    const tx = buildSiteCreationTx(
      siteId,
      siteUpdates,
      packageId,
      this.walletAddr
    )

    const res = await this.txExecutor.executeWithResponse({
      transaction: tx,
      description: 'Update Walrus site metadata'
    })

    console.log('🔍 Transaction response:', res)
    return res.digest
  }
}
