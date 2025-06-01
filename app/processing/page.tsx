"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, XCircle, FileAudio, Languages, Mic, Music, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { languages } from "@/components/language-selector"
import { EnhancedProgress } from "@/components/ui/enhanced-progress"

interface ProcessingStep {
  step: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description?: string;
}

interface ProcessingResult {
  originalTranscription: any;
  translatedText: string;
  translatedSegments: any[];
  ttsAudios: Array<{
    segmentId: number;
    originalDuration: number;
    audioUrl: string | null;
    status: string;
    error?: string;
    index?: number;
    ttsText?: string;
  }>;
  sourceLanguage: string;
  targetLanguage: string;
  processingSteps: ProcessingStep[];
}

interface ProgressUpdate {
  step: number;
  progress: number;
  message: string;
  data?: any;
  error?: boolean;
  timestamp: string;
  type?: string;
}

function ProcessingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { step: 1, name: 'Audio Transcription', status: 'pending', description: 'Converting speech to text...' },
    { step: 2, name: 'Text Translation', status: 'pending', description: 'Translating content...' },
    { step: 3, name: 'Segment Translation', status: 'pending', description: 'Processing individual segments...' },
    { step: 4, name: 'Voice Synthesis', status: 'pending', description: 'Generating dubbed audio...' },
    { step: 5, name: 'Audio Alignment', status: 'pending', description: 'Synchronizing timing...' }
  ])
  
  const audioFile = searchParams.get('audioFile')
  const sourceLanguage = searchParams.get('sourceLanguage') || 'auto'
  const targetLanguage = searchParams.get('targetLanguage') || 'en'

  useEffect(() => {
    if (!resultId) {
      const newResultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setResultId(newResultId)
      console.log('🆔 Generated unique result ID:', newResultId)
    }
  }, [])

  useEffect(() => {
    if (!audioFile) {
      router.push('/upload')
      return
    }
    
    if (!hasStarted && !isProcessing && resultId) {
      setHasStarted(true)
      startProcessingWithProgress()
    }
  }, [audioFile, hasStarted, isProcessing, resultId])

  const startProcessingWithProgress = async () => {
    // 防止重复调用
    if (isProcessing) {
      console.log('Processing already in progress, skipping...')
      return
    }
    
    console.log('🎵 Starting audio processing with real-time progress...')
    setIsProcessing(true)
    setError(null)
    
    try {
      // 模拟从localStorage获取音频文件数据
      const audioData = localStorage.getItem('uploadedAudio')
      if (!audioData) {
        throw new Error('No audio file found')
      }
      
      // 将base64转换为File对象
      const response = await fetch(audioData)
      const blob = await response.blob()
      const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' })
      
      // 创建FormData
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('sourceLanguage', sourceLanguage)
      formData.append('targetLanguage', targetLanguage)
      
      // 调用流式处理API
      console.log('📡 Calling streaming process-audio API...')
      const processingResponse = await fetch('/api/process-audio-stream', {
        method: 'POST',
        body: formData,
      })
      
      if (!processingResponse.ok) {
        throw new Error(`API error: ${processingResponse.status}`)
      }

      // 处理Server-Sent Events流
      const reader = processingResponse.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      let streamCompleted = false
      let lastProgressTime = Date.now()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('✅ Processing stream completed')
            streamCompleted = true
            break
          }
          
          lastProgressTime = Date.now() // 更新最后接收到数据的时间
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const progressData: ProgressUpdate = JSON.parse(line.slice(6))
                
                // 处理心跳消息
                if (progressData.type === 'heartbeat') {
                  console.log('💓 Received heartbeat, connection is alive')
                  continue
                }
                
                handleProgressUpdate(progressData)
                
                // 只有在收到完整的最终数据时才考虑完成
                if (progressData.progress >= 100 && progressData.data) {
                  console.log('🎯 Received final result with complete data, stream should close soon')
                } else if (progressData.progress >= 100) {
                  console.log('🎯 Received 100% progress but waiting for final data...')
                }
              } catch (e) {
                console.error('Failed to parse progress data:', e, 'Raw line:', line)
              }
            }
          }
        }
      } catch (streamError) {
        console.error('Stream reading error:', streamError)
        if (!streamCompleted) {
          throw new Error(`Stream reading failed: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`)
        }
      } finally {
        // 确保reader被正确关闭
        try {
          reader.releaseLock()
        } catch (e) {
          console.log('Reader already released')
        }
      }
      
      // 检查是否正常完成
      if (!streamCompleted) {
        throw new Error('Stream ended unexpectedly')
      }
      
    } catch (err) {
      console.error('Processing error:', err)
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProgressUpdate = (update: ProgressUpdate) => {
    console.log('📊 Progress update:', update)
    
    if (update.error) {
      setError(update.message)
      setIsProcessing(false)
      return
    }
    
    // 更新进度
    setProgress(update.progress)
    setCurrentMessage(update.message)
    
    // 更新当前步骤
    if (update.step > 0) {
      setCurrentStep(update.step - 1) // 转换为0-based索引
      
      // 更新步骤状态
      setSteps(prevSteps => prevSteps.map((step, index) => {
        if (index < update.step - 1) {
          return { ...step, status: 'completed' as const }
        } else if (index === update.step - 1) {
          return { ...step, status: 'processing' as const, description: update.message }
        } else {
          return { ...step, status: 'pending' as const }
        }
      }))
    }
    
    // 如果处理完成
    if (update.progress >= 100 && update.data) {
      console.log('🎉 Processing completed, preparing to redirect...')
      setResult(update.data)
      setIsProcessing(false) // 标记处理完成
      setSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'completed' as const })))
      
      // 使用sessionStorage存储结果数据，避免URL过长
      try {
        if (!resultId) {
          console.error('❌ Result ID is null, cannot save data')
          setError('Processing completed but failed to generate result ID. Please try again.')
          return
        }
        
        const resultData = JSON.stringify(update.data)
        
        console.log('💾 Saving result data:')
        console.log('  - Result ID:', resultId)
        console.log('  - Data size:', resultData.length, 'characters')
        
        // 保存到sessionStorage
        sessionStorage.setItem('processingResult', resultData)
        sessionStorage.setItem('resultId', resultId)
        
        // 同时保存到localStorage作为备用
        localStorage.setItem('processingResultBackup', resultData)
        localStorage.setItem('resultIdBackup', resultId)
        
        console.log('✅ Result saved to both sessionStorage and localStorage')
        
        // 验证保存是否成功
        const verifySession = sessionStorage.getItem('processingResult')
        const verifyLocal = localStorage.getItem('processingResultBackup')
        console.log('🔍 Verification:')
        console.log('  - SessionStorage saved:', !!verifySession)
        console.log('  - LocalStorage saved:', !!verifyLocal)
        
        // 增加延迟时间，让用户看到完成状态
        setTimeout(() => {
          console.log('🔄 Redirecting to result page...')
          try {
            // 使用简单的结果ID而不是完整数据
            router.push(`/result?id=${resultId}`)
          } catch (redirectError) {
            console.error('Failed to redirect:', redirectError)
            // 如果跳转失败，显示错误信息
            setError('Processing completed but failed to redirect. Please refresh the page.')
          }
        }, 3000) // 3秒延迟确保用户能看到完成状态
      } catch (storageError) {
        console.error('Failed to save result:', storageError)
        setError('Processing completed but failed to save result. Please try again.')
      }
    }
  }

  const getStepIcon = (step: ProcessingStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    } else if (step.status === 'processing') {
      return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    } else if (step.status === 'failed') {
      return <XCircle className="w-6 h-6 text-red-500" />
    } else {
      const icons = [FileAudio, Languages, Languages, Mic, Music]
      const Icon = icons[index] || FileAudio
      return <Icon className="w-6 h-6 text-gray-400" />
    }
  }

  const getLanguageLabel = (code: string) => {
    return languages.find(lang => lang.value === code)?.label || code
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Processing Your Audio</h1>
              <p className="text-lg text-muted-foreground">Please wait while we translate and dub your audio</p>
              
              {audioFile && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="secondary">
                    {getLanguageLabel(sourceLanguage)} → {getLanguageLabel(targetLanguage)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* File Info Card */}
              {audioFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">File Name</div>
                        <div className="font-medium">{audioFile}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Languages</div>
                        <div className="font-medium">{getLanguageLabel(sourceLanguage)} → {getLanguageLabel(targetLanguage)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Progress Bar */}
              <EnhancedProgress 
                value={progress}
                steps={steps.map(step => ({
                  id: step.step,
                  name: step.name.split(' ')[0], // 简化名称以适应显示
                  status: step.status
                }))}
                currentStep={currentStep}
                className="mb-8"
              />

              {/* Current Step Details */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      {progress >= 100 ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      {progress >= 100 ? 'Processing Complete!' : steps[currentStep]?.name || 'Processing...'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {progress >= 100 
                        ? 'Your audio has been successfully processed'
                        : currentMessage || `Step ${currentStep + 1} of ${steps.length}`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning */}
              {!error && (
                <Alert>
                  <AlertDescription>
                    Please do not close this window. Your audio is being processed and will be ready shortly.
                  </AlertDescription>
                </Alert>
              )}

              {/* Steps List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      return (
                        <div key={step.step} className="flex items-center">
                          <div className="mr-3">
                            {getStepIcon(step, index)}
                          </div>
                          <div className="flex-1">
                            <div
                              className={
                                step.status === 'completed'
                                  ? "text-green-500 font-medium"
                                  : step.status === 'processing'
                                    ? "font-medium"
                                    : step.status === 'failed'
                                      ? "text-red-500 font-medium"
                                      : "text-muted-foreground"
                              }
                            >
                              {step.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.description}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.status === 'completed' && '✓'}
                            {step.status === 'processing' && '⏳'}
                            {step.status === 'failed' && '✗'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading processing page...</p>
        </div>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  )
}
