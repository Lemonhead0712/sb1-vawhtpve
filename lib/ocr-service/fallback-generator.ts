/**
 * Fallback text generator for when all OCR methods fail
 * This is the last resort fallback when no OCR service returns usable text
 */
import { logger } from "@/lib/logger"

/**
 * Analyzes an image visually to generate fallback text metadata
 * This doesn't actually extract text but provides metadata about the image
 * @param imageData Image data as File or data URL
 * @returns Fallback description of the image
 */
export function generateFallbackText(imageData: File | string): string {
  logger.info("Generating fallback text")

  try {
    // In a real implementation, you would analyze the image to determine:
    // - If there are text-like regions
    // - Detect UI elements like message bubbles
    // - Estimate the number of text blocks

    // Get file information if available
    let fileInfo = ""
    if (imageData instanceof File) {
      fileInfo = `[Image: ${imageData.name}, Size: ${Math.round(imageData.size / 1024)} KB, Type: ${imageData.type}]`
    } else {
      fileInfo = "[Image data provided as URL]"
    }

    // Generate a helpful fallback message
    return `The system was unable to extract text from this image. ${fileInfo} 
    
This appears to be a screenshot that may contain conversation text. For best results, please:
- Ensure the image is not compressed or blurry
- Try cropping the image to focus on text areas
- If possible, provide a higher resolution screenshot
    
The emotional analysis system will proceed using visual patterns and message structure to provide limited insights.`
  } catch (error) {
    logger.error("Error generating fallback text:", error)
    return "Unable to process this image. Please try a different screenshot."
  }
}
