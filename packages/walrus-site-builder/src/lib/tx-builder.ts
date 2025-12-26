import type { Transaction, TransactionArgument } from '@mysten/sui/transactions'
import debug from 'debug'
import type { SiteDataDiff } from '~/types'
import { WalrusSiteTransaction } from './walrus-site-transaction'

const log = debug('site-builder:tx-builder')

export function buildSiteCreationTx(
  siteId: string | undefined,
  diff: SiteDataDiff,
  packageId: string,
  ownerAddr: string
): Transaction {
  const tx = new WalrusSiteTransaction(packageId)
  let commandCount = 0

  // Create or reference Site Object
  let site: TransactionArgument
  if (!siteId) {
    log('Creating new site...')
    if (diff.metadata.op === 'noop')
      throw new Error('Creating site requires metadata')
    if (diff.site_name.op === 'noop')
      throw new Error('Creating site requires site name')

    log('New site metadata', diff.metadata.data)
    const metadata = tx.site_newMetadata(diff.metadata.data)
    log('New site name', diff.site_name.data)
    site = tx.site_newSite(diff.site_name.data, metadata)
  } else {
    log('Updating existing site...')
    site = tx.object(siteId)
    if (diff.metadata.op !== 'noop') {
      log('Updating site metadata', diff.metadata.data)
      log(`[${++commandCount}] Creating new metadata object`)
      const metadata = tx.site_newMetadata(diff.metadata.data)
      log(`[${++commandCount}] Updating site metadata`)
      tx.site_updateMetadata(site, metadata)
    }
    if (diff.site_name.op !== 'noop') {
      log(`[${++commandCount}] Updating site name`, diff.site_name.data)
      tx.site_updateName(site, diff.site_name.data)
    }
  }

  // Update Resources
  for (const { op, data } of diff.resources) {
    switch (op) {
      case 'unchanged':
        continue
      case 'deleted':
        log(`[${++commandCount}] Removing resource`, data.path)
        tx.site_removeResourceIfExists(site, data.path)
        continue
      case 'created': {
        log(`Creating new resource`, data.path)
        log(`[${++commandCount}] Creating new range`, data.range)
        const range = tx.site_newRangeOption(data.range)
        log(`[${++commandCount}] Creating new resource object`)
        const res = tx.site_newResource(data, range)
        for (const { key, value } of data.headers) {
          log(`» [${++commandCount}] Adding header`, [key, value])
          tx.site_addHeader(res, key, value)
        }
        log(`[${++commandCount}] Adding resource to site`)
        tx.site_addResource(site, res)
        break
      }
      case 'removedRoutes':
        log('Removing all routes as part of resource update...')
        log(`[${++commandCount}] Removing existing routes...`)
        tx.site_remoteRoutes(site)
        break
      case 'burnedSite':
        log('Burning site as part of resource update...')
        log(`[${++commandCount}] Burning site object...`)
        tx.site_burn(site)
        break
      default:
        throw new Error(`Unhandled resource operation: ${op}`)
    }
  }

  if (diff.routes.op !== 'noop') {
    log('Updating site routes...')

    log(`[${++commandCount}] Removing existing routes...`)
    tx.site_remoteRoutes(site)

    if (diff.routes.data.length) {
      log(`[${++commandCount}] Creating new Routes object...`)
      tx.site_createRoutes(site)
      for (const [path, val] of diff.routes.data) {
        log(`[${++commandCount}] Inserting route`, path, '->', val)
        tx.site_insertRoute(site, path, val)
      }
    }
  }

  // Transfer site ownership if new site
  if (!siteId) {
    log(`[${++commandCount}] Transferring site ownership to`, ownerAddr)
    tx.transferObjects([site], tx.pure.address(ownerAddr))
  }

  return tx as Transaction
}
