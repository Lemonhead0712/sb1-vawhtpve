"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, FileText, Filter, Search, Trash2, Upload } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { AnalysisGenerator } from "@/components/test/analysis-generator"

type Analysis = {
  id: string
  result: {
    userA: {
      name: string
    }
    userB: {
      name: string
    }
    relationshipHealth: number
    timestamp: string
    screenshotCount: number
    insights: {
      strengths: string[]
      challenges: string[]
      recommendations: string[]
    }
  }
}

export default function HistoryContent() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchAnalyses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/history")
      if (!response.ok) {
        throw new Error("Failed to fetch analyses")
      }

      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error) {
      console.error("Error fetching analyses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch analysis history.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
  }, [])

  // Filter analyses based on search query and filters
  const filteredAnalyses = analyses.filter((analysis) => {
    // Search filter
    const searchMatch =
      searchQuery === "" ||
      analysis.result.userA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.result.userB.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Time filter
    let timeMatch = true
    const analysisDate = new Date(analysis.result.timestamp)
    const now = new Date()

    if (timeFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      timeMatch = analysisDate >= weekAgo
    } else if (timeFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      timeMatch = analysisDate >= monthAgo
    } else if (timeFilter === "year") {
      const yearAgo = new Date()
      yearAgo.setFullYear(now.getFullYear() - 1)
      timeMatch = analysisDate >= yearAgo
    }

    // Tag filter
    const tagMatch =
      tagFilter === "all" ||
      (tagFilter === "communication" &&
        analysis.result.insights.strengths.some((s) => s.toLowerCase().includes("communication"))) ||
      (tagFilter === "trust" && analysis.result.insights.strengths.some((s) => s.toLowerCase().includes("trust"))) ||
      (tagFilter === "conflict" &&
        analysis.result.insights.challenges.some((c) => c.toLowerCase().includes("conflict"))) ||
      (tagFilter === "emotions" &&
        analysis.result.insights.challenges.some((c) => c.toLowerCase().includes("emotion"))) ||
      (tagFilter === "attachment" &&
        analysis.result.insights.challenges.some((c) => c.toLowerCase().includes("attachment")))

    return searchMatch && timeMatch && tagMatch
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "all") {
      setTagFilter("all")
    } else {
      setTagFilter(value)
    }
  }

  // Handle delete analysis
  const handleDeleteAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/delete?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete analysis")
      }

      setAnalyses((prev) => prev.filter((analysis) => analysis.id !== id))

      toast({
        title: "Analysis deleted",
        description: "The analysis has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting analysis:", error)
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive",
      })
    }
  }

  // Handle download analysis
  const handleDownloadAnalysis = (id: string) => {
    const analysis = analyses.find((a) => a.id === id)
    if (!analysis) return

    // Create a JSON file for download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis.result))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `analysis-${id}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "Analysis downloaded",
      description: "The analysis has been downloaded as a JSON file.",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
            <p className="text-muted-foreground">View and manage your past relationship analyses</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search analyses..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={analyses.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="trust">Trust</TabsTrigger>
                <TabsTrigger value="conflict">Conflict</TabsTrigger>
                <TabsTrigger value="emotions">Emotions</TabsTrigger>
                <TabsTrigger value="attachment">Attachment</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      {filteredAnalyses.length} {filteredAnalyses.length === 1 ? "analysis" : "analyses"} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No analyses found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {searchQuery || timeFilter !== "all" || tagFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "You haven't performed any analyses yet"}
                        </p>
                        {!searchQuery && timeFilter === "all" && tagFilter === "all" && (
                          <div className="mt-6">
                            <p className="text-sm font-medium mb-3">Get started by analyzing your conversations</p>
                            <Button asChild>
                              <a href="/analysis/new">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Screenshots
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAnalyses.map((analysis) => (
                          <div
                            key={analysis.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4"
                          >
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">
                                  {format(new Date(analysis.result.timestamp), "MMMM d, yyyy")}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  ({formatDistanceToNow(new Date(analysis.result.timestamp), { addSuffix: true })})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {analysis.result.screenshotCount} screenshots
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {analysis.result.userA.name}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {analysis.result.userB.name}
                                </Badge>
                                {analysis.result.insights.strengths.some((s) => s.toLowerCase().includes("trust")) && (
                                  <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                                    trust
                                  </Badge>
                                )}
                                {analysis.result.insights.challenges.some((c) =>
                                  c.toLowerCase().includes("communication"),
                                ) && (
                                  <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                                    communication
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                              <div className="text-center px-4 py-2 bg-background rounded-md">
                                <p className="text-xs text-muted-foreground">Score</p>
                                <p className="text-xl font-bold">{analysis.result.relationshipHealth}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDownloadAnalysis(analysis.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  <span className="sr-only md:not-sr-only">Export</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteAnalysis(analysis.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  <span className="sr-only md:not-sr-only">Delete</span>
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => (window.location.href = `/analysis?id=${analysis.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {filteredAnalyses.length > 0 && (
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredAnalyses.length} of {analyses.length} analyses
                      </p>
                      <Button variant="outline" onClick={fetchAnalyses}>
                        Refresh
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
            {analyses.length === 0 && !isLoading && (
              <Card className="mt-6 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Analysis History</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Upload screenshots of your conversations to analyze relationship dynamics and build your analysis
                    history.
                  </p>
                  <Button size="lg" asChild>
                    <a href="/analysis/new">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Your First Screenshots
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {analyses.length > 0 && (
            <div className="md:col-span-1">
              <AnalysisGenerator />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
