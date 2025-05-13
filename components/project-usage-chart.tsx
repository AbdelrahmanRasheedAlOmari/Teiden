"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useProject } from "@/contexts/project-context"

export function ProjectUsageChart() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Generate sample data showing project distribution
  const data = useMemo(() => {
    // Project data showing distribution across projects
    const baseData = [
      { name: "Mobile App", value: 2345.67, color: "#3b82f6", id: "mobile" },
      { name: "Main Project", value: 1897.56, color: "#8b5cf6", id: "main" },
      { name: "Chatbot", value: 1234.89, color: "#10b981", id: "chatbot" },
      { name: "Data Analysis", value: 876.54, color: "#f59e0b", id: "data" },
      { name: "Internal Tools", value: 432.12, color: "#ef4444", id: "internal" },
    ]

    // If a specific project is selected, highlight that project
    if (projectId !== "all") {
      return baseData.map((item) => ({
        ...item,
        value: item.id === projectId ? item.value * 1.5 : item.value * 0.3,
        opacity: item.id === projectId ? 1 : 0.5,
      }))
    }

    return baseData.map((item) => ({ ...item, opacity: 1 }))
  }, [projectId])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const project = payload[0]
      return (
        <div className="rounded-md border border-border/40 bg-background/95 p-3 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.payload.color }} />
            <p className="text-sm font-medium">{project.name}</p>
          </div>
          <p className="mt-1 text-xs">
            <span className="font-medium">${Number(project.value).toFixed(2)}</span>
            <span className="ml-1 text-muted-foreground">({(project.percent * 100).toFixed(1)}% of total)</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Click for detailed {project.name} usage</p>
        </div>
      )
    }
    return null
  }

  // Custom rendering for the pie chart label to prevent overlap
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="currentColor" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={110}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.opacity || 1} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "15px", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
