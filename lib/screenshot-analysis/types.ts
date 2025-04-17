// Types for emotional analysis
export type EmotionScore = {
  joy: number
  sadness: number
  anger: number
  fear: number
  surprise: number
  disgust: number
  trust: number
  anticipation: number
}

export type AttachmentStyle = {
  secure: number
  anxious: number
  avoidant: number
  disorganized: number
}

export type GottmanMetrics = {
  harshStartup: number
  fourHorsemen: number
  flooding: number
  bodyLanguage: number
  failedRepairAttempts: number
  badMemories: number
}

export type CommunicationPattern = {
  date: string
  positive: number
  negative: number
}

export type PersonProfile = {
  emotions: EmotionScore
  attachment: AttachmentStyle
  gottman: GottmanMetrics
  dominantEmotion: keyof EmotionScore
  dominantAttachment: keyof AttachmentStyle
  communicationStyle: {
    expressiveness: number // 0-1 scale (withdrawn to expressive)
    emotionalRegulation: number // 0-1 scale (poor to excellent)
    defensiveness: number // 0-1 scale (low to high)
    empathy: number // 0-1 scale (low to high)
  }
}

export type Message = {
  text: string
  emojis: string[]
  sender: "userA" | "userB"
  emotionalTone: keyof EmotionScore
  intensity: number // 0-1 scale
  hasExcessivePunctuation: boolean
  hasAllCaps: boolean
  timestamp?: Date
}

export type ScreenshotAnalysis = {
  messages: Message[]
  layout: {
    rightSideSender: "userA" | "userB"
    leftSideSender: "userA" | "userB"
  }
  emotionalDynamics: {
    escalation: number // -1 to 1 (de-escalation to escalation)
    emotionalAlignment: number // 0-1 (misaligned to aligned)
    responseLatency: number // average time between messages
  }
}

// Update the AnalysisResult type to include names
export type AnalysisResult = {
  userA: PersonProfile & { name: string }
  userB: PersonProfile & { name: string }
  communicationPatterns: CommunicationPattern[]
  relationshipHealth: number
  timestamp: string
  screenshotCount: number
  screenshots: ScreenshotAnalysis[]
  insights: {
    strengths: string[]
    challenges: string[]
    recommendations: string[]
  }
  goals: {
    id: string
    title: string
    description: string
    category: "communication" | "connection" | "conflict" | "intimacy"
    difficulty: "easy" | "medium" | "hard"
  }[]
}

// Emoji analysis types
export type EmojiData = {
  emoji: string
  sentiment: keyof EmotionScore
  intensity: number // 0-1 scale
  description: string
}

// Punctuation analysis types
export type PunctuationPattern = {
  pattern: RegExp
  type: "ellipsis" | "excessive_question" | "excessive_exclamation" | "all_caps" | "no_punctuation"
  emotionalSignal: string
  intensity: number // 0-1 scale
  associatedEmotions: Array<keyof EmotionScore>
}
