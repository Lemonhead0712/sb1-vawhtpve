import type { AnalysisResult, AnalysisPageData } from "../validation/analysis-schema"

/**
 * Generates fallback analysis data when real analysis fails
 * @param userAName Name of the first user
 * @param userBName Name of the second user
 * @returns Fallback analysis result
 */
export function generateFallbackAnalysisResult(userAName = "Person 1", userBName = "Person 2"): AnalysisResult {
  return {
    userA: {
      name: userAName,
      emotions: {
        joy: 0.6,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.7,
        anticipation: 0.5,
      },
      attachment: {
        secure: 0.7,
        anxious: 0.2,
        avoidant: 0.1,
        disorganized: 0.0,
      },
      gottman: {
        harshStartup: 0.2,
        fourHorsemen: 0.1,
        flooding: 0.1,
        bodyLanguage: 0.2,
        failedRepairAttempts: 0.1,
        badMemories: 0.1,
      },
      dominantEmotion: "joy",
      dominantAttachment: "secure",
      communicationStyle: {
        expressiveness: 0.7,
        emotionalRegulation: 0.8,
        defensiveness: 0.2,
        empathy: 0.7,
      },
    },
    userB: {
      name: userBName,
      emotions: {
        joy: 0.5,
        sadness: 0.3,
        anger: 0.2,
        fear: 0.2,
        surprise: 0.4,
        disgust: 0.1,
        trust: 0.6,
        anticipation: 0.4,
      },
      attachment: {
        secure: 0.6,
        anxious: 0.3,
        avoidant: 0.1,
        disorganized: 0.0,
      },
      gottman: {
        harshStartup: 0.3,
        fourHorsemen: 0.2,
        flooding: 0.2,
        bodyLanguage: 0.3,
        failedRepairAttempts: 0.2,
        badMemories: 0.2,
      },
      dominantEmotion: "joy",
      dominantAttachment: "secure",
      communicationStyle: {
        expressiveness: 0.6,
        emotionalRegulation: 0.7,
        defensiveness: 0.3,
        empathy: 0.6,
      },
    },
    communicationPatterns: [
      {
        date: "Day 1",
        positive: 0.8,
        negative: 0.2,
      },
      {
        date: "Day 2",
        positive: 0.7,
        negative: 0.3,
      },
      {
        date: "Day 3",
        positive: 0.6,
        negative: 0.4,
      },
      {
        date: "Day 4",
        positive: 0.7,
        negative: 0.3,
      },
      {
        date: "Day 5",
        positive: 0.8,
        negative: 0.2,
      },
    ],
    relationshipHealth: 75,
    timestamp: new Date().toISOString(),
    screenshotCount: 5,
    screenshots: [],
    insights: {
      strengths: [
        `${userAName} and ${userBName} show strong trust in their communications.`,
        "Both partners express joy and positive emotions frequently.",
        "The relationship shows a healthy balance of expressiveness and emotional regulation.",
      ],
      challenges: [
        "Occasional moments of defensiveness may hinder effective communication.",
        "There are some signs of anxiety in conflict situations.",
        "Response times could be improved for better engagement.",
      ],
      recommendations: [
        "Practice active listening to further strengthen trust.",
        "Consider using 'I' statements when discussing sensitive topics.",
        "Set aside dedicated time for deeper conversations without distractions.",
        "Acknowledge each other's feelings before problem-solving.",
        "Express appreciation for each other regularly.",
      ],
    },
    goals: [
      {
        id: "goal1",
        title: "Improve Active Listening",
        description: "Practice reflecting back what your partner says before responding.",
        category: "communication",
        difficulty: "medium",
      },
      {
        id: "goal2",
        title: "Regular Check-ins",
        description: "Schedule weekly check-ins to discuss relationship health.",
        category: "connection",
        difficulty: "easy",
      },
      {
        id: "goal3",
        title: "Conflict Resolution",
        description: "Learn and practice the pause technique during heated moments.",
        category: "conflict",
        difficulty: "hard",
      },
    ],
  }
}

/**
 * Generates fallback page data when real analysis fails
 * @param userAName Name of the first user
 * @param userBName Name of the second user
 * @returns Fallback page data
 */
export function generateFallbackPageData(userAName = "Person 1", userBName = "Person 2"): AnalysisPageData {
  return {
    messageCount: 50,
    summary: `Analysis of communication between ${userAName} and ${userBName} shows a generally positive tone with some areas for improvement. The overall relationship health score is 75/100.`,
    overallTone: "Positive",
    averageResponseTime: "2.5",
    messageBalance: "55% / 45%",
    emotionalToneData: [
      {
        date: "Day 1",
        [userAName]: 0.8,
        [userBName]: 0.7,
      },
      {
        date: "Day 2",
        [userAName]: 0.7,
        [userBName]: 0.6,
      },
      {
        date: "Day 3",
        [userAName]: 0.6,
        [userBName]: 0.7,
      },
      {
        date: "Day 4",
        [userAName]: 0.7,
        [userBName]: 0.8,
      },
      {
        date: "Day 5",
        [userAName]: 0.8,
        [userBName]: 0.7,
      },
    ],
    communicationPatterns: [
      "Both partners express joy and positive emotions frequently.",
      "There is a good balance of expressiveness between partners.",
      "Occasional moments of defensiveness may hinder effective communication.",
      "Response times are generally prompt, showing engagement.",
      "There are some signs of anxiety in conflict situations.",
      "Trust is evident in the open nature of communications.",
    ],
    recommendations: [
      "Practice active listening to further strengthen trust.",
      "Consider using 'I' statements when discussing sensitive topics.",
      "Set aside dedicated time for deeper conversations without distractions.",
      "Acknowledge each other's feelings before problem-solving.",
      "Express appreciation for each other regularly.",
    ],
  }
}
