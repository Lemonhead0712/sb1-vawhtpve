import { type NextRequest, NextResponse } from "next/server"
import { deleteAnalysis } from "@/lib/redis/analysis-history"
import { logger } from "@/lib/logger"

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const success = await deleteAnalysis(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error deleting analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
