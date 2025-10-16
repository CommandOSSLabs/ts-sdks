// Query keys
export const queryKeys = {
  storageCost: (fileSize: number, epochs: number) => [
    'storageCost',
    fileSize,
    epochs
  ],
  currentEpoch: () => ['currentEpoch'],
  suiBalance: (address?: string) => ['suiBalance', address],
  walBalance: (address?: string) => ['walBalance', address]
} as const
