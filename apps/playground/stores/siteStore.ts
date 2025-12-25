import { persistentAtom } from '@nanostores/persistent'

export const $siteId = persistentAtom<string>('PUBLISHED_SITE_ID', '')

export const $suiNSUrl = persistentAtom<
  Array<{ suins: string; nftId: string }>
>('PUBLISHED_SUINS_URL', [], {
  encode: JSON.stringify,
  decode: JSON.parse
})
