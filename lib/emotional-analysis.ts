// Types for emotional analysis
export type EmotionScore = {
  joy: number
  sadness: number
  anger: number
  fear: number
  surprise: number
}

export type EmotionalAnalysisResult = {
  overallScore: EmotionScore
  dominantEmotion: keyof EmotionScore
  confidence: number
  timestamp: Date
}

// Mock function to analyze a screenshot
// In a real implementation, this would call an AI service API
export async function analyzeScreenshot(imageData: string): Promise<EmotionalAnalysisResult> {
  console.log("Analyzing screenshot...")

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate random emotion scores for demo purposes
  // Replace with actual API call in production
  const joy = Math.random() * 0.8
  const sadness = Math.random() * 0.6
  const anger = Math.random() * 0.4
  const fear = Math.random() * 0.3
  const surprise = Math.random() * 0.5

  const scores: EmotionScore = { joy, sadness, anger, fear, surprise }

  // Find dominant emotion
  const dominantEmotion = Object.entries(scores).reduce(
    (max, [emotion, score]) => (score > max.score ? { emotion: emotion as keyof EmotionScore, score } : max),
    { emotion: "joy" as keyof EmotionScore, score: Number.NEGATIVE_INFINITY },
  )

  return {
    overallScore: scores,
    dominantEmotion: dominantEmotion.emotion,
    confidence: dominantEmotion.score / Object.values(scores).reduce((sum, score) => sum + score, 0),
    timestamp: new Date(),
  }
}

// Function to track emotional changes over time
export function trackEmotionalTrend(results: EmotionalAnalysisResult[]): {
  trend: "improving" | "declining" | "stable"
  dominantEmotion: keyof EmotionScore
  confidence: number
} {
  if (results.length < 2) {
    return {
      trend: "stable",
      dominantEmotion: results[0]?.dominantEmotion || "joy",
      confidence: results[0]?.confidence || 0.5,
    }
  }

  // Calculate positive emotions (joy, surprise) vs negative (sadness, anger, fear)
  const emotionalTrend = results.map((result) => {
    const positive = result.overallScore.joy + result.overallScore.surprise
    const negative = result.overallScore.sadness + result.overallScore.anger + result.overallScore.fear
    return positive - negative
  })

  // Calculate trend direction
  const firstHalf = emotionalTrend.slice(0, Math.floor(emotionalTrend.length / 2))
  const secondHalf = emotionalTrend.slice(Math.floor(emotionalTrend.length / 2))

  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  const trend =
    secondHalfAvg > firstHalfAvg + 0.1 ? "improving" : secondHalfAvg < firstHalfAvg - 0.1 ? "declining" : "stable"

  // Get most recent dominant emotion
  const latestResult = results[results.length - 1]

  return {
    trend,
    dominantEmotion: latestResult.dominantEmotion,
    confidence: latestResult.confidence,
  }
}
