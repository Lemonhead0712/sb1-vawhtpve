"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Heart, MessageSquare, Shield, Lightbulb } from "lucide-react"

interface PersonalityBlueprint {
  communicationStyle: {
    primary: string
    description: string
    strengths: string[]
    challenges: string[]
  }
  emotionalPattern: {
    primary: string
    description: string
    triggers: string[]
    responses: string[]
  }
  attachmentStyle: {
    type: string
    description: string
    needs: string[]
    fears: string[]
  }
  conflictResolution: {
    approach: string
    description: string
    effective: string[]
    ineffective: string[]
  }
  growthAreas: {
    primary: string
    description: string
    suggestions: string[]
  }
}

// Sample data for personality blueprints
const generatePersonalityBlueprint = (name: string): PersonalityBlueprint => {
  const blueprints: Record<string, PersonalityBlueprint> = {
    "Person 1": {
      communicationStyle: {
        primary: "Direct & Analytical",
        description: "Prefers clear, concise communication with logical reasoning and evidence.",
        strengths: ["Clarity in expression", "Logical problem-solving", "Efficiency in conversations"],
        challenges: ["May come across as blunt", "Sometimes misses emotional cues", "Can be perceived as impatient"],
      },
      emotionalPattern: {
        primary: "Reserved Expression",
        description: "Tends to process emotions internally before sharing them with others.",
        triggers: ["Feeling misunderstood", "Perceived inefficiency", "Unexpected changes"],
        responses: ["Initial withdrawal", "Analytical processing", "Delayed but thoughtful expression"],
      },
      attachmentStyle: {
        type: "Secure with Avoidant Tendencies",
        description: "Generally secure but may need space during stress or conflict.",
        needs: ["Respect for independence", "Intellectual connection", "Time to process emotions"],
        fears: ["Being controlled", "Emotional overwhelm", "Incompetence"],
      },
      conflictResolution: {
        approach: "Problem-Solving Oriented",
        description: "Focuses on finding solutions rather than dwelling on emotions during conflicts.",
        effective: ["Logical discussions", "Taking breaks when needed", "Written communication"],
        ineffective: ["Emotional appeals", "Raising voice", "Bringing up past issues"],
      },
      growthAreas: {
        primary: "Emotional Expression",
        description: "Developing more comfort with expressing emotions in the moment.",
        suggestions: [
          "Practice naming feelings in real-time",
          "Share vulnerabilities in small steps",
          "Ask for what you need directly",
        ],
      },
    },
    "Person 2": {
      communicationStyle: {
        primary: "Expressive & Relational",
        description: "Communicates with emotion and values the relationship context of conversations.",
        strengths: ["Emotional awareness", "Creating connection", "Empathetic listening"],
        challenges: ["Can be verbose", "Sometimes emotionally reactive", "May avoid difficult topics"],
      },
      emotionalPattern: {
        primary: "Open Expression",
        description: "Tends to express emotions as they arise and values emotional sharing.",
        triggers: ["Feeling dismissed", "Perceived coldness", "Lack of response"],
        responses: ["Immediate expression", "Seeking reassurance", "Desire to discuss and process"],
      },
      attachmentStyle: {
        type: "Secure with Anxious Tendencies",
        description: "Generally secure but may seek reassurance during uncertainty.",
        needs: ["Regular affirmation", "Emotional connection", "Collaborative decision-making"],
        fears: ["Abandonment", "Being misunderstood", "Disconnection"],
      },
      conflictResolution: {
        approach: "Connection-Oriented",
        description: "Prioritizes maintaining the relationship during conflicts.",
        effective: ["Emotional validation", "Face-to-face discussions", "Reassurance of commitment"],
        ineffective: ["Cold logic without empathy", "Withdrawal", "Delayed responses"],
      },
      growthAreas: {
        primary: "Emotional Regulation",
        description: "Developing more balance in emotional responses during stress.",
        suggestions: [
          "Practice pausing before responding",
          "Develop self-soothing techniques",
          "Balance emotional needs with practical solutions",
        ],
      },
    },
  }

  return blueprints[name] || blueprints["Person 1"]
}

