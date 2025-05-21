"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import Image from "next/image"

interface ApiStatus {
  provider: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  latency: string;
  logo: string;
  lastIncident?: {
    title: string;
    date: string;
    status: string;
  };
}

export function ApiHealthWidget() {
  const { selectedProject } = useProject()
  // const projectId = selectedProject?.id || "all"

  const [apiStatuses, setApiStatuses] = useState<ApiStatus[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("/api/status")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch API status")
        const data = await res.json()
        setApiStatuses(data.apiStatuses)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading API status...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : apiStatuses && apiStatuses.length > 0 ? (
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
                        {api.lastIncident && (
                          <>
                            <div className="mt-1 font-semibold">{api.lastIncident.title}</div>
                            <div className="text-xs text-muted-foreground">{api.lastIncident.date}</div>
                            <div className="text-xs">{api.lastIncident.status}</div>
                          </>
                        )}
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
        ) : (
          <div className="text-muted-foreground text-center">No API status data available.</div>
        )}
      </CardContent>
    </Card>
  )
}
