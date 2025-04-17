import Image from "next/image"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ size = "md", text = "Loading..." }: LoadingProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative animate-pulse">
        <Image
          src="/images/LoveLensLogo.png"
          alt="LoveLens Logo"
          width={sizes[size]}
          height={sizes[size]}
          className="object-contain"
        />
      </div>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
