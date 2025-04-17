"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScreenshotUploader } from "@/components/upload/screenshot-uploader"
import { NameCollectionForm } from "@/components/upload/name-collection-form"
import { Steps, Step } from "@/components/ui/steps"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export default function NewAnalysisContent() {
  const [currentStep, setCurrentStep] = useState<"names" | "upload" | "processing">("names")
  const [names, setNames] = useState<{ userA: string; userB: string } | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Prefill names from URL parameters if available
  const nameAFromUrl = searchParams.get("nameA")
  const nameBFromUrl = searchParams.get("nameB")

  // Use URL parameters if available
  if (nameAFromUrl && nameBFromUrl && !names) {
    setNames({
      userA: nameAFromUrl,
      userB: nameBFromUrl,
    })
    setCurrentStep("upload")
  }

  const handleNamesSubmitted = (submittedNames: { userA: string; userB: string }) => {
    setNames(submittedNames)
    setCurrentStep("upload")

    toast({
      title: "Names saved",
      description: `Analysis will be for ${submittedNames.userA} and ${submittedNames.userB}`,
    })
  }

  const handleAnalysisComplete = (results: any) => {
    setCurrentStep("processing")

    toast({
      title: "Analysis complete",
      description: "Your relationship analysis is ready to view",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
          <p className="text-muted-foreground">
            Upload screenshots of your conversations to analyze relationship dynamics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relationship Analysis</CardTitle>
            <CardDescription>
              Our AI analyzes your conversation screenshots to provide insights into your relationship dynamics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Steps currentStep={currentStep === "names" ? 1 : currentStep === "upload" ? 2 : 3} totalSteps={3}>
              <Step
                step={1}
                title="Identify People"
                description="Enter names of the people in the conversation"
                isActive={currentStep === "names"}
                isCompleted={currentStep === "upload" || currentStep === "processing"}
              />
              <Step
                step={2}
                title="Upload Screenshots"
                description="Upload screenshots of your conversations"
                isActive={currentStep === "upload"}
                isCompleted={currentStep === "processing"}
              />
              <Step
                step={3}
                title="View Analysis"
                description="Review your relationship insights"
                isActive={currentStep === "processing"}
              />
            </Steps>

            <div className="mt-8">
              {currentStep === "names" && <NameCollectionForm onNamesSubmitted={handleNamesSubmitted} />}

              {currentStep === "upload" && names && (
                <ScreenshotUploader onAnalysisComplete={handleAnalysisComplete} initialNames={names} />
              )}

              {currentStep === "processing" && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Your analysis is complete! You can now view your relationship insights.
                  </p>
                  <a href="/analysis" className="text-primary hover:underline">
                    View Analysis Results
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
