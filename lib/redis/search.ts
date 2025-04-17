import type { Redis } from "@upstash/redis"
import { logger } from "../logger"

// Type definitions
export type SearchIndexOptions = {
  prefix?: string
  indexName?: string
  schema: { [key: string]: "TEXT" | "NUMERIC" | "TAG" | "GEO" }
}

export type SearchOptions = {
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
  limit?: number
  offset?: number
  filter?: string // Example: "@age:[20 30]"
  withPayloads?: boolean
  withScores?: boolean
}

export type SearchResult<T> = {
  id: string
  score: number
  value: T
}

// Initialize Redis client
let redis: Redis | null = null

/**
 * Initialize the Redis client for search operations
 * @param client Redis client instance
 */
export function initSearchClient(client: Redis): void {
  redis = client
  logger.info("Search Redis client initialized")
}

/**
 * Create a search index
 * @param options Search index options
 */
export async function createIndex(options: SearchIndexOptions): Promise<string> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const { prefix = "search", indexName = "default", schema } = options
    const indexKey = `${prefix}:${indexName}`

    // Build the schema arguments
    const schemaArgs = Object.entries(schema).flatMap(([field, type]) => ["SCHEMA", field, type])

    // Create the index
    const result = await redis.call(
      "FT.CREATE",
      indexKey,
      "PREFIX",
      "1",
      `${prefix}:`,
      "LANGUAGE",
      "english",
      "STOPWORDS",
      "0",
      ...schemaArgs,
    )

    logger.info(`Created search index ${indexKey}`)
    return result as string
  } catch (error) {
    logger.error("Error creating search index:", error)
    throw error
  }
}

/**
 * Add a document to the search index
 * @param indexName Name of the search index
 * @param docId Document ID
 * @param doc Document data
 * @param options Search index options
 */
export async function addDocument<T>(
  indexName: string,
  docId: string,
  doc: T,
  options?: SearchIndexOptions,
): Promise<string> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const { prefix = "search" } = options || {}
    const indexKey = `${prefix}:${indexName}`
    const docKey = `${prefix}:${docId}`

    // Prepare the arguments for HMSET
    const hmsetArgs = Object.entries(doc).flat()

    // Add the document to Redis
    const result = await redis.hmset(docKey, ...hmsetArgs)

    // Index the document
    // const indexResult = await redis.call("FT.ADD", indexKey, docKey, 1.0, ...hmsetArgs);

    logger.info(`Added document ${docId} to search index ${indexKey}`)
    return result
  } catch (error) {
    logger.error(`Error adding document ${docId} to search index ${indexName}:`, error)
    throw error
  }
}

/**
 * Search the index
 * @param indexName Name of the search index
 * @param query Search query
 * @param options Search options
 * @returns Array of search results
 */
export async function searchIndex<T>(
  indexName: string,
  query: string,
  options?: SearchOptions,
): Promise<SearchResult<T>[]> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const { prefix = "search", sortBy, sortOrder, limit, offset, filter, withPayloads, withScores } = options || {}
    const indexKey = `${prefix}:${indexName}`

    // Build the search arguments
    const searchArgs: string[] = [query]

    if (sortBy) {
      searchArgs.push("SORTBY", sortBy, sortOrder || "ASC")
    }

    if (limit) {
      searchArgs.push("LIMIT", offset?.toString() || "0", limit.toString())
    }

    if (filter) {
      searchArgs.push("FILTER", filter)
    }

    if (withPayloads) {
      searchArgs.push("PAYLOADS")
    }

    if (withScores) {
      searchArgs.push("WITHSCORES")
    }

    // Perform the search
    const result = await redis.call("FT.SEARCH", indexKey, ...searchArgs)

    // Parse the results
    const totalResults = result[0] as number
    const searchResults: SearchResult<T>[] = []

    for (let i = 1; i < result.length; ) {
      const id = result[i] as string
      i++

      let score = 1
      if (withScores) {
        score = result[i] as number
        i++
      }

      let value: any = {}
      if (withPayloads) {
        value = result[i]
        i++
      } else {
        // Fetch the document data
        const doc = await redis.hgetall<T>(id)
        value = doc
      }

      searchResults.push({ id, score, value })
    }

    logger.info(`Search completed in index ${indexKey} with query "${query}"`)
    return searchResults
  } catch (error) {
    logger.error(`Error searching index ${indexName} with query "${query}":`, error)
    return []
  }
}

/**
 * Delete a document from the search index
 * @param indexName Name of the search index
 * @param docId Document ID
 * @param options Search index options
 */
export async function deleteDocument(indexName: string, docId: string, options?: SearchIndexOptions): Promise<number> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const { prefix = "search" } = options || {}
    const indexKey = `${prefix}:${indexName}`
    const docKey = `${prefix}:${docId}`

    // Delete the document
    const result = await redis.del(docKey)

    logger.info(`Deleted document ${docId} from search index ${indexKey}`)
    return result
  } catch (error) {
    logger.error(`Error deleting document ${docId} from search index ${indexName}:`, error)
    throw error
  }
}

/**
 * Delete the search index
 * @param indexName Name of the search index
 * @param options Search index options
 */
export async function deleteIndex(indexName: string, options?: SearchIndexOptions): Promise<number> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const { prefix = "search" } = options || {}
    const indexKey = `${prefix}:${indexName}`

    // Delete the index
    const result = await redis.call("FT.DROPINDEX", indexKey)

    logger.info(`Deleted search index ${indexKey}`)
    return result as number
  } catch (error) {
    logger.error(`Error deleting search index ${indexName}:`, error)
    throw error
  }
}
