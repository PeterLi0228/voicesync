# 环境变量配置指南

## 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，包含以下环境变量：

```bash
# Replicate API Tokens
# Whisper (音频转文字)
REPLICATE_API_TOKEN_WHISPER=r8_your_whisper_token_here

# TTS (文字转语音) 
REPLICATE_API_TOKEN_TTS=r8_your_tts_token_here

# OpenRouter API Key (文本翻译)
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API 密钥说明

### 1. Whisper API Token
- **用途**: 音频转文字 (转录)
- **格式**: `r8_xxxxxxxxxxxxxxxxxxxxxxxxx`
- **获取方式**: 在 [Replicate](https://replicate.com) 注册并获取API token
- **使用位置**: `/api/transcribe` 和 `/api/process-audio` 中的转录部分

### 2. TTS API Token  
- **用途**: 文字转语音 (配音)
- **格式**: `r8_xxxxxxxxxxxxxxxxxxxxxxxxx`
- **获取方式**: 在 [Replicate](https://replicate.com) 注册并获取API token
- **使用位置**: `/api/tts` 和 `/api/process-audio` 中的TTS部分

### 3. OpenRouter API Key
- **用途**: 文本翻译
- **格式**: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **获取方式**: 在 [OpenRouter](https://openrouter.ai) 注册并获取API key
- **使用位置**: `/api/translate`

## 代码更新

代码已更新为使用专用的API token：

- **Whisper**: 使用 `REPLICATE_API_TOKEN_WHISPER`
- **TTS**: 使用 `REPLICATE_API_TOKEN_TTS`
- **翻译**: 使用 `OPENROUTER_API_KEY`

## 设置步骤

1. 在项目根目录创建 `.env.local` 文件
2. 复制上面的环境变量模板到文件中
3. 替换所有的 `your_xxx_here` 为你的真实API密钥
4. 保存文件
5. 重启开发服务器: `npm run dev`

## 验证配置

启动服务器后，可以通过以下方式验证配置：

1. 访问 `/upload` 页面
2. 上传音频文件并选择语言
3. 开始处理，观察控制台日志确认API调用成功

## 注意事项

- `.env.local` 文件已在 `.gitignore` 中，不会被提交到版本控制
- 确保所有API密钥都是有效的
- 如果某个API调用失败，检查对应的token是否正确
- **重要**: 请勿将真实的API密钥提交到版本控制系统 