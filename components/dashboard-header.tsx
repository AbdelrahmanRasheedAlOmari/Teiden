"use client"

import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectSelector } from "@/components/project-selector"
import { NotificationCenter } from "@/components/notification-center"
import { SecureVaultBadge } from "@/components/secure-vault-badge"
import Link from "next/link"

interface DashboardHeaderProps {
  onMobileMenuClick?: () => void
}

export function DashboardHeader({ onMobileMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuClick} aria-label="Toggle Menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center">
          <ProjectSelector />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-[200px] bg-background pl-8 lg:w-[280px]" />
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />

          <div className="hidden md:flex items-center gap-2">
            <SecureVaultBadge />
            <Link href="/add-api-key">
              <Button
                className="h-9 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                Add API Key
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
