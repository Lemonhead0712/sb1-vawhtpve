"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import VisualComparison from "@/components/visual-comparison"
import { PersonalityBlueprintComparison } from "@/components/personality/blueprint-comparison"
import { Upload } from "lucide-react"

export default function ComparisonContent() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("visual")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch analysis results from localStorage
    const results = getStoredAnalysisResults()
    setAnalysisResults(results)
    setLoading(false)
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relationship Comparison</h1>
            <p className="text-muted-foreground">
              {analysisResults
                ? `Compare emotional patterns between ${analysisResults.userA?.name || "Person 1"} and ${analysisResults.userB?.name || "Person 2"}`
                : "No comparison data available"}
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
              <CardTitle>No Comparison Data</CardTitle>
              <CardDescription>You haven't performed any analysis yet</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-center text-muted-foreground mb-4">
                Upload screenshots of your conversations to get started with relationship comparison
              </p>
              <Button asChild>
                <a href="/analysis/new">Start Your First Analysis</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="visual">Visual Comparison</TabsTrigger>
              <TabsTrigger value="personality">Personality Blueprints</TabsTrigger>
              <TabsTrigger value="communication">Communication Styles</TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
              <VisualComparison analysisResults={analysisResults} />
            </TabsContent>

            <TabsContent value="personality">
              <PersonalityBlueprintComparison
                personA={analysisResults.userA.name}
                personB={analysisResults.userB.name}
              />
            </TabsContent>

            <TabsContent value="communication">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Style Comparison</CardTitle>
                  <CardDescription>How you and your partner communicate differently</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Communication style comparison will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  )
}
