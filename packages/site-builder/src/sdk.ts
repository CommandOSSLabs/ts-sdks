import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import type {
  SuiSignAndExecuteTransactionInput,
  WalletAccount,
  WalletWithRequiredFeatures
} from '@mysten/wallet-standard'
import type { WalrusClient } from '@mysten/walrus'
import { WalrusSiteDeployFlow } from './deploy-flow'
import { SiteManager } from './manager'
import { ResourceManager } from './resource'
import type {
  IAsset,
  IWalrusSiteBuilderSdk,
  IWalrusSiteDeployFlow,
  SiteData,
  SiteDataDiff,
  WSResources
} from './types'

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

interface IWalrusSiteConfig {
  package: string
  gasBudget?: number
  checkExtend?: boolean
}

const DEFAULT_WALRUS_SITE_CONFIG: IWalrusSiteConfig = {
  // Latest Walrus Site Package, get from https://raw.githubusercontent.com/MystenLabs/walrus-sites/refs/heads/mainnet/sites-config.yaml
  package: '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799'
}

export class WalrusSiteBuilderSdk implements IWalrusSiteBuilderSdk {
  constructor(
    /**
     * The Walrus client used for interacting with the Walrus API.
     */
    public walrus: WalrusClient,
    /**
     * The Sui client used for interacting with the Sui API.
     */
    public sui: SuiClient,
    /**
     * The active wallet account.
     */
    public activeAccount: WalletAccount,
    /**
     * The function used to sign and execute transactions.
     *
     * Get by calling `useSignAndExecuteTransaction` hook.
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
     * The wallet used for interacting with the user's wallet.
     */
    public wallet: WalletWithRequiredFeatures,
    /**
     * The Walrus Site Builder SDK configuration.
     */
    public config: IWalrusSiteConfig = DEFAULT_WALRUS_SITE_CONFIG
  ) {}

  /**
   * Create a deploy flow for deploying a Walrus Site.
   */
  deployFlow(
    assets: IAsset[],
    wsResource: WSResources = {}
  ): IWalrusSiteDeployFlow {
    return new WalrusSiteDeployFlow(this, assets, wsResource)
  }

  /**
   * Create transaction to update a Walrus Site
   */
  createSiteUpdateTransaction({
    ownerAddr,
    siteData,
    siteId
  }: {
    siteId?: string
    siteData: SiteData
    ownerAddr: string
  }): Transaction {
    return new SiteManager(this.walrus, this.sui).createSiteUpdateTransaction(
      siteData,
      ownerAddr,
      siteId
    )
  }

  async getSiteUpdates({
    siteData,
    siteId
  }: {
    siteData: SiteData
    siteId?: string
  }): Promise<SiteDataDiff> {
    return new SiteManager(this.walrus, this.sui).getSiteUpdates(
      siteData,
      siteId
    )
  }

  /**
   * Get the site data from the provided assets.
   * @param assets The assets to process.
   * @returns The site data.
   */
  async getSiteData(
    assets: IAsset[],
    wsResource: WSResources
  ): Promise<SiteData> {
    const resourceManager = new ResourceManager(this.walrus, wsResource)
    return resourceManager.getSiteData(assets)
  }
}
