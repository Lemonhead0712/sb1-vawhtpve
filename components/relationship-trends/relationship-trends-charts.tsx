"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"

// Generate sample data for relationship health trend
const generateHealthTrendData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
  return months.map((month, index) => {
    // Create some interesting patterns with ups and downs
    const person1Score = 65 + Math.sin(index * 0.8) * 15 + Math.random() * 5
    const person2Score = 70 + Math.cos(index * 0.8) * 10 + Math.random() * 5

    return {
      month,
      "Person 1": Math.round(person1Score),
      "Person 2": Math.round(person2Score),
    }
  })
}

// Generate sample data for relationship dimensions
const generateDimensionData = (dimension: string) => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10"]

  // Different patterns for different dimensions
  const patterns = {
    Trust: { base1: 0.7, amp1: 0.15, freq1: 0.9, base2: 0.65, amp2: 0.2, freq2: 0.7 },
    "Conflict Resolution": { base1: 0.6, amp1: 0.25, freq1: 0.8, base2: 0.55, amp2: 0.3, freq2: 0.6 },
    "Emotional Availability": { base1: 0.75, amp1: 0.1, freq1: 1.2, base2: 0.7, amp2: 0.15, freq2: 0.9 },
    "Affection/Intimacy": { base1: 0.8, amp1: 0.1, freq1: 0.5, base2: 0.75, amp2: 0.15, freq2: 0.7 },
    "Communication Clarity": { base1: 0.65, amp1: 0.2, freq1: 1.1, base2: 0.6, amp2: 0.25, freq2: 0.8 },
  }

  const pattern = patterns[dimension as keyof typeof patterns] || patterns["Trust"]

  return weeks.map((week, index) => {
    // Create dimension-specific patterns
    const person1Score = pattern.base1 + Math.sin(index * pattern.freq1) * pattern.amp1 + Math.random() * 0.05
    const person2Score = pattern.base2 + Math.cos(index * pattern.freq2) * pattern.amp2 + Math.random() * 0.05

    return {
      week,
      "Person 1": Number(person1Score.toFixed(2)),
      "Person 2": Number(person2Score.toFixed(2)),
    }
  })
}

export default function RelationshipTrendsCharts() {
  const [activeDimension, setActiveDimension] = useState("Trust")
  const healthTrendData = generateHealthTrendData()
  const dimensionData = generateDimensionData(activeDimension)

  const dimensions = [
    "Trust",
    "Conflict Resolution",
    "Emotional Availability",
    "Affection/Intimacy",
    "Communication Clarity",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Relationship Health Trend Chart */}
      <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-lavender/10 to-blush/10 pb-2">
          <CardTitle>Relationship Health Trend: Person 1 & Person 2</CardTitle>
          <CardDescription>Your emotional health score over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ChartContainer
              config={{
                "Person 1": {
                  label: "Person 1",
                  color: "hsl(330, 70%, 80%)", // Soft pink
                },
                "Person 2": {
                  label: "Person 2",
                  color: "hsl(270, 70%, 80%)", // Soft purple
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "#9d4edd" }} axisLine={{ stroke: "#f9a8d4" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9d4edd" }} axisLine={{ stroke: "#f9a8d4" }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Person 1"
                    stroke="rgba(244, 114, 182, 0.8)" // Pink
                    strokeWidth={3}
                    dot={{ fill: "rgba(244, 114, 182, 0.8)", r: 4 }}
                    activeDot={{ r: 6, stroke: "rgba(244, 114, 182, 1)" }}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="Person 2"
                    stroke="rgba(168, 85, 247, 0.8)" // Purple
                    strokeWidth={3}
                    dot={{ fill: "rgba(168, 85, 247, 0.8)", r: 4 }}
                    activeDot={{ r: 6, stroke: "rgba(168, 85, 247, 1)" }}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Higher scores indicate better emotional health. Hover over points for exact values.
          </p>
        </CardContent>
      </Card>

      {/* Relationship Dimensions Chart */}
      <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-skyblue/10 to-lavender/10 pb-2">
          <CardTitle>Relationship Dimensions</CardTitle>
          <CardDescription>Key aspects of your relationship</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeDimension} onValueChange={setActiveDimension} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              {dimensions.map((dimension) => (
                <TabsTrigger key={dimension} value={dimension} className="text-xs md:text-sm">
                  {dimension.split("/")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  "Person 1": {
                    label: "Person 1",
                    color: "hsl(330, 70%, 80%)", // Soft pink
                  },
                  "Person 2": {
                    label: "Person 2",
                    color: "hsl(270, 70%, 80%)", // Soft purple
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dimensionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f9a8d4" opacity={0.3} />
                    <XAxis dataKey="week" tick={{ fill: "#9d4edd" }} axisLine={{ stroke: "#f9a8d4" }} />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fill: "#9d4edd" }}
                      axisLine={{ stroke: "#f9a8d4" }}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Person 1"
                      stroke="rgba(244, 114, 182, 0.8)" // Pink
                      strokeWidth={3}
                      dot={{ fill: "rgba(244, 114, 182, 0.8)", r: 4 }}
                      activeDot={{ r: 6, stroke: "rgba(244, 114, 182, 1)" }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="Person 2"
                      stroke="rgba(168, 85, 247, 0.8)" // Purple
                      strokeWidth={3}
                      dot={{ fill: "rgba(168, 85, 247, 0.8)", r: 4 }}
                      activeDot={{ r: 6, stroke: "rgba(168, 85, 247, 1)" }}
                      animationDuration={1500}
                      animationBegin={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Tracking {activeDimension.toLowerCase()} trends over time. Higher percentages indicate stronger
              relationship dimensions.
            </p>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
