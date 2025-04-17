import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-lavender via-skyblue to-blush">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Loading</CardTitle>
          <CardDescription>Please wait while we prepare your experience</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  )
}
