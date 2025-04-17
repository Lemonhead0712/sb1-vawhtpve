import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

let redisClient: Redis | null = null

/**
 * Gets the Redis client instance, initializing it if it doesn't exist.
 * @returns The Redis client instance.
 */
export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient
  }

  const url = process.env.UPSTASH_REDIS_URL
  const token = process.env.UPSTASH_REDIS_TOKEN

  if (!url || !token) {
    logger.error("Redis credentials not found in environment variables.")
    throw new Error("Redis credentials not found in environment variables.")
  }

  redisClient = new Redis({
    url,
    token,
  })

  try {
    await redisClient.ping()
    logger.info("Successfully connected to Redis")
  } catch (error) {
    logger.error("Failed to connect to Redis:", error)
    redisClient = null // Reset client on failure
    throw error
  }

  return redisClient
}

/**
 * Handles Redis errors and logs them
 * @param error The error to handle
 */
export async function handleRedisError(error: Error): Promise<void> {
  logger.error("Redis error:", error)
  // In a real implementation, you might want to:
  // - Send the error to a monitoring service
  // - Retry the operation
  // - Alert the user
}
