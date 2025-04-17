import type { Redis } from "@upstash/redis"
import { logger } from "../logger"

// Type definitions
export type FeatureFlag = {
  name: string
  enabled: boolean
  description: string
  percentage?: number // For percentage rollouts (0-100)
  allowlist?: string[] // List of user IDs that have access
  createdAt?: string
  updatedAt?: string
}

// Initialize Redis client
let redis: Redis | null = null

/**
 * Initialize the Redis client for feature flags
 * @param client Redis client instance
 */
export function initFeatureFlagsClient(client: Redis): void {
  redis = client
  logger.info("Feature flags Redis client initialized")
}

/**
 * Get a feature flag by name
 * @param name Feature flag name
 * @returns Feature flag or null if not found
 */
export async function getFeatureFlag(name: string): Promise<FeatureFlag | null> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const flag = await redis.hgetall<FeatureFlag>(`feature:${name}`)

    // Convert allowlist from string to array if needed
    if (flag && typeof flag.allowlist === "string") {
      try {
        flag.allowlist = JSON.parse(flag.allowlist)
      } catch (e) {
        flag.allowlist = []
      }
    }

    return flag || null
  } catch (error) {
    logger.error(`Error getting feature flag ${name}:`, error)
    return null
  }
}

/**
 * Check if a feature is enabled for a specific user
 * @param name Feature flag name
 * @param userId Optional user ID for user-specific flags
 * @returns Boolean indicating if feature is enabled
 */
export async function isFeatureEnabled(name: string, userId?: string): Promise<boolean> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const flag = await getFeatureFlag(name)

    if (!flag) {
      return false
    }

    // If feature is disabled, return false
    if (!flag.enabled) {
      return false
    }

    // If user is in allowlist, return true
    if (userId && flag.allowlist && flag.allowlist.includes(userId)) {
      return true
    }

    // If percentage rollout is defined
    if (flag.percentage !== undefined) {
      // If no userId, use random chance
      if (!userId) {
        return Math.random() * 100 < flag.percentage
      }

      // Use userId for consistent experience
      const hash = await hashString(userId)
      const hashPercentage = Number.parseInt(hash.substring(0, 2), 16) % 100
      return hashPercentage < flag.percentage
    }

    // Default to enabled if no special conditions
    return true
  } catch (error) {
    logger.error(`Error checking feature flag ${name}:`, error)
    return false
  }
}

/**
 * Set or update a feature flag
 * @param flag Feature flag to set or update
 */
export async function setFeatureFlag(flag: FeatureFlag): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Prepare flag for storage
    const flagToStore = { ...flag }

    // Convert allowlist to string if it's an array
    if (Array.isArray(flagToStore.allowlist)) {
      flagToStore.allowlist = JSON.stringify(flagToStore.allowlist)
    }

    // Add timestamps
    flagToStore.updatedAt = new Date().toISOString()
    if (!flagToStore.createdAt) {
      flagToStore.createdAt = flagToStore.updatedAt
    }

    await redis.hset(`feature:${flag.name}`, flagToStore)
    logger.info(`Feature flag ${flag.name} set/updated`)
  } catch (error) {
    logger.error(`Error setting feature flag ${flag.name}:`, error)
    throw error
  }
}

/**
 * Delete a feature flag
 * @param name Feature flag name
 */
export async function deleteFeatureFlag(name: string): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    await redis.del(`feature:${name}`)
    logger.info(`Feature flag ${name} deleted`)
  } catch (error) {
    logger.error(`Error deleting feature flag ${name}:`, error)
    throw error
  }
}

/**
 * Get all feature flags
 * @returns Array of all feature flags
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get all feature flag keys
    const keys = await redis.keys("feature:*")

    // Get all feature flags
    const flags = await Promise.all(
      keys.map(async (key) => {
        const name = key.replace("feature:", "")
        return await getFeatureFlag(name)
      }),
    )

    // Filter out null values and sort by name
    return flags.filter(Boolean) as FeatureFlag[]
  } catch (error) {
    logger.error("Error getting all feature flags:", error)
    return []
  }
}

/**
 * Bulk update feature flags
 * @param flags Array of feature flags to update
 */
export async function bulkUpdateFeatureFlags(flags: FeatureFlag[]): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Use pipeline for better performance
    const pipeline = redis.pipeline()

    for (const flag of flags) {
      // Prepare flag for storage
      const flagToStore = { ...flag }

      // Convert allowlist to string if it's an array
      if (Array.isArray(flagToStore.allowlist)) {
        flagToStore.allowlist = JSON.stringify(flagToStore.allowlist)
      }

      // Add timestamps
      flagToStore.updatedAt = new Date().toISOString()
      if (!flagToStore.createdAt) {
        flagToStore.createdAt = flagToStore.updatedAt
      }

      pipeline.hset(`feature:${flag.name}`, flagToStore)
    }

    await pipeline.exec()
    logger.info(`Bulk updated ${flags.length} feature flags`)
  } catch (error) {
    logger.error("Error bulk updating feature flags:", error)
    throw error
  }
}

// Helper function to hash a string
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
