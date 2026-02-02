"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Menu, X, ChevronDown } from "lucide-react"
import { usePreferences, agentOptions } from "@/hooks/use-preferences"
import Logo from "@/components/Logo"
import { navLinks, getNavLabel } from "@/lib/navigation"
import { FrostedPanelBackground } from "@/components/FrostedGlass"
import NavbarFindsSearch from "@/components/NavbarFindsSearch"
import StarBorder from "@/components/ui/star-border"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreHoverTimerRef = useRef<number | null>(null)
  const pathname = usePathname()
  const { selectedAgent } = usePreferences()

  // Get agent display name for register button
  const getAgentDisplayName = () => {
    const agent = agentOptions.find(a => a.value === selectedAgent)
    return agent ? agent.label : "Kakobuy"
  }

  // Get agent-specific register URL
  const getAgentRegisterUrl = () => {
    switch (selectedAgent) {
      case "kakobuy":
        return "https://ikako.vip/r/peter"
      case "acbuy":
        return "https://acbuy.com/login?loginStatus=register&code=VDFVGW"
      case "cnfans":
        return "https://cnfans.com/register?ref=144051"
      case "oopbuy":
        return "https://oopbuy.com/register?inviteCode=5I6VVS7GI"
      default:
        return "https://ikako.vip/r/peter"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center bg-black border-b border-white/10" suppressHydrationWarning={true}>
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 flex justify-between items-center relative z-10" suppressHydrationWarning>

        {/* LEFT SIDE: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Logo />
          {/* Left nav: Finds, More */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.filter(link => ["Finds", "Sellers"].includes(link.label)).map((link) => {
              const isActive = pathname === link.href
              return (
                <Link key={link.label} href={link.href} data-active={isActive} prefetch={link.prefetch}
                  className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/70 hover:text-white"}`}>
                  {getNavLabel(link.label)}
                </Link>
              )
            })}

            {/* More Dropdown */}
            <Popover open={isMoreOpen} onOpenChange={setIsMoreOpen}>
              <div
                onMouseEnter={() => {
                  if (moreHoverTimerRef.current) window.clearTimeout(moreHoverTimerRef.current)
                  setIsMoreOpen(true)
                }}
                onMouseLeave={() => {
                  if (moreHoverTimerRef.current) window.clearTimeout(moreHoverTimerRef.current)
                  moreHoverTimerRef.current = window.setTimeout(() => setIsMoreOpen(false), 150)
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    className="text-sm font-medium transition-colors inline-flex items-center gap-1 text-white/70 hover:text-white focus:outline-none no-outline nav-more-button"
                    type="button"
                  >
                    More
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-64 p-0 relative border-0 shadow-lg no-outline data-[state=open]:animate-none data-[state=closed]:animate-none"
                  onMouseEnter={() => {
                    if (moreHoverTimerRef.current) window.clearTimeout(moreHoverTimerRef.current)
                    setIsMoreOpen(true)
                  }}
                  onMouseLeave={() => {
                    if (moreHoverTimerRef.current) window.clearTimeout(moreHoverTimerRef.current)
                    moreHoverTimerRef.current = window.setTimeout(() => setIsMoreOpen(false), 150)
                  }}
                >
                  <FrostedPanelBackground />
                  <div className="relative z-10 p-3 text-white">
                    <div className="space-y-1">
                      <Link href="/tools/link-converter" className="block px-2 py-2 rounded hover:bg-white/10">Link Converter</Link>
                      <Link href="/tools/qc-checker" className="block px-2 py-2 rounded hover:bg-white/10">QC Checker</Link>
                      <Link href="/tools/shippment-tracking" className="block px-2 py-2 rounded hover:bg-white/10">Shipment Tracker</Link>
                      <Link href="/tools/link-preview" className="block px-2 py-2 rounded hover:bg-white/10">Link Preview</Link>
                      <Link href="/tools/weight-estimator" className="block px-2 py-2 rounded hover:bg-white/10">Weight Estimator</Link>
                      <div className="h-px bg-white/20 my-1" />
                      <Link href="/tutorials" className="block px-2 py-2 rounded hover:bg-white/10">Tutorials</Link>
                    </div>
                  </div>
                </PopoverContent>
              </div>
            </Popover>
          </nav>
        </div>

        {/* CENTER: Search Bar */}
        <div className="flex flex-1 justify-center px-2 md:px-4 max-w-2xl min-w-0">
          <NavbarFindsSearch />
        </div>

        {/* RIGHT SIDE: Register */}
        <div className="hidden md:flex items-center gap-4 justify-end" suppressHydrationWarning>
          <Button asChild className="bg-white-alpha-10 text-white rounded-full hover:bg-white/20 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm relative overflow-hidden group dark:bg-white-alpha-10 dark:text-white dark:hover:bg-white/20 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            <a href={getAgentRegisterUrl()} target="_blank" rel="noopener noreferrer">
              <span className="absolute inset-0 block bg-radial-glow rounded-full z-0 opacity-70" />
              <span className="absolute inset-0 block bg-linear-stroke rounded-full z-0" />
              <span className="absolute inset-px block bg-linear-fill-dark rounded-full z-0" />
              <span className="relative z-10 hidden sm:inline">{getAgentDisplayName()} Register</span>
              <span className="relative z-10 sm:hidden">Register</span>
            </a>
          </Button>
          <Button asChild className="rounded-full px-4 py-2 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/finds">Browse Finds</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2" suppressHydrationWarning>
          {/* Mobile search is inside separate component or handled differently? Keeping simplified for now */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 dark:text-white dark:hover:bg-white/10 w-10 h-10 min-w-10 focus:outline-none focus:ring-0 focus:ring-offset-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop - no blur, just dimming */}
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-40 animate-in fade-in-0 duration-200"
            style={{ top: '60px' }}
            onClick={() => setIsMobileMenuOpen(false)}
            suppressHydrationWarning
          />
          <div
            className="absolute top-full left-0 right-0 md:hidden z-50 animate-in slide-in-from-top-4 fade-in-0 duration-200 bg-black border-b border-white/10"
            suppressHydrationWarning
          >
            <div className="relative z-10 px-3 py-4 space-y-3" suppressHydrationWarning>
              <NavbarFindsSearch
                className="w-full"
                inputClassName="text-white placeholder:text-white/50"
                onSubmitted={() => setIsMobileMenuOpen(false)}
              />
              {/* Navigation Links - Hidden when preferences are open */}
              {navLinks.filter(link => ["Finds", "Sellers"].includes(link.label)).map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block text-base font-medium transition-colors py-2.5 px-3 ${isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={link.prefetch}
                  >
                    {getNavLabel(link.label)}
                  </Link>
                )
              })}
              <div className="pt-1">
                <div className="text-xs uppercase tracking-wide text-white/40 mb-2 px-3">More</div>
                <div className="space-y-1">
                  <Link href="/finds" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Browse Finds</Link>
                  <Link href="/tools/link-converter" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Link Converter</Link>
                  <Link href="/tools/qc-checker" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">QC Checker</Link>
                  <Link href="/tools/shippment-tracking" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Shipment Tracker</Link>
                  <Link href="/tools/link-preview" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Link Preview</Link>
                  <Link href="/tools/weight-estimator" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Weight Estimator</Link>
                  <Link href="/tutorials" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white hover:bg-white/10 py-2 px-3 rounded-lg transition-colors">Tutorials</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}