// 测试改进后的句子分割逻辑

// 改进的句子分割函数（与后端一致）
function splitIntoSentences(text) {
  console.log(`🔍 DEBUG: splitIntoSentences input: "${text}"`);
  
  // 支持中文、英文等多种语言的句子分割
  // 改进的正则表达式，更好地处理各种标点符号
  const sentences = text
    .split(/[.!?。！？；;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  console.log(`🔍 DEBUG: splitIntoSentences output:`, sentences);
  console.log(`🔍 DEBUG: Split count: ${sentences.length}`);
  
  // 如果分割结果只有一个句子，或者分割数量不够，尝试其他分割方法
  if (sentences.length <= 2 && text.length > 10) {
    console.log(`🔍 DEBUG: Insufficient splits (${sentences.length}), trying alternative splitting...`);
    
    // 尝试按逗号分割（适用于中文）
    const commaSplit = text
      .split(/[，,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`🔍 DEBUG: Comma split result:`, commaSplit);
    
    if (commaSplit.length > sentences.length) {
      console.log(`🔍 DEBUG: Using comma split (${commaSplit.length} parts)`);
      return commaSplit;
    }
    
    // 如果逗号分割也不够，尝试混合分割（句号+逗号）
    if (sentences.length === 2) {
      console.log(`🔍 DEBUG: Trying mixed splitting for 2 sentences...`);
      
      // 对每个句子再次尝试逗号分割
      const mixedSplit = [];
      for (const sentence of sentences) {
        const subSplit = sentence
          .split(/[，,]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        if (subSplit.length > 1) {
          mixedSplit.push(...subSplit);
        } else {
          mixedSplit.push(sentence);
        }
      }
      
      console.log(`🔍 DEBUG: Mixed split result:`, mixedSplit);
      if (mixedSplit.length > sentences.length) {
        console.log(`🔍 DEBUG: Using mixed split (${mixedSplit.length} parts)`);
        return mixedSplit;
      }
    }
    
    // 尝试按长度分割（最后的备选方案）
    if (sentences.length === 1) {
      console.log(`🔍 DEBUG: Single sentence, trying length-based splitting...`);
      
      const midPoint = Math.floor(text.length / 2);
      const spaceIndex = text.indexOf(' ', midPoint);
      const commaIndex = text.indexOf('，', midPoint);
      
      let splitIndex = -1;
      if (spaceIndex !== -1 && commaIndex !== -1) {
        splitIndex = Math.min(spaceIndex, commaIndex);
      } else if (spaceIndex !== -1) {
        splitIndex = spaceIndex;
      } else if (commaIndex !== -1) {
        splitIndex = commaIndex;
      }
      
      if (splitIndex !== -1) {
        const lengthSplit = [
          text.substring(0, splitIndex).trim(),
          text.substring(splitIndex + 1).trim()
        ].filter(s => s.length > 0);
        
        console.log(`🔍 DEBUG: Length split result:`, lengthSplit);
        if (lengthSplit.length === 2) {
          console.log(`🔍 DEBUG: Using length split (${lengthSplit.length} parts)`);
          return lengthSplit;
        }
      }
    }
  }
  
  return sentences;
}

// 测试用例
const testCases = [
  {
    name: "中文翻译（问题案例）",
    text: "需要注意的是，为了删除用户，触发此插件的用户需要具有删除权限。如果他们不具备权限，他们将收到一条错误消息，指出用户",
    expectedSegments: 3,
    description: "应该分割成3个部分以匹配原始音频段落"
  },
  {
    name: "英文原文",
    text: "One thing to note is that in order to delete the user who is triggering this plugin needs to have delete permissions. If not they will be getting a... They will be getting an error which says the user",
    expectedSegments: 3,
    description: "原始英文应该也能正确分割"
  },
  {
    name: "简单中文句子",
    text: "这是第一句。这是第二句。这是第三句。",
    expectedSegments: 3,
    description: "标准句号分割"
  },
  {
    name: "逗号分隔的中文",
    text: "第一部分，第二部分，第三部分",
    expectedSegments: 3,
    description: "逗号分割测试"
  }
];

console.log('🧪 测试改进后的句子分割逻辑');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n📝 测试 ${index + 1}: ${testCase.name}`);
  console.log(`描述: ${testCase.description}`);
  console.log(`期望段落数: ${testCase.expectedSegments}`);
  console.log(`输入文本: "${testCase.text}"`);
  console.log('-'.repeat(40));
  
  const result = splitIntoSentences(testCase.text);
  
  console.log(`结果段落数: ${result.length}`);
  console.log(`匹配期望: ${result.length === testCase.expectedSegments ? '✅' : '❌'}`);
  
  result.forEach((sentence, i) => {
    console.log(`  段落 ${i + 1}: "${sentence}"`);
  });
  
  if (result.length !== testCase.expectedSegments) {
    console.log(`⚠️ 段落数不匹配！期望 ${testCase.expectedSegments}，实际 ${result.length}`);
  }
});

console.log('\n🎯 总结:');
console.log('改进后的分割逻辑包含以下特性:');
console.log('1. 标准标点符号分割 (.!?。！？；;)');
console.log('2. 逗号分割备选方案 (，,)');
console.log('3. 长度分割最后备选方案');
console.log('4. 详细的调试日志');
console.log('5. 多语言支持');

console.log('\n🔧 如果分割仍然不准确，建议:');
console.log('1. 检查翻译API返回的文本格式');
console.log('2. 考虑使用更智能的NLP分割工具');
console.log('3. 根据音频段落的时长进行智能分割');
console.log('4. 添加语言特定的分割规则'); 