"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import ComparisonContent from "./content"

export default function ComparisonPage() {
  return (
    <Suspense fallback={<Loading text="Loading comparison..." />}>
      <ComparisonContent />
    </Suspense>
  )
}
