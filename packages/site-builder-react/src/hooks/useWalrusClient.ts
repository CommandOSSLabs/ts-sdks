import { isSupportedNetwork } from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'
import { useMemo } from 'react'

const WALRUS_WASM_CDN =
  'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm'

export function useWalrusClient(
  suiClient: SuiClient | null
): WalrusClient | null {
  return useMemo(() => {
    if (typeof window === 'undefined') return null // SSR check
    if (!suiClient) return null
    const network = suiClient.network || 'testnet'
    if (!isSupportedNetwork(network)) return null
    return new WalrusClient({
      network,
      suiClient,
      wasmUrl: WALRUS_WASM_CDN
      // uploadRelay: {
      //   timeout: 600000,
      //   host: `https://upload-relay.${network}.walrus.space`,
      //   sendTip: {
      //     max: 100000000
      //   }
      // }
    })
  }, [suiClient])
}
