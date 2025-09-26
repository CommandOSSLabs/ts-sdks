import { useCurrentAccount } from '@mysten/dapp-kit'
import Image from 'next/image'
import { useGetWalTokens } from '../hooks/useGetWalTokens'
import { useSuiBalance } from '../hooks/useSuiBalance'
import { useWalBalance } from '../hooks/useWalBalance'
import { Button } from './ui/button'

export default function WalletDetails() {
  const account = useCurrentAccount()

  const { data: amountSui = '0' } = useSuiBalance()
  const { data: amountWal = '0' } = useWalBalance()
  const getWalTokensMutation = useGetWalTokens()

  const getSui = () => {
    if (!account) return

    const faucetUrl = `https://faucet.sui.io/?address=${account.address}`
    window.open(faucetUrl, '_blank')
  }

  const getWal = async () => {
    await getWalTokensMutation.mutateAsync()
  }

  const hasWal = parseFloat(amountWal) > 0
  const hasLowSui = parseFloat(amountSui) < 0.5 // Show faucet if less than 1 SUI
  const hasInsufficientSui = parseFloat(amountSui) < 0.5 // Disable WAL faucet if less than 0.5 SUI
  const isGettingWal = getWalTokensMutation.isPending

  if (!account) {
    return null
  }

  return (
    <div className="flex flex-row gap-4 items-center justify-center">
      <span className="text-[#F7F7F7] font-montreal">Testnet</span>

      {/* SUI Display with optional faucet */}
      <div className="flex flex-row gap-2 items-center justify-center">
        <div
          className={`flex flex-row gap-1 items-center justify-center ${hasLowSui ? 'opacity-50' : ''}`}
        >
          <Image
            src="/icons/sui-token-icon.png"
            alt="SUI"
            className="h-6 rounded-full"
            width={24}
            height={24}
          />
          <span className="text-[#F7F7F7] font-montreal">{amountSui}</span>
          <span className="text-[#F7F7F7] opacity-50 font-montreal">SUI</span>
        </div>
        {hasLowSui && (
          <Button
            className="text-[#97F0E5] text-xs hover:underline transition-colors duration-200"
            onClick={getSui}
          >
            Get SUI
          </Button>
        )}
      </div>

      {/* WAL Display - Different states based on balance */}
      {hasWal ? (
        // User has WAL - show normal balance with optional "Get More" button
        <div className="flex flex-row gap-2 items-center justify-center">
          <div className="flex flex-row gap-1 items-center justify-center">
            <Image
              src="https://walrus-logos.wal.app/Icon%20Token/Icon_token_RGB.svg"
              alt="WAL"
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
            <span className="text-[#F7F7F7] font-montreal">{amountWal}</span>
            <span className="text-[#F7F7F7] opacity-50 font-montreal">WAL</span>
          </div>
          <Button
            className={`text-xs transition-colors duration-200 ${
              isGettingWal || hasInsufficientSui
                ? 'text-[#97F0E5]/50 cursor-not-allowed'
                : 'text-[#97F0E5] hover:underline cursor-pointer'
            }`}
            onClick={getWal}
            disabled={isGettingWal || hasInsufficientSui}
          >
            {isGettingWal
              ? 'Getting...'
              : hasInsufficientSui
                ? 'Need SUI'
                : 'Get More'}
          </Button>
        </div>
      ) : (
        // User has no WAL - show prominent "Get WAL" button
        <div className="flex flex-row gap-2 items-center justify-center">
          <div className="flex flex-row gap-1 items-center justify-center opacity-50">
            <Image
              src="https://walrus-logos.wal.app/Icon%20Token/Icon_token_RGB.svg"
              alt="WAL"
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
            <span className="text-[#F7F7F7] font-montreal">0</span>
            <span className="text-[#F7F7F7] opacity-50 font-montreal">WAL</span>
          </div>
          <Button
            className={`px-3 py-1 rounded-md transition-all duration-200 ${
              isGettingWal || !account || hasInsufficientSui
                ? 'bg-[#97F0E5]/50 text-[#0C0F1D]/50 cursor-not-allowed'
                : 'bg-[#97F0E5] text-[#0C0F1D] hover:bg-[#97F0E5]/80 cursor-pointer shadow-lg'
            }`}
            onClick={getWal}
            disabled={isGettingWal || !account || hasInsufficientSui}
          >
            {isGettingWal ? (
              <span className="text-xs font-montreal">Getting...</span>
            ) : hasInsufficientSui ? (
              <span className="text-xs font-medium font-montreal">
                Need SUI
              </span>
            ) : (
              <span className="text-xs font-medium font-montreal">Get WAL</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
