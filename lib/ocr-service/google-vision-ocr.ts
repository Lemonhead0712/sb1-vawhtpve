/**
 * OCR implementation using Google Vision API
 * This is a fallback service for when Tesseract fails
 */
import { logger } from "@/lib/logger"
import type { OcrResult } from "./index"
import { ocrConfig } from "./config"

/**
 * Extracts text from an image using Google Vision API
 * @param imageData Image data as File or data URL
 * @returns OCR result with extracted text and confidence
 */
export async function extractTextWithGoogleVision(imageData: File | string): Promise<OcrResult> {
  try {
    logger.info("Starting Google Vision OCR processing")

    // Convert File to base64 if needed
    let base64Image: string
    if (imageData instanceof File) {
      const arrayBuffer = await imageData.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
      base64Image = btoa(binary)
    } else if (imageData.startsWith("data:image")) {
      // Extract base64 from data URL
      base64Image = imageData.split(",")[1]
    } else {
      throw new Error("Unsupported image format")
    }

    // Prepare request to Google Vision API
    const apiKey = ocrConfig.googleVision.apiKey
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    }

    // Make API request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Vision API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Extract text from response
    let text = ""
    let confidence = 0

    // Try to get text from DOCUMENT_TEXT_DETECTION first (better for screenshots)
    if (data.responses[0].fullTextAnnotation) {
      text = data.responses[0].fullTextAnnotation.text

      // Calculate average confidence from text annotations
      if (data.responses[0].textAnnotations && data.responses[0].textAnnotations.length > 0) {
        const confidenceValues = data.responses[0].textAnnotations
          .filter((annotation: any) => annotation.confidence !== undefined)
          .map((annotation: any) => annotation.confidence)

        confidence =
          confidenceValues.length > 0
            ? confidenceValues.reduce((sum: number, val: number) => sum + val, 0) / confidenceValues.length
            : 0.5 // Default confidence if not provided
      }
    }
    // Fallback to TEXT_DETECTION
    else if (data.responses[0].textAnnotations && data.responses[0].textAnnotations.length > 0) {
      text = data.responses[0].textAnnotations[0].description
      confidence = 0.5 // Default confidence for TEXT_DETECTION
    }

    logger.info(`Google Vision OCR completed with confidence: ${confidence}`)

    return {
      text,
      confidence,
      source: "google-vision",
      processingTimeMs: 0, // This will be filled by the calling function
    }
  } catch (error) {
    logger.error("Google Vision OCR failed:", error)
    throw new Error(`Google Vision OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
