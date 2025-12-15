import { ChevronDown } from 'lucide-react'
import { Button } from './ui/button'

interface AdvancedSettingsProps {
  epochs: number
  onEpochsChange: (epochs: number) => void
  deletable: boolean
  onDeletableChange: (deletable: boolean) => void
  sponsorEnabled: boolean
  onSponsorEnabledChange: (enabled: boolean) => void
  sponsorUrl: string
  onSponsorUrlChange: (url: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function AdvancedSettings({
  epochs,
  onEpochsChange,
  deletable,
  onDeletableChange,
  sponsorEnabled,
  onSponsorEnabledChange,
  sponsorUrl,
  onSponsorUrlChange,
  isOpen,
  onToggle
}: AdvancedSettingsProps) {
  return (
    <div className="w-full">
      <Button
        onClick={onToggle}
        className="flex items-center bg-transparent hover:bg-transparent gap-2 text-sm text-[#F7F7F7] hover:text-[#97F0E5] transition-colors"
      >
        <ChevronDown
          size={16}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
        Advanced Settings
      </Button>
      {isOpen && (
        <div className="mt-2 space-y-4">
          <div>
            <label htmlFor="epochs" className="block text-sm font-medium mb-1">
              Epochs
            </label>
            <input
              type="number"
              className="w-full p-2 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded-md focus:outline-none focus:ring-0 focus:border-[#97F0E5]"
              value={epochs}
              onChange={e =>
                onEpochsChange(
                  Math.min(53, Math.max(1, Math.floor(Number(e.target.value))))
                )
              }
              min="1"
              max="53"
              step="1"
            />
            <p className="text-sm opacity-50 text-[#F7F7F7] mt-1">
              The number of Walrus epochs for which to store the blob (max 53).
            </p>
          </div>

          <div>
            <label
              htmlFor="deletable"
              className="block text-sm font-medium mb-1"
            >
              Deletable
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deletable}
                onChange={e => onDeletableChange(e.target.checked)}
                className="w-4 h-4 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded focus:outline-none focus:ring-0 focus:border-[#97F0E5] checked:bg-[#97F0E5] checked:border-[#97F0E5]"
              />
              <span className="text-sm text-[#F7F7F7]">
                Allow blob to be deleted
              </span>
            </div>
            <p className="text-sm opacity-50 text-[#F7F7F7] mt-1">
              Whether the blob can be deleted before its storage period expires.
            </p>
          </div>

          <div>
            <label
              htmlFor="sponsorEnabled"
              className="block text-sm font-medium mb-1"
            >
              Transaction Sponsorship
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sponsorEnabled}
                onChange={e => onSponsorEnabledChange(e.target.checked)}
                className="w-4 h-4 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded focus:outline-none focus:ring-0 focus:border-[#97F0E5] checked:bg-[#97F0E5] checked:border-[#97F0E5]"
              />
              <span className="text-sm text-[#F7F7F7]">
                Enable sponsored transactions
              </span>
            </div>
            <p className="text-sm opacity-50 text-[#F7F7F7] mt-1">
              Use Enoki backend to sponsor transaction fees.
            </p>
          </div>

          {sponsorEnabled && (
            <div>
              <label
                htmlFor="sponsorUrl"
                className="block text-sm font-medium mb-1"
              >
                Sponsor Backend URL
              </label>
              <input
                type="url"
                className="w-full p-2 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded-md focus:outline-none focus:ring-0 focus:border-[#97F0E5]"
                value={sponsorUrl}
                onChange={e => onSponsorUrlChange(e.target.value)}
                placeholder="http://localhost:8787"
              />
              <p className="text-sm opacity-50 text-[#F7F7F7] mt-1">
                URL of the Enoki backend server for transaction sponsorship.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
