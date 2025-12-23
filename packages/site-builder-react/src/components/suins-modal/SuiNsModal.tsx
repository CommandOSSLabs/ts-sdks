import type {
  ISignAndExecuteTransaction,
  ISponsorConfig
} from '@cmdoss/site-builder'
import { suinsDomainToWalrusSiteUrl } from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import type { SuinsClient } from '@mysten/suins'
import type { WalletAccount } from '@mysten/wallet-standard'
import { useStore } from '@nanostores/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, X } from 'lucide-react'
import { type FC, useState } from 'react'
import { useSuiNsDomainsQuery } from '~/queries'
import {
  isAssigningDomain,
  isDomainDialogOpen,
  isRegisterSuiNSDomainDialogOpen
} from '~/stores/site-domain.store'
import { siteMetadataStore } from '~/stores/site-metadata.store'
import { Banner } from '../ui'
import { Button } from '../ui/Button'
import DomainCardSvg from './DomainCardSvg'
import { RegisterSuiNsDialog } from './RegisterSuiNsDialog'
import * as styles from './SuiNsModal.css'

export interface SuiNsDomain {
  nftId: string
  name: string
  expirationTimestampMs?: number
  walrusSiteId?: string
  walrusSiteUrl?: string
}

interface SuiNsModalProps {
  siteId: string | undefined
  onAssociateDomain?: (nftId: string, siteId: string, suiNSName: string) => void
  currentAccount: WalletAccount | null
  /** Optional domain for the portal to view published site. */
  portalDomain?: string
  /** Whether to use HTTPS for the portal URL. */
  portalHttps?: boolean
  /**
   * Sui and Query clients needed for on-chain operations.
   */
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
    suinsClient: SuinsClient
  }
  /**
   * Callback for signing and executing transactions.
   * Required for registering new SuiNS domains.
   */
  signAndExecuteTransaction?: ISignAndExecuteTransaction
  /**
   * Optional sponsor configuration for transaction sponsorship.
   */
  sponsorConfig?: ISponsorConfig
}

