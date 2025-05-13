"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, BarChart3, Bot, CreditCard, Home, Key, Settings, X, User, LogOut, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
}

export function DashboardSidebar({ onClose, collapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState("dashboard")

  // Update active item based on current path
  useEffect(() => {
    if (pathname === "/dashboard") {
      setActiveItem("dashboard")
    } else if (pathname === "/dashboard/agents") {
      setActiveItem("agents")
    } else if (pathname === "/dashboard/alerts") {
      setActiveItem("alerts")
    } else if (pathname === "/dashboard/analytics") {
      setActiveItem("analytics")
    } else if (pathname === "/dashboard/billing") {
      setActiveItem("billing")
    } else if (pathname === "/dashboard/settings") {
      setActiveItem("settings")
    } else if (pathname === "/dashboard/api-keys") {
      setActiveItem("api-keys")
    }
  }, [pathname])

  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Abdel Alomari",
    email: "abdel@teiden.co",
    avatarUrl: "/images/avatar.svg"
  }

  // Extract initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      id: "dashboard",
    },
    {
      title: "API Keys",
      icon: Key,
      href: "/dashboard/api-keys",
      id: "api-keys",
      isPrimary: true,
    },
    {
      title: "AI Agents",
      icon: Bot,
      href: "/dashboard/agents",
      id: "agents",
    },
    {
      title: "Alerts",
      icon: AlertTriangle,
      href: "/dashboard/alerts",
      id: "alerts",
      badge: "3",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      id: "analytics",
    },
    {
      title: "Billing",
      icon: CreditCard,
      href: "/dashboard/billing",
      id: "billing",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      id: "settings",
    },
  ]

  return (
    <div className="h-full">
      <div className="flex flex-col h-full border-r border-border/40 bg-background pt-5 overflow-y-auto">
        <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-1 px-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
                Teiden
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center w-full">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
                T
              </span>
            </Link>
          )}
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md ${
                  activeItem === item.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                }`}
                onClick={onClose ? () => onClose() : undefined}
              >
                <div className="relative">
                  <item.icon
                    className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5 ${
                      activeItem === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {collapsed && item.badge && (
                    <Badge variant="default" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px] bg-primary text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="default" className="ml-auto bg-primary text-primary-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Profile section */}
        <div className="flex-shrink-0 border-t border-border/40 px-2 py-3">
          {!collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/settings?tab=account">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/settings?tab=account">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Version info */}
        <div className="flex-shrink-0 flex border-t border-border/40 p-4">
          {!collapsed ? (
            <div className="text-xs text-muted-foreground">
              <p>Teiden v1.0.0</p>
              <p className="mt-1">Lightweight API Management</p>
            </div>
          ) : (
            <div className="w-full text-center text-xs text-muted-foreground">
              <p>v1.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
