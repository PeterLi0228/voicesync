import { NextRequest } from 'next/server';

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResult {
  transcription: string;
  detected_language: string;
  segments: Segment[];
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`🎯 [${requestId}] Starting streaming process-audio API call`);
  
  // 创建一个可读流用于Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      processAudioWithProgress(request, controller, requestId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Accel-Buffering': 'no', // 禁用nginx缓冲
    },
  });
}

async function processAudioWithProgress(
  request: NextRequest, 
  controller: ReadableStreamDefaultController, 
  requestId: string
) {
  let isControllerClosed = false;
  let finalResultSent = false; // 添加标志防止重复发送最终结果
  let heartbeatInterval: NodeJS.Timeout | null = null; // 心跳定时器
  
  // 确保在函数结束时清理心跳
  const cleanup = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };
  
  try {
    // 发送进度更新的辅助函数
    const sendProgress = (step: number, progress: number, message: string, data?: any) => {
      // 特殊处理：允许发送最终结果（step 5, progress 100），即使finalResultSent为true
      const isFinalResult = step === 5 && progress === 100;
      
      if (isControllerClosed) {
        console.log(`⚠️ [${requestId}] Skipping progress update - controller closed: ${message}`);
        return false;
      }
      
      if (finalResultSent && !isFinalResult) {
        console.log(`⚠️ [${requestId}] Skipping progress update - final result already sent: ${message}`);
        return false;
      }
      
      try {
        const progressData = {
          step,
          progress,
          message,
          data,
          timestamp: new Date().toISOString()
        };
        controller.enqueue(`data: ${JSON.stringify(progressData)}\n\n`);
        console.log(`📤 [${requestId}] Progress sent: Step ${step}, ${progress}% - ${message}`);
        return true; // 返回true表示发送成功
      } catch (error) {
        console.error(`❌ [${requestId}] Failed to send progress:`, error);
        isControllerClosed = true;
        return false;
      }
    };

    // 发送心跳的辅助函数
    const sendHeartbeat = () => {
      if (isControllerClosed || finalResultSent) return false;
      
      try {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })}\n\n`);
        return true;
      } catch (error) {
        console.error(`❌ [${requestId}] Failed to send heartbeat:`, error);
        isControllerClosed = true;
        return false;
      }
    };

    // 启动心跳机制（每30秒发送一次）
    heartbeatInterval = setInterval(() => {
      if (!sendHeartbeat()) {
        cleanup();
      }
    }, 30000);

    // 解析请求数据
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sourceLanguage = formData.get('sourceLanguage') as string;
    const targetLanguage = formData.get('targetLanguage') as string;
    
    console.log(`🎯 [${requestId}] Processing: ${audioFile?.name}, ${sourceLanguage} → ${targetLanguage}`);
    
    if (!audioFile || !targetLanguage) {
      sendProgress(0, 0, 'Error: Audio file and target language are required');
      isControllerClosed = true;
      controller.close();
      return;
    }

    // 步骤1: 音频转文字 (0-25%)
    sendProgress(1, 5, 'Starting audio transcription...');
    console.log('Step 1: Starting transcription...');
    
    const transcriptionResult = await transcribeAudioWithProgress(audioFile, sendProgress, requestId);
    
    if (!transcriptionResult.success) {
      sendProgress(1, 0, `Transcription failed: ${transcriptionResult.error}`);
      isControllerClosed = true;
      controller.close();
      return;
    }

    const transcription = transcriptionResult.data;
    sendProgress(1, 25, 'Audio transcription completed', { 
      transcription: transcription.transcription,
      detectedLanguage: transcription.detected_language 
    });
    
    // 步骤2: 翻译文本 (25-50%)
    sendProgress(2, 30, 'Starting text translation...');
    console.log('Step 2: Starting translation...');
    
    const translationResult = await translateTextWithProgress(
      transcription.transcription,
      targetLanguage,
      transcription.detected_language,
      sendProgress
    );
    
    if (!translationResult.success) {
      sendProgress(2, 25, `Translation failed: ${translationResult.error}`);
      isControllerClosed = true;
      controller.close();
      return;
    }

    sendProgress(2, 50, 'Text translation completed', { 
      translatedText: translationResult.translatedText 
    });

    // 步骤3: 翻译分段文本 (50-70%)
    sendProgress(3, 55, 'Starting segment translation...');
    console.log('Step 3: Translating segments...');
    
    const translatedSegments = await translateSegmentsWithProgress(
      transcription.segments,
      targetLanguage,
      transcription.detected_language,
      sendProgress,
      translationResult.translatedText
    );

    sendProgress(3, 70, 'Segment translation completed', { 
      segmentCount: translatedSegments.length 
    });

    // 步骤4: 生成TTS音频 (70-95%)
    sendProgress(4, 75, 'Starting voice synthesis...');
    console.log('Step 4: Generating TTS audio...');
    
    // 在开始TTS之前检查连接状态
    if (isControllerClosed) {
      console.log(`⚠️ [${requestId}] Controller closed before TTS, stopping`);
      return;
    }
    
    const ttsResults = await generateTTSForSegmentsWithProgress(
      translatedSegments,
      targetLanguage,
      sendProgress,
      requestId
    );

    if (!ttsResults.success) {
      sendProgress(4, 70, `TTS generation failed: ${ttsResults.error}`);
      isControllerClosed = true;
      controller.close();
      return;
    }

    // 检查控制器状态，如果已关闭则不发送后续更新
    if (isControllerClosed) {
      console.log(`⚠️ [${requestId}] Controller closed during TTS processing, stopping`);
      return;
    }

    // 立即发送TTS完成进度
    console.log(`🎯 [${requestId}] TTS completed, sending progress update`);
    const ttsProgressSent = sendProgress(4, 95, 'Voice synthesis completed', { 
      audioCount: ttsResults.audios?.length || 0
    });

    if (!ttsProgressSent) {
      console.log(`⚠️ [${requestId}] Failed to send TTS progress, stopping`);
      return;
    }

    // 步骤5: 完成处理 (95-100%)
    console.log(`🎯 [${requestId}] Sending final results...`);
    
    const finalData = {
      originalTranscription: transcription,
      translatedText: translationResult.translatedText,
      translatedSegments: translatedSegments,
      ttsAudios: ttsResults.audios,
      sourceLanguage: transcription.detected_language,
      targetLanguage: targetLanguage,
      processingSteps: [
        { step: 1, name: 'Audio Transcription', status: 'completed' },
        { step: 2, name: 'Text Translation', status: 'completed' },
        { step: 3, name: 'Segment Translation', status: 'completed' },
        { step: 4, name: 'TTS Generation', status: 'completed' },
        { step: 5, name: 'Audio Alignment', status: 'completed' }
      ]
    };

    // 发送最终结果
    const finalResultSentSuccess = sendProgress(5, 100, 'Processing completed successfully!', finalData);
    
    if (!finalResultSentSuccess) {
      console.log(`⚠️ [${requestId}] Failed to send final result`);
      return;
    }

    // 立即设置标志并关闭流，防止任何后续操作
    finalResultSent = true;
    isControllerClosed = true;
    console.log(`✅ [${requestId}] Final result sent successfully, closing stream immediately`);

    // 清理心跳
    cleanup();
    
    // 等待一小段时间确保数据发送完成，然后立即关闭
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 安全关闭流
    try {
      controller.close();
      console.log(`🔒 [${requestId}] Stream closed successfully`);
    } catch (closeError) {
      console.log(`⚠️ [${requestId}] Stream was already closed: ${closeError instanceof Error ? closeError.message : 'Unknown error'}`);
    }
    
    return; // 立即返回，不执行后续代码

  } catch (error) {
    console.error('Audio processing error:', error);
    
    if (!isControllerClosed && !finalResultSent) {
      try {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(`data: ${JSON.stringify({
          step: 0,
          progress: 0,
          message: `Processing failed: ${errorMessage}`,
          error: true,
          timestamp: new Date().toISOString()
        })}\n\n`);
        
        // 等待错误消息发送
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (enqueueError) {
        console.error('Failed to send error message:', enqueueError);
      }
      
      try {
        isControllerClosed = true;
        controller.close();
      } catch (closeError) {
        console.log(`⚠️ [${requestId}] Controller already closed during error handling`);
      }
    }
  } finally {
    cleanup();
  }
}

// 带进度更新的音频转文字函数
async function transcribeAudioWithProgress(audioFile: File, sendProgress: Function, requestId: string) {
  const transcribeId = Math.random().toString(36).substr(2, 9);
  console.log(`🎤 [${transcribeId}] Starting transcription for: ${audioFile.name}`);
  
  try {
    sendProgress(1, 10, 'Preparing audio file...');
    
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');
    const dataUrl = `data:${audioFile.type};base64,${base64Audio}`;

    sendProgress(1, 15, 'Calling Whisper API...');
    console.log(`🎤 [${transcribeId}] Calling Replicate Whisper API...`);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN_WHISPER}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "3c08daf437fe359eb158a5123c395673f0a113dd8b4bd01ddce5936850e2a981",
        input: {
          audio: dataUrl,
          model: "large-v3",
          transcription: "plain text",
          translate: false,
          language: "auto",
          temperature: 0,
          suppress_tokens: "-1",
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Transcription API error: ${response.status}`);
    }

    const prediction = await response.json();
    sendProgress(1, 20, 'Waiting for transcription to complete...');
    
    // 轮询直到完成
    const result = await pollPredictionWithProgress(
      prediction.id, 
      process.env.REPLICATE_API_TOKEN_WHISPER!, 
      sendProgress,
      1, // step
      20, // start progress
      25, // end progress
      requestId
    );
    
    if (result.status === 'succeeded' && result.output) {
      return { success: true, data: result.output };
    } else {
      throw new Error(`Transcription failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 带进度更新的翻译函数
async function translateTextWithProgress(
  text: string, 
  targetLanguage: string, 
  sourceLanguage: string,
  sendProgress: Function
) {
  try {
    console.log(`🌐 Translating full text: "${text}"`);
    console.log(`🌐 From ${sourceLanguage} to ${targetLanguage}`);
    
    sendProgress(2, 35, 'Calling translation API...');
    
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    sendProgress(2, 45, 'Processing translation...');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Full text translation result: "${result.translatedText}"`);
      return { success: true, translatedText: result.translatedText };
    } else {
      console.error(`❌ Full text translation failed: ${result.error}`);
      throw new Error(result.error || 'Translation failed');
    }
  } catch (error) {
    console.error(`❌ Full text translation error:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 带进度更新的分段翻译函数
async function translateSegmentsWithProgress(
  segments: Segment[], 
  targetLanguage: string, 
  sourceLanguage: string,
  sendProgress: Function,
  fullTranslatedText: string // 新增参数：完整的翻译文本
) {
  const translatedSegments = [];
  const totalSegments = segments.length;
  
  console.log('🔄 Using intelligent segment translation with full text context...');
  console.log(`📝 Full translated text: "${fullTranslatedText}"`);
  console.log(`📋 Number of segments: ${segments.length}`);
  
  // 如果只有一个分段，直接使用完整翻译
  if (segments.length === 1) {
    sendProgress(3, 65, 'Single segment detected, using full translation...');
    const result = {
      ...segments[0],
      originalText: segments[0].text,
      translatedText: fullTranslatedText.trim()
    };
    console.log(`✅ Single segment result:`, result);
    translatedSegments.push(result);
    return translatedSegments;
  }
  
  // 尝试智能分割完整翻译文本
  const sentences = splitIntoSentences(fullTranslatedText);
  console.log(`📝 Split sentences:`, sentences);
  
  // 如果翻译句子数量与分段数量匹配，直接映射
  if (sentences.length === segments.length) {
    console.log('📝 Sentence count matches segment count, mapping directly...');
    for (let i = 0; i < segments.length; i++) {
      const progressPercent = 55 + (i / totalSegments) * 15; // 55% to 70%
      sendProgress(3, progressPercent, `Mapping segment ${i + 1} of ${totalSegments}...`);
      
      const result = {
        ...segments[i],
        originalText: segments[i].text,
        translatedText: sentences[i].trim()
      };
      console.log(`✅ Mapped segment ${i + 1}:`, result);
      translatedSegments.push(result);
    }
  } else {
    // 如果句子数量不匹配，使用上下文感知的翻译
    console.log('📝 Sentence count mismatch, using context-aware translation...');
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const progressPercent = 55 + (i / totalSegments) * 15; // 55% to 70%
      
      sendProgress(3, progressPercent, `Translating segment ${i + 1} of ${totalSegments} with context...`);
      
      // 构建上下文感知的翻译提示
      const contextPrompt = buildContextAwarePrompt(
        segment, 
        segments, 
        i, 
        fullTranslatedText, 
        targetLanguage, 
        sourceLanguage
      );
      
      const result = await translateWithContext(
        contextPrompt,
        targetLanguage,
        sourceLanguage
      );
      
      if (result.success) {
        const segmentResult = {
          ...segment,
          originalText: segment.text,
          translatedText: result.translatedText
        };
        console.log(`✅ Context-aware translation for segment ${i + 1}:`, segmentResult);
        translatedSegments.push(segmentResult);
      } else {
        // 如果上下文翻译失败，从完整翻译中提取相应部分
        const fallbackText = extractRelevantPortion(fullTranslatedText, i, totalSegments);
        const segmentResult = {
          ...segment,
          originalText: segment.text,
          translatedText: fallbackText
        };
        console.log(`⚠️ Fallback translation for segment ${i + 1}:`, segmentResult);
        translatedSegments.push(segmentResult);
      }
      
      // 减少延迟，因为我们现在更智能了
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`🎯 Final translated segments:`, translatedSegments);
  return translatedSegments;
}

// 将文本分割为句子
function splitIntoSentences(text: string): string[] {
  // 支持中文、英文等多种语言的句子分割
  const sentences = text
    .split(/[.!?。！？]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}

// 构建上下文感知的翻译提示
function buildContextAwarePrompt(
  currentSegment: Segment,
  allSegments: Segment[],
  currentIndex: number,
  fullTranslation: string,
  targetLanguage: string,
  sourceLanguage: string
): string {
  const previousSegment = currentIndex > 0 ? allSegments[currentIndex - 1] : null;
  const nextSegment = currentIndex < allSegments.length - 1 ? allSegments[currentIndex + 1] : null;
  
  // 语言映射
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'zh': 'Chinese',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi'
  };

  const targetLangName = languageMap[targetLanguage] || targetLanguage;
  const sourceLangName = languageMap[sourceLanguage] || sourceLanguage;
  
  let contextText = '';
  if (previousSegment) {
    contextText += `Previous: "${previousSegment.text}"\n`;
  }
  contextText += `Current: "${currentSegment.text}"\n`;
  if (nextSegment) {
    contextText += `Next: "${nextSegment.text}"\n`;
  }
  
  // 根据目标语言提供特定的指导
  let languageSpecificGuidance = '';
  switch (targetLanguage) {
    case 'zh':
      languageSpecificGuidance = '5. Use natural Chinese expressions and maintain proper sentence structure\n6. Avoid literal translations that sound unnatural in Chinese';
      break;
    case 'ja':
      languageSpecificGuidance = '5. Use appropriate Japanese politeness levels and natural expressions\n6. Consider the context for choosing between hiragana, katakana, and kanji';
      break;
    case 'ko':
      languageSpecificGuidance = '5. Use appropriate Korean honorifics and natural expressions\n6. Maintain proper Korean sentence structure and word order';
      break;
    case 'ar':
      languageSpecificGuidance = '5. Use natural Arabic expressions and proper grammar\n6. Consider the formal/informal register appropriate for the content';
      break;
    case 'ru':
      languageSpecificGuidance = '5. Use appropriate Russian cases and natural expressions\n6. Maintain proper Russian word order and grammar';
      break;
    case 'es':
      languageSpecificGuidance = '5. Use natural Spanish expressions and proper grammar\n6. Consider regional variations if appropriate';
      break;
    case 'fr':
      languageSpecificGuidance = '5. Use natural French expressions and proper grammar\n6. Maintain appropriate formality level for the content';
      break;
    case 'de':
      languageSpecificGuidance = '5. Use natural German expressions and proper grammar\n6. Consider compound words and proper capitalization';
      break;
    case 'pt':
      languageSpecificGuidance = '5. Use natural Portuguese expressions and proper grammar\n6. Consider Brazilian or European Portuguese as appropriate';
      break;
    case 'it':
      languageSpecificGuidance = '5. Use natural Italian expressions and proper grammar\n6. Maintain appropriate formality and regional considerations';
      break;
    case 'hi':
      languageSpecificGuidance = '5. Use natural Hindi expressions and proper Devanagari script\n6. Consider formal/informal register as appropriate';
      break;
    default:
      languageSpecificGuidance = '5. Use natural expressions appropriate for the target language\n6. Maintain proper grammar and cultural context';
  }
  
  return `You are a professional translator specializing in dubbing and voice-over work.

Task: Translate ONLY the current segment from ${sourceLangName} to ${targetLangName}, maintaining consistency with the full translation context.

Context (segment ${currentIndex + 1} of ${allSegments.length}):
${contextText}

Full translation reference: "${fullTranslation}"

Requirements:
1. Translate ONLY the current segment text to ${targetLangName}
2. Maintain consistency with the full translation context
3. Use natural speech rhythm suitable for voice dubbing
4. Return ONLY the translated text, no explanations or additional content
${languageSpecificGuidance}

Current segment to translate: "${currentSegment.text}"
Segment timing: ${currentSegment.start}s - ${currentSegment.end}s

${targetLangName} translation:`;
}

// 上下文感知翻译
async function translateWithContext(
  prompt: string,
  targetLanguage: string,
  sourceLanguage: string
) {
  try {
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        targetLanguage,
        sourceLanguage,
        isContextAware: true // 标记这是上下文感知翻译
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return { success: true, translatedText: result.translatedText };
    } else {
      throw new Error(result.error || 'Translation failed');
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 从完整翻译中提取相关部分作为后备方案
function extractRelevantPortion(fullTranslation: string, segmentIndex: number, totalSegments: number): string {
  const sentences = splitIntoSentences(fullTranslation);
  
  if (sentences.length === 0) {
    return fullTranslation;
  }
  
  // 简单的比例分配
  const sentenceIndex = Math.floor((segmentIndex / totalSegments) * sentences.length);
  const clampedIndex = Math.min(sentenceIndex, sentences.length - 1);
  
  return sentences[clampedIndex] || fullTranslation;
}

// 带进度更新的TTS生成函数
async function generateTTSForSegmentsWithProgress(
  segments: any[], 
  targetLanguage: string,
  sendProgress: Function,
  requestId: string
) {
  try {
    const totalSegments = segments.length;
    let completedSegments = 0;
    let progressUpdateLock = false; // 添加锁机制防止并发更新
    console.log(`🎵 [${requestId}] Starting TTS generation for ${totalSegments} segments`);
    
    // 创建一个安全的进度更新函数
    const safeSendProgress = (step: number, progress: number, message: string) => {
      if (progressUpdateLock) {
        console.log(`⚠️ [${requestId}] Progress update blocked by lock: ${message}`);
        return false;
      }
      
      try {
        const result = sendProgress(step, progress, message);
        if (result === false) {
          // 如果sendProgress返回false，说明控制器已关闭
          console.log(`⚠️ [${requestId}] Controller closed, locking progress updates`);
          progressUpdateLock = true;
          return false;
        }
        return true;
      } catch (error) {
        console.log(`⚠️ [${requestId}] Progress update failed, locking: ${message}`);
        progressUpdateLock = true; // 如果发送失败，锁定后续更新
        return false;
      }
    };
    
    // 线程安全的进度更新函数 - 使用正确的分子分母计算
    const updateProgress = (completed: number, message: string) => {
      if (progressUpdateLock) return false; // 如果已锁定，直接返回
      
      // 使用完成的音频数作为分子，总音频数作为分母
      const progressPercent = 75 + (completed / totalSegments) * 20; // 75% to 95%
      return safeSendProgress(4, progressPercent, message);
    };
    
    // 创建一个共享的进度跟踪器
    let completedCount = 0;
    const progressMutex = { locked: false };
    
    const ttsPromises = segments.map(async (segment, index) => {
      try {
        console.log(`🎤 [${requestId}] Starting TTS for segment ${index + 1}/${totalSegments}`);
        console.log(`📝 [${requestId}] TTS Text for segment ${segment.id}: "${segment.translatedText}"`);
        
        const response = await fetch('http://localhost:3000/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: segment.translatedText,
            language: targetLanguage,
            speakerAudio: 'https://replicate.delivery/pbxt/JqzvJMqmYeWjdUSULrjJbEYjsYUnd335Keufr2QyMCGKJtY4/male.wav'
          })
        });

        if (!response.ok) {
          throw new Error(`TTS API error for segment ${index}: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log(`🔄 [${requestId}] Polling TTS result for segment ${index + 1}`);
          
          // 轮询TTS结果，但不传递进度更新函数，避免多个任务同时更新进度
          const ttsResult = await pollPredictionWithProgress(
            result.predictionId, 
            process.env.REPLICATE_API_TOKEN_TTS!,
            null, // 不传递进度更新函数
            4, // step
            75, // start progress  
            95, // end progress
            requestId
          );
          
          console.log(`✅ [${requestId}] TTS completed for segment ${index + 1}: ${ttsResult.status}`);
          
          // 安全地更新完成计数和进度
          if (!progressMutex.locked && !progressUpdateLock) {
            completedCount++;
            const progressPercent = 75 + (completedCount / totalSegments) * 20;
            const progressMessage = `Voice synthesis: ${completedCount}/${totalSegments} segments completed`;
            
            // 只有在控制器未关闭时才更新进度
            const updateSuccess = safeSendProgress(4, progressPercent, progressMessage);
            if (!updateSuccess) {
              progressMutex.locked = true; // 锁定后续更新
              console.log(`🔒 [${requestId}] Progress updates locked due to controller closure`);
            }
          }
          
          return {
            segmentId: segment.id,
            originalDuration: segment.end - segment.start,
            audioUrl: ttsResult.output,
            status: ttsResult.status,
            index: index,
            ttsText: segment.translatedText
          };
        } else {
          throw new Error(result.error || 'TTS generation failed');
        }
      } catch (error) {
        console.error(`❌ [${requestId}] TTS error for segment ${index}:`, error);
        
        // 即使失败也要更新计数
        if (!progressMutex.locked && !progressUpdateLock) {
          completedCount++;
          const progressPercent = 75 + (completedCount / totalSegments) * 20;
          const progressMessage = `Voice synthesis: ${completedCount}/${totalSegments} segments completed (${index + 1} failed)`;
          
          const updateSuccess = safeSendProgress(4, progressPercent, progressMessage);
          if (!updateSuccess) {
            progressMutex.locked = true;
            console.log(`🔒 [${requestId}] Progress updates locked due to controller closure`);
          }
        }
        
        return {
          segmentId: segment.id,
          originalDuration: segment.end - segment.start,
          audioUrl: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          index: index,
          ttsText: segment.translatedText
        };
      }
    });

    console.log(`⏳ [${requestId}] Waiting for all TTS operations to complete...`);
    const results = await Promise.all(ttsPromises);
    
    // 立即锁定进度更新，防止后续的异步回调继续更新
    progressUpdateLock = true;
    progressMutex.locked = true;
    
    const successCount = results.filter(r => r.status === 'succeeded').length;
    console.log(`🎉 [${requestId}] TTS generation completed: ${successCount}/${totalSegments} successful`);
    
    // 不再发送进度更新，让主函数处理最终进度
    console.log(`🔒 [${requestId}] TTS progress updates locked, returning results`);
    
    return {
      success: true,
      audios: results
    };
  } catch (error) {
    console.error(`💥 [${requestId}] TTS generation failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 带进度更新的轮询函数
async function pollPredictionWithProgress(
  predictionId: string, 
  apiToken: string, 
  sendProgress: Function | null, // 允许为null
  step: number,
  startProgress: number,
  endProgress: number,
  requestId: string,
  maxAttempts = 60
): Promise<any> {
  console.log(`🔄 [${requestId}] Starting polling for prediction: ${predictionId}`);
  let progressUpdateEnabled = sendProgress !== null; // 只有传递了sendProgress才启用进度更新
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      // 只在启用且有意义的时候发送进度更新
      if (progressUpdateEnabled && sendProgress && typeof sendProgress === 'function') {
        try {
          const progressPercent = startProgress + (attempt / maxAttempts) * (endProgress - startProgress);
          const updateResult = sendProgress(step, progressPercent, `Processing... (${prediction.status})`);
          
          // 如果进度更新返回false，说明控制器已关闭
          if (updateResult === false) {
            console.log(`⚠️ [${requestId}] Progress update failed, controller closed. Continuing polling silently`);
            progressUpdateEnabled = false; // 停止后续的进度更新
          }
        } catch (progressError) {
          // 如果进度更新失败，继续轮询但不再发送更新
          console.log(`⚠️ [${requestId}] Progress update failed, continuing polling silently`);
          progressUpdateEnabled = false; // 停止后续的进度更新
        }
      }
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        console.log(`✅ [${requestId}] Polling completed for ${predictionId}: ${prediction.status}`);
        return prediction;
      }
      
      // 等待2秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ [${requestId}] Polling attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Polling timeout');
} 