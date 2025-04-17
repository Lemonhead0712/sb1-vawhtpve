"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import AssistantContent from "./content"

export default function AssistantPage() {
  return (
    <Suspense fallback={<Loading text="Loading AI assistant..." />}>
      <AssistantContent />
    </Suspense>
  )
}
