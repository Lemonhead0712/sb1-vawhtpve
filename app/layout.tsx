import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { Suspense } from "react"
import { Loading } from "@/components/ui/loading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LoveLens - Relationship Intelligence",
  description: "Analyze relationship text message screenshots and get emotional intelligence insights",
  icons: {
    icon: "/images/LoveLensLogo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={<Loading />}>
            {children}
            <Toaster />
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'