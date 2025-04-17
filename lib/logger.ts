/**
 * Logger utility for centralized logging
 */

type LogLevel = "debug" | "info" | "warn" | "error"

class Logger {
  private enabled = true
  private logLevel: LogLevel = "info" // Default to info level

  constructor() {
    // Initialize based on environment
    if (typeof window !== "undefined") {
      this.enabled = process.env.NODE_ENV !== "production" || localStorage.getItem("debug_logging") === "true"
    } else {
      this.enabled = process.env.NODE_ENV !== "production"
    }

    // Set log level from environment variable
    const configuredLevel = process.env.LOG_LEVEL as LogLevel
    if (configuredLevel && ["debug", "info", "warn", "error"].includes(configuredLevel)) {
      this.logLevel = configuredLevel
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.logLevel]
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, ...args)

      // In production, we could send errors to a monitoring service here
      if (process.env.NODE_ENV === "production") {
        // Example: sendToErrorMonitoring(message, args)
      }
    }
  }

  // Enable telemetry tracking with timestamps
  track(event: string, properties?: Record<string, any>): void {
    if (this.enabled) {
      const timestamp = new Date().toISOString()
      this.info(`[TRACK] ${event}`, { timestamp, ...properties })

      // In production, we would send telemetry to a service
      if (process.env.NODE_ENV === "production") {
        // Example: sendTelemetry(event, { timestamp, ...properties })
      }
    }
  }
}

// Export a singleton instance
export const logger = new Logger()
