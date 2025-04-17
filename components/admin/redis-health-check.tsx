"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface RedisHealthCheckProps {
  autoRefresh?: boolean
  refreshInterval?: number
  compact?: boolean
}

export function RedisHealthCheck({
  autoRefresh = false,
  refreshInterval = 60,
  compact = false,
}: RedisHealthCheckProps) {
  const [status, setStatus] = useState<"ok" | "error" | "loading">("loading")
  const [message, setMessage] = useState<string>("")
  const [responseTime, setResponseTime] = useState<string>("")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    try {
      setIsChecking(true)
      const response = await fetch("/api/health/redis")
      const data = await response.json()

      setStatus(data.status)
      setMessage(data.message)
      setResponseTime(data.responseTime || "")
      setLastChecked(new Date())
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check Redis health")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      intervalId = setInterval(() => {
        checkHealth()
      }, refreshInterval * 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh, refreshInterval])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        ) : status === "ok" ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm">
          Redis: {status === "loading" ? "Checking..." : status === "ok" ? "Connected" : "Error"}
        </span>
        {responseTime && status === "ok" && <span className="text-xs text-muted-foreground">({responseTime})</span>}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={checkHealth} disabled={isChecking}>
          <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Redis Status</h3>
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Check
          </Button>
        </div>

        {status !== "loading" && (
          <Alert variant={status === "ok" ? "default" : "destructive"} className="mt-4">
            {status === "ok" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{status === "ok" ? "Connected" : "Connection Error"}</AlertTitle>
            <AlertDescription className="flex flex-col">
              <span>{message}</span>
              {responseTime && status === "ok" && (
                <span className="text-sm text-muted-foreground">Response time: {responseTime}</span>
              )}
              {lastChecked && (
                <span className="text-xs text-muted-foreground mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
