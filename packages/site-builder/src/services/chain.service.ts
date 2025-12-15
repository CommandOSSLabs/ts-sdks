import type { DynamicFieldInfo, SuiClient } from '@mysten/sui/client'

export class ChainService {
  #suiClient: SuiClient

  constructor(suiClient: SuiClient) {
    this.#suiClient = suiClient
  }

  async fetchSiteDynamicFields(siteId: string): Promise<DynamicFieldInfo[]> {
    const dynamicFields: DynamicFieldInfo[] = []
    let cursor: string | null = null
    while (true) {
      const page = await this.#suiClient.getDynamicFields({
        parentId: siteId,
        cursor
      })
      cursor = page.nextCursor
      dynamicFields.push(...page.data)
      if (!page.hasNextPage) break
    }
    return dynamicFields
  }
}
