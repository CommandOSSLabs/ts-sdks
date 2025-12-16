import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import type { Transaction } from '@mysten/sui/transactions'
import { toBase64 } from '@mysten/sui/utils'
import debug from 'debug'
import type {
  ISignAndExecuteTransaction,
  ISponsorConfig,
  ITransaction
} from '../types'

const log = debug('site-builder:transaction-executor')

export interface TransactionExecutorOptions {
  suiClient: SuiClient
  walletAddress: string
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

export interface ExecuteTransactionOptions {
  transaction: Transaction
  description: string
  /**
   * Callback to record transaction history
   */
  onTransactionRecorded?: (transaction: ITransaction) => void
}

/**
 * Service for executing transactions with optional sponsor support.
 * Centralizes transaction execution logic to avoid code duplication.
 */
export class TransactionExecutorService {
  constructor(private options: TransactionExecutorOptions) {}

  /**
   * Execute a transaction with automatic sponsor detection.
   * Returns the transaction digest.
   */
  async execute({
    transaction,
    description,
    onTransactionRecorded
  }: ExecuteTransactionOptions): Promise<string> {
    const digest = this.options.sponsorConfig
      ? await this.#executeSponsoredTransaction(transaction, description)
      : await this.#executeRegularTransaction(transaction, description)

    onTransactionRecorded?.({
      digest,
      description,
      timestamp: Date.now()
    })

    return digest
  }

  /**
   * Execute a transaction and return the full response.
   * Useful when you need to extract data from the response.
   */
  async executeWithResponse({
    transaction,
    description,
    onTransactionRecorded
  }: ExecuteTransactionOptions): Promise<SuiTransactionBlockResponse> {
    let response: SuiTransactionBlockResponse

    if (this.options.sponsorConfig) {
      const digest = await this.#executeSponsoredTransaction(
        transaction,
        description
      )
      response = await this.options.suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
          showObjectChanges: true
        }
      })
    } else {
      response = await this.options.signAndExecuteTransaction({ transaction })
    }

    onTransactionRecorded?.({
      digest: response.digest,
      description,
      timestamp: Date.now()
    })

    return response
  }

  /**
   * Check if sponsor is enabled
   */
  get isSponsorEnabled(): boolean {
    return !!this.options.sponsorConfig
  }

  /**
   * Handle sponsored transaction execution.
   */
  async #executeSponsoredTransaction(
    transaction: Transaction,
    description: string
  ): Promise<string> {
    const { sponsorConfig, walletAddress, suiClient } = this.options

    if (!sponsorConfig?.apiClient) {
      throw new Error('Sponsor config not available')
    }

    log(`🎫 Executing sponsored transaction: ${description}`)

    // Step 1: Set sender
    transaction.setSenderIfNotSet(walletAddress)

    // Step 2: Build transaction bytes
    const txBytes = await transaction.build({
      client: suiClient,
      onlyTransactionKind: true
    })

    // Step 3: Request sponsorship
    const { bytes, digest: sponsorDigest } =
      await sponsorConfig.apiClient.sponsorTransaction({
        txBytes: toBase64(txBytes),
        sender: walletAddress
      })
    log(`✅ Transaction sponsored with digest: ${sponsorDigest}`)

    // Step 4: Sign the sponsored transaction
    const { signature } = await sponsorConfig.signTransaction({
      transaction: bytes
    })
    if (!signature) {
      throw new Error(
        'Failed to sign sponsored transaction: No signature returned'
      )
    }

    // Step 5: Execute the sponsored transaction
    const { digest: executeDigest } =
      await sponsorConfig.apiClient.executeTransaction({
        digest: sponsorDigest,
        signature: signature
      })
    log(`✅ Sponsored transaction executed: ${executeDigest}`)

    return executeDigest
  }

  /**
   * Handle regular (non-sponsored) transaction execution.
   */
  async #executeRegularTransaction(
    transaction: Transaction,
    description: string
  ): Promise<string> {
    log(`📝 Executing regular transaction: ${description}`)
    const { digest } = await this.options.signAndExecuteTransaction({
      transaction
    })
    log(`✅ Regular transaction executed: ${digest}`)
    return digest
  }
}
