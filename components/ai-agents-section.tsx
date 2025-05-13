"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Brain,
  ChevronDown,
  DollarSign,
  Eye,
  LineChart,
  Mail,
  MessageSquare,
  RefreshCw,
  Settings,
  ShoppingCart,
  Bell,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

export function AIAgentsSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [purchasingEnabled, setPurchasingEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [slackIntegration, setSlackIntegration] = useState(true)
  const [teamsIntegration, setTeamsIntegration] = useState(false)
  const [emailIntegration, setEmailIntegration] = useState(true)
  const [openAgentLogs, setOpenAgentLogs] = useState(true)
  const [purchaseThreshold, setPurchaseThreshold] = useState(20)
  const [maxPurchaseAmount, setMaxPurchaseAmount] = useState(1000)
  const [agentPersonality, setAgentPersonality] = useState("professional")
  const [learnUsage, setLearnUsage] = useState(true)
  const [learnFeedback, setLearnFeedback] = useState(true)
  const [learnMarket, setLearnMarket] = useState(true)
  const [agentModel, setAgentModel] = useState("gpt4o")
  const [agentLogs, setAgentLogs] = useState<any[]>([])
  const [newLogAlert, setNewLogAlert] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Initialize agent logs
  useEffect(() => {
    setAgentLogs([
      {
        id: 1,
        agent: "Alert Agent",
        time: "Today, 10:23 AM",
        action: "Sent Slack notification",
        details: "OpenAI usage threshold exceeded (85%). Proactively alerting engineering team via Slack integration. Current burn rate indicates potential depletion in 7 days.",
        color: "bg-red-500",
        isNew: false
      },
      {
        id: 2,
        agent: "Supervisor Agent",
        time: "Today, 10:24 AM",
        action: "Escalated resource allocation",
        details: "Based on the alert, I've authorized temporary increase of resource limits by 15% to prevent service disruption. Requesting CFO agent to evaluate long-term solution.",
        color: "bg-amber-500",
        isNew: false
      },
      {
        id: 3,
        agent: "Health Check Agent",
        time: "Today, 10:25 AM",
        action: "API endpoint availability status",
        details: "Completed API health check scan. All endpoints operational: OpenAI (100%), Anthropic (99.8%), Mistral (100%), Meta (97.6%). No immediate concerns detected.",
        color: "bg-emerald-500",
        isNew: false
      },
      {
        id: 4,
        agent: "Purchasing Agent",
        time: "Today, 09:15 AM",
        action: "Executed credit purchase",
        details: "Anthropic credits reached 22% threshold. Auto-purchased $750 in additional credits based on forecasted needs. Purchase ID: ANT-2025-04-30-08721.",
        color: "bg-green-500",
        isNew: false
      },
      {
        id: 5,
        agent: "Forecasting Agent",
        time: "Today, 08:30 AM",
        action: "Updated usage forecast",
        details: "Weekly usage projection updated. Identified 28% increase in Mistral API consumption driven by new summarization feature. Adjusted Q2 budget recommendation from $5,200 to $6,650.",
        color: "bg-purple-500",
        isNew: false
      }
    ])
  }, [])

  // Simulate new logs coming in
  useEffect(() => {
    const newLogs = [
      {
        id: 101,
        agent: "Alert Agent",
        time: "Just now",
        action: "Threshold breach notification",
        details: "CRITICAL: Claude API rate limit reached (98%). Implementing automatic request throttling. Sending urgent notifications to engineering and product teams via Slack and email.",
        color: "bg-red-500",
        isNew: true
      },
      {
        id: 102,
        agent: "Forecasting Agent",
        time: "Just now",
        action: "Anomaly detection complete",
        details: "Detected unusual pattern: OpenAI API token consumption 2.8x higher than baseline for /embeddings endpoint. Likely cause: new vector database indexing job. Recommend optimizing batch size.",
        color: "bg-purple-500",
        isNew: true
      },
      {
        id: 103,
        agent: "Health Check Agent",
        time: "Just now",
        action: "Latency spike detected",
        details: "Observed 420ms average latency increase on OpenAI chat completions API. Issue appears to be on provider side. Created monitoring ticket #HC-2041 and enabling fallback to secondary provider.",
        color: "bg-emerald-500",
        isNew: true
      },
      {
        id: 104,
        agent: "Supervisor Agent",
        time: "Just now",
        action: "Implemented emergency protocol",
        details: "Due to multiple alerts, I've activated the emergency resource conservation plan. Non-critical AI requests will be queued. Estimated 40% reduction in API costs until normal operation resumes.",
        color: "bg-amber-500",
        isNew: true
      },
      {
        id: 105,
        agent: "Purchasing Agent",
        time: "Just now",
        action: "Emergency credit allocation",
        details: "Transferred $2,500 from reserve budget to OpenAI credits to prevent service disruption. This exceeds standard limit but was authorized by Supervisor Agent under emergency protocol.",
        color: "bg-green-500",
        isNew: true
      }
    ]
    
    const intervals = [5000, 10000, 15000, 20000, 25000]
    
    const timeouts = intervals.map((interval, i) => {
      return setTimeout(() => {
        if (i < newLogs.length) {
          setNewLogAlert(true)
          
          setTimeout(() => setNewLogAlert(false), 2000)
          
          setAgentLogs(prev => {
            const updated = [newLogs[i], ...prev]
            return updated.slice(0, 6) // Keep only the latest 6 logs
          })
          
          // Scroll to top of log container
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0
          }
        }
      }, interval)
    })
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Animation variants
  const logItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, height: 0, overflow: 'hidden' }
  }

  const alertVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  const handleConfigureNotifications = () => {
    router.push("/agents/notifications")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agent Network</h2>
          <p className="text-muted-foreground">Your team of AI agents working together to optimize API credit usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Status</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs hover:from-blue-700 hover:to-purple-700"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configure Agents</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Agent Network Visualization */}
          <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Agent Network</CardTitle>
              <CardDescription>Visualizing how your AI agents work together</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mx-auto h-[500px] w-full max-w-3xl">
                {/* Supervisor Agent (Center) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary bg-background p-1 shadow-lg">
                      <div className="absolute -top-1 right-0 h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Brain className="h-10 w-10" />
                        <span className="mt-1 text-xs font-semibold">Supervisor Agent</span>
                      </div>
                      <div className="absolute -z-10 h-36 w-36 animate-ping-slow rounded-full bg-primary/5"></div>
                      <div className="absolute -z-10 h-44 w-44 animate-ping-slow animation-delay-1000 rounded-full bg-primary/3"></div>
                      <div className="absolute -z-10 h-52 w-52 animate-ping-slow animation-delay-1500 rounded-full bg-primary/2"></div>
                    </div>
                    <Badge className="mt-2 bg-primary">Active</Badge>
                  </div>
                </div>

                {/* Usage Agent (Top Left) */}
                <div className="absolute left-[20%] top-[20%] transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-blue-500 bg-background p-1 shadow-md">
                      <div className="absolute -top-1 right-0 h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Eye className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-medium">Usage Agent</span>
                  </div>
                </div>
                
                {/* Usage Agent to Supervisor connection */}
                <div className="absolute left-[28%] top-[28%] h-[150px] w-[150px]">
                  <div className="absolute bg-gradient-to-r from-blue-500 to-primary h-[1px] w-[160px] rotate-[45deg] origin-left">
                    <div className="absolute h-2 w-2 top-[-3px] left-[40px] animate-flow-right rounded-full bg-blue-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-[-3px] left-[80px] animate-flow-right animation-delay-700 rounded-full bg-blue-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-[-3px] left-[120px] animate-flow-right animation-delay-1500 rounded-full bg-blue-500 opacity-70"></div>
                  </div>
                </div>

                {/* Forecasting Agent (Top Right) */}
                <div className="absolute right-[20%] top-[20%] transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-purple-500 bg-background p-1 shadow-md">
                      <div className="absolute -top-1 right-0 h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                        <LineChart className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-medium">Forecasting Agent</span>
                  </div>
                </div>
                
                {/* Forecasting Agent to Supervisor connection */}
                <div className="absolute right-[28%] top-[28%] h-[150px] w-[150px]">
                  <div className="absolute bg-gradient-to-l from-purple-500 to-primary h-[1px] w-[160px] rotate-[-45deg] origin-right">
                    <div className="absolute h-2 w-2 top-[-3px] right-[40px] animate-flow-left rounded-full bg-purple-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-[-3px] right-[80px] animate-flow-left animation-delay-700 rounded-full bg-purple-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-[-3px] right-[120px] animate-flow-left animation-delay-1500 rounded-full bg-purple-500 opacity-70"></div>
                  </div>
                </div>

                {/* Alert Agent with integrations (Bottom Right) */}
                <div className="absolute bottom-[20%] right-[20%] transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-500 bg-background p-1 shadow-md">
                      <div className="absolute -top-1 right-0 h-2 w-2 animate-pulse rounded-full bg-amber-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <Bell className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-medium">Alert Agent</span>
                  </div>
                  
                  {/* Connection line to Supervisor */}
                  <div className="absolute right-[80%] bottom-[80%] h-0.5 w-[120px] -rotate-135 transform bg-gradient-to-l from-amber-500 to-primary">
                    <div className="absolute h-2 w-2 top-0 -translate-y-1/2 animate-flow-left rounded-full bg-amber-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-0 -translate-y-1/2 animate-flow-left animation-delay-900 rounded-full bg-amber-500 opacity-70"></div>
                  </div>
                  
                  {/* Integration connections */}
                  {/* Slack */}
                  <div className="absolute bottom-[-40px] right-[30px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-md">
                      <div className="h-full w-full overflow-hidden rounded-sm">
                        <img src="/images/slack-logo.webp" alt="Slack" className="h-full w-full object-contain" />
                      </div>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[30px] w-0.5 bg-gradient-to-t from-amber-500 to-transparent">
                      <div className="absolute h-1.5 w-1.5 -translate-x-1/2 animate-flow-up rounded-full bg-amber-500 opacity-70"></div>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="absolute bottom-[-40px] right-[-15px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-md">
                      <Mail className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[30px] w-0.5 bg-gradient-to-t from-amber-500 to-transparent">
                      <div className="absolute h-1.5 w-1.5 -translate-x-1/2 animate-flow-up rounded-full bg-amber-500 opacity-70"></div>
                    </div>
                  </div>
                </div>

                {/* Purchase Agent (Bottom) */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-green-500 bg-background p-1 shadow-md">
                      <div className="absolute -top-1 right-0 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-green-500/10 text-green-500">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-medium">Purchase Agent</span>
                  </div>
                  {/* Connection line with animated pulse */}
                  <div className="absolute bottom-[100%] left-1/2 h-[80px] w-0.5 -translate-x-1/2 transform bg-gradient-to-t from-green-500 to-primary">
                    <div className="absolute h-2 w-2 -translate-x-1/2 animate-flow-up rounded-full bg-green-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 -translate-x-1/2 animate-flow-up animation-delay-1500 rounded-full bg-green-500 opacity-70"></div>
                  </div>
                  
                  {/* Provider integrations */}
                  <div className="absolute bottom-[-45px] left-[-60px]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-md">
                      <div className="h-full w-full overflow-hidden rounded-sm">
                        <img src="/images/openai-logo.webp" alt="OpenAI" className="h-full w-full object-contain" />
                      </div>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[20px] w-0.5 bg-gradient-to-t from-green-500/50 to-transparent">
                      <div className="absolute h-1 w-1 -translate-x-1/2 animate-flow-up rounded-full bg-green-500 opacity-70"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-[-45px] left-[0px]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-md">
                      <div className="h-full w-full overflow-hidden rounded-sm">
                        <img src="/images/claude-logo.webp" alt="Anthropic" className="h-full w-full object-contain" />
                      </div>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[20px] w-0.5 bg-gradient-to-t from-green-500/50 to-transparent">
                      <div className="absolute h-1 w-1 -translate-x-1/2 animate-flow-up rounded-full bg-green-500 opacity-70"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-[-45px] left-[60px]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-md">
                      <div className="h-full w-full overflow-hidden rounded-sm">
                        <img src="/images/mistral-logo.webp" alt="Mistral" className="h-full w-full object-contain" />
                      </div>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[20px] w-0.5 bg-gradient-to-t from-green-500/50 to-transparent">
                      <div className="absolute h-1 w-1 -translate-x-1/2 animate-flow-up rounded-full bg-green-500 opacity-70"></div>
                    </div>
                  </div>
                </div>

                {/* Health Agent (Bottom Left) */}
                <div className="absolute bottom-[20%] left-[20%] transform">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500 bg-background p-1 shadow-md">
                      <div className="absolute -top-1 right-0 h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-medium">Health Agent</span>
                  </div>
                  {/* Connection line with animated pulse */}
                  <div className="absolute left-[80%] bottom-[80%] h-0.5 w-[120px] rotate-135 transform bg-gradient-to-r from-emerald-500 to-primary">
                    <div className="absolute h-2 w-2 top-0 -translate-y-1/2 animate-flow-right rounded-full bg-emerald-500 opacity-70"></div>
                    <div className="absolute h-2 w-2 top-0 -translate-y-1/2 animate-flow-right animation-delay-1100 rounded-full bg-emerald-500 opacity-70"></div>
                  </div>
                  
                  {/* API Health connections */}
                  <div className="absolute bottom-[-40px] left-[-15px]">
                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-sm">
                        <div className="h-full w-full overflow-hidden rounded-sm">
                          <img src="/images/openai-logo.webp" alt="OpenAI" className="h-full w-full object-contain" />
                        </div>
                      </div>
                      <span className="animate-pulse text-[10px] text-green-500">100%</span>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[20px] w-0.5 bg-gradient-to-t from-emerald-500/50 to-transparent">
                      <div className="absolute h-1 w-1 -translate-x-1/2 animate-flow-up rounded-full bg-emerald-500 opacity-70"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-[-40px] left-[30px]">
                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-border/40 bg-background p-1 shadow-sm">
                        <div className="h-full w-full overflow-hidden rounded-sm">
                          <img src="/images/mistral-logo.webp" alt="Mistral" className="h-full w-full object-contain" />
                        </div>
                      </div>
                      <span className="animate-pulse text-[10px] text-red-500">87%</span>
                    </div>
                    <div className="absolute bottom-[100%] right-[50%] h-[20px] w-0.5 bg-gradient-to-t from-emerald-500/50 to-transparent">
                      <div className="absolute h-1 w-1 -translate-x-1/2 animate-flow-up rounded-full bg-emerald-500 opacity-70"></div>
                    </div>
                  </div>
                </div>

                {/* Animated decision points */}
                <div className="absolute left-[35%] top-[35%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-decision-point rounded-full border border-blue-500/30 bg-blue-500/20"></div>
                <div className="absolute left-[65%] top-[35%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-decision-point animation-delay-400 rounded-full border border-purple-500/30 bg-purple-500/20"></div>
                <div className="absolute left-[35%] top-[65%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-decision-point animation-delay-800 rounded-full border border-emerald-500/30 bg-emerald-500/20"></div>
                <div className="absolute left-[65%] top-[65%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-decision-point animation-delay-1200 rounded-full border border-amber-500/30 bg-amber-500/20"></div>
                <div className="absolute left-[50%] top-[80%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-decision-point animation-delay-1600 rounded-full border border-green-500/30 bg-green-500/20"></div>
                
                {/* Data flow animations */}
                <div className="absolute left-1/2 top-1/2 h-full w-full">
                  <svg className="absolute h-full w-full" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow"></circle>
                    <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="2" strokeDasharray="3,8" className="animate-spin-slow animation-delay-700" style={{ animationDirection: 'reverse' }}></circle>
                    <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="1" strokeDasharray="1,10" className="animate-spin-slow animation-delay-1000"></circle>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* CFO Agent Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">CFO Agent</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium">2 minutes ago</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Current Task</p>
                  <p className="text-sm">Analyzing credit usage patterns</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Processing</span>
                    <span>76%</span>
                  </div>
                  <Progress value={76} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Monitoring Agent Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monitoring Agent</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
                  <Eye className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium">1 minute ago</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Current Task</p>
                  <p className="text-sm">Monitoring OpenAI API usage</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">APIs Monitored</span>
                    <span>5/5</span>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Forecasting Agent Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Forecasting Agent</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                  <LineChart className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium">5 minutes ago</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Current Task</p>
                  <p className="text-sm">Updating 30-day forecasts</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Agent Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Notification Agent</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/10">
                  <MessageSquare className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium">15 minutes ago</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Integrations</p>
                  <div className="mt-1 flex gap-1">
                    <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-500">
                      Slack
                    </Badge>
                    <Badge variant="outline" className="border-muted/20 bg-muted/10 text-muted-foreground">
                      Teams
                    </Badge>
                    <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-500">
                      Email
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Notifications Sent</span>
                    <span className="ml-2">12 today</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleConfigureNotifications}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Configure</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Purchasing Agent Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Purchasing Agent</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                  <ShoppingCart className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium">2 hours ago</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Auto-Purchase</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
                      Enabled
                    </Badge>
                    <span className="text-xs text-muted-foreground">Threshold: {purchaseThreshold}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Credits Purchased</span>
                    <span>${maxPurchaseAmount} this month</span>
                  </div>
                  <Progress value={45} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Agent Intelligence Card */}
            <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Agent Intelligence</CardTitle>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Learning Mode</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                      <span className="font-medium text-blue-500">Active</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">GPT-4o</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Optimization Focus</p>
                  <p className="text-sm">Cost reduction & usage efficiency</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Intelligence Score</span>
                    <span>92/100</span>
                  </div>
                  <Progress value={92} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Agent Activity</CardTitle>
              <CardDescription>Recent actions taken by your AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={openAgentLogs} onOpenChange={setOpenAgentLogs} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Agent Logs</h4>
                  <div className="flex items-center">
                    <AnimatePresence>
                      {newLogAlert && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={alertVariants}
                          className="mr-2 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-500"
                        >
                          <Bell className="h-3 w-3" />
                          <span>New log</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="space-y-2">
                  <div className="rounded-md border border-border/40 bg-card/50 p-4">
                    <div className="space-y-4" ref={logContainerRef}>
                      <AnimatePresence initial={false}>
                        {agentLogs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={logItemVariants}
                            transition={{ duration: 0.3 }}
                            className={index > 0 ? "border-t border-border/40 pt-4" : ""}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Badge className={`${log.color} text-xs relative`}>
                                  {log.agent}
                                  {log.isNew && (
                                    <span className="absolute -right-1 -top-1 flex h-2 w-2">
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                                    </span>
                                  )}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{log.time}</span>
                                {log.isNew && (
                                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[0.65rem] text-primary">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Action:</span> {log.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                "{log.details}"
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>Configure how your AI agents work together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Purchasing Agent Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Purchasing Agent</h3>
                <div className="space-y-4 rounded-lg border border-border/40 bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-purchase">Auto-Purchase</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow the agent to automatically purchase credits when thresholds are reached
                      </p>
                    </div>
                    <Switch id="auto-purchase" checked={purchasingEnabled} onCheckedChange={setPurchasingEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase-threshold">Purchase Threshold</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="purchase-threshold"
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={purchaseThreshold}
                        onChange={(e) => setPurchaseThreshold(Number.parseInt(e.target.value))}
                        className="w-full"
                        disabled={!purchasingEnabled}
                      />
                      <span className="w-12 text-center text-sm">{purchaseThreshold}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Purchase new credits when remaining credits fall below this percentage
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-purchase">Maximum Purchase Amount</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">$</span>
                      <input
                        id="max-purchase"
                        type="number"
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="1000"
                        value={maxPurchaseAmount}
                        onChange={(e) => setMaxPurchaseAmount(Number.parseInt(e.target.value) || 0)}
                        disabled={!purchasingEnabled}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum amount the agent can spend in a single purchase
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Agent Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Agent</h3>
                <div className="space-y-4 rounded-lg border border-border/40 bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable or disable all notifications from the agent
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Notification Channels</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                          <img src="/images/slack-logo.webp" alt="Slack" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p className="text-sm">Slack</p>
                          <p className="text-xs text-muted-foreground">Send notifications to Slack</p>
                        </div>
                      </div>
                      <Switch
                        checked={slackIntegration}
                        onCheckedChange={setSlackIntegration}
                        disabled={!notificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                          <img src="/images/teams-logo.webp" alt="Microsoft Teams" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p className="text-sm">Microsoft Teams</p>
                          <p className="text-xs text-muted-foreground">Send notifications to Teams</p>
                        </div>
                      </div>
                      <Switch
                        checked={teamsIntegration}
                        onCheckedChange={setTeamsIntegration}
                        disabled={!notificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card p-0.5 overflow-hidden">
                          <img src="/images/google-mail-gmail-icon-logo-symbol-free-png.webp" alt="Email" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p className="text-sm">Email</p>
                          <p className="text-xs text-muted-foreground">Send notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={emailIntegration}
                        onCheckedChange={setEmailIntegration}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Intelligence Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Agent Intelligence</h3>
                <div className="space-y-4 rounded-lg border border-border/40 bg-card/50 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-model">AI Model</Label>
                    <select
                      id="agent-model"
                      className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={agentModel}
                      onChange={(e) => setAgentModel(e.target.value)}
                    >
                      <option value="gpt4o">GPT-4o</option>
                      <option value="gpt4">GPT-4</option>
                      <option value="claude3">Claude 3 Opus</option>
                    </select>
                    <p className="text-xs text-muted-foreground">The AI model powering your agent network</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Agent Personality</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="professional"
                          name="personality"
                          className="h-4 w-4 border-primary text-primary"
                          checked={agentPersonality === "professional"}
                          onChange={() => setAgentPersonality("professional")}
                        />
                        <Label htmlFor="professional" className="text-sm font-normal">
                          Professional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="friendly"
                          name="personality"
                          className="h-4 w-4 border-primary text-primary"
                          checked={agentPersonality === "friendly"}
                          onChange={() => setAgentPersonality("friendly")}
                        />
                        <Label htmlFor="friendly" className="text-sm font-normal">
                          Friendly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="technical"
                          name="personality"
                          className="h-4 w-4 border-primary text-primary"
                          checked={agentPersonality === "technical"}
                          onChange={() => setAgentPersonality("technical")}
                        />
                        <Label htmlFor="technical" className="text-sm font-normal">
                          Technical
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="casual"
                          name="personality"
                          className="h-4 w-4 border-primary text-primary"
                          checked={agentPersonality === "casual"}
                          onChange={() => setAgentPersonality("casual")}
                        />
                        <Label htmlFor="casual" className="text-sm font-normal">
                          Casual
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Mode</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="learn-usage"
                          className="h-4 w-4 rounded border-primary text-primary"
                          checked={learnUsage}
                          onChange={(e) => setLearnUsage(e.target.checked)}
                        />
                        <Label htmlFor="learn-usage" className="text-sm font-normal">
                          Learn from usage patterns
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="learn-feedback"
                          className="h-4 w-4 rounded border-primary text-primary"
                          checked={learnFeedback}
                          onChange={(e) => setLearnFeedback(e.target.checked)}
                        />
                        <Label htmlFor="learn-feedback" className="text-sm font-normal">
                          Learn from user feedback
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="learn-market"
                          className="h-4 w-4 rounded border-primary text-primary"
                          checked={learnMarket}
                          onChange={(e) => setLearnMarket(e.target.checked)}
                        />
                        <Label htmlFor="learn-market" className="text-sm font-normal">
                          Learn from market pricing changes
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
