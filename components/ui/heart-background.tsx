"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface HeartBackgroundProps {
  className?: string
  density?: "low" | "medium" | "high"
  children?: React.ReactNode
}

export function HeartBackground({ className, density = "medium", children }: HeartBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Heart drawing function
    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.save()
      ctx.beginPath()
      ctx.translate(x, y)
      ctx.scale(size, size)

      // Heart shape
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-1, -1, -1.5, 0, 0, 1)
      ctx.bezierCurveTo(1.5, 0, 1, -1, 0, 0)

      // Fill with pink color
      ctx.fillStyle = `rgba(249, 168, 212, ${opacity})`
      ctx.fill()
      ctx.restore()
    }

    // Generate hearts
    const heartCount = density === "low" ? 20 : density === "medium" ? 40 : 60
    const hearts: Array<{ x: number; y: number; size: number; opacity: number; speed: number }> = []

    for (let i = 0; i < heartCount; i++) {
      hearts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.2 + 0.1,
        speed: Math.random() * 0.5 + 0.1,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw hearts
      hearts.forEach((heart) => {
        heart.y -= heart.speed
        if (heart.y < -20) heart.y = canvas.height + 20

        drawHeart(heart.x, heart.y, heart.size, heart.opacity)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [density])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 bg-gradient-to-br from-blushPurple-light to-pinkHeart-light"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
