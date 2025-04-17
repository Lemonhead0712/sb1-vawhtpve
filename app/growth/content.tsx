"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EmotionalGrowthBarChart } from "@/components/emotional-growth/bar-chart-comparison"
import { PlusCircle, Calendar, CheckCircle } from "lucide-react"

export default function GrowthContent() {
  const [activeTab, setActiveTab] = useState("goals")

  // Sample goals data
  const goals = [
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relationship Growth</h1>
            <p className="text-muted-foreground">Track your progress and set goals for relationship improvement</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>

        <Tabs defaultValue="goals" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="insights">Growth Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {goals.map((goal) => (
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
                  <Button>Add New Goal</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <EmotionalGrowthBarChart personA="Person 1" personB="Person 2" />
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Growth Insights</CardTitle>
                <CardDescription>Personalized insights based on your relationship progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Progress Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 mr-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </span>
                        <span>You've shown consistent improvement in active listening skills</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 mr-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </span>
                        <span>Your emotional expression has become more open and authentic</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 mr-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </span>
                        <span>You're making good progress on daily appreciation practices</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Next Steps</h3>
                    <p className="text-muted-foreground mb-2">
                      Based on your progress, here are recommended next steps:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mr-2">
                          <Calendar className="h-3.5 w-3.5" />
                        </span>
                        <span>Schedule a weekly relationship check-in</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mr-2">
                          <Calendar className="h-3.5 w-3.5" />
                        </span>
                        <span>Practice vulnerability by sharing one fear each week</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
