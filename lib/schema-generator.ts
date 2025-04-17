import type { AnalysisResult } from "./screenshot-analysis/types"

export interface SchemaAnalysis {
  "@context": string
  "@type": string
  name: string
  description: string
  dateCreated: string
  participants: {
    "@type": string
    name: string
    identifier: string
  }[]
  emotionalAnalysis: {
    "@type": string
    about: {
      "@type": string
      name: string
    }
    emotions: {
      "@type": string
      name: string
      value: number
    }[]
    dominantEmotion: string
    attachmentStyle: string
  }[]
  communicationPatterns: {
    "@type": string
    startTime: string
    endTime: string
    interactionStatistics: {
      "@type": string
      name: string
      value: number
    }[]
  }
  relationshipHealth: {
    "@type": string
    name: string
    value: number
    minValue: number
    maxValue: number
  }
  recommendations: {
    "@type": string
    text: string
  }[]
}

export function generateSchemaAnalysis(analysis: AnalysisResult): SchemaAnalysis {
  // Create participants array
  const participants = [
    {
      "@type": "Person",
      name: analysis.userA.name,
      identifier: "userA",
    },
    {
      "@type": "Person",
      name: analysis.userB.name,
      identifier: "userB",
    },
  ]

  // Create emotional analysis for each participant
  const emotionalAnalysis = [
    {
      "@type": "PsychologicalFeature",
      about: {
        "@type": "Person",
        name: analysis.userA.name,
      },
      emotions: Object.entries(analysis.userA.emotions).map(([emotion, value]) => ({
        "@type": "Emotion",
        name: emotion,
        value: value,
      })),
      dominantEmotion: analysis.userA.dominantEmotion,
      attachmentStyle: analysis.userA.dominantAttachment,
    },
    {
      "@type": "PsychologicalFeature",
      about: {
        "@type": "Person",
        name: analysis.userB.name,
      },
      emotions: Object.entries(analysis.userB.emotions).map(([emotion, value]) => ({
        "@type": "Emotion",
        name: emotion,
        value: value,
      })),
      dominantEmotion: analysis.userB.dominantEmotion,
      attachmentStyle: analysis.userB.dominantAttachment,
    },
  ]

  // Create communication patterns
  const communicationPatterns = {
    "@type": "Conversation",
    startTime: analysis.timestamp,
    endTime: analysis.timestamp, // Same as start time since this is a snapshot
    interactionStatistics: analysis.communicationPatterns.map((pattern) => ({
      "@type": "InteractionCounter",
      name: pattern.date,
      value: pattern.positive / (pattern.negative || 1), // Positive to negative ratio
    })),
  }

  // Create relationship health
  const relationshipHealth = {
    "@type": "Rating",
    name: "Relationship Health",
    value: analysis.relationshipHealth,
    minValue: 0,
    maxValue: 100,
  }

  // Create recommendations
  const recommendations = analysis.insights.recommendations.map((recommendation) => ({
    "@type": "Recommendation",
    text: recommendation,
  }))

  // Combine everything into the final schema
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Relationship Analysis: ${analysis.userA.name} & ${analysis.userB.name}`,
    description: `Emotional and communication analysis between ${analysis.userA.name} and ${analysis.userB.name}`,
    dateCreated: analysis.timestamp,
    participants: participants,
    emotionalAnalysis: emotionalAnalysis,
    communicationPatterns: communicationPatterns,
    relationshipHealth: relationshipHealth,
    recommendations: recommendations,
  }
}

export function exportSchemaToJsonLd(schema: SchemaAnalysis): string {
  return JSON.stringify(schema, null, 2)
}
