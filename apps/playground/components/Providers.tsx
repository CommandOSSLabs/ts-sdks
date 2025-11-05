'use client'

import {
  SuiNsClientProvider,
  WalrusClientProvider
} from '@cmdoss/site-builder-react'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { networkConfig } from '@/app/networkConfig'
import '@cmdoss/site-builder-react/styles.css'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalrusClientProvider>
          <SuiNsClientProvider>
            <WalletProvider autoConnect>{children}</WalletProvider>
          </SuiNsClientProvider>
        </WalrusClientProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
