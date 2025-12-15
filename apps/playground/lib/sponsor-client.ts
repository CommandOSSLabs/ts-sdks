import type { ISponsorApiClient } from '@cmdoss/site-builder'

/**
 * Sponsor API client for the playground application.
 * This connects to a local Enoki backend for transaction sponsorship.
 */
export class PlaygroundSponsorApiClient implements ISponsorApiClient {
  constructor(private baseUrl: string = 'http://localhost:8787') {}

  async sponsorTransaction({
    txBytes,
    sender
  }: {
    txBytes: string
    sender: string
  }): Promise<{ bytes: string; digest: string }> {
    try {
      const sponsorTxBody = {
        txBytes: txBytes,
        sender: sender,
        allowedAddresses: [sender]
      }

      console.log('🎫 Requesting sponsorship from Enoki backend...')

      const res = await fetch(`${this.baseUrl}/api/sponsor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sponsorTxBody)
      })

      if (!res.ok) {
        throw new Error(`Sponsor API error: ${res.status} ${res.statusText}`)
      }

      const {
        data: { bytes, digest }
      } = await res.json()
      console.log('✅ Transaction sponsored with digest:', digest)

      return { bytes, digest }
    } catch (error) {
      console.error('❌ Failed to sponsor transaction:', error)
      throw new Error(
        `Failed to sponsor transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async executeTransaction({
    digest,
    signature
  }: {
    digest: string
    signature: string
  }): Promise<{ digest: string }> {
    try {
      const executeSponsoredTxBody = {
        signature,
        digest
      }

      const executeResponse = await fetch(`${this.baseUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(executeSponsoredTxBody)
      })

      //{"ok":true,"data":{"digest":"7Uy1RtV9qeuX2ix9E6B4KzjTNeMyURtGE5VYwAzFZVv7"}}

      if (!executeResponse.ok) {
        throw new Error(
          `Execute API error: ${executeResponse.status} ${executeResponse.statusText}`
        )
      }

      const {
        data: { digest: executeDigest }
      } = await executeResponse.json()
      if (!executeDigest) {
        throw new Error(
          'Failed to execute sponsored transaction: No digest returned'
        )
      }

      return { digest: executeDigest }
    } catch (error) {
      console.error('❌ Failed to execute sponsored transaction:', error)
      throw new Error(
        `Failed to execute sponsored transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
