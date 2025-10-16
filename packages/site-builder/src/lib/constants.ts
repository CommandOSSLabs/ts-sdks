import type { Config } from '../types'

export const QUILT_PATCH_ID_INTERNAL_HEADER = 'x-wal-quilt-patch-internal-id'

export const mainPackage: Config = {
  // Latest Walrus Site Package, get from https://raw.githubusercontent.com/MystenLabs/walrus-sites/refs/heads/mainnet/sites-config.yaml
  mainnet: {
    packageId:
      '0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27'
  },
  testnet: {
    packageId:
      '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799'
  }
}
