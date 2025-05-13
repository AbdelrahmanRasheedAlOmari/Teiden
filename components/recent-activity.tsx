"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentActivityProps {
  className?: string
}

export function RecentActivity({ className }: RecentActivityProps) {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"
  const [activities, setActivities] = useState<any[]>([])
  const [newActivityAlert, setNewActivityAlert] = useState(false)
  const activityContainerRef = useRef<HTMLDivElement>(null)

  // Activity data with provider logos
  const getInitialActivities = () => {
    return [
      {
        id: 1,
        time: "10 minutes ago",
        event: "OpenAI API call",
        details: "gpt-4o model, 2,500 tokens",
        project: "Mobile App",
        provider: "OpenAI",
        logo: "/images/openai-logo.webp",
        showForProjects: ["all", "mobile"],
        priority: "normal",
        isNew: false
      },
      {
        id: 2,
        time: "25 minutes ago",
        event: "Anthropic API call",
        details: "claude-3-opus model, 4,200 tokens",
        project: "Customer Support",
        provider: "Anthropic",
        logo: "/images/claude-logo.webp",
        showForProjects: ["all", "main"],
        priority: "normal",
        isNew: false
      },
      {
        id: 3,
        time: "1 hour ago",
        event: "Mistral AI API call",
        details: "mistral-large model, 1,800 tokens",
        project: "Data Analysis",
        provider: "Mistral",
        logo: "/images/mistral-logo.webp",
        showForProjects: ["all", "main"],
        priority: "normal",
        isNew: false
      },
      {
        id: 4,
        time: "2 hours ago",
        event: "OpenAI API call",
        details: "gpt-3.5-turbo model, 950 tokens",
        project: "Website Chatbot",
        provider: "OpenAI",
        logo: "/images/openai-logo.webp",
        showForProjects: ["all", "chatbot"],
        priority: "normal",
        isNew: false
      },
      {
        id: 5,
        time: "3 hours ago",
        event: "API key created",
        details: "New development key",
        project: "Mobile App",
        provider: "System",
        logo: "",
        showForProjects: ["all", "mobile"],
        priority: "high",
        isNew: false
      },
      {
        id: 6,
        time: "4 hours ago",
        event: "Meta API call",
        details: "llama-3-70b model, 3,200 tokens",
        project: "Research Project",
        provider: "Meta",
        logo: "/images/meta-logo.webp",
        showForProjects: ["all", "main"],
        priority: "normal",
        isNew: false
      },
    ].filter((activity) => activity.showForProjects.includes(projectId))
  }
  
  // Initialize activities
  useEffect(() => {
    setActivities(getInitialActivities())
  }, [projectId])

  // Simulate new activities coming in
  useEffect(() => {
    const newActivities = [
      {
        id: 101,
        time: "Just now",
        event: "API usage alert",
        details: "OpenAI usage at 80% of quota",
        project: "All Projects",
        provider: "System",
        logo: "",
        showForProjects: ["all", "mobile", "chatbot", "main"],
        priority: "high",
        isNew: true
      },
      {
        id: 102,
        time: "Just now",
        event: "OpenAI API call",
        details: "gpt-4o model, 1,240 tokens",
        project: "Mobile App",
        provider: "OpenAI",
        logo: "/images/openai-logo.webp",
        showForProjects: ["all", "mobile"],
        priority: "normal",
        isNew: true
      },
      {
        id: 103,
        time: "Just now",
        event: "Credit purchase",
        details: "Auto-purchased $50 in credits",
        project: "Customer Support",
        provider: "System",
        logo: "",
        showForProjects: ["all", "main", "chatbot"],
        priority: "high",
        isNew: true
      },
      {
        id: 104,
        time: "Just now",
        event: "Claude API call",
        details: "claude-3-haiku model, 870 tokens",
        project: "Website Chatbot",
        provider: "Anthropic",
        logo: "/images/claude-logo.webp",
        showForProjects: ["all", "chatbot"],
        priority: "normal",
        isNew: true
      },
      {
        id: 105,
        time: "Just now",
        event: "Mistral AI API call",
        details: "mistral-small model, 560 tokens",
        project: "Data Analysis",
        provider: "Mistral",
        logo: "/images/mistral-logo.webp",
        showForProjects: ["all", "main"],
        priority: "normal",
        isNew: true
      }
    ].filter(activity => activity.showForProjects.includes(projectId))
    
    const intervals = [5000, 8000, 12000, 16000, 20000]
    
    const timeouts = intervals.map((interval, i) => {
      return setTimeout(() => {
        if (i < newActivities.length) {
          setNewActivityAlert(true)
          
          setTimeout(() => setNewActivityAlert(false), 2000)
          
          setActivities(prev => {
            const updated = [newActivities[i], ...prev]
            return updated.slice(0, 6) // Keep only the latest 6 activities
          })
          
          // Scroll to top of activity container after new activity is added
          if (activityContainerRef.current) {
            activityContainerRef.current.scrollTop = 0
          }
        }
      }, interval)
    })
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [projectId])
  
  // Animation for new activity badge
  const alertVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <Card className={cn("border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden", className)}>
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Real-Time Activity</CardTitle>
          <AnimatePresence>
            {newActivityAlert && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={alertVariants}
                className="absolute right-6 top-4 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-500"
              >
                <Bell className="h-3 w-3" />
                <span>New activity</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <CardDescription>Live feed of API calls and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={activityContainerRef} className="max-h-[400px] space-y-4 overflow-auto pr-1">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "relative flex items-start gap-3 rounded-md border p-3", 
                  activity.isNew ? "border-border bg-gradient-to-r from-card/70 to-card/20" : "border-transparent",
                  activity.priority === "high" ? "bg-red-500/5" : ""
                )}
              >
                {activity.logo ? (
                  <div className={cn(
                    "relative mt-0.5 h-9 w-9 overflow-hidden rounded-md border bg-background p-1",
                    activity.isNew ? "border-primary" : "border-border/40"
                  )}>
                    <Image
                      src={activity.logo || "/placeholder.svg"}
                      alt={`${activity.provider} logo`}
                      width={28}
                      height={28}
                      className="h-full w-full object-contain"
                    />
                    {activity.isNew && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className={cn(
                    "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border bg-background",
                    activity.isNew ? "border-primary" : "border-border/40"
                  )}>
                    {activity.priority === "high" ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Info className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activity.isNew && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-medium",
                      activity.priority === "high" ? "text-red-500" : ""
                    )}>
                      {activity.event}
                    </span>
                    <span className="flex items-center text-xs text-muted-foreground">
                      {activity.time}
                      {activity.isNew && (
                        <Badge variant="outline" className="ml-2 border-primary/30 bg-primary/10 text-[0.65rem] text-primary">
                          NEW
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{activity.details}</span>
                    <Badge variant="outline" className="border-muted-foreground/30 text-xs">
                      {activity.project}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
