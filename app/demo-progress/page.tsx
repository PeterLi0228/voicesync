"use client"

import { useState } from 'react'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EnhancedProgress } from "@/components/ui/enhanced-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoProgressPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  const steps = [
    { id: 1, name: 'Transcription', status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' },
    { id: 2, name: 'Translation', status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' },
    { id: 3, name: 'Segments', status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' },
    { id: 4, name: 'Synthesis', status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' },
    { id: 5, name: 'Alignment', status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' },
  ]

  const [stepStates, setStepStates] = useState(steps)

  const simulateProgress = () => {
    if (isRunning) return
    
    setIsRunning(true)
    setProgress(0)
    setCurrentStep(0)
    setStepStates(steps.map(step => ({ ...step, status: 'pending' as const })))

    let currentProgress = 0
    let currentStepIndex = 0

    const interval = setInterval(() => {
      currentProgress += Math.random() * 10 + 5 // 随机增加5-15%
      
      if (currentProgress >= 100) {
        currentProgress = 100
        setProgress(100)
        setStepStates(prev => prev.map(step => ({ ...step, status: 'completed' as const })))
        setIsRunning(false)
        clearInterval(interval)
        return
      }

      // 更新当前步骤
      const newStepIndex = Math.floor((currentProgress / 100) * steps.length)
      if (newStepIndex !== currentStepIndex) {
        currentStepIndex = newStepIndex
        setCurrentStep(currentStepIndex)
        
        setStepStates(prev => prev.map((step, index) => ({
          ...step,
          status: index < currentStepIndex ? 'completed' as const 
                : index === currentStepIndex ? 'processing' as const 
                : 'pending' as const
        })))
      }

      setProgress(currentProgress)
    }, 500)
  }

  const resetProgress = () => {
    setProgress(0)
    setCurrentStep(0)
    setIsRunning(false)
    setStepStates(steps.map(step => ({ ...step, status: 'pending' as const })))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Progress Demo</h1>
              <p className="text-lg text-muted-foreground">
                演示实时进度更新功能
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>音频处理进度演示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <EnhancedProgress 
                  value={progress}
                  steps={stepStates}
                  currentStep={currentStep}
                />

                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={simulateProgress} 
                    disabled={isRunning}
                  >
                    {isRunning ? '处理中...' : '开始演示'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetProgress}
                    disabled={isRunning}
                  >
                    重置
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>当前进度: {Math.round(progress)}%</p>
                  <p>当前步骤: {currentStep + 1} / {steps.length}</p>
                  <p>步骤名称: {stepStates[currentStep]?.name || '未开始'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 