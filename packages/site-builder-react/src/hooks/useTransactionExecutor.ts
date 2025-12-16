import {
  type ISignAndExecuteTransaction,
  type ISponsorConfig,
  TransactionExecutorService
} from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { useMemo } from 'react'

export interface UseTransactionExecutorParams {
  suiClient: SuiClient
  walletAddress: string | undefined
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

/**
 * React hook to create a TransactionExecutorService instance.
 * Automatically handles sponsor configuration and wallet changes.
 */
export function useTransactionExecutor({
  suiClient,
  walletAddress,
  signAndExecuteTransaction,
  sponsorConfig
}: UseTransactionExecutorParams) {
  return useMemo(() => {
    if (!walletAddress) return null

    return new TransactionExecutorService({
      suiClient,
      walletAddress,
      signAndExecuteTransaction,
      sponsorConfig
    })
  }, [suiClient, walletAddress, signAndExecuteTransaction, sponsorConfig])
}
