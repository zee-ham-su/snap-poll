"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="flex items-center space-x-2"
      title={`Current theme: ${getLabel()}. Click to cycle.`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  )
}
