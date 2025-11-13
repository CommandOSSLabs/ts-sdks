import type { SiteData, SiteDataDiff } from '~/types'

export function hasUpdate(
  diff: SiteDataDiff | undefined
): diff is SiteDataDiff {
  if (!diff) return false
  if (diff.resources.length > 0) return true
  if (diff.site_name.op !== 'noop') return true
  if (diff.metadata.op !== 'noop') return true
  if (diff.routes?.op !== 'noop') return true
  return false
}

export function computeSiteDataDiff(
  next: SiteData,
  current: SiteData
): SiteDataDiff {
  const resource_ops = computeResourceDiff(current, next)
  const route_ops = computeRoutesDiff(current, next)
  const metadata_ops = computeMetadataDiff(current, next)
  const site_name_ops: SiteDataDiff['site_name'] =
    current.site_name !== next.site_name
      ? { op: 'update', data: next.site_name ?? '' }
      : { op: 'noop' }

  return {
    resources: resource_ops,
    routes: route_ops,
    metadata: metadata_ops,
    site_name: site_name_ops
  }
}

function computeRoutesDiff(
  current: SiteData,
  next: SiteData
): SiteDataDiff['routes'] {
  let route_ops: SiteDataDiff['routes'] = { op: 'update', data: [] }
  const currentRoutePaths = new Map(current.routes || [])
  const nextRoutePaths = new Map(next.routes || [])

  // Find created and updated routes
  for (const [path, resource] of nextRoutePaths) {
    if (
      !currentRoutePaths.has(path) ||
      currentRoutePaths.get(path) !== resource
    ) {
      // Route is new or has changed
      route_ops.data.push([path, resource])
    }
  }
  if (route_ops.data.length === 0) route_ops = { op: 'noop' }
  return route_ops
}

function computeResourceDiff(
  current: SiteData,
  next: SiteData
): SiteDataDiff['resources'] {
  const resource_ops: SiteDataDiff['resources'] = []

  // Create maps for efficient lookup by path
  const currentResMap = new Map(current.resources.map(res => [res.path, res]))
  const nextResMap = new Map(next.resources.map(res => [res.path, res]))

  // Find created and updated resources
  for (const [path, nextResource] of nextResMap) {
    const currentResource = currentResMap.get(path)

    if (!currentResource) {
      // Resource is new - create operation
      resource_ops.push({ op: 'created', data: nextResource })
    } else {
      // Resource exists - check if it has changed by comparing hash
      if (nextResource.blob_hash !== currentResource.blob_hash) {
        resource_ops.push({ op: 'created', data: nextResource })
      }
    }
  }

  // Find deleted resources
  for (const [path, currentResource] of currentResMap) {
    if (!nextResMap.has(path))
      resource_ops.push({ op: 'deleted', data: currentResource })
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
