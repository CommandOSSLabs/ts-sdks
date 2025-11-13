'use client'

import {
  ConnectModal,
  useAccounts,
  useCurrentAccount,
  useDisconnectWallet,
  useResolveSuiNSName,
  useSwitchAccount
} from '@mysten/dapp-kit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export default function ConnectWalletButton({
  fullWidth = false
}: {
  fullWidth?: boolean
}) {
  const account = useCurrentAccount()
  const accounts = useAccounts()
  const { data: suiNSName } = useResolveSuiNSName(account?.address)
  const { mutate: disconnect } = useDisconnectWallet()
  const { mutate: switchAccount } = useSwitchAccount()
  const [alignment, setAlignment] = useState<'center' | 'end'>('center')

  useEffect(() => {
    const handleResize = () => {
      setAlignment(window.innerWidth >= 640 ? 'end' : 'center')
    }

    // Set initial alignment
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAccountSwitch = (
    account: NonNullable<typeof accounts>[number]
  ) => {
    switchAccount({ account })
  }

  const handleDisconnectAll = () => {
    disconnect()
    if (window.location.pathname === '/link') {
      window.location.href = '/connect'
    }
  }

  return (
    <>
      {account ? (
        <div className={`space-y-4 ${fullWidth ? 'w-full' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-[#97F0E54D] text-[#F7F7F7] px-4 py-2 rounded-md hover:bg-[#97F0E54D] hover:opacity-80 flex flex-row items-center justify-start gap-2 ${fullWidth ? 'w-full' : ''}`}
              >
                <Image
                  src={account.icon || '/images/walrus-pfp.png'}
                  alt="PP"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-[#FFF] text-sm uppercase font-montreal">
                  {suiNSName
                    ? `@${suiNSName.split('.sui')[0]}`
                    : `@${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                </span>
                <Image
                  src={'/icons/chevron-down.png'}
                  alt="Chevron Down"
                  width={16}
                  height={16}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={alignment}
              className="border-2 border-[#97F0E5] rounded-2xl p-3 bg-[#0C0F1D] flex flex-col gap-2 min-w-[300px]"
            >
              <div className="w-full flex flex-row justify-start gap-2">
                <Image
                  src={'/images/walrus-pfp.png'}
                  alt="PP"
                  className="rounded-full size-10"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col items-start justify-start">
                  <span className="text-[#FFF] uppercase font-montreal">
                    {suiNSName
                      ? `@${suiNSName.split('.sui')[0]}`
                      : `@${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                  </span>
                  {suiNSName && (
                    <span className="text-[#FFF] opacity-70 text-sm font-montreal">
                      {account.address.slice(0, 6)}...
                      {account.address.slice(-4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Multiple Accounts List */}
              {accounts && accounts.length > 1 && (
                <div className="flex flex-col gap-1 py-2 border-t border-[#97F0E5] border-opacity-20">
                  {accounts.map(acc => (
                    <Button
                      key={acc.address}
                      onClick={() => handleAccountSwitch(acc)}
                      className={`w-full flex flex-row justify-start gap-2 p-2 rounded-md hover:bg-[#97F0E514] transition-colors ${
                        acc.address === account.address ? 'bg-[#97F0E514]' : ''
                      }`}
                    >
                      <Image
                        src={acc.icon || '/icons/walrus-pfp.png'}
                        alt="Wallet"
                        className="rounded-full size-8"
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col items-start justify-start">
                        <span className="text-[#FFF] text-sm uppercase font-montreal">
                          {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                        </span>
                        <span className="text-[#FFF] opacity-50 text-xs font-montreal">
                          {acc.address.slice(0, 10)}...{acc.address.slice(-6)}
                        </span>
                      </div>
                      {acc.address === account.address && (
                        <div className="ml-auto flex items-center">
                          <div className="w-2 h-2 bg-[#97F0E5] rounded-full"></div>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-row justify-between gap-1 pt-2">
                <Button
                  className="h-fit w-[92px] py-2 bg-[#97F0E514] text-[#FFF] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#97F0E514] hover:opacity-80"
                  onClick={() => navigator.clipboard.writeText(account.address)}
                >
                  <Image
                    src={'/icons/copy.png'}
                    alt="Copy"
                    width={16}
                    height={16}
                  />
                  <span className="text-xs font-montreal">Copy</span>
                </Button>
                <a
                  href={`https://suiscan.xyz/address/${account.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="h-fit w-[92px] py-2 bg-[#97F0E514] text-[#FFF] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#97F0E514] hover:opacity-80">
                    <Image
                      src={'/icons/link.png'}
                      alt="Explorer"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs font-montreal">Explorer</span>
                  </Button>
                </a>
                <Button
                  className="h-fit w-[92px] py-2 bg-[#E594A714] text-[#FFF] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#E594A714] hover:opacity-80"
                  onClick={handleDisconnectAll}
                >
                  <Image
                    src={'/icons/trash.png'}
                    alt="Disconnect"
                    width={16}
                    height={16}
                  />
                  <span className="text-xs font-montreal">Disconnect All</span>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <ConnectModal
          defaultOpen={false}
          trigger={
            <Button
              type="button"
              className={`bg-[#C684F6] text-[#0C0F1D] px-4 py-2 rounded-md hover:bg-[#C684F6] hover:opacity-80 ${fullWidth ? 'w-full' : ''}`}
            >
              CONNECT WALLET
            </Button>
          }
        />
      )}
    </>
  )
}
