/**
 * Main OCR service entry point that orchestrates the OCR process with fallback mechanisms
 */
import { extractTextWithTesseract } from "./tesseract-ocr"
import { extractTextWithGoogleVision } from "./google-vision-ocr"
import { extractTextWithAzure } from "./azure-ocr"
import { extractTextWithOpenCV } from "./opencv-ocr"
import { validateOcrResults, isMeaningfulText } from "./validate"
import { generateFallbackText } from "./fallback-generator"
import { logger } from "@/lib/logger"
import { ocrConfig } from "./config"

export type OcrResult = {
  text: string
  confidence: number
  source: string
  processingTimeMs: number
  error?: string
}

type OcrOptions = {
  maxRetries?: number
  fallbackThreshold?: number
  timeout?: number
}

/**
 * Processes an image through multiple OCR engines with fallback logic
 * @param imageData The image data to process (file or data URL)
 * @param options Configuration options for OCR processing
 * @returns The OCR result with the extracted text
 */
export async function processImageWithOcr(imageData: File | string, options: OcrOptions = {}): Promise<OcrResult> {
  const {
    maxRetries = ocrConfig.maxRetries,
    fallbackThreshold = ocrConfig.fallbackThreshold,
    timeout = ocrConfig.timeout,
  } = options

  // Track the attempts and providers used
  const attempts: OcrResult[] = []

  // Primary OCR service (Tesseract.js)
  if (ocrConfig.tesseract.enabled) {
    try {
      logger.info("Starting OCR processing with primary service (Tesseract)")
      const startTime = performance.now()

      // Attempt with primary service with timeout
      const primaryResult = (await Promise.race([
        extractTextWithTesseract(imageData),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("OCR processing timed out")), timeout)),
      ])) as OcrResult

      // Add performance metrics
      primaryResult.processingTimeMs = performance.now() - startTime
      attempts.push(primaryResult)

      // If primary service returns good results, return them
      if (primaryResult.confidence >= fallbackThreshold && isMeaningfulText(primaryResult.text)) {
        logger.info(`Primary OCR successful (confidence: ${primaryResult.confidence})`)
        return primaryResult
      }

      // If confidence is too low, continue to fallbacks
      logger.warn(`Primary OCR below confidence threshold: ${primaryResult.confidence}`)
    } catch (error) {
      logger.error("Primary OCR service failed:", error)
      attempts.push({
        text: "",
        confidence: 0,
        source: "tesseract",
        processingTimeMs: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Create a list of enabled fallback services
  const fallbackServices = [
    {
      name: "google-vision",
      fn: extractTextWithGoogleVision,
      enabled: ocrConfig.googleVision.enabled && !!ocrConfig.googleVision.apiKey,
    },
    {
      name: "azure",
      fn: extractTextWithAzure,
      enabled: ocrConfig.azure.enabled && !!ocrConfig.azure.endpoint && !!ocrConfig.azure.apiKey,
    },
    {
      name: "opencv",
      fn: extractTextWithOpenCV,
      enabled: ocrConfig.opencv.enabled,
    },
  ].filter((service) => service.enabled)

  // Try fallback services in sequence
  for (const service of fallbackServices) {
    if (attempts.length >= maxRetries + 1) break // +1 for the primary attempt

    try {
      logger.info(`Attempting fallback OCR with ${service.name}`)
      const startTime = performance.now()

      // Attempt with fallback service with timeout
      const fallbackResult = (await Promise.race([
        service.fn(imageData),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("OCR processing timed out")), timeout)),
      ])) as OcrResult

      // Add performance metrics
      fallbackResult.processingTimeMs = performance.now() - startTime
      attempts.push(fallbackResult)

      // If fallback returns good results, return them
      if (fallbackResult.confidence >= fallbackThreshold && isMeaningfulText(fallbackResult.text)) {
        logger.info(`Fallback OCR (${service.name}) successful (confidence: ${fallbackResult.confidence})`)
        return fallbackResult
      }

      logger.warn(`Fallback OCR (${service.name}) below confidence threshold: ${fallbackResult.confidence}`)
    } catch (error) {
      logger.error(`Fallback OCR service (${service.name}) failed:`, error)
      attempts.push({
        text: "",
        confidence: 0,
        source: service.name,
        processingTimeMs: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // If we reach here, all OCR attempts failed or had low confidence
  // Find the best result among the attempts
  const bestAttempt = attempts.reduce((best, current) => (current.confidence > best.confidence ? current : best), {
    text: "",
    confidence: 0,
    source: "none",
    processingTimeMs: 0,
  })

  // If we have any text, validate and return it even if confidence is low
  if (bestAttempt.text.trim()) {
    logger.warn("All OCR attempts had low confidence. Using best available result.")
    // Run validation to clean up the result
    const validatedText = validateOcrResults(bestAttempt.text)
    return {
      ...bestAttempt,
      text: validatedText,
      confidence: Math.max(bestAttempt.confidence, 0.1), // Ensure minimal confidence
    }
  }

  // Last resort: Generate fallback text
  logger.error("All OCR attempts failed. Using fallback text generation.")
  const fallbackText = generateFallbackText(imageData)
  return {
    text: fallbackText,
    confidence: 0.1, // Low confidence to indicate this is fallback
    source: "fallback-generator",
    processingTimeMs: 0,
  }
}

/**
 * Simplified function for extracting text from an image
 * This is the main function that should be used by other parts of the application
 */
export async function extractTextFromImage(image: File | string): Promise<string> {
  try {
    const result = await processImageWithOcr(image)
    return result.text
  } catch (error) {
    logger.error("Failed to extract text from image:", error)
    return "" // Return empty string on failure
  }
}
