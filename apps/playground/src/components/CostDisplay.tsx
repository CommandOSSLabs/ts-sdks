import { useStorageCost } from '../hooks/useStorageCost'
import { formatCostDisplay, formatTotalCost } from '../lib/costFormatting'

interface CostDisplayProps {
  fileSize: number
  epochs: number
  tipAmountMist?: string
}

export function CostDisplay({
  fileSize,
  epochs,
  tipAmountMist = '105'
}: CostDisplayProps) {
  const { data: storageCost } = useStorageCost(fileSize, epochs)

  return (
    <div className="w-full p-3 bg-[#0C0F1D] border border-[#97F0E599] rounded-md">
      <h3 className="text-sm font-medium text-[#F7F7F7] mb-1">
        Upload Cost Estimate
      </h3>
      <div className="space-y-0.5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#F7F7F7] opacity-75">Storage Cost:</span>
          <span className="text-[#F7F7F7]">
            {storageCost
              ? formatCostDisplay(storageCost.storageCost, 'WAL')
              : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#F7F7F7] opacity-75">Write Cost:</span>
          <span className="text-[#F7F7F7]">
            {storageCost
              ? formatCostDisplay(storageCost.writeCost, 'WAL')
              : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#F7F7F7] opacity-75">Tip Amount:</span>
          <span className="text-[#F7F7F7]">
            {storageCost ? formatCostDisplay(tipAmountMist, 'SUI') : '---'}
          </span>
        </div>
        <div className="border-t border-[#97F0E599] pt-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-[#F7F7F7]">Total Cost:</span>
            <span className="text-[#97F0E5]">
              {storageCost
                ? formatTotalCost(tipAmountMist, storageCost.totalCost)
                : '---'}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-[#F7F7F7] opacity-50 mt-1">
        Actual costs may vary based on current network conditions and file size.
      </p>
    </div>
  )
}
