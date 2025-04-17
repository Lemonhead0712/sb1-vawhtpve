"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Bell, Shield, Download, Trash2, Save, Edit, Lock, Globe, Key, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@supabase/supabase-js"
import { kv } from "@vercel/kv"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const { toast } = useToast()

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // User settings state
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    preferredName: "Alex",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    language: "en",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    analysis: true,
    tips: false,
    reminders: true,
  })

  const [privacy, setPrivacy] = useState({
    storeData: true,
    anonymizeData: false,
    shareInsights: true,
    dataRetention: "1year",
  })

  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    analysisDepth: "standard",
    focusAreas: "all",
    language: "en",
  })

  const [apiKeys, setApiKeys] = useState({
    hasApiKey: false,
    apiKey: "",
    lastUsed: null,
  })

  // Load user settings from Supabase on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // Try to get settings from Redis first (faster)
        let cachedSettings
        try {
          cachedSettings = await kv.get("user_settings")
        } catch (error) {
          console.error("Redis fetch error:", error)
        }

        if (cachedSettings) {
          // Update all state with cached settings
          setFormData(cachedSettings.formData || formData)
          setNotifications(cachedSettings.notifications || notifications)
          setPrivacy(cachedSettings.privacy || privacy)
          setPreferences(cachedSettings.preferences || preferences)
        } else {
          // Fetch from Supabase if not in Redis
          const { data, error } = await supabase.from("user_settings").select("*").single()

          if (error) {
            if (error.code !== "PGRST116") {
              // PGRST116 is "no rows returned" error
              throw error
            }
            // If no settings found, we'll use the defaults
          } else if (data) {
            // Update state with fetched settings
            setFormData({
              name: data.name || formData.name,
              email: data.email || formData.email,
              preferredName: data.preferred_name || formData.preferredName,
              location: data.location || formData.location,
              timezone: data.timezone || formData.timezone,
              language: data.language || formData.language,
            })

            setNotifications({
              email: data.notifications_email ?? notifications.email,
              analysis: data.notifications_analysis ?? notifications.analysis,
              tips: data.notifications_tips ?? notifications.tips,
              reminders: data.notifications_reminders ?? notifications.reminders,
            })

            setPrivacy({
              storeData: data.privacy_store_data ?? privacy.storeData,
              anonymizeData: data.privacy_anonymize_data ?? privacy.anonymizeData,
              shareInsights: data.privacy_share_insights ?? privacy.shareInsights,
              dataRetention: data.privacy_data_retention || privacy.dataRetention,
            })

            setPreferences({
              darkMode: data.preferences_dark_mode ?? preferences.darkMode,
              compactView: data.preferences_compact_view ?? preferences.compactView,
              analysisDepth: data.preferences_analysis_depth || preferences.analysisDepth,
              focusAreas: data.preferences_focus_areas || preferences.focusAreas,
              language: data.preferences_language || preferences.language,
            })

            // Cache in Redis for faster future access
            try {
              await kv.set(
                "user_settings",
                {
                  formData: {
                    name: data.name || formData.name,
                    email: data.email || formData.email,
                    preferredName: data.preferred_name || formData.preferredName,
                    location: data.location || formData.location,
                    timezone: data.timezone || formData.timezone,
                    language: data.language || formData.language,
                  },
                  notifications: {
                    email: data.notifications_email ?? notifications.email,
                    analysis: data.notifications_analysis ?? notifications.analysis,
                    tips: data.notifications_tips ?? notifications.tips,
                    reminders: data.notifications_reminders ?? notifications.reminders,
                  },
                  privacy: {
                    storeData: data.privacy_store_data ?? privacy.storeData,
                    anonymizeData: data.privacy_anonymize_data ?? privacy.anonymizeData,
                    shareInsights: data.privacy_share_insights ?? privacy.shareInsights,
                    dataRetention: data.privacy_data_retention || privacy.dataRetention,
                  },
                  preferences: {
                    darkMode: data.preferences_dark_mode ?? preferences.darkMode,
                    compactView: data.preferences_compact_view ?? preferences.compactView,
                    analysisDepth: data.preferences_analysis_depth || preferences.analysisDepth,
                    focusAreas: data.preferences_focus_areas || preferences.focusAreas,
                    language: data.preferences_language || preferences.language,
                  },
                },
                { ex: 3600 },
              ) // Expire after 1 hour
            } catch (error) {
              console.error("Redis cache error:", error)
            }
          }
        }

        // Check if user has API key
        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from("api_keys")
          .select("key, last_used")
          .limit(1)

        if (!apiKeyError && apiKeyData && apiKeyData.length > 0) {
          setApiKeys({
            hasApiKey: true,
            apiKey: apiKeyData[0].key.substring(0, 8) + "...",
            lastUsed: apiKeyData[0].last_used,
          })
        }
      } catch (error) {
        console.error("Error loading user settings:", error)
        toast({
          title: "Error loading settings",
          description: "There was an error loading your settings. Using defaults.",
          variant: "destructive",
        })
      }
    }

    loadUserSettings()
  }, [toast, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handlePrivacyChange = (name: keyof typeof privacy) => {
    if (typeof privacy[name] === "boolean") {
      setPrivacy((prev) => ({ ...prev, [name]: !prev[name] }))
    } else {
      setPrivacy((prev) => ({ ...prev, [name]: name }))
    }
  }

  const handlePreferenceChange = (name: keyof typeof preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Prepare data for Supabase
      const settingsData = {
        name: formData.name,
        email: formData.email,
        preferred_name: formData.preferredName,
        location: formData.location,
        timezone: formData.timezone,
        language: formData.language,
        notifications_email: notifications.email,
        notifications_analysis: notifications.analysis,
        notifications_tips: notifications.tips,
        notifications_reminders: notifications.reminders,
        privacy_store_data: privacy.storeData,
        privacy_anonymize_data: privacy.anonymizeData,
        privacy_share_insights: privacy.shareInsights,
        privacy_data_retention: privacy.dataRetention,
        preferences_dark_mode: preferences.darkMode,
        preferences_compact_view: preferences.compactView,
        preferences_analysis_depth: preferences.analysisDepth,
        preferences_focus_areas: preferences.focusAreas,
        preferences_language: preferences.language,
        updated_at: new Date().toISOString(),
      }

      // Save to Supabase
      const { error } = await supabase.from("user_settings").upsert(settingsData)

      if (error) throw error

      // Update Redis cache
      try {
        await kv.set(
          "user_settings",
          {
            formData,
            notifications,
            privacy,
            preferences,
          },
          { ex: 3600 },
        ) // Expire after 1 hour
      } catch (error) {
        console.error("Redis cache error:", error)
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been successfully updated.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      // Delete user data from Supabase
      const { error: settingsError } = await supabase.from("user_settings").delete()

      if (settingsError) throw settingsError

      const { error: analysisError } = await supabase.from("analysis_requests").delete()

      if (analysisError) throw analysisError

      const { error: apiKeyError } = await supabase.from("api_keys").delete()

      if (apiKeyError) throw apiKeyError

      // Clear Redis cache
      try {
        await kv.del("user_settings")
        await kv.del("analysis_history")
      } catch (error) {
        console.error("Redis delete error:", error)
      }

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted.",
      })

      // Redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error deleting account",
        description: "There was an error deleting your account.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadData = async () => {
    setIsDownloading(true)

    try {
      // Fetch all user data from Supabase
      const { data: settingsData, error: settingsError } = await supabase.from("user_settings").select("*").single()

      if (settingsError && settingsError.code !== "PGRST116") throw settingsError

      const { data: analysisData, error: analysisError } = await supabase.from("analysis_requests").select("*")

      if (analysisError) throw analysisError

      // Compile all data
      const userData = {
        settings: settingsData || {},
        analyses: analysisData || [],
        exportDate: new Date().toISOString(),
      }

      // Create a JSON file for download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", `emotional-analysis-data-${new Date().toISOString()}.json`)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      toast({
        title: "Data downloaded",
        description: "Your data has been downloaded as a JSON file.",
      })
    } catch (error) {
      console.error("Error downloading data:", error)
      toast({
        title: "Error downloading data",
        description: "There was an error downloading your data.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGenerateApiKey = async () => {
    try {
      // Generate a new API key
      const apiKey = Array(32)
        .fill(0)
        .map(() => Math.random().toString(36).charAt(2))
        .join("")

      // Save to Supabase
      const { error } = await supabase.from("api_keys").upsert({
        key: apiKey,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setApiKeys({
        hasApiKey: true,
        apiKey: apiKey.substring(0, 8) + "...",
        lastUsed: null,
      })

      toast({
        title: "API key generated",
        description: "Your new API key has been generated.",
      })
    } catch (error) {
      console.error("Error generating API key:", error)
      toast({
        title: "Error generating API key",
        description: "There was an error generating your API key.",
        variant: "destructive",
      })
    }
  }

  const handleRevokeApiKey = async () => {
    try {
      // Delete API key from Supabase
      const { error } = await supabase.from("api_keys").delete()

      if (error) throw error

      setApiKeys({
        hasApiKey: false,
        apiKey: "",
        lastUsed: null,
      })

      toast({
        title: "API key revoked",
        description: "Your API key has been revoked.",
      })
    } catch (error) {
      console.error("Error revoking API key:", error)
      toast({
        title: "Error revoking API key",
        description: "There was an error revoking your API key.",
        variant: "destructive",
      })
    }
  }

  const handleClearCache = async () => {
    setIsClearingCache(true)

    try {
      // Clear Redis cache
      await kv.del("user_settings")
      await kv.del("analysis_history")

      toast({
        title: "Cache cleared",
        description: "Your cache has been successfully cleared.",
      })
    } catch (error) {
      console.error("Error clearing cache:", error)
      toast({
        title: "Error clearing cache",
        description: "There was an error clearing your cache.",
        variant: "destructive",
      })
    } finally {
      setIsClearingCache(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="developer">
              <Key className="h-4 w-4 mr-2" />
              Developer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your personal account details</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSaveSettings() : setIsEditing(true))}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredName">Preferred Name</Label>
                    <Input
                      id="preferredName"
                      name="preferredName"
                      value={formData.preferredName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      disabled={!isEditing}
                      value={formData.timezone}
                      onValueChange={(value) => handleSelectChange("timezone", value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      disabled={!isEditing}
                      value={formData.language}
                      onValueChange={(value) => handleSelectChange("language", value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button variant="outline" className="justify-start" disabled={!isEditing}>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!isEditing}>
                      <Shield className="mr-2 h-4 w-4" />
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={handleDownloadData} disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download My Data
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="text-base">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notifications.email}
                        onCheckedChange={() => handleNotificationChange("email")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analysisResults" className="text-base">
                          Analysis Results
                        </Label>
                        <p className="text-sm text-muted-foreground">Get notified when your analysis is complete</p>
                      </div>
                      <Switch
                        id="analysisResults"
                        checked={notifications.analysis}
                        onCheckedChange={() => handleNotificationChange("analysis")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyTips" className="text-base">
                          Weekly Tips
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive weekly relationship tips and advice</p>
                      </div>
                      <Switch
                        id="weeklyTips"
                        checked={notifications.tips}
                        onCheckedChange={() => handleNotificationChange("tips")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="goalReminders" className="text-base">
                          Goal Reminders
                        </Label>
                        <p className="text-sm text-muted-foreground">Get reminders about your relationship goals</p>
                      </div>
                      <Switch
                        id="goalReminders"
                        checked={notifications.reminders}
                        onCheckedChange={() => handleNotificationChange("reminders")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Frequency</h3>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Email Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage how your data is stored and used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Data Storage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="storeData" className="text-base">
                          Store Analysis Data
                        </Label>
                        <p className="text-sm text-muted-foreground">Save your analysis results for future reference</p>
                      </div>
                      <Switch
                        id="storeData"
                        checked={privacy.storeData}
                        onCheckedChange={() => handlePrivacyChange("storeData")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="anonymizeData" className="text-base">
                          Anonymize Data
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Remove personally identifiable information from stored data
                        </p>
                      </div>
                      <Switch
                        id="anonymizeData"
                        checked={privacy.anonymizeData}
                        onCheckedChange={() => handlePrivacyChange("anonymizeData")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shareInsights" className="text-base">
                          Share Anonymized Insights
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve our AI by sharing anonymized insights
                        </p>
                      </div>
                      <Switch
                        id="shareInsights"
                        checked={privacy.shareInsights}
                        onCheckedChange={() => handlePrivacyChange("shareInsights")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Data Retention</h3>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Keep My Data For</Label>
                    <Select
                      value={privacy.dataRetention}
                      onValueChange={(value) => setPrivacy((prev) => ({ ...prev, dataRetention: value }))}
                    >
                      <SelectTrigger id="dataRetention">
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="forever">Indefinitely</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Display Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="darkMode" className="text-base">
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compactView" className="text-base">
                          Compact View
                        </Label>
                        <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                      </div>
                      <Switch
                        id="compactView"
                        checked={preferences.compactView}
                        onCheckedChange={(checked) => handlePreferenceChange("compactView", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Analysis Preferences</h3>
                  <div className="space-y-2">
                    <Label htmlFor="analysisDepth">Analysis Depth</Label>
                    <Select
                      value={preferences.analysisDepth}
                      onValueChange={(value) => handlePreferenceChange("analysisDepth", value)}
                    >
                      <SelectTrigger id="analysisDepth">
                        <SelectValue placeholder="Select analysis depth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="focusAreas">Focus Areas</Label>
                    <Select
                      value={preferences.focusAreas}
                      onValueChange={(value) => handlePreferenceChange("focusAreas", value)}
                    >
                      <SelectTrigger id="focusAreas">
                        <SelectValue placeholder="Select focus areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="emotions">Emotional Intelligence</SelectItem>
                        <SelectItem value="conflict">Conflict Resolution</SelectItem>
                        <SelectItem value="trust">Trust Building</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appLanguage">Application Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => handlePreferenceChange("language", value)}
                    >
                      <SelectTrigger id="appLanguage">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="developer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
                <CardDescription>API access and developer tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">API Access</h3>
                  <div className="p-4 border rounded-md">
                    {apiKeys.hasApiKey ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">API Key</p>
                            <p className="text-sm text-muted-foreground">
                              Your API key for accessing the EmotionIQ API
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{apiKeys.apiKey}</code>
                            <Button variant="outline" size="sm" onClick={handleRevokeApiKey}>
                              Revoke
                            </Button>
                          </div>
                        </div>
                        {apiKeys.lastUsed && (
                          <div className="text-sm text-muted-foreground">
                            Last used: {new Date(apiKeys.lastUsed).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Key className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="font-medium mb-2">No API Key</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Generate an API key to access the EmotionIQ API programmatically
                        </p>
                        <Button onClick={handleGenerateApiKey}>Generate API Key</Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">API Documentation</h3>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm mb-4">
                      Access our API documentation to learn how to integrate EmotionIQ into your applications.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/api/docs" target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        View API Documentation
                      </a>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Advanced Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Clear Cache</p>
                        <p className="text-sm text-muted-foreground">
                          Clear all cached data to refresh your application
                        </p>
                      </div>
                      <Button variant="outline" onClick={handleClearCache} disabled={isClearingCache}>
                        {isClearingCache ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Clearing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Clear Cache
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Button variant="outline" asChild>
                    <a
                      href="https://github.com/yourusername/emotional-analysis-app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on GitHub
                    </a>
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Developer Settings"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
