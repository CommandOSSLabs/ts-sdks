import type {
  ObjectOwner,
  SuiTransactionBlockResponse
} from '@mysten/sui/client'
import { fromBase64 } from '@mysten/sui/utils'

/**
 * Get the object id of the site that was published in the transaction.
 *
 * @param address - The address of the owner to search for
 * @param response - The Sui transaction block response containing the transaction effects
 * @returns The object ID of the created site, or undefined if not found. This can happen if,
 * for example, no object owned by the provided `address` was created
 * in the transaction, or if the transaction did not result in the expected object creation
 * structure that this function relies on.
 */
export function getSiteIdFromResponse(
  address: string,
  response: SuiTransactionBlockResponse
): string | undefined {
  return response?.effects?.created?.find(
    e => getOwnerAddress(e.owner) === address
  )?.reference.objectId
}

/**
 * Extracts the address from different types of object owners.
 *
 * @remarks This function will return address of both AddressOwner and ObjectOwner,
 * address of ObjectOwner is converted from object id, even though the type is SuiAddress.
 *
 * @param obj - The object owner to extract the address from
 * @returns The address string associated with the owner, `undefined` if not found
 */
export function getOwnerAddress(obj: ObjectOwner): string | undefined {
  if (typeof obj !== 'object') return
  if ('AddressOwner' in obj) return obj.AddressOwner
  if ('ObjectOwner' in obj) return obj.ObjectOwner
  if ('ConsensusAddressOwner' in obj) return obj.ConsensusAddressOwner.owner
}

export function patchIdToU256(patchId: string): bigint {
  // Convert URL-safe base64 to standard base64
  let standardBase64 = patchId.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if needed
  const paddingNeeded = (4 - (standardBase64.length % 4)) % 4
  standardBase64 += '='.repeat(paddingNeeded)

  // Decode base64
  const bytes = fromBase64(standardBase64)
  // Take the first 32 bytes
  const blobIdBytes = bytes.slice(0, 32)
  // Convert to bigint (little-endian)
  let result = 0n
  for (let i = 0; i < 32; i++) {
    result += BigInt(blobIdBytes[i]) << (8n * BigInt(i))
  }
  return result
}
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
