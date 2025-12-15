import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import type { SuiClient } from '@mysten/sui/client'
import { WalrusFile } from '@mysten/walrus'
import { computeSiteDataDiff } from '../lib/site-data.utils.ts'
import type {
  SiteData,
  SiteDataDiff,
  SuiResource,
  WSResources
} from '../types.ts'

// ##########################################################################
// #region Mock Helpers
// ##########################################################################

/**
 * Simple content type detection for testing (mirrors contentTypeFromFilePath)
 */
function getContentType(path: string): string {
  const ext = path.toLowerCase().split('.').pop() || ''
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml'
  }
  return types[ext] || 'application/octet-stream'
}

/**
 * Simplified SiteService for testing that doesn't depend on content.ts enum
 */
class TestSiteService {
  #getSiteDataFromChain: (siteId: string) => Promise<SiteData>

  constructor(
    _suiClient: SuiClient,
    getSiteDataFromChain: (siteId: string) => Promise<SiteData>
  ) {
    this.#getSiteDataFromChain = getSiteDataFromChain
  }

  async calculateSiteDiff(
    files: WalrusFile[],
    wsResources: WSResources,
    siteId?: string
  ): Promise<SiteDataDiff> {
    // Build the next site data from provided files
    const nextSiteData = await this.#buildSiteDataFromFiles(files, wsResources)

    // If no siteId, treat as new site (compare against empty site)
    if (!siteId) {
      const emptySiteData: SiteData = { resources: [] }
      return computeSiteDataDiff(nextSiteData, emptySiteData)
    }

    // Fetch existing site data from chain
    const existingSiteData = await this.#getSiteDataFromChain(siteId)
    return computeSiteDataDiff(nextSiteData, existingSiteData)
  }

  async #buildSiteDataFromFiles(
    files: WalrusFile[],
    wsResources: WSResources
  ): Promise<SiteData> {
    const resources: SuiResource[] = []

    for (const file of files) {
      const content = await file.bytes()
      const path = (await file.getIdentifier()) ?? ''
      // Use simple hash for testing
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        content as Uint8Array<ArrayBuffer>
      )
      const hashArray = new Uint8Array(hashBuffer)
      let hashBigInt = 0n
      for (let i = 0; i < hashArray.length; i++) {
        hashBigInt |= BigInt(hashArray[i]) << BigInt(8 * i)
      }

      const resource: SuiResource = {
        path,
        blob_id: '<pending>',
        blob_hash: hashBigInt.toString(),
        headers: wsResources.headers ?? [
          { key: 'content-encoding', value: 'identity' },
          { key: 'content-type', value: getContentType(path) }
        ]
      }
      resources.push(resource)
    }

    return {
      resources,
      routes: wsResources.routes,
      site_name: wsResources.site_name,
      metadata: wsResources.metadata
    }
  }
}

function createMockSuiClient(): SuiClient {
  return {
    network: 'testnet'
  } as unknown as SuiClient
}

function createMockGetSiteData(
  siteData: SiteData
): (siteId: string) => Promise<SiteData> {
  return async () => siteData
}

function createWalrusFile(path: string, content: string): WalrusFile {
  const encoder = new TextEncoder()
  return WalrusFile.from({
    contents: encoder.encode(content),
    identifier: path
  })
}

function createDefaultWSResources(
  overrides?: Partial<WSResources>
): WSResources {
  return {
    site_name: 'Test Site',
    metadata: {
      description: 'A test site',
      link: 'https://test.com'
    },
    routes: [['/', '/index.html']],
    ...overrides
  }
}

// #endregion

// ##########################################################################
// #region SiteService Tests
// ##########################################################################

