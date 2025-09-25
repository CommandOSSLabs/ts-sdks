import type { WalrusClient } from '@mysten/walrus'
import { contentTypeFromFilePath } from './content'
import { QUILT_PATCH_ID_INTERNAL_HEADER } from './lib/constatnts'
import type { IAsset, Resource, SiteData, WSResources } from './types'

export class ResourceManager {
  constructor(
    public walrus: WalrusClient,
    private wsResource: WSResources
  ) {}

  /**
   * Get the site data from the provided assets.
   * @param assets The assets to process.
   * @returns The site data.
   */
  async getSiteData(assets: IAsset[]): Promise<SiteData> {
    const resources: Resource[] = []
    for (const file of assets) {
      const resource: Resource = {
        full_path: file.path,
        unencoded_size: file.content.length,
        info: {
          blob_id: '<unknown>',
          blob_id_le_u256: 0n,
          blob_hash: file.hash,
          blob_hash_le_u256: file.hashU256,
          headers: this.wsResource.headers ?? {
            'content-encoding': 'identity',
            'content-type': contentTypeFromFilePath(file.path),
            [QUILT_PATCH_ID_INTERNAL_HEADER]: '<unknown>'
          },
          path: file.path
        }
      }

      resources.push(resource)
    }
    return {
      resources,
      routes: this.wsResource.routes,
      site_name: this.wsResource.site_name,
      metadata: this.wsResource.metadata
    }
  }

  /**
   * Check if the given path is ignored.
   * @param path The path to check.
   * @returns True if the path is ignored, false otherwise.
   */
  isIgnored(path: string): boolean {
    return this.wsResource.ignore?.some(pattern => path.match(pattern)) ?? false
  }
}
