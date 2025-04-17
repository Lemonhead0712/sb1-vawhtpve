"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RedisDashboard } from "@/components/admin/redis-dashboard"
import { RedisMonitoringDashboard } from "@/components/admin/redis-monitoring-dashboard"
import AppLayout from "@/components/layout/app-layout"
import { Database, Activity, Settings, Shield } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("redis-cache")

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system settings, monitor performance, and configure features</p>
        </div>

        <Tabs defaultValue="redis-cache" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="redis-cache" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>Redis Cache</span>
            </TabsTrigger>
            <TabsTrigger value="redis-monitoring" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              <span>Redis Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="feature-flags" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Feature Flags</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="redis-cache">
            <RedisDashboard />
          </TabsContent>

          <TabsContent value="redis-monitoring">
            <RedisMonitoringDashboard />
          </TabsContent>

          <TabsContent value="feature-flags">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Manage application feature flags</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Feature flag management is available in the Redis Cache tab.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security settings and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
