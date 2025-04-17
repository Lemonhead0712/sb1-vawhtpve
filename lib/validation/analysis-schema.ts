import { z } from "zod"

// Define schemas for nested objects
const emotionScoreSchema = z.object({
  joy: z.number().min(0).max(1).default(0),
  sadness: z.number().min(0).max(1).default(0),
  anger: z.number().min(0).max(1).default(0),
  fear: z.number().min(0).max(1).default(0),
  surprise: z.number().min(0).max(1).default(0),
  disgust: z.number().min(0).max(1).default(0),
  trust: z.number().min(0).max(1).default(0),
  anticipation: z.number().min(0).max(1).default(0),
})

const attachmentStyleSchema = z.object({
  secure: z.number().min(0).max(1).default(0),
  anxious: z.number().min(0).max(1).default(0),
  avoidant: z.number().min(0).max(1).default(0),
  disorganized: z.number().min(0).max(1).default(0),
})

const gottmanMetricsSchema = z.object({
  harshStartup: z.number().min(0).max(1).default(0),
  fourHorsemen: z.number().min(0).max(1).default(0),
  flooding: z.number().min(0).max(1).default(0),
  bodyLanguage: z.number().min(0).max(1).default(0),
  failedRepairAttempts: z.number().min(0).max(1).default(0),
  badMemories: z.number().min(0).max(1).default(0),
})

const communicationStyleSchema = z.object({
  expressiveness: z.number().min(0).max(1).default(0),
  emotionalRegulation: z.number().min(0).max(1).default(0),
  defensiveness: z.number().min(0).max(1).default(0),
  empathy: z.number().min(0).max(1).default(0),
})

const personProfileSchema = z.object({
  name: z.string().default(""),
  emotions: emotionScoreSchema.default({}),
  attachment: attachmentStyleSchema.default({}),
  gottman: gottmanMetricsSchema.default({}),
  dominantEmotion: z.string().default("neutral"),
  dominantAttachment: z.string().default("secure"),
  communicationStyle: communicationStyleSchema.default({}),
})

// Updated to match the actual data structure
const communicationPatternSchema = z.object({
  date: z.string(),
  positive: z.number().min(0).default(0),
  negative: z.number().min(0).default(0),
})

const messageSchema = z.object({
  text: z.string(),
  emojis: z.array(z.string()).default([]),
  sender: z.enum(["userA", "userB"]),
  emotionalTone: z.string(),
  intensity: z.number().min(0).max(1),
  hasExcessivePunctuation: z.boolean().default(false),
  hasAllCaps: z.boolean().default(false),
  timestamp: z.date().optional(),
})

const screenshotAnalysisSchema = z.object({
  messages: z.array(messageSchema).default([]),
  layout: z.object({
    rightSideSender: z.enum(["userA", "userB"]),
    leftSideSender: z.enum(["userA", "userB"]),
  }),
  emotionalDynamics: z.object({
    escalation: z.number().min(-1).max(1).default(0),
    emotionalAlignment: z.number().min(0).max(1).default(0),
    responseLatency: z.number().min(0).default(0),
  }),
})

const goalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["communication", "connection", "conflict", "intimacy"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

// Main analysis result schema
export const analysisResultSchema = z.object({
  userA: personProfileSchema,
  userB: personProfileSchema,
  communicationPatterns: z.array(communicationPatternSchema).default([]),
  relationshipHealth: z.number().min(0).max(100).default(0),
  timestamp: z.string(),
  screenshotCount: z.number().min(0).default(0),
  screenshots: z.array(screenshotAnalysisSchema).default([]),
  insights: z.object({
    strengths: z.array(z.string()).default([]),
    challenges: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
  }),
  goals: z.array(goalSchema).default([]),
})

// Define a schema for communication pattern objects
const communicationPatternObjectSchema = z.object({
  text: z.string(),
  value: z.number().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  positive: z.number().optional(),
  negative: z.number().optional(),
})

// Define a schema for recommendation objects
const recommendationObjectSchema = z.object({
  text: z.string(),
  category: z.string().optional(),
  priority: z.number().optional(),
})

// Schema for the analysis page data - UPDATED to handle both string and object types
export const analysisPageDataSchema = z.object({
  messageCount: z.number().min(0).default(0),
  summary: z.string().default("No analysis data available."),
  overallTone: z.string().default("N/A"),
  averageResponseTime: z.union([z.string(), z.number()]).default("N/A"),
  messageBalance: z.string().default("N/A"),
  emotionalToneData: z.array(z.any()).default([]),
  // Updated to properly handle both strings and objects
  communicationPatterns: z.array(z.union([z.string(), communicationPatternObjectSchema])).default([]),
  // Updated to properly handle both strings and objects
  recommendations: z.array(z.union([z.string(), recommendationObjectSchema])).default([]),
})

// Type definitions based on the schemas
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type AnalysisPageData = z.infer<typeof analysisPageDataSchema>
