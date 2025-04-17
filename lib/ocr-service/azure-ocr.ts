/**
 * OCR implementation using Azure Computer Vision API
 * This is a fallback service for when other OCR methods fail
 */
import { logger } from "@/lib/logger"
import type { OcrResult } from "./index"
import { ocrConfig } from "./config"

/**
 * Extracts text from an image using Azure Computer Vision API
 * @param imageData Image data as File or data URL
 * @returns OCR result with extracted text and confidence
 */
export async function extractTextWithAzure(imageData: File | string): Promise<OcrResult> {
  try {
    logger.info("Starting Azure Computer Vision OCR processing")

    // Get Azure configuration
    const endpoint = ocrConfig.azure.endpoint
    const apiKey = ocrConfig.azure.apiKey
    const apiVersion = ocrConfig.azure.apiVersion

    if (!endpoint || !apiKey) {
      throw new Error("Azure Computer Vision credentials not configured")
    }

    // Prepare the image data
    let imageContent: Blob | string
    let contentType: string

    if (imageData instanceof File) {
      imageContent = imageData
      contentType = imageData.type
    } else if (imageData.startsWith("data:image")) {
      // Convert data URL to blob
      const response = await fetch(imageData)
      imageContent = await response.blob()
      contentType = imageContent.type
    } else {
      throw new Error("Unsupported image format")
    }

    // First, submit the image for analysis
    const readUrl = `${endpoint}/vision/v3.2/read/analyze?language=en&model-version=latest`

    const submitResponse = await fetch(readUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: imageContent,
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      throw new Error(`Azure OCR submission error: ${submitResponse.status} ${errorText}`)
    }

    // Get the operation location from the response headers
    const operationLocation = submitResponse.headers.get("Operation-Location")
    if (!operationLocation) {
      throw new Error("Azure OCR did not return an operation location")
    }

    // Poll the operation until it's complete
    let result: any
    let isComplete = false
    let attempts = 0
    const maxAttempts = 10
    const pollingInterval = 1000 // 1 second

    while (!isComplete && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval))
      attempts++

      const resultResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      })

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text()
        throw new Error(`Azure OCR polling error: ${resultResponse.status} ${errorText}`)
      }

      result = await resultResponse.json()
      isComplete = result.status === "succeeded" || result.status === "failed"
    }

    if (result.status !== "succeeded") {
      throw new Error(`Azure OCR failed or timed out: ${result.status}`)
    }

    // Extract text from the result
    let text = ""
    let confidence = 0
    let confidenceSum = 0
    let wordCount = 0

    // Process the read results
    if (result.analyzeResult && result.analyzeResult.readResults) {
      for (const page of result.analyzeResult.readResults) {
        for (const line of page.lines || []) {
          text += line.text + "\n"

          // Calculate average word confidence
          for (const word of line.words || []) {
            if (word.confidence !== undefined) {
              confidenceSum += word.confidence
              wordCount++
            }
          }
        }
      }
    }

    // Calculate overall confidence
    confidence = wordCount > 0 ? confidenceSum / wordCount : 0.5

    logger.info(`Azure OCR completed with confidence: ${confidence}`)

    return {
      text,
      confidence,
      source: "azure",
      processingTimeMs: 0, // This will be filled by the calling function
    }
  } catch (error) {
    logger.error("Azure OCR failed:", error)
    throw new Error(`Azure OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
