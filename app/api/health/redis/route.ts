import { NextResponse } from "next/server"
import redis from "@/lib/redis"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Try to ping Redis to check connection
    const startTime = Date.now()
    const result = await redis.ping()
    const responseTime = Date.now() - startTime

    if (result !== "PONG") {
      logger.error("Redis health check failed: unexpected response")
      return NextResponse.json(
        {
          status: "error",
          message: "Redis connection failed: unexpected response",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Redis connection successful",
      responseTime: `${responseTime}ms`,
    })
  } catch (error) {
    logger.error("Redis health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Redis connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
