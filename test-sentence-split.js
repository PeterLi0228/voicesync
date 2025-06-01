// 测试句子分割函数
console.log('🧪 Testing Sentence Splitting Function...')

// 模拟splitIntoSentences函数
function splitIntoSentences(text) {
  return text
    .split(/[.!?。！？]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// 测试不同的翻译文本
const testCases = [
  {
    name: "正确的中文翻译",
    text: "上期视频中，我们学习了插件如何进行更新操作。本期视频中，我们将探讨如何进行更新。",
    expectedCount: 2
  },
  {
    name: "英文原文（错误情况）",
    text: "In the previous video, we saw how to perform an update operation in plugins. In this video, we'll be looking at how to perform an update.",
    expectedCount: 2
  },
  {
    name: "混合标点",
    text: "第一句话。第二句话！第三句话？",
    expectedCount: 3
  },
  {
    name: "无标点",
    text: "没有标点的句子",
    expectedCount: 1
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test Case ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.text}"`);
  
  const sentences = splitIntoSentences(testCase.text);
  console.log(`Sentences found: ${sentences.length} (expected: ${testCase.expectedCount})`);
  
  sentences.forEach((sentence, i) => {
    console.log(`  ${i + 1}: "${sentence}"`);
  });
  
  if (sentences.length === testCase.expectedCount) {
    console.log('✅ PASS');
  } else {
    console.log('❌ FAIL');
  }
});

console.log('\n🎯 Conclusion:');
console.log('If the translation is returning English text instead of Chinese,');
console.log('the problem is likely in the translation API, not the sentence splitting.'); 