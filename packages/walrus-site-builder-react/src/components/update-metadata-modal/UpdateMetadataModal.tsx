import type { SuiClient } from '@mysten/sui/client'
import type { WalrusClient } from '@mysten/walrus'
import * as Dialog from '@radix-ui/react-dialog'
import type { QueryClient } from '@tanstack/react-query'
import { Info, Loader2, Upload, X } from 'lucide-react'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  type UseUpdateSiteMetadataParams,
  useUpdateSiteMetadata
} from '~/hooks/useUpdateSiteMetadata'
import { useWalrusSiteQuery } from '~/queries'
import { Button } from '../ui/Button'
import { Input, Label, Textarea } from '../ui/Input'
import * as styles from './UpdateMetadataModal.css'

/**
 * Props for the UpdateMetadataModal component.
 *
 * @example
 * ```tsx
 * <UpdateMetadataModal
 *   siteId="0x123..."
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   clients={{ suiClient, queryClient, walrusClient }}
 *   currentAccount={currentAccount}
 *   signAndExecuteTransaction={signAndExecuteTransaction}
 * />
 * ```
 */
interface UpdateMetadataModalProps {
  /** The object ID of the published Walrus site to update */
  siteId: string
  /** Controls the visibility of the modal */
  isOpen: boolean
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Optional callback when metadata update succeeds. Receives the transaction digest. */
  onSuccess?: (digest: string) => void
  /** Optional callback when metadata update fails. Receives the error object. */
  onError?: (error: Error) => void
  /** Object containing Sui, Query, and Walrus clients */
  clients: {
    /** Sui blockchain client for on-chain operations */
    suiClient: SuiClient
    /** React Query client for data fetching and caching */
    queryClient: QueryClient
    /** Walrus storage client for blob operations */
    walrusClient: WalrusClient
  }
  /** Current connected wallet account. Must be non-null to submit updates. */
  currentAccount: UseUpdateSiteMetadataParams['currentAccount']
  /** Function to sign and execute transactions on the Sui blockchain */
  signAndExecuteTransaction: UseUpdateSiteMetadataParams['signAndExecuteTransaction']
  /** Optional transaction sponsorship configuration */
  sponsorConfig?: UseUpdateSiteMetadataParams['sponsorConfig']
}

/**
 * UpdateMetadataModal Component
 *
 * A modal dialog component for updating metadata (name, description, project URL, preview image)
 * of an existing Walrus site on the Sui blockchain.
 *
 * ## Features
 * - Updates site name (max 120 chars), description (max 150 chars), project URL, and preview image
 * - Supports image upload (max 5MB) or URL input
 * - Validates wallet connection before allowing submission
 * - Automatically loads current site metadata when opened
 * - Shows loading states and error messages
 *
 * ## Usage
 *
 * ```tsx
 * import { UpdateMetadataModal, isUpdateMetadataModalOpen } from '@cmdoss/walrus-site-builder-react'
 * import { useStore } from '@nanostores/react'
 *
 * function MyComponent() {
 *   const isOpen = useStore(isUpdateMetadataModalOpen)
 *
 *   return (
 *     <UpdateMetadataModal
 *       siteId="0x123..."
 *       isOpen={isOpen}
 *       onOpenChange={isUpdateMetadataModalOpen.set}
 *       onSuccess={(digest) => console.log('Updated:', digest)}
 *       clients={{ suiClient, queryClient, walrusClient }}
 *       currentAccount={currentAccount}
 *       signAndExecuteTransaction={signAndExecuteTransaction}
 *     />
 *   )
 * }
 * ```
 *
 * ## State Management
 *
 * The modal visibility is typically controlled via the `isUpdateMetadataModalOpen` atom:
 *
 * ```tsx
 * import { isUpdateMetadataModalOpen } from '@cmdoss/walrus-site-builder-react'
 *
 * // Open modal
 * isUpdateMetadataModalOpen.set(true)
 *
 * // Close modal
 * isUpdateMetadataModalOpen.set(false)
 * ```
 *
 * @see {@link useUpdateSiteMetadata} - The hook used internally for metadata updates
 * @see {@link useWalrusSiteQuery} - Used to fetch current site data
 */

