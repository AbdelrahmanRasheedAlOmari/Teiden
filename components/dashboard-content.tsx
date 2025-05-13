"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditUsageChart } from "@/components/credit-usage-chart"
import { AlertThresholdCard } from "@/components/alert-threshold-card"
import { UsageForecastTable } from "@/components/usage-forecast-table"
import { AutomatedTopupCard } from "@/components/automated-topup-card"
import { ApiHealthWidget } from "@/components/api-health-widget"
import { RecentActivity } from "@/components/recent-activity"
import { useProject } from "@/contexts/project-context"

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Adjust metrics based on selected project
  const getMetrics = () => {
    const baseMetrics = {
      apiCalls: 1245890,
      spend: 5234.78,
      activeProjects: 12,
      apiCallsChange: "+22%",
      spendChange: "+15%",
      projectsChange: "+2",
    }

    if (projectId === "mobile") {
      return {
        apiCalls: 456320,
        spend: 2145.65,
        activeProjects: 1,
        apiCallsChange: "+18%",
        spendChange: "+12%",
        projectsChange: "0",
      }
    } else if (projectId === "chatbot") {
      return {
        apiCalls: 325680,
        spend: 1876.32,
        activeProjects: 1,
        apiCallsChange: "+8%",
        spendChange: "+5%",
        projectsChange: "0",
      }
    } else if (projectId === "main") {
      return {
        apiCalls: 463890,
        spend: 1212.81,
        activeProjects: 1,
        apiCallsChange: "+15%",
        spendChange: "+10%",
        projectsChange: "0",
      }
    }

    return baseMetrics
  }

  const metrics = getMetrics()

  return (
    <div className="space-y-8 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          {selectedProject
            ? `Viewing data for ${selectedProject.name}`
            : "Welcome back to your API management dashboard."}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="h-11">
          <TabsTrigger value="overview" className="text-base px-6">
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="text-base px-6">
            Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* API Health Status */}
          <ApiHealthWidget />

          {/* Forecast and Top-up */}
          <div className="grid gap-8 md:grid-cols-2">
            <UsageForecastTable projectId={projectId} className="md:col-span-1" />
            <AutomatedTopupCard projectId={projectId} className="md:col-span-1" />
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Total API Calls</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.apiCalls.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">{metrics.apiCallsChange} from last month</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Total Spend</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${metrics.spend.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">{metrics.spendChange} from last month</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Active Projects</CardTitle>
                <CardDescription>Using API keys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.activeProjects}</div>
                <p className="text-sm text-muted-foreground">{metrics.projectsChange} new this month</p>
              </CardContent>
            </Card>
          </div>

          {/* API Usage Chart and Alert Thresholds */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm lg:col-span-5">
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Your API usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[380px] flex flex-col">
                <CreditUsageChart />
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>Get notified when usage exceeds limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertThresholdCard
                  title="OpenAI API"
                  threshold={80}
                  currentUsage={projectId === "mobile" ? 65 : projectId === "chatbot" ? 45 : 72}
                  status={projectId === "mobile" ? "warning" : projectId === "chatbot" ? "normal" : "warning"}
                />
                <AlertThresholdCard
                  title="Anthropic API"
                  threshold={75}
                  currentUsage={projectId === "mobile" ? 82 : projectId === "chatbot" ? 30 : 60}
                  status={projectId === "mobile" ? "exceeded" : projectId === "chatbot" ? "normal" : "normal"}
                />
                <AlertThresholdCard
                  title="Mistral AI"
                  threshold={70}
                  currentUsage={projectId === "mobile" ? 40 : projectId === "chatbot" ? 68 : 45}
                  status={projectId === "mobile" ? "normal" : projectId === "chatbot" ? "warning" : "normal"}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity className="lg:col-span-3" />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Detailed Usage</CardTitle>
              <CardDescription>Breakdown of your API usage by model and project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Detailed usage analytics will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
