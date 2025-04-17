/**
 * Configuration for OCR services
 */

export const ocrConfig = {
  // General OCR settings
  maxRetries: 2,
  fallbackThreshold: 0.3, // Minimum confidence threshold to accept a result
  timeout: 30000, // 30 second timeout

  // Tesseract.js settings
  tesseract: {
    enabled: true,
    languages: ["eng"],
    workerPath: "https://unpkg.com/tesseract.js-core@2.2.0/tesseract-core.wasm.js",
    corePath: "https://unpkg.com/tesseract.js-core@2.2.0/tesseract-core.wasm",
    logger: (message: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(message)
      }
    },
  },

  // Google Vision settings
  googleVision: {
    enabled: true, // Enable Google Vision since we have the API key
    apiKey: process.env.GOOGLE_VISION_API_KEY || "",
    features: ["TEXT_DETECTION", "DOCUMENT_TEXT_DETECTION"],
  },

  // Azure settings
  azure: {
    enabled: true, // Enable Azure since we have the credentials
    endpoint: process.env.AZURE_VISION_ENDPOINT || "",
    apiKey: process.env.AZURE_VISION_KEY || "",
    apiVersion: "2.0",
  },

  // OpenCV settings
  opencv: {
    enabled: true,
    preprocessingSteps: ["grayscale", "thresholding", "noise_removal", "deskew"],
  },
}
