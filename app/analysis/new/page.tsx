import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import NewAnalysisContent from "./content"

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<Loading text="Loading analysis form..." />}>
      <NewAnalysisContent />
    </Suspense>
  )
}
