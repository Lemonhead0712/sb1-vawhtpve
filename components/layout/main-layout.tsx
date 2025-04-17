"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, BarChart2, TrendingUp, MessageCircle, User, Menu, X, LogOut, BarChart } from "lucide-react"
import { Logo } from "@/components/logo"
import { useTheme } from "next-themes"
import { HeartBackground } from "@/components/ui/heart-background"

type NavItem = {
  name: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
  { name: "Analysis", href: "/analysis", icon: <BarChart2 className="h-5 w-5" /> },
  { name: "Comparison", href: "/comparison", icon: <BarChart className="h-5 w-5" /> },
  { name: "Trends", href: "/trends", icon: <TrendingUp className="h-5 w-5" /> },
  { name: "Growth", href: "/growth", icon: <TrendingUp className="h-5 w-5" /> },
  { name: "AI Assistant", href: "/assistant", icon: <MessageCircle className="h-5 w-5" /> },
  { name: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <HeartBackground className="min-h-screen">
      <div className="min-h-screen flex flex-col">
        {/* Top navigation bar */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="container mx-auto px-4 flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" withText={true} />
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    pathname === item.href
                      ? "bg-lavender text-primary-foreground dark:bg-lavender-dark"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      pathname === item.href
                        ? "bg-lavender text-primary-foreground dark:bg-lavender-dark"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          )}
        </header>

        {/* Main content */}
        <main className="flex-grow bg-gray-50 dark:bg-gray-900">{children}</main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} LoveLens. All rights reserved.</p>
            <p className="mt-1">Helping build healthier relationships through emotional intelligence.</p>
          </div>
        </footer>
      </div>
    </HeartBackground>
  )
}
