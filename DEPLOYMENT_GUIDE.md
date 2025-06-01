# VoiceSync Vercel 部署指南

## 项目概述

VoiceSync 是一个完整的音频翻译和配音平台，支持：
- 音频转文字 (Whisper)
- 文本翻译 (DeepSeek)
- 文字转语音 (XTTS-v2)
- 音频对齐和合成

## 部署前准备

### 1. 获取必要的API密钥

#### Replicate API Token
1. 访问 [Replicate](https://replicate.com/)
2. 注册账号并登录
3. 前往 [API Tokens 页面](https://replicate.com/account/api-tokens)
4. 创建新的 API Token
5. 复制生成的 Token (格式: `r8_xxx...`)

#### OpenRouter API Key
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 前往 API Keys 页面
4. 创建新的 API Key
5. 复制生成的 Key (格式: `sk-or-v1-xxx...`)

### 2. 项目结构检查

确保项目包含以下关键文件：
```
voice-sync-platform/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts      # 音频转文字
│   │   ├── translate/route.ts       # 文本翻译
│   │   ├── tts/route.ts            # 文字转语音
│   │   └── process-audio/route.ts   # 完整处理流程
│   ├── upload/                      # 上传页面
│   ├── processing/                  # 处理页面
│   ├── result/                      # 结果页面
│   └── test/                        # 测试页面
├── components/                      # UI组件
├── lib/                            # 工具函数
└── package.json
```

## Vercel 部署步骤

### 1. 连接 GitHub 仓库

1. 将项目推送到 GitHub 仓库
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# Replicate API Tokens
# Whisper (音频转文字)
REPLICATE_API_TOKEN_WHISPER=r8_your_whisper_token

# TTS (文字转语音)
REPLICATE_API_TOKEN_TTS=r8_your_tts_token

# OpenRouter API Configuration  
OPENROUTER_API_KEY=sk-or-v1-your_actual_openrouter_key

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

**设置步骤：**
1. 在 Vercel 项目页面，点击 "Settings"
2. 选择 "Environment Variables"
3. 添加上述三个环境变量
4. 确保选择 "Production", "Preview", "Development" 环境

### 3. 部署配置

#### vercel.json (可选)
```json
{
  "functions": {
    "app/api/process-audio/route.ts": {
      "maxDuration": 300
    },
    "app/api/transcribe/route.ts": {
      "maxDuration": 300
    },
    "app/api/tts/route.ts": {
      "maxDuration": 300
    }
  }
}
```

#### next.config.mjs 更新
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: []
  },
  images: {
    domains: ['replicate.delivery']
  }
}

export default nextConfig
```

### 4. 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后，访问提供的 URL

## 功能测试

部署完成后，测试以下功能：

### 1. 基础功能测试
- 访问主页：`https://your-project.vercel.app`
- 测试完整流程：`/upload`

### 2. API 端点测试
- `POST /api/transcribe` - 音频转文字
- `POST /api/translate` - 文本翻译
- `POST /api/tts` - 文字转语音
- `POST /api/process-audio` - 完整处理

### 3. 完整流程测试
1. 上传音频文件
2. 选择源语言和目标语言
3. 开始处理
4. 查看结果和下载文件

## 性能优化

### 1. API 超时设置
- Vercel Hobby 计划：10秒超时
- Vercel Pro 计划：60秒超时
- 对于长音频文件，建议升级到 Pro 计划

### 2. 文件大小限制
- Vercel 请求体限制：4.5MB (Hobby), 100MB (Pro)
- 建议在前端限制音频文件大小为 25MB

### 3. 并发处理
- 使用 Promise.all 并行处理 TTS 请求
- 实现请求队列避免 API 限制

## 监控和调试

### 1. Vercel 日志
- 在 Vercel Dashboard 查看 "Functions" 标签
- 监控 API 调用和错误日志

### 2. 错误处理
- 所有 API 都包含详细的错误信息
- 前端显示用户友好的错误消息

### 3. 性能监控
- 监控 API 响应时间
- 跟踪处理成功率

## 常见问题

### Q: 部署后 API 调用失败？
A: 检查环境变量是否正确设置，确保 API 密钥有效

### Q: 音频处理超时？
A: 考虑升级 Vercel 计划或优化音频文件大小

### Q: TTS 生成失败？
A: 检查 Replicate API 配额和网络连接

### Q: 翻译质量不佳？
A: 可以调整翻译提示词或更换翻译模型

## 成本估算

### Replicate API
- Whisper: ~$0.0001/秒
- XTTS-v2: ~$0.001/秒

### OpenRouter API
- DeepSeek: ~$0.0001/token

### Vercel
- Hobby: 免费 (有限制)
- Pro: $20/月 (推荐生产环境)

## 安全注意事项

1. **API 密钥安全**
   - 仅在服务器端使用 API 密钥
   - 定期轮换 API 密钥

2. **文件上传安全**
   - 验证文件类型和大小
   - 不存储用户上传的文件

3. **速率限制**
   - 实现客户端速率限制
   - 监控 API 使用量

## 后续优化

1. **添加用户认证**
2. **实现文件存储**
3. **添加批量处理**
4. **优化音频对齐算法**
5. **支持更多语言和格式**

---

部署完成后，你将拥有一个功能完整的音频翻译和配音平台！ 