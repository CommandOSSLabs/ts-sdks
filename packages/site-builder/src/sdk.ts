import type { SuiClient } from '@mysten/sui/client'
import type { WalrusClient } from '@mysten/walrus'
import { UpdateWalrusSiteFlow } from './deploy-flow'
import type {
  IAsset,
  ISignAndExecuteTransaction,
  ISponsorConfig,
  IUpdateWalrusSiteFlow,
  IWalrusSiteBuilderSdk,
  WSResources
} from './types'

/**
 * SDK for publishing Walrus Sites.
 */
export class WalrusSiteBuilderSdk implements IWalrusSiteBuilderSdk {
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
  ) {}

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
}
