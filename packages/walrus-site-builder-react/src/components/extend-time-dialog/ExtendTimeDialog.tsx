import type {
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/walrus-site-builder'
import { mainPackage } from '@cmdoss/walrus-site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import type { WalletAccount } from '@mysten/wallet-standard'
import {
  MAINNET_WALRUS_PACKAGE_CONFIG,
  TESTNET_WALRUS_PACKAGE_CONFIG,
  type WalrusClient
} from '@mysten/walrus'
import { useStore } from '@nanostores/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Info, Loader2, X } from 'lucide-react'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEpochDuration, useTransactionExecutor } from '~/hooks'
import { useWalrusSiteQuery } from '~/queries/walrus-site.query'
import { isExtendTimeDialogOpen } from '~/stores/site-domain.store'
import { Banner } from '../ui'
import { Button } from '../ui/Button'
import { Input, Label } from '../ui/Input'
import * as styles from './ExtendTimeDialog.css'

interface ExtendTimeDialogProps {
  siteId: string | undefined
  currentAccount: WalletAccount | null
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    walrusClient: WalrusClient
  }
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
  onSuccess?: (message: string, digest: string) => void
}

const ExtendTimeDialog: FC<ExtendTimeDialogProps> = ({
  siteId,
  currentAccount,
  clients: { suiClient, queryClient, walrusClient },
  signAndExecuteTransaction,
  sponsorConfig,
  onSuccess
}) => {
  const isOpen = useStore(isExtendTimeDialogOpen)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [epochs, setEpochs] = useState<number>(1)
  const [isExtending, setIsExtending] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const [currentEpochsRemaining, setCurrentEpochsRemaining] = useState<
    number | null
  >(null)
  const [expirationDates, setExpirationDates] = useState<Map<string, Date>>(
    new Map()
  )

  const { epochDurationMs, formatDate } = useEpochDuration(walrusClient)
  const txExecutor = useTransactionExecutor({
    suiClient,
    walletAddress: currentAccount?.address,
    signAndExecuteTransaction,
    sponsorConfig
  })

  const { data: siteData } = useWalrusSiteQuery(siteId, {
    suiClient,
    queryClient
  })

  // Function to fetch expiration dates
  const fetchExpirationDates = useCallback(async () => {
    if (!siteId || !walrusClient || !currentAccount || !siteData?.resources) {
      return
    }

    try {
      const blobType = await walrusClient.getBlobType()
      const datesMap = new Map<string, Date>()

      // Get staking state once before the loop
      const stakingState = await walrusClient.stakingState()
      const currentEpoch = Number(stakingState.epoch)
      const epochDuration = Number(stakingState.epoch_duration)

      let cursor: string | null | undefined = null
      let hasNextPage = true

      while (hasNextPage) {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: blobType },
          options: { showContent: true },
          cursor
        })

        for (const resource of siteData.resources) {
          const blobId = resource.blob_id
          if (datesMap.has(blobId)) continue

          for (const obj of ownedObjects.data) {
            if (obj.data?.content && 'fields' in obj.data.content) {
              const fields = obj.data.content.fields as Record<string, unknown>
              if ('blob_id' in fields) {
                const objBlobId = String(fields.blob_id)
                if (objBlobId === blobId) {
                  const storage = fields.storage as
                    | {
                        fields?: { end_epoch?: unknown }
                      }
                    | undefined

                  if (storage?.fields?.end_epoch !== undefined) {
                    const endEpoch = Number(storage.fields.end_epoch)
                    const remainingEpochs = endEpoch - currentEpoch
                    const expirationTime =
                      Date.now() + remainingEpochs * epochDuration
                    datesMap.set(blobId, new Date(expirationTime))
                    break
                  }
                }
              }
            }
          }
        }

        hasNextPage = ownedObjects.hasNextPage
        cursor = ownedObjects.nextCursor
      }

      setExpirationDates(datesMap)
    } catch (error) {
      console.error('Error fetching expiration dates:', error)
    }
  }, [siteId, walrusClient, currentAccount, suiClient, siteData])

  // Query blob expiration dates
  useEffect(() => {
    if (isOpen && siteId) {
      fetchExpirationDates()
    }
  }, [isOpen, siteId, fetchExpirationDates])

  // Calculate current expiration date (earliest expiration from all resources)
  const currentExpiredDateMemo = useMemo(() => {
    if (!siteData?.resources || siteData.resources.length === 0) {
      return null
    }

    const timestamps = siteData.resources
      .map(resource => expirationDates.get(resource.blob_id)?.getTime())
      .filter((timestamp): timestamp is number => typeof timestamp === 'number')

    if (timestamps.length === 0) {
      return null
    }

    return new Date(Math.min(...timestamps))
  }, [siteData?.resources, expirationDates])

  // Calculate current epochs remaining
  useEffect(() => {
    if (!currentExpiredDateMemo || !epochDurationMs) {
      setCurrentEpochsRemaining(null)
      return
    }

    const now = Date.now()
    if (currentExpiredDateMemo.getTime() <= now) {
      setCurrentEpochsRemaining(0)
      return
    }

    const remaining = Math.ceil(
      (currentExpiredDateMemo.getTime() - now) / epochDurationMs
    )
    setCurrentEpochsRemaining(remaining)
  }, [currentExpiredDateMemo, epochDurationMs])

  // Calculate min and max dates for date picker
  const minDate = useMemo(() => {
    if (!epochDurationMs || !currentExpiredDateMemo) return ''
    const now = Date.now()
    const currentExpiration = currentExpiredDateMemo.getTime()

    // Min date is either current expiration or now + 1 epoch, whichever is later
    const minEpochs = 1
    const minFromNow = now + minEpochs * epochDurationMs
    const minTimestamp = Math.max(currentExpiration, minFromNow)

    return new Date(minTimestamp).toISOString().slice(0, 10)
  }, [epochDurationMs, currentExpiredDateMemo])

  const maxDate = useMemo(() => {
    if (!epochDurationMs || !currentExpiredDateMemo) return ''
    const currentExpiration = currentExpiredDateMemo.getTime()
    const maxEpochs = 365
    const maxTimestamp = currentExpiration + maxEpochs * epochDurationMs
    return new Date(maxTimestamp).toISOString().slice(0, 10)
  }, [epochDurationMs, currentExpiredDateMemo])

  // Calculate epochs from selected date
  const calculateEpochsFromDate = (dateString: string) => {
    if (!epochDurationMs || !dateString || !currentExpiredDateMemo) return 1

    const targetTime = new Date(dateString).getTime()
    const currentExpiration = currentExpiredDateMemo.getTime()
    const diffMs = targetTime - currentExpiration

    if (diffMs <= 0) return 1

    // Calculate epochs and round up
    const exactEpochs = diffMs / epochDurationMs
    const roundedEpochs = Math.ceil(exactEpochs)

    // Clamp between 1 and 365
    return Math.max(1, Math.min(365, roundedEpochs))
  }

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    setDateError(null)

    if (!newDate) {
      setEpochs(1)
      return
    }

    const calculatedEpochs = calculateEpochsFromDate(newDate)
    setEpochs(calculatedEpochs)
  }

  // Get projected date from epochs
  const projectedDate = useMemo(() => {
    if (!epochDurationMs || !currentExpiredDateMemo) return null
    const currentExpiration = currentExpiredDateMemo.getTime()
    const projectedTimestamp = currentExpiration + epochs * epochDurationMs
    return new Date(projectedTimestamp)
  }, [epochs, currentExpiredDateMemo, epochDurationMs])

  // Initialize selected date when dialog opens
  useEffect(() => {
    if (isOpen && epochDurationMs && currentExpiredDateMemo) {
      // Default to current expiration + 1 epoch
      const defaultTimestamp =
        currentExpiredDateMemo.getTime() + epochDurationMs
      const defaultDate = new Date(defaultTimestamp).toISOString().slice(0, 10)
      setSelectedDate(defaultDate)
      setEpochs(1)
      setDateError(null)
    }
  }, [isOpen, epochDurationMs, currentExpiredDateMemo])

  const handleExtend = useCallback(async () => {
    if (
      !walrusClient ||
      !currentAccount ||
      !siteData?.resources ||
      siteData.resources.length === 0 ||
      !siteId
    ) {
      setDateError('Cannot extend blobs: missing required data')
      return
    }

    if (!epochs || epochs <= 0 || epochs > 365) {
      setDateError('Invalid epoch count. Must be between 1 and 365')
      return
    }

    if (!selectedDate) {
      setDateError('Please select an expiration date')
      return
    }

    if (!txExecutor) {
      setDateError('Transaction executor not available')
      return
    }

    setIsExtending(true)
    setDateError(null)

    try {
      const blobType = await walrusClient.getBlobType()
      const network = suiClient.network

      // Determine network-specific constants
      const walCoinType =
        mainPackage[network as keyof typeof mainPackage]?.walrusCoinType
      const walrusPackageId =
        mainPackage[network as keyof typeof mainPackage]?.walrusPackageId
      const systemObjectId =
        network === 'mainnet'
          ? MAINNET_WALRUS_PACKAGE_CONFIG.systemObjectId
          : TESTNET_WALRUS_PACKAGE_CONFIG.systemObjectId

      if (!walCoinType || !walrusPackageId) {
        throw new Error('Network configuration not found')
      }

      // Map blob_id to blobObjectId
      const blobIdToObjectIdMap = new Map<string, string>()
      let cursor: string | null | undefined = null
      let hasNextPage = true

      while (hasNextPage) {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: blobType },
          options: { showContent: true },
          cursor
        })

        for (const resource of siteData.resources) {
          const blobId = resource.blob_id
          if (blobIdToObjectIdMap.has(blobId)) continue

          for (const obj of ownedObjects.data) {
            if (obj.data?.content && 'fields' in obj.data.content) {
              const fields = obj.data.content.fields as Record<string, unknown>
              if ('blob_id' in fields) {
                const objBlobId = String(fields.blob_id)
                if (objBlobId === blobId) {
                  blobIdToObjectIdMap.set(blobId, obj.data.objectId)
                  break
                }
              }
            }
          }
        }

        hasNextPage = ownedObjects.hasNextPage
        cursor = ownedObjects.nextCursor
      }

      if (blobIdToObjectIdMap.size === 0) {
        throw new Error(
          'No blob objects found for this site. Make sure you own the blob objects.'
        )
      }

      const tx = new Transaction()
      tx.setSender(currentAccount.address)

      const walCoin = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: walCoinType
      })

      if (walCoin.data.length === 0) {
        throw new Error(
          'No WAL coins found in wallet. Please acquire WAL tokens first.'
        )
      }

      // Merge all WAL coins
      if (walCoin.data.length > 1) {
        tx.mergeCoins(
          tx.object(walCoin.data[0].coinObjectId),
          walCoin.data.slice(1).map(coin => tx.object(coin.coinObjectId))
        )
      }

      // Extend all blobs by adding epochs to their current expiration
      for (const [_blobId, objectId] of blobIdToObjectIdMap.entries()) {
        tx.moveCall({
          package: walrusPackageId,
          module: 'system',
          function: 'extend_blob',
          arguments: [
            tx.object(systemObjectId),
            tx.object(objectId),
            tx.pure.u32(epochs),
            tx.object(walCoin.data[0].coinObjectId)
          ]
        })
      }

      const digest = await txExecutor.execute({
        transaction: tx,
        description: `Extending ${blobIdToObjectIdMap.size} blob(s) by ${epochs} epoch(s)`
      })

      // Wait for transaction to complete
      await suiClient.waitForTransaction({ digest })

      // Invalidate queries to refetch updated data
      await queryClient.invalidateQueries({
        predicate: query => {
          const key = query.queryKey
          return (
            (Array.isArray(key) &&
              (key[0] === 'walrus-site' || key[0] === 'walrus-sites')) ||
            false
          )
        }
      })

      // Refresh expiration dates to reflect the extension
      await fetchExpirationDates()

      // Show success message
      const successMessage = `Successfully extended ${blobIdToObjectIdMap.size} blob(s) by ${epochs} epoch(s)`
      onSuccess?.(successMessage, digest)

      // Close dialog and reset
      isExtendTimeDialogOpen.set(false)
      setSelectedDate('')
      setEpochs(1)
      setDateError(null)
    } catch (error) {
      console.error('Error extending blobs:', error)
      setDateError(
        `Failed to extend: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsExtending(false)
    }
  }, [
    walrusClient,
    currentAccount,
    siteData,
    siteId,
    epochs,
    selectedDate,
    txExecutor,
    suiClient,
    queryClient,
    onSuccess,
    fetchExpirationDates
  ])

  const handleClose = () => {
    isExtendTimeDialogOpen.set(false)
    setSelectedDate('')
    setEpochs(1)
    setDateError(null)
  }

  if (!siteId || !siteData) {
    return null
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          {/* Loading Overlay */}
          {isExtending && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingContent}>
                <Loader2 className={styles.spinner} />
                <p>Extending storage time...</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Extend Time for {siteData.name}
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              Add epochs to extend the storage time for blobs in this site.
              Epochs will be added to the current expiration time.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" className={styles.closeButton}>
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className={styles.body}>
            {/* Expired Warning Banner */}
            {currentEpochsRemaining === 0 && (
              <Banner
                title="Site Expired"
                description="This site has expired and cannot be extended. The blobs are no longer available on the Walrus network."
                variant="warning"
              />
            )}

            {/* Info Banner */}
            {currentEpochsRemaining !== 0 && (
              <Banner
                title="How Extension Works"
                description="Select a target expiration date. The system will calculate the required epochs to extend your blobs to that date. Duration is rounded up to the nearest epoch."
                variant="info"
              />
            )}

            <div className={styles.formSection}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="expiration-date">Target Expiration Date</Label>
                <div className={styles.dateInputWrapper}>
                  <Input
                    id="expiration-date"
                    type="date"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={handleDateChange}
                    disabled={currentEpochsRemaining === 0 || isExtending}
                    className={dateError ? styles.inputError : ''}
                  />
                </div>

                {/* Compact Info */}
                {epochDurationMs && (
                  <div className={styles.infoText}>
                    <Info size={14} />
                    <span>
                      1 epoch ≈{' '}
                      {(epochDurationMs / (1000 * 60 * 60 * 24)).toFixed(1)}{' '}
                      days • Duration rounded up. Maximum 365 epochs per extend.
                    </span>
                  </div>
                )}
                {dateError && <p className={styles.errorText}>{dateError}</p>}
              </div>

              {/* Summary Cards */}
              <div className={styles.summaryGrid}>
                {/* Current Expiration Card */}
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <Calendar size={14} />
                    <span>Current Expiration</span>
                  </div>
                  {currentExpiredDateMemo ? (
                    <div className={styles.summaryContent}>
                      <div className={styles.summaryValue}>
                        {formatDate(currentExpiredDateMemo)}
                      </div>
                      {currentEpochsRemaining !== null &&
                        currentEpochsRemaining > 0 && (
                          <div className={styles.summarySubtext}>
                            {currentEpochsRemaining} epoch
                            {currentEpochsRemaining !== 1 ? 's' : ''} remaining
                          </div>
                        )}
                      {currentEpochsRemaining === 0 && (
                        <div className={styles.summaryError}>Expired</div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.summaryValue}>Unavailable</div>
                  )}
                </div>

                {/* Projected Expiration Card */}
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <Clock size={14} />
                    <span>New Expiration Date</span>
                  </div>
                  {projectedDate ? (
                    <div className={styles.summaryContent}>
                      <div className={styles.summaryValue}>
                        {formatDate(projectedDate)}
                      </div>
                      {currentEpochsRemaining !== null && (
                        <div className={styles.summarySubtext}>
                          {currentEpochsRemaining} →{' '}
                          {currentEpochsRemaining + epochs} epochs (+{epochs}{' '}
                          epoch{epochs !== 1 ? 's' : ''})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.summaryValue}>Select a date</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExtending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtend}
              disabled={
                isExtending ||
                !epochs ||
                !selectedDate ||
                !!dateError ||
                currentEpochsRemaining === 0
              }
            >
              {isExtending ? 'Extending...' : 'Extend Time'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ExtendTimeDialog
