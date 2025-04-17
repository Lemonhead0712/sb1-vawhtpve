import { getRedisClient, handleRedisError } from "./client"
import { logger } from "@/lib/logger"

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

/**
 * Check if a request is within rate limits
 * @param identifier Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowInSeconds Time window in seconds
 * @param prefix Optional prefix for the rate limit key
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowInSeconds: number,
  prefix = "ratelimit:",
): Promise<RateLimitResult> {
  const key = `${prefix}${identifier}`

  try {
    const redis = await getRedisClient()

    // Get current count
    const current = (await redis.get<number>(key)) || 0

    if (current >= maxRequests) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key)
      logger.debug(`Rate limit exceeded for ${identifier}: ${current}/${maxRequests}`)
      return {
        success: false,
        remaining: 0,
        reset: ttl > 0 ? ttl : windowInSeconds,
        limit: maxRequests,
      }
    }

    // Increment counter
    await redis.incr(key)

    // Set expiry if it's a new key
    if (current === 0) {
      await redis.expire(key, windowInSeconds)
    }

    const ttl = await redis.ttl(key)
    const remaining = maxRequests - (current + 1)

    return {
      success: true,
      remaining,
      reset: ttl > 0 ? ttl : windowInSeconds,
      limit: maxRequests,
    }
  } catch (error) {
    logger.error(`Rate limit check error for ${identifier}:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))

    // Default to allowing the request if Redis fails
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: windowInSeconds,
      limit: maxRequests,
    }
  }
}

/**
 * Reset a rate limit for a specific identifier
 * @param identifier Unique identifier for the rate limit
 * @param prefix Optional prefix for the rate limit key
 * @returns True if the rate limit was reset, false otherwise
 */
export async function resetRateLimit(identifier: string, prefix = "ratelimit:"): Promise<boolean> {
  const key = `${prefix}${identifier}`

  try {
    const redis = await getRedisClient()
    await redis.del(key)
    logger.debug(`Rate limit reset for ${identifier}`)
    return true
  } catch (error) {
    logger.error(`Rate limit reset error for ${identifier}:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return false
  }
}

/**
 * Get current rate limit status for a specific identifier
 * @param identifier Unique identifier for the rate limit
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param prefix Optional prefix for the rate limit key
 * @returns Rate limit status or null if not found
 */
export async function getRateLimitStatus(
  identifier: string,
  maxRequests: number,
  prefix = "ratelimit:",
): Promise<{ current: number; ttl: number } | null> {
  const key = `${prefix}${identifier}`

  try {
    const redis = await getRedisClient()
    const current = await redis.get<number>(key)

    if (current === null) {
      return null
    }

    const ttl = await redis.ttl(key)

    return {
      current,
      ttl: ttl > 0 ? ttl : 0,
    }
  } catch (error) {
    logger.error(`Rate limit status error for ${identifier}:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return null
  }
}

/**
 * Create a sliding window rate limiter
 * @param identifier Unique identifier for the rate limit
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowInSeconds Time window in seconds
 * @param prefix Optional prefix for the rate limit key
 * @returns Rate limit result
 */
export async function slidingWindowRateLimit(
  identifier: string,
  maxRequests: number,
  windowInSeconds: number,
  prefix = "slidingwindow:",
): Promise<RateLimitResult> {
  const key = `${prefix}${identifier}`
  const now = Date.now()
  const windowStart = now - windowInSeconds * 1000

  try {
    const redis = await getRedisClient()

    // Add the current timestamp to the sorted set
    await redis.zadd(key, { score: now, member: now.toString() })

    // Remove timestamps outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Set expiry on the key
    await redis.expire(key, windowInSeconds)

    // Count the number of requests in the current window
    const count = await redis.zcard(key)

    if (count > maxRequests) {
      // Get the oldest timestamp in the window
      const oldestTimestamp = await redis.zrange(key, 0, 0, { withScores: true })
      const resetTime =
        oldestTimestamp.length > 0
          ? Math.ceil((Number(oldestTimestamp[0].score) + windowInSeconds * 1000 - now) / 1000)
          : windowInSeconds

      logger.debug(`Sliding window rate limit exceeded for ${identifier}: ${count}/${maxRequests}`)

      return {
        success: false,
        remaining: 0,
        reset: resetTime > 0 ? resetTime : 1,
        limit: maxRequests,
      }
    }

    return {
      success: true,
      remaining: maxRequests - count,
      reset: windowInSeconds,
      limit: maxRequests,
    }
  } catch (error) {
    logger.error(`Sliding window rate limit error for ${identifier}:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))

    // Default to allowing the request if Redis fails
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: windowInSeconds,
      limit: maxRequests,
    }
  }
}
