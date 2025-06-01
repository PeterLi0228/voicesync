// Audio file validation utilities
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export interface AudioValidationResult {
  isValid: boolean
  error?: string
}

export function validateAudioFile(file: File): AudioValidationResult {
  // Check file type
  if (!SUPPORTED_AUDIO_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Please upload an MP3 or WAV file.',
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`,
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio file'))
    })
    
    audio.src = url
  })
}

// Subtitle utilities
export interface SubtitleSegment {
  id: number
  start: string
  end: string
  original: string
  translated: string
}

export function formatSubtitlesToSRT(subtitles: SubtitleSegment[]): string {
  return subtitles
    .map((sub) => `${sub.id}\n${sub.start} --> ${sub.end}\n${sub.translated}\n\n`)
    .join('')
}

export function formatSubtitlesToVTT(subtitles: SubtitleSegment[]): string {
  const header = 'WEBVTT\n\n'
  const content = subtitles
    .map((sub) => `${sub.start} --> ${sub.end}\n${sub.translated}\n\n`)
    .join('')
  
  return header + content
}

// Processing status utilities
export type ProcessingStatus = 'idle' | 'uploading' | 'transcribing' | 'translating' | 'generating' | 'aligning' | 'completed' | 'error'

export const PROCESSING_STEPS = [
  { id: 'transcribing', name: 'Transcribing audio', description: 'Converting speech to text' },
  { id: 'translating', name: 'Translating content', description: 'Translating to target language' },
  { id: 'generating', name: 'Generating voice', description: 'Creating dubbed audio' },
  { id: 'aligning', name: 'Aligning audio', description: 'Synchronizing timing' },
  { id: 'completed', name: 'Finalizing', description: 'Preparing final output' },
] as const

export function getProcessingProgress(status: ProcessingStatus): number {
  const statusMap: Record<ProcessingStatus, number> = {
    idle: 0,
    uploading: 10,
    transcribing: 25,
    translating: 50,
    generating: 75,
    aligning: 90,
    completed: 100,
    error: 0,
  }
  
  return statusMap[status] || 0
}

export function getCurrentStep(status: ProcessingStatus): number {
  const stepMap: Record<ProcessingStatus, number> = {
    idle: 0,
    uploading: 0,
    transcribing: 1,
    translating: 2,
    generating: 3,
    aligning: 4,
    completed: 5,
    error: 0,
  }
  
  return stepMap[status] || 0
} 