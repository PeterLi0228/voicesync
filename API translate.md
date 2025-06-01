# 翻译API使用说明

使用 OpenRouter 平台的 DeepSeek 模型进行文本翻译。

## 配置

在 `.env.local` 文件中配置：
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## API 示例

```javascript
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "deepseek/deepseek-r1-distill-qwen-7b",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  })
});
```

## 获取API密钥

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 前往 API Keys 页面
4. 创建新的 API Key
5. 将密钥添加到环境变量中