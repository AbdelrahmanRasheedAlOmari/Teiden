"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AutomatedTopupCardProps {
  projectId?: string
  className?: string
}

export function AutomatedTopupCard({ projectId, className }: AutomatedTopupCardProps) {
  // Get initial settings based on project
  const getInitialSettings = () => {
    if (projectId === "mobile") {
      return {
        threshold: 20,
        amount: 500,
        nextEstimated: "May 15, 2023",
        lastTopup: "April 2, 2023",
        lastAmount: "$500",
      }
    } else if (projectId === "chatbot") {
      return {
        threshold: 30,
        amount: 250,
        nextEstimated: "May 22, 2023",
        lastTopup: "March 28, 2023",
        lastAmount: "$250",
      }
    } else {
      return {
        threshold: 25,
        amount: 1000,
        nextEstimated: "May 8, 2023",
        lastTopup: "April 10, 2023",
        lastAmount: "$1,000",
      }
    }
  }

  const initialSettings = getInitialSettings()

  // State variables with proper initialization
  const [enabled, setEnabled] = useState(true)
  const [threshold, setThreshold] = useState(initialSettings.threshold)
  const [amount, setAmount] = useState(initialSettings.amount)
  const [nextEstimated] = useState(initialSettings.nextEstimated)
  const [lastTopup] = useState(initialSettings.lastTopup)
  const [lastAmount] = useState(initialSettings.lastAmount)

  // Handle threshold change
  const handleThresholdChange = (value: number[]) => {
    setThreshold(value[0])
  }

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number.parseInt(e.target.value, 10)
    if (!isNaN(newAmount)) {
      setAmount(newAmount)
    }
  }

  return (
    <Card className={`border-border/40 bg-card/30 backdrop-blur-sm shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Automated Top-ups
            </CardTitle>
            <CardDescription>Automatically add credits when balance is low</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Badge variant={enabled ? "default" : "outline"} className={enabled ? "bg-green-500" : ""}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Credit Threshold</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        When your credits fall below this percentage, an automatic top-up will be triggered
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Below {threshold}% of total credits</span>
                <span className="text-xs font-medium">{threshold}%</span>
              </div>
            </div>
          </div>
          <Slider
            disabled={!enabled}
            value={[threshold]}
            min={5}
            max={50}
            step={5}
            onValueChange={handleThresholdChange}
            className={`${!enabled ? "opacity-50" : ""}`}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Top-up Amount</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Amount to add to your account when the threshold is reached</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              disabled={!enabled}
              className={`pl-8 ${!enabled ? "opacity-50" : ""}`}
            />
          </div>
        </div>

        <div className="rounded-md border border-border/40 bg-background/50 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Payment Method</h4>
            <div className="flex items-center gap-3 p-3 rounded-md border border-border/40 bg-background/50">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto h-8 text-xs">
                Change
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top-up Timeline</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next estimated top-up:</span>
                <span className="font-medium">{nextEstimated}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last top-up:</span>
                <span className="font-medium">
                  {lastTopup} ({lastAmount})
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
