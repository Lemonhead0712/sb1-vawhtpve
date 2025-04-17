import type { Redis } from "@upstash/redis"
import { logger } from "../logger"

// Type definitions
export type LeaderboardEntry = {
  id: string
  score: number
  data?: Record<string, any>
}

export type LeaderboardOptions = {
  ttl?: number // Time to live in seconds
  maxEntries?: number // Maximum number of entries to keep
}

// Initialize Redis client
let redis: Redis | null = null

/**
 * Initialize the Redis client for leaderboards
 * @param client Redis client instance
 */
export function initLeaderboardClient(client: Redis): void {
  redis = client
  logger.info("Leaderboard Redis client initialized")
}

/**
 * Add or update an entry in a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @param entry Entry to add or update
 * @param options Leaderboard options
 */
export async function addToLeaderboard(
  leaderboardName: string,
  entry: LeaderboardEntry,
  options?: LeaderboardOptions,
): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Add or update score in the sorted set
    await redis.zadd(leaderboardName, { score: entry.score, member: entry.id })

    // Store additional data if provided
    if (entry.data) {
      await redis.hset(`${leaderboardName}:data:${entry.id}`, entry.data)
    }

    // Set TTL if provided
    if (options?.ttl) {
      await redis.expire(leaderboardName, options.ttl)
      if (entry.data) {
        await redis.expire(`${leaderboardName}:data:${entry.id}`, options.ttl)
      }
    }

    // Trim leaderboard if maxEntries is provided
    if (options?.maxEntries) {
      const count = await redis.zcard(leaderboardName)
      if (count > options.maxEntries) {
        // Remove entries beyond the maximum
        const toRemove = count - options.maxEntries
        const entriesToRemove = await redis.zrange(leaderboardName, 0, toRemove - 1)

        // Remove from sorted set
        if (entriesToRemove.length > 0) {
          await redis.zrem(leaderboardName, ...entriesToRemove)

          // Remove associated data
          for (const id of entriesToRemove) {
            await redis.del(`${leaderboardName}:data:${id}`)
          }
        }
      }
    }

    logger.info(`Added/updated entry ${entry.id} in leaderboard ${leaderboardName}`)
  } catch (error) {
    logger.error(`Error adding to leaderboard ${leaderboardName}:`, error)
    throw error
  }
}

/**
 * Get entries from a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @param start Start index (0-based)
 * @param end End index (inclusive)
 * @param withScores Whether to include scores
 * @param withData Whether to include additional data
 * @returns Array of leaderboard entries
 */
export async function getLeaderboard(
  leaderboardName: string,
  start = 0,
  end = 9,
  withScores = true,
  withData = false,
): Promise<LeaderboardEntry[]> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get entries from the sorted set (highest to lowest)
    const entries = await redis.zrange(leaderboardName, start, end, {
      rev: true,
      withScores,
    })

    // Format the results
    const result: LeaderboardEntry[] = []

    for (let i = 0; i < entries.length; i += withScores ? 2 : 1) {
      const id = entries[i] as string
      const score = withScores ? Number(entries[i + 1]) : 0

      const entry: LeaderboardEntry = { id, score }

      // Get additional data if requested
      if (withData) {
        entry.data = await redis.hgetall(`${leaderboardName}:data:${id}`)
      }

      result.push(entry)
    }

    return result
  } catch (error) {
    logger.error(`Error getting leaderboard ${leaderboardName}:`, error)
    return []
  }
}

/**
 * Get the rank of an entry in a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @param id ID of the entry
 * @param reverse Whether to use reverse ranking (0 = highest score)
 * @returns Rank of the entry (0-based) or -1 if not found
 */
export async function getLeaderboardRank(leaderboardName: string, id: string, reverse = true): Promise<number> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const rank = reverse ? await redis.zrevrank(leaderboardName, id) : await redis.zrank(leaderboardName, id)

    return rank !== null ? rank : -1
  } catch (error) {
    logger.error(`Error getting rank in leaderboard ${leaderboardName}:`, error)
    return -1
  }
}

/**
 * Get the score of an entry in a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @param id ID of the entry
 * @returns Score of the entry or null if not found
 */
export async function getLeaderboardScore(leaderboardName: string, id: string): Promise<number | null> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const score = await redis.zscore(leaderboardName, id)
    return score !== null ? Number(score) : null
  } catch (error) {
    logger.error(`Error getting score in leaderboard ${leaderboardName}:`, error)
    return null
  }
}

/**
 * Remove an entry from a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @param id ID of the entry to remove
 */
export async function removeFromLeaderboard(leaderboardName: string, id: string): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Remove from sorted set
    await redis.zrem(leaderboardName, id)

    // Remove associated data
    await redis.del(`${leaderboardName}:data:${id}`)

    logger.info(`Removed entry ${id} from leaderboard ${leaderboardName}`)
  } catch (error) {
    logger.error(`Error removing from leaderboard ${leaderboardName}:`, error)
    throw error
  }
}

/**
 * Get the total number of entries in a leaderboard
 * @param leaderboardName Name of the leaderboard
 * @returns Number of entries
 */
export async function getLeaderboardSize(leaderboardName: string): Promise<number> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    return await redis.zcard(leaderboardName)
  } catch (error) {
    logger.error(`Error getting size of leaderboard ${leaderboardName}:`, error)
    return 0
  }
}

/**
 * Clear a leaderboard
 * @param leaderboardName Name of the leaderboard
 */
export async function clearLeaderboard(leaderboardName: string): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get all entries
    const entries = await redis.zrange(leaderboardName, 0, -1)

    // Remove the sorted set
    await redis.del(leaderboardName)

    // Remove all associated data
    for (const id of entries) {
      await redis.del(`${leaderboardName}:data:${id}`)
    }

    logger.info(`Cleared leaderboard ${leaderboardName}`)
  } catch (error) {
    logger.error(`Error clearing leaderboard ${leaderboardName}:`, error)
    throw error
  }
}
