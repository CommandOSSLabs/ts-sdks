// Constants from the Rust code
const BLOB_ID_LENGTH = 32
const QUILT_PATCH_SIZE = 5
const QUILT_PATCH_ID_SIZE = BLOB_ID_LENGTH + QUILT_PATCH_SIZE
const QUILT_PATCH_VERSION_1 = 1

/**
 * Decodes a URL-safe base64 string without padding.
 * In browser, you might need a library like 'js-base64' or implement this.
 */
function decodeUrlSafeBase64NoPad(str: string): Uint8Array {
  // Replace URL-safe chars back to standard base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Converts a byte array to hex string.
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Extracts the patch hex from a quilt patch ID string.
 * @param quiltPatchId The base64-encoded quilt patch ID string
 * @returns The patch hex prefixed with '0x'
 * @throws Error if decoding fails or version is unsupported
 */
export function extractPatchHex(quiltPatchId: string): string {
  // Decode the base64 string
  const bytes = decodeUrlSafeBase64NoPad(quiltPatchId)

  // Must have exactly QUILT_PATCH_ID_SIZE bytes
  if (bytes.length !== QUILT_PATCH_ID_SIZE) {
    throw new Error(
      `Expected ${QUILT_PATCH_ID_SIZE} bytes when decoding quilt-patch-id version 1, got ${bytes.length}`
    )
  }

  // Extract patch_bytes (bytes after the blob_id)
  const patchBytes = bytes.slice(BLOB_ID_LENGTH, QUILT_PATCH_ID_SIZE)

  // Check version
  const version = patchBytes[0]
  if (version !== QUILT_PATCH_VERSION_1) {
    throw new Error(`Quilt patch version ${version} is not implemented`)
  }

  // Convert to hex and prefix with '0x'
  const patchHex = `0x${bytesToHex(patchBytes)}`
  return patchHex
}
