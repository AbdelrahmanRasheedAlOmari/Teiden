"use client"

import { useState } from "react"
import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectProvider } from "@/contexts/project-context"
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(prev => !prev)
  }

  const closeMobileSidebar = () => {
    setShowMobileSidebar(false)
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => !prev)
  }

  return (
    <ProjectProvider>
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block md:fixed md:inset-y-0 md:z-30 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} transition-all duration-300`}>
          <DashboardSidebar collapsed={sidebarCollapsed} />
          
          <div className="absolute -right-4 top-20">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSidebarCollapse} 
              className="rounded-full h-8 w-8 bg-background border-border shadow-md"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? 
                <PanelLeft className="h-4 w-4" /> : 
                <PanelLeftClose className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeMobileSidebar} />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg">
              <DashboardSidebar onClose={closeMobileSidebar} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 min-w-0 flex flex-col ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300`}>
          {/* Mobile Header with Menu Button */}
          <div className="flex md:hidden p-4 items-center border-b border-border/40">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                Teiden
              </span>
            </div>
          </div>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  )
}
