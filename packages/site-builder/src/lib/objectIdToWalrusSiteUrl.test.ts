import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import { objectIdToWalrusSiteUrl } from './objectIdToWalrusSiteUrl.ts'

const DEFAULT_PORTAL = 'localhost:3000'

describe('objectIdToWalrusSiteUrl', () => {
  test('should convert hex object ID to base36 and construct URL with default portal', () => {
    // Test with a simple hex value
    const objectId =
      '0x3ab40e45cdec0bfcf7dfade85ebf0e7ca57c7c566971757bc5c6792bb66f062e'
    const expected = `http://1go77n7vx36jwo1b8br8q3j0edwik4s37q0875cfs3r4waedke.${DEFAULT_PORTAL}`
    const converted = objectIdToWalrusSiteUrl(objectId)

    assert.equal(converted, expected)
  })

  test('should work with hex object ID without 0x prefix', () => {
    const objectId = '1a2b3c4d5e6f'
    const expected = `http://${BigInt(`0x${objectId}`).toString(36)}.${DEFAULT_PORTAL}`

    assert.equal(objectIdToWalrusSiteUrl(objectId), expected)
  })

  test('should work with custom portal domain', () => {
    const objectId = '0x1a2b3c4d5e6f'
    const customPortal = 'portal.example.com'
    const expected = `http://${BigInt(objectId).toString(36)}.${customPortal}`

    assert.equal(objectIdToWalrusSiteUrl(objectId, customPortal), expected)
  })

  test('should handle large hex values (typical Sui object IDs)', () => {
    // Typical Sui object ID (32 bytes = 64 hex characters)
    const objectId =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    const base36 = BigInt(objectId).toString(36)
    const expected = `http://${base36}.${DEFAULT_PORTAL}`

    assert.equal(objectIdToWalrusSiteUrl(objectId), expected)
  })

  test('should handle edge case of zero value', () => {
    const objectId = '0x0'
    const expected = `http://0.${DEFAULT_PORTAL}`

    assert.equal(objectIdToWalrusSiteUrl(objectId), expected)
  })

  test('should handle edge case of maximum safe integer', () => {
    const objectId = '0x1fffffffffffff' // Number.MAX_SAFE_INTEGER in hex
    const base36 = BigInt(objectId).toString(36)
    const expected = `http://${base36}.${DEFAULT_PORTAL}`

    assert.equal(objectIdToWalrusSiteUrl(objectId), expected)
  })

  test('should produce consistent results for same input', () => {
    const objectId = '0xabcdef123456789'
    const result1 = objectIdToWalrusSiteUrl(objectId)
    const result2 = objectIdToWalrusSiteUrl(objectId)

    assert.equal(result1, result2)
  })

  test('should produce different results for different inputs', () => {
    const objectId1 = '0x123456789abcdef'
    const objectId2 = '0xfedcba987654321'

    const result1 = objectIdToWalrusSiteUrl(objectId1)
    const result2 = objectIdToWalrusSiteUrl(objectId2)

    assert.notEqual(result1, result2)
  })

  describe('URL format validation', () => {
    test('should always return valid HTTPS URLs', () => {
      const testCases = [
        '0x1',
        '0x123',
        '0xabcdef',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ]

      testCases.forEach(objectId => {
        const result = objectIdToWalrusSiteUrl(objectId, DEFAULT_PORTAL, true)
        assert.match(result, /^https:\/\/.+$/)
      })
    })

    test('should use only base36 characters in subdomain', () => {
      const objectId = '0xabcdef123456789'
      const result = objectIdToWalrusSiteUrl(objectId)
      const subdomain = result.split('.')[0].replace('http://', '')

      // Base36 uses 0-9 and a-z
      assert.match(subdomain, /^[0-9a-z]+$/)
    })
  })
})
