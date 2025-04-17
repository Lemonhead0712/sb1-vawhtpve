import type { EmojiData, PunctuationPattern } from "./types"

// Emoji database with emotional associations
export const emojiDatabase: EmojiData[] = [
  // Joy/Happiness
  { emoji: "😊", sentiment: "joy", intensity: 0.7, description: "Smiling face with smiling eyes" },
  { emoji: "😄", sentiment: "joy", intensity: 0.8, description: "Grinning face with smiling eyes" },
  { emoji: "😁", sentiment: "joy", intensity: 0.8, description: "Beaming face with smiling eyes" },
  { emoji: "😀", sentiment: "joy", intensity: 0.7, description: "Grinning face" },
  { emoji: "😃", sentiment: "joy", intensity: 0.8, description: "Grinning face with big eyes" },
  { emoji: "🥰", sentiment: "joy", intensity: 0.9, description: "Smiling face with hearts" },
  { emoji: "😍", sentiment: "joy", intensity: 0.9, description: "Smiling face with heart-eyes" },
  { emoji: "🤣", sentiment: "joy", intensity: 0.9, description: "Rolling on the floor laughing" },
  { emoji: "😂", sentiment: "joy", intensity: 0.8, description: "Face with tears of joy" },

  // Sadness
  { emoji: "😢", sentiment: "sadness", intensity: 0.7, description: "Crying face" },
  { emoji: "😭", sentiment: "sadness", intensity: 0.9, description: "Loudly crying face" },
  { emoji: "😞", sentiment: "sadness", intensity: 0.6, description: "Disappointed face" },
  { emoji: "😔", sentiment: "sadness", intensity: 0.5, description: "Pensive face" },
  { emoji: "😟", sentiment: "sadness", intensity: 0.6, description: "Worried face" },
  { emoji: "🙁", sentiment: "sadness", intensity: 0.4, description: "Slightly frowning face" },
  { emoji: "☹️", sentiment: "sadness", intensity: 0.6, description: "Frowning face" },

  // Anger
  { emoji: "😠", sentiment: "anger", intensity: 0.7, description: "Angry face" },
  { emoji: "😡", sentiment: "anger", intensity: 0.9, description: "Pouting face" },
  { emoji: "🤬", sentiment: "anger", intensity: 1.0, description: "Face with symbols on mouth" },
  { emoji: "😤", sentiment: "anger", intensity: 0.7, description: "Face with steam from nose" },

  // Fear
  { emoji: "😨", sentiment: "fear", intensity: 0.7, description: "Fearful face" },
  { emoji: "😱", sentiment: "fear", intensity: 0.9, description: "Face screaming in fear" },
  { emoji: "😰", sentiment: "fear", intensity: 0.7, description: "Anxious face with sweat" },
  { emoji: "😥", sentiment: "fear", intensity: 0.5, description: "Sad but relieved face" },

  // Surprise
  { emoji: "😮", sentiment: "surprise", intensity: 0.6, description: "Face with open mouth" },
  { emoji: "😲", sentiment: "surprise", intensity: 0.7, description: "Astonished face" },
  { emoji: "😯", sentiment: "surprise", intensity: 0.5, description: "Hushed face" },
  { emoji: "😳", sentiment: "surprise", intensity: 0.6, description: "Flushed face" },
  { emoji: "🤯", sentiment: "surprise", intensity: 0.9, description: "Exploding head" },

  // Disgust
  { emoji: "🤢", sentiment: "disgust", intensity: 0.7, description: "Nauseated face" },
  { emoji: "🤮", sentiment: "disgust", intensity: 0.9, description: "Face vomiting" },
  { emoji: "😖", sentiment: "disgust", intensity: 0.6, description: "Confounded face" },

  // Trust
  { emoji: "🤝", sentiment: "trust", intensity: 0.8, description: "Handshake" },
  { emoji: "👍", sentiment: "trust", intensity: 0.6, description: "Thumbs up" },
  { emoji: "🙏", sentiment: "trust", intensity: 0.7, description: "Folded hands" },

  // Anticipation
  { emoji: "🤔", sentiment: "anticipation", intensity: 0.5, description: "Thinking face" },
  { emoji: "👀", sentiment: "anticipation", intensity: 0.6, description: "Eyes" },
  { emoji: "😏", sentiment: "anticipation", intensity: 0.5, description: "Smirking face" },
]

