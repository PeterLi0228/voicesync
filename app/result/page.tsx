"use client"

import { useState, useEffect, Suspense, useRef, useMemo, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Copy, Check, Share2, Star, CheckCircle, FileAudio, Languages, Play, Pause } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { languages } from "@/components/language-selector"
import { useSearchParams, useRouter } from 'next/navigation'
import { mergeAudioSegments, createAudioPlaylist, formatFileSize, formatTime } from "@/lib/audio-utils"

interface ProcessingData {
  fileName: string
  fileSize: number
  sourceLanguage: string
  targetLanguage: string
  timestamp: number
}

interface ProcessingResult {
  originalTranscription: {
    transcription: string;
    detected_language: string;
    segments: Array<{
      id: number;
      start: number;
      end: number;
      text: string;
    }>;
  };
  translatedText: string;
  translatedSegments: Array<{
    id: number;
    start: number;
    end: number;
    originalText: string;
    translatedText: string;
  }>;
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
}

// 原始音频播放器组件
function OriginalAudioPlayer() {
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从localStorage获取原始音频数据
    try {
      const uploadedAudio = localStorage.getItem('uploadedAudio');
      if (uploadedAudio) {
        setAudioData(uploadedAudio);
      } else {
        setError('Original audio not found in storage');
      }
    } catch (err) {
      setError('Failed to load original audio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading original audio...</div>
      </div>
    );
  }

  if (error || !audioData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Original audio playback is not available. {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <audio controls className="w-full" preload="metadata">
        <source src={audioData} type="audio/mpeg" />
        <source src={audioData} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <div className="text-xs text-gray-500">
        Original audio from uploaded file
      </div>
    </div>
  );
}

// 整合音频播放器组件
function CombinedAudioPlayer({ 
  ttsAudios, 
  translatedSegments,
  onMergedAudioReady 
}: { 
  ttsAudios: any[], 
  translatedSegments: any[],
  onMergedAudioReady?: (audioUrl: string | null) => void
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mergedAudioUrl, setMergedAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 使用 useMemo 来稳定化过滤后的音频数组
  const successfulAudios = useMemo(() => 
    ttsAudios.filter(audio => 
      audio.status === 'succeeded' && audio.audioUrl
    ), [ttsAudios]
  );

  // 使用 useMemo 来稳定化音频段数据
  const audioSegments = useMemo(() => {
    return successfulAudios.map(audio => {
      const correspondingSegment = translatedSegments.find(seg => seg.id === audio.segmentId);
      return {
        segmentId: audio.segmentId,
        audioUrl: audio.audioUrl,
        start: correspondingSegment?.start || 0,
        end: correspondingSegment?.end || 0,
        originalDuration: audio.originalDuration || 0
      };
    });
  }, [successfulAudios, translatedSegments]);

  // 合并音频段
  useEffect(() => {
    // 如果没有音频段或者已经有合并的URL，跳过
    if (successfulAudios.length === 0) {
      setError('No audio segments available for playback.');
      setMergedAudioUrl(null);
      onMergedAudioReady?.(null);
      return;
    }

    // 如果只有一个音频段，直接使用
    if (successfulAudios.length === 1) {
      const audioUrl = successfulAudios[0].audioUrl;
      if (mergedAudioUrl !== audioUrl) {
        // 清理之前的 blob URL
        if (mergedAudioUrl && mergedAudioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(mergedAudioUrl);
        }
        setMergedAudioUrl(audioUrl);
        setError(null);
        onMergedAudioReady?.(audioUrl);
      }
      return;
    }

    // 多个音频需要合并
    let isCancelled = false;

    const mergeAudios = async () => {
      if (isCancelled) return;
      
      setIsLoading(true);
      setError(null);

      try {
        console.log('🎵 Merging audio segments:', audioSegments);
        
        // 尝试合并音频
        const mergedUrl = await mergeAudioSegments(audioSegments);
        
        if (!isCancelled) {
          // 清理之前的 blob URL
          if (mergedAudioUrl && mergedAudioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(mergedAudioUrl);
          }
          setMergedAudioUrl(mergedUrl);
          onMergedAudioReady?.(mergedUrl);
          console.log('✅ Audio segments merged successfully');
        } else {
          // 如果组件已卸载，清理新创建的 URL
          URL.revokeObjectURL(mergedUrl);
        }
        
      } catch (error) {
        if (!isCancelled) {
          console.error('❌ Failed to merge audio segments:', error);
          
          // 降级方案：使用第一个音频作为代表
          if (successfulAudios[0]) {
            setMergedAudioUrl(successfulAudios[0].audioUrl);
            setError('Audio merging failed, showing first segment only.');
            onMergedAudioReady?.(successfulAudios[0].audioUrl);
          } else {
            setError('Failed to load audio segments.');
            onMergedAudioReady?.(null);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    mergeAudios();

    // 清理函数
    return () => {
      isCancelled = true;
    };
  }, [audioSegments.length, audioSegments.map(s => s.audioUrl).join(','), onMergedAudioReady]); // 只在音频段数量或URL变化时重新执行

  // 组件卸载时清理 blob URL
  useEffect(() => {
    return () => {
      if (mergedAudioUrl && mergedAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mergedAudioUrl);
      }
    };
  }, [mergedAudioUrl]);

  // 音频事件处理
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (successfulAudios.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">No audio segments available for playback.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700">Merging audio segments...</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm font-medium text-blue-800 mb-2">
            Complete Translation Preview:
          </div>
          <div className="text-sm text-blue-700">
            {translatedSegments.map(segment => segment.translatedText).join(' ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 完整配音音频播放器 */}
      {mergedAudioUrl && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Complete Dubbed Audio:</div>
          <audio 
            ref={audioRef}
            controls 
            className="w-full" 
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
          >
            <source src={mergedAudioUrl} type="audio/wav" />
            <source src={mergedAudioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          
          {/* 显示当前播放时间 */}
          {duration > 0 && (
            <div className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
              {successfulAudios.length > 1 && (
                <span className="ml-2">• Merged from {successfulAudios.length} segments</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          {error}
        </div>
      )}
      
      {/* 翻译文本预览 */}
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm font-medium text-blue-800 mb-2">
          Complete Translation Preview:
        </div>
        <div className="text-sm text-blue-700">
          {translatedSegments.map(segment => segment.translatedText).join(' ')}
        </div>
      </div>
      
      {/* 统计信息 */}
      <div className="text-xs text-gray-500">
        Total segments: {successfulAudios.length} | 
        Individual playback available in Subtitle Comparison section
      </div>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("audio")
  const [copied, setCopied] = useState(false)
  const [processingData, setProcessingData] = useState<ProcessingData | null>(null)
  const [processingTime, setProcessingTime] = useState(0)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mergedAudioForDownload, setMergedAudioForDownload] = useState<string | null>(null)

  // 从 CombinedAudioPlayer 组件接收合并后的音频URL
  const handleMergedAudioReady = useCallback((audioUrl: string | null) => {
    setMergedAudioForDownload(audioUrl);
  }, []);

  useEffect(() => {
    // Get processing data from sessionStorage
    const data = sessionStorage.getItem('processingData')
    if (data) {
      const parsed = JSON.parse(data)
      setProcessingData(parsed)
      // Calculate processing time on client side only
      setProcessingTime(Math.round((Date.now() - parsed.timestamp) / 1000))
    }
  }, [])

  useEffect(() => {
    const resultId = searchParams.get('id')
    
    if (resultId) {
      // 从sessionStorage读取结果数据
      try {
        const storedResult = sessionStorage.getItem('processingResult')
        const storedId = sessionStorage.getItem('resultId')
        
        console.log('🔍 Checking sessionStorage:')
        console.log('  - Result ID from URL:', resultId)
        console.log('  - Stored ID:', storedId)
        console.log('  - Stored result exists:', !!storedResult)
        console.log('  - Stored result length:', storedResult?.length || 0)
        
        if (storedResult && storedId === resultId) {
          const parsedData = JSON.parse(storedResult)
          setResult(parsedData)
          console.log('✅ Result loaded from sessionStorage')
          return
        }
        
        // 如果sessionStorage不匹配，尝试localStorage备用
        console.log('❌ SessionStorage data mismatch, trying localStorage backup...')
        const backupResult = localStorage.getItem('processingResultBackup')
        const backupId = localStorage.getItem('resultIdBackup')
        
        console.log('🔍 Checking localStorage backup:')
        console.log('  - Backup ID:', backupId)
        console.log('  - Backup result exists:', !!backupResult)
        console.log('  - Backup result length:', backupResult?.length || 0)
        
        if (backupResult && backupId === resultId) {
          const parsedData = JSON.parse(backupResult)
          setResult(parsedData)
          console.log('✅ Result loaded from localStorage backup')
          return
        }
        
        // 如果两个存储都不匹配，尝试使用最新的数据（可能是并发请求导致的ID不匹配）
        if (storedResult || backupResult) {
          console.log('⚠️ ID mismatch but data exists, using most recent data...')
          const dataToUse = storedResult || backupResult
          if (dataToUse) {
            const parsedData = JSON.parse(dataToUse)
            setResult(parsedData)
            console.log('✅ Result loaded from fallback data')
            return
          }
        }
        
        console.log('❌ No matching data found in any storage')
        console.log('  - URL ID:', resultId)
        console.log('  - Session ID:', storedId)
        console.log('  - Backup ID:', backupId)
        console.log('  - ID match (session):', storedId === resultId)
        console.log('  - ID match (backup):', backupId === resultId)
        console.log('  - Result exists (session):', !!storedResult)
        console.log('  - Result exists (backup):', !!backupResult)
        
        throw new Error('Result data not found or expired')
      } catch (err) {
        console.error('Error loading result from storage:', err)
        setError('Failed to load result data. The session may have expired. Please try processing your audio again.')
      }
    } else {
      setError('No result ID provided')
    }
  }, [searchParams])

  const handleCopySubtitles = () => {
    if (!result) return;
    
    const subtitleText = result.translatedSegments
      .map((segment, index) => `${index + 1}\n${formatSRTTime(segment.start)} --> ${formatSRTTime(segment.end)}\n${segment.translatedText}\n\n`)
      .join("")

    navigator.clipboard.writeText(subtitleText)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const getLanguageLabel = (code: string) => {
    return languages.find(lang => lang.value === code)?.label || code
  }

  const downloadSubtitles = (segments: any[], filename: string) => {
    // 生成SRT格式字幕
    let srtContent = ''
    segments.forEach((segment, index) => {
      const startTime = formatSRTTime(segment.start)
      const endTime = formatSRTTime(segment.end)
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${segment.translatedText || segment.text}\n\n`
    })

    const blob = new Blob([srtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank' // 在新标签页打开
    a.rel = 'noopener noreferrer' // 安全性
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatSRTTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  const downloadDubbedAudio = async (ttsAudios: Array<{
    segmentId: number;
    originalDuration: number;
    audioUrl: string | null;
    status: string;
    error?: string;
    index?: number;
    ttsText?: string;
  }>) => {
    // 过滤出成功的音频
    const successfulAudios = ttsAudios.filter(audio => 
      audio.status === 'succeeded' && audio.audioUrl
    );
    
    if (successfulAudios.length === 0) {
      alert('No audio segments available for download');
      return;
    }
    
    // 如果有合并后的音频，优先下载合并音频
    if (mergedAudioForDownload && successfulAudios.length > 1) {
      try {
        // 在新标签页打开下载
        const link = document.createElement('a');
        link.href = mergedAudioForDownload;
        link.download = `complete_dubbed_audio_${result?.targetLanguage || 'translated'}.wav`;
        link.target = '_blank'; // 在新标签页打开
        link.rel = 'noopener noreferrer'; // 安全性
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.error('Failed to download merged audio:', error);
        // 如果合并音频下载失败，继续使用原来的逻辑
      }
    }
    
    if (successfulAudios.length === 1) {
      // 单个音频直接下载，在新标签页打开
      const audio = successfulAudios[0];
      const link = document.createElement('a');
      link.href = audio.audioUrl!;
      link.download = `dubbed_audio_segment_${audio.segmentId}.wav`;
      link.target = '_blank'; // 在新标签页打开
      link.rel = 'noopener noreferrer'; // 安全性
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 如果没有合并音频，尝试创建合并音频
      try {
        // 准备音频段数据，确保 audioUrl 不为 null
        const audioSegments = successfulAudios
          .filter(audio => audio.audioUrl !== null)
          .map(audio => {
            const correspondingSegment = result?.translatedSegments.find(seg => seg.id === audio.segmentId);
            return {
              segmentId: audio.segmentId,
              audioUrl: audio.audioUrl!, // 使用 ! 因为我们已经过滤了 null 值
              start: correspondingSegment?.start || 0,
              end: correspondingSegment?.end || 0,
              originalDuration: audio.originalDuration || 0
            };
          });

        console.log('🎵 Creating merged audio for download:', audioSegments);
        
        // 动态导入音频合并函数
        const { mergeAudioSegments } = await import('@/lib/audio-utils');
        const mergedUrl = await mergeAudioSegments(audioSegments);
        
        // 下载合并后的音频，在新标签页打开
        const link = document.createElement('a');
        link.href = mergedUrl;
        link.download = `complete_dubbed_audio_${result?.targetLanguage || 'translated'}.wav`;
        link.target = '_blank'; // 在新标签页打开
        link.rel = 'noopener noreferrer'; // 安全性
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Merged audio download initiated');
        
        // 清理临时URL
        setTimeout(() => {
          URL.revokeObjectURL(mergedUrl);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Failed to create merged audio for download:', error);
        
        // 降级方案：提供分段下载链接
        const downloadList = successfulAudios.map(audio => 
          `Segment ${audio.segmentId}: ${audio.audioUrl}`
        ).join('\n');
        
        const blob = new Blob([
          'Dubbed Audio Download Links\n',
          '========================\n\n',
          downloadList,
          '\n\nNote: Right-click each link and select "Save link as..." to download individual segments.',
          '\n\nMerged audio creation failed. Please download segments individually.'
        ], { type: 'text/plain' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dubbed_audio_links.txt';
        link.target = '_blank'; // 在新标签页打开
        link.rel = 'noopener noreferrer'; // 安全性
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 也可以尝试下载第一个音频作为示例
        if (successfulAudios[0]) {
          setTimeout(() => {
            const firstAudio = successfulAudios[0];
            const audioLink = document.createElement('a');
            audioLink.href = firstAudio.audioUrl!;
            audioLink.download = `dubbed_audio_segment_${firstAudio.segmentId}.wav`;
            audioLink.target = '_blank'; // 在新标签页打开
            audioLink.rel = 'noopener noreferrer'; // 安全性
            document.body.appendChild(audioLink);
            audioLink.click();
            document.body.removeChild(audioLink);
          }, 500);
        }
      }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/upload')} variant="outline">
                Back to Upload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading results...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 p-2 mb-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Processing Complete!</h1>
              <p className="text-lg text-muted-foreground">Your audio has been successfully translated and dubbed</p>
              
              {processingData && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="secondary">
                    {getLanguageLabel(processingData.sourceLanguage)} → {getLanguageLabel(processingData.targetLanguage)}
                  </Badge>
                  <Badge variant="secondary">
                    {formatFileSize(processingData.fileSize)}
                  </Badge>
                  {processingTime > 0 && (
                    <Badge variant="secondary">
                      Processed in {processingTime}s
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Processing Summary */}
            {processingData && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Processing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Original File</div>
                      <div className="font-medium">{processingData.fileName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">File Size</div>
                      <div className="font-medium">{formatFileSize(processingData.fileSize)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Source Language</div>
                      <div className="font-medium">{getLanguageLabel(processingData.sourceLanguage)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Target Language</div>
                      <div className="font-medium">{getLanguageLabel(processingData.targetLanguage)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="audio" value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="audio">Audio Players</TabsTrigger>
                <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Audio */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileAudio className="w-5 h-5" />
                        Original Audio ({result.sourceLanguage})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Original Transcription:</p>
                          <p className="text-gray-900">{result.originalTranscription.transcription}</p>
                        </div>
                        
                        {/* 原始音频播放器 - 使用localStorage中的音频数据 */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Original Audio Playback:</p>
                          <div className="p-3 bg-white rounded border">
                            <OriginalAudioPlayer />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dubbed Audio */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Dubbed Audio ({result.targetLanguage})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Translated Text:</p>
                          <p className="text-gray-900">{result.translatedText}</p>
                        </div>
                        
                        {/* 整合的音频播放器 */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Complete Dubbed Audio:</p>
                          <div className="p-3 bg-white rounded border">
                            <CombinedAudioPlayer 
                              ttsAudios={result.ttsAudios} 
                              translatedSegments={result.translatedSegments}
                              onMergedAudioReady={handleMergedAudioReady}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subtitles" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Subtitles</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadSubtitles(result?.originalTranscription.segments || [], 'original_subtitles.srt')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          disabled={!result?.originalTranscription.segments}
                        >
                          <Download className="h-4 w-4" />
                          Original
                        </Button>
                        <Button
                          onClick={() => downloadSubtitles(result?.translatedSegments || [], 'translated_subtitles.srt')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          disabled={!result?.translatedSegments}
                        >
                          <Download className="h-4 w-4" />
                          Translated
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySubtitles}
                          className="flex items-center gap-1"
                          disabled={!result?.translatedSegments}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy All
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {result?.translatedSegments.map((segment, index) => (
                        <div key={segment.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                          <div className="text-xs text-muted-foreground mb-1">
                            {formatSRTTime(segment.start)} → {formatSRTTime(segment.end)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {processingData ? getLanguageLabel(processingData.sourceLanguage) : getLanguageLabel(result.sourceLanguage)}
                              </div>
                              <p>{segment.originalText}</p>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {processingData ? getLanguageLabel(processingData.targetLanguage) : getLanguageLabel(result.targetLanguage)}
                              </div>
                              <p>{segment.translatedText}</p>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-muted-foreground">
                          No subtitles available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Subtitle Comparison */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Subtitle Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {result.translatedSegments.map((segment) => {
                    // 找到对应的TTS音频
                    const correspondingAudio = result.ttsAudios.find(
                      audio => audio.segmentId === segment.id
                    );
                    
                    return (
                      <div key={segment.id} className="border rounded-lg overflow-hidden">
                        {/* 文本对比部分 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Original ({result.sourceLanguage})</span>
                              <span className="text-xs text-gray-500">
                                {formatTime(segment.start)} - {formatTime(segment.end)}
                              </span>
                            </div>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded">{segment.originalText}</p>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-blue-700">Translated ({result.targetLanguage})</span>
                              <span className="text-xs text-gray-500">#{segment.id}</span>
                            </div>
                            <p className="text-gray-900 bg-blue-50 p-3 rounded">{segment.translatedText}</p>
                          </div>
                        </div>
                        
                        {/* 音频播放部分 */}
                        {correspondingAudio && (
                          <div className="border-t bg-gray-50 p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs text-gray-500 font-mono">Audio #{correspondingAudio.segmentId}</span>
                              <span className="text-xs text-gray-500">
                                Duration: {formatTime(correspondingAudio.originalDuration)}
                              </span>
                            </div>
                            
                            {correspondingAudio.audioUrl && correspondingAudio.status === 'succeeded' ? (
                              <div className="space-y-2">
                                <audio controls className="w-full" preload="metadata">
                                  <source src={correspondingAudio.audioUrl} type="audio/wav" />
                                  <source src={correspondingAudio.audioUrl} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                                
                                {/* 显示与音频100%对应的文本 */}
                                <div className="bg-blue-100 p-2 rounded text-sm">
                                  <div className="text-xs text-blue-600 mb-1">
                                    🎵 Audio content (exactly what you hear):
                                  </div>
                                  <div className="text-blue-900 font-medium">
                                    "{correspondingAudio.ttsText || segment.translatedText}"
                                  </div>
                                  
                                  {/* 不匹配警告 */}
                                  {correspondingAudio.ttsText && 
                                   correspondingAudio.ttsText !== segment.translatedText && (
                                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                      ⚠️ Note: Audio content differs from displayed translation
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200">
                                <span className="text-sm text-red-600">Audio generation failed</span>
                                {correspondingAudio.error && (
                                  <span className="text-xs text-red-500">({correspondingAudio.error})</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Download Dubbed Audio - Standalone */}
            <Card>
              <CardHeader>
                <CardTitle>Download Dubbed Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button
                    onClick={() => downloadDubbedAudio(result.ttsAudios)}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!result.ttsAudios.some(audio => audio.status === 'succeeded' && audio.audioUrl)}
                  >
                    <Download className="w-4 h-4" />
                    Download Complete Dubbed Audio
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Download Information:</strong> 
                    <br />• Complete dubbed audio will be downloaded as a single merged file
                    <br />• Audio preserves timing information for proper synchronization
                    <br />• Download opens in a new tab for your convenience
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading results...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