const UpdateMetadataModal: FC<UpdateMetadataModalProps> = ({
  siteId,
  isOpen,
  onOpenChange,
  onSuccess,
  onError,
  clients: { suiClient, queryClient, walrusClient },
  currentAccount,
  signAndExecuteTransaction,
  sponsorConfig
}) => {
  const [siteName, setSiteName] = useState('')
  const [description, setDescription] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')
  const [fileSizeError, setFileSizeError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  // Get current site data
  const { data: siteData, isLoading: isLoadingSite } = useWalrusSiteQuery(
    siteId,
    {
      suiClient,
      queryClient
    }
  )

  // Update metadata hook
  const { updateSiteMetadata, isUpdating, error } = useUpdateSiteMetadata({
    siteId,
    clients: {
      suiClient,
      queryClient,
      walrusClient
    },
    currentAccount,
    signAndExecuteTransaction,
    sponsorConfig
  })

  // Check if SDK is ready
  const isSdkReady = !!currentAccount && !!suiClient && !!walrusClient

  // Populate form with current site data
  useEffect(() => {
    if (siteData && isOpen) {
      setSiteName(siteData.name || '')
      setDescription(siteData.description || '')
      setProjectUrl(siteData.project_url || '')
      setImageUrl(siteData.image_url || '')
      setUrlInput(siteData.image_url || '')
    }
  }, [siteData, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrlError('')
      setFileSizeError('')
      setUploadMode('url')
    }
  }, [isOpen])

  // Handle image file upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(
        `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      )
      e.target.value = ''
      return
    }

    setFileSizeError('')
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setImageUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle URL submit
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a valid URL')
      return
    }

    try {
      new URL(urlInput)
      setImageUrl(urlInput)
      setUrlError('')
    } catch {
      setUrlError('Please enter a valid URL')
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!isSdkReady) {
      const error = new Error(
        'Wallet not connected. Please connect your wallet first.'
      )
      onError?.(error)
      return
    }

    try {
      // Only send fields that have values (non-empty strings)
      // Empty fields will be preserved from current site data in the hook
      const digest = await updateSiteMetadata({
        siteName: siteName.trim() || undefined,
        metadata: {
          ...(description.trim() && { description: description.trim() }),
          ...(projectUrl.trim() && { project_url: projectUrl.trim() }),
          ...(imageUrl.trim() && { image_url: imageUrl.trim() })
        }
      })
      onSuccess?.(digest)
      onOpenChange(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      onError?.(error)
    }
  }

  // Check if form has changes
  const hasChanges =
    siteName !== (siteData?.name || '') ||
    description !== (siteData?.description || '') ||
    projectUrl !== (siteData?.project_url || '') ||
    imageUrl !== (siteData?.image_url || '')

  const isLoading = isLoadingSite || isUpdating

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Update Site Metadata
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              Update the metadata for your site
            </Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" className={styles.closeButton}>
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {isLoadingSite ? (
            <div className={styles.loadingContainer}>
              <Loader2 size={24} className={styles.spinner} />
              <p>Loading site data...</p>
            </div>
          ) : (
            <div className={styles.body}>
              {/* Image URL */}
              <fieldset>
                <div className={styles.fieldLabel}>
                  <Label>Preview Image</Label>
                  <span className={styles.optionalLabel}>Max 5MB</span>
                </div>

                {/* Upload Mode Toggle */}
                <div className={styles.uploadModeToggle}>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('file')
                      setUrlError('')
                    }}
                    className={
                      uploadMode === 'file'
                        ? styles.uploadModeButtonActive
                        : styles.uploadModeButton
                    }
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('url')
                      setFileSizeError('')
                    }}
                    className={
                      uploadMode === 'url'
                        ? styles.uploadModeButtonActive
                        : styles.uploadModeButton
                    }
                  >
                    From URL
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <>
                    <div
                      className={styles.uploadArea}
                      onClick={() =>
                        !isUpdating && fileInputRef.current?.click()
                      }
                      style={{
                        cursor: isUpdating ? 'wait' : 'pointer',
                        opacity: isUpdating ? 0.6 : 1
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className={styles.previewImage}
                        />
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <Upload size={32} />
                          <p>Click to upload</p>
                          <p className={styles.uploadHint}>
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
                      <p className={styles.errorText}>
                        <Info size={14} />
                        {fileSizeError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className={styles.urlInputContainer}>
                    {imageUrl && (
                      <div className={styles.imagePreview}>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className={styles.previewImage}
                        />
                      </div>
                    )}
                    <div className={styles.urlInputWrapper}>
                      <Input
                        value={urlInput}
                        onChange={e => {
                          setUrlInput(e.target.value)
                          setUrlError('')
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleUrlSubmit()
                          }
                        }}
                        placeholder="https://example.com/image.png"
                        disabled={isUpdating}
                      />
                      <Button
                        onClick={handleUrlSubmit}
                        disabled={isUpdating}
                        style={{ flexShrink: 0 }}
                      >
                        Apply
                      </Button>
                    </div>
                    {urlError && (
                      <p className={styles.errorText}>
                        <Info size={14} />
                        {urlError}
                      </p>
                    )}
                  </div>
                )}
              </fieldset>
              {/* Site Name */}
              <fieldset>
                <div className={styles.fieldLabel}>
                  <Label>Site Name</Label>
                  <span className={styles.charCount}>
                    {siteName.length}/120
                  </span>
                </div>
                <Input
                  value={siteName}
                  onChange={e => setSiteName(e.target.value.slice(0, 120))}
                  placeholder="Enter site name..."
                  disabled={isUpdating}
                />
              </fieldset>

              {/* Description */}
              <fieldset>
                <div className={styles.fieldLabel}>
                  <Label>Description</Label>
                  <span className={styles.charCount}>
                    {description.length}/150
                  </span>
                </div>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 150))}
                  placeholder="Enter description..."
                  rows={4}
                  disabled={isUpdating}
                />
              </fieldset>

              {/* Project URL */}
              <fieldset>
                <Label>
                  Project URL
                  <span className={styles.optionalLabel}> (Optional)</span>
                </Label>
                <Input
                  value={projectUrl}
                  onChange={e => setProjectUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  disabled={isUpdating}
                />
              </fieldset>

              {!isSdkReady && (
                <div className={styles.warningBanner}>
                  <Info size={16} />
                  <span>Please connect your wallet to update metadata</span>
                </div>
              )}
              {error && (
                <div className={styles.errorBanner}>
                  <Info size={16} />
                  <span>Failed to update metadata: {error.message}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.footer}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || isLoading || !isSdkReady}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isUpdating && <Loader2 size={16} className={styles.spinner} />}
              {isUpdating
                ? 'Updating...'
                : !isSdkReady
                  ? 'Connect Wallet'
                  : 'Update Metadata'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default UpdateMetadataModal
