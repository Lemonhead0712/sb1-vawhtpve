import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface StepProps {
  step: number
  title: string
  description?: string
  isActive?: boolean
  isCompleted?: boolean
}

export function Step({ step, title, description, isActive = false, isCompleted = false }: StepProps) {
  return (
    <div className="flex items-start">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-center font-medium",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : isCompleted
              ? "border-primary bg-primary/20 text-primary"
              : "border-muted-foreground/20 text-muted-foreground",
        )}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <div className="ml-4 space-y-1">
        <p className={cn("text-base font-medium leading-none", isActive ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </p>
        {description && (
          <p className={cn("text-sm", isActive ? "text-muted-foreground" : "text-muted-foreground/60")}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface StepsProps {
  currentStep: number
  totalSteps: number
  children: React.ReactNode
}

export function Steps({ currentStep, totalSteps, children }: StepsProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-6">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="flex items-start">
            {child}
            {index < totalSteps - 1 && (
              <div
                className={cn("ml-4 h-10 w-px bg-muted-foreground/20", index < currentStep - 1 && "bg-primary/60")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
