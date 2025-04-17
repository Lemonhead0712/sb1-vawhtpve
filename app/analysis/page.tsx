"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import AnalysisContent from "./content"

export default function AnalysisPage() {
  return (
    <Suspense fallback={<Loading text="Loading analysis..." />}>
      <AnalysisContent />
    </Suspense>
  )
}
