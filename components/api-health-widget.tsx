"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import Image from "next/image"

export function ApiHealthWidget() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Simulate different API statuses based on the selected project
  const getApiStatuses = () => {
    if (projectId === "mobile") {
      return [
        { provider: "OpenAI", status: "operational", latency: "124ms", logo: "/images/openai-logo.webp" },
        { provider: "Anthropic", status: "degraded", latency: "387ms", logo: "/images/claude-logo.webp" },
        { provider: "Mistral AI", status: "operational", latency: "156ms", logo: "/images/mistral-logo.webp" },
        { provider: "Meta", status: "operational", latency: "142ms", logo: "/images/meta-logo.webp" },
      ]
    } else if (projectId === "chatbot") {
      return [
        { provider: "OpenAI", status: "operational", latency: "118ms", logo: "/images/openai-logo.webp" },
        { provider: "Anthropic", status: "operational", latency: "210ms", logo: "/images/claude-logo.webp" },
        { provider: "Mistral AI", status: "outage", latency: "N/A", logo: "/images/mistral-logo.webp" },
        { provider: "Meta", status: "operational", latency: "135ms", logo: "/images/meta-logo.webp" },
      ]
    } else {
      return [
        { provider: "OpenAI", status: "operational", latency: "115ms", logo: "/images/openai-logo.webp" },
        { provider: "Anthropic", status: "operational", latency: "205ms", logo: "/images/claude-logo.webp" },
        { provider: "Mistral AI", status: "operational", latency: "148ms", logo: "/images/mistral-logo.webp" },
        { provider: "Meta", status: "degraded", latency: "312ms", logo: "/images/meta-logo.webp" },
      ]
    }
  }

  const apiStatuses = getApiStatuses()

  // Helper function to render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
            Operational
          </Badge>
        )
      case "degraded":
        return (
          <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
            Degraded
          </Badge>
        )
      case "outage":
        return (
          <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-500">
            Outage
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-500">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>API Health Status</CardTitle>
        <CardDescription>Real-time status of your connected API providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {apiStatuses.map((api) => (
            <div
              key={api.provider}
              className="flex flex-col space-y-2 rounded-lg border border-border/40 bg-background/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full bg-background">
                    <Image
                      src={api.logo || "/placeholder.svg"}
                      alt={`${api.provider} logo`}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium">{api.provider}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{renderStatusIcon(api.status)}</TooltipTrigger>
                    <TooltipContent>
                      <p>Current status: {api.status}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center justify-between">
                {renderStatusBadge(api.status)}
                <span className="text-xs text-muted-foreground">Latency: {api.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
