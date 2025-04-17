"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, AlertCircle, ArrowRight } from "lucide-react"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import VisualComparison from "@/components/visual-comparison"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisPage() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if analysis results exist in local storage
    const results = getStoredAnalysisResults()

    // Simulate loading
    setTimeout(() => {
      setLoading(false)
      if (results) {
        setAnalysisResults(results)
      }
    }, 1000)
  }, [])

  const handleNewAnalysis = () => {
    router.push("/analysis/new")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relationship Analysis</h1>
            <p className="text-muted-foreground">Detailed insights into your relationship communication patterns</p>
          </div>
          <Button onClick={handleNewAnalysis}>
            <Upload className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="Loading analysis results..." />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !analysisResults ? (
          <Card className="w-full p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't analyzed any conversations yet. Upload screenshots to get started.
              </p>
              <Button onClick={handleNewAnalysis}>Start New Analysis</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relationship Health Overview</CardTitle>
                <CardDescription>
                  Analysis between {analysisResults.userA.name} and {analysisResults.userB.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold mb-2">{analysisResults.relationshipHealth}</div>
                    <div className="text-sm text-muted-foreground">Relationship Health Score</div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <h3 className="font-medium">Key Strengths</h3>
                    <ul className="space-y-2">
                      {analysisResults.insights.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <h3 className="font-medium">Growth Areas</h3>
                    <ul className="space-y-2">
                      {analysisResults.insights.challenges.map((challenge: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span className="text-sm">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="emotional">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="emotional">Emotional Analysis</TabsTrigger>
                <TabsTrigger value="communication">Communication Patterns</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="emotional">
                <VisualComparison analysisResults={analysisResults} />
              </TabsContent>

              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Patterns</CardTitle>
                    <CardDescription>How you interact and communicate with each other</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">{analysisResults.userA.name}'s Communication Style</h3>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm mb-2">
                              <span className="font-medium">Dominant Emotion:</span>{" "}
                              <span className="capitalize">{analysisResults.userA.dominantEmotion}</span>
                            </p>
                            <p className="text-sm mb-2">
                              <span className="font-medium">Attachment Style:</span>{" "}
                              <span className="capitalize">{analysisResults.userA.dominantAttachment}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Communication Approach:</span>{" "}
                              {analysisResults.userA.communicationStyle?.expressiveness > 0.6
                                ? "Expressive and open"
                                : "Reserved and thoughtful"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">{analysisResults.userB.name}'s Communication Style</h3>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm mb-2">
                              <span className="font-medium">Dominant Emotion:</span>{" "}
                              <span className="capitalize">{analysisResults.userB.dominantEmotion}</span>
                            </p>
                            <p className="text-sm mb-2">
                              <span className="font-medium">Attachment Style:</span>{" "}
                              <span className="capitalize">{analysisResults.userB.dominantAttachment}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Communication Approach:</span>{" "}
                              {analysisResults.userB.communicationStyle?.expressiveness > 0.6
                                ? "Expressive and open"
                                : "Reserved and thoughtful"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Gottman's Four Horsemen Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Criticism</p>
                            <p className="text-sm">
                              {analysisResults.userA.gottman.harshStartup > 0.5 ||
                              analysisResults.userB.gottman.harshStartup > 0.5
                                ? "Present in your communication. Watch for statements that attack character rather than behavior."
                                : "Not significantly present in your communication. Good job!"}
                            </p>
                          </div>

                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Contempt</p>
                            <p className="text-sm">
                              {analysisResults.userA.gottman.fourHorsemen > 0.4 ||
                              analysisResults.userB.gottman.fourHorsemen > 0.4
                                ? "Some signs detected. Be mindful of sarcasm, eye-rolling, or mockery."
                                : "Not significantly present in your communication. Good job!"}
                            </p>
                          </div>

                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Defensiveness</p>
                            <p className="text-sm">
                              {analysisResults.userA.communicationStyle?.defensiveness > 0.4 ||
                              analysisResults.userB.communicationStyle?.defensiveness > 0.4
                                ? "Present in your communication. Try to accept responsibility instead of deflecting."
                                : "Not significantly present in your communication. Good job!"}
                            </p>
                          </div>

                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Stonewalling</p>
                            <p className="text-sm">
                              {analysisResults.userA.gottman.flooding > 0.5 ||
                              analysisResults.userB.gottman.flooding > 0.5
                                ? "Some signs detected. Watch for withdrawal or shutting down during difficult conversations."
                                : "Not significantly present in your communication. Good job!"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Actionable steps to improve your relationship</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysisResults.insights.recommendations.map((recommendation: string, i: number) => (
                          <div key={i} className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h3 className="font-medium mb-4">Suggested Goals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResults.goals.map((goal: any) => (
                            <div key={goal.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{goal.title}</h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    goal.difficulty === "easy"
                                      ? "bg-green-100 text-green-800"
                                      : goal.difficulty === "medium"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {goal.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                              <div className="flex justify-end">
                                <Button variant="outline" size="sm">
                                  Add to Goals
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <a href="/assistant">Get Personalized Coaching</a>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