// Punctuation patterns with emotional associations
export const punctuationPatterns: PunctuationPattern[] = [
  {
    pattern: /\.{3,}/,
    type: "ellipsis",
    emotionalSignal: "hesitation, passive aggression, or trailing off",
    intensity: 0.5,
    associatedEmotions: ["sadness", "fear"],
  },
  {
    pattern: /\?{2,}/,
    type: "excessive_question",
    emotionalSignal: "confusion, disbelief, or frustration",
    intensity: 0.6,
    associatedEmotions: ["surprise", "anger"],
  },
  {
    pattern: /!{2,}/,
    type: "excessive_exclamation",
    emotionalSignal: "intensity, excitement, or anger",
    intensity: 0.8,
    associatedEmotions: ["joy", "anger", "surprise"],
  },
]

// Generate mock communication patterns
export function generateCommunicationPatterns() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return months.map((month) => ({
    date: month,
    positive: Math.floor(Math.random() * 15) + 5,
    negative: Math.floor(Math.random() * 10) + 1,
  }))
}

// Update the generateInsights function to include names

// Generate mock insights
export function generateInsights(userAName: string, userBName: string) {
  const strengths = [
    `Strong foundation of trust between ${userAName} and ${userBName}`,
    `Effective use of repair attempts after conflicts by both ${userAName} and ${userBName}`,
    `Healthy ratio of positive to negative interactions in your conversations`,
    `Good emotional validation patterns, especially from ${userAName}`,
    `Consistent expression of appreciation from ${userBName}`,
    `Balanced emotional expressiveness between ${userAName} and ${userBName}`,
    `Effective use of emojis by ${userAName} to clarify emotional tone`,
    `Good response timing from ${userBName} that shows engagement`,
  ]

  const challenges = [
    `Tendency toward harsh startups in difficult conversations, particularly from ${userAName}`,
    `Occasional emotional flooding during conflicts, especially for ${userBName}`,
    `Some signs of defensive communication patterns from ${userAName}`,
    `Difficulty expressing vulnerability for ${userBName} in certain contexts`,
    `Mismatched attachment needs between ${userAName} and ${userBName} causing tension`,
    `Overuse of ellipses by ${userBName} creating ambiguity in messages`,
    `Inconsistent emotional regulation from ${userAName} during disagreements`,
    `Imbalance in emoji usage suggesting emotional mismatch between ${userAName} and ${userBName}`,
  ]

  const recommendations = [
    `${userAName} should practice soft startups when bringing up difficult topics`,
    `Implement a 20-minute break when either ${userAName} or ${userBName} feels flooded`,
    `${userBName} could increase daily expressions of appreciation and gratitude`,
    `Schedule regular check-ins for ${userAName} and ${userBName} to discuss relationship needs`,
    `${userAName} should work on active listening techniques to improve understanding`,
    `${userBName} could use more explicit emotional language instead of relying on punctuation`,
    `${userAName} should balance emoji usage to ensure emotional clarity`,
    `Both ${userAName} and ${userBName} should acknowledge each other's messages more consistently`,
  ]

  return {
    strengths: strengths.sort(() => 0.5 - Math.random()).slice(0, 3),
    challenges: challenges.sort(() => 0.5 - Math.random()).slice(0, 3),
    recommendations: recommendations.sort(() => 0.5 - Math.random()).slice(0, 4),
  }
}

// Generate recommended goals
export function generateGoals() {
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
    {
      id: "9",
      title: "Clarify emoji meanings",
      description: "Discuss what specific emojis mean to each of you to avoid misunderstandings",
      category: "communication" as const,
      difficulty: "easy" as const,
    },
    {
      id: "10",
      title: "Reduce passive-aggressive punctuation",
      description: "Replace ellipses (...) with clearer statements of feelings",
      category: "communication" as const,
      difficulty: "medium" as const,
    },
    {
      id: "11",
      title: "Balance response times",
      description: "Work on responding within a reasonable timeframe to reduce anxiety",
      category: "connection" as const,
      difficulty: "medium" as const,
    },
    {
      id: "12",
      title: "Use emotion words instead of just emojis",
      description: "Pair emojis with explicit statements about your feelings",
      category: "intimacy" as const,
      difficulty: "easy" as const,
    },
  ]

  // Randomly select 5 goals
  return allGoals.sort(() => 0.5 - Math.random()).slice(0, 5)
}
