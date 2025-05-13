"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useProject } from "@/contexts/project-context"

export function ModelUsageChart() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Generate sample data based on the selected project
  const data = useMemo(() => {
    // Base data for all models
    const baseData = [
      {
        name: "GPT-4o",
        tokens: 2450000,
        cost: 3200.5,
        id: "gpt4",
      },
      {
        name: "Claude 3 Opus",
        tokens: 1890000,
        cost: 2100.75,
        id: "claude",
      },
      {
        name: "Mistral Large",
        tokens: 1450000,
        cost: 725.0,
        id: "mistral",
      },
      {
        name: "Llama 3",
        tokens: 2780000,
        cost: 278.0,
        id: "llama",
      },
      {
        name: "Anthropic Claude 3 Sonnet",
        tokens: 3250000,
        cost: 975.0,
        id: "claude-sonnet",
      },
      {
        name: "GPT-3.5 Turbo",
        tokens: 5680000,
        cost: 850.2,
        id: "gpt35",
      },
    ]

    // Adjust data based on project
    if (projectId === "mobile") {
      return baseData
        .filter((item) => ["gpt4", "mistral", "gpt35", "llama"].includes(item.id))
        .map((item) => ({
          ...item,
          tokens: item.id === "gpt4" || item.id === "mistral" ? item.tokens * 0.6 : item.tokens * 0.2,
          cost: item.id === "gpt4" || item.id === "mistral" ? item.cost * 0.6 : item.cost * 0.2,
        }))
    } else if (projectId === "chatbot") {
      return baseData
        .filter((item) => ["claude", "claude-sonnet", "gpt35", "llama"].includes(item.id))
        .map((item) => ({
          ...item,
          tokens: item.id === "claude" || item.id === "claude-sonnet" ? item.tokens * 0.7 : item.tokens * 0.1,
          cost: item.id === "claude" || item.id === "claude-sonnet" ? item.cost * 0.7 : item.cost * 0.1,
        }))
    } else if (projectId === "main") {
      return baseData
        .filter((item) => ["gpt4", "claude", "gpt35", "claude-sonnet"].includes(item.id))
        .map((item) => ({
          ...item,
          tokens: item.tokens * 0.4,
          cost: item.cost * 0.4,
        }))
    }

    return baseData
  }, [projectId])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-border/40 bg-background/95 p-3 shadow-md backdrop-blur-sm">
          <p className="mb-2 text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}: </span>
              <span className="font-medium">
                {entry.dataKey === "tokens"
                  ? `${(Number(entry.value) / 1000000).toFixed(2)}M tokens`
                  : `$${Number(entry.value).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.2)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#8884d8"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `$${value}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="cost" name="Cost" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
