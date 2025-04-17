import { cookies } from "next/headers"
import { getCache, setCache, deleteCache } from "./redis"
import { v4 as uuidv4 } from "uuid"

// Session duration in seconds (default: 24 hours)
const SESSION_DURATION = 86400

export type SessionData = {
  userId: string
  email?: string
  name?: string
  lastActive: number
  [key: string]: any
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return null
  }

  const session = await getCache<SessionData>(`session:${sessionId}`)

  if (!session) {
    // Clear invalid session cookie
    cookieStore.delete("session_id")
    return null
  }

  // Update last active time
  session.lastActive = Date.now()
  await setCache(`session:${sessionId}`, session, SESSION_DURATION)

  return session
}

export async function createSession(data: Omit<SessionData, "lastActive">): Promise<string> {
  const sessionId = uuidv4()
  const sessionData: SessionData = {
    ...data,
    lastActive: Date.now(),
  }

  await setCache(`session:${sessionId}`, sessionData, SESSION_DURATION)

  const cookieStore = cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION,
    path: "/",
    sameSite: "lax",
  })

  return sessionId
}

export async function updateSession(data: Partial<SessionData>): Promise<boolean> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return false
  }

  const session = await getCache<SessionData>(`session:${sessionId}`)

  if (!session) {
    return false
  }

  const updatedSession: SessionData = {
    ...session,
    ...data,
    lastActive: Date.now(),
  }

  await setCache(`session:${sessionId}`, updatedSession, SESSION_DURATION)
  return true
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    await deleteCache(`session:${sessionId}`)
    cookieStore.delete("session_id")
  }
}
