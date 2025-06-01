// 测试完整翻译流程
console.log('🧪 Testing Full Translation Flow...')

// 模拟分段数据
const mockSegments = [
  {
    id: 0,
    start: 0.0,
    end: 5.5,
    text: "In the previous video, we saw how to perform an update operation in plugins."
  },
  {
    id: 1,
    start: 5.5,
    end: 10.0,
    text: "In this video, we'll be looking at how to perform an update."
  }
];

// 模拟完整文本
const fullText = "In the previous video, we saw how to perform an update operation in plugins. In this video, we'll be looking at how to perform an update.";

// 模拟splitIntoSentences函数
function splitIntoSentences(text) {
  return text
    .split(/[.!?。！？]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function testFullTranslationFlow() {
  console.log('📝 Step 1: Testing full text translation...');
  console.log(`Input: "${fullText}"`);
  
  try {
    // 测试完整文本翻译
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullText,
        targetLanguage: 'zh',
        sourceLanguage: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Translation failed');
    }
    
    const fullTranslatedText = result.translatedText;
    console.log(`✅ Full translation: "${fullTranslatedText}"`);
    
    // 测试分段映射
    console.log('\n📝 Step 2: Testing segment mapping...');
    const sentences = splitIntoSentences(fullTranslatedText);
    console.log(`Split sentences (${sentences.length}):`, sentences);
    
    if (sentences.length === mockSegments.length) {
      console.log('✅ Sentence count matches segment count, mapping directly...');
      
      const translatedSegments = [];
      for (let i = 0; i < mockSegments.length; i++) {
        const segment = mockSegments[i];
        const translatedSegment = {
          ...segment,
          originalText: segment.text,
          translatedText: sentences[i].trim()
        };
        translatedSegments.push(translatedSegment);
        console.log(`Segment ${i + 1}:`);
        console.log(`  Original: "${translatedSegment.originalText}"`);
        console.log(`  Translated: "${translatedSegment.translatedText}"`);
      }
      
      console.log('\n🎯 Final Result:');
      console.log('Each segment has distinct translations:', 
        translatedSegments.every((seg, i) => 
          translatedSegments.every((otherSeg, j) => 
            i === j || seg.translatedText !== otherSeg.translatedText
          )
        )
      );
      
    } else {
      console.log('❌ Sentence count mismatch, would use context-aware translation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// 等待服务器启动后运行测试
setTimeout(testFullTranslationFlow, 3000); 