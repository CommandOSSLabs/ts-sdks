/**
 * Converts a Sui object ID (hex string) to a Walrus Site URL for the given portal.
 * @param objectId - The Sui object ID (hex string, with or without 0x prefix)
 * @param portalDomain - The portal domain, e.g., "portal.example.com"
 * @returns The Walrus Site URL for the portal
 */
export function objectIdToWalrusSiteUrl(
  objectId: string,
  portalDomain = 'localhost:3000',
  https = false
): string {
  // Remove 0x prefix if present
  const cleanObjectId = objectId.startsWith('0x') ? objectId.slice(2) : objectId

  // Convert hex to decimal, then to base36
  const base36Encoded = BigInt(`0x${cleanObjectId}`).toString(36)

  // Construct and return the URL
  return `http${https ? 's' : ''}://${base36Encoded}.${portalDomain}`
}
