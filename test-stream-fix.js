// 测试流式 API 修复
const FormData = require('form-data');
const fs = require('fs');

async function testStreamAPI() {
  console.log('🧪 Testing stream API fix...');
  
  try {
    // 创建一个简单的测试音频文件（实际上是文本文件，但用于测试）
    const testContent = 'Hello world test audio content';
    fs.writeFileSync('test-audio.txt', testContent);
    
    const formData = new FormData();
    formData.append('audio', fs.createReadStream('test-audio.txt'));
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
    console.log(`- Final data received: ${finalDataReceived}`);
    
    if (streamCompleted && finalDataReceived && lastProgress >= 100) {
      console.log('🎉 Test PASSED! Stream API is working correctly');
    } else {
      console.log('❌ Test FAILED! Issues detected');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    // 清理测试文件
    try {
      fs.unlinkSync('test-audio.txt');
    } catch (e) {
      // 忽略清理错误
    }
  }
}

// 运行测试
if (require.main === module) {
  testStreamAPI();
}

module.exports = { testStreamAPI }; 