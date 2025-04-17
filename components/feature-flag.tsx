"use client"

import { useState, useEffect, type ReactNode } from "react"

interface FeatureFlagProps {
  name: string
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkFeature() {
      try {
        const response = await fetch(`/api/features/${name}`)
        const data = await response.json()
        setIsEnabled(data.enabled)
      } catch (error) {
        console.error(`Error checking feature flag ${name}:`, error)
        setIsEnabled(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkFeature()
  }, [name])

  if (isLoading) {
    return null // Or a loading indicator
  }

  return isEnabled ? <>{children}</> : <>{fallback}</>
}
