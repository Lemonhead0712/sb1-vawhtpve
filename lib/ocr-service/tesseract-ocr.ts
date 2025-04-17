/**
 * OCR implementation using Tesseract.js
 */
import { createWorker } from "tesseract.js"
import { logger } from "@/lib/logger"
import type { OcrResult } from "./index"

/**
 * Extracts text from an image using Tesseract.js
 * @param imageData Image data as File or data URL
 * @returns OCR result with extracted text and confidence
 */
export async function extractTextWithTesseract(imageData: File | string): Promise<OcrResult> {
  try {
    logger.info("Starting Tesseract OCR processing")

    // Create and initialize the Tesseract worker
    const worker = await createWorker("eng")

    // Convert File to image URL if needed
    const imageUrl = imageData instanceof File ? URL.createObjectURL(imageData) : imageData

    // Process the image
    const result = await worker.recognize(imageUrl)

    // Clean up if we created a object URL
    if (imageData instanceof File) {
      URL.revokeObjectURL(imageUrl)
    }

    // Terminate the worker
    await worker.terminate()

    // Calculate confidence - Tesseract provides confidence per word,
    // so we'll average them for an overall score
    let overallConfidence = 0
    if (result.data.words && result.data.words.length > 0) {
      const totalConfidence = result.data.words.reduce((sum, word) => sum + (word.confidence || 0), 0)
      overallConfidence = totalConfidence / result.data.words.length / 100 // Normalize to 0-1
    }

    logger.info(`Tesseract OCR completed with confidence: ${overallConfidence}`)

    return {
      text: result.data.text,
      confidence: overallConfidence,
      source: "tesseract",
      processingTimeMs: 0, // This will be filled in by the calling function
    }
  } catch (error) {
    logger.error("Tesseract OCR failed:", error)
    throw new Error(`Tesseract OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
