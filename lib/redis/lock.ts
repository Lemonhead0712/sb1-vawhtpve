import type { Redis } from "@upstash/redis"
import { logger } from "../logger"

// Initialize Redis client
let redis: Redis | null = null

/**
 * Initialize the Redis client for distributed locks
 * @param client Redis client instance
 */
export function initLockClient(client: Redis): void {
  redis = client
  logger.info("Lock Redis client initialized")
}

/**
 * Acquire a distributed lock
 * @param lockName Name of the lock
 * @param lockValue Unique value to identify the lock owner
 * @param ttlSeconds Time-to-live in seconds
 * @returns Whether the lock was acquired
 */
export async function acquireLock(lockName: string, lockValue: string, ttlSeconds = 30): Promise<boolean> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Try to set the lock key with NX (only if it doesn't exist)
    const result = await redis.set(`lock:${lockName}`, lockValue, {
      nx: true,
      ex: ttlSeconds,
    })

    return result === "OK"
  } catch (error) {
    logger.error(`Error acquiring lock ${lockName}:`, error)
    return false
  }
}

/**
 * Release a distributed lock
 * @param lockName Name of the lock
 * @param lockValue Unique value to identify the lock owner
 * @returns Whether the lock was released
 */
export async function releaseLock(lockName: string, lockValue: string): Promise<boolean> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get the current lock value
    const currentValue = await redis.get(`lock:${lockName}`)

    // Only release if the lock is owned by the caller
    if (currentValue === lockValue) {
      await redis.del(`lock:${lockName}`)
      return true
    }

    return false
  } catch (error) {
    logger.error(`Error releasing lock ${lockName}:`, error)
    return false
  }
}

/**
 * Extend a distributed lock
 * @param lockName Name of the lock
 * @param lockValue Unique value to identify the lock owner
 * @param ttlSeconds New time-to-live in seconds
 * @returns Whether the lock was extended
 */
export async function extendLock(
  lockName: string,
  lockValue: string,
  ttlSeconds = 30
): Promise<boolean> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }
    
    // Get the current lock value
    const currentValue = await redis.get(`lock:${lockName}`)
    
    // Only extend if the lock is owned by the caller
    

\
Let's implement a Redis-based geospatial system:
