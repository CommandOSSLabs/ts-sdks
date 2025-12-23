'use client'

import type {
  IAsset,
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/site-builder'
import {
  PublishButton,
  type SiteMetadata,
  type SiteMetadataUpdate
} from '@cmdoss/site-builder-react'
import type { useCurrentAccount } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
import type { SuinsClient } from '@mysten/suins'
import type { WalrusClient } from '@mysten/walrus'
import type { QueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface PublishSectionProps {
  siteId: string | undefined
  currentAccount: ReturnType<typeof useCurrentAccount>
  assets: IAsset[]
  onUpdateSiteMetadata: (site: SiteMetadataUpdate) => Promise<SiteMetadata>
  onError: (msg: string) => void
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
  onSponsorConfigChange?: (enabled: boolean, url: string) => void
  sponsorEnabled?: boolean
  sponsorUrl?: string
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    suinsClient: SuinsClient
    walrusClient: WalrusClient
  }
}

export default function PublishSection({
  siteId,
  currentAccount,
  assets,
  onUpdateSiteMetadata,
  onError,
  signAndExecuteTransaction,
  sponsorConfig,
  sponsorEnabled = false,
  clients
}: PublishSectionProps) {
  if (!currentAccount) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
              disabled
            >
              {siteId ? 'Update Site' : 'Publish'}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={6} className="text-sm">
          {!assets.length
            ? 'Add files to publish your site'
            : 'Please connect your wallet to publish'}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sponsor Config UI */}
      {/* {onSponsorConfigChange && (
        <div className="p-4 bg-[#0C0F1D]/50 border border-[#97F0E599]/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="sponsor-enabled"
              checked={sponsorEnabled}
              onChange={e =>
                onSponsorConfigChange(e.target.checked, sponsorUrl)
              }
              className="w-4 h-4 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded focus:outline-none focus:ring-0 focus:border-[#97F0E5] checked:bg-[#97F0E5] checked:border-[#97F0E5]"
            />
            <label
              htmlFor="sponsor-enabled"
              className="text-sm font-medium text-[#F7F7F7]"
            >
              Enable Transaction Sponsorship
            </label>
          </div>
          {sponsorEnabled && (
            <div>
              <label
                htmlFor="sponsor-url"
                className="block text-sm font-medium mb-1 text-[#F7F7F7]"
              >
                Sponsor Backend URL
              </label>
              <input
                type="url"
                id="sponsor-url"
                className="w-full p-2 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded-md focus:outline-none focus:ring-0 focus:border-[#97F0E5] text-[#F7F7F7]"
                value={sponsorUrl}
                onChange={e =>
                  onSponsorConfigChange(sponsorEnabled, e.target.value)
                }
                placeholder="http://localhost:8787"
              />
              <p className="text-xs opacity-70 text-[#F7F7F7] mt-1">
                URL of the Enoki backend server for transaction sponsorship.
              </p>
            </div>
          )}
        </div>
      )} */}

      <PublishButton
        siteId={siteId}
        assets={assets}
        onUpdateSiteMetadata={onUpdateSiteMetadata}
        onError={onError}
        currentAccount={currentAccount}
        clients={clients}
        signAndExecuteTransaction={signAndExecuteTransaction}
        sponsorConfig={sponsorConfig}
        portalDomain="localhost:3003"
      >
        <Button className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]">
          {siteId ? 'Update Site' : 'Publish'} {sponsorEnabled && '(Sponsored)'}
        </Button>
      </PublishButton>
    </div>
  )
}
