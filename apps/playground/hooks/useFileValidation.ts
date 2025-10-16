import { useState } from 'react'

export interface FileValidationResult {
  error: string | null
  validateFile: (file: File) => boolean
  clearError: () => void
}

export function useFileValidation(maxFileSize: number): FileValidationResult {
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      const fileSizeMiB = (file.size / (1024 * 1024)).toFixed(2)
      const maxSizeMiB = maxFileSize / (1024 * 1024)
      const errorMessage = `File size (${fileSizeMiB} MiB) exceeds maximum allowed size (${maxSizeMiB} MiB)`
      setError(errorMessage)
      return false
    }

    setError(null)
    return true
  }

  const clearError = () => setError(null)

  return {
    error,
    validateFile,
    clearError
  }
}
