"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmotionalToneVisualizer } from "@/components/emotional-tone-visualizer"
import VisualComparison from "@/components/visual-comparison"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisContent() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const analysisId = searchParams.get("id")

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true)
      try {
        if (analysisId) {
          // Fetch analysis from Redis
          const response = await fetch(`/api/analysis/get?id=${analysisId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch analysis")
          }

          const data = await response.json()
          setAnalysisResults(data.analysis)
        } else {
          // Fallback to localStorage if no ID is provided
          const storedResults = localStorage.getItem("analysisResults")
          if (storedResults) {
            setAnalysisResults(JSON.parse(storedResults))
          }
        }
      } catch (error) {
        console.error("Error fetching analysis:", error)
        toast({
          title: "Error",
          description: "Failed to fetch analysis data.",
          variant: "destructive",
        })

        // Fallback to localStorage
        const storedResults = localStorage.getItem("analysisResults")
        if (storedResults) {
          setAnalysisResults(JSON.parse(storedResults))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [analysisId, toast])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
            <p className="text-muted-foreground">
              {analysisResults
                ? `Emotional analysis between ${analysisResults.userA?.name || "Person 1"} and ${analysisResults.userB?.name || "Person 2"}`
                : "No analysis data available"}
            </p>
          </div>
          <Button asChild>
            <a href="/analysis/new">
              <Upload className="mr-2 h-4 w-4" />
              New Analysis
            </a>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : !analysisResults ? (
          <Card>
            <CardHeader>
              <CardTitle>No Analysis Data</CardTitle>
              <CardDescription>You haven't performed any analysis yet</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-center text-muted-foreground mb-4">
                Upload screenshots of your conversations to get started with relationship analysis
              </p>
              <Button asChild>
                <a href="/analysis/new">Start Your First Analysis</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="emotional">Emotional Tones</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Overview</CardTitle>
                  <CardDescription>Summary of your relationship analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Relationship Health</h3>
                        <div className="text-3xl font-bold">{analysisResults.relationshipHealth}/100</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on emotional patterns and communication style
                        </p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Analysis Date</h3>
                        <div className="text-xl">{new Date(analysisResults.timestamp).toLocaleDateString()}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {analysisResults.screenshotCount} screenshots
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emotional">
              <Card>
                <CardHeader>
                  <CardTitle>Emotional Tone Analysis</CardTitle>
                  <CardDescription>Emotional patterns detected in your conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <EmotionalToneVisualizer
                      data={[
                        {
                          timestamp: "Day 1",
                          joy: analysisResults.userA.emotions.joy,
                          sadness: analysisResults.userA.emotions.sadness,
                          anger: analysisResults.userA.emotions.anger,
                          fear: analysisResults.userA.emotions.fear,
                          surprise: analysisResults.userA.emotions.surprise,
                          disgust: analysisResults.userA.emotions.disgust || 0,
                        },
                        {
                          timestamp: "Day 2",
                          joy: analysisResults.userB.emotions.joy,
                          sadness: analysisResults.userB.emotions.sadness,
                          anger: analysisResults.userB.emotions.anger,
                          fear: analysisResults.userB.emotions.fear,
                          surprise: analysisResults.userB.emotions.surprise,
                          disgust: analysisResults.userB.emotions.disgust || 0,
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <VisualComparison analysisResults={analysisResults} />
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>Relationship Insights</CardTitle>
                  <CardDescription>Key observations and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Strengths</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResults.insights.strengths.map((strength: string, i: number) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Challenges</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResults.insights.challenges.map((challenge: string, i: number) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResults.insights.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  )
}
