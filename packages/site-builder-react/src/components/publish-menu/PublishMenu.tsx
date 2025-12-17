import {
  objectIdToWalrusSiteUrl,
  suinsDomainToWalrusSiteUrl
} from '@cmdoss/site-builder'
import type { SuiClient } from '@mysten/sui/client'
import type { WalletAccount } from '@mysten/wallet-standard'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { QueryClient } from '@tanstack/react-query'
import { ExternalLink, Globe2 } from 'lucide-react'
import type { FC, ReactNode } from 'react'
import { useSuiNsDomainsQuery } from '~/queries'
import { isDomainDialogOpen } from '~/stores'
import { Banner } from '../ui'
import { Button } from '../ui/Button'
import * as styles from './PublishMenu.css'

interface PublishMenuProps {
  children?: ReactNode
  siteId: string | undefined
  onPublishClick?: () => void
  onDomainClick?: () => void
  network?: 'mainnet' | 'testnet'
  /** Optional domain for the portal to view published site. */
  portalDomain?: string
  /** Whether to use HTTPS for the portal URL. */
  portalHttps?: boolean
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
  }
  currentAccount: WalletAccount | null
}

const PublishMenu: FC<PublishMenuProps> = ({
  children,
  siteId,
  onPublishClick,
  onDomainClick,
  portalDomain,
  portalHttps,
  network = 'testnet',
  clients,
  currentAccount
}) => {
  const isDeployed = !!siteId
  const walrusSiteUrl = siteId
    ? objectIdToWalrusSiteUrl(siteId, portalDomain, portalHttps)
    : undefined

  const {
    data: nsDomains,
    isLoading: isLoadingDomains,
    isError: isErrorDomains
  } = useSuiNsDomainsQuery(currentAccount, {
    suiClient: clients.suiClient,
    queryClient: clients.queryClient
  })

  const associatedDomains = nsDomains.filter(d => d.walrusSiteId === siteId)

  const truncateUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const subdomain = urlObj.hostname.split('.')[0]
      if (subdomain && subdomain.length > 20) {
        return `${subdomain.slice(0, 8)}...${subdomain.slice(-8)}.${urlObj.hostname.split('.').slice(1).join('.')}`
      }
      return url
    } catch {
      return url
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <h4 className={styles.title}>
              {isDeployed ? 'Update your Site' : 'Publish your Site'}
            </h4>
            {isDeployed && walrusSiteUrl ? (
              <p className={styles.description}>
                Your site is live at{' '}
                <a
                  href={walrusSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {truncateUrl(walrusSiteUrl)}
                  <ExternalLink
                    style={{
                      display: 'inline',
                      width: '0.75rem',
                      height: '0.75rem',
                      marginLeft: '0.25rem'
                    }}
                  />
                </a>
                . You can update your site to reflect the latest changes.
              </p>
            ) : (
              <p className={styles.description}>
                Deploy your app to{' '}
                <a
                  href="https://www.walrus.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Walrus Sites
                </a>
                , a decentralized web hosting platform. After publishing, you
                can customize your domain and feature it in the community.
              </p>
            )}
          </div>

          <DropdownMenu.Separator className={styles.separator} />

          {/* Menu Items */}
          <DropdownMenu.Item
            className={styles.item}
            onSelect={onDomainClick}
            disabled={!siteId}
          >
            <Globe2 style={{ width: '1rem', height: '1rem' }} />
            <span style={{ flex: 1 }}>Customize Domain</span>
            {!siteId && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)'
                }}
              >
                Not Published Yet
              </span>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={styles.separator} />

          {/* Footer */}
          <div className={styles.footer}>
            {isDeployed && walrusSiteUrl ? (
              <div className={styles.buttonGroup}>
                {associatedDomains.length > 0 &&
                !isLoadingDomains &&
                !isErrorDomains ? (
                  <a
                    href={suinsDomainToWalrusSiteUrl(
                      associatedDomains[0].name,
                      portalDomain,
                      portalHttps
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="default"
                      style={{ width: '100%' }}
                    >
                      Visit Site
                    </Button>
                  </a>
                ) : (
                  // open suins
                  <Button
                    variant="outline"
                    size="default"
                    style={{ width: '100%' }}
                    onClick={() => {
                      isDomainDialogOpen.set(true)
                    }}
                  >
                    Link SuiNS
                  </Button>
                )}
                <Button
                  variant="gradient"
                  size="default"
                  onClick={onPublishClick}
                >
                  Update Site
                </Button>
              </div>
            ) : (
              <Button
                variant="gradient"
                size="default"
                style={{ width: '100%' }}
                onClick={onPublishClick}
              >
                Publish to Walrus
              </Button>
            )}

            {/* banner */}
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
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default PublishMenu
