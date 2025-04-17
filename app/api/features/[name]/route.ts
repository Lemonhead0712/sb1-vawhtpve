import { type NextRequest, NextResponse } from "next/server"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const featureName = params.name

  if (!featureName) {
    return NextResponse.json({ error: "Feature name is required" }, { status: 400 })
  }

  // Get user ID from session if available
  const session = await getSession()
  const userId = session?.userId

  const enabled = await isFeatureEnabled(featureName, userId)

  return NextResponse.json({ name: featureName, enabled })
}
