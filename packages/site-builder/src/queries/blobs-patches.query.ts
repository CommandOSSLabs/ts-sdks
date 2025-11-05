import { isSupportedNetwork, mainPackage } from '../lib'

/**
 * Response item for a patch in a quilt.
 *
 * > Fetched from https://github.com/MystenLabs/walrus/blob/main/crates/walrus-service/aggregator_openapi.yamlv1/quilts/{quilt_id}/patches
 */
export interface QuiltPatchItem {
  /** The identifier of the patch (e.g., filename). */
  identifier: string
  /** The QuiltPatchId for this patch, encoded as URL-safe base64. */
  patch_id: string
  /** Tags for the patch. */
  tags: Record<string, string>
}

/**
 * Helps fetch patches for a list of blob IDs.
 */
export async function fetchBlobsPatches(
  blobIds: string[],
  network: string
): Promise<Array<QuiltPatchItem>> {
  if (!isSupportedNetwork(network)) throw new Error(`Unsupported network`)
  const { aggregator } = mainPackage[network]
  const patches: Array<QuiltPatchItem> = []
  for (const blobId of blobIds) {
    const res = await fetch(`${aggregator}/v1/quilts/${blobId}/patches`)
    const items = (await res.json()) as Array<QuiltPatchItem>

    // add only unique patches
    patches.push(
      ...items.filter(p => !patches.some(pt => pt.patch_id === p.patch_id))
    )
  }
  return patches
}
