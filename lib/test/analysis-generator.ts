import type { AnalysisResult } from "@/lib/screenshot-analysis/types"
import { v4 as uuidv4 } from "uuid"

/**
 * Generates a random number between min and max
 */
function randomNumber(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Generates a random date within the past days
 */
function randomDate(pastDays = 30): Date {
  const now = new Date()
  const pastDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000)
  return new Date(pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()))
}

/**
 * Generates random emotion scores
 */
function generateEmotionScores() {
  return {
    joy: randomNumber(0, 1),
    sadness: randomNumber(0, 1),
    anger: randomNumber(0, 1),
    fear: randomNumber(0, 1),
    surprise: randomNumber(0, 1),
    disgust: randomNumber(0, 1),
    trust: randomNumber(0, 1),
    anticipation: randomNumber(0, 1),
  }
}

/**
 * Generates random attachment style
 */
function generateAttachmentStyle() {
  return {
    secure: randomNumber(0, 1),
    anxious: randomNumber(0, 1),
    avoidant: randomNumber(0, 1),
    disorganized: randomNumber(0, 1),
  }
}

/**
 * Generates random Gottman metrics
 */
function generateGottmanMetrics() {
  return {
    harshStartup: randomNumber(0, 1),
    fourHorsemen: randomNumber(0, 1),
    flooding: randomNumber(0, 1),
    bodyLanguage: randomNumber(0, 1),
    failedRepairAttempts: randomNumber(0, 1),
    badMemories: randomNumber(0, 1),
  }
}

/**
 * Generates random communication style
 */
function generateCommunicationStyle() {
  return {
    expressiveness: randomNumber(0, 1),
    emotionalRegulation: randomNumber(0, 1),
    defensiveness: randomNumber(0, 1),
    empathy: randomNumber(0, 1),
  }
}

/**
 * Finds the dominant trait in an object
 */
function findDominantTrait<T>(obj: Record<string, number>): string {
  return Object.entries(obj).reduce((max, [key, value]) => (value > max.value ? { key, value } : max), {
    key: Object.keys(obj)[0],
    value: Number.NEGATIVE_INFINITY,
  }).key
}

/**
 * Generates random communication patterns
 */
function generateCommunicationPatterns(count = 6) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return Array.from({ length: count }, (_, i) => {
    const date = months[i % 12]
    const positive = randomNumber(5, 20)
    const negative = randomNumber(1, 10)
    return { date, positive, negative }
  })
}

/**
 * Generates random insights
 */
function generateInsights(userA: string, userB: string) {
  const strengths = [
    `Strong foundation of trust between ${userA} and ${userB}`,
    `Effective use of repair attempts after conflicts by both ${userA} and ${userB}`,
    `Healthy ratio of positive to negative interactions in your conversations`,
    `Good emotional validation patterns, especially from ${userA}`,
    `Consistent expression of appreciation from ${userB}`,
    `Balanced emotional expressiveness between ${userA} and ${userB}`,
    `Effective use of emojis by ${userA} to clarify emotional tone`,
    `Good response timing from ${userB} that shows engagement`,
  ]

  const challenges = [
    `Tendency toward harsh startups in difficult conversations, particularly from ${userA}`,
    `Occasional emotional flooding during conflicts, especially for ${userB}`,
    `Some signs of defensive communication patterns from ${userA}`,
    `Difficulty expressing vulnerability for ${userB} in certain contexts`,
    `Mismatched attachment needs between ${userA} and ${userB} causing tension`,
    `Overuse of ellipses by ${userB} creating ambiguity in messages`,
    `Inconsistent emotional regulation from ${userA} during disagreements`,
    `Imbalance in emoji usage suggesting emotional mismatch between ${userA} and ${userB}`,
  ]

  const recommendations = [
    `${userA} should practice soft startups when bringing up difficult topics`,
    `Implement a 20-minute break when either ${userA} or ${userB} feels flooded`,
    `${userB} could increase daily expressions of appreciation and gratitude`,
    `Schedule regular check-ins for ${userA} and ${userB} to discuss relationship needs`,
    `${userA} should work on active listening techniques to improve understanding`,
    `${userB} could use more explicit emotional language instead of relying on punctuation`,
    `${userA} should balance emoji usage to ensure emotional clarity`,
    `Both ${userA} and ${userB} should acknowledge each other's messages more consistently`,
  ]

  return {
    strengths: strengths.sort(() => 0.5 - Math.random()).slice(0, 3),
    challenges: challenges.sort(() => 0.5 - Math.random()).slice(0, 3),
    recommendations: recommendations.sort(() => 0.5 - Math.random()).slice(0, 4),
  }
}

/**
 * Generates random goals
 */
function generateGoals() {
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

  return allGoals.sort(() => 0.5 - Math.random()).slice(0, 5)
}

/**
 * Generates a random analysis result
 */
export function generateRandomAnalysisResult(userAName = "Person 1", userBName = "Person 2"): AnalysisResult {
  // Generate emotion scores
  const userAEmotions = generateEmotionScores()
  const userBEmotions = generateEmotionScores()

  // Generate attachment styles
  const userAAttachment = generateAttachmentStyle()
  const userBAttachment = generateAttachmentStyle()

  // Generate Gottman metrics
  const userAGottman = generateGottmanMetrics()
  const userBGottman = generateGottmanMetrics()

  // Generate communication styles
  const userACommunicationStyle = generateCommunicationStyle()
  const userBCommunicationStyle = generateCommunicationStyle()

  // Calculate relationship health (0-100)
  const relationshipHealth = Math.round(
    (((userAEmotions.joy + userBEmotions.joy) / 2) * 0.3 +
      ((userAEmotions.trust + userBEmotions.trust) / 2) * 0.3 +
      ((userAAttachment.secure + userBAttachment.secure) / 2) * 0.4) *
      100,
  )

  // Generate communication patterns
  const communicationPatterns = generateCommunicationPatterns()

  // Generate insights
  const insights = generateInsights(userAName, userBName)

  // Generate goals
  const goals = generateGoals()

  // Create the analysis result
  return {
    userA: {
      name: userAName,
      emotions: userAEmotions,
      attachment: userAAttachment,
      gottman: userAGottman,
      dominantEmotion: findDominantTrait(userAEmotions),
      dominantAttachment: findDominantTrait(userAAttachment),
      communicationStyle: userACommunicationStyle,
    },
    userB: {
      name: userBName,
      emotions: userBEmotions,
      attachment: userBAttachment,
      gottman: userBGottman,
      dominantEmotion: findDominantTrait(userBEmotions),
      dominantAttachment: findDominantTrait(userBAttachment),
      communicationStyle: userBCommunicationStyle,
    },
    communicationPatterns,
    relationshipHealth,
    timestamp: new Date().toISOString(),
    screenshotCount: Math.floor(randomNumber(3, 15)),
    screenshots: [],
    insights,
    goals,
  }
}

/**
 * Generates a unique ID for an analysis
 */
export function generateAnalysisId(): string {
  return `analysis_${uuidv4()}`
}
