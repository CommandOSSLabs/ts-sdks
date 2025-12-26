export const queryKeys = {
  suinsDomains: (address: string | undefined, network: string) =>
    ['suins-domains', address, network] as const,
  suinsDomainDetail: (name: string, network: string) =>
    ['suins-domain-detail', name, network] as const,
  walrusSite: (siteId: string | undefined) => ['walrus-site', siteId] as const,
  walrusSites: (address: string | undefined, network: string) =>
    ['walrus-sites', address, network] as const,
  storageCost: (fileSize: number | null, epochs: number) =>
    ['storage-cost', fileSize, epochs] as const
} as const
