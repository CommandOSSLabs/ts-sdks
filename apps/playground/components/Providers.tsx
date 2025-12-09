'use client'

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClientProvider } from '@tanstack/react-query'
import { networkConfig } from '@/app/networkConfig'
import '@cmdoss/site-builder-react/styles.css'
import '@mysten/dapp-kit/dist/index.css'
import { getQueryClient } from '@/app/get-query-client'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
