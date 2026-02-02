"use client"

import * as React from "react"
import { Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeDropdown() {
  const { theme, setTheme } = useTheme()
  const themes = [
    { value: "dark", label: "Dark", icon: Moon },
  ]

  return (
    <div className="flex items-center justify-between w-full h-10 px-2">
      <span className="text-sm text-white dark:text-white text-zinc-900">Theme</span>
      <div className="flex items-center gap-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          return (
            <Button
              key={themeOption.value}
              variant="ghost"
              size="sm"
              onClick={() => setTheme(themeOption.value)}
              className={`h-7 w-7 p-0 rounded-md transition-all duration-150 focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                isSelected
                  ? "bg-white/20 dark:bg-white/20 bg-zinc-100/70 text-white dark:text-white text-zinc-900"
                  : "hover:bg-white/10 dark:hover:bg-white/10 hover:bg-zinc-50/40 text-white/70 dark:text-white/70 text-zinc-600 hover:text-white dark:hover:text-white hover:text-zinc-900"
              }`}
              title={themeOption.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
} 