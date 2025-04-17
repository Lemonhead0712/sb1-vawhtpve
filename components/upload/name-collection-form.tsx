"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface NameCollectionFormProps {
  onNamesSubmitted: (names: { userA: string; userB: string }) => void
  isOptional?: boolean
}

export function NameCollectionForm({ onNamesSubmitted, isOptional = false }: NameCollectionFormProps) {
  const [userAName, setUserAName] = useState("")
  const [userBName, setUserBName] = useState("")
  const [errors, setErrors] = useState<{ userA?: string; userB?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    const newErrors: { userA?: string; userB?: string } = {}

    if (!isOptional && !userAName.trim()) {
      newErrors.userA = "Please enter a name for Person 1"
    }

    if (!isOptional && !userBName.trim()) {
      newErrors.userB = "Please enter a name for Person 2"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Use default names if fields are left empty in optional mode
    const finalUserA = userAName.trim() || "Person 1"
    const finalUserB = userBName.trim() || "Person 2"

    onNamesSubmitted({
      userA: finalUserA,
      userB: finalUserB,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Who are you analyzing?</CardTitle>
        <CardDescription>
          Enter the names of the two people in the conversation to personalize your analysis.
          {isOptional && " This step is optional."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userAName" className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-pink-400 mr-2"></span>
              Person 1 (right side of messages)
              {isOptional && <span className="text-muted-foreground ml-1">(optional)</span>}
            </Label>
            <Input
              id="userAName"
              placeholder="e.g., Alex"
              value={userAName}
              onChange={(e) => {
                setUserAName(e.target.value)
                if (errors.userA) setErrors({ ...errors, userA: undefined })
              }}
              className={errors.userA ? "border-red-500" : ""}
            />
            {errors.userA && <p className="text-sm text-red-500">{errors.userA}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userBName" className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
              Person 2 (left side of messages)
              {isOptional && <span className="text-muted-foreground ml-1">(optional)</span>}
            </Label>
            <Input
              id="userBName"
              placeholder="e.g., Jordan"
              value={userBName}
              onChange={(e) => {
                setUserBName(e.target.value)
                if (errors.userB) setErrors({ ...errors, userB: undefined })
              }}
              className={errors.userB ? "border-red-500" : ""}
            />
            {errors.userB && <p className="text-sm text-red-500">{errors.userB}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Continue to Upload
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
