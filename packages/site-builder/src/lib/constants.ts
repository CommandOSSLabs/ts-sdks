export const mainPackage = {
  // Latest Walrus Site Package, get from https://raw.githubusercontent.com/MystenLabs/walrus-sites/refs/heads/mainnet/sites-config.yaml
  mainnet: {
    packageId:
      '0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27',
    aggregator: 'https://aggregator.walrus-mainnet.walrus.space',
    walrusCoinType:
      '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
    walrusPackageId:
      '0xfa65cb2d62f4d39e60346fb7d501c12538ca2bbc646eaa37ece2aec5f897814e'
  },
  testnet: {
    packageId:
      '0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799',
    aggregator: 'https://aggregator.walrus-testnet.walrus.space',
    walrusCoinType:
      '0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL',
    walrusPackageId:
      '0xa998b8719ca1c0a6dc4e24a859bbb39f5477417f71885fbf2967a6510f699144'
  }
}
