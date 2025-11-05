import { useContext } from 'react'
import { WalrusClientContext } from '~/providers/WalrusClientContext'

export function useWalrusClient() {
  return useContext(WalrusClientContext)
}
