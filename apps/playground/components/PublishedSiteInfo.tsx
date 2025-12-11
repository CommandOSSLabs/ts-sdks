'use client'

import { Copy, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface PublishedSiteInfoProps {
  siteId: string
  network: 'mainnet' | 'testnet'
  onClearSiteId: () => void
}

export default function PublishedSiteInfo({
  siteId,
  network,
  onClearSiteId
}: PublishedSiteInfoProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(siteId)
    toast.success('Copied to clipboard')
  }

  const handleClear = () => {
    onClearSiteId()
    toast.success('Site info cleared')
  }

  return (
    <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-[#97f0e5]/10 border border-[#97F0E599]/30">
      <p className="text-xs text-gray-300">Published Site ID:</p>
      <div className="flex items-center gap-2">
        <code className="text-xs text-[#97f0e5] font-mono">
          {siteId.slice(0, 6)}...{siteId.slice(-4)}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[#97f0e5] hover:text-[#97f0e5]/80 p-1 rounded hover:bg-[#97f0e5]/10"
          title="Copy full ID"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <a
        href={`https://suiscan.xyz/${network === 'mainnet' ? 'mainnet' : 'testnet'}/object/${siteId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#97f0e5] hover:text-[#97f0e5]/80 flex items-center gap-1 text-xs shrink-0"
      >
        View on Suiscan
        <ExternalLink className="w-3 h-3" />
      </a>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 ml-auto"
            title="Clear stored site ID"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Published Site Info</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the stored information about your currently
              published site. You will be able to publish a new site after this
              action.
              <br />
              <br />
              <strong>Note:</strong> This does not delete the site from the
              blockchain, it only removes the local reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
