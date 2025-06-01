# VoiceSync 音频转文字测试设置

## 环境配置

### 1. 获取 Replicate API Token

1. 访问 [Replicate](https://replicate.com/)
2. 注册账号并登录
3. 前往 [API Tokens 页面](https://replicate.com/account/api-tokens)
4. 创建新的 API Token
5. 复制生成的 Token

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Replicate API Configuration
REPLICATE_API_TOKEN_WHISPER=your_whisper_api_token_here
REPLICATE_API_TOKEN_TTS=your_tts_api_token_here

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

将 `your_replicate_api_token_here` 替换为你的实际 API Token。

### 3. 启动项目

```bash
npm run dev
```

### 4. 测试音频转文字功能

1. 访问 http://localhost:3000
2. 点击 "Test Audio Transcription" 按钮
3. 上传音频文件（支持 MP3, WAV, M4A 格式）
4. 等待处理完成，查看转录结果

## 支持的音频格式

- MP3
- WAV
- M4A
- 最大文件大小：25MB

## API 说明

项目使用 OpenAI Whisper 模型进行音频转文字：
- 模型：large-v3
- 支持自动语言检测
- 提供分段转录和时间戳
- 可选择是否翻译为英文

## 注意事项

1. 确保网络连接稳定，API 调用需要上传音频文件
2. 处理时间取决于音频文件大小和长度
3. Replicate API 可能有使用限制和费用，请查看其定价页面 