"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Bell, Globe, Key, Lock, RefreshCw, Save, User, Pencil, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function SettingsContentInner() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "account")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)

  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Abdel Alomari",
    email: "abdel@teiden.co",
    company: "Teiden",
    role: "Administrator",
    avatarUrl: "/images/avatar.svg",
    language: "en",
    timezone: "utc+3",
    darkMode: true
  }

  // Extract initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  useEffect(() => {
    // Update active tab when URL parameter changes
    if (tabParam && ["account", "notifications", "security", "api"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleSaveProfile = () => {
    setIsSavingProfile(true)
    setTimeout(() => {
      setIsSavingProfile(false)
      setIsEditingProfile(false)
    }, 1000)
  }

  const handleSavePreferences = () => {
    setIsSavingPreferences(true)
    setTimeout(() => {
      setIsSavingPreferences(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="h-8 w-8"
              >
                {isEditingProfile ? 
                  <Check className="h-4 w-4 text-primary" /> : 
                  <Pencil className="h-4 w-4" />
                }
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-medium">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Your photo will be used in your profile and notifications
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Button variant="outline" size="sm" disabled={!isEditingProfile}>
                      Change Photo
                    </Button>
                    {user.avatarUrl && (
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-500" disabled={!isEditingProfile}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={user.name} 
                    className="border-border/60 bg-background/80" 
                    readOnly={!isEditingProfile}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    defaultValue={user.email} 
                    className="border-border/60 bg-background/80" 
                    readOnly={!isEditingProfile}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    defaultValue={user.company} 
                    className="border-border/60 bg-background/80" 
                    readOnly={!isEditingProfile}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    defaultValue={user.role} 
                    className="border-border/60 bg-background/80" 
                    readOnly={!isEditingProfile}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/40 bg-card/30 px-6 py-4">
              {isEditingProfile && (
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue={user.language}>
                  <SelectTrigger id="language" className="border-border/60 bg-background/80">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue={user.timezone}>
                  <SelectTrigger id="timezone" className="border-border/60 bg-background/80">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-12">UTC-12:00</SelectItem>
                    <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                    <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                    <SelectItem value="utc">UTC+00:00 (Universal Time)</SelectItem>
                    <SelectItem value="utc+1">UTC+01:00 (Central European Time)</SelectItem>
                    <SelectItem value="utc+3">UTC+03:00 (Arabian Time)</SelectItem>
                    <SelectItem value="utc+8">UTC+08:00 (China Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Use dark mode for the dashboard</p>
                </div>
                <Switch checked={user.darkMode} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/40 bg-card/30 px-6 py-4">
              <Button
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
                className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSavingPreferences ? (
                  <>
                    <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-3 rounded-md border border-border/40 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Low Credit Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified when credits fall below threshold</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Weekly Usage Reports</Label>
                      <p className="text-xs text-muted-foreground">Receive weekly summaries of API usage</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Purchase Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get notified when credits are purchased</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Usage Anomaly Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified of unusual API usage patterns</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Push Notifications</h3>
                <div className="space-y-3 rounded-md border border-border/40 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Enable Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications in your browser</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Critical Alerts Only</Label>
                      <p className="text-xs text-muted-foreground">Only receive notifications for critical issues</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Integrations</h3>
                <div className="space-y-3 rounded-md border border-border/40 bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                        <img src="/images/slack-logo.webp" alt="Slack" className="h-full w-full object-contain" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-sm">Slack</Label>
                        <p className="text-xs text-muted-foreground">Send notifications to Slack</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                        <img src="/images/teams-logo.webp" alt="Microsoft Teams" className="h-full w-full object-contain" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-sm">Microsoft Teams</Label>
                        <p className="text-xs text-muted-foreground">Send notifications to Teams</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                        <img src="/images/google-mail-gmail-icon-logo-symbol-free-png.webp" alt="Email" className="h-full w-full object-contain" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-sm">Email</Label>
                        <p className="text-xs text-muted-foreground">Send notifications via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" className="border-border/60 bg-background/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" className="border-border/60 bg-background/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" className="border-border/60 bg-background/80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>

          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Enable 2FA</Label>
                  <p className="text-xs text-muted-foreground">Secure your account with two-factor authentication</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40">
                <div className="grid grid-cols-4 border-b border-border/40 bg-muted/30 px-4 py-2 text-sm font-medium">
                  <div>Device</div>
                  <div>Location</div>
                  <div>Last Active</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y divide-border/40">
                  {[
                    { device: "Chrome on Windows", location: "San Francisco, CA", lastActive: "Now" },
                    { device: "Safari on macOS", location: "New York, NY", lastActive: "2 days ago" },
                    { device: "Firefox on Linux", location: "Austin, TX", lastActive: "1 week ago" },
                  ].map((session, i) => (
                    <div key={i} className="grid grid-cols-4 items-center px-4 py-3 text-sm">
                      <div>{session.device}</div>
                      <div>{session.location}</div>
                      <div>{session.lastActive}</div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          {session.lastActive === "Now" ? "Current Session" : "Revoke"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for the Teiden API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border/40">
                <div className="grid grid-cols-4 border-b border-border/40 bg-muted/30 px-4 py-2 text-sm font-medium">
                  <div>Name</div>
                  <div>Created</div>
                  <div>Last Used</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y divide-border/40">
                  {[
                    { name: "Production Key", created: "May 1, 2025", lastUsed: "Today" },
                    { name: "Development Key", created: "Apr 15, 2025", lastUsed: "Yesterday" },
                  ].map((key, i) => (
                    <div key={i} className="grid grid-cols-4 items-center px-4 py-3 text-sm">
                      <div>{key.name}</div>
                      <div>{key.created}</div>
                      <div>{key.lastUsed}</div>
                      <div className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button>
                <Key className="mr-2 h-4 w-4" />
                <span>Generate New API Key</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks for real-time event notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border/40">
                <div className="grid grid-cols-3 border-b border-border/40 bg-muted/30 px-4 py-2 text-sm font-medium">
                  <div>URL</div>
                  <div>Events</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y divide-border/40">
                  {[{ url: "https://example.com/webhook", events: "Credit alerts, Usage reports" }].map(
                    (webhook, i) => (
                      <div key={i} className="grid grid-cols-3 items-center px-4 py-3 text-sm">
                        <div className="truncate">{webhook.url}</div>
                        <div>{webhook.events}</div>
                        <div className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <Button>
                <Globe className="mr-2 h-4 w-4" />
                <span>Add Webhook</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function SettingsContent() {
  return (
    <Suspense fallback={
      <div className="space-y-6 w-full max-w-none">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <SettingsContentInner />
    </Suspense>
  )
}
