"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import GrowthContent from "./content"

export default function GrowthPage() {
  return (
    <Suspense fallback={<Loading text="Loading growth data..." />}>
      <GrowthContent />
    </Suspense>
  )
}
