import type {
  ICertifiedBlob,
  IReadOnlyFileManager,
  IUpdateWalrusSiteFlow,
  IWalrusSiteBuilderSdk
} from '@cmdoss/site-builder'
import { atom, computed } from 'nanostores'
import { failed, ok, type TResult } from '~/lib/result'
import { siteMetadataStore } from './site-metadata.store'

export enum DeploySteps {
  Idle,
  Prepared,
  Uploaded,
  Certified,
  Deployed
}

export enum DeploymentStatus {
  Idle,
  /** Preparing assets for upload */
  Preparing,
  /** Assets have been prepared */
  Prepared,
  /** Uploading assets to the network */
  Uploading,
  /** Assets have been uploaded */
  Uploaded,
  /** Certify uploaded assets */
  Certifying,
  /** Assets have been certified */
  Certified,
  /** Deploy site metadata */
  Deploying,
  /** Site has been deployed */
  Deployed
}

export interface SiteMetadata {
  id?: string
  title?: string
  description?: string
  link?: string
  projectUrl?: string
  imageUrl?: string
  creator?: string
}
export interface SiteMetadataUpdate extends Omit<SiteMetadata, 'imageUrl'> {
  imageUrl?: string | File
}

export interface DeploymentHandlers {
  prepareAssets: () => Promise<void>
  uploadAssets: (epoch: number | 'max', permanent?: boolean) => Promise<void>
  certifyAssets: () => Promise<void>
  updateSite: () => Promise<void>
}

class SitePublishingStore {
  // UI state
  isPublishDialogOpen = atom(false)
  certifiedBlobs = atom<ICertifiedBlob[]>([])

  // Deployment state
  deployStatus = atom(DeploymentStatus.Idle)
  deploymentStepIndex = computed([this.deployStatus], deployStatus => {
    switch (deployStatus) {
      case DeploymentStatus.Idle:
      case DeploymentStatus.Preparing:
        return 0
      case DeploymentStatus.Prepared:
      case DeploymentStatus.Uploading:
        return 1
      case DeploymentStatus.Uploaded:
      case DeploymentStatus.Certifying:
        return 2
      case DeploymentStatus.Certified:
      case DeploymentStatus.Deploying:
        return 3
      case DeploymentStatus.Deployed:
        return 4
      default:
        return 0
    }
  })

  isWorking = computed(
    [this.deployStatus],
    deployStatus =>
      deployStatus !== DeploymentStatus.Idle &&
      deployStatus !== DeploymentStatus.Prepared &&
      deployStatus !== DeploymentStatus.Uploaded &&
      deployStatus !== DeploymentStatus.Certified &&
      deployStatus !== DeploymentStatus.Deployed
  )

  deployStatusText = computed([this.deployStatus], deployStatus => {
    switch (deployStatus) {
      case DeploymentStatus.Idle:
        return 'Start Deployment'
      case DeploymentStatus.Preparing:
        return 'Preparing assets...'
      case DeploymentStatus.Prepared:
        return 'Upload assets'
      case DeploymentStatus.Uploading:
        return 'Uploading assets...'
      case DeploymentStatus.Uploaded:
        return 'Certify assets'
      case DeploymentStatus.Certifying:
        return 'Certifying assets...'
      case DeploymentStatus.Certified:
        return 'Update Site Metadata'
      case DeploymentStatus.Deploying:
        return 'Updating site metadata...'
      case DeploymentStatus.Deployed:
        return 'Walrus Site Deployed'
      default:
        return 'Unknown status'
    }
  })

  private currentFlow?: IUpdateWalrusSiteFlow

  async runDeploymentStep(
    sdk: IWalrusSiteBuilderSdk,
    site: SiteMetadata,
    onPrepareAssets: () => Promise<IReadOnlyFileManager>
  ): Promise<TResult<string>> {
    if (this.isWorking.get()) return failed('Another operation is in progress')

    const status = this.deployStatus.get()

    switch (status) {
      case DeploymentStatus.Idle: {
        this.deployStatus.set(DeploymentStatus.Preparing)
        try {
          const fm = await onPrepareAssets()
          this.currentFlow = sdk.executeSiteUpdateFlow(fm, {
            object_id: site.id,
            site_name: site.title,
            metadata: {
              link: site.link,
              description: site.description,
              project_url: site.projectUrl,
              image_url: site.imageUrl,
              creator: site.creator ?? 'CommandOSS Site Builder'
            }
          })
          await this.currentFlow.prepareResources()
          this.deployStatus.set(DeploymentStatus.Prepared)
          return this.runDeploymentStep(sdk, site, onPrepareAssets)
        } catch (e) {
          console.error('Failed to prepare assets:', e)
          this.deployStatus.set(DeploymentStatus.Idle)
          return failed('Failed to prepare assets')
        }
      }

      case DeploymentStatus.Prepared: {
        if (!this.currentFlow) return failed('Invalid deployment flow')

        this.deployStatus.set(DeploymentStatus.Uploading)
        const epochs = siteMetadataStore.epochs.get()
        const deletable = siteMetadataStore.deletable.get()

        try {
          await this.currentFlow.writeResources(epochs, deletable)
        } catch (e) {
          console.error('Failed to upload assets:', e)
          this.deployStatus.set(DeploymentStatus.Prepared)
          return failed('Failed to upload assets')
        }

        this.deployStatus.set(DeploymentStatus.Uploaded)
        return this.runDeploymentStep(sdk, site, onPrepareAssets)
      }

      case DeploymentStatus.Uploaded: {
        if (!this.currentFlow) return failed('Invalid deployment flow')
        this.deployStatus.set(DeploymentStatus.Certifying)
        try {
          await this.currentFlow.certifyResources()
          this.deployStatus.set(DeploymentStatus.Certified)
          return this.runDeploymentStep(sdk, site, onPrepareAssets)
        } catch (e) {
          console.error('Failed to certify assets:', e)
          this.deployStatus.set(DeploymentStatus.Uploaded)
          return failed('Failed to certify assets')
        }
      }

      case DeploymentStatus.Certified: {
        if (!this.currentFlow) return failed('Invalid deployment flow')
        this.deployStatus.set(DeploymentStatus.Deploying)
        try {
          const { siteId } = await this.currentFlow.writeSite()
          if (!siteId) throw new Error('No site ID returned')
          this.deployStatus.set(DeploymentStatus.Deployed)
          return ok(siteId)
        } catch (e) {
          console.error('Failed to deploy site:', e)
          this.deployStatus.set(DeploymentStatus.Certified)
          return failed('Failed to deploy site')
        }
      }

      default:
        return failed('Invalid deployment step')
    }
  }

  reset() {
    this.deployStatus.set(DeploymentStatus.Idle)
    this.certifiedBlobs.set([])
    this.currentFlow = undefined
  }

  closePublishDialog = () => this.isPublishDialogOpen.set(false)
}

export const sitePublishingStore = new SitePublishingStore()
