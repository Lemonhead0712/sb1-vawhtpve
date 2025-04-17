import { type NextRequest, NextResponse } from "next/server"
import { getAnalysis } from "@/lib/redis/analysis-history"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const analysis = await getAnalysis(id)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    logger.error("Error getting analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
