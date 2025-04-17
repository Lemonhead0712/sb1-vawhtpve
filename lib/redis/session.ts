import { cookies } from "next/headers"
import { getCache, setCache, deleteCache } from "./cache"
import { v4 as uuidv4 } from "uuid"
import { logger } from "@/lib/logger"

// Session duration in seconds (default: 24 hours)
const SESSION_DURATION = 86400

// Session cookie name
const SESSION_COOKIE_NAME = "session_id"

// Session prefix for Redis keys
const SESSION_PREFIX = "session:"

export type SessionData = {
  userId: string
  email?: string
  name?: string
  isAdmin?: boolean
  lastActive: number
  [key: string]: any
}

/**
 * Get the current session data
 * @returns Session data or null if no session exists
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const session = await getCache<SessionData>(`${SESSION_PREFIX}${sessionId}`)

  if (!session) {
    // Clear invalid session cookie
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  // Update last active time
  session.lastActive = Date.now()
  await setCache(`${SESSION_PREFIX}${sessionId}`, session, SESSION_DURATION)

  return session
}

/**
 * Create a new session
 * @param data Session data
 * @param options Session options
 * @returns Session ID
 */
export async function createSession(
  data: Omit<SessionData, "lastActive">,
  options: {
    duration?: number
    secure?: boolean
    sameSite?: "strict" | "lax" | "none"
  } = {},
): Promise<string> {
  const sessionId = uuidv4()
  const sessionData: SessionData = {
    ...data,
    lastActive: Date.now(),
  }

  const duration = options.duration || SESSION_DURATION

  await setCache(`${SESSION_PREFIX}${sessionId}`, sessionData, duration)

  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    maxAge: duration,
    path: "/",
    sameSite: options.sameSite || "lax",
  })

  logger.debug(`Created session for user ${data.userId}`)
  return sessionId
}

/**
 * Update an existing session
 * @param data Partial session data to update
 * @returns True if the session was updated, false otherwise
 */
export async function updateSession(data: Partial<SessionData>): Promise<boolean> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return false
  }

  const session = await getCache<SessionData>(`${SESSION_PREFIX}${sessionId}`)

  if (!session) {
    return false
  }

  const updatedSession: SessionData = {
    ...session,
    ...data,
    lastActive: Date.now(),
  }

  await setCache(`${SESSION_PREFIX}${sessionId}`, updatedSession, SESSION_DURATION)
  logger.debug(`Updated session for user ${session.userId}`)
  return true
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await deleteCache(`${SESSION_PREFIX}${sessionId}`)
    cookieStore.delete(SESSION_COOKIE_NAME)
    logger.debug("Session destroyed")
  }
}

/**
 * Get all active sessions
 * @returns Array of session IDs and their data
 */
export async function getAllSessions(): Promise<{ id: string; data: SessionData }[]> {
  try {
    const redis = (await import("./client")).getRedisClient()
    const client = await redis

    const keys = await client.keys(`${SESSION_PREFIX}*`)
    if (keys.length === 0) return []

    const sessions = await client.mget(...keys)

    return keys
      .map((key, index) => ({
        id: key.replace(SESSION_PREFIX, ""),
        data: sessions[index] as SessionData,
      }))
      .filter((session) => session.data !== null)
  } catch (error) {
    logger.error("Error fetching all sessions:", error)
    return []
  }
}

/**
 * Delete a specific session by ID
 * @param sessionId Session ID
 * @returns True if the session was deleted, false otherwise
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await deleteCache(`${SESSION_PREFIX}${sessionId}`)
    logger.debug(`Deleted session ${sessionId}`)
    return true
  } catch (error) {
    logger.error(`Error deleting session ${sessionId}:`, error)
    return false
  }
}

/**
 * Clean up expired sessions
 * @param maxAge Maximum session age in seconds
 * @returns Number of sessions cleaned up
 */
export async function cleanupSessions(maxAge: number = SESSION_DURATION): Promise<number> {
  try {
    const sessions = await getAllSessions()
    const now = Date.now()
    const expiredSessions = sessions.filter((session) => now - session.data.lastActive > maxAge * 1000)

    for (const session of expiredSessions) {
      await deleteSession(session.id)
    }

    logger.info(`Cleaned up ${expiredSessions.length} expired sessions`)
    return expiredSessions.length
  } catch (error) {
    logger.error("Error cleaning up sessions:", error)
    return 0
  }
}
