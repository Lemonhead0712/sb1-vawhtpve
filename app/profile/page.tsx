"use client"

import type React from "react"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Settings, Bell, Shield, History, Download, Trash2, Save, Edit, Lock } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"

const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  joinDate: "January 15, 2023",
  profileImage: "/placeholder.svg?height=128&width=128",
  relationshipStatus: "In a relationship",
  relationshipLength: "2-5 years",
  analysisCount: 12,
  lastAnalysis: "February 10, 2023",
  preferredName: "Alex",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
}

// Sample analysis history
const analysisHistory = [
  { id: "1", date: "March 10, 2023", screenshots: 8, score: 85, change: "+5" },
  { id: "2", date: "February 22, 2023", screenshots: 5, score: 80, change: "+2" },
  { id: "3", date: "February 5, 2023", screenshots: 10, score: 78, change: "+6" },
  { id: "4", date: "January 18, 2023", screenshots: 7, score: 72, change: "+4" },
  { id: "5", date: "January 2, 2023", screenshots: 6, score: 68, change: "-2" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("account")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    relationshipStatus: userData.relationshipStatus,
    relationshipLength: userData.relationshipLength,
    preferredName: userData.preferredName,
    location: userData.location,
    timezone: userData.timezone,
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

  const { toast } = useToast()

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

  const handleSaveProfile = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    }, 1500)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    disabled={!isEditing}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-semibold mt-2">{userData.name}</h2>
                <p className="text-sm text-muted-foreground">{userData.email}</p>

                <div className="w-full max-w-xs mt-6 space-y-1">
                  <Button
                    variant={activeTab === "account" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("account")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === "privacy" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("privacy")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy
                  </Button>
                  <Button
                    variant={activeTab === "preferences" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("preferences")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </Button>
                  <Button
                    variant={activeTab === "history" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("history")}
                  >
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Button>
                </div>

                <div className="w-full max-w-xs mt-4 pt-4 border-t">
                  <div className="flex flex-col space-y-2">
                    <div className="text-xs text-muted-foreground text-left">
                      <div className="flex justify-between">
                        <span>Member since</span>
                        <span>{userData.joinDate}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Analyses completed</span>
                        <span>{userData.analysisCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Manage your personal account details</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
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
                        <Label htmlFor="relationshipStatus">Relationship Status</Label>
                        <Select
                          disabled={!isEditing}
                          value={formData.relationshipStatus}
                          onValueChange={(value) => handleSelectChange("relationshipStatus", value)}
                        >
                          <SelectTrigger id="relationshipStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Dating">Dating</SelectItem>
                            <SelectItem value="In a relationship">In a relationship</SelectItem>
                            <SelectItem value="Engaged">Engaged</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationshipLength">Relationship Length</Label>
                        <Select
                          disabled={!isEditing}
                          value={formData.relationshipLength}
                          onValueChange={(value) => handleSelectChange("relationshipLength", value)}
                        >
                          <SelectTrigger id="relationshipLength">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Less than 6 months">Less than 6 months</SelectItem>
                            <SelectItem value="6-12 months">6-12 months</SelectItem>
                            <SelectItem value="1-2 years">1-2 years</SelectItem>
                            <SelectItem value="2-5 years">2-5 years</SelectItem>
                            <SelectItem value="5+ years">5+ years</SelectItem>
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
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete Account</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" onClick={() => setIsDownloading(true)} disabled={isDownloading}>
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

              <TabsContent value="notifications">
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
                    <Button className="ml-auto">Save Notification Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
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
                            <p className="text-sm text-muted-foreground">
                              Save your analysis results for future reference
                            </p>
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
                    <Button className="ml-auto">Save Privacy Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
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
                            onCheckedChange={() => setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
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
                            onCheckedChange={() =>
                              setPreferences((prev) => ({ ...prev, compactView: !prev.compactView }))
                            }
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
                          onValueChange={(value) => setPreferences((prev) => ({ ...prev, analysisDepth: value }))}
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
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis History</CardTitle>
                    <CardDescription>View your past relationship analyses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisHistory.map((analysis) => (
                        <div key={analysis.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{analysis.date}</p>
                            <p className="text-sm text-muted-foreground">{analysis.screenshots} screenshots analyzed</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Score: {analysis.score}/100</p>
                            <p
                              className={`text-sm ${analysis.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                            >
                              {analysis.change} from previous
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Load More History
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