describe('SiteService', () => {
  describe('calculateSiteDiff', () => {
    describe('when siteId is undefined (new site)', () => {
      test('should return all resources as created', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files = [
          createWalrusFile('/index.html', '<html>Hello</html>'),
          createWalrusFile('/styles.css', 'body { color: red; }')
        ]
        const wsResources = createDefaultWSResources()

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        // All resources should be created
        assert.equal(diff.resources.length, 2)
        assert.ok(diff.resources.every(r => r.op === 'created'))

        // Check paths
        const paths = diff.resources.map(r => r.data.path)
        assert.ok(paths.includes('/index.html'))
        assert.ok(paths.includes('/styles.css'))
      })

      test('should set site_name as update when provided', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({
          site_name: 'My New Site'
        })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.deepEqual(diff.site_name, { op: 'update', data: 'My New Site' })
      })

      test('should set routes as update when provided', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({
          routes: [
            ['/', '/index.html'],
            ['/home', '/index.html']
          ]
        })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.equal(diff.routes.op, 'update')
        if (diff.routes.op === 'update') {
          assert.equal(diff.routes.data.length, 2)
        }
      })

      test('should set metadata as update when provided', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({
          metadata: {
            description: 'My awesome site',
            creator: 'test-user'
          }
        })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.equal(diff.metadata.op, 'update')
        if (diff.metadata.op === 'update') {
          assert.equal(diff.metadata.data.description, 'My awesome site')
          assert.equal(diff.metadata.data.creator, 'test-user')
        }
      })
    })

    describe('when siteId is provided (existing site)', () => {
      test('should detect new resources as created', async () => {
        // Existing site has only index.html
        const existingSiteData: SiteData = {
          site_name: 'Existing Site',
          resources: [
            {
              path: '/index.html',
              blob_id: 'existing-blob-id',
              blob_hash: 'existing-hash',
              headers: [{ key: 'content-type', value: 'text/html' }]
            }
          ]
        }

        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData(existingSiteData)
        )

        // New deployment adds styles.css
        const files = [
          createWalrusFile('/index.html', '<html>Hello</html>'),
          createWalrusFile('/styles.css', 'body { color: red; }')
        ]
        const wsResources = createDefaultWSResources({
          site_name: 'Existing Site'
        })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          '0xsite123'
        )

        // Should have operations for both files
        // index.html is modified (different hash), styles.css is new
        const createdOps = diff.resources.filter(r => r.op === 'created')
        assert.ok(
          createdOps.length >= 1,
          'Should have at least one created resource'
        )

        const stylesOp = createdOps.find(r => r.data.path === '/styles.css')
        assert.ok(stylesOp, 'styles.css should be created')
      })

      test('should detect deleted resources', async () => {
        // Existing site has index.html and old-file.html
        const existingSiteData: SiteData = {
          site_name: 'Existing Site',
          resources: [
            {
              path: '/index.html',
              blob_id: 'existing-blob-id',
              blob_hash: 'existing-hash',
              headers: [{ key: 'content-type', value: 'text/html' }]
            },
            {
              path: '/old-file.html',
              blob_id: 'old-blob-id',
              blob_hash: 'old-hash',
              headers: [{ key: 'content-type', value: 'text/html' }]
            }
          ]
        }

        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData(existingSiteData)
        )

        // New deployment only has index.html (old-file.html removed)
        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({
          site_name: 'Existing Site'
        })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          '0xsite123'
        )

        const deletedOps = diff.resources.filter(r => r.op === 'deleted')
        assert.equal(deletedOps.length, 1, 'Should have one deleted resource')
        assert.equal(deletedOps[0].data.path, '/old-file.html')
      })

      test('should return noop for site_name when unchanged', async () => {
        const existingSiteData: SiteData = {
          site_name: 'Same Name',
          resources: []
        }

        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData(existingSiteData)
        )

        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({ site_name: 'Same Name' })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          '0xsite123'
        )

        assert.deepEqual(diff.site_name, { op: 'noop' })
      })
    })

    describe('edge cases', () => {
      test('should handle empty files array for new site', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files: WalrusFile[] = []
        const wsResources = createDefaultWSResources()

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.equal(diff.resources.length, 0)
      })

      test('should apply default headers when not provided in wsResources', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources: WSResources = {
          site_name: 'Test'
          // No headers provided
        }

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.equal(diff.resources.length, 1)
        const resource = diff.resources[0].data
        assert.ok(resource.headers.some(h => h.key === 'content-type'))
        assert.ok(resource.headers.some(h => h.key === 'content-encoding'))
      })

      test('should use custom headers when provided in wsResources', async () => {
        const mockClient = createMockSuiClient()
        const service = new TestSiteService(
          mockClient,
          createMockGetSiteData({ resources: [] })
        )

        const customHeaders = [
          { key: 'x-custom-header', value: 'custom-value' },
          { key: 'content-type', value: 'text/plain' }
        ]
        const files = [createWalrusFile('/index.html', '<html>Hello</html>')]
        const wsResources = createDefaultWSResources({ headers: customHeaders })

        const diff = await service.calculateSiteDiff(
          files,
          wsResources,
          undefined
        )

        assert.equal(diff.resources.length, 1)
        const resource = diff.resources[0].data
        assert.deepEqual(resource.headers, customHeaders)
      })
    })
  })
})
