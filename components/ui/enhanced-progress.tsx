import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Loader2, Circle } from "lucide-react"

interface Step {
  id: number
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface EnhancedProgressProps {
  value: number
  steps: Step[]
  currentStep: number
  className?: string
  showStepLabels?: boolean
}

const EnhancedProgress = React.forwardRef<
  HTMLDivElement,
  EnhancedProgressProps
>(({ value, steps, currentStep, className, showStepLabels = true, ...props }, ref) => {
  const progressPercentage = Math.min(100, Math.max(0, value))
  
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {/* Steps indicator */}
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = step.status === 'completed'
          const isFailed = step.status === 'failed'
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                  {
                    "bg-green-500 text-white": isCompleted,
                    "bg-primary text-white": isActive && !isCompleted && !isFailed,
                    "bg-red-500 text-white": isFailed,
                    "bg-gray-200 text-gray-500": !isActive && !isCompleted && !isFailed,
                  }
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isActive && !isFailed ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFailed ? (
                  "✗"
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              {/* Step label */}
              {showStepLabels && (
                <div className="mt-2 text-xs text-center max-w-16">
                  <div
                    className={cn(
                      "font-medium",
                      {
                        "text-green-600": isCompleted,
                        "text-primary": isActive && !isCompleted && !isFailed,
                        "text-red-600": isFailed,
                        "text-gray-500": !isActive && !isCompleted && !isFailed,
                      }
                    )}
                  >
                    {step.name}
                  </div>
                </div>
              )}
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute h-0.5 top-4 transition-all duration-300",
                    {
                      "bg-green-500": isCompleted,
                      "bg-primary": isActive && progressPercentage > (index + 1) * (100 / steps.length),
                      "bg-gray-200": !isCompleted && (!isActive || progressPercentage <= (index + 1) * (100 / steps.length)),
                    }
                  )}
                  style={{
                    left: '2rem',
                    width: `calc(${100 / (steps.length - 1)}% - 2rem)`,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
          style={{
            transform: `translateX(-${100 - progressPercentage}%)`,
          }}
        />
        
        {/* Animated shimmer effect */}
        {progressPercentage < 100 && (
          <div
            className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            style={{
              left: `${progressPercentage - 25}%`,
            }}
          />
        )}
      </div>
      
      {/* Progress percentage */}
      <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
        <span>Progress</span>
        <span className="font-medium">{Math.round(progressPercentage)}%</span>
      </div>
    </div>
  )
})

EnhancedProgress.displayName = "EnhancedProgress"

export { EnhancedProgress } 