"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  TrendingUp,
  ArrowRight,
  Upload,
  BarChart2,
  MessageCircle,
  Calendar,
  Heart,
  CheckCircle,
  PlusCircle,
  Clock,
  Users,
} from "lucide-react"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import { formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function DashboardContent() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const results = getStoredAnalysisResults()
      setAnalysisResults(results)
      setLoading(false)
    }, 800)
  }, [])

  const healthScore = analysisResults?.relationshipHealth || 0
  const person1 = analysisResults?.userA?.name || "Person 1"
  const person2 = analysisResults?.userB?.name || "Person 2"

  const recentActivities = [
    {
      id: "1",
      title: "Completed Emotional Analysis",
      description: analysisResults
        ? `${analysisResults.screenshotCount} screenshots analyzed`
        : "Upload screenshots to get started",
      time: analysisResults ? formatDistanceToNow(new Date(analysisResults.timestamp), { addSuffix: true }) : "Now",
      icon: <Activity className="h-4 w-4 text-primary" />,
      link: "/analysis",
    },
    {
      id: "2",
      title: "New Growth Goal Set",
      description: "Practice active listening techniques",
      time: "2 days ago",
      icon: <TrendingUp className="h-4 w-4 text-secondary" />,
      link: "/growth",
    },
    {
      id: "3",
      title: "AI Coaching Session",
      description: "Discussed communication improvements",
      time: "3 days ago",
      icon: <MessageCircle className="h-4 w-4 text-accent" />,
      link: "/assistant",
    },
  ]

  const upcomingGoals = [
    {
      id: "1",
      title: "Daily check-in",
      description: "Share emotions and experiences",
      dueDate: "Today",
      progress: 0,
      status: "pending",
    },
    {
      id: "2",
      title: "Active listening practice",
      description: "20 minutes of focused conversation",
      dueDate: "Tomorrow",
      progress: 30,
      status: "in-progress",
    },
    {
      id: "3",
      title: "Appreciation journal",
      description: "Write down three things you appreciate about your partner",
      dueDate: "This week",
      progress: 70,
      status: "in-progress",
    },
  ]

  const insights = analysisResults?.insights || {
    strengths: ["Strong foundation of trust", "Effective communication patterns", "Healthy emotional expression"],
    challenges: [
      "Occasional defensiveness during conflicts",
      "Mismatched expectations around responses",
      "Difficulty expressing vulnerability",
    ],
    recommendations: [
      "Practice active listening",
      "Set aside dedicated time for deeper conversations",
      "Express appreciation regularly",
    ],
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back. Here's an overview of your relationship insights.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="sm:w-auto w-full">
              <a href="/analysis/new">
                <BarChart2 className="mr-2 h-4 w-4" />
                New Analysis
              </a>
            </Button>
            <Button asChild variant="outline" className="sm:w-auto w-full">
              <a href="/assistant">
                <MessageCircle className="mr-2 h-4 w-4" />
                Talk to AI Coach
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relationship Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative pt-4">
                <div className="text-2xl font-bold">{healthScore}/100</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {healthScore < 50
                    ? "Needs attention"
                    : healthScore < 70
                      ? "Growing steadily"
                      : healthScore < 90
                        ? "Healthy"
                        : "Exceptional"}
                </div>
                <Progress
                  value={healthScore}
                  className="h-2 mt-3"
                  indicatorClassName={
                    healthScore < 50
                      ? "bg-red-500"
                      : healthScore < 70
                        ? "bg-amber-500"
                        : healthScore < 90
                          ? "bg-green-500"
                          : "bg-blue-500"
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communication Quality</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative pt-4">
                <div className="text-2xl font-bold">{analysisResults ? "Good" : "No data"}</div>
                <div className="text-xs text-muted-foreground mt-1">Based on tone and response patterns</div>
                <div className="flex gap-1 mt-3">
                  {["Poor", "Fair", "Good", "Great", "Excellent"].map((label, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < 3 ? "bg-primary/30" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative pt-4">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-muted-foreground mt-1">2 in progress, 1 due today</div>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="bg-secondary/20 rounded-full p-1">
                            <Clock className="h-3 w-3 text-secondary" />
                          </div>
                          <span className="text-xs mt-1">Daily</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Daily check-in goal</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="bg-primary/20 rounded-full p-1">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs mt-1">Weekly</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Active listening goal</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="bg-accent/20 rounded-full p-1">
                            <Heart className="h-3 w-3 text-accent" />
                          </div>
                          <span className="text-xs mt-1">Weekly</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Appreciation journal goal</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative pt-4">
                <div className="text-2xl font-bold">3 days</div>
                <div className="text-xs text-muted-foreground mt-1">Weekly relationship check-in</div>
                <div className="w-full bg-muted h-2 rounded-full mt-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest relationship interactions and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, i) => (
                      <div key={activity.id} className="flex items-start">
                        <div className="mr-4 mt-0.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            {activity.icon}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={activity.link}>
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/profile">View All Activity</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>{analysisResults ? "Emotional Dynamics" : "No Analysis Data"}</CardTitle>
                  <CardDescription>
                    {analysisResults
                      ? `How ${person1} and ${person2} interact emotionally`
                      : "Complete your first analysis to see insights"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  {analysisResults ? (
                    <div className="rounded-md bg-muted/50 p-4 h-[220px] flex items-center justify-center">
                      <div className="text-center">
                        <BarChart2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Emotional data visualization will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-muted p-8 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium mb-2">No Analysis Data Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload screenshots of conversations to get emotional insights
                      </p>
                      <Button asChild>
                        <a href="/analysis/new">Start Your First Analysis</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
                {analysisResults && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/insights">View Detailed Insights</a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Goals</CardTitle>
                  <CardDescription>Relationship growth activities to complete</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGoals.map((goal) => (
                      <div key={goal.id} className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                goal.status === "pending"
                                  ? "bg-amber-500"
                                  : goal.status === "in-progress"
                                    ? "bg-primary"
                                    : "bg-green-500"
                              }`}
                            />
                            <span className="text-sm font-medium">{goal.title}</span>
                          </div>
                          <Badge variant="outline">{goal.dueDate}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                        <Progress value={goal.progress} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/growth">View All Goals</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/growth">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Goal
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relationship Strengths</CardTitle>
                  <CardDescription>Areas where your relationship excels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 mr-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/insights">See All Insights</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Suggested actions to strengthen your relationship</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mr-2">
                          <Heart className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/assistant">Get Personalized Advice</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-auto py-4 px-2 flex flex-col" asChild>
                    <a href="/analysis/new">
                      <Upload className="h-5 w-5 mb-2" />
                      <span className="text-sm">New Analysis</span>
                    </a>
                  </Button>

                  <Button className="h-auto py-4 px-2 flex flex-col" asChild>
                    <a href="/assistant">
                      <MessageCircle className="h-5 w-5 mb-2" />
                      <span className="text-sm">AI Coach</span>
                    </a>
                  </Button>

                  <Button variant="outline" className="h-auto py-4 px-2 flex flex-col" asChild>
                    <a href="/growth">
                      <TrendingUp className="h-5 w-5 mb-2" />
                      <span className="text-sm">Set Goals</span>
                    </a>
                  </Button>

                  <Button variant="outline" className="h-auto py-4 px-2 flex flex-col" asChild>
                    <a href="/comparison">
                      <BarChart2 className="h-5 w-5 mb-2" />
                      <span className="text-sm">Compare Emotions</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emotional Insights</CardTitle>
                <CardDescription>Key observations from your relationship analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Relationship Strengths</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {insights.strengths.map((strength, i) => (
                        <div key={i} className="flex items-start p-3 rounded-md bg-muted/50">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                            <CheckCircle className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm">{strength}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Growth Opportunities</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {insights.challenges.map((challenge, i) => (
                        <div key={i} className="flex items-start p-3 rounded-md bg-muted/50">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-3">
                            <Activity className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm">{challenge}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Personalized Recommendations</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {insights.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start p-3 rounded-md bg-muted/50">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mr-3">
                            <Heart className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <a href="/analysis/new">Get Fresh Insights with New Analysis</a>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingGoals.map((goal) => (
                <Card key={goal.id} className="card-interactive">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge
                        variant={
                          goal.status === "pending"
                            ? "outline"
                            : goal.status === "in-progress"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {goal.status === "pending"
                          ? "Not Started"
                          : goal.status === "in-progress"
                            ? "In Progress"
                            : "Completed"}
                      </Badge>
                      <Badge variant="outline">{goal.dueDate}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium text-lg mb-1">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Update Progress
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card className="flex flex-col items-center justify-center border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Create New Goal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set a new relationship growth goal</p>
                  <Button asChild>
                    <a href="/growth">Add New Goal</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
