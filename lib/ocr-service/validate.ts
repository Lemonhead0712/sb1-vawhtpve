/**
 * Validation and cleanup utilities for OCR results
 */
import { logger } from "@/lib/logger"

/**
 * Validates and cleans up OCR results
 * @param text Raw text from OCR
 * @returns Cleaned and validated text
 */
export function validateOcrResults(text: string): string {
  if (!text || typeof text !== "string") {
    logger.warn("Invalid OCR text received for validation")
    return ""
  }

  try {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, " ").trim()

    // Remove common OCR artifacts
    cleaned = cleaned.replace(/[^\w\s.,!?@#$%^&*()-+=:;"']/g, "")

    // Remove repeated punctuation (e.g., multiple periods)
    cleaned = cleaned.replace(/([.,!?]){2,}/g, "$1")

    // Try to fix common OCR errors
    const commonErrors: Record<string, string> = {
      "0": "o",
      "1": "l",
      "5": "s",
      "8": "B",
      "\u00A0": " ", // non-breaking space
      // Add more common OCR errors as needed
    }

    for (const [error, correction] of Object.entries(commonErrors)) {
      // Only replace if it seems like an error (context-based)
      const regex = new RegExp(`(?<=[a-z])${error}(?=[a-z])`, "g")
      cleaned = cleaned.replace(regex, correction)
    }

    // Fix casing issues (e.g., random capitals in the middle of words)
    cleaned = cleaned.replace(/\b[A-Z][a-z]*[A-Z]+[a-z]*\b/g, (match) => {
      // Convert to lowercase if it looks like a normal word with incorrect capitals
      if (match.length > 2 && /[A-Z]/.test(match.slice(1))) {
        return match.toLowerCase()
      }
      return match
    })

    return cleaned
  } catch (error) {
    logger.error("Error validating OCR text:", error)
    return text // Return original if validation fails
  }
}

/**
 * Validates if the OCR result contains enough meaningful text
 * @param text OCR extracted text
 * @returns True if the text appears to be meaningful
 */
export function isMeaningfulText(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false
  }

  // Remove whitespace and check length
  const trimmed = text.replace(/\s+/g, "").trim()
  if (trimmed.length < 5) {
    return false
  }

  // Check for meaningful word patterns (at least has some letters)
  const hasWords = /[a-zA-Z]{2,}/.test(text)

  // Check if it's not just random characters
  const meaningfulRatio = trimmed.match(/[a-zA-Z0-9]/) ? trimmed.match(/[a-zA-Z0-9]/g)!.length / trimmed.length : 0

  return hasWords && meaningfulRatio > 0.7
}
