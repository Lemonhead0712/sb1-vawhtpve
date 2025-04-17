"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart2,
  TrendingUp,
  MessageCircle,
  User,
  Settings,
  HelpCircle,
  Activity,
  LayoutDashboard,
  Gauge,
  Github,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"

type NavItem = {
  name: string
  href: string
  icon: React.ReactNode
  subItems?: { name: string; href: string }[]
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Analysis",
      href: "/analysis",
      icon: <Activity className="h-5 w-5" />,
      subItems: [
        { name: "New Analysis", href: "/analysis/new" },
        { name: "History", href: "/analysis/history" },
      ],
    },
    {
      name: "Insights",
      href: "/insights",
      icon: <Gauge className="h-5 w-5" />,
    },
    {
      name: "Comparison",
      href: "/comparison",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Growth",
      href: "/growth",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "AI Coach",
      href: "/assistant",
      icon: <MessageCircle className="h-5 w-5" />,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b py-3">
        <div className="flex flex-col items-center gap-2 px-4">
          <Logo size="lg" withText />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              {item.subItems ? (
                <>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.name}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                          <Link href={subItem.href}>{subItem.name}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </>
              ) : (
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t py-3">
        <div className="flex flex-col gap-2 px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/profile">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="flex items-center justify-between mt-2 px-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
