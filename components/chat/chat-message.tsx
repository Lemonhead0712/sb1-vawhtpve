"use client"
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.sender === "assistant"

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-end gap-2", isAssistant ? "justify-start" : "justify-end")}
    >
      {isAssistant && (
        <div className="flex flex-col items-center">
          <div className="bg-lavender/30 rounded-full p-1.5 mb-1">
            <Heart className="h-3.5 w-3.5 text-lavender-dark" />
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-3 shadow-sm",
          isAssistant
            ? "bg-white border border-gray-100 rounded-tl-sm"
            : "bg-lavender/90 text-primary-foreground rounded-tr-sm",
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className={cn("text-[10px] mt-1", isAssistant ? "text-muted-foreground" : "text-primary-foreground/70")}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  )
}
