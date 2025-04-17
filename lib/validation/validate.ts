import { z } from "zod"
import { analysisResultSchema, analysisPageDataSchema } from "./analysis-schema"

/**
 * Validates and sanitizes analysis results against the schema
 * @param data The data to validate
 * @returns The validated and sanitized data, or null if validation fails
 */
export function validateAnalysisResult(data: unknown): {
  success: boolean
  data: any
  errors?: z.ZodError
} {
  try {
    // Parse and validate the data against the schema
    const validatedData = analysisResultSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.format())
      return { success: false, data: null, errors: error }
    }
    console.error("Unknown validation error:", error)
    return { success: false, data: null }
  }
}

/**
 * Validates and sanitizes analysis page data against the schema
 * @param data The data to validate
 * @returns The validated and sanitized data, or null if validation fails
 */
export function validateAnalysisPageData(data: unknown): {
  success: boolean
  data: any
  errors?: z.ZodError
} {
  try {
    // First try to parse with strict validation
    const validatedData = analysisPageDataSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.format())

      // If validation fails, try to salvage the data by transforming it
      try {
        // Create a copy of the data to modify
        const transformedData = { ...data } as any

        // If communicationPatterns is causing issues, transform it
        if (transformedData.communicationPatterns) {
          transformedData.communicationPatterns = transformedData.communicationPatterns.map((pattern: any) => {
            // If it's already a string, return it
            if (typeof pattern === "string") return pattern

            // If it's an object without a text property, add one
            if (typeof pattern === "object" && pattern !== null) {
              if (!pattern.text) {
                // Try to create a text property from other properties
                if (pattern.date && (pattern.positive !== undefined || pattern.negative !== undefined)) {
                  pattern.text = `On ${pattern.date}: Positive ${pattern.positive}, Negative ${pattern.negative}`
                } else {
                  pattern.text = "Communication pattern"
                }
              }
            }
            return pattern
          })
        }

        // If recommendations is causing issues, transform it
        if (transformedData.recommendations) {
          transformedData.recommendations = transformedData.recommendations.map((recommendation: any) => {
            // If it's already a string, return it
            if (typeof recommendation === "string") return recommendation

            // If it's an object without a text property, add one
            if (typeof recommendation === "object" && recommendation !== null) {
              if (!recommendation.text) {
                recommendation.text = "Recommendation"
              }
            }
            return recommendation
          })
        }

        // Try to validate the transformed data
        const salvaged = analysisPageDataSchema.parse(transformedData)
        console.log("Data salvaged after transformation")
        return { success: true, data: salvaged }
      } catch (transformError) {
        console.error("Failed to salvage data after transformation:", transformError)

        // If all else fails, return default values
        const defaultData = analysisPageDataSchema.parse({})
        return {
          success: false,
          data: defaultData,
          errors: error,
        }
      }
    }

    console.error("Unknown validation error:", error)
    const defaultData = analysisPageDataSchema.parse({})
    return { success: false, data: defaultData }
  }
}

/**
 * Safely validates data against a schema, returning default values if validation fails
 * @param data The data to validate
 * @param schema The schema to validate against
 * @returns The validated data or default values
 */
export function safeValidate<T extends z.ZodType>(data: unknown, schema: T): z.infer<T> {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("Validation error, using defaults:", error.format())
    }
    return schema.default ? schema.default() : ({} as z.infer<T>)
  }
}
