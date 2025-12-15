import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import type { SiteData, SiteDataDiff } from '~/types'
import { computeSiteDataDiff, hasUpdate } from './site-data.utils.ts'

// ##########################################################################
// #region Sample Data Generators
// ##########################################################################

/**
 * Creates a complete SiteData object with all resources
 */
function createCompleteSiteData(variant = 'default'): SiteData {
  const suffix = variant === 'default' ? '' : `-${variant}`

  return {
    site_name: `My Site${suffix}`,
    resources: [
      {
        path: '/index.html',
        headers: [
          { key: 'Content-Type', value: 'text/html' },
          { key: 'Cache-Control', value: 'max-age=3600' }
        ],
        blob_id: `blob-id-index${suffix}`,
        blob_hash: `hash-index${suffix}`
      },
      {
        path: '/styles.css',
        headers: [{ key: 'Content-Type', value: 'text/css' }],
        blob_id: `blob-id-css${suffix}`,
        blob_hash: `hash-css${suffix}`
      },
      {
        path: '/image.svg',
        headers: [{ key: 'Content-Type', value: 'image/svg+xml' }],
        blob_id: `blob-id-svg${suffix}`,
        blob_hash: `hash-svg${suffix}`
      },
      {
        path: '/script.js',
        headers: [{ key: 'Content-Type', value: 'application/javascript' }],
        blob_id: `blob-id-js${suffix}`,
        blob_hash: `hash-js${suffix}`
      }
    ],
    routes: [
      ['/', '/index.html'],
      ['/home', '/index.html'],
      ['/about', '/about.html']
    ],
    metadata: {
      link: `https://example${suffix}.com`,
      image_url: `https://example${suffix}.com/image.png`,
      description: `A sample site${suffix}`,
      project_url: `https://github.com/example${suffix}`,
      creator: `creator${suffix}`
    }
  }
}

/**
 * Creates a minimal SiteData object
 */
function createMinimalSiteData(): SiteData {
  return {
    resources: [
      {
        path: '/index.html',
        headers: [{ key: 'Content-Type', value: 'text/html' }],
        blob_id: 'blob-id-minimal',
        blob_hash: 'hash-minimal'
      }
    ]
  }
}

/**
 * Creates an empty SiteData object
 */
function createEmptySiteData(): SiteData {
  return {
    resources: []
  }
}

// #endregion

// ##########################################################################
// #region hasUpdate Tests
// ##########################################################################

describe('hasUpdate', () => {
  test('should return false for undefined diff', () => {
    assert.equal(hasUpdate(undefined), false)
  })

  test('should return false for diff with no operations', () => {
    const diff: SiteDataDiff = {
      resources: [],
      routes: { op: 'noop' },
      metadata: { op: 'noop' },
      site_name: { op: 'noop' }
    }
    assert.equal(hasUpdate(diff), false)
  })

  test('should return true when resources have changes', () => {
    const diff: SiteDataDiff = {
      resources: [
        {
          op: 'created',
          data: {
            path: '/index.html',
            headers: [],
            blob_id: 'blob-1',
            blob_hash: 'hash-1'
          }
        }
      ],
      routes: { op: 'noop' },
      metadata: { op: 'noop' },
      site_name: { op: 'noop' }
    }
    assert.equal(hasUpdate(diff), true)
  })

  test('should return true when site_name has update', () => {
    const diff: SiteDataDiff = {
      resources: [],
      routes: { op: 'noop' },
      metadata: { op: 'noop' },
      site_name: { op: 'update', data: 'New Site Name' }
    }
    assert.equal(hasUpdate(diff), true)
  })

  test('should return true when metadata has update', () => {
    const diff: SiteDataDiff = {
      resources: [],
      routes: { op: 'noop' },
      metadata: {
        op: 'update',
        data: { description: 'New description' }
      },
      site_name: { op: 'noop' }
    }
    assert.equal(hasUpdate(diff), true)
  })

  test('should return true when routes have update', () => {
    const diff: SiteDataDiff = {
      resources: [],
      routes: { op: 'update', data: [['/new', '/new.html']] },
      metadata: { op: 'noop' },
      site_name: { op: 'noop' }
    }
    assert.equal(hasUpdate(diff), true)
  })

  test('should return true when multiple fields have updates', () => {
    const diff: SiteDataDiff = {
      resources: [
        {
          op: 'deleted',
          data: {
            path: '/old.html',
            headers: [],
            blob_id: 'blob-old',
            blob_hash: 'hash-old'
          }
        }
      ],
      routes: { op: 'update', data: [['/new', '/new.html']] },
      metadata: { op: 'update', data: { creator: 'New Creator' } },
      site_name: { op: 'update', data: 'Updated Site' }
    }
    assert.equal(hasUpdate(diff), true)
  })
})

