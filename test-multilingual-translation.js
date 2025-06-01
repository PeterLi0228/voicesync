// 测试多语言上下文感知翻译
console.log('🌍 Testing Multilingual Context-Aware Translation...')

// 模拟上下文感知翻译的提示词
function buildContextAwarePrompt(targetLanguage, sourceLanguage) {
  const languageMap = {
    'en': 'English',
    'zh': 'Chinese',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'pt': 'Portuguese',
    'it': 'Italian'
  };

  const targetLangName = languageMap[targetLanguage] || targetLanguage;
  const sourceLangName = languageMap[sourceLanguage] || sourceLanguage;
  
  return `You are a professional translator specializing in dubbing and voice-over work.

Task: Translate ONLY the current segment from ${sourceLangName} to ${targetLangName}, maintaining consistency with the full translation context.

Context (segment 2 of 2):
Previous: "In the previous video, we saw how to perform an update operation in plugins."
Current: "In this video, we'll be looking at how to perform an update"

Requirements:
1. Translate ONLY the current segment text to ${targetLangName}
2. Maintain consistency with the full translation context
3. Use natural speech rhythm suitable for voice dubbing
4. Return ONLY the translated text, no explanations

Current segment to translate: "In this video, we'll be looking at how to perform an update"
Segment timing: 6s - 10s

${targetLangName} translation:`;
}

async function testLanguageTranslation(targetLanguage, expectedPattern, description) {
  const prompt = buildContextAwarePrompt(targetLanguage, 'en');
  
  console.log(`\n📝 Testing ${description} (${targetLanguage})...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        targetLanguage: targetLanguage,
        sourceLanguage: 'en',
        isContextAware: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`Result: "${result.translatedText}"`);
    
    if (result.success && result.translatedText) {
      // 检查是否匹配预期的字符模式
      const matchesPattern = expectedPattern.test(result.translatedText);
      console.log(`Contains expected characters: ${matchesPattern}`);
      
      // 检查是否包含英文原文（这通常表示翻译失败）
      const containsEnglish = /In this video|we'll be looking|perform an update/i.test(result.translatedText);
      console.log(`Contains English original: ${containsEnglish}`);
      
      if (matchesPattern && !containsEnglish) {
        console.log(`✅ ${description} translation working correctly!`);
      } else {
        console.log(`❌ ${description} translation needs improvement.`);
      }
    } else {
      console.log(`❌ ${description} translation failed!`);
    }
    
  } catch (error) {
    console.error(`❌ ${description} test failed:`, error.message);
  }
}

async function runMultilingualTests() {
  console.log('🚀 Starting multilingual translation tests...\n');
  
  // 定义测试语言和预期字符模式
  const testCases = [
    {
      language: 'zh',
      pattern: /[\u4e00-\u9fff]/,
      description: 'Chinese'
    },
    {
      language: 'es',
      pattern: /[áéíóúñü]|en este|vídeo|vamos|actualización/i,
      description: 'Spanish'
    },
    {
      language: 'fr',
      pattern: /[àâäéèêëïîôöùûüÿç]|dans cette|vidéo|nous allons|mise à jour/i,
      description: 'French'
    },
    {
      language: 'de',
      pattern: /[äöüß]|in diesem|video|werden wir|aktualisierung/i,
      description: 'German'
    },
    {
      language: 'ja',
      pattern: /[\u3040-\u309f\u30a0-\u30ff]/,
      description: 'Japanese'
    },
    {
      language: 'ko',
      pattern: /[\uac00-\ud7af]/,
      description: 'Korean'
    },
    {
      language: 'ru',
      pattern: /[\u0400-\u04ff]/,
      description: 'Russian'
    },
    {
      language: 'pt',
      pattern: /[áâãàéêíóôõúç]|neste vídeo|vamos|atualização/i,
      description: 'Portuguese'
    },
    {
      language: 'it',
      pattern: /[àèéìíîòóùú]|in questo|video|guarderemo|aggiornamento/i,
      description: 'Italian'
    }
  ];
  
  // 运行所有测试
  for (const testCase of testCases) {
    await testLanguageTranslation(testCase.language, testCase.pattern, testCase.description);
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Multilingual translation tests completed!');
}

// 等待服务器启动后运行测试
setTimeout(runMultilingualTests, 3000); 