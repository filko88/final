"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePreferences, agentOptions, currencyOptions, type Agent, type Currency } from "@/hooks/use-preferences"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function WelcomeModal() {
  const { selectedAgent, setSelectedAgent, selectedCurrency, setSelectedCurrency, isLoaded } = usePreferences()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgentLocal, setSelectedAgentLocal] = useState<Agent>("oopbuy")
  const [selectedCurrencyLocal, setSelectedCurrencyLocal] = useState<Currency>(() => selectedCurrency as Currency)
  const [step, setStep] = useState<"agent" | "currency" | "support">("agent")
  const [agentPage, setAgentPage] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only check after preferences are loaded
    if (!isLoaded) return
    // Do not show on /links routes
    if (pathname && pathname.startsWith("/links")) return

    // Check if this is the first visit with a small delay for better UX
    const hasVisited = localStorage.getItem("Rep-Finds-has-visited")
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500) // 500ms delay

      return () => clearTimeout(timer)
    }
  }, [isLoaded, pathname])

  useEffect(() => {
    setSelectedAgentLocal(selectedAgent as Agent)
    setSelectedCurrencyLocal(selectedCurrency as Currency)
  }, [selectedAgent, selectedCurrency])

  const handleSavePreferences = () => {
    setSelectedAgent(selectedAgentLocal)
    setSelectedCurrency(selectedCurrencyLocal)
  }

  const handlePrimaryAction = () => {
    if (step === "agent") {
      setStep("currency")
      return
    }
    if (step === "currency") {
      handleSavePreferences()
      setStep("support")
      return
    }
    closeAndMarkVisited()
  }

  const closeAndMarkVisited = () => {
    localStorage.setItem("Rep-Finds-has-visited", "true")
    setIsOpen(false)
  }

  const canProceed = step === "agent"
    ? Boolean(selectedAgentLocal)
    : step === "currency"
      ? Boolean(selectedCurrencyLocal)
      : true

  const otherAgents = agentOptions.filter((agent) => agent.value !== "oopbuy")
  const agentsPerPage = 4
  const totalAgentPages = Math.max(1, Math.ceil(otherAgents.length / agentsPerPage))
  const currentAgents = otherAgents.slice(agentPage * agentsPerPage, (agentPage + 1) * agentsPerPage)
  const preferredAgentLabel = agentOptions.find((agent) => agent.value === selectedAgentLocal)?.label || "Preferred agent"

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

  const preferredRegisterLink = registerLinks[String(selectedAgentLocal)]

  // Dev function to reset welcome modal (accessible from console)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis & { resetWelcomeModal?: () => void }).resetWelcomeModal = () => {
        localStorage.removeItem("Rep-Finds-has-visited")
      }
      ;(window as Window & typeof globalThis & { openWelcomeModal?: () => void }).openWelcomeModal = () => {
        setStep("agent")
        setIsOpen(true)
      }
    }
  }, [])

  if (!isClient) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="max-w-[90vw] sm:max-w-xl w-full text-black border-0 p-0 overflow-hidden rounded-3xl [&>button]:hidden max-h-[95vh] sm:max-h-[85vh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 bg-white rounded-3xl" />
        <div
          className="relative rounded-3xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col max-h-[95vh] sm:max-h-[85vh]"
        >
          <div className="p-3 sm:p-6 overflow-y-auto overscroll-contain space-y-3 sm:space-y-6 flex-1">
            <DialogHeader className="text-center space-y-2">
              {step === "support" ? (
                <>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-black">
                    One last step
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                    Can you please support us?
                  </DialogDescription>
                </>
              ) : (
                <>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-black">
                    Quick setup
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                    Choose your agent and currency to personalize pricing and links.
                  </DialogDescription>
                  <div className="text-[11px] text-zinc-500">
                    By using Rep-Finds, you agree to our{" "}
                    <Link href="/legal" className="text-black underline hover:no-underline font-medium">
                      legal terms
                    </Link>
                    .
                  </div>
                </>
              )}
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              {step === "agent" ? (
                <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-black">Choose your agent</h3>
                    <span className="text-xs text-zinc-500">Recommended: Oopbuy</span>
                  </div>

                  <Button
                    variant="outline"
                    onPointerDown={() => setSelectedAgentLocal("oopbuy")}
                    onClick={() => setSelectedAgentLocal("oopbuy")}
                    className={`group relative w-full rounded-xl border px-3 sm:px-4 py-2.5 text-left transition-all ring-1 ring-transparent border-pink-400/80 bg-gradient-to-r from-pink-100 via-pink-200 to-pink-100 shadow-[0_0_0_1px_rgba(236,72,153,0.25),0_8px_20px_-12px_rgba(236,72,153,0.6)] ${selectedAgentLocal === "oopbuy"
                      ? "ring-0 from-pink-200 via-pink-300 to-pink-200 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5)]"
                      : "hover:from-pink-200 hover:via-pink-300 hover:to-pink-200"
                      }`}
                  >
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-semibold text-black">Oopbuy</span>
                      <span className="rounded-full border border-pink-300/70 bg-pink-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                        Best option
                      </span>
                    </div>
                  </Button>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {currentAgents.map((agent) => {
                        const isSelected = selectedAgentLocal === agent.value
                        return (
                          <Button
                            key={agent.value}
                            variant="outline"
                            onPointerDown={() => setSelectedAgentLocal(agent.value as Agent)}
                            onClick={() => setSelectedAgentLocal(agent.value as Agent)}
                            className={`group h-11 sm:h-12 rounded-lg border px-3 text-left transition-all ring-1 ring-transparent ${isSelected
                              ? "border-black bg-zinc-300 text-black ring-0 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5)]"
                              : "border-zinc-200 bg-zinc-50 text-black hover:border-zinc-300 hover:bg-zinc-100"
                              }`}
                          >
                            <div className="relative z-10 flex items-center justify-between gap-2 text-sm font-medium">
                              <span className="truncate text-black">{agent.label}</span>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                    {totalAgentPages > 1 && (
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAgentPage((p) => Math.max(0, p - 1))}
                          disabled={agentPage === 0}
                          className="h-8 px-2 text-xs text-zinc-600"
                        >
                          Previous
                        </Button>
                        <span>
                          {agentPage + 1} / {totalAgentPages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAgentPage((p) => Math.min(totalAgentPages - 1, p + 1))}
                          disabled={agentPage >= totalAgentPages - 1}
                          className="h-8 px-2 text-xs text-zinc-600"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : step === "currency" ? (
                <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-black">Choose Your Currency</h3>
                    <span className="text-xs text-zinc-500">Used across pricing</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currencyOptions.map((currency) => {
                      const isSelected = selectedCurrencyLocal === currency.value
                      return (
                        <Button
                          key={currency.value}
                          variant="outline"
                          onClick={() => setSelectedCurrencyLocal(currency.value as Currency)}
                          className={`group h-11 sm:h-12 rounded-lg border px-2 text-left transition-all ring-1 ring-transparent ${isSelected
                            ? "border-black bg-black/5 ring-0"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                            }`}
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-medium">
                            <span className="font-semibold text-black">{currency.symbol}</span>
                            <span className="text-xs sm:text-sm truncate text-zinc-600">{currency.label}</span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-zinc-50/70 p-5 text-center shadow-[inset_0_0_0_1px_rgba(24,24,27,0.08)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        asChild
                        size="lg"
                        className="w-full rounded-full bg-green-600 text-white hover:bg-green-700 font-bold"
                        disabled={!preferredRegisterLink}
                      >
                        <a
                          href={preferredRegisterLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex flex-col items-center leading-tight">
                            <span>Register on {preferredAgentLabel}</span>
                            <span className="text-[10px] font-semibold text-white/90">
                              Get exclusive coupons
                            </span>
                          </span>
                        </a>
                      </Button>
                    </div>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={closeAndMarkVisited}
                      className="w-full rounded-full border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    >
                      Skip and don&apos;t support 💔
                    </Button>
                  </div>
                </div>
              )}

              {step !== "support" && (
                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={handlePrimaryAction}
                    disabled={!canProceed}
                    size="lg"
                    className="w-full rounded-md bg-black text-white hover:bg-black/90 font-bold focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    {step === "agent"
                      ? (canProceed ? "Next" : "Please select an agent")
                      : (canProceed ? "Next" : "Please select a currency")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}