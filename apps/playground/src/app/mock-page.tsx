'use client'

import { Button } from '@wal-0/shadcn/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@wal-0/shadcn/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@wal-0/shadcn/components/table'
import { Download, ExternalLink, Link } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSpinner } from '@/components/chat/message-spinner'
import { useDeployToWalrus } from '@/hooks/useDeployToWalrus'
import { useZenFsWorkspace } from '@/hooks/useZenFsWorkspace'
import { objectIdToWalrusSiteUrl } from '@/lib/utils'
import { DeploySteps } from '@/store/site-deployment.store'
import { AdvancedSettings } from './_components/AdvancedSettings'
import { CostDisplay } from './_components/CostDisplay'
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

export default function TestDeployPage() {
  const {
    assets,
    loading: isFileSystemLoading,
    clear: clearWorkspace,
    fileManager
  } = useZenFsWorkspace()
  const [epochs, setEpochs] = useState(1) // Default to 1 epoch
  const [deletable, setDeletable] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const fileSize = useMemo(() => {
    return assets.reduce(
      (sum, file) => sum + getContentByteLength(file.content),
      0
    )
  }, [assets])
  const {
    currentStep,
    handleCertifyAssets,
    // handleCleanUp,
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
      // Create the files in ZenFS
      for (const [path, content] of Object.entries(testFiles)) {
        await fileManager?.writeFile(path, content)
      }
    } catch (error) {
      console.error('Failed to create test files:', error)
    }
  }, [fileManager])

  useEffect(() => {
    // DEBUG: Expose utility functions to window
    Object.assign(window, { objectIdToWalrusSiteUrl })
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Deploy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1200px]">
        {/* Assets Pane */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isFileSystemLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSpinner />
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
                    variant="outline"
                    className="w-full"
                  >
                    Add Test Files (HTML + SVG)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Creates index.html with Hello World and a glass of water SVG
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ✅ Test files created successfully in ZenFS memory store!
                </div>

                {assets.map(({ path, content }) => (
                  <div key={path} className="border rounded-lg">
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b">
                      <span className="text-sm font-medium">{path}</span>
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 text-xs overflow-x-auto max-h-40">
                      <BlobContentViewer content={content} />
                    </pre>
                  </div>
                ))}

                <Button
                  onClick={() => {
                    clearWorkspace()
                    resetDeployment()
                  }}
                  variant="outline"
                  className="w-full"
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
        </Card>

        {/* Deploy Pane */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Deploy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the button below to start the deployment process.
            </p>

            <div className="pt-4 flex flex-col gap-2 max-w-sm">
              <Button
                onClick={() => handlePrepareAssets()}
                className="w-full"
                size="lg"
                disabled={currentStep !== DeploySteps.Idle || loading}
              >
                1. Register Blobs
              </Button>
              <Button
                onClick={() => handleUploadAssets(epochs)}
                className="w-full"
                size="lg"
                disabled={currentStep !== DeploySteps.Prepared || loading}
              >
                2. Upload to Network
              </Button>
              <Button
                onClick={() => handleCertifyAssets()}
                className="w-full"
                size="lg"
                disabled={currentStep !== DeploySteps.Uploaded || loading}
              >
                3. Certify Upload
              </Button>
              <Button
                onClick={() => handleUpdateSite()}
                className="w-full"
                size="lg"
                disabled={currentStep !== DeploySteps.Certified || loading}
              >
                4. Update Site
              </Button>
              {/* <Button
                onClick={() => handleCleanUp()}
                className="w-full"
                size="lg"
                disabled={currentStep !== DeploySteps.Deployed || loading}
              >
                5. Cleanup Assets
              </Button> */}
            </div>

            <div className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Walruscan</TableHead>
                    <TableHead>
                      Associated
                      <br />
                      Sui Object
                    </TableHead>
                    <TableHead>Download Link</TableHead>
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

            {/* Deployed Site Section */}
            {deployedSiteId && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>🚀 Deployed Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Live Site
                        </h4>
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
                            className="w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Site
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 break-all">
                          {objectIdToWalrusSiteUrl(
                            deployedSiteId,
                            PORTAL_HOST,
                            PORTAL_HTTPS
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sui Explorer
                        </h4>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              window.open(
                                `${SUIVISION_URL}/object/${deployedSiteId}`,
                                '_blank'
                              )
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Link className="w-4 h-4 mr-2" />
                            View on Explorer
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 break-all">
                          {`${SUIVISION_URL}/object/${deployedSiteId}`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Object ID
                      </h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <code className="text-xs break-all">
                          {deployedSiteId}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BlobContentViewer({ content }: { content: string | Uint8Array }) {
  const txt = useMemo(() => {
    try {
      return typeof content === 'string'
        ? content
        : new TextDecoder().decode(content)
    } catch {
      return '<binary data>'
    }
  }, [content])

  return <code className="whitespace-pre-wrap">{txt}</code>
}
