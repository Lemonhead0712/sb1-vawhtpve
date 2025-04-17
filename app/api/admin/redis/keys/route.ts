import { NextResponse } from "next/server"
import redis from "@/lib/redis"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all keys (with pagination for large datasets)
    const keys = await redis.keys("*")

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("Error fetching Redis keys:", error)
    return NextResponse.json({ error: "Failed to fetch Redis keys" }, { status: 500 })
  }
}
