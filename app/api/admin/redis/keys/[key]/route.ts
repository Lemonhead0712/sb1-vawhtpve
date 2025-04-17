import { type NextRequest, NextResponse } from "next/server"
import redis from "@/lib/redis"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const key = decodeURIComponent(params.key)
    const value = await redis.get(key)

    return NextResponse.json({ key, value })
  } catch (error) {
    console.error("Error fetching Redis key value:", error)
    return NextResponse.json({ error: "Failed to fetch Redis key value" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const key = decodeURIComponent(params.key)
    await redis.del(key)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting Redis key:", error)
    return NextResponse.json({ error: "Failed to delete Redis key" }, { status: 500 })
  }
}
