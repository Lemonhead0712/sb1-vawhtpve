"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Client-side redirect after component mounts
    router.push("/login")
  }, [router])

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lavender via-skyblue to-blush">
      <div className="animate-pulse">
        <Logo size="lg" withText={true} />
      </div>
      <p className="mt-4 text-white text-opacity-80">Redirecting to login...</p>
    </div>
  )
}
