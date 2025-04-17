import { NextResponse } from "next/server"
import redis from "@/lib/redis"
import { getSession } from "@/lib/session"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Start with basic ping to check connection
    const startTime = Date.now()
    const pingResult = await redis.ping()
    const responseTime = Date.now() - startTime

    // Initialize stats object
    const stats: any = {
      status: pingResult === "PONG" ? "ok" : "error",
      message: pingResult === "PONG" ? "Redis connection successful" : "Redis connection failed",
      responseTime: `${responseTime}ms`,
      timestamp: Date.now(),
    }

    // Try to get more detailed stats using INFO command
    try {
      // Note: This is a simplified approach. In a real implementation with Upstash,
      // you would need to use their API or a compatible client to get detailed stats.
      // This is a mock implementation for demonstration purposes.

      // Mock memory stats
      stats.memoryUsage = {
        used: Math.floor(Math.random() * 50 * 1024 * 1024) + 10 * 1024 * 1024, // 10-60 MB
        peak: Math.floor(Math.random() * 70 * 1024 * 1024) + 20 * 1024 * 1024, // 20-90 MB
        total: 100 * 1024 * 1024, // 100 MB
        fragmentationRatio: 1.0 + Math.random() * 0.8, // 1.0-1.8
      }

      // Get actual key count
      const keys = await redis.keys("*")
      const keyCount = keys.length

      // Mock key stats
      stats.keyStats = {
        total: keyCount,
        expiringCount: Math.floor(keyCount * 0.7), // 70% of keys have expiration
        avgTtl: 3600000 + Math.random() * 86400000, // 1-24 hours in ms
      }

      // Mock command stats
      const commandCount = 10000 + Math.floor(Math.random() * 90000) // 10k-100k
      stats.commandStats = {
        totalCommands: commandCount,
        commandsPerSecond: 10 + Math.random() * 90, // 10-100 commands/sec
        topCommands: [
          { name: "GET", count: Math.floor(commandCount * 0.4), percent: 0.4 },
          { name: "SET", count: Math.floor(commandCount * 0.3), percent: 0.3 },
          { name: "HGET", count: Math.floor(commandCount * 0.15), percent: 0.15 },
          { name: "HSET", count: Math.floor(commandCount * 0.1), percent: 0.1 },
          { name: "DEL", count: Math.floor(commandCount * 0.05), percent: 0.05 },
        ],
      }

      // Mock client stats
      stats.clientStats = {
        connected: 5 + Math.floor(Math.random() * 15), // 5-20 clients
        blocked: Math.floor(Math.random() * 2), // 0-1 blocked clients
        maxClients: 100,
      }

      // Mock error rate and uptime
      stats.errorRate = Math.random() * 0.001 // 0-0.1%
      stats.uptime = 86400 + Math.floor(Math.random() * 2592000) // 1-30 days in seconds
    } catch (infoError) {
      logger.warn("Could not fetch detailed Redis stats:", infoError)
      // We still return basic connection info even if detailed stats fail
    }

    return NextResponse.json(stats)
  } catch (error) {
    logger.error("Error fetching Redis stats:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch Redis stats",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
