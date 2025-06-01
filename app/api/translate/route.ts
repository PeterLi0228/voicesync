import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage, isContextAware } = await request.json();
    
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

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
    const sourceLangName = languageMap[sourceLanguage] || sourceLanguage || 'auto-detected language';

    let prompt: string;

    if (isContextAware) {
      // 上下文感知翻译：直接使用传入的提示词
      prompt = text;
    } else {
      // 标准翻译：构建标准提示词
      prompt = `You are a professional translator specializing in dubbing and voice-over work. 

Task: Translate the following text from ${sourceLangName} to ${targetLangName}.

Requirements:
1. Maintain natural speech rhythm and timing suitable for voice dubbing
2. Preserve emotional tone and emphasis from the original
3. Use conversational language that sounds natural when spoken
4. Keep sentence length appropriate for voice synchronization
5. Return ONLY the translated text, no explanations or additional content

Original text:
"${text}"

Translation:`;
    }

    // 调用OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'VoiceSync Translation',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-qwen-7b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: isContextAware ? 0.1 : 0.3, // 上下文感知翻译使用更低的温度
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Translation failed', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    let translatedText = result.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: 'No translation received' },
        { status: 500 }
      );
    }

    // 后处理：清理DeepSeek模型可能添加的额外内容
    if (isContextAware) {
      // 上下文感知翻译的特殊处理
      translatedText = translatedText
        .replace(/^(Translation:|翻译:|译文:|Translated text:|Result:|Current segment translation:|Chinese translation:|中文翻译:|中文:|Chinese:|Spanish translation:|French translation:|German translation:|Japanese translation:|Korean translation:|Russian translation:|Arabic translation:|Hindi translation:|Portuguese translation:|Italian translation:)/i, '')
        .replace(/^["'""]|["'""]$/g, '') // 移除首尾引号（包括中英文引号）
        .split('\n')[0] // 只取第一行
        .trim();
        
      // 根据目标语言智能提取翻译结果
      if (targetLanguage === 'zh') {
        // 中文：提取中文字符和标点
        const chineseMatch = translatedText.match(/[\u4e00-\u9fff，。！？；：""''（）【】《》、\s]+/);
        if (chineseMatch && chineseMatch[0].trim().length > 3) {
          translatedText = chineseMatch[0].trim();
        }
      } else if (targetLanguage === 'ja') {
        // 日文：提取日文字符（平假名、片假名、汉字）和标点
        const japaneseMatch = translatedText.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff、。！？\s]+/);
        if (japaneseMatch && japaneseMatch[0].trim().length > 3) {
          translatedText = japaneseMatch[0].trim();
        }
      } else if (targetLanguage === 'ko') {
        // 韩文：提取韩文字符和标点，包括更广泛的字符范围
        const koreanMatch = translatedText.match(/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\u3200-\u32ff\ua960-\ua97f\ud7b0-\ud7ff，。！？\s\u002e\u003f\u0021]+/);
        if (koreanMatch && koreanMatch[0].trim().length > 3) {
          translatedText = koreanMatch[0].trim();
        } else {
          // 如果正则匹配失败，尝试查找韩文字符的连续序列
          const koreanChars = translatedText.match(/[\uac00-\ud7af]+/g);
          if (koreanChars && koreanChars.length > 0) {
            // 找到最长的韩文序列
            const longestKorean = koreanChars.reduce((a: string, b: string) => a.length > b.length ? a : b);
            if (longestKorean.length > 3) {
              translatedText = longestKorean;
            }
          }
        }
      } else if (targetLanguage === 'ar') {
        // 阿拉伯文：提取阿拉伯文字符和标点
        const arabicMatch = translatedText.match(/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff،。！？\s]+/);
        if (arabicMatch && arabicMatch[0].trim().length > 3) {
          translatedText = arabicMatch[0].trim();
        }
      } else if (targetLanguage === 'hi') {
        // 印地文：提取天城文字符和标点
        const hindiMatch = translatedText.match(/[\u0900-\u097f।॥！？\s]+/);
        if (hindiMatch && hindiMatch[0].trim().length > 3) {
          translatedText = hindiMatch[0].trim();
        }
      } else if (targetLanguage === 'ru') {
        // 俄文：提取西里尔字符和标点
        const russianMatch = translatedText.match(/[\u0400-\u04ff,.!?;:\s]+/);
        if (russianMatch && russianMatch[0].trim().length > 3) {
          translatedText = russianMatch[0].trim();
        }
      } else {
        // 其他语言（拉丁字母系）：提取非英文的部分
        // 如果翻译结果包含原文，尝试提取不同的部分
        const originalSegmentText = text.match(/Current segment to translate: "([^"]+)"/);
        if (originalSegmentText && translatedText.toLowerCase().includes(originalSegmentText[1].toLowerCase())) {
          // 如果翻译结果包含原文，说明翻译可能失败了
          // 尝试提取其他部分
          const parts = translatedText.split(/[.!?。！？]/);
          for (const part of parts) {
            const cleanPart = part.trim();
            if (cleanPart && 
                !cleanPart.toLowerCase().includes(originalSegmentText[1].toLowerCase()) && 
                cleanPart.length > 5 &&
                !/^(Translation|Result|Current segment)/i.test(cleanPart)) {
              translatedText = cleanPart;
              break;
            }
          }
        }
      }
      
      // 再次清理可能残留的引号和标点
      translatedText = translatedText.replace(/^["'""]|["'""]$/g, '').trim();
    } else {
      // 标准翻译的处理
      translatedText = translatedText
        .replace(/^(Translation:|翻译:|译文:|Translated text:|Result:)/i, '')
        .replace(/^["'""]|["'""]$/g, '') // 移除首尾引号（包括中英文引号）
        .replace(/\n\n[\s\S]*$/, '') // 移除换行后的额外内容
        .trim();

      // 如果包含多行，只取第一行（通常是翻译结果）
      const lines = translatedText.split('\n');
      if (lines.length > 1 && lines[0].length > 10) {
        translatedText = lines[0].trim();
      }
      
      // 再次清理可能残留的引号
      translatedText = translatedText.replace(/^["'""]|["'""]$/g, '');
    }

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLanguage: sourceLangName,
      targetLanguage: targetLangName,
      isContextAware: isContextAware || false
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 