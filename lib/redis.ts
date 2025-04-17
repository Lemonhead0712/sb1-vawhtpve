import { Redis } from "@upstash/redis"
import { logger } from "./logger"

// Function to parse Redis connection string if provided in that format
function parseRedisConnectionString(connectionString: string): { url: string; token: string } {
  try {
    // Handle connection strings in the format: rediss://default:TOKEN@HOST:PORT
    if (connectionString.startsWith("rediss://")) {
      const tokenMatch = connectionString.match(/default:([^@]+)@/)
      const hostMatch = connectionString.match(/@([^:]+)/)

      if (!tokenMatch || !hostMatch) {
        throw new Error("Invalid Redis connection string format")
      }

      const token = tokenMatch[1]
      const host = hostMatch[1]

      return {
        url: `https://${host}`,
        token: token,
      }
    }

    // If it's already in the correct format (https://...)
    if (connectionString.startsWith("https://")) {
      // In this case, we assume the token is provided separately
      return {
        url: connectionString,
        token: process.env.UPSTASH_REDIS_TOKEN || "",
      }
    }

    throw new Error("Unsupported Redis connection string format")
  } catch (error) {
    logger.error("Failed to parse Redis connection string:", error)
    throw new Error("Invalid Redis connection configuration")
  }
}

// Get Redis configuration from environment variables
function getRedisConfig(): { url: string; token: string } {
  // Check for the preferred separate URL and token configuration
  if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    return {
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    }
  }

  // Check for KV_REST_API_URL and KV_REST_API_TOKEN (Vercel KV naming convention)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }
  }

  // Check for connection string in REDIS_URL (fallback)
  if (process.env.REDIS_URL) {
    return parseRedisConnectionString(process.env.REDIS_URL)
  }

  // Development fallback (should not be used in production)
  logger.warn("Using development fallback for Redis connection. This should not be used in production.")
  return {
    url: "https://primary-oryx-23090.upstash.io",
    token: "AVoyAAIjcDE2ZDU5N2I1OTI2Yzg0M2E1YTdjMTc1YmFkMjBlMzIyY3AxMA",
  }
}

// Initialize Redis client with configuration from environment variables
const redisConfig = getRedisConfig()
const redis = new Redis({
  url: redisConfig.url,
  token: redisConfig.token,
})

// Log Redis connection status (without exposing credentials)
logger.info(`Redis client initialized with endpoint: ${redisConfig.url}`)

export default redis

// Helper functions for common operations
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data as T
  } catch (error) {
    logger.error("Redis get error:", error)
    return null
  }
}

export async function setCache<T>(key: string, data: T, expireInSeconds?: number): Promise<void> {
  try {
    if (expireInSeconds) {
      await redis.set(key, data, { ex: expireInSeconds })
    } else {
      await redis.set(key, data)
    }
  } catch (error) {
    logger.error("Redis set error:", error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    logger.error("Redis delete error:", error)
  }
}

// Rate limiting helper
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowInSeconds: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`

  try {
    // Get current count
    const current = (await redis.get<number>(key)) || 0

    if (current >= maxRequests) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key)
      return {
        success: false,
        remaining: 0,
        reset: ttl,
      }
    }

    // Increment counter
    await redis.incr(key)

    // Set expiry if it's a new key
    if (current === 0) {
      await redis.expire(key, windowInSeconds)
    }

    const ttl = await redis.ttl(key)

    return {
      success: true,
      remaining: maxRequests - (current + 1),
      reset: ttl,
    }
  } catch (error) {
    logger.error("Rate limit check error:", error)
    // Default to allowing the request if Redis fails
    return { success: true, remaining: maxRequests - 1, reset: windowInSeconds }
  }
}
