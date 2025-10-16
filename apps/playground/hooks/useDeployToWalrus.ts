
import {
  type IAsset,
  type ICertifiedBlob,
  type IFlowListener,
  type ITransaction,
  objectIdToWalrusSiteUrl,
  WalrusSiteBuilderSdk
} from '@cmdoss/site-builder'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient
} from '@mysten/dapp-kit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWalrusClient } from './useWalrusClient'

export enum DeploySteps {
  Idle,
  Prepared,
  Uploaded,
  Certified,
  Deployed
}

export function useDeployToWalrus(assets: IAsset[]) {
  const suiClient = useSuiClient()
  const currentAccount = useCurrentAccount()
  const walrusClient = useWalrusClient()
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      execute: async ({ bytes, signature }) =>
        await suiClient.executeTransactionBlock({
          transactionBlock: bytes,
          signature,
          options: {
            // Raw effects are required so the effects can be reported back to the wallet
            showRawEffects: true,
            // // Select additional data to return
            // showObjectChanges: true,
            // Required to get the created objectID
            showEffects: true
          }
        })
    })
  const [currentStep, setCurrentStep] = useState(DeploySteps.Idle)
  const [loading, setLoading] = useState(false)

  const sdk = useMemo(() => {
    if (suiClient && walrusClient && currentAccount) {
      console.log('Initializing WalrusSiteBuilderSdk...')
      return new WalrusSiteBuilderSdk(
        walrusClient,
        suiClient,
        currentAccount,
        signAndExecuteTransaction
      )
    }
    return undefined
  }, [suiClient, currentAccount, signAndExecuteTransaction, walrusClient])

  const [certifiedBlobs, setCertifiedBlobs] = useState<ICertifiedBlob[]>([])
  const [deployedSiteId, setDeployedSiteId] = useState<string | undefined>()
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const deployFlow = useMemo(() => sdk?.deployFlow(assets), [sdk, assets])

  useEffect(() => {
    if (!deployFlow) return
    const onProress: IFlowListener<'progress'> = ({ detail: { message } }) => {
      console.log(`[DeployFlow] Progress: ${message || ''}`)
    }
    const onTransaction: IFlowListener<'transaction'> = () => {
      setTransactions(deployFlow.getTransactions())
    }
    deployFlow.addEventListener('progress', onProress)
    deployFlow.addEventListener('transaction', onTransaction)
    // TODO: clean up listeners
  }, [deployFlow])

  const handlePrepareAssets = useCallback(async () => {
    if (!deployFlow) {
      console.warn('Deploy flow is not initialized.')
      return
    }
    setLoading(true)
    setDeployedSiteId(undefined) // Reset deployed site ID when starting new deployment
    const startTime = performance.now()
    console.log('🚀 Starting asset preparation...')
    try {
      await deployFlow.prepareAssets()
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      console.log(`✅ Asset preparation completed in ${duration}ms`)
      setCurrentStep(DeploySteps.Prepared)
      setTransactions(deployFlow.getTransactions())
    } finally {
      setLoading(false)
    }
  }, [deployFlow])

  const handleUploadAssets = useCallback(
    async (epoch: number | 'max', permanent?: boolean) => {
      if (!deployFlow) return
      setLoading(true)
      const startTime = performance.now()
      console.log(
        `🚀 Starting asset upload (epoch: ${epoch}, permanent: ${permanent})...`
      )
      try {
        await deployFlow.uploadAssets(epoch, permanent)
        const endTime = performance.now()
        const duration = (endTime - startTime).toFixed(2)
        console.log(`✅ Asset upload completed in ${duration}ms`)
        setCurrentStep(DeploySteps.Uploaded)
        setTransactions(deployFlow.getTransactions())
      } finally {
        setLoading(false)
      }
    },
    [deployFlow]
  )
  const handleCertifyAssets = useCallback(async () => {
    if (!deployFlow) return
    setLoading(true)
    const startTime = performance.now()
    console.log('🚀 Starting asset certification...')
    try {
      const certifiedBlobs = await deployFlow.certifyAssets()
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      console.log(`✅ Asset certification completed in ${duration}ms`)
      setCurrentStep(DeploySteps.Certified)
      setCertifiedBlobs(certifiedBlobs)
      setTransactions(deployFlow.getTransactions())
    } finally {
      setLoading(false)
    }
  }, [deployFlow])

  const handleUpdateSite = useCallback(async () => {
    if (!deployFlow) return
    setLoading(true)
    const startTime = performance.now()
    console.log('🚀 Starting site update...')
    try {
      const siteId = await deployFlow.updateSite()
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      console.log(`✅ Site [${siteId}] update completed in ${duration}ms`)
      if (siteId) {
        const siteUrl = objectIdToWalrusSiteUrl(siteId, 'portal.ngao.vn', true)
        console.log('🌐 Site URL:', siteUrl)
        console.log(
          '📝 Site Explorer:',
          `https://suiscan.xyz/testnet/object/${siteId}`
        )

        // Show explorer toast as well
      } else {
      }
      setCurrentStep(DeploySteps.Deployed)
      if (siteId) setDeployedSiteId(siteId)
      setTransactions(deployFlow.getTransactions())
    } finally {
      setLoading(false)
    }
  }, [deployFlow])

  const handleCleanUp = useCallback(async () => {
    if (!deployFlow) return
    setLoading(true)
    const startTime = performance.now()
    console.log('🚀 Starting cleanup...')
    try {
      await deployFlow.cleanupAssets()
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      console.log(`✅ Cleanup completed in ${duration}ms`)
      setCurrentStep(DeploySteps.Idle)
      setDeployedSiteId(undefined) // Reset deployed site ID after cleanup
      setTransactions(deployFlow.getTransactions())
    } finally {
      setLoading(false)
    }
  }, [deployFlow])

  const resetDeployment = useCallback(() => {
    setCurrentStep(DeploySteps.Idle)
    setCertifiedBlobs([])
    setDeployedSiteId(undefined)
    setTransactions([])
  }, [])

  return {
    currentStep,
    certifiedBlobs,
    deployedSiteId,
    transactions,
    loading,
    handlePrepareAssets,
    handleUploadAssets,
    handleCertifyAssets,
    handleUpdateSite,
    handleCleanUp,
    resetDeployment
  }
}
