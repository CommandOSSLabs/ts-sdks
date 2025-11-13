import { UpdateWalrusSiteFlow } from './deploy-flow'
import type {
  IReadOnlyFileManager,
  ISignAndExecuteTransaction,
  IUpdateWalrusSiteFlow,
  IWalrusSiteBuilderSdk,
  SuiClientWithWalrus,
  WSResources
} from './types'

/**
 * SDK for publishing Walrus Sites.
 */
export class WalrusSiteBuilderSdk implements IWalrusSiteBuilderSdk {
  constructor(
    /**
     * The Sui client used for interacting with the Sui API.
     * Must also have the Walrus extension.
     */
    public client: SuiClientWithWalrus,
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
    public signAndExecuteTransaction: ISignAndExecuteTransaction
  ) {}

  /**
   * Create a deploy flow for deploying a Walrus Site.
   */
  executeSiteUpdateFlow(
    target: IReadOnlyFileManager,
    wsResource: WSResources
  ): IUpdateWalrusSiteFlow {
    return new UpdateWalrusSiteFlow(
      this.client,
      target,
      wsResource,
      this.signAndExecuteTransaction,
      this.walletAddr
    )
  }
}
