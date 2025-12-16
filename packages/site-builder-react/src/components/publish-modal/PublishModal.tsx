import type { SuiClient } from '@mysten/sui/client'
import { useStore } from '@nanostores/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { CalendarClock, Info, Loader2, Pencil, Upload, X } from 'lucide-react'
import type { FC } from 'react'
import { useMemo, useRef, useState } from 'react'
import { useEpochDuration, useWalrusClient } from '~/hooks'
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
  const [isStorageDetailsExpanded, setIsStorageDetailsExpanded] =
    useState(false)

  const isOpen = useStore(sitePublishingStore.isPublishDialogOpen)
  const isWorking = useStore(sitePublishingStore.isWorking)
  const deployStatusText = useStore(sitePublishingStore.deployStatusText)
  const deployStepIndex = useStore(sitePublishingStore.deploymentStepIndex)
  const assetsSize = useStore(sitePublishingStore.assetsSize)
  const imageDisplayUrl = useStore(siteMetadataStore.imageDisplayUrl)
  const projectUrl = useStore(siteMetadataStore.projectUrl)
  const epochs = useStore(siteMetadataStore.epochs)
  const isDirty = useStore(siteMetadataStore.isDirty)
  const isLoading = useStore(siteMetadataStore.loading)
  const title = useStore(siteMetadataStore.title)
  const description = useStore(siteMetadataStore.description)

  const walrusClient = useWalrusClient(suiClient)
  const { epochDurationMs, getExpirationDate } = useEpochDuration(walrusClient)

  // Calculate min and max dates for date picker
  const minDate = useMemo(() => {
    if (!epochDurationMs) return ''
    const now = Date.now()
    const minEpochs = 5
    const minDateTime = now + minEpochs * epochDurationMs
    return new Date(minDateTime).toISOString().slice(0, 10)
  }, [epochDurationMs])

  const maxDate = useMemo(() => {
    if (!epochDurationMs) return ''
    const now = Date.now()
    const maxEpochs = 30
    const maxDateTime = now + maxEpochs * epochDurationMs
    return new Date(maxDateTime).toISOString().slice(0, 10)
  }, [epochDurationMs])

  // Calculate epochs from selected date
  const calculateEpochsFromDate = (selectedDate: string) => {
    if (!epochDurationMs || !selectedDate) return 5

    const now = Date.now()
    const targetTime = new Date(selectedDate).getTime()
    const diffMs = targetTime - now

    if (diffMs <= 0) return 5

    // Calculate epochs and round up
    const exactEpochs = diffMs / epochDurationMs
    const roundedEpochs = Math.ceil(exactEpochs)

    // Clamp between 5 and 30
    return Math.max(5, Math.min(30, roundedEpochs))
  }

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    if (!selectedDate) return

    const calculatedEpochs = calculateEpochsFromDate(selectedDate)
    siteMetadataStore.epochs.set(calculatedEpochs)
  }

  // Get current selected date from epochs
  const selectedDate = useMemo(() => {
    if (!epochDurationMs || !epochs) return ''
    const now = Date.now()
    const targetTime = now + epochs * epochDurationMs
    return new Date(targetTime).toISOString().slice(0, 10)
  }, [epochs, epochDurationMs])

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

  // Calculate expiration date using the hook
  const expirationDate = getExpirationDate(epochs)

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
                      {/* Gradient Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.7) 100%)',
                          pointerEvents: 'none'
                        }}
                      />
                      {/* Title and Description Overlay */}
                      {(title || description) && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '1rem',
                            color: 'white',
                            pointerEvents: 'none'
                          }}
                        >
                          {title && (
                            <h3
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '0.25rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {title}
                            </h3>
                          )}
                          {description && (
                            <p
                              style={{
                                fontSize: '0.75rem',
                                opacity: 0.9,
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {description}
                            </p>
                          )}
                        </div>
                      )}
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
              {/* Storage Cost Section */}
              <div
                className={styles.storageCostSection}
                style={{ marginTop: '0.5rem' }}
              >
                <div className={styles.storageCostSummary}>
                  <div className={styles.storageCostLabel}>
                    <span style={{ fontWeight: 500 }}>Storage Cost</span>
                    {assetsSize !== null && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsStorageDetailsExpanded(!isStorageDetailsExpanded)
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
                          e.currentTarget.style.backgroundColor = 'var(--muted)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent'
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
            </div>

            {/* Right Column: Metadata Information */}
            <div className={styles.rightColumn}>
              <div className={styles.metadataFields}>
                {/* Right Column: Text Fields */}
                <div className={styles.dialogRightColumn}>
                  {/* Title Section */}
                  <fieldset>
                    <div className={styles.fieldLabel}>
                      <Label>Title</Label>
                      <span className={styles.charCount}>
                        {siteMetadataStore.title.get().length}/120
                      </span>
                    </div>
                    <Input
                      value={siteMetadataStore.title.get()}
                      onChange={e =>
                        siteMetadataStore.title.set(
                          e.target.value.slice(0, 120)
                        )
                      }
                      placeholder="Add a title..."
                    />
                  </fieldset>

                  {/* Description Section */}
                  <fieldset>
                    <div className={styles.fieldLabel}>
                      <Label>Description</Label>
                      <span className={styles.charCount}>
                        {siteMetadataStore.description.get().length}/150
                      </span>
                    </div>
                    <Textarea
                      value={siteMetadataStore.description.get()}
                      onChange={e =>
                        siteMetadataStore.description.set(
                          e.target.value.slice(0, 150)
                        )
                      }
                      placeholder="Add a description..."
                      rows={4}
                    />
                  </fieldset>

                  {/* Project URL */}
                  <fieldset>
                    <Label>
                      Project URL
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      value={projectUrl}
                      onChange={e =>
                        siteMetadataStore.projectUrl.set(e.target.value)
                      }
                      placeholder="https://github.com/username/project"
                    />
                  </fieldset>

                  {/* Storage Duration Section */}
                  <fieldset>
                    <div className={styles.fieldLabel}>
                      <Label>Storage Duration</Label>
                      {epochs > 0 && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--foreground)'
                            }}
                          >
                            {epochs}
                          </span>
                          epochs
                        </span>
                      )}
                    </div>

                    {/* Date Picker */}
                    <div style={{ position: 'relative' }}>
                      <Input
                        type="date"
                        value={selectedDate}
                        min={minDate}
                        max={maxDate}
                        onChange={handleDateChange}
                        disabled={!!siteId}
                        style={{
                          paddingLeft: '2.5rem',
                          cursor: siteId ? 'not-allowed' : 'pointer'
                        }}
                      />
                      <CalendarClock
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted-foreground)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>

                    {/* Compact Info */}
                    {expirationDate && epochDurationMs && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--muted-foreground)',
                          marginTop: '0.5rem'
                        }}
                      >
                        <Info size={14} style={{ flexShrink: 0 }} />
                        <span>
                          1 epoch ≈{' '}
                          {(epochDurationMs / (1000 * 60 * 60 * 24)).toFixed(1)}{' '}
                          days
                          {' • '}
                          Duration rounded up. Can be extended later.
                        </span>
                      </div>
                    )}
                  </fieldset>
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
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={onDeploy}
                  disabled={isWorking}
                >
                  {isWorking && (
                    <Loader2 size={16} className={styles.spinner} />
                  )}
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
  const imageDisplayUrl = useStore(siteMetadataStore.imageDisplayUrl)
  const isDirty = useStore(siteMetadataStore.isDirty)
  const isLoading = useStore(siteMetadataStore.loading)

  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [fileSizeError, setFileSizeError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(
        `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      )
      e.target.value = '' // Reset input
      return
    }

    setFileSizeError('')
    siteMetadataStore.imageUrl.set(file)
  }

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      setUrlError('Please enter a valid URL')
      return
    }

    try {
      new URL(imageUrl)
      siteMetadataStore.imageUrl.set(imageUrl)
      setImageUrl('')
      setUrlError('')
      setUploadMode('file')
    } catch {
      setUrlError('Please enter a valid URL')
    }
  }

  const handleCancel = () => {
    siteMetadataStore.cancelEdit()
    setUploadMode('file')
    setImageUrl('')
    setUrlError('')
    setFileSizeError('')
    onClose()
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
              Edit Site Image
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
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Max 5MB
                </span>
              </div>

              {/* Upload Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.25rem',
                  backgroundColor: 'var(--muted)',
                  borderRadius: '0.5rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('file')
                    setUrlError('')
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor:
                      uploadMode === 'file'
                        ? 'var(--background)'
                        : 'transparent',
                    color:
                      uploadMode === 'file'
                        ? 'var(--foreground)'
                        : 'var(--muted-foreground)',
                    boxShadow:
                      uploadMode === 'file'
                        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                        : 'none'
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('url')
                    setFileSizeError('')
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor:
                      uploadMode === 'url'
                        ? 'var(--background)'
                        : 'transparent',
                    color:
                      uploadMode === 'url'
                        ? 'var(--foreground)'
                        : 'var(--muted-foreground)',
                    boxShadow:
                      uploadMode === 'url'
                        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                        : 'none'
                  }}
                >
                  From URL
                </button>
              </div>

              {uploadMode === 'file' ? (
                <>
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
                  {fileSizeError && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--destructive)',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Info size={14} />
                      {fileSizeError}
                    </p>
                  )}
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {imageDisplayUrl && (
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <img
                        src={imageDisplayUrl}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Image URL</Label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      <Input
                        value={imageUrl}
                        onChange={e => {
                          setImageUrl(e.target.value)
                          setUrlError('')
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleUrlSubmit()
                          }
                        }}
                        placeholder="https://example.com/image.png"
                        style={{ flex: 1 }}
                      />
                      <Button
                        onClick={handleUrlSubmit}
                        style={{ flexShrink: 0 }}
                      >
                        Apply
                      </Button>
                    </div>
                    {urlError && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--destructive)',
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Info size={14} />
                        {urlError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.dialogFooter}>
            <button
              type="button"
              onClick={() => {
                siteMetadataStore.imageUrl.set(
                  'https://www.walrus.xyz/walrus-site'
                )
                onClose()
              }}
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
    </Dialog.Root>
  )
}

export default PublishModal
