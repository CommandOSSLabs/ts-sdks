import { useContext } from 'react'
import { SuiNsClientContext } from '~/providers/SuiNsClientProvider'

export function useSuiNsClient() {
  return useContext(SuiNsClientContext)
}
