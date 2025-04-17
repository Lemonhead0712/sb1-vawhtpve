"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Mic, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { useToast } from "@/hooks/use-toast"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

// Sample conversation starters focused on emotional needs
const conversationStarters = [
  "I feel anxious when my partner doesn't text back quickly",
  "I struggle with expressing my needs in my relationship",
  "I get defensive when my partner criticizes me",
  "I find it hard to trust my partner after they lied to me",
  "I feel disconnected from my partner lately",
  "I get overwhelmed during arguments with my partner",
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "I'm here to provide emotional support and relationship guidance. How are you feeling today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Generate response using AI SDK
      const systemPrompt = `You are a relationship counselor and emotional support assistant named LoveLens AI. 
      Your goal is to provide empathetic, thoughtful advice on relationship issues.
      Focus on attachment theory, emotional intelligence, and healthy communication strategies.
      Keep responses concise (2-3 paragraphs max) and actionable.
      Avoid generic platitudes and instead offer specific, practical suggestions.
      If the user's query isn't about relationships or emotions, gently redirect them.`

      const { text } = await generateText({
        model: groq("llama3-70b-8192"),
        prompt: inputValue,
        system: systemPrompt,
        maxTokens: 500,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: "assistant",
        timestamp: new Date(),
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      setIsTyping(false)

      // Fallback response in case of error
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fallbackMessage])

      toast({
        title: "Connection Error",
        description: "Could not connect to AI service. Please try again later.",
        variant: "destructive",
      })
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
        setInputValue("I feel anxious when my partner doesn't respond to my texts right away")
        setIsRecording(false)
        toast({
          title: "Recording complete",
          description: "Your message has been transcribed.",
        })
      }, 3000)
    } else {
      // Stop recording
      setIsRecording(false)
      toast({
        title: "Recording stopped",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <ChatTypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white dark:bg-gray-900">
        <form
          className="flex items-center space-x-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleRecording}
            className={cn("rounded-full transition-colors", isRecording && "bg-red-100 text-red-500")}
          >
            {isRecording ? <PauseCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Input
            ref={inputRef}
            placeholder="Share how you're feeling..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow rounded-full border-gray-200 focus:border-lavender focus:ring-lavender dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />

          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-lavender hover:bg-lavender-dark text-primary-foreground"
            disabled={isTyping || !inputValue.trim()}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
