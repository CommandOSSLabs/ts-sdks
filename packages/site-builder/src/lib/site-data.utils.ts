import debug from 'debug'
import type { SiteData, SiteDataDiff } from '~/types'

const log = debug('site-builder:site-data-utils')

export function hasUpdate(
  diff: SiteDataDiff | undefined
): diff is SiteDataDiff {
  if (!diff) return false
  // Check if there are any non-unchanged resource operations
  if (diff.resources.some(r => r.op !== 'unchanged')) return true
  if (diff.site_name.op !== 'noop') return true
  if (diff.metadata.op !== 'noop') return true
  if (diff.routes?.op !== 'noop') return true
  return false
}

export function computeSiteDataDiff(
  next: SiteData,
  current: SiteData
): SiteDataDiff {
  log('🧮 Compute site data diff...')
  log('» Current site data:', current)
  log('» Next site data:', next)

  const resource_ops = computeResourceDiff(current, next)
  const route_ops = computeRoutesDiff(current, next)
  const metadata_ops = computeMetadataDiff(current, next)
  const site_name_ops: SiteDataDiff['site_name'] =
    current.site_name !== next.site_name
      ? { op: 'update', data: next.site_name ?? '' }
      : { op: 'noop' }

  const result: SiteDataDiff = {
    resources: resource_ops,
    routes: route_ops,
    metadata: metadata_ops,
    site_name: site_name_ops
  }
  log('✅ Computed site data diff:', result)

  return result
}

function computeRoutesDiff(
  current: SiteData,
  next: SiteData
): SiteDataDiff['routes'] {
  const currentRoutePaths = new Map(current.routes || [])
  const nextRoutePaths = new Map(next.routes || [])

  // Check if there are any changes (added, modified, or deleted routes)
  let hasChanges = false

  // Check for new or modified routes
  for (const [path, resource] of nextRoutePaths) {
    if (
      !currentRoutePaths.has(path) ||
      currentRoutePaths.get(path) !== resource
    ) {
      hasChanges = true
      break
    }
  }

  // Check for deleted routes
  if (!hasChanges) {
    for (const path of currentRoutePaths.keys()) {
      if (!nextRoutePaths.has(path)) {
        hasChanges = true
        break
      }
    }
  }

  // If no changes, return noop
  if (!hasChanges) return { op: 'noop' }

  // Return update with all routes (unchanged + changed)
  return { op: 'update', data: next.routes ?? [] }
}

function computeResourceDiff(
  current: SiteData,
  next: SiteData
): SiteDataDiff['resources'] {
  const resource_ops: SiteDataDiff['resources'] = []

  // Create maps for efficient lookup by path
  const currentResMap = new Map(current.resources.map(res => [res.path, res]))
  const nextResMap = new Map(next.resources.map(res => [res.path, res]))

  // Collect delete operations first (matching Rust's ordering: delete -> create -> unchanged)
  // This ensures resources are removed before new ones are added at the same path
  for (const [path, currentResource] of currentResMap) {
    const nextResource = nextResMap.get(path)
    // Delete if: resource no longer exists OR resource has changed (different hash)
    if (!nextResource || nextResource.blob_hash !== currentResource.blob_hash) {
      resource_ops.push({ op: 'deleted', data: currentResource })
    }
  }

  // Then collect create operations
  for (const [path, nextResource] of nextResMap) {
    const currentResource = currentResMap.get(path)
    // Create if: resource is new OR resource has changed (different hash)
    if (
      !currentResource ||
      nextResource.blob_hash !== currentResource.blob_hash
    ) {
      resource_ops.push({ op: 'created', data: nextResource })
    }
  }

  // Finally collect unchanged operations
  for (const [path, nextResource] of nextResMap) {
    const currentResource = currentResMap.get(path)
    // Unchanged if: resource exists and hash matches
    if (
      currentResource &&
      nextResource.blob_hash === currentResource.blob_hash
    ) {
      resource_ops.push({ op: 'unchanged', data: currentResource })
    }
  }

  return resource_ops
}

function computeMetadataDiff(
  current: SiteData,
  next: SiteData
): SiteDataDiff['metadata'] {
  // If both are undefined/null, no change
  if (!current.metadata && !next.metadata) return { op: 'noop' }

  // If one is undefined/null and the other isn't, it's a change
  if (!current.metadata || !next.metadata)
    return { op: 'update', data: next.metadata ?? {} }

  // Compare each property individually
  const isChanged =
    current.metadata.link !== next.metadata.link ||
    current.metadata.image_url !== next.metadata.image_url ||
    current.metadata.description !== next.metadata.description ||
    current.metadata.project_url !== next.metadata.project_url ||
    current.metadata.creator !== next.metadata.creator

  return isChanged ? { op: 'update', data: next.metadata } : { op: 'noop' }
}
