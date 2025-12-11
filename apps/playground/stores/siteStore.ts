import { persistentAtom } from '@nanostores/persistent'

export const $siteId = persistentAtom<string>('PUBLISHED_SITE_ID', '')
