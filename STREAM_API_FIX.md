# 流式 API Controller 关闭错误修复

## 问题描述

在音频处理过程中，特别是在 TTS（文字转语音）生成阶段，出现了大量的 "Controller is already closed" 错误。这个错误的根本原因是：

1. **异步操作竞争条件**：TTS 生成是并行处理多个音频片段，每个片段都有自己的轮询过程
2. **Controller 状态管理缺失**：没有检查 ReadableStream controller 的状态就尝试发送数据
3. **错误处理不当**：在 catch 块中尝试使用已经关闭的 controller

## 错误日志示例

```
Polling attempt 58 failed: TypeError: Invalid state: Controller is already closed
    at sendProgress (app/api/process-audio-stream/route.ts:53:17)
    at eval (app/api/process-audio-stream/route.ts:367:14)
    at pollPredictionWithProgress (app/api/process-audio-stream/route.ts:435:6)
```

## 修复方案

### 1. 添加 Controller 状态跟踪

```typescript
async function processAudioWithProgress(
  request: NextRequest, 
  controller: ReadableStreamDefaultController, 
  requestId: string
) {
  let isControllerClosed = false;
  
  const sendProgress = (step: number, progress: number, message: string, data?: any) => {
    if (isControllerClosed) {
      console.log(`⚠️ [${requestId}] Skipping progress update - controller closed: ${message}`);
      return;
    }
    
    try {
      const progressData = {
        step, progress, message, data,
        timestamp: new Date().toISOString()
      };
      controller.enqueue(`data: ${JSON.stringify(progressData)}\n\n`);
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to send progress:`, error);
      isControllerClosed = true;
    }
  };
}
```

### 2. 安全的进度更新函数

```typescript
const safeSendProgress = (step: number, progress: number, message: string) => {
  try {
    sendProgress(step, progress, message);
  } catch (error) {
    console.log(`⚠️ [${requestId}] Progress update skipped: ${message}`);
  }
};
```

### 3. 改进轮询函数的错误处理

```typescript
async function pollPredictionWithProgress(
  predictionId: string, 
  apiToken: string, 
  sendProgress: Function,
  step: number,
  startProgress: number,
  endProgress: number,
  requestId: string,
  maxAttempts = 60
): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // API 调用...
      
      // 安全地更新进度
      try {
        const progressPercent = startProgress + (attempt / maxAttempts) * (endProgress - startProgress);
        sendProgress(step, progressPercent, `Processing... (${prediction.status})`);
      } catch (progressError) {
        // 如果进度更新失败，继续轮询但不再发送更新
        console.log(`⚠️ [${requestId}] Progress update failed, continuing polling silently`);
      }
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }
    } catch (error) {
      // 错误处理...
    }
  }
}
```

### 4. 改进错误处理

```typescript
} catch (error) {
  console.error('Audio processing error:', error);
  
  if (!isControllerClosed) {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      controller.enqueue(`data: ${JSON.stringify({
        step: 0, progress: 0,
        message: `Processing failed: ${errorMessage}`,
        error: true,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (enqueueError) {
      console.error('Failed to send error message:', enqueueError);
    }
    
    isControllerClosed = true;
    controller.close();
  }
}
```

## 修复效果

### 修复前
- 大量 "Controller is already closed" 错误
- 处理过程中断
- 用户看不到完整的进度更新

### 修复后
- ✅ 优雅的错误处理
- ✅ 完整的进度更新流程
- ✅ 详细的日志记录
- ✅ 安全的 Controller 状态管理

## 测试验证

1. **上传音频文件**：访问 `/upload` 页面
2. **观察进度更新**：在 `/processing` 页面查看实时进度
3. **检查控制台日志**：确认没有 Controller 错误
4. **完整流程测试**：确保能够完成整个处理流程

## 技术要点

1. **状态管理**：使用 `isControllerClosed` 标志跟踪 Controller 状态
2. **错误隔离**：将进度更新错误与业务逻辑错误分离
3. **优雅降级**：即使进度更新失败，也继续处理业务逻辑
4. **详细日志**：添加 requestId 和详细的日志信息便于调试

## 注意事项

- 修复后的代码向后兼容
- 不影响现有的 API 接口
- 提高了系统的稳定性和用户体验
- 便于后续的调试和维护 