"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIChat } from "@/components/ai-assistant/ai-chat"
import { ConversationStarters } from "@/components/chat/conversation-starters"

export default function AssistantContent() {
  const [activeTab, setActiveTab] = useState("chat")

  // Sample conversation starters
  const starters = [
    "I feel anxious when my partner doesn't text back quickly",
    "I struggle with expressing my needs in my relationship",
    "I get defensive when my partner criticizes me",
    "I find it hard to trust my partner after they lied to me",
    "I feel disconnected from my partner lately",
    "I get overwhelmed during arguments with my partner",
  ]

  const handleStarterClick = (starter: string) => {
    // This would be implemented to send the starter to the chat
    console.log("Selected starter:", starter)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Relationship Coach</h1>
          <p className="text-muted-foreground">Get personalized advice and guidance for your relationship</p>
        </div>

        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 h-[600px]">
                <AIChat />
              </div>
              <div className="md:col-span-1 h-[600px]">
                <ConversationStarters starters={starters} onStarterClick={handleStarterClick} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Personalized insights based on your conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chat with the AI assistant to receive personalized insights about your relationship.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>Your previous conversations with the AI coach</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your chat history will appear here once you've had conversations with the AI coach.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
