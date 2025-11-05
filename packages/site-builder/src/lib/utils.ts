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
