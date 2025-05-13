"use client"

import { AlertCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UsageForecastTableProps {
  projectId?: string
  className?: string
}

export function UsageForecastTable({ projectId, className }: UsageForecastTableProps) {
  // Adjust forecast data based on selected project
  const getForecastData = () => {
    const baseData = [
      {
        provider: "OpenAI",
        model: "GPT-4o",
        remainingCredits: 4200,
        totalCredits: 10000,
        daysRemaining: 18,
        burnRate: "$234/day",
        predictedSpend: "$7,020/month",
        status: "normal",
      },
      {
        provider: "Anthropic",
        model: "Claude 3 Opus",
        remainingCredits: 1800,
        totalCredits: 5000,
        daysRemaining: 12,
        burnRate: "$150/day",
        predictedSpend: "$4,500/month",
        status: "warning",
      },
      {
        provider: "Mistral AI",
        model: "Mistral Large",
        remainingCredits: 2500,
        totalCredits: 5000,
        daysRemaining: 25,
        burnRate: "$100/day",
        predictedSpend: "$3,000/month",
        status: "normal",
      },
    ]

    if (projectId === "mobile") {
      return [
        {
          provider: "OpenAI",
          model: "GPT-4o",
          remainingCredits: 1200,
          totalCredits: 5000,
          daysRemaining: 8,
          burnRate: "$150/day",
          predictedSpend: "$4,500/month",
          status: "warning",
        },
        {
          provider: "Anthropic",
          model: "Claude 3 Sonnet",
          remainingCredits: 400,
          totalCredits: 2000,
          daysRemaining: 4,
          burnRate: "$100/day",
          predictedSpend: "$3,000/month",
          status: "critical",
        },
        {
          provider: "Mistral AI",
          model: "Mistral Medium",
          remainingCredits: 1500,
          totalCredits: 3000,
          daysRemaining: 15,
          burnRate: "$100/day",
          predictedSpend: "$3,000/month",
          status: "normal",
        },
      ]
    } else if (projectId === "chatbot") {
      return [
        {
          provider: "OpenAI",
          model: "GPT-3.5 Turbo",
          remainingCredits: 3000,
          totalCredits: 5000,
          daysRemaining: 30,
          burnRate: "$100/day",
          predictedSpend: "$3,000/month",
          status: "normal",
        },
        {
          provider: "Anthropic",
          model: "Claude 3 Haiku",
          remainingCredits: 1200,
          totalCredits: 2000,
          daysRemaining: 24,
          burnRate: "$50/day",
          predictedSpend: "$1,500/month",
          status: "normal",
        },
        {
          provider: "Mistral AI",
          model: "Mistral Small",
          remainingCredits: 600,
          totalCredits: 1000,
          daysRemaining: 12,
          burnRate: "$50/day",
          predictedSpend: "$1,500/month",
          status: "warning",
        },
      ]
    }

    return baseData
  }

  const forecastData = getForecastData()

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return (
          <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-500">
            Critical
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
            Warning
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
            Normal
          </Badge>
        )
    }
  }

  // Helper function to get progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <Card className={`border-border/40 bg-card/30 backdrop-blur-sm shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Usage Forecast
            </CardTitle>
            <CardDescription>Projected usage and credit depletion timeline</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {forecastData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.provider}</span>
                    <span className="text-xs text-muted-foreground">({item.model})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <div className="space-y-1">
                          <p className="font-medium">Usage Details</p>
                          <p className="text-xs">Burn rate: {item.burnRate}</p>
                          <p className="text-xs">Predicted monthly spend: {item.predictedSpend}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.remainingCredits.toLocaleString()} / {item.totalCredits.toLocaleString()} credits
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{item.daysRemaining} days remaining</span>
                    <span className="text-xs text-muted-foreground">({item.predictedSpend})</span>
                  </div>
                </div>
                <Progress
                  value={(item.remainingCredits / item.totalCredits) * 100}
                  className={`h-2 ${getProgressColor(item.status)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
