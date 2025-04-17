"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { getStoredAnalysisResults, type AnalysisResult } from "@/lib/screenshot-analysis"
import { EmotionalGrowthBarChart } from "@/components/emotional-growth/bar-chart-comparison"
import { PersonalityBlueprintComparison } from "@/components/personality/blueprint-comparison"

export default function ComparisonPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load analysis results from storage
    const results = getStoredAnalysisResults()
    setAnalysisResults(results)
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Personality Comparison</h1>
            <p className="text-muted-foreground mt-1">
              Detailed comparison of emotional patterns between {analysisResults?.userA?.name || "Person 1"} and{" "}
              {analysisResults?.userB?.name || "Person 2"}
            </p>
          </div>
        </div>

        {!analysisResults ? (
          <Card className="w-full p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-muted rounded-full p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                To see personality comparisons, you need to complete a relationship analysis first.
              </p>
              <Button onClick={() => router.push("/analysis")}>Go to Analysis</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <EmotionalGrowthBarChart personA={analysisResults?.userA?.name} personB={analysisResults?.userB?.name} />

            <PersonalityBlueprintComparison
              personA={analysisResults?.userA?.name}
              personB={analysisResults?.userB?.name}
            />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
