import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  className?: string
  imageOnly?: boolean
}

export function Logo({ size = "md", withText = true, imageOnly = false, className = "" }: LogoProps) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  const LogoContent = (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <div className="relative flex items-center justify-center rounded-full bg-primary/10 p-1">
          <div className="animate-pulse-glow relative z-10">
            <Image
              src="/placeholder.svg"
              alt="EmotionIQ Logo"
              width={sizes[size]}
              height={sizes[size]}
              className="rounded-full object-contain"
              priority
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        </div>
      </div>

      {withText && !imageOnly && (
        <span className="ml-2 font-bold tracking-tight leading-none">
          <span className="text-primary">Emotion</span>
          <span className="text-foreground">IQ</span>
        </span>
      )}
    </div>
  )

  if (imageOnly) {
    return LogoContent
  }

  return (
    <Link href="/dashboard" aria-label="EmotionIQ Dashboard">
      {LogoContent}
    </Link>
  )
}
