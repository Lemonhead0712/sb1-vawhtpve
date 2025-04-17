import { type NextRequest, NextResponse } from "next/server"
import { generateSchemaAnalysis, exportSchemaToJsonLd } from "@/lib/schema-generator"
import { analyzeScreenshots } from "@/lib/screenshot-analysis/service"
import { logger } from "@/lib/logger"
import { createClient } from "@supabase/supabase-js"
import { getCache, setCache, checkRateLimit } from "@/lib/redis"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit: 10 requests per minute
    const rateLimit = await checkRateLimit(`analyze:${ip}`, 10, 60)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        },
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const userA = formData.get("userA") as string
    const userB = formData.get("userB") as string
    const userId = (formData.get("userId") as string) || "anonymous"

    if (!files || files.length === 0) {
      logger.warn("API request missing files")
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    logger.info(`API: Analyzing ${files.length} screenshots for ${userA} and ${userB}`)

    // Generate a cache key based on the files and names
    const fileHashes = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      }),
    )

    const cacheKey = `analysis:${userA}:${userB}:${fileHashes.join("-")}`

    // Try to get cached results first
    const cachedResults = await getCache<any>(cacheKey)

    if (cachedResults) {
      logger.info("API: Returning cached analysis results")
      return NextResponse.json({
        analysis: cachedResults,
        schema: generateSchemaAnalysis(cachedResults),
        jsonLd: exportSchemaToJsonLd(generateSchemaAnalysis(cachedResults)),
        cached: true,
      })
    }

    // Store the analysis request in Supabase
    const { data: analysisRecord, error: insertError } = await supabase
      .from("analysis_requests")
      .insert({
        user_id: userId,
        person_a_name: userA,
        person_b_name: userB,
        screenshot_count: files.length,
        status: "processing",
      })
      .select()
      .single()

    if (insertError) {
      logger.error("Error storing analysis request:", insertError)
      // Continue with analysis even if DB storage fails
    }

    // Analyze screenshots with improved OCR and fallback mechanisms
    const analysisResults = await analyzeScreenshots(files, { userA, userB })

    // Generate schema.org compatible JSON-LD
    const schema = generateSchemaAnalysis(analysisResults)
    const jsonLd = exportSchemaToJsonLd(schema)

    // Update the analysis record with results if we have an ID
    if (analysisRecord?.id) {
      const { error: updateError } = await supabase
        .from("analysis_requests")
        .update({
          status: "completed",
          results: analysisResults,
          completed_at: new Date().toISOString(),
        })
        .eq("id", analysisRecord.id)

      if (updateError) {
        logger.error("Error updating analysis record:", updateError)
      }
    }

    // Cache the results for 24 hours
    await setCache(cacheKey, analysisResults, 86400)

    logger.info("API: Analysis completed successfully")

    // Return both the analysis results and the schema
    return NextResponse.json(
      {
        analysis: analysisResults,
        schema: schema,
        jsonLd: jsonLd,
        cached: false,
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset.toString(),
        },
      },
    )
  } catch (error) {
    logger.error("Error in analysis API:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze screenshots",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
