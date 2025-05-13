"use client"

import { useState, useEffect } from "react"
import { useProject } from "@/contexts/project-context"
import { Card } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function CreditUsageChart() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Generate data based on selected project
  const generateData = () => {
    const baseData = [
      {
        name: "Jan",
        OpenAI: 4000,
        "OpenAI-tokens": 1200000,
        "OpenAI-cost": 240,
        Anthropic: 2400,
        "Anthropic-tokens": 800000,
        "Anthropic-cost": 160,
        Mistral: 1800,
        "Mistral-tokens": 600000,
        "Mistral-cost": 90,
        Meta: 1200,
        "Meta-tokens": 400000,
        "Meta-cost": 60,
      },
      {
        name: "Feb",
        OpenAI: 3000,
        "OpenAI-tokens": 900000,
        "OpenAI-cost": 180,
        Anthropic: 2800,
        "Anthropic-tokens": 950000,
        "Anthropic-cost": 190,
        Mistral: 2200,
        "Mistral-tokens": 750000,
        "Mistral-cost": 112,
        Meta: 1500,
        "Meta-tokens": 500000,
        "Meta-cost": 75,
      },
      {
        name: "Mar",
        OpenAI: 5000,
        "OpenAI-tokens": 1500000,
        "OpenAI-cost": 300,
        Anthropic: 3200,
        "Anthropic-tokens": 1100000,
        "Anthropic-cost": 220,
        Mistral: 2800,
        "Mistral-tokens": 950000,
        "Mistral-cost": 142,
        Meta: 1800,
        "Meta-tokens": 600000,
        "Meta-cost": 90,
      },
      {
        name: "Apr",
        OpenAI: 6800,
        "OpenAI-tokens": 2000000,
        "OpenAI-cost": 400,
        Anthropic: 4200,
        "Anthropic-tokens": 1400000,
        "Anthropic-cost": 280,
        Mistral: 3600,
        "Mistral-tokens": 1200000,
        "Mistral-cost": 180,
        Meta: 2400,
        "Meta-tokens": 800000,
        "Meta-cost": 120,
      },
      {
        name: "May",
        OpenAI: 7500,
        "OpenAI-tokens": 2250000,
        "OpenAI-cost": 450,
        Anthropic: 4800,
        "Anthropic-tokens": 1600000,
        "Anthropic-cost": 320,
        Mistral: 4200,
        "Mistral-tokens": 1400000,
        "Mistral-cost": 210,
        Meta: 3000,
        "Meta-tokens": 1000000,
        "Meta-cost": 150,
      },
    ]

    // Modify data based on project
    if (projectId === "mobile") {
      return baseData.map((item) => ({
        ...item,
        OpenAI: Math.round(item["OpenAI"] * 0.6),
        "OpenAI-tokens": Math.round(item["OpenAI-tokens"] * 0.6),
        "OpenAI-cost": Math.round(item["OpenAI-cost"] * 0.6),
        Anthropic: Math.round(item["Anthropic"] * 0.4),
        "Anthropic-tokens": Math.round(item["Anthropic-tokens"] * 0.4),
        "Anthropic-cost": Math.round(item["Anthropic-cost"] * 0.4),
        Mistral: Math.round(item["Mistral"] * 0.7),
        "Mistral-tokens": Math.round(item["Mistral-tokens"] * 0.7),
        "Mistral-cost": Math.round(item["Mistral-cost"] * 0.7),
        Meta: Math.round(item["Meta"] * 0.5),
        "Meta-tokens": Math.round(item["Meta-tokens"] * 0.5),
        "Meta-cost": Math.round(item["Meta-cost"] * 0.5),
      }))
    } else if (projectId === "chatbot") {
      return baseData.map((item) => ({
        ...item,
        OpenAI: Math.round(item["OpenAI"] * 0.8),
        "OpenAI-tokens": Math.round(item["OpenAI-tokens"] * 0.8),
        "OpenAI-cost": Math.round(item["OpenAI-cost"] * 0.8),
        Anthropic: Math.round(item["Anthropic"] * 0.3),
        "Anthropic-tokens": Math.round(item["Anthropic-tokens"] * 0.3),
        "Anthropic-cost": Math.round(item["Anthropic-cost"] * 0.3),
        Mistral: Math.round(item["Mistral"] * 0.2),
        "Mistral-tokens": Math.round(item["Mistral-tokens"] * 0.2),
        "Mistral-cost": Math.round(item["Mistral-cost"] * 0.2),
        Meta: Math.round(item["Meta"] * 0.1),
        "Meta-tokens": Math.round(item["Meta-tokens"] * 0.1),
        "Meta-cost": Math.round(item["Meta-cost"] * 0.1),
      }))
    }

    return baseData
  }

  const allModels = [
    {
      id: "OpenAI",
      name: "OpenAI",
      color: "#10a37f", // OpenAI green
      logo: "/images/openai-logo.webp",
      available: {
        all: true,
        mobile: true,
        chatbot: true,
        main: true,
      }
    },
    {
      id: "Anthropic",
      name: "Anthropic",
      color: "#a259ff", // Purple for Anthropic
      logo: "/images/claude-logo.webp",
      available: {
        all: true,
        mobile: true,
        chatbot: true,
        main: false,
      }
    },
    {
      id: "Mistral",
      name: "Mistral AI",
      color: "#0ea5e9", // Blue for Mistral
      logo: "/images/mistral-logo.webp",
      available: {
        all: true,
        mobile: true,
        chatbot: false,
        main: true,
      }
    },
    {
      id: "Meta",
      name: "Meta AI",
      color: "#1877f2", // Meta blue
      logo: "/images/meta-logo.webp",
      available: {
        all: true,
        mobile: false,
        chatbot: false,
        main: true,
      }
    },
  ]
  
  // Get the available models for the current project
  const availableModels = allModels.filter(model => {
    return model.available[projectId as keyof typeof model.available] === true
  })
  
  const [chartData, setChartData] = useState(generateData())
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [filteredData, setFilteredData] = useState(chartData)
  
  // Initialize selected models when project changes
  useEffect(() => {
    setChartData(generateData())
    // Reset selected models when project changes
    setSelectedModels(availableModels.map(m => m.id))
  }, [projectId])
  
  // Update filtered data when selected models change
  useEffect(() => {
    if (selectedModels.length === 0) {
      setFilteredData([])
      return
    }
    
    if (selectedModels.length === availableModels.length) {
      setFilteredData(chartData)
      return
    }
    
    const newData = chartData.map(item => {
      const newItem = { name: item.name } as any
      // Only include selected models and their related data
      selectedModels.forEach(modelId => {
        newItem[modelId] = item[modelId as keyof typeof item]
        newItem[`${modelId}-tokens`] = item[`${modelId}-tokens` as keyof typeof item]
        newItem[`${modelId}-cost`] = item[`${modelId}-cost` as keyof typeof item]
      })
      return newItem
    })
    
    setFilteredData(newData)
  }, [selectedModels, chartData, availableModels.length])

  // Custom tooltip component to show both cost and token usage
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 border border-border/40 bg-background/95 shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (!entry.dataKey.includes("-tokens") && !entry.dataKey.includes("-cost")) {
              const modelName = entry.dataKey
              const tokens = payload.find((p: any) => p.dataKey === `${modelName}-tokens`)?.value || 0
              const cost = payload.find((p: any) => p.dataKey === `${modelName}-cost`)?.value || 0

              return (
                <div key={`item-${index}`} className="flex flex-col mb-1 last:mb-0">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium">{modelName}</span>
                  </div>
                  <div className="ml-5 text-xs text-muted-foreground">
                    <div>Credits: {entry.value.toLocaleString()}</div>
                    <div>Tokens: {tokens.toLocaleString()}</div>
                    <div>Cost: ${cost.toLocaleString()}</div>
                  </div>
                </div>
              )
            }
            return null
          })}
        </Card>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="hidden sm:inline-block">Filter by Provider</span>
              <span className="sm:hidden">Filter</span>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[260px]">
            <DropdownMenuLabel>API Providers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedModels.length === availableModels.length}
              onCheckedChange={() => {
                if (selectedModels.length === availableModels.length) {
                  setSelectedModels([])
                } else {
                  setSelectedModels(availableModels.map(m => m.id))
                }
              }}
              className="py-2.5"
            >
              <span className="font-medium">All Providers</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {availableModels.map((model) => (
              <DropdownMenuCheckboxItem
                key={model.id}
                checked={selectedModels.includes(model.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedModels([...selectedModels, model.id])
                  } else {
                    setSelectedModels(selectedModels.filter(id => id !== model.id))
                  }
                }}
                className="flex items-center gap-2 py-2.5"
              >
                <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center overflow-hidden rounded bg-background">
                  <img 
                    src={model.logo} 
                    alt={model.name} 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <span>{model.name}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart 
          data={filteredData} 
          margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            {availableModels
              .filter(model => selectedModels.includes(model.id))
              .map((model) => (
                <linearGradient key={model.id} id={`${model.id}Gradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={model.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={model.color} stopOpacity={0} />
                </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.2)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border) / 0.2)" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border) / 0.2)" }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 15 }}
            height={36}
            iconSize={10}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom" 
            align="center"
          />
          {availableModels
            .filter(model => selectedModels.includes(model.id))
            .map((model) => (
              <Area
                key={model.id}
                type="monotone"
                dataKey={model.id}
                name={model.name}
                stroke={model.color}
                fill={`url(#${model.id}Gradient)`}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
