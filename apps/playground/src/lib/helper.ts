export const formatSmallNumber = (
  value: number
): { prefix: string; significantDigits: string; subscript?: number } => {
  if (value === 0) return { prefix: '', significantDigits: '0' }

  const valueStr = value.toString()
  const scientificMatch = valueStr.match(/^(\d+(?:\.\d+)?)e-(\d+)$/)

  if (scientificMatch) {
    // Handle scientific notation
    const coefficient = parseFloat(scientificMatch[1])
    const exponent = parseInt(scientificMatch[2], 10)

    if (exponent >= 4) {
      // Extract significant digits without decimal point
      const coefficientStr = coefficient.toString().replace('.', '')
      const paddedDigits = coefficientStr.padEnd(3, '0').substring(0, 3)
      return {
        prefix: '0.0',
        significantDigits: paddedDigits,
        subscript: exponent - 1
      }
    }
  }

  // Check for leading zeros after decimal point
  const decimalMatch = valueStr.match(/^0\.0+(\d+)/)
  if (decimalMatch) {
    const leadingZerosMatch = valueStr.match(/^0\.0+/)
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[0].length - 2 // subtract "0."
      if (leadingZeros >= 4) {
        const significantDigits = decimalMatch[1]
        const formattedDigits = significantDigits.substring(0, 3)
        return {
          prefix: '0.0',
          significantDigits: formattedDigits,
          subscript: leadingZeros
        }
      }
    }
  }

  // For regular numbers, use toPrecision
  return { prefix: '', significantDigits: value.toPrecision(3) }
}
