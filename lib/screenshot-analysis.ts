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
}

export type AnalysisResult = {
  userA: PersonProfile
  userB: PersonProfile
  communicationPatterns: CommunicationPattern[]
  relationshipHealth: number
  timestamp: string
  screenshotCount: number
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

// Helper function to generate random emotion scores
function generateRandomEmotionScore(): EmotionScore {
  return {
    joy: Math.random() * 0.8,
    sadness: Math.random() * 0.6,
    anger: Math.random() * 0.4,
    fear: Math.random() * 0.3,
    surprise: Math.random() * 0.5,
    disgust: Math.random() * 0.3,
    trust: Math.random() * 0.9,
    anticipation: Math.random() * 0.7,
  }
}

// Helper function to generate random attachment style
function generateRandomAttachmentStyle(): AttachmentStyle {
  return {
    secure: Math.random() * 0.8,
    anxious: Math.random() * 0.5,
    avoidant: Math.random() * 0.4,
    disorganized: Math.random() * 0.2,
  }
}

// Helper function to generate random Gottman metrics
function generateRandomGottmanMetrics(): GottmanMetrics {
  return {
    harshStartup: Math.random() * 0.5,
    fourHorsemen: Math.random() * 0.4,
    flooding: Math.random() * 0.3,
    bodyLanguage: Math.random() * 0.6,
    failedRepairAttempts: Math.random() * 0.4,
    badMemories: Math.random() * 0.3,
  }
}

// Helper function to find dominant trait
function findDominantTrait<T>(obj: T): keyof T {
  return Object.entries(obj).reduce(
    (max, [key, value]) => (value > (obj[max as keyof T] as number) ? key : max),
    Object.keys(obj)[0],
  ) as keyof T
}

// Helper function to generate random communication patterns
function generateCommunicationPatterns(): CommunicationPattern[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return months.map((month) => ({
    date: month,
    positive: Math.floor(Math.random() * 15) + 5,
    negative: Math.floor(Math.random() * 10) + 1,
  }))
}

// Helper function to generate random insights
function generateInsights(): AnalysisResult["insights"] {
  const strengths = [
    "Strong foundation of trust in your communications",
    "Effective use of repair attempts after conflicts",
    "Healthy balance of positive to negative interactions",
    "Good emotional validation patterns",
    "Consistent expression of appreciation",
  ]

  const challenges = [
    "Tendency toward harsh startups in difficult conversations",
    "Occasional emotional flooding during conflicts",
    "Some signs of defensive communication patterns",
    "Difficulty expressing vulnerability in certain contexts",
    "Mismatched attachment needs causing tension",
  ]

  const recommendations = [
    "Practice soft startups when bringing up difficult topics",
    "Implement a 20-minute break when either person feels flooded",
    "Increase daily expressions of appreciation and gratitude",
    "Schedule regular check-ins to discuss relationship needs",
    "Work on active listening techniques to improve understanding",
  ]

  return {
    strengths: strengths.sort(() => 0.5 - Math.random()).slice(0, 3),
    challenges: challenges.sort(() => 0.5 - Math.random()).slice(0, 3),
    recommendations: recommendations.sort(() => 0.5 - Math.random()).slice(0, 4),
  }
}

// Helper function to generate recommended goals
function generateGoals(): AnalysisResult["goals"] {
  const allGoals = [
    {
      id: "1",
      title: "Improve active listening",
      description: "Practice reflecting back what your partner says before responding",
      category: "communication" as const,
      difficulty: "medium" as const,
    },
    {
      id: "2",
      title: "Express appreciation daily",
      description: "Share one thing you appreciate about your partner each day",
      category: "connection" as const,
      difficulty: "easy" as const,
    },
    {
      id: "3",
      title: "Manage conflict constructively",
      description: "Use 'I' statements and avoid criticism during disagreements",
      category: "conflict" as const,
      difficulty: "hard" as const,
    },
    {
      id: "4",
      title: "Schedule quality time",
      description: "Plan and protect dedicated time together each week",
      category: "connection" as const,
      difficulty: "medium" as const,
    },
    {
      id: "5",
      title: "Practice vulnerability",
      description: "Share feelings and needs openly with your partner",
      category: "intimacy" as const,
      difficulty: "hard" as const,
    },
    {
      id: "6",
      title: "Implement repair phrases",
      description: "Develop and use phrases that help de-escalate conflicts",
      category: "conflict" as const,
      difficulty: "medium" as const,
    },
    {
      id: "7",
      title: "Create emotional bids",
      description: "Make small requests for connection throughout the day",
      category: "connection" as const,
      difficulty: "easy" as const,
    },
    {
      id: "8",
      title: "Practice mindful communication",
      description: "Pause and breathe before responding in tense situations",
      category: "communication" as const,
      difficulty: "medium" as const,
    },
  ]

  // Randomly select 5 goals
  return allGoals.sort(() => 0.5 - Math.random()).slice(0, 5)
}

// Main function to analyze screenshots
export async function analyzeScreenshots(files: File[]): Promise<AnalysisResult> {
  console.log(`Analyzing ${files.length} screenshots...`)

  // In a real implementation, this would:
  // 1. Upload the files to a server
  // 2. Process them with OCR to extract text
  // 3. Run NLP analysis on the text
  // 4. Return structured results

  // For demo purposes, we'll generate random data
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time

  // Generate profiles for both people in the conversation
  const userAEmotions = generateRandomEmotionScore()
  const userBEmotions = generateRandomEmotionScore()

  const userAAttachment = generateRandomAttachmentStyle()
  const userBAttachment = generateRandomAttachmentStyle()

  const userAGottman = generateRandomGottmanMetrics()
  const userBGottman = generateRandomGottmanMetrics()

  const userA: PersonProfile = {
    emotions: userAEmotions,
    attachment: userAAttachment,
    gottman: userAGottman,
    dominantEmotion: findDominantTrait(userAEmotions),
    dominantAttachment: findDominantTrait(userAAttachment),
  }

  const userB: PersonProfile = {
    emotions: userBEmotions,
    attachment: userBAttachment,
    gottman: userBGottman,
    dominantEmotion: findDominantTrait(userBEmotions),
    dominantAttachment: findDominantTrait(userBAttachment),
  }

  // Calculate overall relationship health (0-100)
  const relationshipHealth = Math.round(
    (((userA.emotions.joy + userB.emotions.joy) / 2) * 0.3 +
      ((userA.emotions.trust + userB.emotions.trust) / 2) * 0.3 +
      ((userA.attachment.secure + userB.attachment.secure) / 2) * 0.4) *
      100,
  )

  return {
    userA,
    userB,
    communicationPatterns: generateCommunicationPatterns(),
    relationshipHealth,
    timestamp: new Date().toISOString(),
    screenshotCount: files.length,
    insights: generateInsights(),
    goals: generateGoals(),
  }
}

// Function to get stored analysis results
export function getStoredAnalysisResults(): AnalysisResult | null {
  if (typeof window === "undefined") return null

  const storedResults = localStorage.getItem("analysisResults")
  if (!storedResults) return null

  try {
    return JSON.parse(storedResults) as AnalysisResult
  } catch (error) {
    console.error("Error parsing stored analysis results:", error)
    return null
  }
}
