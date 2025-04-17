import type { Redis } from "@upstash/redis"
import { logger } from "../logger"

// Type definitions
export type QueueJob = {
  id: string
  type: string
  data: Record<string, any>
  priority?: number
  createdAt: string
  status: "pending" | "processing" | "completed" | "failed"
  attempts?: number
  maxAttempts?: number
  result?: any
  error?: string
}

export type QueueOptions = {
  maxJobs?: number
  jobTTL?: number // Time to live in seconds
}

// Initialize Redis client
let redis: Redis | null = null

/**
 * Initialize the Redis client for queues
 * @param client Redis client instance
 */
export function initQueueClient(client: Redis): void {
  redis = client
  logger.info("Queue Redis client initialized")
}

/**
 * Add a job to a queue
 * @param queueName Name of the queue
 * @param job Job to add
 * @param options Queue options
 * @returns Job ID
 */
export async function addToQueue(
  queueName: string,
  job: Omit<QueueJob, "id" | "createdAt" | "status">,
  options?: QueueOptions,
): Promise<string> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Generate job ID if not provided
    const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Create the job object
    const newJob: QueueJob = {
      ...job,
      id: jobId,
      createdAt: new Date().toISOString(),
      status: "pending",
      attempts: 0,
      maxAttempts: job.maxAttempts || 3,
      priority: job.priority || 0,
    }

    // Store the job data
    await redis.hset(`${queueName}:jobs:${jobId}`, newJob)

    // Add to the queue (sorted set) with priority as score
    await redis.zadd(`${queueName}:pending`, { score: newJob.priority || 0, member: jobId })

    // Set TTL if provided
    if (options?.jobTTL) {
      await redis.expire(`${queueName}:jobs:${jobId}`, options.jobTTL)
    }

    // Trim queue if maxJobs is provided
    if (options?.maxJobs) {
      const count = await redis.zcard(`${queueName}:pending`)
      if (count > options.maxJobs) {
        // Remove oldest jobs beyond the maximum
        const toRemove = count - options.maxJobs
        const jobsToRemove = await redis.zrange(`${queueName}:pending`, 0, toRemove - 1)

        // Remove from queue
        if (jobsToRemove.length > 0) {
          await redis.zrem(`${queueName}:pending`, ...jobsToRemove)

          // Remove job data
          for (const id of jobsToRemove) {
            await redis.del(`${queueName}:jobs:${id}`)
          }
        }
      }
    }

    logger.info(`Added job ${jobId} to queue ${queueName}`)
    return jobId
  } catch (error) {
    logger.error(`Error adding job to queue ${queueName}:`, error)
    throw error
  }
}

/**
 * Get the next job from a queue
 * @param queueName Name of the queue
 * @returns Next job or null if queue is empty
 */
export async function getNextJob(queueName: string): Promise<QueueJob | null> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get the highest priority job (lowest score)
    const jobs = await redis.zrange(`${queueName}:pending`, 0, 0)

    if (!jobs.length) {
      return null
    }

    const jobId = jobs[0]

    // Get the job data
    const job = await redis.hgetall<QueueJob>(`${queueName}:jobs:${jobId}`)

    if (!job) {
      // Job data not found, remove from queue
      await redis.zrem(`${queueName}:pending`, jobId)
      return null
    }

    // Update job status to processing
    job.status = "processing"
    job.attempts = (job.attempts || 0) + 1

    await redis.hset(`${queueName}:jobs:${jobId}`, job)

    // Move from pending to processing queue
    await redis.zrem(`${queueName}:pending`, jobId)
    await redis.zadd(`${queueName}:processing`, { score: Date.now(), member: jobId })

    return job
  } catch (error) {
    logger.error(`Error getting next job from queue ${queueName}:`, error)
    return null
  }
}

/**
 * Complete a job
 * @param queueName Name of the queue
 * @param jobId ID of the job
 * @param result Result of the job
 */
export async function completeJob(queueName: string, jobId: string, result?: any): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get the job data
    const job = await redis.hgetall<QueueJob>(`${queueName}:jobs:${jobId}`)

    if (!job) {
      logger.warn(`Job ${jobId} not found in queue ${queueName}`)
      return
    }

    // Update job status
    job.status = "completed"
    job.result = result

    await redis.hset(`${queueName}:jobs:${jobId}`, job)

    // Move from processing to completed queue
    await redis.zrem(`${queueName}:processing`, jobId)
    await redis.zadd(`${queueName}:completed`, { score: Date.now(), member: jobId })

    logger.info(`Completed job ${jobId} in queue ${queueName}`)
  } catch (error) {
    logger.error(`Error completing job ${jobId} in queue ${queueName}:`, error)
    throw error
  }
}

