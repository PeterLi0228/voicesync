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

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 合并多个音频段为一个完整的音频文件
 * @param audioSegments 音频段数组，包含audioUrl和时间信息
 * @returns Promise<string> 返回合并后的音频Blob URL
 */
export const mergeAudioSegments = async (audioSegments: Array<{
  segmentId: number;
  audioUrl: string;
  start: number;
  end: number;
  originalDuration: number;
}>): Promise<string> => {
  try {
    // 创建音频上下文
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 按segmentId排序确保正确顺序
    const sortedSegments = audioSegments.sort((a, b) => a.segmentId - b.segmentId);
    
    // 加载所有音频段
    const audioBuffers: AudioBuffer[] = [];
    let totalDuration = 0;
    
    for (const segment of sortedSegments) {
      try {
        const response = await fetch(segment.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
        totalDuration += audioBuffer.duration;
      } catch (error) {
        console.error(`Failed to load audio segment ${segment.segmentId}:`, error);
        // 创建静音缓冲区作为占位符
        const silentBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);
        audioBuffers.push(silentBuffer);
        totalDuration += 1;
      }
    }
    
    if (audioBuffers.length === 0) {
      throw new Error('No audio segments could be loaded');
    }
    
    // 创建合并后的音频缓冲区
    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels));
    const totalSamples = Math.ceil(totalDuration * sampleRate);
    
    const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalSamples, sampleRate);
    
    // 合并音频数据
    let currentOffset = 0;
    
    for (let i = 0; i < audioBuffers.length; i++) {
      const buffer = audioBuffers[i];
      const segment = sortedSegments[i];
      
      // 添加段间间隔（基于原始时间戳）
      if (i > 0) {
        const previousSegment = sortedSegments[i - 1];
        const gap = segment.start - previousSegment.end;
        if (gap > 0) {
          // 添加静音间隔
          currentOffset += Math.ceil(gap * sampleRate);
        }
      }
      
      // 复制音频数据到合并缓冲区
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceChannel = Math.min(channel, buffer.numberOfChannels - 1);
        const sourceData = buffer.getChannelData(sourceChannel);
        const targetData = mergedBuffer.getChannelData(channel);
        
        for (let sample = 0; sample < sourceData.length && currentOffset + sample < totalSamples; sample++) {
          targetData[currentOffset + sample] = sourceData[sample];
        }
      }
      
      currentOffset += buffer.length;
    }
    
    // 将AudioBuffer转换为WAV格式的Blob
    const wavBlob = audioBufferToWav(mergedBuffer);
    const blobUrl = URL.createObjectURL(wavBlob);
    
    return blobUrl;
  } catch (error) {
    console.error('Error merging audio segments:', error);
    throw error;
  }
};

/**
 * 将AudioBuffer转换为WAV格式的Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Convert audio data
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * 简化版本：创建音频播放列表（如果浏览器不支持音频合并）
 */
export const createAudioPlaylist = (audioSegments: Array<{
  segmentId: number;
  audioUrl: string;
  start: number;
  end: number;
  ttsText?: string;
}>): string => {
  // 创建一个简单的播放列表
  const sortedSegments = audioSegments.sort((a, b) => a.segmentId - b.segmentId);
  
  // 返回第一个音频URL作为代表（简化实现）
  return sortedSegments[0]?.audioUrl || '';
}; 