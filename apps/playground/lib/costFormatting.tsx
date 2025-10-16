import { formatSmallNumber } from './helper'

interface FormattedCost {
  prefix: string
  subscript?: number
  significantDigits: string
}

export function formatCostValue(value: number): FormattedCost {
  return formatSmallNumber(value)
}

export function formatCostDisplay(
  costString: string,
  currency: 'WAL' | 'SUI'
): React.JSX.Element | string {
  const value = parseInt(costString, 10) / 10 ** 9
  const formatted = formatCostValue(value)

  return (
    <>
      {formatted.prefix}
      {formatted.subscript && <sub>{formatted.subscript}</sub>}
      {formatted.significantDigits}
      {` ${currency}`}
    </>
  )
}

export function formatTotalCost(
  tipAmountMist: string,
  totalCostFrost: string
): React.JSX.Element {
  const mistValue = parseInt(tipAmountMist, 10) / 10 ** 9
  const frostValue = parseInt(totalCostFrost, 10) / 10 ** 9

  const formattedMist = formatCostValue(mistValue)
  const formattedFrost = formatCostValue(frostValue)

  return (
    <>
      {formattedMist.prefix}
      {formattedMist.subscript && <sub>{formattedMist.subscript}</sub>}
      {formattedMist.significantDigits}
      {' SUI + '}
      {formattedFrost.prefix}
      {formattedFrost.subscript && <sub>{formattedFrost.subscript}</sub>}
      {formattedFrost.significantDigits}
      {' WAL'}
    </>
  )
}