const SuiNsModal: FC<SuiNsModalProps> = ({
  siteId,
  onAssociateDomain,
  currentAccount,
  portalDomain,
  portalHttps,
  clients: { suiClient, queryClient, suinsClient },
  signAndExecuteTransaction,
  sponsorConfig
}) => {
  const isOpen = useStore(isDomainDialogOpen)
  const isAssigning = useStore(isAssigningDomain)
  const suiNSUrl = useStore(siteMetadataStore.suiNSUrl)
  const isRegisterSuiNSDomainDialog = useStore(isRegisterSuiNSDomainDialogOpen)
  const { network } = suiClient
  const {
    data: nsDomains,
    isLoading: isLoadingDomains,
    isError: isErrorDomains
  } = useSuiNsDomainsQuery(currentAccount, { suiClient, queryClient })

  // Find the domain that matches suiNSUrl
  const currentSuiNSDomain = nsDomains.find(domain => {
    const domainUrl = suinsDomainToWalrusSiteUrl(
      domain.name,
      portalDomain,
      portalHttps
    )
    return domainUrl === suiNSUrl
  })

  // Explorer URL
  const explorerUrl = siteId
    ? network === 'testnet'
      ? `https://testnet.suivision.xyz/object/${siteId}`
      : `https://suivision.xyz/object/${siteId}`
    : undefined

  const handleAssociate = (nftId: string, suiNSName: string) => {
    if (siteId && onAssociateDomain) {
      onAssociateDomain(nftId, siteId, suiNSName)
    }
  }

  const handleRemoveAssociation = (nftId: string) => {
    if (onAssociateDomain) {
      onAssociateDomain(nftId, '', '')
    }
  }

  const formatExpiryDate = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={isDomainDialogOpen.set}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          {/* Loading Overlay */}
          {isAssigning && (
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
                  Updating domain association...
                </p>
              </div>
            </div>
          )}

          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Customize Domain
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              Associate your website with a SuiNS domain for easy access
            </Dialog.Description>
          </div>

          <div className={styles.body}>
            {/* Currently Associated Domains */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                Currently Associated Domains
              </div>
              <div className={styles.domainList}>
                {/* Explorer - Always shown if siteId exists */}
                {explorerUrl && (
                  <div className={styles.domainItem}>
                    <div style={{ flex: 1, width: '100%' }}>
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                        style={{ fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        Explorer
                        <ExternalLink
                          style={{
                            display: 'inline',
                            width: '0.75rem',
                            height: '0.75rem',
                            marginLeft: '0.25rem'
                          }}
                        />
                      </a>
                      <p
                        style={{
                          marginTop: '0.1rem',
                          fontSize: '0.75rem',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        Sui Explorer
                      </p>
                    </div>
                  </div>
                )}

                {/* SuiNS Domain - Only shown if suiNSUrl exists */}
                {suiNSUrl && (
                  <div className={styles.domainItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={suiNSUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                        style={{ fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        {suiNSUrl}
                      </a>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        SuiNS Domain
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveAssociation(currentSuiNSDomain?.nftId ?? '')
                      }
                      disabled={isAssigning}
                      title="Remove domain association"
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Available Domains */}
            <div className={styles.section} style={{ marginTop: '0.5rem' }}>
              <div className={styles.sectionTitle}>
                <span>Select a domain to associate with your website</span>

                <Button
                  size="sm"
                  type="button"
                  onClick={() => isRegisterSuiNSDomainDialogOpen.set(true)}
                >
                  Buy a domain
                </Button>
              </div>

              {/* Loading state */}
              {isLoadingDomains && (
                <div className={styles.loadingSpinner}>
                  <Loader2
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                </div>
              )}

              {/* Error state */}
              {isErrorDomains && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--destructive)',
                    padding: '1rem 0'
                  }}
                >
                  Failed to load your domains. Please try again.
                </p>
              )}

              {/* Empty state */}
              {!isLoadingDomains && !isErrorDomains && !nsDomains.length && (
                <Banner
                  title="You don't own any SuiNS domains yet."
                  description="Buy a domain to continue."
                  variant="warning"
                />
              )}
              {/* Domain cards */}
              {!isLoadingDomains && !isErrorDomains && nsDomains.length > 0 && (
                <div className={styles.domainCardGrid}>
                  {nsDomains.map(domain => {
                    const domainUrl = suinsDomainToWalrusSiteUrl(
                      domain.name,
                      portalDomain,
                      portalHttps
                    )
                    const isCurrentSuiNS = domainUrl === suiNSUrl

                    return (
                      <button
                        key={domain.nftId}
                        type="button"
                        className={styles.domainCard}
                        onClick={() =>
                          handleAssociate(domain.nftId, domain.name)
                        }
                        disabled={isCurrentSuiNS}
                      >
                        <div className={styles.domainCardBg}>
                          <DomainCardSvg />
                        </div>
                        <div className={styles.domainName}>
                          @{domain.name || 'Unknown'}
                        </div>
                        <div className={styles.domainExpiry}>
                          {formatExpiryDate(domain.expirationTimestampMs)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Info Panel */}
            {network === 'testnet' && (
              <Banner
                title="You are publishing to the testnet"
                description="You must run a local Walrus Site Portal to view published site."
                variant="info"
                url="https://docs.wal.app/walrus-sites/portal.html"
                urlName="Portal Documentation"
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Register SuiNS Dialog */}
      {signAndExecuteTransaction && (
        <RegisterSuiNsDialog
          isOpen={isRegisterSuiNSDomainDialog}
          onClose={() => isRegisterSuiNSDomainDialogOpen.set(false)}
          onRegistered={() => {
            // Invalidate domains query to refresh the list
            if (currentAccount?.address) {
              queryClient.invalidateQueries({
                queryKey: ['suins-domains', currentAccount.address, network]
              })
            }
          }}
          currentAccount={currentAccount}
          clients={{ suiClient, queryClient, suinsClient }}
          signAndExecuteTransaction={signAndExecuteTransaction}
          sponsorConfig={sponsorConfig}
        />
      )}
    </Dialog.Root>
  )
}

export default SuiNsModal
