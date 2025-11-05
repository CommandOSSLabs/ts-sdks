import type {
  ObjectOwner,
  SuiTransactionBlockResponse
} from '@mysten/sui/client'

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
function getOwnerAddress(obj: ObjectOwner): string | undefined {
  if (typeof obj !== 'object') return
  if ('AddressOwner' in obj) return obj.AddressOwner
  if ('ObjectOwner' in obj) return obj.ObjectOwner
  if ('ConsensusAddressOwner' in obj) return obj.ConsensusAddressOwner.owner
}
