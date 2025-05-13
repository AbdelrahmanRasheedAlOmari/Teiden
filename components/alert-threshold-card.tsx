"use client"

import { AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AlertThresholdCardProps {
  title: string
  threshold: number
  currentUsage: number
  status: "normal" | "warning" | "exceeded"
}

export function AlertThresholdCard({ title, threshold, currentUsage, status }: AlertThresholdCardProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border/40 bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Settings className="h-3.5 w-3.5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Threshold: {threshold}%</span>
          <span>Current: {currentUsage}%</span>
        </div>
        <Progress
          value={currentUsage}
          className="h-1.5"
          indicatorClassName={
            status === "exceeded" ? "bg-red-500" : status === "warning" ? "bg-yellow-500" : "bg-green-500"
          }
        />
        <div className="flex items-center gap-1 text-xs">
          {status === "exceeded" ? (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          ) : status === "warning" ? (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          )}
          <span
            className={
              status === "exceeded" ? "text-red-500" : status === "warning" ? "text-yellow-500" : "text-green-500"
            }
          >
            {status === "exceeded"
              ? "Threshold exceeded"
              : status === "warning"
                ? "Approaching threshold"
                : "Below threshold"}
          </span>
        </div>
      </div>
    </div>
  )
}
