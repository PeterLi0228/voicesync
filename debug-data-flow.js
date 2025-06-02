// 调试数据流程 - 检查转录、翻译、显示的一致性

// 模拟转录结果（来自 Whisper API）
const mockTranscriptionResult = {
  transcription: "One thing to note is that in order to delete the user who is triggering this plugin needs to have delete permissions. If not they will be getting a... They will be getting an error which says the user",
  detected_language: "en",
  segments: [
    {
      id: 0,
      start: 43.0,
      end: 54.0,
      text: "One thing to note is that in order to delete the user who is triggering this plugin needs to have delete permissions."
    },
    {
      id: 1,
      start: 54.0,
      end: 56.0,
      text: "If not they will be getting a..."
    },
    {
      id: 2,
      start: 57.0,
      end: 64.0,
      text: "They will be getting an error which says the user"
    }
  ]
};

// 模拟完整翻译结果
const mockFullTranslation = "需要注意的是，为了删除用户，触发此插件的用户需要具有删除权限。如果他们不具备权限，他们将收到一条错误消息，指出用户";

console.log('🔍 调试数据流程 - 检查转录、翻译、显示的一致性');
console.log('='.repeat(60));

console.log('\n📝 步骤1: 转录结果 (Whisper API)');
console.log('完整转录:', mockTranscriptionResult.transcription);
console.log('\n分段转录:');
mockTranscriptionResult.segments.forEach((segment, index) => {
  console.log(`  段落 ${index + 1} (${segment.start}s - ${segment.end}s):`);
  console.log(`    "${segment.text}"`);
});

console.log('\n📝 步骤2: 完整文本翻译');
console.log('完整翻译:', mockFullTranslation);

console.log('\n📝 步骤3: 分段翻译映射');

// 模拟 splitIntoSentences 函数
function splitIntoSentences(text) {
  const sentences = text
    .split(/[.!?。！？]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences;
}

const sentences = splitIntoSentences(mockFullTranslation);
console.log('分割后的句子:', sentences);
console.log(`句子数量: ${sentences.length}, 分段数量: ${mockTranscriptionResult.segments.length}`);

// 模拟 translateSegmentsWithProgress 的逻辑
const translatedSegments = [];

if (sentences.length === mockTranscriptionResult.segments.length) {
  console.log('\n✅ 句子数量匹配，直接映射:');
  for (let i = 0; i < mockTranscriptionResult.segments.length; i++) {
    const segment = mockTranscriptionResult.segments[i];
    const result = {
      ...segment,
      originalText: segment.text, // 这里是关键！
      translatedText: sentences[i].trim()
    };
    translatedSegments.push(result);
    
    console.log(`\n  段落 ${i + 1}:`);
    console.log(`    原文: "${result.originalText}"`);
    console.log(`    译文: "${result.translatedText}"`);
    console.log(`    时间: ${result.start}s - ${result.end}s`);
  }
} else {
  console.log('\n⚠️ 句子数量不匹配，需要上下文感知翻译');
  // 这里会触发上下文感知翻译逻辑
}

console.log('\n📝 步骤4: 前端显示验证');
console.log('前端会显示以下内容:');

translatedSegments.forEach((segment, index) => {
  console.log(`\n  显示段落 ${index + 1}:`);
  console.log(`    左侧 (原文): "${segment.originalText}"`);
  console.log(`    右侧 (译文): "${segment.translatedText}"`);
  console.log(`    时间戳: ${segment.start}s - ${segment.end}s`);
  
  // 验证数据一致性
  const originalFromTranscription = mockTranscriptionResult.segments[index]?.text;
  if (segment.originalText === originalFromTranscription) {
    console.log(`    ✅ 原文匹配转录结果`);
  } else {
    console.log(`    ❌ 原文不匹配转录结果!`);
    console.log(`        期望: "${originalFromTranscription}"`);
    console.log(`        实际: "${segment.originalText}"`);
  }
});

console.log('\n📊 数据一致性检查:');
let allMatched = true;
for (let i = 0; i < translatedSegments.length; i++) {
  const segment = translatedSegments[i];
  const originalSegment = mockTranscriptionResult.segments[i];
  
  if (segment.originalText !== originalSegment.text) {
    console.log(`❌ 段落 ${i + 1} 原文不匹配`);
    allMatched = false;
  }
  
  if (segment.start !== originalSegment.start || segment.end !== originalSegment.end) {
    console.log(`❌ 段落 ${i + 1} 时间戳不匹配`);
    allMatched = false;
  }
}

if (allMatched) {
  console.log('✅ 所有数据一致性检查通过');
} else {
  console.log('❌ 发现数据不一致问题');
}

console.log('\n🎯 问题分析:');
console.log('如果前端显示的原文和译文不匹配，可能的原因:');
console.log('1. 转录API返回的segments数据结构异常');
console.log('2. translateSegmentsWithProgress函数中的映射逻辑错误');
console.log('3. 数据传输过程中的序列化/反序列化问题');
console.log('4. 前端接收到的数据被意外修改');
console.log('5. sessionStorage/localStorage中的数据损坏');

console.log('\n🔧 建议的调试步骤:');
console.log('1. 在后端添加详细日志，记录每个步骤的数据');
console.log('2. 在前端添加console.log，检查接收到的原始数据');
console.log('3. 验证Whisper API返回的segments结构');
console.log('4. 检查translateSegmentsWithProgress的输出');
console.log('5. 验证数据存储和读取过程'); 