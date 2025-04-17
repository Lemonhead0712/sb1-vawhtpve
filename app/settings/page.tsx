"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import SettingsContent from "./content"

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading text="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  )
}
