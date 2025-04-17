"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, FileText, Filter, Search, Trash2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { kv } from "@vercel/kv"
import { useSearchParams } from "next/navigation"

// Sample analysis history data
const sampleAnalysisHistory = [
  {
    id: "1",
    date: "2023-03-10T12:00:00Z",
    screenshots: 8,
    score: 85,
    change: "+5",
    people: ["Alex", "Jordan"],
    tags: ["communication", "trust"],
  },
  {
    id: "2",
    date: "2023-02-22T12:00:00Z",
    screenshots: 5,
    score: 80,
    change: "+2",
    people: ["Alex", "Jordan"],
    tags: ["conflict", "emotions"],
  },
  {
    id: "3",
    date: "2023-02-05T12:00:00Z",
    screenshots: 10,
    score: 78,
    change: "+6",
    people: ["Alex", "Jordan"],
    tags: ["communication", "attachment"],
  },
  {
    id: "4",
    date: "2023-01-18T12:00:00Z",
    screenshots: 7,
    score: 72,
    change: "+4",
    people: ["Alex", "Jordan"],
    tags: ["trust", "emotions"],
  },
  {
    id: "5",
    date: "2023-01-02T12:00:00Z",
    screenshots: 6,
    score: 68,
    change: "-2",
    people: ["Alex", "Jordan"],
    tags: ["conflict", "communication"],
  },
]

export default function HistoryContent() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [analysisHistory, setAnalysisHistory] = useState(sampleAnalysisHistory)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      setIsLoading(true)
      try {
        // Try to fetch from Redis first (for faster access)
        let cachedHistory
        try {
          cachedHistory = await kv.get("analysis_history")
        } catch (error) {
          console.error("Redis fetch error:", error)
        }

        if (cachedHistory) {
          setAnalysisHistory(cachedHistory)
        } else {
          // If not in Redis, fetch from Supabase
          const { data, error } = await supabase
            .from("analysis_requests")
            .select("*")
            .order("created_at", { ascending: false })

          if (error) {
            throw error
          }

          if (data && data.length > 0) {
            // Transform data to match our expected format
            const formattedData = data.map((item) => ({
              id: item.id,
              date: item.created_at,
              screenshots: item.screenshot_count || 0,
              score: item.results?.relationshipHealth || 0,
              change: "+0", // Would need to calculate this based on previous analysis
              people: [item.person_a_name, item.person_b_name],
              tags: item.tags || ["communication"],
            }))

            setAnalysisHistory(formattedData)

            // Cache in Redis for faster future access
            try {
              await kv.set("analysis_history", formattedData, { ex: 3600 }) // Expire after 1 hour
            } catch (error) {
              console.error("Redis cache error:", error)
            }
          } else {
            // If no data in Supabase, use sample data
            setAnalysisHistory(sampleAnalysisHistory)
          }
        }
      } catch (error) {
        console.error("Error fetching analysis history:", error)
        toast({
          title: "Error fetching history",
          description: "Using sample data instead.",
          variant: "destructive",
        })
        // Fallback to sample data
        setAnalysisHistory(sampleAnalysisHistory)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysisHistory()
  }, [toast, supabase])

  // Filter analysis history based on search query and filters
  const filteredHistory = analysisHistory.filter((analysis) => {
    // Search filter
    const searchMatch =
      searchQuery === "" ||
      analysis.people.some((person) => person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      analysis.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Time filter
    let timeMatch = true
    const analysisDate = new Date(analysis.date)
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
    const tagMatch = tagFilter === "all" || analysis.tags.includes(tagFilter)

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
      // Delete from Supabase
      const { error } = await supabase.from("analysis_requests").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setAnalysisHistory((prev) => prev.filter((analysis) => analysis.id !== id))

      // Update Redis cache
      try {
        await kv.set(
          "analysis_history",
          analysisHistory.filter((analysis) => analysis.id !== id),
          { ex: 3600 },
        )
      } catch (error) {
        console.error("Redis update error:", error)
      }

      toast({
        title: "Analysis deleted",
        description: "The analysis has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting analysis:", error)
      toast({
        title: "Error deleting analysis",
        description: "There was an error deleting the analysis.",
        variant: "destructive",
      })
    }
  }

  // Handle download analysis
  const handleDownloadAnalysis = (id: string) => {
    const analysis = analysisHistory.find((a) => a.id === id)
    if (!analysis) return

    // Create a JSON file for download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis))
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
                  {filteredHistory.length} {filteredHistory.length === 1 ? "analysis" : "analyses"} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No analyses found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchQuery || timeFilter !== "all" || tagFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "You haven't performed any analyses yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4"
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{format(new Date(analysis.date), "MMMM d, yyyy")}</p>
                            <span className="text-xs text-muted-foreground">
                              ({formatDistanceToNow(new Date(analysis.date), { addSuffix: true })})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {analysis.screenshots} screenshots
                            </Badge>
                            {analysis.people.map((person, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {person}
                              </Badge>
                            ))}
                            {analysis.tags.map((tag, index) => (
                              <Badge key={index} className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                          <div className="text-center px-4 py-2 bg-background rounded-md">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-xl font-bold">{analysis.score}</p>
                            <p
                              className={`text-xs ${analysis.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                            >
                              {analysis.change}
                            </p>
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
              {filteredHistory.length > 0 && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredHistory.length} of {analysisHistory.length} analyses
                  </p>
                  <Button variant="outline">Load More</Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
