"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import RelationshipTrendsCharts from "@/components/relationship-trends/relationship-trends-charts"
import { Upload } from "lucide-react"

export default function TrendsContent() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
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
            <h1 className="text-3xl font-bold tracking-tight">Relationship Trends</h1>
            <p className="text-muted-foreground">
              {analysisResults
                ? `Track emotional trends between ${analysisResults.userA?.name || "Person 1"} and ${analysisResults.userB?.name || "Person 2"}`
                : "No trend data available"}
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
              <CardTitle>No Trend Data</CardTitle>
              <CardDescription>You haven't performed any analysis yet</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-center text-muted-foreground mb-4">
                Upload screenshots of your conversations to get started with relationship trends
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
              <TabsTrigger value="emotional">Emotional Trends</TabsTrigger>
              <TabsTrigger value="communication">Communication Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <RelationshipTrendsCharts />
            </TabsContent>

            <TabsContent value="emotional">
              <Card>
                <CardHeader>
                  <CardTitle>Emotional Trends</CardTitle>
                  <CardDescription>Track emotional changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed emotional trends will be available after multiple analyses.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Trends</CardTitle>
                  <CardDescription>Track communication patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed communication trends will be available after multiple analyses.
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
