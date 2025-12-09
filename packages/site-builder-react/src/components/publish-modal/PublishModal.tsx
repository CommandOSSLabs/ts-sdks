import type { SuiClient } from '@mysten/sui/client'
import { useStore } from '@nanostores/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { ChevronDown, Info, Pencil, Upload, X } from 'lucide-react'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { useStorageCostQuery } from '~/queries/storage-cost.query'
import { siteMetadataStore } from '~/stores/site-metadata.store'
import { sitePublishingStore } from '~/stores/site-publishing.store'
import { Banner } from '../ui'
import { Button } from '../ui/Button'
import { FlickeringGrid } from '../ui/FlickeringGrid'
import { Input, Label, Textarea } from '../ui/Input'
import { Stepper } from '../ui/Stepper'
import * as styles from './PublishModal.css'

interface PublishModalProps {
  siteId: string | undefined
  onDeploy?: () => void
  onSaveMetadata?: () => Promise<void>
  clients: {
    suiClient: SuiClient
    queryClient: QueryClient
  }
}

const PublishModal: FC<PublishModalProps> = ({
  siteId,
  onDeploy,
  onSaveMetadata,
  clients: { suiClient, queryClient }
}) => {
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false)
  const [isMoreInfoExpanded, setIsMoreInfoExpanded] = useState(true)
  const [isStorageDetailsExpanded, setIsStorageDetailsExpanded] =
    useState(false)

  const isOpen = useStore(sitePublishingStore.isPublishDialogOpen)
  const isWorking = useStore(sitePublishingStore.isWorking)
  const deployStatusText = useStore(sitePublishingStore.deployStatusText)
  const deployStepIndex = useStore(sitePublishingStore.deploymentStepIndex)
  const assetsSize = useStore(sitePublishingStore.assetsSize)
  const imageDisplayUrl = useStore(siteMetadataStore.imageDisplayUrl)
  const link = useStore(siteMetadataStore.link)
  const projectUrl = useStore(siteMetadataStore.projectUrl)
  const epochs = useStore(siteMetadataStore.epochs)
  const isDirty = useStore(siteMetadataStore.isDirty)
  const isLoading = useStore(siteMetadataStore.loading)

  const {
    data: storageCost = {
      storageCost: '0',
      writeCost: '0',
      totalCost: '0'
    },
    isLoading: storageCostLoading,
    isError: storageCostError
  } = useStorageCostQuery(assetsSize, epochs, { suiClient, queryClient })

  const deploymentSteps = [
    {
      title: 'Prepare',
      description: 'Build and register blobs for deployment'
    },
    { title: 'Upload', description: 'Upload assets to Walrus network' },
    { title: 'Certify', description: 'Certify the uploaded assets' },
    { title: 'Deploy', description: 'Deploy and update the site' }
  ]

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={sitePublishingStore.closePublishDialog}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>
            {siteId ? 'Edit Site' : 'Publish New Site'}
          </Dialog.Title>
          <Dialog.Description className={styles.description}>
            Make your project live in the Walrus network.
          </Dialog.Description>

          <Stepper
            steps={deploymentSteps}
            currentStep={deployStepIndex}
            isLoading={isWorking}
          />

          {/* Website Info Section - Two Column Layout */}
          <section className={styles.twoColumnSection}>
            {/* Left Column: Preview Image */}
            <div className={styles.leftColumn}>
              <div className={styles.previewContainer}>
                <div className={styles.previewArea}>
                  {imageDisplayUrl ? (
                    <div className={styles.previewImageWrapper}>
                      <img
                        src={imageDisplayUrl}
                        alt="Site preview"
                        className={styles.previewImage}
                      />
                    </div>
                  ) : (
                    <>
                      <FlickeringGrid
                        className={styles.flickeringGrid}
                        squareSize={2}
                        gridGap={6}
                        color="rgb(0, 0, 0)"
                        maxOpacity={0.3}
                        flickerChance={0.3}
                      />
                      <div className={styles.maskLayer} />
                      <div className={styles.placeholderContent}>
                        <div className={styles.placeholderIcon}>
                          <svg
                            width="32"
                            height="32"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Image placeholder icon</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p
                          style={{
                            fontWeight: 500,
                            color: 'var(--foreground)',
                            textAlign: 'center'
                          }}
                        >
                          Add a preview image
                        </p>
                        <p
                          style={{
                            color: 'var(--muted-foreground)',
                            textAlign: 'center',
                            fontSize: '0.875rem'
                          }}
                        >
                          Click the edit button to customize
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => setIsMetadataDialogOpen(true)}
                >
                  <Pencil size={20} />
                </button>
              </div>
            </div>

            {/* Right Column: Metadata Information */}
            <div className={styles.rightColumn}>
              <div className={styles.metadataFields}>
                {/* Storage Cost Section */}
                <div className={styles.storageCostSection}>
                  <div className={styles.storageCostSummary}>
                    <div className={styles.storageCostLabel}>
                      <span style={{ fontWeight: 500 }}>Storage Cost</span>
                      {assetsSize !== null && (
                        <button
                          type="button"
                          onClick={() =>
                            setIsStorageDetailsExpanded(
                              !isStorageDetailsExpanded
                            )
                          }
                          style={{
                            padding: '0.25rem',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--muted-foreground)',
                            borderRadius: '0.25rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor =
                              'var(--muted)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                          }}
                          aria-label="View storage cost details"
                        >
                          <Info size={16} />
                        </button>
                      )}
                    </div>
                    <div className={styles.storageCostValue}>
                      {assetsSize === null ? (
                        <span
                          style={{
                            color: 'var(--warning, #f59e0b)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <Info size={14} />
                          Assets not prepared yet
                        </span>
                      ) : storageCostLoading ? (
                        <span style={{ color: 'var(--muted-foreground)' }}>
                          Calculating...
                        </span>
                      ) : storageCostError ? (
                        <span style={{ color: 'var(--destructive)' }}>
                          Cost unavailable
                        </span>
                      ) : (
                        <>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--muted-foreground)'
                            }}
                          >
                            {(assetsSize / 1024).toFixed(2)} KB •{' '}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--foreground)'
                            }}
                          >
                            {(
                              (Number(storageCost.storageCost) +
                                Number(storageCost.writeCost)) /
                              1_000_000_000
                            ).toFixed(9)}{' '}
                            WAL
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Storage Details Collapsible */}
                  {isStorageDetailsExpanded && (
                    <div className={styles.storageDetailsBox}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem'
                        }}
                      >
                        <div style={{ fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 500 }}>Storage Cost:</span>{' '}
                          <span style={{ color: '#10b981' }}>
                            {(
                              Number(storageCost.storageCost) / 1_000_000_000
                            ).toFixed(9)}{' '}
                            WAL
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 500 }}>Write Cost:</span>{' '}
                          <span style={{ color: '#f97316' }}>
                            {(
                              Number(storageCost.writeCost) / 1_000_000_000
                            ).toFixed(9)}{' '}
                            WAL
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '0.1rem',
                            marginTop: '0.1rem'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>Total Cost:</span>{' '}
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                            {(
                              (Number(storageCost.storageCost) +
                                Number(storageCost.writeCost)) /
                              1_000_000_000
                            ).toFixed(9)}{' '}
                            WAL
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* More Information Collapsible */}
                <div>
                  <button
                    type="button"
                    className={styles.collapsibleTrigger}
                    onClick={() => setIsMoreInfoExpanded(!isMoreInfoExpanded)}
                  >
                    <span>More Information</span>
                    <ChevronDown
                      size={20}
                      className={`${styles.collapsibleIcon} ${
                        isMoreInfoExpanded ? styles.collapsibleIconExpanded : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`${styles.collapsibleContent} ${
                      isMoreInfoExpanded
                        ? styles.collapsibleContentVisible
                        : styles.collapsibleContentHidden
                    }`}
                  >
                    {/* Link */}
                    <fieldset>
                      <Label>Link</Label>
                      <Input
                        value={link}
                        onChange={e =>
                          siteMetadataStore.link.set(e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </fieldset>

                    {/* Project URL */}
                    <fieldset>
                      <Label>Project URL</Label>
                      <Input
                        value={projectUrl}
                        onChange={e =>
                          siteMetadataStore.projectUrl.set(e.target.value)
                        }
                        placeholder="https://github.com/username/project"
                      />
                    </fieldset>

                    {/* Epochs */}
                    <fieldset>
                      <Label>Epochs (5-30)</Label>
                      <Input
                        type="number"
                        min={5}
                        max={30}
                        value={epochs}
                        onChange={e => {
                          const value = Number.parseInt(e.target.value, 10)
                          if (
                            !Number.isNaN(value) &&
                            value >= 5 &&
                            value <= 30
                          ) {
                            siteMetadataStore.epochs.set(value)
                          }
                        }}
                        placeholder="5"
                        disabled={!!siteId}
                      />
                      {siteId && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                            marginTop: '0.25rem'
                          }}
                        >
                          Epochs cannot be changed after deployment
                        </p>
                      )}
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {isDirty ? (
            <section className={styles.section}>
              <div className={styles.buttonGroup}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={siteMetadataStore.cancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  style={{ flex: 1 }}
                  onClick={onSaveMetadata}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </section>
          ) : (
            <section className={styles.section}>
              <div className={styles.buttonGroup}>
                <Button
                  variant="gradient"
                  style={{ width: '100%' }}
                  onClick={onDeploy}
                  disabled={isWorking}
                >
                  {deployStatusText}
                </Button>
              </div>
              <Banner
                title="Warning"
                description="You must pass all steps to deploy your site, which includes
                signing multiple transactions. Please don't close the website
                until the deployment is complete."
                variant="warning"
              />
            </section>
          )}
        </Dialog.Content>
      </Dialog.Portal>

      {/* Metadata Edit Dialog */}
      <MetadataEditDialog
        isOpen={isMetadataDialogOpen}
        onClose={() => setIsMetadataDialogOpen(false)}
      />
    </Dialog.Root>
  )
}

interface MetadataEditDialogProps {
  isOpen: boolean
  onClose: () => void
  onImageChange?: (file: File) => void
}

function MetadataEditDialog({ isOpen, onClose }: MetadataEditDialogProps) {
  const title = useStore(siteMetadataStore.title)
  const description = useStore(siteMetadataStore.description)
  const imageDisplayUrl = useStore(siteMetadataStore.imageDisplayUrl)
  const isDirty = useStore(siteMetadataStore.isDirty)
  const isLoading = useStore(siteMetadataStore.loading)

  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlImageSubmit = (url: string) => {
    siteMetadataStore.imageUrl.set(url)
  }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    siteMetadataStore.imageUrl.set(file ?? null)
  }
  const handleCancel = () => {
    siteMetadataStore.cancelEdit()
    onClose()
  }
  const handleReset = () => {
    siteMetadataStore.reset()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          {/* Header */}
          <div className={styles.dialogHeader}>
            <Dialog.Title
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--foreground)'
              }}
            >
              Edit Site Metadata
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                style={{
                  padding: '0.25rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--foreground)',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className={styles.dialogBodyTwoColumn}>
            {/* Left Column: Image Section */}
            <div>
              <div className={styles.fieldLabel}>
                <Label>Preview Image</Label>
                <button
                  type="button"
                  onClick={() => setShowUrlDialog(true)}
                  style={{
                    padding: '0.25rem',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--muted-foreground)',
                    borderRadius: '0.25rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  aria-label="Use image from URL"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Link icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
              </div>

              <div
                className={styles.uploadAreaSquare}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                style={{
                  cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? (
                  <div className={styles.uploadPlaceholder}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid var(--muted)',
                        borderTop: '3px solid var(--foreground)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '0.75rem'
                      }}
                    />
                    <p
                      style={{
                        fontWeight: 500,
                        color: 'var(--foreground)',
                        textAlign: 'center'
                      }}
                    >
                      Uploading...
                    </p>
                  </div>
                ) : imageDisplayUrl ? (
                  <img
                    src={imageDisplayUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '0.5rem'
                    }}
                  />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <Upload
                      size={32}
                      style={{
                        marginBottom: '0.75rem',
                        color: 'var(--muted-foreground)'
                      }}
                    />
                    <p
                      style={{
                        fontWeight: 500,
                        color: 'var(--foreground)',
                        textAlign: 'center'
                      }}
                    >
                      Click to upload
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--muted-foreground)',
                        textAlign: 'center',
                        marginTop: '0.25rem'
                      }}
                    >
                      Square image recommended
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Right Column: Text Fields */}
            <div className={styles.dialogRightColumn}>
              {/* Title Section */}
              <fieldset>
                <div className={styles.fieldLabel}>
                  <Label>Title</Label>
                  <span className={styles.charCount}>{title.length}/120</span>
                </div>
                <Input
                  value={title}
                  onChange={e =>
                    siteMetadataStore.title.set(e.target.value.slice(0, 120))
                  }
                  placeholder="Add a title..."
                />
              </fieldset>

              {/* Description Section */}
              <fieldset>
                <div className={styles.fieldLabel}>
                  <Label>Description</Label>
                  <span className={styles.charCount}>
                    {description.length}/150
                  </span>
                </div>
                <Textarea
                  value={description}
                  onChange={e =>
                    siteMetadataStore.description.set(
                      e.target.value.slice(0, 150)
                    )
                  }
                  placeholder="Add a description..."
                  rows={4}
                />
              </fieldset>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.dialogFooter}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--foreground)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--muted-foreground)'
              }}
            >
              Reset to default
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button onClick={handleCancel} variant="outline">
                Close
              </Button>
              <Dialog.Close asChild>
                <Button disabled={!isDirty || isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <ImageUrlDialog
        isOpen={showUrlDialog}
        onClose={() => setShowUrlDialog(false)}
        onSubmit={handleUrlImageSubmit}
      />
    </Dialog.Root>
  )
}

interface ImageUrlDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => void
}

function ImageUrlDialog({ isOpen, onClose, onSubmit }: ImageUrlDialogProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    try {
      new URL(url)
      onSubmit(url)
      setUrl('')
      setError('')
      onClose()
    } catch {
      setError('Please enter a valid URL')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 80
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '28rem',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 90
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div />
            <Dialog.Close asChild>
              <button
                type="button"
                style={{
                  padding: '0.25rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--foreground)',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <title>Puzzle icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h.01M9 20h6"
                  />
                </svg>
              </div>
            </div>

            {/* Title and Description */}
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  marginBottom: '0.5rem'
                }}
              >
                Use image from URL
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted-foreground)'
                }}
              >
                Paste an image URL to use for your site preview.
              </p>
            </div>

            {/* Input */}
            <div>
              <Label>Image URL</Label>
              <Input
                value={url}
                onChange={e => {
                  setUrl(e.target.value)
                  setError('')
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                placeholder="https://example.com/og.png"
                style={{ marginTop: '0.5rem' }}
              />
              {error && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'red',
                    marginTop: '0.5rem'
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}
          >
            <Button onClick={handleSubmit} style={{ width: '100%' }}>
              Submit
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default PublishModal
