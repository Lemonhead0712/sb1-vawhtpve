"use client"

import { useState } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface EmotionalToneData {
  timestamp?: string | number
  date?: string | number
  joy?: number
  sadness?: number
  anger?: number
  fear?: number
  surprise?: number
  disgust?: number
  [key: string]: any
}

interface EmotionalToneVisualizerProps {
  data: EmotionalToneData[]
}

export function EmotionalToneVisualizer({ data }: EmotionalToneVisualizerProps) {
  const [hoveredPoint, setHoveredPoint] = useState<EmotionalToneData | null>(null)

  // Ensure data is an array and handle empty data
  const safeData = Array.isArray(data) ? data : []

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No emotional tone data available</p>
      </div>
    )
  }

  // Process data to ensure it has the right format
  const processedData = safeData.map((item, index) => {
    // If item is not an object, create a default object
    if (typeof item !== "object" || item === null) {
      return {
        timestamp: `Point ${index + 1}`,
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        disgust: 0,
      }
    }

    // Use timestamp or date as the x-axis label
    const timeLabel = item.timestamp || item.date || `Point ${index + 1}`

    return {
      timestamp: typeof timeLabel === "object" ? `Point ${index + 1}` : timeLabel,
      joy: typeof item.joy === "number" ? item.joy : 0,
      sadness: typeof item.sadness === "number" ? item.sadness : 0,
      anger: typeof item.anger === "number" ? item.anger : 0,
      fear: typeof item.fear === "number" ? item.fear : 0,
      surprise: typeof item.surprise === "number" ? item.surprise : 0,
      disgust: typeof item.disgust === "number" ? item.disgust : 0,
    }
  })

  const handleMouseMove = (data: any) => {
    if (data && data.activePayload && data.activePayload.length) {
      setHoveredPoint(data.activePayload[0].payload)
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={processedData}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="joy" stroke="#FFD700" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="sadness" stroke="#1E90FF" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="anger" stroke="#FF4500" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="fear" stroke="#800080" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="surprise" stroke="#32CD32" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="disgust" stroke="#8B4513" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      {hoveredPoint && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Joy</p>
                <p className="text-lg">{(hoveredPoint.joy * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sadness</p>
                <p className="text-lg">{(hoveredPoint.sadness * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Anger</p>
                <p className="text-lg">{(hoveredPoint.anger * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fear</p>
                <p className="text-lg">{(hoveredPoint.fear * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Surprise</p>
                <p className="text-lg">{(hoveredPoint.surprise * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Disgust</p>
                <p className="text-lg">{(hoveredPoint.disgust * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
