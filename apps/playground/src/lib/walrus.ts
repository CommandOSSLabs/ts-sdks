import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { WalrusClient } from '@mysten/walrus'

export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet')
})

export const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  uploadRelay: {
    timeout: 600_000,
    host: 'https://upload-relay.testnet.walrus.space',
    sendTip: {
      max: 1_000
    }
  }
})
