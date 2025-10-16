'use client'

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { networkConfig } from '@/app/networkConfig'
import { SuiNsClientProvider } from '@/providers/SuiNsClientProvider'
import { WalrusClientProvider } from '@/providers/WalrusClientContext'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <SuiClientProvider>
          <WalrusClientProvider>
            <SuiNsClientProvider>
              <WalletProvider autoConnect>{children}</WalletProvider>
            </SuiNsClientProvider>
          </WalrusClientProvider>
        </SuiClientProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
