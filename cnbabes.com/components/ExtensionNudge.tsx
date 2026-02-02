"use client"

import { useEffect, useRef } from "react"
import { toast, useToast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"
import { ToastAction } from "@/components/ui/toast"

const EXT_NUDGE_CLICK_KEY = "CNBabes-ext-nudge-last-clicked"
const EXT_NUDGE_CLICK_ID_KEY = "CNBabes-ext-nudge-last-click-id"
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function ExtensionNudge() {
  const hasTriggeredRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useToast() // ensure provider state is initialized
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (hasTriggeredRef.current) return

    try {
      const lastClicked = localStorage.getItem(EXT_NUDGE_CLICK_KEY)
      const lastClickedAt = lastClicked ? Number(lastClicked) : 0
      const now = Date.now()

      // Show after 5s if no interaction within 7 days
      if (!lastClickedAt || now - lastClickedAt > SEVEN_DAYS_MS) {
        hasTriggeredRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)
        const delayMs = 5000
        timerRef.current = setTimeout(() => {
          // Build tracked URL with UTM + click_id
          const base = "https://chromewebstore.google.com/detail/repcentral-agent-helper/immpfbghfbcgggghbfihoppnhkpbpjgm"
          const urlObj = new URL(base)
          urlObj.searchParams.set("authuser", "0")
          urlObj.searchParams.set("hl", "en")
          urlObj.searchParams.set("utm_source", "website")
          urlObj.searchParams.set("utm_medium", "nudge")
          urlObj.searchParams.set("utm_campaign", "v2_launch")
          if (pathname) urlObj.searchParams.set("utm_content", pathname)
          const clickId = `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`
          urlObj.searchParams.set("click_id", clickId)
          const url = urlObj.toString()

          const markClicked = () => {
            try {
              localStorage.setItem(EXT_NUDGE_CLICK_KEY, String(Date.now()))
              localStorage.setItem(EXT_NUDGE_CLICK_ID_KEY, clickId)
            } catch {}
          }

          const { dismiss, update } = toast({
            title: "Our extension is live now !",
            description: "Auto‑convert links, view QC photos inline, and remove annoying popups. Free.",
            className: "items-start gap-4 pr-10 border-white/10 bg-black/40 text-white backdrop-blur-2xl backdrop-saturate-150 shadow-lg",
            duration: 2147483647,
            action: (
              <ToastAction
                altText="Install extension"
                onClick={() => {
                  markClicked()
                  window.open(url, "_blank", "noopener,noreferrer")
                  dismiss()
                }}
                className="border-white/10 bg-white/10 hover:bg-white/20 text-white"
              >
                Install free
              </ToastAction>
            )
          })

          setTimeout(() => {
            update({
              onOpenChange: (open: boolean) => {
                if (!open) {
                  markClicked()
                  dismiss()
                }
              },
            })
          }, 0)
        }, delayMs)
      }
    } catch {
      // fail silently
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  // Dev helper: window.resetExtensionNudge()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as Window & typeof globalThis & { resetExtensionNudge?: () => void }).resetExtensionNudge = () => {
        try {
          localStorage.removeItem(EXT_NUDGE_CLICK_KEY)
          hasTriggeredRef.current = false
        } catch {}
      }
    }
  }, [])

  return null
}


