"use client"

import { useState, useRef, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendIcon, Mic, PauseCircle, ArrowRight, Bot, RefreshCw, ThumbsUp, ThumbsDown, Copy } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStoredAnalysisResults } from "@/lib/screenshot-analysis"
import { cn } from "@/lib/utils"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  thinking?: boolean
}

// Sample conversation starters focused on emotional needs
const conversationStarters = [
  "How can I improve communication with my partner?",
  "What are some ways to express appreciation better?",
  "I need help with setting healthy boundaries",
  "How can we handle conflicts more constructively?",
  "Give me some active listening techniques",
  "Ways to rebuild trust in my relationship",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm your relationship AI coach. How can I help improve your relationship today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load analysis results if available
    const results = getStoredAnalysisResults()
    setAnalysisResults(results)

    // Show a personalized greeting if we have analysis results
    if (results) {
      const names = [results.userA.name, results.userB.name].filter(Boolean)
      if (names.length > 0) {
        setMessages([
          {
            id: "personalized-welcome",
            content: `Hi there! I'm your relationship AI coach. I can see you've analyzed the relationship between ${names.join(" and ")}. How can I help improve your relationship today?`,
            sender: "assistant",
            timestamp: new Date(),
          },
        ])
      }
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    // Add thinking indicator message
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: "Thinking...",
      sender: "assistant",
      timestamp: new Date(),
      thinking: true,
    }

    setMessages((prev) => [...prev, thinkingMessage])

    try {
      // Build context from analysis results
      let systemPrompt = `You are a relationship coach and emotional intelligence assistant named EmotionIQ. 
Your goal is to provide empathetic, thoughtful advice on relationship matters.
Focus on attachment theory, emotional intelligence, communication strategies, and conflict resolution.
Be warm, supportive, and encouraging while offering specific, practical suggestions.
Keep responses concise (2-3 paragraphs max) and actionable.`

      // Add personalized context if we have analysis results
      if (analysisResults) {
        const person1 = analysisResults.userA.name || "Person 1"
        const person2 = analysisResults.userB.name || "Person 2"

        systemPrompt += `\n\nI have information about the relationship between ${person1} and ${person2}:
- Their relationship health score is ${analysisResults.relationshipHealth}/100
- ${person1}'s dominant emotion is ${analysisResults.userA.dominantEmotion}
- ${person2}'s dominant emotion is ${analysisResults.userB.dominantEmotion}
- Relationship strengths: ${analysisResults.insights.strengths.join(", ")}
- Relationship challenges: ${analysisResults.insights.challenges.join(", ")}`
      }

      // Generate response using AI SDK
      const { text } = await generateText({
        model: groq("llama3-70b-8192"),
        prompt: inputValue,
        system: systemPrompt,
        maxTokens: 500,
      })

      // Remove the thinking message
      setMessages((prev) => prev.filter((m) => !m.thinking))

      // Add the bot response
      const botMessage: Message = {
        id: Date.now().toString(),
        content: text,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      // Remove the thinking message
      setMessages((prev) => prev.filter((m) => !m.thinking))

      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ])

      toast({
        title: "Connection Error",
        description: "Could not connect to AI service. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStarterClick = (starter: string) => {
    setInputValue(starter)
    // Focus on input after selecting a starter
    inputRef.current?.focus()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Start recording
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      })

      // This would be replaced with actual speech recognition
      setTimeout(() => {
        setInputValue("How can I improve communication with my partner?")
        setIsRecording(false)
        toast({
          title: "Recording complete",
          description: "Your message has been transcribed.",
        })
      }, 2000)
    } else {
      // Stop recording
      setIsRecording(false)
      toast({
        title: "Recording stopped",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    })
  }

  const renderMessage = (message: Message) => {
    if (message.thinking) {
      return (
        <div key={message.id} className="flex items-start mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg" alt="AI Assistant" />
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
          <div className="flex space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "600ms" }}></div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={message.id}
        className={cn("flex items-start mb-4 group", message.sender === "user" ? "justify-end" : "justify-start")}
      >
        {message.sender === "assistant" && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg" alt="AI Assistant" />
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "px-4 py-3 rounded-lg max-w-[80%]",
            message.sender === "user"
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted rounded-tl-none",
          )}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          <div className="mt-1 text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        {message.sender === "user" && (
          <Avatar className="h-8 w-8 ml-2">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
        )}

        {message.sender === "assistant" && !message.thinking && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(message.content)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
        {/* Main chat area */}
        <div className="lg:col-span-3 flex flex-col bg-card rounded-xl border overflow-hidden h-full">
          <CardHeader className="border-b flex-none pb-3">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>AI Relationship Coach</CardTitle>
                <CardDescription>Personalized guidance for relationship growth</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="ml-auto" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="border-t p-4 flex-none">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center w-full gap-2"
            >
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isProcessing}
                onClick={toggleRecording}
                className={cn("rounded-full transition-colors", isRecording && "bg-red-100 text-red-500")}
              >
                {isRecording ? <PauseCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Input
                ref={inputRef}
                placeholder="Ask for relationship advice..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing || isRecording}
                className="flex-grow rounded-full border-muted-foreground/20"
              />

              <Button type="submit" size="icon" className="rounded-full" disabled={isProcessing || !inputValue.trim()}>
                <SendIcon className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </div>

        {/* Sidebar with helpful prompts */}
        <div className="hidden lg:block">
          <Tabs defaultValue="topics">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="topics" className="mt-4 h-[calc(100vh-15rem)] overflow-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Conversation Starters</CardTitle>
                  <CardDescription>Click on a topic to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conversationStarters.map((starter, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleStarterClick(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Relationship Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Active Listening</p>
                      <p className="text-xs text-muted-foreground">
                        Try to understand before seeking to be understood.
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Express Appreciation</p>
                      <p className="text-xs text-muted-foreground">
                        Share what you value about your partner regularly.
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Repair Attempts</p>
                      <p className="text-xs text-muted-foreground">
                        Learn to de-escalate conflict with humor or kindness.
                      </p>
                    </div>

                    <Button className="w-full mt-2" variant="outline" size="sm" asChild>
                      <a href="/insights">
                        <ArrowRight className="mr-2 h-3 w-3" />
                        See More Tips
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4 h-[calc(100vh-15rem)] overflow-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Previous Conversations</CardTitle>
                  <CardDescription>Your recent coaching sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-left">
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Communication Strategies</span>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Building Trust</span>
                        <span className="text-xs text-muted-foreground">3 days ago</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Emotional Needs</span>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  Your conversation history is stored locally on your device for privacy. You can clear your history at
                  any time in the Settings.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
