export const queryKeys = {
  suinsDomains: (address: string | undefined, network: string) =>
    ['suins-domains', address, network] as const,
  suinsDomainDetail: (name: string, network: string) =>
    ['suins-domain-detail', name, network] as const,
  walrusSite: (siteId: string | undefined) => ['walrus-site', siteId] as const,
  storageCost: (fileSize: number, epochs: number) =>
    ['storage-cost', fileSize, epochs] as const,
  // biome-ignore lint/complexity/noBannedTypes: no issue
  assetsSize: (onPrepareAssets: Function) =>
    ['assets-size', onPrepareAssets] as const
} as const
