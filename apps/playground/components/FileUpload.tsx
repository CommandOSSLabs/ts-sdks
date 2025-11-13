import { useCurrentAccount } from '@mysten/dapp-kit'
import { ChevronDown, Image, ImageUp } from 'lucide-react'
import { useRef, useState } from 'react'
import { useFileValidation } from '../hooks/useFileValidation'
import { useWalrusUpload } from '../hooks/useWalrusUpload'
import { AdvancedSettings } from './AdvancedSettings'
import type { ImageCardProps } from './ImageCard'
import { Button } from './ui/button'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MiB in bytes

interface FileUploadProps {
  onUploadComplete: (uploadedBlob: ImageCardProps) => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const currentAccount = useCurrentAccount()

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [epochs, setEpochs] = useState(1)
  const [deletable, setDeletable] = useState(false)
  // const [tipAmountMist] = useState('105')

  // File validation
  const { error, validateFile, clearError } = useFileValidation(MAX_FILE_SIZE)

  // Use the new Walrus upload hook
  const {
    state,
    encodeFile,
    registerBlob,
    writeToUploadRelay,
    certifyBlob,
    reset: resetUpload
  } = useWalrusUpload()

  // Derive convenient flags from the finite-state machine returned by the hook
  const uploadStatus = state.status

  const isEncoding = uploadStatus === 'encoding'
  const canRegister = uploadStatus === 'can-register'
  const isRegistering = uploadStatus === 'registering'
  const canRelay = uploadStatus === 'can-relay'
  const isRelaying = uploadStatus === 'relaying'
  const canCertify = uploadStatus === 'can-certify'
  const isCertifying = uploadStatus === 'certifying'

  // Expose error (if any) coming from the upload hook
  const uploadError = uploadStatus === 'error' ? state.message : null

  // Utility helper for button colours & interactivity
  const getButtonClass = (
    canPress: boolean,
    inProgress: boolean,
    isSuccess: boolean
  ) => {
    if (isSuccess) return 'bg-[#07B09A] cursor-default'
    if (inProgress) return 'bg-[#97F0E5]/50 cursor-not-allowed'
    return canPress
      ? 'bg-[#97F0E5] hover:bg-[#97F0E5]/80 cursor-pointer'
      : 'bg-gray-500/50 cursor-not-allowed'
  }

  // Register button helpers
  const registerDisabled =
    !canRegister || isRegistering || !file || !currentAccount || isEncoding
  const hasRegistered = [
    'can-relay',
    'relaying',
    'can-certify',
    'certifying'
  ].includes(uploadStatus)
  const registerButtonClass = getButtonClass(
    !registerDisabled,
    isRegistering,
    hasRegistered
  )

  // Relay button helpers
  const relayDisabled = !canRelay || isRelaying
  const hasRelayed = ['can-certify', 'certifying'].includes(uploadStatus)
  const relayButtonClass = getButtonClass(
    !relayDisabled,
    isRelaying,
    hasRelayed
  )

