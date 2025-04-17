import { type NextRequest, NextResponse } from "next/server"
import { saveAnalysis } from "@/lib/redis/analysis-history"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, result } = body

    if (!id || !result) {
      return NextResponse.json({ error: "Missing id or result" }, { status: 400 })
    }

    const success = await saveAnalysis(id, result)

    if (!success) {
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    logger.error("Error saving analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
