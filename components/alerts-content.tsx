"use client"

import { useState } from "react"
import { AlertTriangle, Bell, CheckCircle, Clock, RefreshCw, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useProject } from "@/contexts/project-context"

export function AlertsContent() {
  const [activeTab, setActiveTab] = useState("all")
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Sample alerts data
  const allAlerts = [
    {
      id: "1",
      title: "OpenAI API credits running low",
      description: "Credits at 22%, will be depleted in approximately 7 days",
      timestamp: "10 minutes ago",
      type: "warning",
      service: "OpenAI",
      read: false,
      projects: ["all", "mobile", "main"],
    },
    {
      id: "2",
      title: "Anthropic API response time increased",
      description: "Response time increased by 42% in the last hour",
      timestamp: "1 hour ago",
      type: "warning",
      service: "Anthropic",
      read: false,
      projects: ["all", "main"],
    },
    {
      id: "3",
      title: "Auto-purchase successful",
      description: "Successfully purchased $1,000 in OpenAI credits",
      timestamp: "2 hours ago",
      type: "success",
      service: "OpenAI",
      read: true,
      projects: ["all", "mobile", "main"],
    },
    {
      id: "4",
      title: "Usage anomaly detected",
      description: "Unusual spike in API calls detected from Project: Mobile App",
      timestamp: "3 hours ago",
      type: "warning",
      service: "Mistral AI",
      read: true,
      projects: ["all", "mobile"],
    },
    {
      id: "5",
      title: "Weekly usage report",
      description: "Your weekly API usage report is now available",
      timestamp: "1 day ago",
      type: "info",
      service: "System",
      read: true,
      projects: ["all", "main", "mobile", "chatbot"],
    },
  ]

  // Filter alerts based on selected project
  const alerts = allAlerts.filter((alert) => alert.projects.includes(projectId))

  const filteredAlerts =
    activeTab === "all"
      ? alerts
      : activeTab === "unread"
        ? alerts.filter((alert) => !alert.read)
        : alerts.filter((alert) => alert.type === activeTab)

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alerts</h2>
          <p className="text-muted-foreground">
            {selectedProject
              ? `Monitor and manage notifications for ${selectedProject.name}`
              : "Monitor and manage notifications about your API usage"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs hover:from-blue-700 hover:to-purple-700"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Alert Settings</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="warning">Warnings</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">No alerts to display</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-border/40 bg-card/30 backdrop-blur-sm ${!alert.read ? "border-l-4 border-l-primary" : ""}`}
              >
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {alert.type === "warning" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </div>
                      ) : alert.type === "success" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge variant="outline" className="border-muted/20 bg-muted/10 text-xs">
                          {alert.service}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Email Notifications</h3>
              <div className="flex items-center space-x-2">
                <Switch id="email-notifications" />
                <Label htmlFor="email-notifications">
                  Receive email notifications for alerts
                </Label>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Integrations</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30">
                    <img 
                      src="/logos/slack.png" 
                      alt="Slack" 
                      className="h-6 w-6 object-contain" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Slack</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts in Slack channels
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Switch id="slack-notifications" />
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30">
                    <img 
                      src="/logos/teams.png" 
                      alt="Microsoft Teams" 
                      className="h-6 w-6 object-contain" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Microsoft Teams</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts in Teams channels
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Switch id="teams-notifications" />
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30">
                    <img 
                      src="/logos/email.png" 
                      alt="Email" 
                      className="h-6 w-6 object-contain" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Switch id="email-integration" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/40 bg-card/30 px-6 py-4">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
