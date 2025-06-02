import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, language, speakerAudio } = await request.json();
    
    if (!text || !language) {
      return NextResponse.json(
        { error: 'Text and language are required' },
        { status: 400 }
      );
    }

    // 语言代码映射 - 根据XTTS-v2 API文档支持的语言：
    // English: en, French: fr, German: de, Spanish: es, Italian: it, Portuguese: pt
    // Czech: cs, Polish: pl, Russian: ru, Dutch: nl, Turkish: tr, Arabic: ar
    // Mandarin Chinese: zh-cn (mapped to zh), Hindi: hi
    const languageMap: { [key: string]: string } = {
      'en': 'en',        // English
      'zh': 'zh',        // Chinese (Mandarin)
      'zh-cn': 'zh',     // Chinese Simplified
      'zh-tw': 'zh',     // Chinese Traditional (fallback to Mandarin)
      'es': 'es',        // Spanish
      'fr': 'fr',        // French
      'de': 'de',        // German
      'it': 'it',        // Italian
      'pt': 'pt',        // Portuguese
      'pl': 'pl',        // Polish
      'tr': 'tr',        // Turkish
      'ru': 'ru',        // Russian
      'nl': 'nl',        // Dutch
      'cs': 'cs',        // Czech
      'ar': 'ar',        // Arabic
      'hi': 'hi',        // Hindi
      // Unsupported languages fallback to English
      'ja': 'en',        // Japanese -> English (not supported by TTS)
      'ko': 'en'         // Korean -> English (not supported by TTS)
    };

    const ttsLanguage = languageMap[language] || 'en';
    
    console.log(`TTS Language mapping: ${language} -> ${ttsLanguage}`);

    // 默认说话人音频（如果没有提供）
    const defaultSpeaker = speakerAudio || 'https://replicate.delivery/pbxt/JqzvJMqmYeWjdUSULrjJbEYjsYUnd335Keufr2QyMCGKJtY4/male.wav';

    // 调用Replicate XTTS-v2 API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN_TTS}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "coqui/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
          text: text,
          speaker: defaultSpeaker,
          language: ttsLanguage,
          cleanup_voice: false
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Replicate TTS API error:', errorData);
      return NextResponse.json(
        { error: 'TTS generation failed', details: errorData },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    
    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      data: prediction
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('id');
    
    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // 获取TTS预测状态
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN_TTS}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Replicate API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get TTS prediction status' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    
    return NextResponse.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('Get TTS prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 