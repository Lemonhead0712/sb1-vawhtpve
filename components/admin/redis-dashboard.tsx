"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Search, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RedisDashboard() {
  const [activeTab, setActiveTab] = useState("cache")
  const [cacheKeys, setCacheKeys] = useState<string[]>([])
  const [featureFlags, setFeatureFlags] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState<string>("")
  const [newFeatureFlag, setNewFeatureFlag] = useState({
    name: "",
    enabled: true,
    description: "",
    percentage: 100,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "cache") {
        const response = await fetch("/api/admin/redis/keys")
        const data = await response.json()
        setCacheKeys(data.keys || [])
      } else if (activeTab === "features") {
        const response = await fetch("/api/admin/features")
        const data = await response.json()
        setFeatureFlags(data.features || [])
      }
    } catch (error) {
      console.error("Error fetching Redis data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Redis data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewKey = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/redis/keys/${encodeURIComponent(key)}`)
      const data = await response.json()
      setSelectedKey(key)
      setKeyValue(JSON.stringify(data.value, null, 2))
    } catch (error) {
      console.error("Error fetching key value:", error)
      toast({
        title: "Error",
        description: "Failed to fetch key value",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async (key: string) => {
    try {
      await fetch(`/api/admin/redis/keys/${encodeURIComponent(key)}`, {
        method: "DELETE",
      })
      toast({
        title: "Success",
        description: `Key "${key}" deleted successfully`,
      })
      fetchData()
      if (selectedKey === key) {
        setSelectedKey(null)
        setKeyValue("")
      }
    } catch (error) {
      console.error("Error deleting key:", error)
      toast({
        title: "Error",
        description: "Failed to delete key",
        variant: "destructive",
      })
    }
  }

  const handleSaveFeatureFlag = async () => {
    try {
      await fetch("/api/admin/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFeatureFlag),
      })
      toast({
        title: "Success",
        description: `Feature flag "${newFeatureFlag.name}" saved successfully`,
      })
      setNewFeatureFlag({
        name: "",
        enabled: true,
        description: "",
        percentage: 100,
      })
      fetchData()
    } catch (error) {
      console.error("Error saving feature flag:", error)
      toast({
        title: "Error",
        description: "Failed to save feature flag",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatureFlag = async (name: string, enabled: boolean) => {
    try {
      await fetch(`/api/admin/features/${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !enabled }),
      })
      toast({
        title: "Success",
        description: `Feature flag "${name}" ${!enabled ? "enabled" : "disabled"} successfully`,
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling feature flag:", error)
      toast({
        title: "Error",
        description: "Failed to toggle feature flag",
        variant: "destructive",
      })
    }
  }

  const filteredKeys = cacheKeys.filter(
    (key) => searchQuery === "" || key.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredFeatureFlags = featureFlags.filter(
    (flag) => searchQuery === "" || flag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Redis Dashboard</CardTitle>
        <CardDescription>Manage Redis cache and feature flags</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cache" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="features">Feature Flags</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="cache">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border rounded-md h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredKeys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No cache keys found</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredKeys.map((key) => (
                      <li key={key} className="p-2 hover:bg-muted/50">
                        <div className="flex justify-between items-center">
                          <button
                            className="text-sm truncate max-w-[200px] text-left hover:underline"
                            onClick={() => handleViewKey(key)}
                          >
                            {key}
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKey(key)}
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="md:col-span-2 border rounded-md h-[400px] p-4">
                {selectedKey ? (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{selectedKey}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKey(selectedKey)}
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-grow overflow-auto">
                      <pre className="text-xs bg-muted p-2 rounded-md h-full overflow-auto">{keyValue}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Select a key to view its value</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Feature Flags</h3>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredFeatureFlags.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <p>No feature flags found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {filteredFeatureFlags.map((flag) => (
                      <div key={flag.name} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{flag.name}</span>
                            <Badge variant={flag.enabled ? "default" : "outline"}>
                              {flag.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatureFlag(flag.name, flag.enabled)}
                          >
                            {flag.enabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                        {flag.percentage !== undefined && (
                          <div className="text-xs text-muted-foreground">Rollout: {flag.percentage}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Add New Feature Flag</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="flag-name">Name</Label>
                    <Input
                      id="flag-name"
                      value={newFeatureFlag.name}
                      onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, name: e.target.value })}
                      placeholder="feature-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="flag-description">Description</Label>
                    <Input
                      id="flag-description"
                      value={newFeatureFlag.description}
                      onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, description: e.target.value })}
                      placeholder="Feature description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="flag-percentage">Rollout Percentage</Label>
                    <Input
                      id="flag-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newFeatureFlag.percentage}
                      onChange={(e) =>
                        setNewFeatureFlag({ ...newFeatureFlag, percentage: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="flag-enabled"
                      checked={newFeatureFlag.enabled}
                      onChange={(e) => setNewFeatureFlag({ ...newFeatureFlag, enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="flag-enabled">Enabled</Label>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSaveFeatureFlag}
                    disabled={!newFeatureFlag.name || !newFeatureFlag.description}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature Flag
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {activeTab === "cache"
            ? `${filteredKeys.length} of ${cacheKeys.length} keys`
            : `${filteredFeatureFlags.length} of ${featureFlags.length} feature flags`}
        </p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}