/**
 * Fail a job
 * @param queueName Name of the queue
 * @param jobId ID of the job
 * @param error Error message
 */
export async function failJob(queueName: string, jobId: string, error: string): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get the job data
    const job = await redis.hgetall<QueueJob>(`${queueName}:jobs:${jobId}`)

    if (!job) {
      logger.warn(`Job ${jobId} not found in queue ${queueName}`)
      return
    }

    // Update job status
    job.status = "failed"
    job.error = error

    await redis.hset(`${queueName}:jobs:${jobId}`, job)

    // Check if job should be retried
    if ((job.attempts || 0) < (job.maxAttempts || 3)) {
      // Move back to pending queue with increased priority (lower score)
      await redis.zrem(`${queueName}:processing`, jobId)
      await redis.zadd(`${queueName}:pending`, { score: (job.priority || 0) - 1, member: jobId })

      logger.info(`Retrying job ${jobId} in queue ${queueName} (attempt ${job.attempts}/${job.maxAttempts})`)
    } else {
      // Move to failed queue
      await redis.zrem(`${queueName}:processing`, jobId)
      await redis.zadd(`${queueName}:failed`, { score: Date.now(), member: jobId })

      logger.info(`Failed job ${jobId} in queue ${queueName} after ${job.attempts} attempts`)
    }
  } catch (error) {
    logger.error(`Error failing job ${jobId} in queue ${queueName}:`, error)
    throw error
  }
}

/**
 * Get a job by ID
 * @param queueName Name of the queue
 * @param jobId ID of the job
 * @returns Job or null if not found
 */
export async function getJob(queueName: string, jobId: string): Promise<QueueJob | null> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    return await redis.hgetall<QueueJob>(`${queueName}:jobs:${jobId}`)
  } catch (error) {
    logger.error(`Error getting job ${jobId} from queue ${queueName}:`, error)
    return null
  }
}

/**
 * Get jobs from a queue by status
 * @param queueName Name of the queue
 * @param status Status of the jobs to get
 * @param start Start index
 * @param end End index
 * @returns Array of jobs
 */
export async function getJobsByStatus(
  queueName: string,
  status: "pending" | "processing" | "completed" | "failed",
  start = 0,
  end = 9,
): Promise<QueueJob[]> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    // Get job IDs from the appropriate queue
    const jobIds = await redis.zrange(`${queueName}:${status}`, start, end)

    // Get job data for each ID
    const jobs = await Promise.all(
      jobIds.map(async (jobId) => {
        return await redis.hgetall<QueueJob>(`${queueName}:jobs:${jobId}`)
      }),
    )

    // Filter out null values
    return jobs.filter(Boolean) as QueueJob[]
  } catch (error) {
    logger.error(`Error getting ${status} jobs from queue ${queueName}:`, error)
    return []
  }
}

/**
 * Clear a queue
 * @param queueName Name of the queue
 * @param status Optional status to clear (all statuses if not provided)
 */
export async function clearQueue(
  queueName: string,
  status?: "pending" | "processing" | "completed" | "failed",
): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const statuses = status ? [status] : ["pending", "processing", "completed", "failed"]

    for (const s of statuses) {
      // Get all job IDs
      const jobIds = await redis.zrange(`${queueName}:${s}`, 0, -1)

      // Delete the queue
      await redis.del(`${queueName}:${s}`)

      // Delete all job data
      for (const jobId of jobIds) {
        await redis.del(`${queueName}:jobs:${jobId}`)
      }
    }

    logger.info(`Cleared queue ${queueName}${status ? ` (${status})` : ""}`)
  } catch (error) {
    logger.error(`Error clearing queue ${queueName}:`, error)
    throw error
  }
}

/**
 * Get queue statistics
 * @param queueName Name of the queue
 * @returns Queue statistics
 */
export async function getQueueStats(queueName: string): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
}> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized")
    }

    const [pending, processing, completed, failed] = await Promise.all([
      redis.zcard(`${queueName}:pending`),
      redis.zcard(`${queueName}:processing`),
      redis.zcard(`${queueName}:completed`),
      redis.zcard(`${queueName}:failed`),
    ])

    return { pending, processing, completed, failed }
  } catch (error) {
    logger.error(`Error getting stats for queue ${queueName}:`, error)
    return { pending: 0, processing: 0, completed: 0, failed: 0 }
  }
}
