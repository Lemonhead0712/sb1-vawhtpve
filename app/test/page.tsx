"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import AppLayout from "@/components/layout/app-layout"
import { AnalysisGenerator } from "@/components/test/analysis-generator"

export default function TestPage() {
  return (
    <Suspense fallback={<Loading text="Loading test tools..." />}>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Tools</h1>
            <p className="text-muted-foreground">Generate test data for the application</p>
          </div>

          <div className="max-w-md mx-auto">
            <AnalysisGenerator />
          </div>
        </div>
      </AppLayout>
    </Suspense>
  )
}
