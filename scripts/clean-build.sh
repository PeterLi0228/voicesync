#!/bin/bash

echo "🧹 Cleaning Next.js build cache..."

# 停止所有Next.js进程
echo "Stopping Next.js processes..."
pkill -f "next" 2>/dev/null || true

# 删除构建缓存
echo "Removing .next directory..."
rm -rf .next

# 删除node_modules缓存
echo "Removing node_modules cache..."
rm -rf node_modules/.cache

# 重新安装依赖
echo "Reinstalling dependencies..."
npm install --legacy-peer-deps

echo "✅ Build cache cleaned successfully!"
echo "You can now run 'npm run dev' to start the development server." 