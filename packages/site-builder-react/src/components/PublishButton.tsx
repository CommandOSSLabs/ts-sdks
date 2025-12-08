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
  onError
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
    onError
  })

  return (
    <ThemeProvider>
      <PublishMenu
        siteId={siteId}
        onPublishClick={handleOpenPublishingDialog}
        onDomainClick={handleOpenDomainDialog}
      >
        {children || <Button>Publish</Button>}
      </PublishMenu>
      <PublishModal
        siteId={siteId}
        onDeploy={handleRunDeploymentStep}
        onSaveMetadata={handleSaveSiteMetadata}
      />
      <SuiNsModal siteId={siteId} onAssociateDomain={handleAssociateDomain} />
    </ThemeProvider>
  )
}

export default PublishButton
