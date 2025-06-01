// 测试上下文感知翻译
console.log('🧪 Testing Context-Aware Translation...')

// 模拟上下文感知翻译的提示词
function buildContextAwarePrompt(targetLanguage, sourceLanguage) {
  const languageMap = {
    'en': 'English',
    'zh': 'Chinese',
    'es': 'Spanish',
    'fr': 'French'
  };

  const targetLangName = languageMap[targetLanguage] || targetLanguage;
  const sourceLangName = languageMap[sourceLanguage] || sourceLanguage;
  
  return `You are a professional translator specializing in dubbing and voice-over work.

Task: Translate ONLY the current segment from ${sourceLangName} to ${targetLangName}, maintaining consistency with the full translation context.

Context (segment 2 of 2):
Previous: "In the previous video, we saw how to perform an update operation in plugins."
Current: "In this video, we'll be looking at how to perform an update"

Full translation reference: ""上期视频中，我们学习了插件如何进行更新操作。本期视频中，我们将探讨如何进行更新。""

Requirements:
1. Translate ONLY the current segment text to ${targetLangName}
2. Maintain consistency with the full translation context
3. Use natural speech rhythm suitable for voice dubbing
4. Return ONLY the translated text, no explanations

Current segment to translate: "In this video, we'll be looking at how to perform an update"
Segment timing: 6s - 10s

${targetLangName} translation:`;
}

async function testContextAwareTranslation() {
  const prompt = buildContextAwarePrompt('zh', 'en');
  
  console.log('📝 Testing context-aware translation with prompt:');
  console.log(prompt);
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        targetLanguage: 'zh',
        sourceLanguage: 'en',
        isContextAware: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('🎯 Context-Aware Translation Result:');
    console.log('Success:', result.success);
    console.log('Translated Text:', result.translatedText);
    console.log('Is Context Aware:', result.isContextAware);
    console.log('');
    
    if (result.success && result.translatedText) {
      // 检查是否真的是中文
      const isChinese = /[\u4e00-\u9fff]/.test(result.translatedText);
      console.log('Contains Chinese characters:', isChinese);
      
      if (isChinese) {
        console.log('✅ Context-aware translation is working correctly!');
        console.log('Expected something like: "本期视频中，我们将探讨如何进行更新"');
      } else {
        console.log('❌ Context-aware translation returned non-Chinese text!');
        console.log('This indicates the prompt or post-processing needs improvement.');
      }
    } else {
      console.log('❌ Context-aware translation failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// 等待服务器启动后运行测试
setTimeout(testContextAwareTranslation, 2000); 