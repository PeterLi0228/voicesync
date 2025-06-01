"use client"

import * as React from "react"

interface ClientWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientWrapper({ children, fallback = null }: ClientWrapperProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 