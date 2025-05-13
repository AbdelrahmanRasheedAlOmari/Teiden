"use client"

import { useState } from "react"
import { BarChart, Download, LineChart, PieChart, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditUsageChart } from "@/components/credit-usage-chart"
import { ModelUsageChart } from "@/components/model-usage-chart"
import { ProjectUsageChart } from "@/components/project-usage-chart"
import { useProject } from "@/contexts/project-context"

export function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState("30d")
  const [chartType, setChartType] = useState("usage")
  const { selectedProject } = useProject()

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            {selectedProject
              ? `Detailed insights into ${selectedProject.name} API usage and costs`
              : "Detailed insights into your API usage and costs"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 w-[120px] border-border/40 bg-card/30 text-sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Chart Type:</span>
          <div className="flex rounded-md border border-border/40 bg-card/30">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none rounded-l-md px-3 ${chartType === "usage" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setChartType("usage")}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none px-3 ${chartType === "breakdown" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setChartType("breakdown")}
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none rounded-r-md px-3 ${chartType === "comparison" ? "bg-primary/10 text-primary" : ""}`}
              onClick={() => setChartType("comparison")}
            >
              <BarChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {timeRange === "7d"
                    ? selectedProject?.id === "mobile"
                      ? "845.32"
                      : selectedProject?.id === "chatbot"
                        ? "456.78"
                        : "1,245.67"
                    : timeRange === "14d"
                      ? selectedProject?.id === "mobile"
                        ? "1,567.45"
                        : selectedProject?.id === "chatbot"
                          ? "987.65"
                          : "2,890.32"
                      : selectedProject?.id === "mobile"
                        ? "2,145.65"
                        : selectedProject?.id === "chatbot"
                          ? "1,876.32"
                          : "5,234.78"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === "7d" ? "+12%" : timeRange === "14d" ? "+8%" : "+15%"} from previous period
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeRange === "7d"
                    ? selectedProject?.id === "mobile"
                      ? "98,765"
                      : selectedProject?.id === "chatbot"
                        ? "76,543"
                        : "245,678"
                    : timeRange === "14d"
                      ? selectedProject?.id === "mobile"
                        ? "187,654"
                        : selectedProject?.id === "chatbot"
                          ? "143,210"
                          : "498,321"
                      : selectedProject?.id === "mobile"
                        ? "456,320"
                        : selectedProject?.id === "chatbot"
                          ? "325,680"
                          : "1,245,890"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === "7d" ? "+18%" : timeRange === "14d" ? "+12%" : "+22%"} from previous period
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Cost per Call</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${timeRange === "7d" ? "0.0051" : timeRange === "14d" ? "0.0058" : "0.0042"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === "7d" ? "-5%" : timeRange === "14d" ? "-2%" : "-8%"} from previous period
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] w-full">
                <CreditUsageChart />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px] w-full">
                  <ModelUsageChart />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Usage by Project</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[320px] w-full">
                  <ProjectUsageChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-10">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Model Usage Analytics</CardTitle>
              <CardDescription>Detailed breakdown of API usage by model</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[500px] w-full">
                <ModelUsageChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-10">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Usage Analytics</CardTitle>
              <CardDescription>Detailed breakdown of API usage by project</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[500px] w-full">
                <ProjectUsageChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                  <LineChart className="mx-auto h-16 w-16 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">Trend analytics will be available soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
