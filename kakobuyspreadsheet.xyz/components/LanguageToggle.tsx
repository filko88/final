"use client"

import { useLanguage } from "./LanguageProvider"
import { Button } from "./ui/button"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const { language } = useLanguage()

  // Only English is supported
  const getLanguageLabel = () => 'EN'

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 cursor-default hover:bg-transparent"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">
        {getLanguageLabel()}
      </span>
    </Button>
  )
}
