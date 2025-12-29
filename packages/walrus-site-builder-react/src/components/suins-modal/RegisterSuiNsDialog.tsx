import type {
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/walrus-site-builder'
import type { SuiClient } from '@mysten/sui/client'
import type { SuinsClient } from '@mysten/suins'
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
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    suinsClient: SuinsClient
  }
  signAndExecuteTransaction: ISignAndExecuteTransaction
  sponsorConfig?: ISponsorConfig
}

export const RegisterSuiNsDialog: FC<RegisterSuiNsDialogProps> = ({
  isOpen,
  onClose,
  onRegistered,
  currentAccount,
  clients: { suiClient, queryClient, suinsClient },
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
    selectedYears,
    setSelectedYears,
    pricePerYearFormatted,
    pricePerYearUsdc,
    totalPriceFormatted,
    totalPriceUsdc,
    expirationDate,
    handleSearch,
    handleRegister: handleRegisterInternal,
    reset
  } = useSuiNsRegistration({
    currentAccount,
    clients: { suiClient, queryClient, suinsClient },
    signAndExecuteTransaction,
    sponsorConfig
  })

  const network = suiClient.network
  const isTestnet = network === 'testnet'

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
                </div>
              </div>
            )}

            {/* Year Selection */}
            {isAvailable && (
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="year-select"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem'
                  }}
                >
                  Registration Period
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                >
                  {[1, 2, 3, 4, 5].map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYears(year)}
                      disabled={isRegistering || isSwapping}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: `1px solid ${
                          selectedYears === year
                            ? 'rgba(59, 130, 246, 0.5)'
                            : 'rgba(229, 231, 235, 1)'
                        }`,
                        backgroundColor:
                          selectedYears === year
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'transparent',
                        color:
                          selectedYears === year
                            ? 'rgb(37, 99, 235)'
                            : 'inherit',
                        fontWeight: selectedYears === year ? 600 : 400,
                        cursor:
                          isRegistering || isSwapping
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        opacity: isRegistering || isSwapping ? 0.5 : 1
                      }}
                    >
                      {year} {year === 1 ? 'Year' : 'Years'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {isAvailable && (pricePerYearFormatted || estimatedPrice) && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(249, 250, 251, 1)',
                  border: '1px solid rgba(229, 231, 235, 1)',
                  marginBottom: '1rem'
                }}
              >
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'rgb(17, 24, 39)'
                  }}
                >
                  Price Breakdown
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'rgb(107, 114, 128)'
                      }}
                    >
                      Price per year:
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.125rem'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'rgb(17, 24, 39)'
                        }}
                      >
                        {pricePerYearFormatted || estimatedPrice}
                      </span>
                      {isTestnet && pricePerYearUsdc && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107, 114, 128)',
                            opacity: 0.8
                          }}
                        >
                          ({pricePerYearUsdc})
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'rgb(107, 114, 128)'
                      }}
                    >
                      Number of years:
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'rgb(17, 24, 39)'
                      }}
                    >
                      {selectedYears}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'rgba(229, 231, 235, 1)',
                      margin: '0.5rem 0'
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'rgb(17, 24, 39)'
                      }}
                    >
                      Total:
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.125rem'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'rgb(17, 24, 39)'
                        }}
                      >
                        {totalPriceFormatted || estimatedPrice}
                      </span>
                      {isTestnet && totalPriceUsdc && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107, 114, 128)',
                            opacity: 0.8
                          }}
                        >
                          ({totalPriceUsdc})
                        </span>
                      )}
                    </div>
                  </div>
                  {expirationDate && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(229, 231, 235, 1)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107, 114, 128)'
                          }}
                        >
                          Expires on:
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'rgb(17, 24, 39)'
                          }}
                        >
                          {expirationDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
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
                  `Register ${fullName} for ${selectedYears} ${selectedYears === 1 ? 'year' : 'years'}`
                )}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
