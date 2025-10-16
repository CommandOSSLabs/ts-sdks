'use client'

import { createNetworkConfig } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'

const { networkConfig, useNetworkConfig } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
    name: 'testnet',
    network: 'testnet' as const
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
    name: 'mainnet',
    network: 'mainnet' as const
  }
})

export { networkConfig, useNetworkConfig }
