import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkRateLimit } from "./lib/redis"

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Different rate limits for different API endpoints
    let maxRequests = 50 // Default: 50 requests per minute
    const windowInSeconds = 60

    if (request.nextUrl.pathname.startsWith("/api/analyze")) {
      // More restrictive for resource-intensive endpoints
      maxRequests = 10
    }

    const rateLimit = await checkRateLimit(`api:${ip}:${request.nextUrl.pathname}`, maxRequests, windowInSeconds)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        },
      )
    }

    // Continue with the request
    const response = NextResponse.next()

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString())

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
