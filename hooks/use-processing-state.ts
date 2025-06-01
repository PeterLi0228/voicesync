import { useState, useEffect } from 'react'

export interface ProcessingData {
  fileName: string
  fileSize: number
  sourceLanguage: string
  targetLanguage: string
  timestamp: number
  status?: 'uploading' | 'processing' | 'completed' | 'error'
}

export function useProcessingState() {
  const [processingData, setProcessingData] = useState<ProcessingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load processing data from sessionStorage
    const loadProcessingData = () => {
      try {
        const data = sessionStorage.getItem('processingData')
        if (data) {
          const parsed = JSON.parse(data)
          setProcessingData(parsed)
        }
      } catch (error) {
        console.error('Error loading processing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProcessingData()
  }, [])

  const saveProcessingData = (data: ProcessingData) => {
    try {
      sessionStorage.setItem('processingData', JSON.stringify(data))
      setProcessingData(data)
    } catch (error) {
      console.error('Error saving processing data:', error)
    }
  }

  const clearProcessingData = () => {
    try {
      sessionStorage.removeItem('processingData')
      setProcessingData(null)
    } catch (error) {
      console.error('Error clearing processing data:', error)
    }
  }

  const updateStatus = (status: ProcessingData['status']) => {
    if (processingData) {
      const updatedData = { ...processingData, status }
      saveProcessingData(updatedData)
    }
  }

  return {
    processingData,
    isLoading,
    saveProcessingData,
    clearProcessingData,
    updateStatus,
  }
} 