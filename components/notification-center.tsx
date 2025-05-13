"use client"

import { useState } from "react"
import { Bell, X, AlertTriangle, CheckCircle, Info } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"

export function NotificationCenter() {
  const [unreadCount, setUnreadCount] = useState(3)
  const { selectedProject } = useProject()
  const projectId = selectedProject?.id || "all"

  // Notification data
  const getNotifications = () => {
    const baseNotifications = [
      {
        id: 1,
        title: "Credits low for OpenAI GPT-4o",
        description: "Credits at 22%, will be depleted in approximately 7 days",
        time: "10 minutes ago",
        type: "warning",
        read: false,
        projects: ["all", "mobile", "main"],
      },
      {
        id: 2,
        title: "Service disruption detected in Anthropic API",
        description: "Response time increased by 42% in the last hour",
        time: "1 hour ago",
        type: "error",
        read: false,
        projects: ["all", "main"],
      },
      {
        id: 3,
        title: "Auto-purchase successful",
        description: "Successfully purchased $1,000 in OpenAI credits",
        time: "2 hours ago",
        type: "success",
        read: false,
        projects: ["all", "mobile", "main"],
      },
      {
        id: 4,
        title: "Usage anomaly detected",
        description: "Unusual spike in API calls detected from Project: Mobile App",
        time: "3 hours ago",
        type: "warning",
        read: true,
        projects: ["all", "mobile"],
      },
      {
        id: 5,
        title: "Weekly usage report",
        description: "Your weekly API usage report is now available",
        time: "1 day ago",
        type: "info",
        read: true,
        projects: ["all", "main", "mobile", "chatbot"],
      },
    ]

    return baseNotifications.filter((notification) => notification.projects.includes(projectId))
  }

  const notifications = getNotifications()
  const unreadNotifications = notifications.filter((notification) => !notification.read)

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 border-border/40 bg-card/30">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex cursor-default items-start gap-3 p-3 ${!notification.read ? "bg-primary/5" : ""}`}
              >
                <div className="mt-0.5">{renderIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-none">{notification.title}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <X className="h-3 w-3" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground/70">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default justify-center p-2 text-center">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
