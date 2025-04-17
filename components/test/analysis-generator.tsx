"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateRandomAnalysisResult, generateAnalysisId } from "@/lib/test/analysis-generator"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function AnalysisGenerator() {
  const [userA, setUserA] = useState("Alex")
  const [userB, setUserB] = useState("Jordan")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateAnalysis = async () => {
    setIsGenerating(true)
    try {
      // Generate a random analysis result
      const analysisId = generateAnalysisId()
      const analysisResult = generateRandomAnalysisResult(userA, userB)

      // Save the analysis to Redis
      const response = await fetch("/api/analysis/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: analysisId,
          result: analysisResult,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save analysis")
      }

      toast({
        title: "Analysis Generated",
        description: `Analysis for ${userA} and ${userB} has been generated and saved.`,
      })

      // Redirect to the analysis page
      window.location.href = `/analysis?id=${analysisId}`
    } catch (error) {
      console.error("Error generating analysis:", error)
      toast({
        title: "Error",
        description: "Failed to generate and save analysis.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Analysis Generator</CardTitle>
        <CardDescription>Generate random analysis results for testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userA">Person 1 Name</Label>
            <Input id="userA" value={userA} onChange={(e) => setUserA(e.target.value)} placeholder="Person 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userB">Person 2 Name</Label>
            <Input id="userB" value={userB} onChange={(e) => setUserB(e.target.value)} placeholder="Person 2" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={generateAnalysis} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Random Analysis"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
