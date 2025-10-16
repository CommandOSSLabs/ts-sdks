import { useContext } from 'react'
import { WalrusClientContext } from '@/providers/WalrusClientContext'

export function useWalrusClient() {
  const context = useContext(WalrusClientContext)
  if (!context) throw new Error('WalrusClientProvider not found.')

  return context
}
