"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Home, BarChart2, TrendingUp, MessageCircle, User, Menu, BarChart } from "lucide-react"

interface NavItem {
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

export default function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-4 py-5 text-left">
          <SheetTitle>Emotional Insights</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/50 data-[state=open]:bg-secondary/50",
                  pathname === item.href ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
