import type { EmotionScore, AttachmentStyle, GottmanMetrics, Message, ScreenshotAnalysis } from "./types"
import { emojiDatabase, punctuationPatterns } from "./mock-data"

// Define PersonProfile type
interface PersonProfile {
  emotions: EmotionScore
  attachment: AttachmentStyle
  gottman: GottmanMetrics
  communicationStyle: {
    expressiveness: number
    emotionalRegulation: number
    defensiveness: number
    empathy: number
  }
}

// Layout detection - determines which side of the screen belongs to which user
export function detectMessageLayout(imageData: ImageData): {
  rightSide: "userA" | "userB"
  leftSide: "userA" | "userB"
} {
  // In a real implementation, this would use computer vision to detect message bubbles
  // and their positions. For our mock, we'll assume userA is always on the right.
  return {
    rightSide: "userA",
    leftSide: "userB",
  }
}

// Extract text and emojis from the screenshot
export function extractTextAndEmojis(imageData: ImageData): Message[] {
  // In a real implementation, this would use OCR to extract text
  // and identify emojis. For our mock, we'll return sample data.

  // Mock implementation
  return [
    {
      text: "Hey, how are you doing today?",
      emojis: ["😊"],
      sender: "userA",
      emotionalTone: "joy",
      intensity: 0.7,
      hasExcessivePunctuation: false,
      hasAllCaps: false,
    },
    {
      text: "I'm okay...",
      emojis: [],
      sender: "userB",
      emotionalTone: "sadness",
      intensity: 0.4,
      hasExcessivePunctuation: true,
      hasAllCaps: false,
    },
    {
      text: "Are you sure? You don't sound okay",
      emojis: ["🤔"],
      sender: "userA",
      emotionalTone: "concern",
      intensity: 0.6,
      hasExcessivePunctuation: false,
      hasAllCaps: false,
    },
    {
      text: "JUST LEAVE ME ALONE!!!",
      emojis: ["😡"],
      sender: "userB",
      emotionalTone: "anger",
      intensity: 0.9,
      hasExcessivePunctuation: true,
      hasAllCaps: true,
    },
  ] as Message[]
}

// Analyze emojis for emotional content
export function analyzeEmojis(emojis: string[]): { dominantEmotion: keyof EmotionScore; intensity: number } {
  if (emojis.length === 0) {
    return { dominantEmotion: "neutral" as keyof EmotionScore, intensity: 0 }
  }

  // Map emojis to their emotional values using our database
  const emotionScores: Partial<Record<keyof EmotionScore, number>> = {}

  emojis.forEach((emoji) => {
    const emojiInfo = emojiDatabase.find((e) => e.emoji === emoji)
    if (emojiInfo) {
      emotionScores[emojiInfo.sentiment] = (emotionScores[emojiInfo.sentiment] || 0) + emojiInfo.intensity
    }
  })

  // Find the dominant emotion
  let maxScore = 0
  let dominantEmotion: keyof EmotionScore = "neutral" as keyof EmotionScore

  Object.entries(emotionScores).forEach(([emotion, score]) => {
    if (score && score > maxScore) {
      maxScore = score
      dominantEmotion = emotion as keyof EmotionScore
    }
  })

  // Normalize intensity to 0-1 scale
  const intensity = Math.min(maxScore / emojis.length, 1)

  return { dominantEmotion, intensity }
}

// Analyze punctuation and formatting
export function analyzePunctuation(text: string): {
  patterns: string[]
  emotionalSignals: string[]
  intensity: number
  associatedEmotions: Array<keyof EmotionScore>
} {
  const foundPatterns: string[] = []
  const emotionalSignals: string[] = []
  const associatedEmotions: Set<keyof EmotionScore> = new Set()
  let totalIntensity = 0

  // Check for each punctuation pattern
  punctuationPatterns.forEach((pattern) => {
    if (pattern.pattern.test(text)) {
      foundPatterns.push(pattern.type)
      emotionalSignals.push(pattern.emotionalSignal)
      totalIntensity += pattern.intensity
      pattern.associatedEmotions.forEach((emotion) => associatedEmotions.add(emotion))
    }
  })

  // Check for ALL CAPS
  if (text === text.toUpperCase() && text.length > 3) {
    foundPatterns.push("all_caps")
    emotionalSignals.push("shouting, intensity, emphasis")
    totalIntensity += 0.8
    associatedEmotions.add("anger")
  }

  // Check for no punctuation in a longer message
  if (text.length > 20 && !/[.!?,;:]/.test(text)) {
    foundPatterns.push("no_punctuation")
    emotionalSignals.push("bluntness, disengagement")
    totalIntensity += 0.4
    associatedEmotions.add("disgust")
  }

  // Normalize intensity
  const normalizedIntensity = Math.min(totalIntensity, 1)

  return {
    patterns: foundPatterns,
    emotionalSignals,
    intensity: normalizedIntensity,
    associatedEmotions: Array.from(associatedEmotions),
  }
}

