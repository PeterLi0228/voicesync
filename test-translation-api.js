// 测试翻译API
console.log('🧪 Testing Translation API...')

async function testTranslationAPI() {
  const testText = "In the previous video, we saw how to perform an update operation in plugins.";
  
  console.log('📝 Testing translation API with:');
  console.log(`Input: "${testText}"`);
  console.log('Source: en');
  console.log('Target: zh');
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        targetLanguage: 'zh',
        sourceLanguage: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('🎯 Translation API Response:');
    console.log('Success:', result.success);
    console.log('Translated Text:', result.translatedText);
    console.log('Source Language:', result.sourceLanguage);
    console.log('Target Language:', result.targetLanguage);
    console.log('');
    
    if (result.success && result.translatedText) {
      // 检查是否真的是中文
      const isChinese = /[\u4e00-\u9fff]/.test(result.translatedText);
      console.log('Contains Chinese characters:', isChinese);
      
      if (isChinese) {
        console.log('✅ Translation API is working correctly!');
      } else {
        console.log('❌ Translation API returned non-Chinese text!');
        console.log('This could be the root cause of the issue.');
      }
    } else {
      console.log('❌ Translation API failed!');
    }
    
  } catch (error) {
    console.error('❌ Translation API test failed:', error.message);
  }
}

// 运行测试
testTranslationAPI(); 