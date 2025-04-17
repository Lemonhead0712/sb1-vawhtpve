"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "./sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { UserNav } from "@/components/ui/user-nav"
import { MessageSquare, Bell, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RedisHealthCheck } from "@/components/admin/redis-health-check"

interface AppLayoutProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

export default function AppLayout({ children, showBreadcrumbs = true }: AppLayoutProps) {
  const pathname = usePathname()
  const [hasRecentAnalysis, setHasRecentAnalysis] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const showScrollTop = scrollPosition > 400
  const isAdminPage = pathname?.startsWith("/admin")

  useEffect(() => {
    // Check for analysis results
    const results = getStoredAnalysisResults()
    setHasRecentAnalysis(!!results)

    // Setup scroll listener
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Generate breadcrumb items based on pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return []

    const paths = pathname.split("/").filter(Boolean)

    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`
      const isLast = index === paths.length - 1

      return {
        href,
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
        isLast,
      }
    })
  }

  const breadcrumbs = generateBreadcrumbs()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 bg-background/80 overflow-x-hidden heart-bg-pattern">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:px-6">
            <SidebarTrigger />

            {showBreadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />

                  {breadcrumbs.map((breadcrumb, i) => (
                    <BreadcrumbItem key={i}>
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            <div className="ml-auto flex items-center gap-4">
              {isAdminPage && <RedisHealthCheck compact autoRefresh refreshInterval={60} />}

              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {hasRecentAnalysis && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </Button>

              <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
                <MessageSquare className="h-5 w-5" />
              </Button>

              <UserNav />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">{children}</main>

          {showScrollTop && (
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-6 right-6 rounded-full shadow-lg z-20"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <ArrowUpCircle className="h-5 w-5" />
            </Button>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
