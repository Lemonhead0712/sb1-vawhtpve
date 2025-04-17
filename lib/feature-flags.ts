import redis from "./redis"
import { logger } from "./logger"

type FeatureFlag = {
  name: string
  enabled: boolean
  description: string
  percentage?: number // For percentage rollouts (0-100)
  allowlist?: string[] // List of user IDs that have access
}

export async function getFeatureFlag(name: string): Promise<FeatureFlag | null> {
  try {
    const flag = await redis.hgetall<FeatureFlag>(`feature:${name}`)
    return flag || null
  } catch (error) {
    logger.error(`Error getting feature flag ${name}:`, error)
    return null
  }
}

export async function isFeatureEnabled(name: string, userId?: string): Promise<boolean> {
  try {
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

export async function setFeatureFlag(flag: FeatureFlag): Promise<void> {
  try {
    await redis.hset(`feature:${flag.name}`, flag)
  } catch (error) {
    logger.error(`Error setting feature flag ${flag.name}:`, error)
  }
}

export async function deleteFeatureFlag(name: string): Promise<void> {
  try {
    await redis.del(`feature:${name}`)
  } catch (error) {
    logger.error(`Error deleting feature flag ${name}:`, error)
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
