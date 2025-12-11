import type { WalrusClient } from '@mysten/walrus'
import { useEffect, useMemo, useState } from 'react'

export function useEpochDuration(walrusClient: WalrusClient | null) {
  const [epochDurationMs, setEpochDurationMs] = useState<number | null>(null)

  // Get epoch duration from Walrus staking state
  useEffect(() => {
    const fetchEpochDuration = async () => {
      if (!walrusClient) return

      try {
        const stakingState = await walrusClient.stakingState()
        const duration = Number(stakingState.epoch_duration)
        setEpochDurationMs(duration)
      } catch (error) {
        console.error('Error fetching epoch duration:', error)
        // Fallback to 1 day if fetch fails
        setEpochDurationMs(24 * 60 * 60 * 1000)
      }
    }

    fetchEpochDuration()
  }, [walrusClient])

  // Calculate expiration date
  const getExpirationDate = useMemo(() => {
    return (epochs: number) => {
      if (!epochDurationMs || !epochs || epochs <= 0) return null
      const now = Date.now()
      return new Date(now + epochs * epochDurationMs)
    }
  }, [epochDurationMs])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return {
    epochDurationMs,
    getExpirationDate,
    formatDate
  }
}
