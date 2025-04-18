import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-lavender via-skyblue to-blush">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>We couldn't find the page you were looking for.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="text-8xl font-bold text-muted-foreground mb-6">404</div>
          <p className="text-center text-muted-foreground mb-6">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
