// 测试改进的多语言翻译
console.log('🔧 Testing Improved Multilingual Translation...')

async function testSpecificLanguages() {
  const testCases = [
    {
      language: 'zh',
      description: 'Chinese',
      expectedLength: 10
    },
    {
      language: 'ja',
      description: 'Japanese',
      expectedLength: 8
    },
    {
      language: 'ko',
      description: 'Korean',
      expectedLength: 8
    },
    {
      language: 'ru',
      description: 'Russian',
      expectedLength: 10
    },
    {
      language: 'es',
      description: 'Spanish',
      expectedLength: 15
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing ${testCase.description} (${testCase.language})...`);
    
    const prompt = `You are a professional translator specializing in dubbing and voice-over work.

Task: Translate ONLY the current segment from English to ${testCase.description}, maintaining consistency with the full translation context.

Context (segment 2 of 2):
Previous: "In the previous video, we saw how to perform an update operation in plugins."
Current: "In this video, we'll be looking at how to perform an update"

Requirements:
1. Translate ONLY the current segment text to ${testCase.description}
2. Maintain consistency with the full translation context
3. Use natural speech rhythm suitable for voice dubbing
4. Return ONLY the translated text, no explanations or additional content

Current segment to translate: "In this video, we'll be looking at how to perform an update"
Segment timing: 6s - 10s

${testCase.description} translation:`;

    try {
      const response = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          targetLanguage: testCase.language,
          sourceLanguage: 'en',
          isContextAware: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`Result: "${result.translatedText}"`);
      console.log(`Length: ${result.translatedText.length} characters`);
      
      // 检查长度是否合理
      const isReasonableLength = result.translatedText.length >= testCase.expectedLength;
      console.log(`Reasonable length (>=${testCase.expectedLength}): ${isReasonableLength}`);
      
      // 检查是否包含英文原文
      const containsEnglish = /In this video|we'll be looking|perform an update/i.test(result.translatedText);
      console.log(`Contains English original: ${containsEnglish}`);
      
      if (isReasonableLength && !containsEnglish) {
        console.log(`✅ ${testCase.description} translation improved!`);
      } else {
        console.log(`⚠️ ${testCase.description} translation may need further improvement.`);
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.description} test failed:`, error.message);
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n🎯 Improved multilingual translation tests completed!');
}

// 等待服务器启动后运行测试
setTimeout(testSpecificLanguages, 3000); 