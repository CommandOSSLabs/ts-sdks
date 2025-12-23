'use client'

import { Loader2 } from 'lucide-react'
import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { Button } from '@/components/ui/button'

interface AssetItem {
  path: string
  content: string | Uint8Array
}

interface AssetsSectionProps {
  loading: boolean
  assets: AssetItem[]
  onAddTestFilesSet1: () => void
  onAddTestFilesSet2: () => void
  onClearWorkspace: () => void
  isAddingFiles: boolean
  isClearingWorkspace: boolean
}

export default function AssetsSection({
  loading,
  assets,
  onAddTestFilesSet1,
  onAddTestFilesSet2,
  onClearWorkspace,
  isAddingFiles,
  isClearingWorkspace
}: AssetsSectionProps) {
  return (
    <>
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Loading file system...
            </span>
          </div>
        </div>
      )}
      {!assets.length ? (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <Button
            onClick={onAddTestFilesSet1}
            disabled={isAddingFiles}
            className="w-full bg-teal-200/25 text-white hover:bg-teal-200/35 border border-teal-100 disabled:opacity-50"
          >
            {isAddingFiles ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Files...
              </>
            ) : (
              'Add Sample Files Set #1'
            )}
          </Button>
          <Button
            onClick={onAddTestFilesSet2}
            disabled={isAddingFiles}
            className="w-full bg-teal-200/25 text-white hover:bg-teal-200/35 border border-teal-100 disabled:opacity-50"
          >
            {isAddingFiles ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Files...
              </>
            ) : (
              'Add Sample Files Set #2'
            )}
          </Button>
          <p className="text-xs text-gray-300 text-center">
            Mini site with Hello World and a glass of water image
          </p>
          <p className="text-xs text-gray-300 text-center">
            Mini site with Good Morning and a sun image
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <FileExplorer className="h-75" assets={assets} />

          <Button
            onClick={onClearWorkspace}
            disabled={isClearingWorkspace}
            className="w-full text-[#97f0e5] hover:opacity-80 border border-[#97F0E599] disabled:opacity-50"
          >
            {isClearingWorkspace ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              'Clear Files'
            )}
          </Button>
        </div>
      )}
    </>
  )
}
