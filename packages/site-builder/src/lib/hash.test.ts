import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'
import { sha256ToU256 } from './hash'

describe('sha256ToU256', () => {
  // Tests verify that sha256ToU256 matches Rust's U256::from_le_bytes behavior
  test('should convert 32-byte hash to BigInt correctly using little-endian', () => {
    // Test case 1: All zeros
    const hash1 = new Uint8Array(32).fill(0)
    const expected1 = 0n
    assert.equal(sha256ToU256(hash1), expected1)
  })

  test('should convert hash with single byte set', () => {
    // Test case 2: Single byte at position 0
    const hash2 = new Uint8Array(32)
    hash2[0] = 1
    const expected2 = 1n
    assert.equal(sha256ToU256(hash2), expected2)
  })

  test('should convert hash with single byte at different position', () => {
    // Test case 3: Single byte at position 1
    const hash3 = new Uint8Array(32)
    hash3[1] = 1
    const expected3 = 256n // 1 << 8
    assert.equal(sha256ToU256(hash3), expected3)
  })

  test('should convert realistic SHA256 hash case 1', () => {
    // Test case 4: Realistic hash from "hello world"
    const hash4 = new Uint8Array([
      0xb9, 0x4d, 0x27, 0xb9, 0x93, 0x4d, 0x3e, 0x08, 0xa5, 0x2e, 0x52, 0xd7,
      0xda, 0x7d, 0xab, 0xfa, 0xc4, 0x84, 0xef, 0xe3, 0x7a, 0x53, 0x80, 0xee,
      0x90, 0x88, 0xf7, 0xac, 0xe2, 0xef, 0xcd, 0xe9
    ])
    const expected4 =
      105752752996721010526070019734402373604975086831773275823333741804099920678329n
    assert.equal(sha256ToU256(hash4), expected4)
  })

  test('should convert realistic SHA256 hash case 2', () => {
    // Test case 5: Realistic hash from "test"
    const hash5 = new Uint8Array([
      0x9f, 0x86, 0xd0, 0x81, 0x88, 0x4c, 0x7d, 0x65, 0x9a, 0x2f, 0xea, 0xa0,
      0xc5, 0x5a, 0xd0, 0x15, 0xa3, 0xbf, 0x4f, 0x1b, 0x2b, 0x0b, 0x82, 0x2c,
      0xd1, 0x5d, 0x6c, 0x15, 0xb0, 0xf0, 0x0a, 0x08
    ])
    const expected5 =
      3637832425643895610435099290665119336511696415395986933609875766427977287327n
    assert.equal(sha256ToU256(hash5), expected5)
  })

  test('should convert realistic SHA256 hash case 3', () => {
    // Test case 6: Another realistic hash
    const hash6 = new Uint8Array([
      0x2c, 0xf2, 0x4d, 0xba, 0x4f, 0x21, 0xd4, 0x28, 0x8d, 0xdc, 0x8a, 0xdb,
      0x65, 0x2c, 0xe2, 0x3e, 0x7c, 0x14, 0x65, 0x5d, 0x73, 0x65, 0x75, 0x8a,
      0x39, 0x4c, 0xea, 0x38, 0x9a, 0x6c, 0xef, 0x5a
    ])
    const expected6 =
      41131182367407121768980803946065747258831801974750857393196796652900726993452n
    assert.equal(sha256ToU256(hash6), expected6)
  })

  test('should convert realistic SHA256 hash case 4', () => {
    // Test case 7: High entropy hash
    const hash7 = new Uint8Array([
      0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf1, 0x23,
      0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc,
      0xde, 0xf1, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd
    ])
    const expected7 =
      93027213131052065320861774111217981072589495333167099115083387873161894677931n
    assert.equal(sha256ToU256(hash7), expected7)
  })

  test('should convert realistic SHA256 hash case 5', () => {
    // Test case 8: Another pattern
    const hash8 = new Uint8Array([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0xfe, 0xdc, 0xba, 0x98,
      0x76, 0x54, 0x32, 0x10, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
      0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00
    ])
    const expected8 =
      452194596858146580167213487207130881997623270877070319463363541661085147905n
    assert.equal(sha256ToU256(hash8), expected8)
  })

  test('should convert realistic SHA256 hash case 6', () => {
    // Test case 9: Random-like pattern
    const hash9 = new Uint8Array([
      0x7a, 0x3c, 0x92, 0x6b, 0x45, 0x1e, 0xd8, 0x39, 0xc2, 0x74, 0x5f, 0x16,
      0xa9, 0x83, 0x2d, 0xe4, 0x91, 0x6f, 0x27, 0xb5, 0x48, 0xda, 0x6c, 0x1a,
      0x3e, 0x72, 0x8b, 0x95, 0x4d, 0x06, 0xf9, 0x62
    ])
    const expected9 =
      44766647582432794195381227580685707587059369560365191520067784507235109059706n
    assert.equal(sha256ToU256(hash9), expected9)
  })

  test('should convert realistic SHA256 hash case 7', () => {
    // Test case 10: Maximum entropy pattern
    const hash10 = new Uint8Array([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
    ])
    const expected10 =
      115792089237316195423570985008687907853269984665640564039457584007913129639935n
    assert.equal(sha256ToU256(hash10), expected10)
  })

  test('should throw error for incorrect hash length - too short', () => {
    const shortHash = new Uint8Array(31)
    assert.throws(() => sha256ToU256(shortHash), /Hash must be 32 bytes/)
  })

  test('should throw error for incorrect hash length - too long', () => {
    const longHash = new Uint8Array(33)
    assert.throws(() => sha256ToU256(longHash), /Hash must be 32 bytes/)
  })

  test('should throw error for empty hash', () => {
    const emptyHash = new Uint8Array(0)
    assert.throws(() => sha256ToU256(emptyHash), /Hash must be 32 bytes/)
  })
})
