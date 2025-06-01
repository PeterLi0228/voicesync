// 简化的流式 API 测试
async function testStreamAPI() {
  console.log('🧪 Testing stream API fix...');
  
  try {
    // 创建一个简单的FormData
    const formData = new FormData();
    
    // 创建一个简单的测试文件
    const testBlob = new Blob(['Hello world test audio content'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-audio.txt', { type: 'text/plain' });
    
    formData.append('audio', testFile);
    formData.append('sourceLanguage', 'en');
    formData.append('targetLanguage', 'zh');
    
    console.log('📡 Calling streaming API...');
    
    const response = await fetch('http://localhost:3000/api/process-audio-stream', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    console.log('📊 Reading stream...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let messageCount = 0;
    let lastProgress = 0;
    let streamCompleted = false;
    let finalDataReceived = false;
    let step5Reached = false;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream completed normally');
          streamCompleted = true;
          break;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              messageCount++;
              lastProgress = data.progress;
              
              console.log(`📈 Progress ${messageCount}: Step ${data.step}, ${data.progress}% - ${data.message}`);
              
              if (data.error) {
                console.log('❌ Error received:', data.message);
                break;
              }
              
              if (data.step === 5) {
                step5Reached = true;
                console.log('🎯 Step 5 (final step) reached!');
              }
              
              if (data.progress >= 100 && data.data) {
                console.log('🎉 Final data received!');
                finalDataReceived = true;
                console.log('📋 Final data keys:', Object.keys(data.data));
              }
            } catch (e) {
              console.log('⚠️ Failed to parse:', line);
            }
          }
        }
      }
    } catch (streamError) {
      console.error('❌ Stream reading error:', streamError);
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {
        console.log('Reader already released');
      }
    }
    
    console.log(`\n📊 Test Summary:`);
    console.log(`- Messages received: ${messageCount}`);
    console.log(`- Last progress: ${lastProgress}%`);
    console.log(`- Stream completed: ${streamCompleted}`);
    console.log(`- Step 5 reached: ${step5Reached}`);
    console.log(`- Final data received: ${finalDataReceived}`);
    
    if (streamCompleted && step5Reached && finalDataReceived && lastProgress >= 100) {
      console.log('🎉 Test PASSED! Stream API is working correctly');
      return true;
    } else {
      console.log('❌ Test FAILED! Issues detected');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// 运行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.testStreamAPI = testStreamAPI;
  console.log('Test function available as window.testStreamAPI()');
} else {
  // Node.js环境
  testStreamAPI();
} 