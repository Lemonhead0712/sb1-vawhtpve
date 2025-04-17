import type { AnalysisResult } from "@/lib/screenshot-analysis/types"
import { getRedisClient } from "./client"
import { logger } from "@/lib/logger"

// Prefix for analysis keys in Redis
const ANALYSIS_PREFIX = "analysis:"
// Key for the analysis history list
const ANALYSIS_HISTORY_KEY = "analysis_history"
// Maximum number of analyses to keep in history
const MAX_HISTORY_SIZE = 100

/**
 * Saves an analysis result to Redis
 * @param id Analysis ID
 * @param result Analysis result
 * @returns True if the analysis was saved successfully
 */
export async function saveAnalysis(id: string, result: AnalysisResult): Promise<boolean> {
  try {
    const redis = await getRedisClient()

    // Save the analysis result
    await redis.set(`${ANALYSIS_PREFIX}${id}`, JSON.stringify(result))

    // Add the analysis ID to the history list
    await redis.lpush(ANALYSIS_HISTORY_KEY, id)

    // Trim the history list to the maximum size
    await redis.ltrim(ANALYSIS_HISTORY_KEY, 0, MAX_HISTORY_SIZE - 1)

    logger.info(`Saved analysis ${id} to Redis`)
    return true
  } catch (error) {
    logger.error(`Error saving analysis ${id} to Redis:`, error)
    return false
  }
}

/**
 * Gets an analysis result from Redis
 * @param id Analysis ID
 * @returns Analysis result or null if not found
 */
export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  try {
    const redis = await getRedisClient()

    const result = await redis.get(`${ANALYSIS_PREFIX}${id}`)
    if (!result) {
      return null
    }

    return JSON.parse(result) as AnalysisResult
  } catch (error) {
    logger.error(`Error getting analysis ${id} from Redis:`, error)
    return null
  }
}

/**
 * Gets all analysis IDs from Redis
 * @param start Start index
 * @param end End index
 * @returns Array of analysis IDs
 */
export async function getAnalysisIds(start = 0, end = -1): Promise<string[]> {
  try {
    const redis = await getRedisClient()

    return await redis.lrange(ANALYSIS_HISTORY_KEY, start, end)
  } catch (error) {
    logger.error("Error getting analysis IDs from Redis:", error)
    return []
  }
}

/**
 * Gets all analyses from Redis
 * @param start Start index
 * @param end End index
 * @returns Array of analyses
 */
export async function getAnalyses(start = 0, end = -1): Promise<Array<{ id: string; result: AnalysisResult }>> {
  try {
    const redis = await getRedisClient()

    const ids = await redis.lrange(ANALYSIS_HISTORY_KEY, start, end)
    if (ids.length === 0) {
      return []
    }

    const keys = ids.map((id) => `${ANALYSIS_PREFIX}${id}`)
    const results = await redis.mget(...keys)

    return ids
      .map((id, index) => ({
        id,
        result: results[index] ? (JSON.parse(results[index] as string) as AnalysisResult) : null,
      }))
      .filter((item) => item.result !== null)
  } catch (error) {
    logger.error("Error getting analyses from Redis:", error)
    return []
  }
}

/**
 * Deletes an analysis from Redis
 * @param id Analysis ID
 * @returns True if the analysis was deleted successfully
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  try {
    const redis = await getRedisClient()

    // Delete the analysis result
    await redis.del(`${ANALYSIS_PREFIX}${id}`)

    // Remove the analysis ID from the history list
    await redis.lrem(ANALYSIS_HISTORY_KEY, 0, id)

    logger.info(`Deleted analysis ${id} from Redis`)
    return true
  } catch (error) {
    logger.error(`Error deleting analysis ${id} from Redis:`, error)
    return false
  }
}

/**
 * Clears all analyses from Redis
 * @returns True if all analyses were cleared successfully
 */
export async function clearAnalyses(): Promise<boolean> {
  try {
    const redis = await getRedisClient()

    const ids = await redis.lrange(ANALYSIS_HISTORY_KEY, 0, -1)
    if (ids.length === 0) {
      return true
    }

    const keys = ids.map((id) => `${ANALYSIS_PREFIX}${id}`)
    await redis.del(...keys)
    await redis.del(ANALYSIS_HISTORY_KEY)

    logger.info(`Cleared all analyses from Redis`)
    return true
  } catch (error) {
    logger.error("Error clearing analyses from Redis:", error)
    return false
  }
}
