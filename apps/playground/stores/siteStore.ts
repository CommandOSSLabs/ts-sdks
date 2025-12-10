import { persistentAtom } from '@nanostores/persistent'

export const $siteId = persistentAtom<string | undefined>('PUBLISHED_SITE_ID')
