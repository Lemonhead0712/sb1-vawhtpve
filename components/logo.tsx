import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  className?: string
}

export function Logo({ size = "md", withText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  return (
    <Link href="/dashboard" className={`flex items-center ${className}`}>
      <div className="relative">
        <Image
          src="/images/LoveLensLogo.png"
          alt="LoveLens Logo"
          width={sizes[size]}
          height={sizes[size]}
          className="object-contain"
          priority
        />
      </div>
      {withText && (
        <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lavender via-skyblue to-blush">
          LoveLens
        </span>
      )}
    </Link>
  )
}
