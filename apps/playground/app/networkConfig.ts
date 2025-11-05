import { createNetworkConfig } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl('testnet'),
      name: 'testnet',
      network: 'testnet' as const,
      appUrl: 'https://wal-0-dev.cmdoss.xyz',
      WAL_COIN_TYPE_TESTNET:
        '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL'
    },
    mainnet: {
      url: getFullnodeUrl('mainnet'),
      name: 'mainnet',
      network: 'mainnet' as const,
      appUrl: 'https://wal-0.cmdoss.xyz',
      WAL_COIN_TYPE_MAINNET:
        '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL'
    }
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }
