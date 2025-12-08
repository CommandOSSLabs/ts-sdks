import { useSuiClient } from '@mysten/dapp-kit'
import { useStore } from '@nanostores/react'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import type { FC } from 'react'
import { useDefaultWalrusSiteUrl } from '~/hooks/useDefaultWalrusSiteUrl'
import { useSuiNsDomainsQuery } from '~/queries'
import {
  isAssigningDomain,
  isDomainDialogOpen
} from '~/stores/site-domain.store'
import { Banner } from '../ui'
import { Button } from '../ui/Button'
import DomainCardSvg from './DomainCardSvg'
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
  onAssociateDomain?: (nftId: string, siteId: string) => void
}

const SuiNsModal: FC<SuiNsModalProps> = ({ siteId, onAssociateDomain }) => {
  const isOpen = useStore(isDomainDialogOpen)
  const isAssigning = useStore(isAssigningDomain)
  const walrusSiteUrl = useDefaultWalrusSiteUrl(siteId)
  const { network } = useSuiClient()

  const {
    data: nsDomains,
    isLoading: isLoadingDomains,
    isError: isErrorDomains
  } = useSuiNsDomainsQuery()

  const associatedDomains = nsDomains.filter(d => d.walrusSiteId === siteId)

  const handleAssociate = (nftId: string) => {
    if (siteId && onAssociateDomain) {
      onAssociateDomain(nftId, siteId)
    }
  }

  const handleRemoveAssociation = (nftId: string) => {
    if (onAssociateDomain) {
      onAssociateDomain(nftId, '')
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
                {/* Associated SuiNS Domains */}
                {associatedDomains.map(domain => (
                  <div key={domain.nftId} className={styles.domainItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={domain.walrusSiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                        style={{ fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        {domain.walrusSiteUrl}
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
                      onClick={() => handleRemoveAssociation(domain.nftId)}
                      disabled={isAssigning}
                      title="Remove domain association"
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </Button>
                  </div>
                ))}

                {/* Default Walrus Site URL */}
                {walrusSiteUrl && (
                  <div className={styles.domainItem}>
                    <div style={{ flex: 1, width: '100%' }}>
                      <a
                        href={walrusSiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                        style={{ fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        {walrusSiteUrl}
                      </a>
                      <p
                        style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        Default Walrus URL
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Available Domains */}
            <div className={styles.section} style={{ marginTop: '0.5rem' }}>
              <div className={styles.sectionTitle}>
                <span>Select a domain to associate with your website</span>

                <button type="button">Buy a domain</button>
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
              {!isLoadingDomains &&
                !isErrorDomains &&
                !nsDomains.length &&
                (network === 'testnet' ? (
                  <Banner
                    title="You don't own any SuiNS(Testnet) domains yet."
                    description="Get your own .sui domain name to give your website a memorable and easy-to-share address."
                    url="https://testnet.suins.io/"
                    urlName="Visit SuiNS"
                    variant="alert"
                  />
                ) : (
                  <Banner
                    title="You don't own any SuiNS domains yet."
                    description="Get your own .sui domain name to give your website a memorable and easy-to-share address."
                    url="https://suins.io/"
                    urlName="Visit SuiNS"
                    variant="alert"
                  />
                ))}

              {/* Domain cards */}
              {!isLoadingDomains && !isErrorDomains && nsDomains.length > 0 && (
                <div className={styles.domainCardGrid}>
                  {nsDomains.map(domain => {
                    const isAssociated = siteId === domain.walrusSiteId

                    return (
                      <button
                        key={domain.nftId}
                        type="button"
                        className={styles.domainCard}
                        onClick={() => handleAssociate(domain.nftId)}
                        disabled={isAssociated || isAssigning}
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
    </Dialog.Root>
  )
}

export default SuiNsModal
