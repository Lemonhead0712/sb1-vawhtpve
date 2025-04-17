import { type NextRequest, NextResponse } from "next/server"
import { getFeatureFlag, setFeatureFlag, deleteFeatureFlag } from "@/lib/feature-flags"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name)
    const flag = await getFeatureFlag(name)

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 })
    }

    return NextResponse.json(flag)
  } catch (error) {
    console.error("Error fetching feature flag:", error)
    return NextResponse.json({ error: "Failed to fetch feature flag" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const name = decodeURIComponent(params.name)
    const body = await request.json()

    // Get existing flag
    const existingFlag = await getFeatureFlag(name)

    if (!existingFlag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 })
    }

    // Update flag
    await setFeatureFlag({
      ...existingFlag,
      ...body,
      name, // Ensure name doesn't change
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating feature flag:", error)
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const name = decodeURIComponent(params.name)
    await deleteFeatureFlag(name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feature flag:", error)
    return NextResponse.json({ error: "Failed to delete feature flag" }, { status: 500 })
  }
}
