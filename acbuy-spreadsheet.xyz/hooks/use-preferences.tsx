"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getFxRates } from "@/app/actions/fx"

const AGENT_VALUES = [
  "oopbuy",
  "kakobuy",
  "acbuy",
  "bbdbuy",
  "allchinabuy",
  "cnfans",
  "cssbuy",
  "eastmallbuy",
  "gonestbuy",
  "hipobuy",
  "hoobuy",
  "itaobuy",
  "loongbuy",
  "lovegobuy",
  "mulebuy",
  "ootdbuy",
  "orientdig",
  "pantherbuy",
  "pingubuy",
  "ponybuy",
  "sugargoo",
  "superbuy",
  "usfans",
] as const

export type Agent = (typeof AGENT_VALUES)[number]
export type Currency = "usd" | "eur" | "cny" | "gbp" | "pln" | "aud" | "cad" | "chf" | "czk"
type Rates = Record<string, number>

interface PreferencesContextType {
  selectedAgent: Agent
  setSelectedAgent: (agent: Agent) => void
  selectedCurrency: Currency
  setSelectedCurrency: (currency: Currency) => void
  convertFromCny: (priceCny: number | null | undefined) => number
  rates: Rates | null
  ratesLoaded: boolean
  isLoaded: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

interface PreferencesProviderProps {
  children: ReactNode
}

const FORCED_AGENT: Agent = "acbuy"

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [selectedAgent, setSelectedAgentState] = useState<Agent>(FORCED_AGENT)
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>("usd")
  const [isLoaded, setIsLoaded] = useState(false)
  const [rates, setRates] = useState<Rates | null>(null)
  const [ratesLoaded, setRatesLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("acbuy-spreadsheet-preferences")
        if (stored) {
          const preferences = JSON.parse(stored)
          if (preferences.selectedCurrency && ["usd", "eur", "cny", "gbp", "pln", "aud", "cad", "chf", "czk"].includes(preferences.selectedCurrency)) {
            setSelectedCurrencyState(preferences.selectedCurrency)
          }
        }
      } catch (error) {
      }
      setSelectedAgentState(FORCED_AGENT)
      setIsLoaded(true)
    }
  }, [])

  // Fetch FX rates (CNY base) once on client
  useEffect(() => {
    let cancelled = false
    const fetchRates = async () => {
      try {
        const result = await getFxRates("CNY")
        if ("error" in result) {
          if (!cancelled) setRatesLoaded(true)
          return
        }
        if (!cancelled) {
          setRates(result.rates || null)
          setRatesLoaded(true)
        }
      } catch {
        if (!cancelled) setRatesLoaded(true)
      }
    }
    fetchRates()
    return () => {
      cancelled = true
    }
  }, [])

  // Save preferences to localStorage when changed
  const setSelectedAgent = (_agent: Agent) => {
    setSelectedAgentState(FORCED_AGENT)
    savePreferences(FORCED_AGENT, selectedCurrency)
  }

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency)
    savePreferences(selectedAgent, currency)
  }

  const convertFromCny = (priceCny: number | null | undefined): number => {
    if (typeof priceCny !== "number" || Number.isNaN(priceCny)) return 0
    if (selectedCurrency === "cny") return Math.round(priceCny * 100) / 100
    const rate = rates?.[selectedCurrency.toUpperCase()] ?? rates?.[selectedCurrency]
    if (typeof rate !== "number" || Number.isNaN(rate)) return Math.round(priceCny * 100) / 100
    return Math.round(priceCny * rate * 100) / 100
  }

  const savePreferences = (agent: Agent, currency: Currency) => {
    if (typeof window !== "undefined") {
      try {
        const preferences = { selectedAgent: agent, selectedCurrency: currency }
        localStorage.setItem("acbuy-spreadsheet-preferences", JSON.stringify(preferences))
      } catch (error) {
      }
    }
  }

  const value = {
    selectedAgent,
    setSelectedAgent,
    selectedCurrency,
    setSelectedCurrency,
    convertFromCny,
    rates,
    ratesLoaded,
    isLoaded,
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        selectedAgent: FORCED_AGENT,
        setSelectedAgent: () => {},
        selectedCurrency: "usd" as Currency,
        setSelectedCurrency: () => {},
        convertFromCny: (priceCny: number | null | undefined) =>
          typeof priceCny === "number" && !Number.isNaN(priceCny) ? priceCny : 0,
        rates: null,
        ratesLoaded: false,
        isLoaded: false,
      }
    }
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}

const formatLabel = (val: Agent) => {
  if (val === "usfans") return "USFans"
  if (val === "bbdbuy") return "BBDbuy"
  if (val === "ootdbuy") return "OOTDbuy"
  return val
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export const agentOptions = AGENT_VALUES.map((value) => ({
  value,
  label: formatLabel(value),
})) satisfies { value: Agent; label: string }[]

export const currencyOptions = [
  { value: "eur" as Currency, label: "EUR", symbol: "€" },
  { value: "usd" as Currency, label: "USD", symbol: "$" },
  { value: "pln" as Currency, label: "PLN", symbol: "zł" },
  { value: "cny" as Currency, label: "CNY", symbol: "¥" },
  { value: "gbp" as Currency, label: "GBP", symbol: "£" },
  { value: "aud" as Currency, label: "AUD", symbol: "A$" },
  { value: "cad" as Currency, label: "CAD", symbol: "C$" },
  { value: "chf" as Currency, label: "CHF", symbol: "CHF" },
  { value: "czk" as Currency, label: "CZK", symbol: "Kč" },
] 