// Analyze a single screenshot
export function analyzeScreenshot(imageData: ImageData): ScreenshotAnalysis {
  // Step 1: Detect layout to determine which user is on which side
  const layout = detectMessageLayout(imageData)

  // Step 2: Extract text and emojis from the screenshot
  const messages = extractTextAndEmojis(imageData)

  // Step 3: Analyze emotional dynamics
  const emotionalIntensities = messages.map((m) => m.intensity)
  const escalation =
    emotionalIntensities.length > 1
      ? emotionalIntensities[emotionalIntensities.length - 1] - emotionalIntensities[0]
      : 0

  // Calculate emotional alignment (how similar the emotional tones are)
  let emotionalAlignment = 0
  if (messages.length > 1) {
    const uniqueEmotions = new Set(messages.map((m) => m.emotionalTone))
    emotionalAlignment = 1 - uniqueEmotions.size / messages.length
  }

  return {
    messages,
    layout: {
      rightSideSender: layout.rightSide,
      leftSideSender: layout.leftSide,
    },
    emotionalDynamics: {
      escalation,
      emotionalAlignment,
      responseLatency: 0.5, // Mock value
    },
  }
}

// Aggregate analysis from multiple screenshots
export function aggregateAnalysis(screenshotAnalyses: ScreenshotAnalysis[]): {
  userAProfile: Omit<PersonProfile, "dominantEmotion" | "dominantAttachment">
  userBProfile: Omit<PersonProfile, "dominantEmotion" | "dominantAttachment">
} {
  // Initialize emotion scores
  const userAEmotions: EmotionScore = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    trust: 0,
    anticipation: 0,
  }

  const userBEmotions: EmotionScore = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    trust: 0,
    anticipation: 0,
  }

  // Count messages per user
  let userAMessageCount = 0
  let userBMessageCount = 0

  // Analyze all messages across screenshots
  screenshotAnalyses.forEach((analysis) => {
    analysis.messages.forEach((message) => {
      if (message.sender === "userA") {
        userAEmotions[message.emotionalTone] += message.intensity
        userAMessageCount++
      } else {
        userBEmotions[message.emotionalTone] += message.intensity
        userBMessageCount++
      }
    })
  })

  // Normalize emotion scores
  Object.keys(userAEmotions).forEach((key) => {
    const emotion = key as keyof EmotionScore
    userAEmotions[emotion] /= userAMessageCount || 1
  })

  Object.keys(userBEmotions).forEach((key) => {
    const emotion = key as keyof EmotionScore
    userBEmotions[emotion] /= userBMessageCount || 1
  })

  // Calculate communication style metrics
  const userACommunicationStyle = {
    expressiveness: calculateExpressiveness(screenshotAnalyses, "userA"),
    emotionalRegulation: calculateEmotionalRegulation(screenshotAnalyses, "userA"),
    defensiveness: calculateDefensiveness(screenshotAnalyses, "userA"),
    empathy: calculateEmpathy(screenshotAnalyses, "userA"),
  }

  const userBCommunicationStyle = {
    expressiveness: calculateExpressiveness(screenshotAnalyses, "userB"),
    emotionalRegulation: calculateEmotionalRegulation(screenshotAnalyses, "userB"),
    defensiveness: calculateDefensiveness(screenshotAnalyses, "userB"),
    empathy: calculateEmpathy(screenshotAnalyses, "userB"),
  }

  // Generate attachment styles based on communication patterns
  const userAAttachment = generateAttachmentStyle(userAEmotions, userACommunicationStyle)
  const userBAttachment = generateAttachmentStyle(userBEmotions, userBCommunicationStyle)

  // Generate Gottman metrics
  const userAGottman = generateGottmanMetrics(screenshotAnalyses, "userA")
  const userBGottman = generateGottmanMetrics(screenshotAnalyses, "userB")

  return {
    userAProfile: {
      emotions: userAEmotions,
      attachment: userAAttachment,
      gottman: userAGottman,
      communicationStyle: userACommunicationStyle,
    },
    userBProfile: {
      emotions: userBEmotions,
      attachment: userBAttachment,
      gottman: userBGottman,
      communicationStyle: userBCommunicationStyle,
    },
  }
}

