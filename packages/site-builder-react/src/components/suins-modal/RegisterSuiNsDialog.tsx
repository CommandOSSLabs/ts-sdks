import type {
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import type { WalletAccount } from '@mysten/wallet-standard'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Search, X } from 'lucide-react'
import type { FC } from 'react'
import { useSuiNsRegistration } from '~/hooks'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import * as styles from './SuiNsModal.css'

interface RegisterSuiNsDialogProps {
  isOpen: boolean
  onClose: () => void
  onRegistered?: () => void
  currentAccount: WalletAccount | null
  suiClient: SuiClient
  queryClient: QueryClient
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

export const RegisterSuiNsDialog: FC<RegisterSuiNsDialogProps> = ({
  isOpen,
  onClose,
  onRegistered,
  currentAccount,
  suiClient,
  queryClient,
  signAndExecuteTransaction,
  sponsorConfig
}) => {
  const {
    searchName,
    setSearchName,
    isSearching,
    isAvailable,
    isRegistering,
    isSwapping,
    estimatedPrice,
    error,
    normalizedName,
    fullName,
    handleSearch,
    handleRegister: handleRegisterInternal,
    reset
  } = useSuiNsRegistration({
    currentAccount,
    suiClient,
    queryClient,
    signAndExecuteTransaction,
    sponsorConfig
  })

  const handleRegister = async () => {
    const success = await handleRegisterInternal()
    if (success) {
      if (onRegistered) {
        onRegistered()
      }
      handleClose()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!currentAccount) {
    return null
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={styles.overlay}
          style={{
            zIndex: 51,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
        />
        <Dialog.Content
          className={styles.content}
          style={{ maxWidth: '32rem', zIndex: 52 }}
        >
          {/* Loading Overlay */}
          {(isRegistering || isSwapping) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                borderRadius: '0.75rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Loader2
                  style={{
                    width: '2rem',
                    height: '2rem',
                    animation: 'spin 1s linear infinite',
                    color: 'white'
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: 'white' }}>
                  {isSwapping
                    ? 'Swapping WAL to USDC...'
                    : 'Registering domain...'}
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Register SuiNS Domain
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              Search and register a new .sui domain name
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={handleClose}
                disabled={isRegistering}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '1rem',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className={styles.body}>
            {/* Search Section */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="domain-search"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem'
                }}
              >
                Search for a domain
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Input
                    id="domain-search"
                    type="text"
                    value={searchName}
                    onChange={e => {
                      setSearchName(e.target.value)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && normalizedName) {
                        handleSearch()
                      }
                    }}
                    placeholder="Enter domain name"
                    disabled={isSearching || isRegistering}
                    style={{ paddingRight: '3rem' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                      pointerEvents: 'none'
                    }}
                  >
                    .sui
                  </span>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || isRegistering || !normalizedName}
                  size="default"
                >
                  {isSearching ? (
                    <Loader2
                      style={{
                        width: '1rem',
                        height: '1rem',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                  ) : (
                    <Search style={{ width: '1rem', height: '1rem' }} />
                  )}
                </Button>
              </div>
            </div>

            {/* Availability Alert */}
            {isAvailable !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${
                    isAvailable
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                  }`,
                  backgroundColor: isAvailable
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: isAvailable ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
                  marginBottom: '1rem'
                }}
              >
                <CheckCircle2
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {isAvailable
                      ? `${fullName} is available!`
                      : `${fullName} is already taken`}
                  </p>
                  {isAvailable && estimatedPrice && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        marginTop: '0.125rem'
                      }}
                    >
                      Estimated cost: {estimatedPrice}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'rgb(220, 38, 38)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Register Button */}
            {isAvailable && (
              <Button
                onClick={handleRegister}
                disabled={isRegistering || isSwapping || !normalizedName}
                variant="gradient"
                size="default"
                style={{ width: '100%' }}
              >
                {isSwapping ? (
                  <>
                    <Loader2
                      style={{
                        width: '1rem',
                        height: '1rem',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}
                    />
                    Swapping WAL to USDC...
                  </>
                ) : isRegistering ? (
                  <>
                    <Loader2
                      style={{
                        width: '1rem',
                        height: '1rem',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}
                    />
                    Registering...
                  </>
                ) : (
                  `Register ${fullName}`
                )}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
