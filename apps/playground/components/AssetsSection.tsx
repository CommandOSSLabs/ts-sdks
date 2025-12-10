'use client'

import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { Button } from '@/components/ui/button'

interface AssetItem {
  path: string
  content: string | Uint8Array
}

interface AssetsSectionProps {
  loading: boolean
  assets: AssetItem[]
  onAddTestFiles: () => void
  onClearWorkspace: () => void
}

export default function AssetsSection({
  loading,
  assets,
  onAddTestFiles,
  onClearWorkspace
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
        <div className="space-y-4">
          <div className="pt-2">
            <Button
              onClick={onAddTestFiles}
              className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
            >
              Add Test Files (HTML + SVG)
            </Button>
            <p className="text-xs text-gray-300 mt-2 text-center">
              Creates index.html with Hello World and a glass of water SVG
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FileExplorer className="h-[300px]" assets={assets} />

          <Button
            onClick={onClearWorkspace}
            className="w-full text-[#97f0e5] hover:opacity-80 border border-[#97F0E599]"
          >
            Clear Files
          </Button>
        </div>
      )}
    </>
  )
}
