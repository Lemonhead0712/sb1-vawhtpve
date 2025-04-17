import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import TrendsContent from "./content"

export default function TrendsPage() {
  return (
    <Suspense fallback={<Loading text="Loading trends..." />}>
      <TrendsContent />
    </Suspense>
  )
}
