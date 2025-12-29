import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk'
import type {
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/walrus-site-builder'
import { mainPackage } from '@cmdoss/walrus-site-builder'
import type { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { type SuinsClient, SuinsTransaction } from '@mysten/suins'
import type { WalletAccount } from '@mysten/wallet-standard'
import type { QueryClient } from '@tanstack/react-query'
import BN from 'bn.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTransactionExecutor } from './useTransactionExecutor'

interface UseSuiNsRegistrationParams {
  currentAccount: WalletAccount | null
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    suinsClient: SuinsClient
  }
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

export function useSuiNsRegistration({
  currentAccount,
  clients: { suiClient, queryClient, suinsClient },
  signAndExecuteTransaction,
  sponsorConfig
}: UseSuiNsRegistrationParams) {
  const txExecutor = useTransactionExecutor({
    suiClient,
    walletAddress: currentAccount?.address,
    signAndExecuteTransaction,
    sponsorConfig
  })

  const [searchName, setSearchName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedYears, setSelectedYears] = useState(1)
  const [pricePerYear, setPricePerYear] = useState<number | null>(null)
  const [pricePerYearFormatted, setPricePerYearFormatted] = useState<
    string | null
  >(null)
  const [pricePerYearUsdc, setPricePerYearUsdc] = useState<string | null>(null)
  const [totalPriceUsdc, setTotalPriceUsdc] = useState<string | null>(null)
  const priceRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const normalizedName = searchName.toLowerCase().trim()
  const fullName = normalizedName ? `${normalizedName}.sui` : ''
  const network = suiClient.network
  const isMainnet = network === 'mainnet'
  const isTestnet = network === 'testnet'

  // Calculate expiration date
  const expirationDate = useMemo(() => {
    if (!selectedYears) return null
    const date = new Date()
    date.setFullYear(date.getFullYear() + selectedYears)
    return date
  }, [selectedYears])

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!pricePerYear || !selectedYears) return null
    return pricePerYear * selectedYears
  }, [pricePerYear, selectedYears])

  // Format total price
  const totalPriceFormatted = useMemo(() => {
    if (!totalPrice || !pricePerYearFormatted) return null
    const perYearValue = parseFloat(
      pricePerYearFormatted.replace(/[^\d.]/g, '')
    )
    if (Number.isNaN(perYearValue)) return null
    const totalValue = perYearValue * selectedYears
    return pricePerYearFormatted.replace(/[\d.]+/, totalValue.toFixed(4))
  }, [totalPrice, pricePerYearFormatted, selectedYears])

  // Get WAL coin type from mainPackage
  const WAL_COIN_TYPE =
    mainPackage[network as keyof typeof mainPackage]?.walrusCoinType

  // Initialize Aggregator Client for swaps (mainnet only)
  const aggregatorClient = useMemo(() => {
    if (!suiClient || !currentAccount || !isMainnet) return null

    return new AggregatorClient({
      signer: currentAccount.address,
      client: suiClient,
      env: Env.Mainnet
    })
  }, [suiClient, currentAccount, isMainnet])

  // Function to update price estimate for mainnet (WAL → USDC)
  const updatePriceEstimate = useCallback(async () => {
    if (
      !suinsClient ||
      !currentAccount ||
      !isMainnet ||
      !WAL_COIN_TYPE ||
      !aggregatorClient ||
      !normalizedName
    ) {
      return
    }

    // Get price list
    const priceList = await suinsClient.getPriceList()
    const nameLength = normalizedName.length

    // Find price for this name length
    let pricePerYearValue = 0
    for (const [[from, to], price] of priceList.entries()) {
      if (nameLength >= from && nameLength <= to) {
        pricePerYearValue = price
        break
      }
    }

    if (pricePerYearValue > 0) {
      setPricePerYear(pricePerYearValue)

      // Calculate total price with buffer (5%)
      const totalPriceValue = pricePerYearValue * selectedYears
      const requiredAmount = BigInt(Math.floor(totalPriceValue * 1.05))

      // Get current USDC balance to calculate missing amount
      const usdcCoins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: suinsClient.config.coins.USDC.type
      })

      const usdcBalance =
        usdcCoins.data?.reduce((sum, coin) => sum + BigInt(coin.balance), 0n) ??
        0n

      // Calculate missing USDC (if any)
      const missingUsdc =
        usdcBalance < requiredAmount
          ? requiredAmount - usdcBalance
          : requiredAmount

      // Estimate WAL needed using same logic as register
      const baseWalAtomic = 1_000_000_000n // 1 WAL (9 decimals)
      const rateRouter = await aggregatorClient.findRouters({
        from: WAL_COIN_TYPE,
        target: suinsClient.config.coins.USDC.type,
        amount: new BN(baseWalAtomic.toString()),
        byAmountIn: true,
        providers: ['CETUS']
      })

      if (rateRouter && !rateRouter.error && rateRouter.amountOut) {
        const rawAmountOut = rateRouter.amountOut
        const usdcOutForOneWal = BigInt(
          rawAmountOut instanceof BN
            ? rawAmountOut.toString()
            : new BN(String(rawAmountOut)).toString()
        )

        if (usdcOutForOneWal > 0n) {
          const exchangeRate = Number(baseWalAtomic) / Number(usdcOutForOneWal)
          const estimatedWalNeeded =
            missingUsdc * BigInt(Math.ceil(exchangeRate))
          const walNeededFormatted = (
            Number(estimatedWalNeeded) / 1_000_000_000
          ).toFixed(4)
          const walPerYearFormatted = (
            Number(estimatedWalNeeded) /
            selectedYears /
            1_000_000_000
          ).toFixed(4)
          setPricePerYearFormatted(`${walPerYearFormatted} WAL`)
          setEstimatedPrice(`~${walNeededFormatted} WAL`)
        } else {
          // Fallback: show USDC price
          const usdcPrice = (Number(requiredAmount) / 1_000_000).toFixed(2)
          const usdcPerYear = (pricePerYearValue / 1_000_000).toFixed(2)
          setPricePerYearFormatted(`${usdcPerYear} USDC`)
          setEstimatedPrice(`~${usdcPrice} USDC`)
        }
      } else {
        // Fallback: show USDC price
        const usdcPrice = (Number(requiredAmount) / 1_000_000).toFixed(2)
        const usdcPerYear = (pricePerYearValue / 1_000_000).toFixed(2)
        setPricePerYearFormatted(`${usdcPerYear} USDC`)
        setEstimatedPrice(`~${usdcPrice} USDC`)
      }
    }
  }, [
    suinsClient,
    currentAccount,
    isMainnet,
    WAL_COIN_TYPE,
    aggregatorClient,
    normalizedName,
    selectedYears,
    suiClient
  ])

  // Function to update price estimate for testnet (USDC → SUI)
  // Uses fixed exchange rate: 1 SUI = 1.5 USDC (or 1 USDC = 2/3 SUI)
  const updateTestnetPriceEstimate = useCallback(async () => {
    if (!suinsClient || !currentAccount || !isTestnet || !normalizedName) {
      return
    }

    // Get price list (price is in USDC)
    const priceList = await suinsClient.getPriceList()
    const nameLength = normalizedName.length

    // Find price for this name length
    let pricePerYearValue = 0
    for (const [[from, to], price] of priceList.entries()) {
      if (nameLength >= from && nameLength <= to) {
        pricePerYearValue = price
        break
      }
    }

    if (pricePerYearValue > 0) {
      setPricePerYear(pricePerYearValue)

      // Calculate total price (USDC amount) - this is what needs to be paid
      const totalPriceValue = pricePerYearValue * selectedYears
      const usdcAmountAtomic = BigInt(Math.floor(totalPriceValue))

      // Fixed exchange rate: 1 SUI = 1.5 USDC
      // So 1 USDC = 2/3 SUI = 0.666666... SUI
      // To calculate: (usdcAmount * 2 * 10^9) / (3 * 10^6)
      // This gives us SUI amount with 9 decimals
      const suiNeededAtomic =
        (usdcAmountAtomic * 2n * 1_000_000_000n) / (3n * 1_000_000n)
      const suiPerYearAtomic =
        (BigInt(Math.floor(pricePerYearValue)) * 2n * 1_000_000_000n) /
        (3n * 1_000_000n)

      // Format for display (SUI has 9 decimals)
      const suiNeededFormatted = (
        Number(suiNeededAtomic) / 1_000_000_000
      ).toFixed(4)
      const suiPerYearFormatted = (
        Number(suiPerYearAtomic) / 1_000_000_000
      ).toFixed(4)

      // Also store USDC prices for display
      const usdcPrice = (Number(usdcAmountAtomic) / 1_000_000).toFixed(2)
      const usdcPerYear = (pricePerYearValue / 1_000_000).toFixed(2)

      setPricePerYearFormatted(`${suiPerYearFormatted} SUI`)
      setEstimatedPrice(`${suiNeededFormatted} SUI`)
      setPricePerYearUsdc(`${usdcPerYear} USDC`)
      setTotalPriceUsdc(`${usdcPrice} USDC`)
    }
  }, [suinsClient, currentAccount, isTestnet, normalizedName, selectedYears])

  // Auto-refresh price every 10s when domain is available (mainnet only)
  useEffect(() => {
    if (
      isMainnet &&
      isAvailable &&
      normalizedName &&
      !isRegistering &&
      aggregatorClient
    ) {
      // Clear existing interval
      if (priceRefreshIntervalRef.current) {
        clearInterval(priceRefreshIntervalRef.current)
      }

      // Set up interval to refresh price every 10s
      priceRefreshIntervalRef.current = setInterval(() => {
        updatePriceEstimate().catch(err => {
          console.error('Error refreshing price:', err)
        })
      }, 10000)

      return () => {
        if (priceRefreshIntervalRef.current) {
          clearInterval(priceRefreshIntervalRef.current)
        }
      }
    }
  }, [
    isMainnet,
    isAvailable,
    normalizedName,
    isRegistering,
    aggregatorClient,
    updatePriceEstimate
  ])

  // Update price when years change
  useEffect(() => {
    if (isAvailable && pricePerYear !== null) {
      if (isMainnet && aggregatorClient) {
        updatePriceEstimate().catch(err => {
          console.error('Error updating price:', err)
        })
      } else if (isTestnet) {
        updateTestnetPriceEstimate().catch(err => {
          console.error('Error updating price:', err)
        })
      }
    }
  }, [
    isAvailable,
    pricePerYear,
    isMainnet,
    isTestnet,
    aggregatorClient,
    updatePriceEstimate,
    updateTestnetPriceEstimate
  ])

  const handleSearch = useCallback(async () => {
    if (!normalizedName || !suinsClient) return

    if (normalizedName.length < 3) {
      setError('Domain name must be at least 3 characters')
      setIsAvailable(null)
      setEstimatedPrice(null)
      return
    }

    setIsSearching(true)
    setError(null)
    setIsAvailable(null)
    setEstimatedPrice(null)

    try {
      const nameRecord = await suinsClient.getNameRecord(fullName)
      const available = !nameRecord?.nftId
      setIsAvailable(available)

      // Show estimated price
      if (available && currentAccount && aggregatorClient) {
        try {
          if (isMainnet && WAL_COIN_TYPE) {
            await updatePriceEstimate()
          } else if (isTestnet) {
            await updateTestnetPriceEstimate()
          }
        } catch (priceError) {
          console.error('Error estimating price:', priceError)
          // Don't set error, just don't show price
        }
      }
    } catch (error) {
      // If getNameRecord throws an error, the name might be available
      console.error('Error checking name:', error)
      setIsAvailable(true)
    } finally {
      setIsSearching(false)
    }
  }, [
    normalizedName,
    fullName,
    suinsClient,
    currentAccount,
    isMainnet,
    isTestnet,
    WAL_COIN_TYPE,
    aggregatorClient,
    updatePriceEstimate,
    updateTestnetPriceEstimate
  ])

  const handleRegister = useCallback(async () => {
    if (!suinsClient || !currentAccount || !isAvailable || !normalizedName) {
      return
    }

    if (!txExecutor) {
      setError('Transaction executor not available')
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      // Get price list
      const priceList = await suinsClient.getPriceList()
      const nameLength = normalizedName.length

      // Find price for this name length
      let pricePerYear = 0
      for (const [[from, to], price] of priceList.entries()) {
        if (nameLength >= from && nameLength <= to) {
          pricePerYear = price
          break
        }
      }

      if (pricePerYear === 0) {
        throw new Error('Unable to determine price for this domain')
      }

      // Register for selected years
      const years = selectedYears
      const totalPrice = pricePerYear * years

      // Get coin config (use SUI for testnet, USDC for mainnet)
      const coinType = isTestnet ? 'SUI' : 'USDC'
      const coinConfig = suinsClient.config.coins[coinType]

      // Load user balances (only for mainnet USDC/WAL)
      const [usdcCoins, walCoins] = await Promise.all([
        isMainnet
          ? suiClient.getCoins({
              owner: currentAccount.address,
              coinType: suinsClient.config.coins.USDC.type
            })
          : Promise.resolve({ data: [] }),
        isMainnet && WAL_COIN_TYPE
          ? suiClient.getCoins({
              owner: currentAccount.address,
              coinType: WAL_COIN_TYPE
            })
          : Promise.resolve({ data: [] })
      ])

      const usdcBalance =
        usdcCoins.data?.reduce((sum, coin) => sum + BigInt(coin.balance), 0n) ??
        0n
      const walBalance =
        walCoins.data?.reduce((sum, coin) => sum + BigInt(coin.balance), 0n) ??
        0n

      // Calculate required amount with buffer (5%)
      const requiredAmount = BigInt(Math.floor(totalPrice * 1.05))

      // On mainnet, check if we need to swap WAL → USDC
      if (isMainnet && coinType === 'USDC') {
        if (usdcBalance < requiredAmount) {
          if (!aggregatorClient || !WAL_COIN_TYPE) {
            throw new Error(
              'Swap client not ready. Please try again in a few seconds.'
            )
          }

          if (walBalance === 0n) {
            throw new Error(
              `Insufficient USDC balance. Need approximately ${(Number(requiredAmount) / 1_000_000).toFixed(2)} USDC, but have ${(Number(usdcBalance) / 1_000_000).toFixed(2)} USDC. No WAL available to swap.`
            )
          }

          const missingUsdc = requiredAmount - usdcBalance

          // Estimate WAL needed using live rate
          const baseWalAtomic = 1_000_000_000n // 1 WAL (9 decimals)
          const rateRouter = await aggregatorClient.findRouters({
            from: WAL_COIN_TYPE,
            target: suinsClient.config.coins.USDC.type,
            amount: new BN(baseWalAtomic.toString()),
            byAmountIn: true,
            providers: ['CETUS']
          })

          if (!rateRouter || rateRouter.error || !rateRouter.amountOut) {
            const msg =
              rateRouter?.error?.msg ||
              'Failed to fetch WAL → USDC rate from aggregator.'
            throw new Error(msg)
          }

          const rawAmountOut = rateRouter.amountOut
          if (!rawAmountOut) {
            throw new Error('Failed to get amount out from rate router')
          }
          const usdcOutForOneWal = BigInt(
            rawAmountOut instanceof BN
              ? rawAmountOut.toString()
              : new BN(String(rawAmountOut)).toString()
          )

          if (usdcOutForOneWal === 0n) {
            throw new Error('Aggregator returned zero USDC for 1 WAL.')
          }

          const exchangeRate = Number(baseWalAtomic) / Number(usdcOutForOneWal)
          const estimatedWalNeeded =
            missingUsdc * BigInt(Math.ceil(exchangeRate))

          if (walBalance < estimatedWalNeeded) {
            throw new Error(
              `Insufficient WAL balance. Need approximately ${(Number(estimatedWalNeeded) / 1_000_000_000).toFixed(4)} WAL to swap for USDC.`
            )
          }

          // Perform WAL → USDC swap
          setIsSwapping(true)
          try {
            const amountWalBN = new BN(estimatedWalNeeded.toString())

            const routerResult = await aggregatorClient.findRouters({
              from: WAL_COIN_TYPE,
              target: suinsClient.config.coins.USDC.type,
              amount: amountWalBN,
              byAmountIn: true,
              providers: ['CETUS']
            })

            if (!routerResult || (routerResult as { error?: unknown }).error) {
              const msg =
                (routerResult as { error?: { msg?: string } })?.error?.msg ||
                'Failed to find route to swap WAL to USDC for registration.'
              throw new Error(msg)
            }

            if (
              (routerResult as { insufficientLiquidity?: boolean })
                .insufficientLiquidity
            ) {
              throw new Error(
                'Insufficient liquidity to swap WAL to USDC for this registration amount.'
              )
            }

            const swapTx = new Transaction()
            swapTx.setSenderIfNotSet(currentAccount.address)

            await aggregatorClient.fastRouterSwap({
              router: routerResult,
              txb: swapTx,
              slippage: 0.005 // 0.5% slippage
            })

            swapTx.setGasBudget(50_000_000)

            const swapDigest = await txExecutor.execute({
              transaction: swapTx,
              description: 'Swap WAL to USDC for SuiNS registration'
            })

            // Wait for swap transaction to complete
            await suiClient.waitForTransaction({ digest: swapDigest })

            // Refresh USDC balance after swap
            const usdcCoinsAfter = await suiClient.getCoins({
              owner: currentAccount.address,
              coinType: suinsClient.config.coins.USDC.type
            })

            const usdcBalanceAfter =
              usdcCoinsAfter.data?.reduce(
                (sum, coin) => sum + BigInt(coin.balance),
                0n
              ) ?? 0n

            if (usdcBalanceAfter < requiredAmount) {
              throw new Error(
                'Swap completed but still insufficient USDC balance. Please try again.'
              )
            }
          } finally {
            setIsSwapping(false)
          }
        }
      }

      // Get user's coins for payment
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: coinConfig.type
      })

      if (coins.data.length === 0) {
        throw new Error(`No ${coinType} coins found in your wallet`)
      }

      // Calculate max payment with buffer (5%)
      const maxPaymentAmount = Math.floor(totalPrice * 1.05)
      const totalBalance = coins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      )

      const gasReserve = 10_000_000n
      const requiredBalance = BigInt(maxPaymentAmount) + gasReserve

      if (totalBalance < requiredBalance) {
        throw new Error(
          `Insufficient balance. Need approximately ${(Number(requiredBalance) / 1_000_000_000).toFixed(4)} ${coinType}`
        )
      }

      // Create transaction for registration
      const transaction = new Transaction()
      transaction.setSenderIfNotSet(currentAccount.address)

      const suinsTransaction = new SuinsTransaction(suinsClient, transaction)

      // Prepare payment coin
      let paymentCoin:
        | ReturnType<typeof transaction.object>
        | typeof transaction.gas

      if (coinType === 'SUI') {
        // For SUI, use transaction.gas directly
        paymentCoin = transaction.gas
      } else {
        // For USDC, need SUI for gas separately
        const suiCoins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI'
        })

        if (suiCoins.data.length === 0) {
          throw new Error('No SUI coins found for gas fees')
        }

        // Merge payment coins if multiple
        const primaryCoin = coins.data[0].coinObjectId
        if (coins.data.length > 1) {
          transaction.mergeCoins(
            transaction.object(primaryCoin),
            coins.data
              .slice(1)
              .map(coin => transaction.object(coin.coinObjectId))
          )
        }

        paymentCoin = transaction.object(primaryCoin)

        // Merge SUI coins for gas if multiple
        if (suiCoins.data.length > 1) {
          transaction.mergeCoins(
            transaction.object(suiCoins.data[0].coinObjectId),
            suiCoins.data
              .slice(1)
              .map(coin => transaction.object(coin.coinObjectId))
          )
        }
      }

      // Prepare registration parameters
      const registerParams: {
        domain: string
        years: number
        coinConfig: typeof coinConfig
        coin: typeof paymentCoin
        priceInfoObjectId?: string
      } = {
        domain: fullName,
        years,
        coinConfig,
        coin: paymentCoin
      }

      // Get price info object if feed is available
      if (coinConfig.feed) {
        const priceInfoObjectId = (
          await suinsClient.getPriceInfoObject(transaction, coinConfig.feed)
        )[0]
        registerParams.priceInfoObjectId = priceInfoObjectId
      }

      // Register the domain
      const nft = suinsTransaction.register(registerParams)

      // Set target address to current account
      suinsTransaction.setTargetAddress({
        nft,
        address: currentAccount.address
      })

      // Transfer the NFT to the user
      transaction.transferObjects([nft], currentAccount.address)

      // Set gas budget
      transaction.setGasBudget(50_000_000)

      // Execute transaction using txExecutor
      if (!txExecutor) {
        throw new Error('Transaction executor not available')
      }

      const digest = await txExecutor.execute({
        transaction,
        description: 'Register SuiNS domain'
      })

      // Wait for transaction to complete
      await suiClient.waitForTransaction({ digest })

      // Invalidate SuiNS domains query to refresh the list
      if (currentAccount?.address) {
        queryClient.invalidateQueries({
          queryKey: ['suins-domains', currentAccount.address, network]
        })
      }

      return true
    } catch (err) {
      console.error('Error registering domain:', err)
      setError(err instanceof Error ? err.message : 'Failed to register domain')
      return false
    } finally {
      setIsRegistering(false)
    }
  }, [
    suinsClient,
    currentAccount,
    isAvailable,
    normalizedName,
    fullName,
    selectedYears,
    txExecutor,
    isTestnet,
    isMainnet,
    WAL_COIN_TYPE,
    aggregatorClient,
    suiClient,
    queryClient,
    network
  ])

  const reset = useCallback(() => {
    setSearchName('')
    setIsAvailable(null)
    setEstimatedPrice(null)
    setError(null)
    setIsSearching(false)
    setIsRegistering(false)
    setIsSwapping(false)
    setSelectedYears(1)
    setPricePerYear(null)
    setPricePerYearFormatted(null)
    setPricePerYearUsdc(null)
    setTotalPriceUsdc(null)
    if (priceRefreshIntervalRef.current) {
      clearInterval(priceRefreshIntervalRef.current)
      priceRefreshIntervalRef.current = null
    }
  }, [])

  return {
    // State
    searchName,
    setSearchName,
    isSearching,
    isAvailable,
    isRegistering,
    isSwapping,
    estimatedPrice,
    error,
    normalizedName,
    fullName,
    selectedYears,
    setSelectedYears,
    pricePerYear,
    pricePerYearFormatted,
    pricePerYearUsdc,
    totalPrice,
    totalPriceFormatted,
    totalPriceUsdc,
    expirationDate,
    // Actions
    handleSearch,
    handleRegister,
    reset
  }
}
