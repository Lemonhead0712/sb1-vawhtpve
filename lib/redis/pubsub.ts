import { getRedisClient, handleRedisError } from "./client"
import { logger } from "@/lib/logger"

// Map of channel to callback functions
const subscribers = new Map<string, Set<(message: any) => void>>()

// Flag to track if we're already subscribed to Redis pub/sub
let isSubscribed = false

/**
 * Initialize the pub/sub system
 */
async function initPubSub(): Promise<void> {
  if (isSubscribed) return

  try {
    const redis = await getRedisClient()

    // Subscribe to all channels that have registered callbacks
    const channels = Array.from(subscribers.keys())

    if (channels.length === 0) return

    // Note: This is a simplified implementation for Upstash Redis
    // In a real implementation with a full Redis client, you would use the subscribe method
    // and set up message handlers

    // For Upstash, we'll use polling to simulate pub/sub
    isSubscribed = true

    // Start polling for messages
    startMessagePolling()

    logger.info(`Initialized pub/sub for channels: ${channels.join(", ")}`)
  } catch (error) {
    logger.error("Failed to initialize pub/sub:", error)
    await handleRedisError(error instanceof Error ? error : new Error(String(error)))
  }
}

// Poll for messages (simulating pub/sub with Upstash)
let pollingInterval: NodeJS.Timeout | null = null

function startMessagePolling(): void {
  if (pollingInterval) return

  const POLL_INTERVAL = 1000 // 1 second

  pollingInterval = setInterval(async () => {
    try {
      const redis = await getRedisClient()
      const channels = Array.from(subscribers.keys())

      for (const channel of channels) {
        const messageKey = `pubsub:${channel}:messages`

        // Get all messages for this channel
        const messages = await redis.lrange(messageKey, 0, -1)

        if (messages.length > 0) {
          // Process messages
          for (const messageStr of messages) {
            try {
              const message = JSON.parse(messageStr)

              // Notify all subscribers
              const callbacks = subscribers.get(channel)
              if (callbacks) {
                for (const callback of callbacks) {
                  try {
                    callback(message)
                  } catch (callbackError) {
                    logger.error(`Error in pub/sub callback for channel ${channel}:`, callbackError)
                  }
                }
              }
            } catch (parseError) {
              logger.error(`Error parsing pub/sub message for channel ${channel}:`, parseError)
            }
          }

          // Clear processed messages
          await redis.del(messageKey)
        }
      }
    } catch (error) {
      logger.error("Error polling for pub/sub messages:", error)
    }
  }, POLL_INTERVAL)
}

function stopMessagePolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

/**
 * Subscribe to a channel
 * @param channel Channel name
 * @param callback Callback function to be called when a message is received
 * @returns Unsubscribe function
 */
export async function subscribe<T = any>(channel: string, callback: (message: T) => void): Promise<() => void> {
  // Add callback to subscribers map
  if (!subscribers.has(channel)) {
    subscribers.set(channel, new Set())
  }

  subscribers.get(channel)!.add(callback as any)

  // Initialize pub/sub if not already done
  await initPubSub()

  // Return unsubscribe function
  return () => {
    const callbacks = subscribers.get(channel)
    if (callbacks) {
      callbacks.delete(callback as any)

      if (callbacks.size === 0) {
        subscribers.delete(channel)
      }

      // If no more subscribers, stop polling
      if (subscribers.size === 0) {
        stopMessagePolling()
        isSubscribed = false
      }
    }
  }
}

/**
 * Publish a message to a channel
 * @param channel Channel name
 * @param message Message to publish
 * @returns Number of clients that received the message
 */
export async function publish<T = any>(channel: string, message: T): Promise<number> {
  try {
    const redis = await getRedisClient()
    const messageStr = JSON.stringify(message)
    
    // Add message to channel's message list
    const messageKey = `pubsub:${channel}:messages`
    await redis.rpush(messageKey, messageStr)
    
    // Set expiry on message list to prevent memory leaks
    await redis.expire(messageKey, 60) // 1 minute TTL
    
    // Get number of subscribers

\
Let's implement a Redis data persistence system:
