import {
  type PublicKey,
  type SignatureScheme,
  Signer
} from '@mysten/sui/cryptography'
import { publicKeyFromSuiBytes } from '@mysten/sui/verify'
import type {
  WalletAccount,
  WalletWithRequiredFeatures
} from '@mysten/wallet-standard'

export class WalletSigner extends Signer {
  public activeAccount: WalletAccount

  getKeyScheme(): SignatureScheme {
    return 'Secp256k1'
  }
  getPublicKey(): PublicKey {
    return publicKeyFromSuiBytes(Uint8Array.from(this.activeAccount.publicKey))
  }
  constructor(public wallet: WalletWithRequiredFeatures) {
    super()
    this.activeAccount = wallet.accounts[0]
  }

  async sign(bytes: Uint8Array): Promise<Uint8Array> {
    if (!this.wallet.features['sui:signMessage'])
      throw new Error('Wallet does not support sui:signMessage feature')
    const { signMessage } = this.wallet.features['sui:signMessage']
    const { signature } = await signMessage({
      message: bytes,
      account: this.wallet.accounts[0]
    })
    return Uint8Array.from(atob(signature), c => c.charCodeAt(0))
  }
}
