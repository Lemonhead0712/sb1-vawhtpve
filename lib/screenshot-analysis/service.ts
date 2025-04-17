/**
 * Main service for analyzing screenshots with robust OCR and fallback mechanisms
 */
import type { AnalysisResult } from "./types"
import { extractTextFromImage } from "@/lib/ocr-service"
import { analyzeScreenshot, aggregateAnalysis, findDominantTrait } from "./analyzer"
import { generateInsights, generateGoals } from "./mock-data"
import { logger } from "@/lib/logger"
import { validateAnalysisResult } from "@/lib/validation/validate"
import { generateFallbackAnalysisResult } from "@/lib/validation/fallback-data"

/**
 * Analyzes a collection of screenshots to generate relationship insights
 * @param files Screenshot image files to analyze
 * @param names Optional names of the conversation participants
 * @returns Promise with the analysis results
 */
export async function analyzeScreenshots(
  files: File[],
  names?: { userA?: string; userB?: string },
): Promise<AnalysisResult> {
  logger.info(`Analyzing ${files.length} screenshots`)

  try {
    // Extract text from each screenshot using OCR with fallback
    const screenshotPromises = files.map(async (file) => {
      try {
        // Extract text from image with OCR fallback handling
        const text = await extractTextFromImage(file)

        if (!text) {
          logger.warn(`No text extracted from file: ${file.name}`)
        }

        // Create an ImageData object for analysis
        // In a real implementation, we would load the image into a Canvas to get pixel data
        // For this mock, we're creating a simulated imageData
        const simulatedImageData = {
          width: 1200,
          height: 800,
          data: new Uint8ClampedArray(1200 * 800 * 4), // RGBA data
        } as ImageData

        // Analyze the screenshot using the extracted text
        const analysis = await analyzeScreenshot(simulatedImageData, text)
        return analysis
      } catch (error) {
        logger.error(`Error analyzing screenshot ${file.name}:`, error)
        // Return a minimal analysis to avoid breaking the flow
        return {
          messages: [],
          layout: {
            rightSideSender: "userA",
            leftSideSender: "userB",
          },
          emotionalDynamics: {
            escalation: 0,
            emotionalAlignment: 0.5,
            responseLatency: 0.5,
          },
        }
      }
    })

    // Wait for all screenshot analyses to complete
    const screenshotAnalyses = await Promise.all(screenshotPromises)

    // Aggregate the results
    const aggregated = aggregateAnalysis(screenshotAnalyses)

    // Determine dominant traits
    const userA = {
      ...aggregated.userAProfile,
      name: names?.userA || "Person 1",
      dominantEmotion: findDominantTrait(aggregated.userAProfile.emotions),
      dominantAttachment: findDominantTrait(aggregated.userAProfile.attachment),
    }

    const userB = {
      ...aggregated.userBProfile,
      name: names?.userB || "Person 2",
      dominantEmotion: findDominantTrait(aggregated.userBProfile.emotions),
      dominantAttachment: findDominantTrait(aggregated.userBProfile.attachment),
    }

    // Generate insights based on names
    const insights = generateInsights(userA.name, userB.name)

    // Generate goals
    const goals = generateGoals()

    // Calculate relationship health
    const relationshipHealth = Math.round(
      (((userA.emotions.joy + userB.emotions.joy) / 2) * 0.3 +
        ((userA.emotions.trust + userB.emotions.trust) / 2) * 0.3 +
        ((userA.attachment.secure + userB.attachment.secure) / 2) * 0.4) *
        100,
    )

    // Create the final analysis result
    const result: AnalysisResult = {
      userA,
      userB,
      communicationPatterns: generateCommunicationPatterns(userA.name, userB.name),
      relationshipHealth,
      timestamp: new Date().toISOString(),
      screenshotCount: files.length,
      screenshots: screenshotAnalyses,
      insights,
      goals,
    }

    // Validate the result
    const validation = validateAnalysisResult(result)

    if (validation.success) {
      logger.info("Analysis completed successfully")
      return validation.data
    } else {
      logger.warn("Analysis result validation failed, generating fallback data")
      return generateFallbackAnalysisResult(userA.name, userB.name)
    }
  } catch (error) {
    logger.error("Failed to analyze screenshots:", error)
    // Return fallback data when analysis fails
    return generateFallbackAnalysisResult(names?.userA || "Person 1", names?.userB || "Person 2")
  }
}

// Helper function to generate communication patterns
function generateCommunicationPatterns(userAName: string, userBName: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return months.map((month) => ({
    date: month,
    positive: Math.floor(Math.random() * 15) + 5,
    negative: Math.floor(Math.random() * 10) + 1,
  }))
}
