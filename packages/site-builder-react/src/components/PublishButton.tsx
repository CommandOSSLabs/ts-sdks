import type { FC, ReactNode } from 'react'
import {
  type UseSitePublishingParams,
  useSitePublishing
} from '~/hooks/useSitePublishing'
import PublishMenu from './publish-menu/PublishMenu'
import PublishModal from './publish-modal/PublishModal'
import SuiNsModal from './suins-modal/SuiNsModal'
import { ThemeProvider } from './ThemeProvider'
import { Button } from './ui/Button'

interface Props extends UseSitePublishingParams {
  children?: ReactNode
}

const PublishButton: FC<Props> = ({
  children,
  siteId,
  onPrepareAssets,
  onUpdateSiteMetadata,
  onAssociatedDomain,
  onError,
  currentAccount,
  signAndExecuteTransaction,
  sponsorConfig,
  portalDomain,
  portalHttps,
  clients
}) => {
  const {
    actions: {
      handleOpenPublishingDialog,
      handleOpenDomainDialog,
      handleRunDeploymentStep,
      handleSaveSiteMetadata,
      handleAssociateDomain
    }
  } = useSitePublishing({
    siteId,
    onPrepareAssets,
    onUpdateSiteMetadata,
    onAssociatedDomain,
    onError,
    currentAccount,
    signAndExecuteTransaction,
    sponsorConfig,
    clients
  })
  const network = clients.suiClient.network

  return (
    <ThemeProvider>
      <PublishMenu
        siteId={siteId}
        onPublishClick={handleOpenPublishingDialog}
        onDomainClick={handleOpenDomainDialog}
        network={network === 'mainnet' ? 'mainnet' : 'testnet'}
        portalDomain={portalDomain}
        portalHttps={portalHttps}
        clients={clients}
        currentAccount={currentAccount}
      >
        {children || <Button>Publish</Button>}
      </PublishMenu>
      <PublishModal
        siteId={siteId}
        onDeploy={handleRunDeploymentStep}
        onSaveMetadata={handleSaveSiteMetadata}
        clients={clients}
      />
      <SuiNsModal
        siteId={siteId}
        onAssociateDomain={handleAssociateDomain}
        currentAccount={currentAccount}
        portalDomain={portalDomain}
        portalHttps={portalHttps}
        clients={clients}
      />
    </ThemeProvider>
  )
}

export default PublishButton
