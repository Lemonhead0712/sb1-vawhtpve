"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import HistoryContent from "./content"

export default function HistoryPage() {
  return (
    <Suspense fallback={<Loading text="Loading history..." />}>
      <HistoryContent />
    </Suspense>
  )
}