interface PersonalityBlueprintComparisonProps {
  personA?: string
  personB?: string
  className?: string
}

export function PersonalityBlueprintComparison({
  personA = "Person 1",
  personB = "Person 2",
  className,
}: PersonalityBlueprintComparisonProps) {
  const blueprintA = generatePersonalityBlueprint(personA)
  const blueprintB = generatePersonalityBlueprint(personB)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Personality Blueprints</CardTitle>
        <CardDescription>Detailed personality profiles based on communication patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="communication">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="communication">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="emotional">
              <Heart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Emotional</span>
            </TabsTrigger>
            <TabsTrigger value="attachment">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Attachment</span>
            </TabsTrigger>
            <TabsTrigger value="conflict">
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Conflict</span>
            </TabsTrigger>
            <TabsTrigger value="growth">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Growth</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-lavender text-primary-foreground mr-2">{personA}</Badge>
                  <h3 className="font-medium">{blueprintA.communicationStyle.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintA.communicationStyle.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.communicationStyle.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Challenges</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.communicationStyle.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-skyblue text-secondary-foreground mr-2">{personB}</Badge>
                  <h3 className="font-medium">{blueprintB.communicationStyle.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintB.communicationStyle.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.communicationStyle.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Challenges</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.communicationStyle.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="emotional" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-lavender text-primary-foreground mr-2">{personA}</Badge>
                  <h3 className="font-medium">{blueprintA.emotionalPattern.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintA.emotionalPattern.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Emotional Triggers</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.emotionalPattern.triggers.map((trigger, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Typical Responses</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.emotionalPattern.responses.map((response, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {response}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-skyblue text-secondary-foreground mr-2">{personB}</Badge>
                  <h3 className="font-medium">{blueprintB.emotionalPattern.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintB.emotionalPattern.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Emotional Triggers</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.emotionalPattern.triggers.map((trigger, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Typical Responses</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.emotionalPattern.responses.map((response, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {response}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-lavender text-primary-foreground mr-2">{personA}</Badge>
                  <h3 className="font-medium">{blueprintA.attachmentStyle.type}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintA.attachmentStyle.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Relationship Needs</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.attachmentStyle.needs.map((need, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Core Fears</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.attachmentStyle.fears.map((fear, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {fear}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-skyblue text-secondary-foreground mr-2">{personB}</Badge>
                  <h3 className="font-medium">{blueprintB.attachmentStyle.type}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintB.attachmentStyle.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Relationship Needs</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.attachmentStyle.needs.map((need, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Core Fears</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.attachmentStyle.fears.map((fear, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {fear}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conflict" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-lavender text-primary-foreground mr-2">{personA}</Badge>
                  <h3 className="font-medium">{blueprintA.conflictResolution.approach}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintA.conflictResolution.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Effective Approaches</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.conflictResolution.effective.map((approach, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Ineffective Approaches</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.conflictResolution.ineffective.map((approach, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-skyblue text-secondary-foreground mr-2">{personB}</Badge>
                  <h3 className="font-medium">{blueprintB.conflictResolution.approach}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintB.conflictResolution.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Effective Approaches</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.conflictResolution.effective.map((approach, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Ineffective Approaches</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.conflictResolution.ineffective.map((approach, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {approach}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-lavender text-primary-foreground mr-2">{personA}</Badge>
                  <h3 className="font-medium">{blueprintA.growthAreas.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintA.growthAreas.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Growth Suggestions</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintA.growthAreas.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className="bg-skyblue text-secondary-foreground mr-2">{personB}</Badge>
                  <h3 className="font-medium">{blueprintB.growthAreas.primary}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{blueprintB.growthAreas.description}</p>

                <div>
                  <h4 className="text-sm font-medium mb-2">Growth Suggestions</h4>
                  <ul className="text-sm space-y-1">
                    {blueprintB.growthAreas.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
