import { useStore } from '@nanostores/react'
import type { FC, ReactNode } from 'react'
import {
  type UseSitePublishingParams,
  useSitePublishing
} from '~/hooks/useSitePublishing'
import { isUpdateMetadataModalOpen } from '~/stores/site-domain.store'
import ExtendTimeDialog from './extend-time-dialog/ExtendTimeDialog'
import PublishMenu from './publish-menu/PublishMenu'
import PublishModal from './publish-modal/PublishModal'
import SuiNsModal from './suins-modal/SuiNsModal'
import { ThemeProvider } from './ThemeProvider'
import { Button } from './ui/Button'
import UpdateMetadataModal from './update-metadata-modal/UpdateMetadataModal'

interface Props extends UseSitePublishingParams {
  children?: ReactNode
}

const PublishButton: FC<Props> = ({
  children,
  siteId,
  assets,
  onUpdateSiteMetadata,
  onAssociatedDomain,
  onError,
  onExtendedBlobs,
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
      handleAssociateDomain,
      handleExtendBlobs
    }
  } = useSitePublishing({
    siteId,
    assets,
    onUpdateSiteMetadata,
    onAssociatedDomain,
    onError,
    onExtendedBlobs,
    currentAccount,
    signAndExecuteTransaction,
    sponsorConfig,
    clients,
    portalDomain,
    portalHttps
  })
  const network = clients.suiClient.network
  const updateMetadataModalOpen = useStore(isUpdateMetadataModalOpen)

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
        assets={assets}
        onDeploy={handleRunDeploymentStep}
        onSaveMetadata={handleSaveSiteMetadata}
        onExtendBlobs={handleExtendBlobs}
        clients={clients}
      />
      <SuiNsModal
        siteId={siteId}
        onAssociateDomain={handleAssociateDomain}
        currentAccount={currentAccount}
        portalDomain={portalDomain}
        portalHttps={portalHttps}
        clients={clients}
        signAndExecuteTransaction={signAndExecuteTransaction}
        sponsorConfig={sponsorConfig}
      />
      <ExtendTimeDialog
        siteId={siteId}
        currentAccount={currentAccount}
        clients={clients}
        signAndExecuteTransaction={signAndExecuteTransaction}
        sponsorConfig={sponsorConfig}
        onSuccess={(message, digest) => {
          onExtendedBlobs?.(message, digest)
        }}
      />
      {siteId && (
        <UpdateMetadataModal
          siteId={siteId}
          isOpen={updateMetadataModalOpen}
          onOpenChange={isUpdateMetadataModalOpen.set}
          onSuccess={digest => {
            console.log('✅ Site metadata updated:', digest)
            // Success is handled silently - modal closes automatically and queries are invalidated
          }}
          onError={error => {
            onError?.(error.message)
            console.error('❌ Failed to update metadata:', error)
          }}
          clients={{
            suiClient: clients.suiClient,
            queryClient: clients.queryClient,
            walrusClient: clients.walrusClient
          }}
          currentAccount={currentAccount}
          signAndExecuteTransaction={signAndExecuteTransaction}
          sponsorConfig={sponsorConfig}
        />
      )}
    </ThemeProvider>
  )
}

export default PublishButton
