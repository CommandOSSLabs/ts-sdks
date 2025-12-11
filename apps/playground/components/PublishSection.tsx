'use client'

import type {
  IReadOnlyFileManager,
  ISignAndExecuteTransaction
} from '@cmdoss/site-builder'
import {
  PublishButton,
  type SiteMetadata,
  type SiteMetadataUpdate
} from '@cmdoss/site-builder-react'
import type { useCurrentAccount } from '@mysten/dapp-kit'
import type { SuiClient } from '@mysten/sui/client'
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
  assets: { path: string; content: string | Uint8Array }[]
  onPrepareAssets: () => Promise<IReadOnlyFileManager>
  onUpdateSiteMetadata: (site: SiteMetadataUpdate) => Promise<SiteMetadata>
  onError: (msg: string) => void
  signAndExecuteTransaction: ISignAndExecuteTransaction
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
  }
}

export default function PublishSection({
  siteId,
  currentAccount,
  assets,
  onPrepareAssets,
  onUpdateSiteMetadata,
  onError,
  signAndExecuteTransaction,
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
    <PublishButton
      siteId={siteId}
      onPrepareAssets={onPrepareAssets}
      onUpdateSiteMetadata={onUpdateSiteMetadata}
      onError={onError}
      currentAccount={currentAccount}
      clients={clients}
      signAndExecuteTransaction={signAndExecuteTransaction}
      portalDomain="localhost:3003"
    >
      <Button className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]">
        {siteId ? 'Update Site' : 'Publish'}
      </Button>
    </PublishButton>
  )
}