  // Certify button helpers
  const certifyDisabled = !canCertify || isCertifying
  const certifyButtonClass = getButtonClass(
    !certifyDisabled,
    isCertifying,
    false
  )

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateFile(selectedFile)) {
      setFile(null)
      return
    }

    setFile(selectedFile)
    await encodeFile(selectedFile)
  }

  const handleRegisterBlob = async () => {
    await registerBlob({
      epochs,
      deletable
    })
  }

  const handleWriteToUploadRelay = async () => {
    await writeToUploadRelay()
  }

  const handleCertifyBlob = async () => {
    const result = await certifyBlob()
    onUploadComplete({
      patchId: result[0].id,
      blobId: result[0].blobId,
      suiObjectId: result[0].blobObject.id.id,
      endEpoch: result[0].blobObject.storage.end_epoch
    })
    resetUploadProcess()
  }

  const resetUploadProcess = () => {
    setFile(null)
    clearError()
    resetUpload()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Combine errors from UI and upload hook
  const displayError = error || uploadError

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Blob to upload
        </label>
        <div className="w-full p-2 bg-[#0C0F1D] border-2 border-[#97F0E599] rounded-md">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-file-upload-button]:hidden [&::file-selector-button]:hidden focus:outline-none focus:ring-0"
              onChange={e => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) {
                  handleFileSelect(selectedFile)
                }
              }}
            />
            <div className="w-full p-2 border border-2 border-[#97F0E599] border-dashed rounded-md flex items-center justify-center min-h-[100px]">
              {file ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Image size={56} strokeWidth={1} className="text-[#97F0E5]" />
                  <p className="text-[#F7F7F7]">{file.name}</p>
                  <p className="text-sm text-[#F7F7F7]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MiB
                  </p>
                  {isEncoding ? (
                    <div className="flex items-center gap-2 text-sm text-[#97F0E5]">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#97F0E5]"></div>
                      <span>Computing metadata...</span>
                    </div>
                  ) : (
                    <Button className="border border-[#C684F6] rounded-md px-2 py-1 text-sm text-[#C684F6]">
                      CHOOSE FILE
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <ImageUp
                    size={56}
                    strokeWidth={1}
                    className="text-[#97F0E5]"
                  />
                  <p className="text-[#FFFFFF]">Drag & drop a file</p>
                  <p className="text-sm text-[#F7F7F7]">
                    Max {MAX_FILE_SIZE / (1024 * 1024)} MiB.
                  </p>
                  <Button className="border border-[#C684F6] rounded-md px-2 py-1 text-sm text-[#C684F6]">
                    CHOOSE FILE
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {displayError && (
          <p className="text-red-500 text-sm mt-1">{displayError}</p>
        )}
      </div>

      <AdvancedSettings
        epochs={epochs}
        onEpochsChange={setEpochs}
        deletable={deletable}
        onDeletableChange={setDeletable}
        isOpen={showAdvancedSettings}
        onToggle={() => setShowAdvancedSettings(!showAdvancedSettings)}
      />

      {/* Upload Buttons - All Steps Displayed */}
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-0">
          {/* Step 1: Register Blob */}
          <Button
            className={`text-[#0C0F1D] w-full py-2 px-4 rounded-md transition-colors duration-200 ${
              registerButtonClass
            }`}
            onClick={handleRegisterBlob}
            disabled={registerDisabled}
          >
            {hasRegistered ? (
              <div className="flex items-center justify-center gap-2">
                <span>✓ Registered</span>
              </div>
            ) : isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0C0F1D]"></div>
                <span>Registering...</span>
              </div>
            ) : !currentAccount ? (
              <div className="flex items-center justify-center gap-2">
                <span>1. Connect Wallet First</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>1. Register Blob</span>
              </div>
            )}
          </Button>

          {/* Arrow Down */}
          <div className="flex items-center justify-center">
            <ChevronDown
              size={24}
              className={`transform transition-colors ${
                hasRegistered ? 'text-[#97F0E5]' : 'text-gray-500'
              }`}
            />
          </div>

          {/* Step 2: Write to Upload Relay */}
          <Button
            className={`text-[#0C0F1D] w-full py-2 px-4 rounded-md transition-colors duration-200 ${
              relayButtonClass
            }`}
            onClick={handleWriteToUploadRelay}
            disabled={relayDisabled}
          >
            {hasRelayed ? (
              <div className="flex items-center justify-center gap-2">
                <span>✓ Uploaded</span>
              </div>
            ) : isRelaying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0C0F1D]"></div>
                <span>Uploading to Network...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>2. Upload to Network</span>
              </div>
            )}
          </Button>

          {/* Arrow Down */}
          <div className="flex items-center justify-center">
            <ChevronDown
              size={24}
              className={`transform transition-colors ${
                hasRelayed ? 'text-[#97F0E5]' : 'text-gray-500'
              }`}
            />
          </div>

          {/* Step 3: Certify Blob */}
          <Button
            className={`text-[#0C0F1D] w-full py-2 px-4 rounded-md transition-colors duration-200 ${
              certifyButtonClass
            }`}
            onClick={handleCertifyBlob}
            disabled={certifyDisabled}
          >
            {isCertifying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0C0F1D]"></div>
                <span>Certifying...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>3. Certify Upload</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
