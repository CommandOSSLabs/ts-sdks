'use client'

import { objectIdToWalrusSiteUrl } from '@cmdoss/site-builder'
import { Download, ExternalLink, Link } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdvancedSettings } from '@/components/AdvancedSettings'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { BlobContentViewer } from '@/components/BlobContentViewer'
import { CostDisplay } from '@/components/CostDisplay'
import { Introduction } from '@/components/Introduction'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DeploySteps, useDeployToWalrus } from '@/hooks/useDeployToWalrus'
import { useZenFsWorkspace } from '@/hooks/useZenFsWorkspace'
import { testFiles } from './files'

const AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space'
const WALRUSCAN_URL = 'https://walruscan.com/testnet'
const SUIVISION_URL = 'https://testnet.suivision.xyz'
const PORTAL_HOST = 'localhost:3001'
const PORTAL_HTTPS = false

const getContentByteLength = (content: string | Uint8Array): number => {
  if (typeof content === 'string')
    return new TextEncoder().encode(content).length

  return content.byteLength
}

export default function Home() {
  // State Management
  const [epochs, setEpochs] = useState(1)
  const [deletable, setDeletable] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // ZenFS Workspace Hook
  const {
    assets,
    loading: isFileSystemLoading,
    clear: clearWorkspace,
    fileManager
  } = useZenFsWorkspace()

  // Calculate File Size
  const fileSize = useMemo(() => {
    return assets.reduce(
      (sum, file) => sum + getContentByteLength(file.content),
      0
    )
  }, [assets])

  // Deploy to Walrus Hooks
  const {
    currentStep,
    handleCertifyAssets,
    handlePrepareAssets,
    handleUpdateSite,
    handleUploadAssets,
    loading,
    certifiedBlobs,
    deployedSiteId,
    resetDeployment
  } = useDeployToWalrus(assets)

  const addTestFiles = useCallback(async () => {
    try {
      for (const [path, content] of Object.entries(testFiles)) {
        await fileManager?.writeFile(path, content)
      }
    } catch (error) {
      console.error('Failed to create test files:', error)
    }
  }, [fileManager])

  useEffect(() => {
    Object.assign(window, { objectIdToWalrusSiteUrl })
  }, [])

  return (
    <div className="container mx-auto p-6">
      <AnimatedBackground />
      <Introduction />
      <div className="flex flex-col items-center lg:items-start lg:grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <CardContent className="relative">
          <h1 className="mb-1">Assets</h1>
          {isFileSystemLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Loading file system...
                </span>
              </div>
            </div>
          )}
          {!assets.length ? (
            <div className="space-y-4">
              <div className="pt-2">
                <Button
                  onClick={addTestFiles}
                  className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
                >
                  Add Test Files (HTML + SVG)
                </Button>
                <p className="text-xs text-gray-300 mt-2 text-center">
                  Creates index.html with Hello World and a glass of water SVG
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map(({ path, content }) => (
                <div key={path} className="border rounded-lg">
                  <div className=" px-3 py-2 border-b">
                    <span className="text-sm font-medium">{path}</span>
                  </div>
                  <pre className=" p-4 text-xs overflow-x-auto max-h-40">
                    <BlobContentViewer content={content} />
                  </pre>
                </div>
              ))}

              <Button
                onClick={() => {
                  clearWorkspace()
                  resetDeployment()
                }}
                className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
              >
                Clear Files
              </Button>
            </div>
          )}

          <hr className="my-4 border-t border-neutral-400 dark:border-neutral-700" />

          <AdvancedSettings
            epochs={epochs}
            onEpochsChange={setEpochs}
            deletable={deletable}
            onDeletableChange={setDeletable}
            isOpen={showAdvancedSettings}
            onToggle={() => setShowAdvancedSettings(!showAdvancedSettings)}
          />

          <hr className="my-4 border-t border-neutral-400 dark:border-neutral-700" />

          <CostDisplay fileSize={fileSize} epochs={epochs} />
        </CardContent>

        <CardContent>
          <h1 className="mb-1">Deploy</h1>
          <div className=" flex flex-col gap-2">
            <Button
              onClick={() => handlePrepareAssets()}
              className={`w-full ${currentStep !== DeploySteps.Idle || loading ? 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]' : 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]'}`}
              size="lg"
              disabled={currentStep !== DeploySteps.Idle || loading}
            >
              {currentStep <= DeploySteps.Idle
                ? '1. Register Blobs'
                : '✓ Registered'}
            </Button>
            <Button
              onClick={() => handleUploadAssets(epochs)}
              className={`w-full ${currentStep !== DeploySteps.Prepared || loading ? 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]' : 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]'}`}
              size="lg"
              disabled={currentStep !== DeploySteps.Prepared || loading}
            >
              {currentStep <= DeploySteps.Prepared
                ? '2. Upload to Network'
                : '✓ Uploaded'}
            </Button>
            <Button
              onClick={() => handleCertifyAssets()}
              className={`w-full ${currentStep !== DeploySteps.Uploaded || loading ? 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]' : 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]'}`}
              size="lg"
              disabled={currentStep !== DeploySteps.Uploaded || loading}
            >
              {currentStep <= DeploySteps.Uploaded
                ? '3. Certify Upload'
                : '✓ Certified'}
            </Button>
            <Button
              onClick={() => handleUpdateSite()}
              className={`w-full ${currentStep !== DeploySteps.Certified || loading ? 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]' : 'bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]'}`}
              size="lg"
              disabled={currentStep !== DeploySteps.Certified || loading}
            >
              {currentStep <= DeploySteps.Certified
                ? '4. Update Site'
                : '✓ Updated'}
            </Button>
          </div>

          <div className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">File Name</TableHead>
                  <TableHead className="text-white">Walruscan</TableHead>
                  <TableHead className="text-white">
                    Associated
                    <br />
                    Sui Object
                  </TableHead>
                  <TableHead className="text-white">Download Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifiedBlobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground whitespace-normal break-words"
                    >
                      No certified blobs yet.
                      <br /> Complete the deployment process to see your files
                      here.
                    </TableCell>
                  </TableRow>
                ) : (
                  certifiedBlobs.map(blob => (
                    <TableRow key={blob.blobId + blob.patchId}>
                      <TableCell>{blob.identifier}</TableCell>
                      <TableCell>
                        <a
                          href={`${WALRUSCAN_URL}/blob/${blob.blobId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C684F6] hover:text-[#A855E8] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`${SUIVISION_URL}/object/${blob.suiObjectId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C684F6] hover:text-[#A855E8] transition-colors"
                        >
                          <Link className="w-4 h-4" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`${AGGREGATOR_URL}/v1/blobs/by-quilt-patch-id/${blob.patchId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={blob.identifier}
                          className="text-[#C684F6] hover:text-[#A855E8] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {deployedSiteId && (
            <>
              <h1 className="mb-1 mt-4">Deployed Site</h1>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Live Site</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          const siteUrl = objectIdToWalrusSiteUrl(
                            deployedSiteId,
                            PORTAL_HOST,
                            PORTAL_HTTPS
                          )
                          window.open(siteUrl, '_blank')
                        }}
                        variant="outline"
                        className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Site
                      </Button>
                    </div>
                    <p className="text-xs text-gray-300 break-all">
                      {objectIdToWalrusSiteUrl(
                        deployedSiteId,
                        PORTAL_HOST,
                        PORTAL_HTTPS
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sui Explorer</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          window.open(
                            `${SUIVISION_URL}/object/${deployedSiteId}`,
                            '_blank'
                          )
                        }}
                        variant="outline"
                        className="w-full bg-[#97f0e5] text-[#0C0F1D] hover:bg-[#97f0e5]/90 border border-[#97F0E599]"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                    <p className="text-xs text-gray-300 break-all">
                      {`${SUIVISION_URL}/object/${deployedSiteId}`}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Site Object ID</h4>
                  <div className="bg-gray-700 dark:bg-gray-500 p-3 rounded-lg">
                    <code className="text-xs break-all">{deployedSiteId}</code>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  )
}
