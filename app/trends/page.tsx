"use client"

import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import { AlertCircle, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { EmotionalGrowthBarChart } from "@/components/emotional-growth/bar-chart-comparison"
import { PersonalityBlueprintComparison } from "@/components/personality/blueprint-comparison"

export default function TrendsPage() {
  const [hasAnalysisResults, setHasAnalysisResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if analysis results exist
    const results = getStoredAnalysisResults()
    setHasAnalysisResults(results !== null)
    setAnalysisResults(results)
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Emotional Growth Trends</h1>
          <p className="text-muted-foreground mt-1">Track emotional growth and personality patterns over time</p>
        </div>

        {!hasAnalysisResults ? (
          <Card className="w-full p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-muted rounded-full p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                To see emotional growth trends, you need to complete a relationship analysis first.
              </p>
              <Button onClick={() => router.push("/analysis")}>Go to Analysis</Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <EmotionalGrowthBarChart personA={analysisResults?.userA?.name} personB={analysisResults?.userB?.name} />
            </div>

            <div className="mb-8">
              <PersonalityBlueprintComparison
                personA={analysisResults?.userA?.name}
                personB={analysisResults?.userB?.name}
              />
            </div>

            <Card className="w-full bg-gradient-to-r from-lavender/5 to-blush/5 border-lavender/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-lavender/20 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-lavender-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Understanding Your Growth</h3>
                    <p className="text-sm text-muted-foreground">
                      These charts show how your emotional patterns and communication styles evolve over time. Regular
                      analysis helps you track progress and identify growth opportunities. For the most accurate trends,
                      analyze your conversations consistently and look for gradual improvements rather than quick fixes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-sm mb-1">Positive Growth Indicators</h4>
                        <p className="text-xs text-muted-foreground">
                          Look for upward trends in emotional expression, active listening, and empathy. These indicate
                          strengthening emotional intelligence and connection.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-sm mb-1">Areas to Develop</h4>
                        <p className="text-xs text-muted-foreground">
                          Focus on areas with slower growth or plateaus. These represent opportunities for intentional
                          practice and development in your communication patterns.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}
