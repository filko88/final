"use client"

import { useEffect, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { X } from "lucide-react"

interface AgentSuggestionBarProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  imageSrc: string
  imageAlt: string
  /**
   * localStorage key to persist dismissal
   */
  localStorageKey: string
  onCtaClick?: () => void
  variant?: "default" | "red"
  compact?: boolean
}

export default function AgentSuggestionBar({
  title,
  description,
  ctaLabel,
  ctaHref,
  localStorageKey,
  imageSrc,
  imageAlt,
  onCtaClick,
  variant = "default",
  compact = false,
}: AgentSuggestionBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const dismissed = localStorage.getItem(localStorageKey)
      setIsVisible(!dismissed)
    } catch {
      setIsVisible(true)
    }
  }, [localStorageKey])

  const dismiss = () => {
    setIsClosing(true)
    try {
      localStorage.setItem(localStorageKey, "1")
    } catch {}
    // Wait for the animation to complete before unmounting
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 200)
  }

  if (!isVisible && !isClosing) return null

  return (
    <div className="w-full">
      <div className={`flex items-start sm:items-center justify-between gap-3 rounded-lg border px-3 ${compact ? 'py-2 sm:px-3' : 'py-3 sm:px-4'} duration-200 ${
        variant === 'red'
          ? 'border-red-500/30 bg-red-500/10 text-red-100'
          : 'border-white/10 bg-white/5 text-white'
      } ${
        isClosing ? "animate-out fade-out-0 slide-out-to-top-2" : "animate-in fade-in-0 slide-in-from-top-2"
      }`}>
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <img
            src={imageSrc}
            alt={imageAlt}
            width={32}
            height={32}
            className="rounded-md flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className={`font-semibold ${compact ? 'text-sm' : 'text-sm sm:text-base'} truncate`}>{title}</div>
            {description && (
              <div className={`text-xs ${variant === 'red' ? 'text-red-200/80' : 'text-white/70'} truncate`}>{description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCtaClick}
            className={`inline-flex ${compact ? 'h-8' : 'h-9'} items-center rounded-md border px-3 text-sm ${
              variant === 'red'
                ? 'border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                : 'border-white/10 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {ctaLabel}
          </a>
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
              variant === 'red'
                ? 'border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


