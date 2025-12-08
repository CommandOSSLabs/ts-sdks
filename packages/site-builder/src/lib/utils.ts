/**
 * Converts a blob ID (base64url) to a U256 bigint.
 *
 * @param blobIdBase64 - The blob ID to convert.
 * @returns The corresponding U256 bigint.
 */
export function blobIdBase64ToU256(blobIdBase64: string): bigint {
  // Add padding if needed
  const padded = blobIdBase64 + '='.repeat((4 - (blobIdBase64.length % 4)) % 4)
  const bytes = Uint8Array.from(
    atob(padded.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  )
  // Convert bytes to BigInt (little-endian)
  let result = 0n
  for (let i = 0; i < bytes.length; i++) {
    result += BigInt(bytes[i]) << (8n * BigInt(i))
  }
  return result
}

/**
 * Checks if the given network is supported.
 *
 * @param network - The network to check.
 * @returns True if the network is supported, false otherwise.
 */
export function isSupportedNetwork(
  network: string
): network is 'mainnet' | 'testnet' {
  return network === 'mainnet' || network === 'testnet'
}

/**
 * Converts a U256 bigint to a blob ID (base64url) assuming little-endian byte order.
 *
 * @param value - The bigint value to convert.
 * @returns The corresponding base64url-encoded blob ID (without padding).
 */
export function u256ToBlobIdBase64(value: bigint): string {
  if (value < 0n) {
    throw new Error('Value must be a non-negative bigint')
  }

  // Convert BigInt to bytes (little-endian)
  const bytes: number[] = []
  let temp = value

  while (temp > 0n) {
    bytes.push(Number(temp & 0xffn))
    temp >>= 8n
  }

  if (bytes.length === 0) {
    bytes.push(0)
  }

  const binary = String.fromCharCode(...bytes)

  // Base64url encode without padding
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
