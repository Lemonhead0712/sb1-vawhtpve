import { type NextRequest, NextResponse } from "next/server"
import { getFeatureFlag, setFeatureFlag } from "@/lib/feature-flags"
import redis from "@/lib/redis"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all feature flag keys
    const keys = await redis.keys("feature:*")

    // Get all feature flags
    const features = await Promise.all(
      keys.map(async (key) => {
        const name = key.replace("feature:", "")
        return await getFeatureFlag(name)
      }),
    )

    return NextResponse.json({ features: features.filter(Boolean) })
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || body.description === undefined) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    // Create feature flag
    await setFeatureFlag({
      name: body.name,
      enabled: body.enabled !== undefined ? body.enabled : true,
      description: body.description,
      percentage: body.percentage !== undefined ? body.percentage : 100,
      allowlist: body.allowlist || [],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating feature flag:", error)
    return NextResponse.json({ error: "Failed to create feature flag" }, { status: 500 })
  }
}
