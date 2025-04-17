import { type NextRequest, NextResponse } from "next/server"
import { generateSchemaAnalysis, exportSchemaToJsonLd } from "@/lib/schema-generator"
import { analyzeScreenshots } from "@/lib/screenshot-analysis/service"
import { logger } from "@/lib/logger"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
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

    logger.info("API: Analysis completed successfully")

    // Return both the analysis results and the schema
    return NextResponse.json({
      analysis: analysisResults,
      schema: schema,
      jsonLd: jsonLd,
    })
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
