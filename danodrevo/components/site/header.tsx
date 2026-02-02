"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Menu, Search, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BrandMark } from "@/components/site/brand"
import { cn } from "@/lib/utils"
import { usePreferences, agentOptions, currencyOptions } from "@/hooks/use-preferences"
import { useDebounce } from "@/hooks/use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { getSearchSuggestions } from "@/app/actions/search"

const links = [
  { href: "/finds", label: "Finds" },
  { href: "/sellers", label: "Sellers" },
  { href: "/tools", label: "Tools" },
  { href: "/tutorials", label: "Tutorials" },
]

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { selectedAgent, setSelectedAgent, selectedCurrency, setSelectedCurrency, isLoaded } = usePreferences()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileQuery, setMobileQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [mobileResults, setMobileResults] = useState<Array<{
    id: number
    name: string
    brand?: string
    price: number
    image: string
    marketplace?: string
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedMobileQuery = useDebounce(mobileQuery, 250)
  const recentSearchKey = "navbar-recent-searches"
  const registerLinks: Record<string, string> = {
    allchinabuy: "https://www.allchinabuy.com/en/page/login?partnercode=dkreps&type=register",
    sugargoo: "https://www.sugargoo.com/register?memberId=2359202033633516502",
    pingubuy: "https://www.pingubuy.com/register?invite=aVlya1dWNTE=",
    usfans: "https://usfans.com/register?ref=75GDBV",
    eastmallbuy: "https://www.eastmallbuy.com/register/invite/dkebia_.html",
    gonestbuy: "https://www.gonest.cn/shipping/pages/login/index?inviteCode=VTZLSP&inviteActCode=GEAEKXQHLQ",
    hipobuy: "https://hipobuy.com/register?inviteCode=EVDVZ4WIB",
    itaobuy: "https://itaobuy.allapp.link/d5uicq0a0mjgn6rq124g",
    loongbuy: "https://loongbuy.com/register?code=0JD64B",
    lovegobuy: "https://www.lovegobuy.com/?invite_code=QLQCKK",
    cssbuy: "https://www.cssbuy.com/register?invite=R0dfWU1YNTQ5Nlg=",
    pantherbuy: "https://pantherbuy.com/register?inviteid=AkPEe0",
    bbdbuy: "https://bbdbuy.com/index/user/register/invite/ODEwODE%3D.html",
    kakobuy: "https://www.kakobuy.com/register&affcode=ymqr7",
    cnfans: "https://cnfans.com/register&ref=341508",
    hoobuy: "https://hoobuy.com/signUp&inviteCode=LXylwLRO",
    acbuy: "https://www.acbuy.com/login?loginStatus=register&redirectUrl=/home&u=53BK4W",
    oopbuy: "https://oopbuy.com/register?inviteCode=08PPSQD7I",
    mulebuy: "https://mulebuy.com/register&ref=200000600",
    orientdig: "https://orientdig.com/login&ref=100000775",
    superbuy: "https://www.superbuy.com/en/page/login/?type=register&inviteCode=90OQA6362",
  }
  const preferredRegisterLink = registerLinks[String(selectedAgent)] || registerLinks.oopbuy
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!mobileSearchOpen) {
      setMobileQuery("")
      setMobileResults([])
    }
  }, [mobileSearchOpen])

  useEffect(() => {
    if (mobileSearchOpen) {
      // Multiple attempts to ensure keyboard opens on mobile
      const focusInput = () => {
        if (mobileSearchInputRef.current) {
          mobileSearchInputRef.current.focus()
          // Force click on touch devices to ensure keyboard appears
          if ('ontouchstart' in window) {
            mobileSearchInputRef.current.click()
          }
        }
      }

      // Immediate attempt
      requestAnimationFrame(() => {
        focusInput()
        // Second attempt after a short delay for reliability
        setTimeout(focusInput, 100)
        // Third attempt for stubborn mobile browsers
        setTimeout(focusInput, 300)
      })
    }
  }, [mobileSearchOpen])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(recentSearchKey)
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
    window.localStorage.setItem(recentSearchKey, JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    if (debouncedMobileQuery.trim().length < 2) {
      setMobileResults([])
      setIsSearching(false)
      return
    }

    let active = true
    setIsSearching(true)
    getSearchSuggestions({
      q: debouncedMobileQuery.trim(),
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
  }, [debouncedMobileQuery, selectedAgent, selectedCurrency])

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())]
      return next.slice(0, 8)
    })
  }

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term))
  }

  const NavLinks = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-foreground/5 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )

  return (
    <header className="fixed top-0 z-50 w-full border-b border-foreground/5 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <BrandMark />
          <nav className="hidden items-center gap-2 lg:flex">
            <NavLinks />
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="flex h-9 w-[180px] items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/10"
            aria-label="Search finds"
          >
            <Search className="h-4 w-4" />
            <span className="truncate">Search finds...</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-foreground/10 bg-foreground/5 p-0 text-foreground hover:bg-foreground/10 aspect-square"
                aria-label="Preferences"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm hover:bg-foreground/5 focus:bg-foreground/10 data-[highlighted]:bg-foreground/10 data-[state=open]:bg-foreground/10">
                  Agent
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40 max-h-72 overflow-y-auto">
                  <DropdownMenuRadioGroup value={selectedAgent}>
                    {agentOptions.map((agent) => (
                      <DropdownMenuRadioItem
                        key={agent.value}
                        value={agent.value}
                        disabled={!isLoaded}
                        onClick={() => setSelectedAgent(agent.value)}
                        className="capitalize text-foreground hover:bg-foreground/5 focus:bg-foreground/10 data-[highlighted]:bg-foreground/10 data-[state=checked]:bg-foreground/10 data-[state=checked]:text-foreground"
                      >
                        {agent.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-sm hover:bg-foreground/5 focus:bg-foreground/10 data-[highlighted]:bg-foreground/10 data-[state=open]:bg-foreground/10">
                  Currency
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40 max-h-72 overflow-y-auto">
                  <DropdownMenuRadioGroup value={selectedCurrency}>
                    {currencyOptions.map((currency) => (
                      <DropdownMenuRadioItem
                        key={currency.value}
                        value={currency.value}
                        disabled={!isLoaded}
                        onClick={() => setSelectedCurrency(currency.value)}
                        className="text-foreground hover:bg-foreground/5 focus:bg-foreground/10 data-[highlighted]:bg-foreground/10 data-[state=checked]:bg-foreground/10 data-[state=checked]:text-foreground"
                      >
                        <span className="mr-2 font-semibold">{currency.symbol}</span>
                        {currency.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild className="rounded-full px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/finds">Browse Finds</Link>
          </Button>

        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Search finds"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] border-l border-foreground/10 px-0">
              <div className="flex flex-col gap-6 pt-10 px-4">
                <BrandMark showTagline />
                <div className="flex flex-col items-start gap-2 [&_a]:px-0 [&_a]:py-2">
                  {links.map((link) => {
                    const active = pathname === link.href
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
                <div className="pt-2 space-y-2">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-foreground/10 bg-foreground/5 hover:bg-foreground/10"
                      onClick={() => {
                        const opener = (window as Window & { openWelcomeModal?: () => void }).openWelcomeModal
                        if (opener) opener()
                      }}
                    >
                      My Settings
                    </Button>
                  </SheetClose>
                  <Button
                    asChild
                    className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a
                      href={preferredRegisterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Register on {agentOptions.find((agent) => agent.value === selectedAgent)?.label || "Preferred agent"}
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CommandDialog
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        hasResults={mobileResults.length > 0 || mobileQuery.length > 0}
        commandClassName="bg-white text-black"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-3 pt-12 pb-3">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-black/60 hover:text-black md:hidden"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <CommandInput
              ref={mobileSearchInputRef}
              placeholder="Search finds..."
              value={mobileQuery}
              onValueChange={setMobileQuery}
              autoFocus
              className="text-black placeholder:text-black/40 text-base"
              wrapperClassName="flex-1 rounded-xl border border-black/20 bg-white px-4"
            />
          </div>
          <CommandList className="max-h-[60vh]">
            {mobileQuery.trim().length === 0 && recentSearches.length > 0 && (
              <div className="px-3 md:hidden">
                <div className="text-base font-semibold text-black">Recent</div>
                <div className="mt-3 space-y-3">
                  {recentSearches.map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <button
                        type="button"
                        className="flex-1 text-left text-sm text-black"
                        onClick={() => {
                          const trimmed = item.trim()
                          if (!trimmed) return
                          addRecentSearch(trimmed)
                          router.push(`/finds?q=${encodeURIComponent(trimmed)}`)
                          setMobileSearchOpen(false)
                        }}
                      >
                        {item}
                      </button>
                      <button
                        type="button"
                        className="p-1 text-black/40 hover:text-black"
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
            {isSearching && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!isSearching && mobileQuery.trim().length >= 2 && mobileResults.length === 0 && (
              <CommandEmpty className="text-muted-foreground">No results found.</CommandEmpty>
            )}
            {mobileResults.length > 0 && (
              <CommandGroup heading="Closest results" className="text-muted-foreground md:[&_[cmdk-group-heading]]:hidden">
                {mobileResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.brand ?? ""}`.trim()}
                    onSelect={() => {
                      addRecentSearch(mobileQuery.trim())
                      router.push(`/product/${item.id}`)
                      setMobileSearchOpen(false)
                    }}
                    className="flex items-center gap-3 text-foreground/80 data-[selected=true]:text-foreground hover:bg-foreground/10"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-foreground">{item.name}</span>
                      {item.brand && <span className="truncate text-xs text-muted-foreground">{item.brand}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {mobileQuery.trim().length > 0 && (
              <>
                <CommandSeparator />
                <CommandItem
                  value={mobileQuery.trim()}
                  onSelect={() => {
                    const trimmed = mobileQuery.trim()
                    if (!trimmed) return
                    addRecentSearch(trimmed)
                    router.push(`/finds?q=${encodeURIComponent(trimmed)}`)
                    setMobileSearchOpen(false)
                  }}
                  className="text-foreground/80 data-[selected=true]:text-foreground hover:bg-foreground/10"
                >
                  View all results for "{mobileQuery.trim()}"
                </CommandItem>
              </>
            )}
          </CommandList>
        </div>
      </CommandDialog>
    </header>
  )
}

