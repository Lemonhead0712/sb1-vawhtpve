import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import NotFoundContent from "../404/content"

export default function NotFoundPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-lavender via-skyblue to-blush">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Page Not Found</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loading size="md" text="Loading..." />
            </CardContent>
          </Card>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  )
}