// Helper functions for communication style metrics
function calculateExpressiveness(analyses: ScreenshotAnalysis[], user: "userA" | "userB"): number {
  // Count emojis, message length, and emotional intensity
  let totalEmojis = 0
  let totalMessages = 0
  let totalIntensity = 0

  analyses.forEach((analysis) => {
    analysis.messages.forEach((message) => {
      if (message.sender === user) {
        totalEmojis += message.emojis.length
        totalIntensity += message.intensity
        totalMessages++
      }
    })
  })

  // Higher emoji usage and intensity = more expressive
  return Math.min((totalEmojis / totalMessages) * 0.5 + (totalIntensity / totalMessages) * 0.5, 1) || 0.5
}

function calculateEmotionalRegulation(analyses: ScreenshotAnalysis[], user: "userA" | "userB"): number {
  // Look for patterns of escalation/de-escalation and emotional stability
  let escalationCount = 0
  let totalInteractions = 0

  analyses.forEach((analysis) => {
    const userMessages = analysis.messages.filter((m) => m.sender === user)

    // Check for emotional escalation within user's own messages
    for (let i = 1; i < userMessages.length; i++) {
      if (userMessages[i].intensity > userMessages[i - 1].intensity + 0.3) {
        escalationCount++
      }
      totalInteractions++
    }
  })

  // Fewer escalations = better regulation
  return totalInteractions > 0 ? 1 - escalationCount / totalInteractions : 0.5
}

function calculateDefensiveness(analyses: ScreenshotAnalysis[], user: "userA" | "userB"): number {
  // Look for defensive patterns: all caps, excessive punctuation, etc.
  let defensivePatternCount = 0
  let totalMessages = 0

  analyses.forEach((analysis) => {
    analysis.messages.forEach((message) => {
      if (message.sender === user) {
        if (message.hasAllCaps || message.hasExcessivePunctuation) {
          defensivePatternCount++
        }
        totalMessages++
      }
    })
  })

  // More defensive patterns = higher defensiveness score
  return totalMessages > 0 ? defensivePatternCount / totalMessages : 0.3
}

function calculateEmpathy(analyses: ScreenshotAnalysis[], user: "userA" | "userB"): number {
  // Look for empathetic responses to the other person's emotions
  const empathyScore = 0.5 // Default middle value

  // In a real implementation, this would look for:
  // - Questions after emotional statements
  // - Matching emotional tone appropriately
  // - Supportive language

  return empathyScore
}

// Generate attachment style based on emotional patterns
function generateAttachmentStyle(
  emotions: EmotionScore,
  communicationStyle: PersonProfile["communicationStyle"],
): AttachmentStyle {
  return {
    secure: 0.3 + emotions.joy * 0.3 + emotions.trust * 0.4 - communicationStyle.defensiveness * 0.3,
    anxious: 0.2 + emotions.fear * 0.4 + emotions.sadness * 0.2 + communicationStyle.expressiveness * 0.2,
    avoidant: 0.2 + (1 - communicationStyle.expressiveness) * 0.4 + emotions.disgust * 0.2,
    disorganized: 0.1 + emotions.anger * 0.3 + emotions.fear * 0.2 + communicationStyle.defensiveness * 0.3,
  }
}

// Generate Gottman metrics based on communication patterns
function generateGottmanMetrics(analyses: ScreenshotAnalysis[], user: "userA" | "userB"): GottmanMetrics {
  // In a real implementation, this would analyze specific patterns
  // For now, we'll generate plausible mock data
  return {
    harshStartup: Math.random() * 0.5,
    fourHorsemen: Math.random() * 0.4,
    flooding: Math.random() * 0.3,
    bodyLanguage: Math.random() * 0.6,
    failedRepairAttempts: Math.random() * 0.4,
    badMemories: Math.random() * 0.3,
  }
}

// Find dominant trait in an object
export function findDominantTrait<T>(obj: T): keyof T {
  return Object.entries(obj).reduce(
    (max, [key, value]) => (value > (obj[max as keyof T] as number) ? key : max),
    Object.keys(obj)[0],
  ) as keyof T
}
