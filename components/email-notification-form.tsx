"use client"

import { useState } from "react"
import { Check, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EmailNotificationForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationSent, setNotificationSent] = useState(false)
  const [lowCreditAlerts, setLowCreditAlerts] = useState(true)
  const [usageReports, setUsageReports] = useState(true)
  const [purchaseNotifications, setPurchaseNotifications] = useState(true)
  const [anomalyAlerts, setAnomalyAlerts] = useState(true)
  const [frequency, setFrequency] = useState("realtime")

  const handleSendTestNotification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to send a test notification.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setNotificationSent(true)

    toast({
      title: "Test Notification Sent!",
      description: `A test notification has been sent to ${email}`,
      variant: "default",
    })

    // Reset notification sent status after 3 seconds
    setTimeout(() => setNotificationSent(false), 3000)
  }

  return (
    <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure how the Notification Agent sends emails</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
            <Mail className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The Notification Agent will send alerts and reports to this email address
          </p>
        </div>

        <div className="space-y-3">
          <Label>Notification Types</Label>

          <div className="space-y-3 rounded-md border border-border/40 bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Low Credit Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified when credits fall below threshold</p>
              </div>
              <Switch checked={lowCreditAlerts} onCheckedChange={setLowCreditAlerts} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Weekly Usage Reports</Label>
                <p className="text-xs text-muted-foreground">Receive weekly summaries of API usage</p>
              </div>
              <Switch checked={usageReports} onCheckedChange={setUsageReports} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Purchase Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified when credits are purchased</p>
              </div>
              <Switch checked={purchaseNotifications} onCheckedChange={setPurchaseNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Usage Anomaly Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified of unusual API usage patterns</p>
              </div>
              <Switch checked={anomalyAlerts} onCheckedChange={setAnomalyAlerts} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Notification Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">How often you want to receive notifications</p>
        </div>

        <div className="space-y-2">
          <Label>Email Preview</Label>
          <div className="rounded-md border border-border/40 bg-background/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">From: Kyto Notification Agent &lt;notifications@kyto.ai&gt;</p>
                  <p className="text-xs text-muted-foreground">To: {email || "you@example.com"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Subject: [Kyto Alert] OpenAI Credits Running Low</p>
              </div>
              <div className="rounded-md border border-border/40 bg-card p-3 text-sm">
                <p>Hello,</p>
                <p className="mt-2">
                  The Kyto Notification Agent has detected that your OpenAI credits are running low. Current level:{" "}
                  <Badge variant="outline" className="ml-1 border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
                    22%
                  </Badge>
                </p>
                <p className="mt-2">
                  Based on your current usage patterns, credits will be depleted in approximately 7 days.
                </p>
                <p className="mt-2">
                  The Purchasing Agent is standing by to automatically purchase additional credits when the level
                  reaches 20%. Would you like to:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Authorize purchase now</li>
                  <li>Adjust auto-purchase threshold</li>
                  <li>Review usage patterns</li>
                </ul>
                <p className="mt-2">
                  You can respond directly to this email or visit your Kyto dashboard for more details.
                </p>
                <p className="mt-4">
                  Best regards,
                  <br />
                  Kyto Notification Agent
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/40 bg-card/30 px-6 py-4">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSendTestNotification} disabled={isSubmitting || notificationSent} className="gap-2">
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              <span>Sending...</span>
            </>
          ) : notificationSent ? (
            <>
              <Check className="h-4 w-4" />
              <span>Sent!</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Test Notification</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
