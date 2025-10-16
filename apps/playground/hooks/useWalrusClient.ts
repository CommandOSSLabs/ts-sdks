'use client'

import { useContext } from 'react'
import { WalrusClientContext } from '@/providers/WalrusClientContext'

export const useWalrusClient = () => useContext(WalrusClientContext)
