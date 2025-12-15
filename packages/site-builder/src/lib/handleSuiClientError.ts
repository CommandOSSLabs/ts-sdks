import type { ObjectResponseError } from '@mysten/sui/client'

export function handleSuiClientError(error: ObjectResponseError): never {
  switch (error.code) {
    case 'deleted':
      throw new Error('Walrus site has been deleted')
    case 'notExists':
      throw new Error('Walrus site does not exist')
    case 'displayError':
      throw new Error('Failed to fetch Walrus site display data')
    case 'dynamicFieldNotFound':
      throw new Error('Walrus site dynamic field not found')
    default:
      throw new Error(`Unknown error when fetching Walrus site!`)
  }
}
