"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export function ChatTypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-lavender/30 rounded-full p-1.5 mb-1">
          <Heart className="h-3.5 w-3.5 text-lavender-dark" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3 shadow-sm">
        <div className="flex space-x-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 rounded-full bg-lavender"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: dot * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
