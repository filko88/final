"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { getSearchSuggestions } from "@/app/actions/search"
import { usePreferences } from "@/hooks/use-preferences"

interface NavbarFindsSearchProps {
  className?: string
  inputClassName?: string
  placeholder?: string
  onSubmitted?: () => void
}

const RECENT_SEARCHES_KEY = "navbar-recent-searches"
const MAX_RECENT_SEARCHES = 6

export default function NavbarFindsSearch({
  className,
  inputClassName,
  placeholder = "Search finds...",
  onSubmitted,
}: NavbarFindsSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFindsPage = pathname?.startsWith("/finds")
  const { selectedAgent, selectedCurrency } = usePreferences()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mobileQuery, setMobileQuery] = useState("")
  const [hasMobileTyped, setHasMobileTyped] = useState(false)
  const [mobileResults, setMobileResults] = useState<Array<{
    id: number
    name: string
    brand?: string
    price: number
    image: string
    marketplace?: string
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const debouncedMobileQuery = useDebounce(mobileQuery, 250)
  
  // Initialize value from URL on mount
  const [value, setValue] = useState(() => {
    return isFindsPage ? (searchParams.get("q") ?? "") : ""
  })

  // Sync value with URL when on finds page
  useEffect(() => {
    if (isFindsPage) {
      const urlQuery = searchParams.get("q") ?? ""
      setValue(urlQuery)
    } else {
      setValue("")
    }
  }, [isFindsPage, searchParams])

  useEffect(() => {
    if (!isMobileOpen) return
    setMobileQuery(value)
    setHasMobileTyped(false)
  }, [isMobileOpen, value])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item) => typeof item === "string"))
      }
    } catch {
      setRecentSearches([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    if (!isMobileOpen) {
      setMobileQuery("")
      setMobileResults([])
      setIsSearching(false)
      return
    }
    if (typeof document !== "undefined") {
      const original = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [isMobileOpen])

  useEffect(() => {
    const trimmed = debouncedMobileQuery.trim()
    if (!isMobileOpen || trimmed.length < 2) {
      setMobileResults([])
      setIsSearching(false)
      return
    }

    let active = true
    setIsSearching(true)
    getSearchSuggestions({
      q: trimmed,
      agent: String(selectedAgent),
      currency: String(selectedCurrency),
      limit: 20,
    })
      .then((data) => {
        if (!active) return
        setMobileResults(data.items || [])
      })
      .catch(() => {
        if (!active) return
        setMobileResults([])
      })
      .finally(() => {
        if (!active) return
        setIsSearching(false)
      })

    return () => {
      active = false
    }
  }, [debouncedMobileQuery, isMobileOpen, selectedAgent, selectedCurrency])

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())]
      return next.slice(0, MAX_RECENT_SEARCHES)
    })
  }

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term))
  }

  const recentSearchList = useMemo(() => recentSearches.slice(0, MAX_RECENT_SEARCHES), [recentSearches])
  const hasMobileQuery = mobileQuery.trim().length > 0
  const showRecentSearches = recentSearchList.length > 0 && !hasMobileTyped
  const showResults = hasMobileQuery && hasMobileTyped

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      router.push("/finds")
      onSubmitted?.()
      return
    }
    router.push(`/finds?q=${encodeURIComponent(trimmed)}`)
    onSubmitted?.()
  }

  const handleClear = () => {
    setValue("")
    router.push("/finds")
  }

  const mobileOverlay = isMobileOpen ? (
    <div className="fixed inset-0 z-[70] bg-black text-white md:hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-4">
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-3 rounded-full border border-white/30 bg-white/5 px-4 py-2">
            <Search className="h-5 w-5 text-white/60" />
            <input
              autoFocus
              type="search"
              value={mobileQuery}
              onChange={(event) => {
                setMobileQuery(event.target.value)
                if (!hasMobileTyped) setHasMobileTyped(true)
              }}
              placeholder={placeholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none"
              aria-label="Search finds"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-0 py-2">
          {showRecentSearches && recentSearchList.length > 0 && (
            <div className="space-y-2">
              <div className="px-3 text-sm font-semibold text-white">Recent</div>
              <div className="divide-y divide-white/10">
                {recentSearchList.map((item) => (
                  <div key={item} className="flex items-center justify-between gap-3 px-3 py-3">
                    <button
                      type="button"
                      className="flex-1 text-left text-sm text-white"
                      onClick={() => {
                        const trimmed = item.trim()
                        if (!trimmed) return
                        addRecentSearch(trimmed)
                        router.push(`/finds?q=${encodeURIComponent(trimmed)}`)
                        onSubmitted?.()
                        setIsMobileOpen(false)
                      }}
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      className="p-1 text-white/50 hover:text-white"
                      onClick={() => removeRecentSearch(item)}
                      aria-label={`Remove ${item}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResults && (
            <div className="space-y-2">
              {isSearching && (
                <div className="flex items-center justify-center py-8 text-white/60">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {!isSearching && mobileQuery.trim().length >= 2 && mobileResults.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-white/60">
                  No results found.
                </div>
              )}
              {mobileResults.length > 0 && (
                <div className="space-y-2">
                  <div className="px-3 text-xs uppercase tracking-wide text-white/40">Results</div>
                  <div className="divide-y divide-white/10">
                    {mobileResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const trimmed = mobileQuery.trim()
                          if (trimmed) addRecentSearch(trimmed)
                          router.push(`/product/${item.id}`)
                          setIsMobileOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-white/5"
                      >
                        <div className="h-12 w-12 overflow-hidden border border-white/10 bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm text-white">{item.name}</span>
                          {item.brand && <span className="truncate text-xs text-white/60">{item.brand}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {mobileQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = mobileQuery.trim()
                    if (!trimmed) return
                    addRecentSearch(trimmed)
                    router.push(`/finds?q=${encodeURIComponent(trimmed)}`)
                    onSubmitted?.()
                    setIsMobileOpen(false)
                  }}
                  className="w-full px-3 py-4 text-left text-sm text-white/80 hover:bg-white/5"
                >
                  View all results for "{mobileQuery.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className={cn("w-full", className)}>
      <form
        className={cn(
          "hidden md:flex h-9 w-full items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 text-sm text-muted-foreground transition-colors focus-within:border-foreground/20 focus-within:bg-foreground/10",
          className
        )}
        onSubmit={handleSubmit}
        role="search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
            inputClassName
          )}
          aria-label="Search finds"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/10"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <button
          type="submit"
          className="rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Search finds"
        >
          Search
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className={cn(
          "md:hidden flex h-9 w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white/70 transition-colors hover:bg-white/10",
          inputClassName
        )}
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{placeholder}</span>
      </button>

      {typeof document !== "undefined" && mobileOverlay
        ? createPortal(mobileOverlay, document.body)
        : null}
    </div>
  )
}
