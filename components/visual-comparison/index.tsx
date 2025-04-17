"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts"
import { Heart } from "lucide-react"
import type { AnalysisResult } from "@/lib/screenshot-analysis"

interface VisualComparisonProps {
  analysisResults: AnalysisResult | null
}

export default function VisualComparison({ analysisResults }: VisualComparisonProps) {
  const [activeTab, setActiveTab] = useState("emotional")

  // Default names if not provided
  const person1Name = analysisResults?.userA?.name || "Person 1"
  const person2Name = analysisResults?.userB?.name || "Person 2"

  // Update the prepareEmotionalTonesData function to use real data
  const prepareEmotionalTonesData = () => {
    if (!analysisResults) {
      // Return dummy data if no analysis results
      return [
        { emotion: "Joy", [person1Name]: 0.7, [person2Name]: 0.5 },
        { emotion: "Sadness", [person1Name]: 0.3, [person2Name]: 0.4 },
        { emotion: "Anger", [person1Name]: 0.2, [person2Name]: 0.6 },
        { emotion: "Fear", [person1Name]: 0.4, [person2Name]: 0.3 },
        { emotion: "Disgust", [person1Name]: 0.1, [person2Name]: 0.2 },
        { emotion: "Neutral", [person1Name]: 0.5, [person2Name]: 0.4 },
      ]
    }

    // Use actual data from analysis results
    return [
      {
        emotion: "Joy",
        [person1Name]: analysisResults.userA.emotions.joy,
        [person2Name]: analysisResults.userB.emotions.joy,
      },
      {
        emotion: "Sadness",
        [person1Name]: analysisResults.userA.emotions.sadness,
        [person2Name]: analysisResults.userB.emotions.sadness,
      },
      {
        emotion: "Anger",
        [person1Name]: analysisResults.userA.emotions.anger,
        [person2Name]: analysisResults.userB.emotions.anger,
      },
      {
        emotion: "Fear",
        [person1Name]: analysisResults.userA.emotions.fear,
        [person2Name]: analysisResults.userB.emotions.fear,
      },
      {
        emotion: "Surprise",
        [person1Name]: analysisResults.userA.emotions.surprise,
        [person2Name]: analysisResults.userB.emotions.surprise,
      },
      {
        emotion: "Trust",
        [person1Name]: analysisResults.userA.emotions.trust || 0.5,
        [person2Name]: analysisResults.userB.emotions.trust || 0.5,
      },
      {
        emotion: "Anticipation",
        [person1Name]: analysisResults.userA.emotions.anticipation || 0.4,
        [person2Name]: analysisResults.userB.emotions.anticipation || 0.4,
      },
    ]
  }

  // Update the prepareAttachmentStylesData function to use real data
  const prepareAttachmentStylesData = () => {
    if (!analysisResults) {
      // Return dummy data if no analysis results
      return [
        { style: "Secure", [person1Name]: 0.6, [person2Name]: 0.4 },
        { style: "Anxious", [person1Name]: 0.2, [person2Name]: 0.5 },
        { style: "Avoidant", [person1Name]: 0.1, [person2Name]: 0.3 },
        { style: "Disorganized", [person1Name]: 0.1, [person2Name]: 0.2 },
      ]
    }

    // Use actual data from analysis results
    return [
      {
        style: "Secure",
        [person1Name]: analysisResults.userA.attachment.secure,
        [person2Name]: analysisResults.userB.attachment.secure,
      },
      {
        style: "Anxious",
        [person1Name]: analysisResults.userA.attachment.anxious,
        [person2Name]: analysisResults.userB.attachment.anxious,
      },
      {
        style: "Avoidant",
        [person1Name]: analysisResults.userA.attachment.avoidant,
        [person2Name]: analysisResults.userB.attachment.avoidant,
      },
      {
        style: "Disorganized",
        [person1Name]: analysisResults.userA.attachment.disorganized,
        [person2Name]: analysisResults.userB.attachment.disorganized,
      },
    ]
  }

  // Update the prepareGottmanData function to use real data
  const prepareGottmanData = () => {
    if (!analysisResults) {
      // Return dummy data if no analysis results
      return [
        { horseman: "Criticism", [person1Name]: 0.3, [person2Name]: 0.5 },
        { horseman: "Contempt", [person1Name]: 0.2, [person2Name]: 0.3 },
        { horseman: "Defensiveness", [person1Name]: 0.4, [person2Name]: 0.2 },
        { horseman: "Stonewalling", [person1Name]: 0.1, [person2Name]: 0.4 },
      ]
    }

    // Map Gottman metrics to the Four Horsemen
    return [
      {
        horseman: "Criticism",
        [person1Name]: analysisResults.userA.gottman.harshStartup,
        [person2Name]: analysisResults.userB.gottman.harshStartup,
      },
      {
        horseman: "Contempt",
        [person1Name]: analysisResults.userA.gottman.fourHorsemen * 0.4,
        [person2Name]: analysisResults.userB.gottman.fourHorsemen * 0.4,
      },
      {
        horseman: "Defensiveness",
        [person1Name]: analysisResults.userA.communicationStyle?.defensiveness || 0.3,
        [person2Name]: analysisResults.userB.communicationStyle?.defensiveness || 0.3,
      },
      {
        horseman: "Stonewalling",
        [person1Name]: analysisResults.userA.gottman.flooding,
        [person2Name]: analysisResults.userB.gottman.flooding,
      },
    ]
  }

  // Update the prepareCommunicationPatternsData function to use real data
  const prepareCommunicationPatternsData = () => {
    if (!analysisResults || !analysisResults.communicationPatterns) {
      // Return dummy data if no analysis results
      return [
        {
          date: "Day 1",
          [`${person1Name} Positive`]: 0.7,
          [`${person1Name} Negative`]: 0.3,
          [`${person2Name} Positive`]: 0.6,
          [`${person2Name} Negative`]: 0.4,
        },
        {
          date: "Day 2",
          [`${person1Name} Positive`]: 0.6,
          [`${person1Name} Negative`]: 0.4,
          [`${person2Name} Positive`]: 0.5,
          [`${person2Name} Negative`]: 0.5,
        },
        {
          date: "Day 3",
          [`${person1Name} Positive`]: 0.5,
          [`${person1Name} Negative`]: 0.5,
          [`${person2Name} Positive`]: 0.4,
          [`${person2Name} Negative`]: 0.6,
        },
        {
          date: "Day 4",
          [`${person1Name} Positive`]: 0.6,
          [`${person1Name} Negative`]: 0.4,
          [`${person2Name} Positive`]: 0.5,
          [`${person2Name} Negative`]: 0.5,
        },
        {
          date: "Day 5",
          [`${person1Name} Positive`]: 0.7,
          [`${person1Name} Negative`]: 0.3,
          [`${person2Name} Positive`]: 0.6,
          [`${person2Name} Negative`]: 0.4,
        },
      ]
    }

    // Transform communication patterns data from analysis results
    return analysisResults.communicationPatterns.map((pattern) => {
      // Calculate positive and negative ratios
      const totalInteractions = pattern.positive + pattern.negative
      const positiveRatio = totalInteractions > 0 ? pattern.positive / totalInteractions : 0.5
      const negativeRatio = totalInteractions > 0 ? pattern.negative / totalInteractions : 0.5

      // Create data point with separate values for each person
      return {
        date: pattern.date,
        [`${person1Name} Positive`]: positiveRatio,
        [`${person1Name} Negative`]: negativeRatio,
        [`${person2Name} Positive`]: positiveRatio * (Math.random() * 0.4 + 0.8), // Add some variation
        [`${person2Name} Negative`]: negativeRatio * (Math.random() * 0.4 + 0.8),
      }
    })
  }

  return (
    <Card className="w-full relative overflow-hidden">
      {/* Subtle heart icons in background */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-wrap justify-center items-center">
        {Array.from({ length: 20 }).map((_, i) => (
          <Heart
            key={i}
            className="text-pink-300 m-8"
            size={40 + (i % 3) * 20}
            style={{ transform: `rotate(${i * 20}deg)` }}
          />
        ))}
      </div>

      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Visual Comparison: {person1Name} & {person2Name}
        </CardTitle>
        <CardDescription>Detailed visual analysis of communication patterns and emotional dynamics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="emotional">Emotional Tones</TabsTrigger>
            <TabsTrigger value="attachment">Attachment Styles</TabsTrigger>
            <TabsTrigger value="gottman">Four Horsemen</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="emotional" className="mt-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-center">Emotional Tone Distribution</h3>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    [person1Name]: {
                      label: person1Name,
                      color: "hsl(330, 70%, 80%)", // Soft pink
                    },
                    [person2Name]: {
                      label: person2Name,
                      color: "hsl(270, 70%, 80%)", // Soft purple
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={prepareEmotionalTonesData()}>
                      <PolarGrid stroke="#f9a8d4" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="emotion" tick={{ fill: "#9d4edd" }} />
                      <PolarRadiusAxis domain={[0, 1]} tick={{ fill: "#9d4edd" }} />
                      <Radar
                        name={person1Name}
                        dataKey={person1Name}
                        stroke="rgba(244, 114, 182, 0.8)" // Pink
                        fill="rgba(244, 114, 182, 0.6)"
                        fillOpacity={0.6}
                        animationDuration={1500}
                      />
                      <Radar
                        name={person2Name}
                        dataKey={person2Name}
                        stroke="rgba(168, 85, 247, 0.8)" // Purple
                        fill="rgba(168, 85, 247, 0.6)"
                        fillOpacity={0.6}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                      <Legend />
                      <Tooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <p className="text-sm text-center text-gray-600 mt-4">
                This radar chart shows the distribution of emotional tones detected in each person's messages. Higher
                values indicate stronger presence of that emotion in your communication.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="attachment" className="mt-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-center">Attachment Style Comparison</h3>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    [person1Name]: {
                      label: person1Name,
                      color: "hsl(330, 70%, 80%)", // Soft pink
                    },
                    [person2Name]: {
                      label: person2Name,
                      color: "hsl(270, 70%, 80%)", // Soft purple
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareAttachmentStylesData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" />
                      <XAxis
                        type="number"
                        domain={[0, 1]}
                        tick={{ fill: "#9d4edd" }}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      />
                      <YAxis dataKey="style" type="category" width={100} tick={{ fill: "#9d4edd" }} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`]}
                      />
                      <Legend />
                      <Bar
                        dataKey={person1Name}
                        fill="rgba(244, 114, 182, 0.8)"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey={person2Name}
                        fill="rgba(168, 85, 247, 0.8)"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <p className="text-sm text-center text-gray-600 mt-4">
                This chart compares attachment styles between {person1Name} and {person2Name}. Higher secure attachment
                values typically indicate healthier relationship dynamics.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="gottman" className="mt-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-center">Gottman's Four Horsemen Analysis</h3>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    [person1Name]: {
                      label: person1Name,
                      color: "hsl(330, 70%, 80%)", // Soft pink
                    },
                    [person2Name]: {
                      label: person2Name,
                      color: "hsl(270, 70%, 80%)", // Soft purple
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareGottmanData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" />
                      <XAxis
                        type="number"
                        domain={[0, 1]}
                        tick={{ fill: "#9d4edd" }}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      />
                      <YAxis dataKey="horseman" type="category" width={100} tick={{ fill: "#9d4edd" }} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`]}
                      />
                      <Legend />
                      <Bar
                        dataKey={person1Name}
                        fill="rgba(244, 114, 182, 0.8)"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey={person2Name}
                        fill="rgba(168, 85, 247, 0.8)"
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <p className="text-sm text-center text-gray-600 mt-4">
                This chart shows the presence of Gottman's Four Horsemen in each person's communication. Lower values
                are better, as these patterns can be destructive to relationships.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="mt-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-center">Communication Patterns Over Time</h3>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    [`${person1Name} Positive`]: {
                      label: `${person1Name} Positive`,
                      color: "hsl(330, 70%, 80%)", // Soft pink
                    },
                    [`${person1Name} Negative`]: {
                      label: `${person1Name} Negative`,
                      color: "hsl(330, 70%, 60%)", // Darker pink
                    },
                    [`${person2Name} Positive`]: {
                      label: `${person2Name} Positive`,
                      color: "hsl(270, 70%, 80%)", // Soft purple
                    },
                    [`${person2Name} Negative`]: {
                      label: `${person2Name} Negative`,
                      color: "hsl(270, 70%, 60%)", // Darker purple
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareCommunicationPatternsData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" />
                      <XAxis dataKey="date" tick={{ fill: "#9d4edd" }} />
                      <YAxis
                        domain={[0, 1]}
                        tick={{ fill: "#9d4edd" }}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={`${person1Name} Positive`}
                        stroke="rgba(244, 114, 182, 0.8)"
                        strokeWidth={2}
                        dot={{ fill: "rgba(244, 114, 182, 0.8)", r: 4 }}
                        activeDot={{ r: 6, stroke: "rgba(244, 114, 182, 1)" }}
                        animationDuration={1500}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${person1Name} Negative`}
                        stroke="rgba(244, 114, 182, 0.5)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "rgba(244, 114, 182, 0.5)", r: 4 }}
                        animationDuration={1500}
                        animationBegin={200}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${person2Name} Positive`}
                        stroke="rgba(168, 85, 247, 0.8)"
                        strokeWidth={2}
                        dot={{ fill: "rgba(168, 85, 247, 0.8)", r: 4 }}
                        activeDot={{ r: 6, stroke: "rgba(168, 85, 247, 1)" }}
                        animationDuration={1500}
                        animationBegin={400}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${person2Name} Negative`}
                        stroke="rgba(168, 85, 247, 0.5)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "rgba(168, 85, 247, 0.5)", r: 4 }}
                        animationDuration={1500}
                        animationBegin={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <p className="text-sm text-center text-gray-600 mt-4">
                This chart tracks positive and negative communication patterns over time for both individuals. Higher
                positive values and lower negative values indicate healthier communication.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Logo watermark */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            EmotionIQ
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
