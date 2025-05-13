"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by waiting for component to mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
        <span className="sr-only">Toggle theme</span>
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full overflow-hidden transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle dark mode"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-400 transition-transform duration-300 ease-in-out" />
        ) : (
          <Moon className="h-5 w-5 text-primary transition-transform duration-300 ease-in-out" />
        )}
      </div>
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${
          theme === "dark" 
            ? "from-blue-500/20 to-purple-500/20 opacity-100" 
            : "from-yellow-200/20 to-orange-400/20 opacity-0"
        } transition-opacity duration-300`}
      />
    </button>
  )
} 