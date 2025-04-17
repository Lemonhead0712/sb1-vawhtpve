import { type NextRequest, NextResponse } from "next/server"
import { getAnalyses } from "@/lib/redis/analysis-history"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = Number.parseInt(searchParams.get("start") || "0", 10)
    const end = Number.parseInt(searchParams.get("end") || "-1", 10)

    const analyses = await getAnalyses(start, end)

    return NextResponse.json({ analyses })
  } catch (error) {
    logger.error("Error getting analyses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
