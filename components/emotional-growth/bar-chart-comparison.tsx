"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

// Sample data for emotional growth comparison
const generateEmotionalGrowthData = (personA = "Person 1", personB = "Person 2") => {
  return [
    {
      emotion: "Joy",
      [personA]: 0.65,
      [`${personA} Previous`]: 0.45,
      [personB]: 0.58,
      [`${personB} Previous`]: 0.42,
    },
    {
      emotion: "Trust",
      [personA]: 0.72,
      [`${personA} Previous`]: 0.55,
      [personB]: 0.68,
      [`${personB} Previous`]: 0.5,
    },
    {
      emotion: "Empathy",
      [personA]: 0.58,
      [`${personA} Previous`]: 0.4,
      [personB]: 0.62,
      [`${personB} Previous`]: 0.48,
    },
    {
      emotion: "Patience",
      [personA]: 0.48,
      [`${personA} Previous`]: 0.35,
      [personB]: 0.52,
      [`${personB} Previous`]: 0.38,
    },
    {
      emotion: "Openness",
      [personA]: 0.6,
      [`${personA} Previous`]: 0.42,
      [personB]: 0.55,
      [`${personB} Previous`]: 0.4,
    },
  ]
}

// Sample data for communication growth
const generateCommunicationGrowthData = (personA = "Person 1", personB = "Person 2") => {
  return [
    {
      aspect: "Active Listening",
      [personA]: 0.7,
      [`${personA} Previous`]: 0.5,
      [personB]: 0.65,
      [`${personB} Previous`]: 0.48,
    },
    {
      aspect: "Clear Expression",
      [personA]: 0.62,
      [`${personA} Previous`]: 0.45,
      [personB]: 0.68,
      [`${personB} Previous`]: 0.52,
    },
    {
      aspect: "Conflict Resolution",
      [personA]: 0.55,
      [`${personA} Previous`]: 0.38,
      [personB]: 0.6,
      [`${personB} Previous`]: 0.42,
    },
    {
      aspect: "Responsiveness",
      [personA]: 0.68,
      [`${personA} Previous`]: 0.52,
      [personB]: 0.72,
      [`${personB} Previous`]: 0.58,
    },
    {
      aspect: "Validation",
      [personA]: 0.58,
      [`${personA} Previous`]: 0.4,
      [personB]: 0.64,
      [`${personB} Previous`]: 0.46,
    },
  ]
}

interface EmotionalGrowthBarChartProps {
  personA?: string
  personB?: string
  className?: string
}

export function EmotionalGrowthBarChart({
  personA = "Person 1",
  personB = "Person 2",
  className,
}: EmotionalGrowthBarChartProps) {
  const [activeTab, setActiveTab] = useState("emotional")

  const emotionalGrowthData = generateEmotionalGrowthData(personA, personB)
  const communicationGrowthData = generateCommunicationGrowthData(personA, personB)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Emotional Growth Comparison</CardTitle>
        <CardDescription>Track emotional and communication growth over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="emotional">Emotional Growth</TabsTrigger>
            <TabsTrigger value="communication">Communication Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="emotional">
            <div className="h-[350px]">
              <ChartContainer
                config={{
                  [personA]: {
                    label: `${personA} Current`,
                    color: "hsl(var(--chart-1))",
                  },
                  [`${personA} Previous`]: {
                    label: `${personA} Previous`,
                    color: "hsl(var(--chart-1) / 0.5)",
                  },
                  [personB]: {
                    label: `${personB} Current`,
                    color: "hsl(var(--chart-2))",
                  },
                  [`${personB} Previous`]: {
                    label: `${personB} Previous`,
                    color: "hsl(var(--chart-2) / 0.5)",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionalGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey={personA} fill="var(--color-personA)" name={`${personA} Current`} />
                    <Bar
                      dataKey={`${personA} Previous`}
                      fill="var(--color-personAPrevious)"
                      name={`${personA} Previous`}
                      opacity={0.5}
                    />
                    <Bar dataKey={personB} fill="var(--color-personB)" name={`${personB} Current`} />
                    <Bar
                      dataKey={`${personB} Previous`}
                      fill="var(--color-personBPrevious)"
                      name={`${personB} Previous`}
                      opacity={0.5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Compare current emotional growth with previous measurements across key emotional dimensions
            </p>
          </TabsContent>

          <TabsContent value="communication">
            <div className="h-[350px]">
              <ChartContainer
                config={{
                  [personA]: {
                    label: `${personA} Current`,
                    color: "hsl(var(--chart-1))",
                  },
                  [`${personA} Previous`]: {
                    label: `${personA} Previous`,
                    color: "hsl(var(--chart-1) / 0.5)",
                  },
                  [personB]: {
                    label: `${personB} Current`,
                    color: "hsl(var(--chart-2))",
                  },
                  [`${personB} Previous`]: {
                    label: `${personB} Previous`,
                    color: "hsl(var(--chart-2) / 0.5)",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={communicationGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="aspect" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey={personA} fill="var(--color-personA)" name={`${personA} Current`} />
                    <Bar
                      dataKey={`${personA} Previous`}
                      fill="var(--color-personAPrevious)"
                      name={`${personA} Previous`}
                      opacity={0.5}
                    />
                    <Bar dataKey={personB} fill="var(--color-personB)" name={`${personB} Current`} />
                    <Bar
                      dataKey={`${personB} Previous`}
                      fill="var(--color-personBPrevious)"
                      name={`${personB} Previous`}
                      opacity={0.5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Track improvements in communication skills over time for both individuals
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
