"use client"

import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"
import ProfileContent from "./content"

const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  joinDate: "January 15, 2023",
  profileImage: "/placeholder.svg?height=128&width=128",
  relationshipStatus: "In a relationship",
  relationshipLength: "2-5 years",
  analysisCount: 12,
  lastAnalysis: "February 10, 2023",
  preferredName: "Alex",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
}

// Sample analysis history
const analysisHistory = [
  { id: "1", date: "March 10, 2023", screenshots: 8, score: 85, change: "+5" },
  { id: "2", date: "February 22, 2023", screenshots: 5, score: 80, change: "+2" },
  { id: "3", date: "February 5, 2023", screenshots: 10, score: 78, change: "+6" },
  { id: "4", date: "January 18, 2023", screenshots: 7, score: 72, change: "+4" },
  { id: "5", date: "January 2, 2023", screenshots: 6, score: 68, change: "-2" },
]

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading text="Loading profile..." />}>
      <ProfileContent />
    </Suspense>
  )
}
