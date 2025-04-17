import { getRedisClient, handleRedisError } from "./client"
import { logger } from "@/lib/logger"

// Default TTL in seconds (1 hour)
const DEFAULT_TTL = 3600

/**
 * Get a value from the Redis cache
 * @param key Cache key
 * @returns The cached value or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient()
    const data = await redis.get(key)
    return data as T
  } catch (error) {
    logger.error(`Redis get error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return null
  }
}

/**
 * Set a value in the Redis cache
 * @param key Cache key
 * @param data Data to cache
 * @param expireInSeconds TTL in seconds (default: 1 hour)
 */
export async function setCache<T>(key: string, data: T, expireInSeconds?: number): Promise<void> {
  try {
    const redis = await getRedisClient()

    if (expireInSeconds) {
      await redis.set(key, data, { ex: expireInSeconds })
    } else {
      await redis.set(key, data, { ex: DEFAULT_TTL })
    }

    logger.debug(`Cache set for key "${key}" with TTL ${expireInSeconds || DEFAULT_TTL}s`)
  } catch (error) {
    logger.error(`Redis set error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Delete a value from the Redis cache
 * @param key Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const redis = await getRedisClient()
    await redis.del(key)
    logger.debug(`Cache deleted for key "${key}"`)
  } catch (error) {
    logger.error(`Redis delete error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Check if a key exists in the Redis cache
 * @param key Cache key
 * @returns True if the key exists, false otherwise
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const redis = await getRedisClient()
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    logger.error(`Redis exists error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return false
  }
}

/**
 * Get the TTL of a key in the Redis cache
 * @param key Cache key
 * @returns TTL in seconds or -1 if the key doesn't exist or has no expiry
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const redis = await getRedisClient()
    return await redis.ttl(key)
  } catch (error) {
    logger.error(`Redis TTL error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return -1
  }
}

/**
 * Extend the TTL of a key in the Redis cache
 * @param key Cache key
 * @param expireInSeconds New TTL in seconds
 * @returns True if the TTL was extended, false otherwise
 */
export async function extendCacheTTL(key: string, expireInSeconds: number): Promise<boolean> {
  try {
    const redis = await getRedisClient()
    const result = await redis.expire(key, expireInSeconds)
    return result === 1
  } catch (error) {
    logger.error(`Redis expire error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return false
  }
}

/**
 * Increment a counter in the Redis cache
 * @param key Cache key
 * @param increment Increment value (default: 1)
 * @param expireInSeconds TTL in seconds (default: 1 hour)
 * @returns The new value of the counter
 */
export async function incrementCache(key: string, increment = 1, expireInSeconds?: number): Promise<number> {
  try {
    const redis = await getRedisClient()
    const value = await redis.incrby(key, increment)

    // Set expiry if provided and key is new (value === increment)
    if (expireInSeconds && value === increment) {
      await redis.expire(key, expireInSeconds)
    }

    return value
  } catch (error) {
    logger.error(`Redis increment error for key "${key}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

/**
 * Get multiple values from the Redis cache
 * @param keys Array of cache keys
 * @returns Array of cached values (null for keys not found)
 */
export async function getMultiCache<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) return []

  try {
    const redis = await getRedisClient()
    const values = await redis.mget(...keys)
    return values as (T | null)[]
  } catch (error) {
    logger.error(`Redis mget error for keys "${keys.join(", ")}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return keys.map(() => null)
  }
}

/**
 * Set multiple values in the Redis cache
 * @param entries Array of [key, value] pairs
 * @param expireInSeconds TTL in seconds (default: 1 hour)
 */
export async function setMultiCache<T>(entries: [string, T][], expireInSeconds?: number): Promise<void> {
  if (entries.length === 0) return

  try {
    const redis = await getRedisClient()
    const pipeline = redis.pipeline()

    for (const [key, value] of entries) {
      if (expireInSeconds) {
        pipeline.set(key, value, { ex: expireInSeconds })
      } else {
        pipeline.set(key, value, { ex: DEFAULT_TTL })
      }
    }

    await pipeline.exec()
    logger.debug(`Multi-cache set for ${entries.length} keys with TTL ${expireInSeconds || DEFAULT_TTL}s`)
  } catch (error) {
    logger.error(`Redis multi-set error:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Delete multiple values from the Redis cache
 * @param keys Array of cache keys
 */
export async function deleteMultiCache(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  try {
    const redis = await getRedisClient()
    await redis.del(...keys)
    logger.debug(`Multi-cache deleted for keys "${keys.join(", ")}"`)
  } catch (error) {
    logger.error(`Redis multi-delete error:`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Clear all keys matching a pattern
 * @param pattern Key pattern (e.g., "user:*")
 * @returns Number of keys deleted
 */
export async function clearCachePattern(pattern: string): Promise<number> {
  try {
    const redis = await getRedisClient()
    const keys = await redis.keys(pattern)

    if (keys.length === 0) return 0

    await redis.del(...keys)
    logger.debug(`Cleared ${keys.length} keys matching pattern "${pattern}"`)
    return keys.length
  } catch (error) {
    logger.error(`Redis pattern clear error for pattern "${pattern}":`, error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}
