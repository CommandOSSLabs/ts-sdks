/**
 * Calculates SHA-256 hash of input message.
 * @param message Uint8Array to hash
 * @returns Promise<Uint8Array> Resulting hash as Uint8Array
 */
export async function getSHA256Hash(message: Uint8Array): Promise<Uint8Array> {
  try {
    const hash = await crypto.subtle.digest('SHA-256', new Uint8Array(message))
    return new Uint8Array(hash)
  } catch (error) {
    throw new Error(
      `Failed to compute SHA-256 hash: ${(error as Error).message}`
    )
  }
}

/**
 * Converts a SHA-256 hash (32-byte Uint8Array) to a little-endian bigint (U256).
 * This matches the Rust U256::from_le_bytes behavior.
 */
export function sha256ToU256(hash: Uint8Array): bigint {
  if (hash.length !== 32) throw new Error('Hash must be 32 bytes')
  let result = 0n
  for (let i = 0; i < 32; i++) {
    result |= BigInt(hash[i]) << (8n * BigInt(i)) // little-endian
  }
  return result
}