// #endregion

// ##########################################################################
// #region computeSiteDataDiff Tests
// ##########################################################################

describe('computeSiteDataDiff', () => {
  describe('basic equality', () => {
    test('should return no operations when sites are identical', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      const diff = computeSiteDataDiff(next, current)

      // All 4 resources should be marked as unchanged
      assert.equal(diff.resources.length, 4)
      assert.ok(diff.resources.every(r => r.op === 'unchanged'))
      assert.equal(diff.routes.op, 'noop')
      assert.equal(diff.metadata.op, 'noop')
      assert.equal(diff.site_name.op, 'noop')
      assert.equal(hasUpdate(diff), false)
    })

    test('should return no operations for minimal identical sites', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()
      const diff = computeSiteDataDiff(next, current)

      // 1 resource should be marked as unchanged
      assert.equal(diff.resources.length, 1)
      assert.equal(diff.resources[0].op, 'unchanged')
      assert.equal(hasUpdate(diff), false)
    })

    test('should return no operations for empty sites', () => {
      const current = createEmptySiteData()
      const next = createEmptySiteData()
      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.resources.length, 0)
      assert.equal(hasUpdate(diff), false)
    })
  })

  describe('site_name changes', () => {
    test('should detect site_name change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.site_name = 'Updated Site Name'

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.site_name.op, 'update')
      if (diff.site_name.op === 'update') {
        assert.equal(diff.site_name.data, 'Updated Site Name')
      }
      assert.equal(hasUpdate(diff), true)
    })

    test('should handle site_name change from undefined to defined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()
      next.site_name = 'New Site Name'

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.site_name.op, 'update')
      if (diff.site_name.op === 'update') {
        assert.equal(diff.site_name.data, 'New Site Name')
      }
    })

    test('should handle site_name change from defined to undefined', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.site_name = undefined

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.site_name.op, 'update')
      if (diff.site_name.op === 'update') {
        assert.equal(diff.site_name.data, '')
      }
    })

    test('should handle no change when both site_names are undefined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.site_name.op, 'noop')
    })
  })

  describe('resource changes', () => {
    test('should detect new resources', () => {
      const current = createMinimalSiteData()
      const next = createCompleteSiteData()

      const diff = computeSiteDataDiff(next, current)

      // Should have 3 new resources (css, svg, js) plus index.html changed
      assert.equal(diff.resources.filter(r => r.op === 'created').length, 4)
      assert.equal(hasUpdate(diff), true)
    })

    test('should detect deleted resources', () => {
      const current = createCompleteSiteData()
      const next = createMinimalSiteData()

      const diff = computeSiteDataDiff(next, current)

      // Should have 3 deleted resources (css, svg, js) plus index.html changed
      const deletedCount = diff.resources.filter(r => r.op === 'deleted').length
      assert.equal(deletedCount, 3)
      assert.equal(hasUpdate(diff), true)
    })

    test('should detect updated resources by blob_hash', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.resources[0].blob_hash = 'updated-hash'

      const diff = computeSiteDataDiff(next, current)

      const createdOps = diff.resources.filter(r => r.op === 'created')
      assert.equal(createdOps.length, 1)
      assert.equal(createdOps[0].data.path, '/index.html')
      assert.equal(createdOps[0].data.blob_hash, 'updated-hash')
    })

    test('should handle multiple resource changes simultaneously', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()

      // Update one resource
      next.resources[0].blob_hash = 'updated-hash-1'

      // Remove one resource
      next.resources = next.resources.filter(r => r.path !== '/styles.css')

      // Add a new resource
      next.resources.push({
        path: '/new-file.txt',
        headers: [{ key: 'Content-Type', value: 'text/plain' }],
        blob_id: 'blob-id-new',
        blob_hash: 'hash-new'
      })

      const diff = computeSiteDataDiff(next, current)

      const created = diff.resources.filter(r => r.op === 'created')
      const deleted = diff.resources.filter(r => r.op === 'deleted')

      // 2 created: updated index.html + new file
      assert.equal(created.length, 2)
      // 1 deleted: styles.css
      assert.equal(deleted.length, 1)
      assert.equal(deleted[0].data.path, '/styles.css')
    })

    test('should handle empty to populated resources', () => {
      const current = createEmptySiteData()
      const next = createCompleteSiteData()

      const diff = computeSiteDataDiff(next, current)

      const created = diff.resources.filter(r => r.op === 'created')
      assert.equal(created.length, 4) // All 4 resources are new
    })

    test('should handle populated to empty resources', () => {
      const current = createCompleteSiteData()
      const next = createEmptySiteData()

      const diff = computeSiteDataDiff(next, current)

      const deleted = diff.resources.filter(r => r.op === 'deleted')
      assert.equal(deleted.length, 4) // All 4 resources are deleted
    })

    test('should preserve resource data in operations', () => {
      const current = createEmptySiteData()
      const next: SiteData = {
        resources: [
          {
            path: '/test.html',
            headers: [
              { key: 'Content-Type', value: 'text/html' },
              { key: 'Cache-Control', value: 'no-cache' }
            ],
            blob_id: 'test-blob-id',
            blob_hash: 'test-hash',
            range: { start: 0, end: 100 }
          }
        ]
      }

      const diff = computeSiteDataDiff(next, current)

      const created = diff.resources.filter(r => r.op === 'created')
      assert.equal(created.length, 1)

      const resource = created[0].data
      assert.equal(resource.path, '/test.html')
      assert.equal(resource.blob_id, 'test-blob-id')
      assert.equal(resource.blob_hash, 'test-hash')
      assert.equal(resource.headers.length, 2)
      assert.deepEqual(resource.range, { start: 0, end: 100 })
    })
  })

  describe('routes changes', () => {
    test('should detect new routes', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()
      next.routes = [['/new', '/new.html']]

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        assert.equal(diff.routes.data.length, 1)
        assert.deepEqual(diff.routes.data[0], ['/new', '/new.html'])
      }
    })

    test('should detect changed routes', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.routes = [['/', '/different.html']]

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        assert.equal(diff.routes.data.length, 1)
        assert.deepEqual(diff.routes.data[0], ['/', '/different.html'])
      }
    })

    test('should detect additional routes', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.routes = current.routes
        ? [...current.routes, ['/extra', '/extra.html']]
        : [['/extra', '/extra.html']]

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        // Should include all routes (unchanged + new)
        assert.equal(diff.routes.data.length, 4)
        assert.ok(diff.routes.data.some(r => r[0] === '/extra'))
      }
    })

    test('should handle routes change from undefined to defined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()
      next.routes = [['/new', '/new.html']]

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
    })

    test('should handle routes change from defined to undefined', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.routes = undefined

      const diff = computeSiteDataDiff(next, current)

      // Removing all routes is an update (routes become empty)
      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        assert.equal(diff.routes.data.length, 0)
      }
    })

    test('should handle no change when both routes are undefined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'noop')
    })

    test('should handle identical routes', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'noop')
    })

    test('should detect removed routes', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.routes = [['/home', '/index.html']] // Only keep one route

      const diff = computeSiteDataDiff(next, current)

      // Removing routes is an update - data contains all remaining routes
      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        assert.equal(diff.routes.data.length, 1)
        assert.deepEqual(diff.routes.data[0], ['/home', '/index.html'])
      }
    })

    test('should detect route target change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      // Change where '/' points to
      if (next.routes) {
        next.routes[0] = ['/', '/home.html']
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
      if (diff.routes.op === 'update') {
        // Should include all routes (unchanged + changed)
        assert.equal(diff.routes.data.length, 3)
        assert.ok(
          diff.routes.data.some(r => r[0] === '/' && r[1] === '/home.html')
        )
      }
    })
  })

  describe('metadata changes', () => {
    test('should detect metadata link change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.link = 'https://newlink.com'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(diff.metadata.data.link, 'https://newlink.com')
      }
    })

    test('should detect metadata image_url change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.image_url = 'https://newimage.com/img.png'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(
          diff.metadata.data.image_url,
          'https://newimage.com/img.png'
        )
      }
    })

    test('should detect metadata description change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.description = 'Updated description'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(diff.metadata.data.description, 'Updated description')
      }
    })

    test('should detect metadata project_url change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.project_url = 'https://github.com/newproject'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(
          diff.metadata.data.project_url,
          'https://github.com/newproject'
        )
      }
    })

    test('should detect metadata creator change', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.creator = 'New Creator'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(diff.metadata.data.creator, 'New Creator')
      }
    })

    test('should detect multiple metadata field changes', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      if (next.metadata) {
        next.metadata.link = 'https://newlink.com'
        next.metadata.description = 'New description'
        next.metadata.creator = 'New creator'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(diff.metadata.data.link, 'https://newlink.com')
        assert.equal(diff.metadata.data.description, 'New description')
        assert.equal(diff.metadata.data.creator, 'New creator')
      }
    })

    test('should handle metadata change from undefined to defined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()
      next.metadata = {
        link: 'https://example.com',
        description: 'A new site'
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.equal(diff.metadata.data.link, 'https://example.com')
        assert.equal(diff.metadata.data.description, 'A new site')
      }
    })

    test('should handle metadata change from defined to undefined', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()
      next.metadata = undefined

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
      if (diff.metadata.op === 'update') {
        assert.deepEqual(diff.metadata.data, {})
      }
    })

    test('should handle no change when both metadata are undefined', () => {
      const current = createMinimalSiteData()
      const next = createMinimalSiteData()

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'noop')
    })

    test('should handle identical metadata', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData()

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'noop')
    })

    test('should handle partial metadata objects', () => {
      const current: SiteData = {
        resources: [],
        metadata: {
          link: 'https://example.com'
        }
      }
      const next: SiteData = {
        resources: [],
        metadata: {
          link: 'https://example.com',
          description: 'Added description'
        }
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'update')
    })
  })

  describe('complex scenarios', () => {
    test('should handle complete site update with all fields changed', () => {
      const current = createCompleteSiteData()
      const next = createCompleteSiteData('v2')

      // Also change routes to be different
      next.routes = [
        ['/', '/index.html'],
        ['/different', '/different.html']
      ]

      const diff = computeSiteDataDiff(next, current)

      // All resources should be updated (different hashes)
      assert.ok(diff.resources.length > 0)
      assert.equal(diff.site_name.op, 'update')
      assert.equal(diff.metadata.op, 'update')
      assert.equal(diff.routes.op, 'update')
      assert.equal(hasUpdate(diff), true)
    })

    test('should handle site with only some fields present', () => {
      const current: SiteData = {
        resources: [
          {
            path: '/index.html',
            headers: [],
            blob_id: 'blob-1',
            blob_hash: 'hash-1'
          }
        ],
        site_name: 'Site'
      }

      const next: SiteData = {
        resources: [
          {
            path: '/index.html',
            headers: [],
            blob_id: 'blob-1',
            blob_hash: 'hash-1'
          }
        ],
        site_name: 'Site',
        routes: [['/test', '/test.html']],
        metadata: { description: 'Test' }
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'update')
      assert.equal(diff.metadata.op, 'update')
      assert.equal(diff.site_name.op, 'noop')
      // 1 resource should be marked as unchanged
      assert.equal(diff.resources.length, 1)
      assert.equal(diff.resources[0].op, 'unchanged')
    })

    test('should correctly handle sites with resources having range property', () => {
      const current: SiteData = {
        resources: [
          {
            path: '/large-file.bin',
            headers: [],
            blob_id: 'blob-1',
            blob_hash: 'hash-1',
            range: { start: 0, end: 1000 }
          }
        ]
      }

      const next: SiteData = {
        resources: [
          {
            path: '/large-file.bin',
            headers: [],
            blob_id: 'blob-2',
            blob_hash: 'hash-2',
            range: { start: 1000, end: 2000 }
          }
        ]
      }

      const diff = computeSiteDataDiff(next, current)

      const created = diff.resources.filter(r => r.op === 'created')
      assert.equal(created.length, 1)
      assert.deepEqual(created[0].data.range, { start: 1000, end: 2000 })
    })

    test('should handle empty routes array vs undefined routes', () => {
      const current: SiteData = {
        resources: [],
        routes: []
      }

      const next: SiteData = {
        resources: [],
        routes: undefined
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.routes.op, 'noop')
    })

    test('should handle empty metadata object', () => {
      const current: SiteData = {
        resources: [],
        metadata: {}
      }

      const next: SiteData = {
        resources: [],
        metadata: {}
      }

      const diff = computeSiteDataDiff(next, current)

      assert.equal(diff.metadata.op, 'noop')
    })

    test('should properly differentiate resources with same path but different content', () => {
      const current: SiteData = {
        resources: [
          {
            path: '/file.txt',
            headers: [],
            blob_id: 'blob-v1',
            blob_hash: 'hash-v1'
          },
          {
            path: '/other.txt',
            headers: [],
            blob_id: 'blob-other',
            blob_hash: 'hash-other'
          }
        ]
      }

      const next: SiteData = {
        resources: [
          {
            path: '/file.txt',
            headers: [],
            blob_id: 'blob-v2',
            blob_hash: 'hash-v2' // Changed content
          },
          {
            path: '/other.txt',
            headers: [],
            blob_id: 'blob-other',
            blob_hash: 'hash-other' // Same content
          }
        ]
      }

      const diff = computeSiteDataDiff(next, current)

      const created = diff.resources.filter(r => r.op === 'created')
      assert.equal(created.length, 1)
      assert.equal(created[0].data.path, '/file.txt')
      assert.equal(created[0].data.blob_hash, 'hash-v2')
    })
  })
})

// #endregion
