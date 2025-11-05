import type { Transaction, TransactionArgument } from '@mysten/sui/transactions'
import debug from 'debug'
import type { SiteDataDiff } from '../types'
import { WalrusSiteTransaction } from './walrus-site-transaction'

const log = debug('site-builder:tx-builder')

export function buildSiteCreationTx(
  siteId: string | undefined,
  diff: SiteDataDiff,
  packageId: string,
  ownerAddr: string
): Transaction {
  const tx = new WalrusSiteTransaction(packageId)

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
      const metadata = tx.site_newMetadata(diff.metadata.data)
      tx.site_updateMetadata(site, metadata)
    }
    if (diff.site_name.op !== 'noop') {
      log('Updating site name', diff.site_name.data)
      tx.site_updateName(site, diff.site_name.data)
    }
  }

  // Update Resources
  for (const { op, data } of diff.resources) {
    if (op === 'unchanged') continue
    if (op === 'deleted') {
      log('Removing resource', data.path)
      tx.site_removeResourceIfExists(site, data.path)
      continue
    }

    log('Creating new resource')
    log('Creating new range', data.range)
    const range = tx.site_newRangeOption(data.range)
    const res = tx.site_newResource(data, range)
    log('Adding headers to resource', data.headers)
    for (const { key, value } of data.headers) {
      log('» Adding header', [key, value])
      tx.site_addHeader(res, key, value)
    }
    tx.site_addResource(site, res)
  }

  if (diff.routes.op !== 'noop') {
    log('Updating site routes...')

    log('Removing existing routes...')
    tx.site_removeAllRoutesIfExist(site)

    if (diff.routes.data.length) {
      log('Creating new Routes object...')
      tx.site_createRoutes(site)
      for (const [path, val] of diff.routes.data) {
        log('Inserting route', path, '->', val)
        tx.site_insertRoute(site, path, val)
      }
    }
  }

  // Transfer site ownership if new site
  if (!siteId) {
    log('Transferring site ownership to', ownerAddr)
    tx.transferObjects([site], tx.pure.address(ownerAddr))
  }

  return tx as Transaction
}
