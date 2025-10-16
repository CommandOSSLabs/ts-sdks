'use client'

import ConnectWalletButton from '@/components/ConnectWalletButton'
import Footer from '@/components/Footer'
import WalletDetails from '@/components/WalletDetails'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-montreal max-w-screen w-full min-h-screen p-4 bg-[#0C0F1D] bg-gradient-to-b from-[#0C0F1D80] to-[#97F0E580] from-[77.3%] flex flex-col text-[#F7F7F7] gap-4">
      <div className="relative h-max w-full flex flex-col items-center px-4 md:px-8 lg:px-10 pb-8 pt-8 border-[3px] border-[#99EFE4] rounded-xl overflow-hidden bg-[#090e1d]">
        <div className="z-10">
          <div className="absolute top-0 left-0 right-0 px-2 sm:px-4 py-2 sm:py-4 flex flex-col gap-2 sm:flex-row justify-between items-center bg-gradient-to-b from-[#090e1d] from-60% via-[#090e1d]/80 via-75% to-transparent">
            <a href="/">
              <div className="flex flex-row gap-1 items-center justify-center">
                <span className="text-3xl sm:text-4xl font-neuebit">
                  SITE BUILDER SDK
                </span>
                <span className="text-3xl sm:text-4xl font-neuebit text-[#C684F6] text-nowrap">
                  PLAYGROUND
                </span>
              </div>
            </a>
            <div className="flex sm:flex-row flex-col-reverse gap-4 items-center justify-center">
              <WalletDetails />
              <ConnectWalletButton />
            </div>
          </div>
          <div className="pt-24 sm:pt-0">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
