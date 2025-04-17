"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ConversationStartersProps {
  starters: string[]
  onStarterClick: (starter: string) => void
}

export function ConversationStarters({ starters, onStarterClick }: ConversationStartersProps) {
  return (
    <Card className="h-full bg-white shadow-sm border border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Conversation Starters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {starters.map((starter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-200 hover:bg-lavender/10 hover:text-primary-foreground hover:border-lavender transition-colors"
                onClick={() => onStarterClick(starter)}
              >
                {starter}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium mb-2">How to get the best advice</h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>• Share specific feelings rather than general situations</li>
            <li>• Describe your emotional reactions in detail</li>
            <li>• Mention any patterns you've noticed in your relationship</li>
            <li>• Be honest about your own role in challenges</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
