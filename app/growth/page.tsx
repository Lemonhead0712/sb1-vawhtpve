"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
} from "lucide-react"
import { getStoredAnalysisResults, type AnalysisResult } from "@/lib/screenshot-analysis"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { EmotionalGrowthBarChart } from "@/components/emotional-growth/bar-chart-comparison"
import { PersonalityBlueprintComparison } from "@/components/personality/blueprint-comparison"

// Sample habits data
const habitsData = [
  { id: "1", title: "Morning check-in", completed: true, streak: 12 },
  { id: "2", title: "Appreciation sharing", completed: true, streak: 24 },
  { id: "3", title: "Active listening practice", completed: false, streak: 5 },
  { id: "4", title: "Conflict pause & reflect", completed: true, streak: 8 },
  { id: "5", title: "Evening gratitude", completed: false, streak: 15 },
]

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState("progress")
  const [habits, setHabits] = useState(habitsData)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const [goals, setGoals] = useState<
    Array<typeof analysisResults extends null ? never : (typeof analysisResults.goals)[0] & { progress: number }>
  >([])
  const router = useRouter()

  useEffect(() => {
    // Load analysis results from storage
    const results = getStoredAnalysisResults()
    setAnalysisResults(results)

    // If we have results, set up goals with random progress
    if (results?.goals) {
      const goalsWithProgress = results.goals.map((goal) => ({
        ...goal,
        progress: Math.floor(Math.random() * 100), // Random progress for demo
      }))
      setGoals(goalsWithProgress)
    }
  }, [])

  const toggleHabit = (id: string) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, completed: !habit.completed } : habit)))
  }

  // Calculate overall relationship health score
  const currentHealthScore = analysisResults?.relationshipHealth || 0
  const previousHealthScore = Math.max(30, currentHealthScore - 10) // Simulate previous score
  const healthScoreDifference = currentHealthScore - previousHealthScore

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Relationship Growth</h1>
          <p className="text-muted-foreground mt-1">Track your progress and set goals for relationship improvement</p>
        </div>

        {!analysisResults ? (
          <Card className="w-full p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-muted rounded-full p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                To see personalized growth recommendations and track your progress, you need to complete a relationship
                analysis first.
              </p>
              <Button onClick={() => router.push("/analysis")}>Go to Analysis</Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="card-hover-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Relationship Health</CardTitle>
                  <CardDescription>Overall relationship score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold">{currentHealthScore}</p>
                      <div className="flex items-center mt-1">
                        {healthScoreDifference > 0 ? (
                          <>
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500 text-sm">+{healthScoreDifference} pts</span>
                          </>
                        ) : healthScoreDifference < 0 ? (
                          <>
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-red-500 text-sm">{healthScoreDifference} pts</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-500 text-sm">No change</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-lavender flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Goals</CardTitle>
                  <CardDescription>Goals in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold">{goals.length}</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        {goals.filter((g) => g.progress >= 50).length} on track
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-skyblue flex items-center justify-center">
                      <Target className="h-8 w-8 text-secondary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Habit Streak</CardTitle>
                  <CardDescription>Longest active streak</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold">{Math.max(...habits.map((h) => h.streak))}</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        {habits.filter((h) => h.completed).length}/{habits.length} completed today
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-blush flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-accent-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="habits">Habits</TabsTrigger>
              </TabsList>

              <TabsContent value="progress">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EmotionalGrowthBarChart
                    personA={analysisResults?.userA?.name}
                    personB={analysisResults?.userB?.name}
                  />

                  <PersonalityBlueprintComparison
                    personA={analysisResults?.userA?.name}
                    personB={analysisResults?.userB?.name}
                  />

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Growth Insights</CardTitle>
                      <CardDescription>Key observations and recommendations based on your progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-lavender/20 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Strongest Growth</h3>
                          <p className="text-sm">
                            <span className="font-medium">
                              {analysisResults.userA.dominantEmotion === "trust" ||
                              analysisResults.userA.dominantEmotion === "joy"
                                ? "Trust"
                                : "Communication"}
                              (+25%)
                            </span>{" "}
                            has shown the most improvement between {analysisResults.userA.name || "Person 1"} and{" "}
                            {analysisResults.userB.name || "Person 2"} over the past 3 months, indicating successful
                            relationship-building activities.
                          </p>
                        </div>
                        <div className="bg-skyblue/20 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Area Needing Focus</h3>
                          <p className="text-sm">
                            <span className="font-medium">
                              {analysisResults.userA.emotions.anger > 0.3 || analysisResults.userB.emotions.anger > 0.3
                                ? "Conflict Resolution"
                                : "Emotional Vulnerability"}
                              (+15%)
                            </span>{" "}
                            has shown the slowest growth between {analysisResults.userA.name || "Person 1"} and{" "}
                            {analysisResults.userB.name || "Person 2"}. Consider focusing on this area in your
                            relationship.
                          </p>
                        </div>
                        <div className="bg-blush/20 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Recent Improvement</h3>
                          <p className="text-sm">
                            <span className="font-medium">
                              {analysisResults.userA.attachment.secure > 0.6 &&
                              analysisResults.userB.attachment.secure > 0.6
                                ? "Secure Attachment"
                                : "Communication"}
                              (+30%)
                            </span>{" "}
                            has improved significantly between {analysisResults.userA.name || "Person 1"} and{" "}
                            {analysisResults.userB.name || "Person 2"} in the last month, likely due to your consistent
                            practice.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="card-hover-effect">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{goal.title}</CardTitle>
                            <CardDescription>{goal.description}</CardDescription>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.category === "communication"
                                ? "bg-lavender/20 text-primary-foreground"
                                : goal.category === "connection"
                                  ? "bg-skyblue/20 text-secondary-foreground"
                                  : goal.category === "conflict"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blush/20 text-accent-foreground"
                            }`}
                          >
                            {goal.category}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{goal.progress}% complete</span>
                            <span className="text-xs text-muted-foreground">
                              {goal.progress < 30
                                ? "Just started"
                                : goal.progress < 70
                                  ? "In progress"
                                  : goal.progress < 100
                                    ? "Almost there"
                                    : "Completed"}
                            </span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Update Progress
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 h-[200px]">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">Add New Goal</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Create a new relationship goal to track your progress
                    </p>
                    <Button variant="outline">Create Goal</Button>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="habits">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Relationship Habits</CardTitle>
                    <CardDescription>Track your daily habits to build a stronger relationship</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {habits.map((habit) => (
                        <div key={habit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`habit-${habit.id}`}
                              checked={habit.completed}
                              onCheckedChange={() => toggleHabit(habit.id)}
                            />
                            <Label htmlFor={`habit-${habit.id}`} className="font-medium">
                              {habit.title}
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center mr-4">
                              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm text-muted-foreground">{habit.streak} day streak</span>
                            </div>
                            {habit.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Add New Habit
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  )
}
