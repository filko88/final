"use client"

import * as React from "react"
import { DollarSign, Euro, Banknote, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePreferences, currencyOptions, type Currency } from "@/hooks/use-preferences"

export function CurrencyDropdown() {
  const { selectedCurrency, setSelectedCurrency } = usePreferences()
  const [open, setOpen] = React.useState(false)

  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode.toLowerCase()) {
      case "usd":
      case "cad":
      case "aud":
        return <DollarSign className="h-4 w-4" />
      case "eur":
        return <Euro className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  const getCurrencyDisplayName = (currency: Currency) => {
    const option = currencyOptions.find(c => c.value === currency)
    return option?.label || currency.toUpperCase()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10 justify-between h-10 px-2 w-full border-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
        >
          <span className="text-sm">Currency</span>
          <div className="flex items-center gap-2">
            {getCurrencyIcon(selectedCurrency)}
            <span className="text-sm">{getCurrencyDisplayName(selectedCurrency)}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="right"
        align="start" 
        className="w-40 p-0 relative border-0 shadow-md"
        sideOffset={12}
        alignOffset={0}
        collisionPadding={20}
      >
        {/* Primary frosted glass background - same as navbar */}
        <div className="absolute inset-0 bg-[#040102]/80 backdrop-blur-2xl backdrop-saturate-150 dark:bg-[#040102]/80 bg-white/80 rounded-md" />
        {/* Subtle glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 dark:from-white/10 dark:to-black/10 rounded-md" />
        {/* Border */}
        <div className="absolute inset-0 border border-white/20 dark:border-white/20 rounded-md" />
        <div className="relative z-10 text-white dark:text-white text-zinc-900 p-1">
          {currencyOptions.map((currencyOption) => {
            const isSelected = selectedCurrency === currencyOption.value
            return (
              <Button
                key={currencyOption.value}
                variant="ghost"
                onClick={() => {
                  setSelectedCurrency(currencyOption.value)
                  setOpen(false)
                }}
                className={`w-full justify-start h-8 px-2 text-sm relative z-10 rounded transition-all duration-150 focus:outline-none focus:ring-0 ${
                  isSelected
                    ? "bg-white/15 dark:bg-white/15 bg-zinc-100/50 text-white dark:text-white text-zinc-900"
                    : "hover:bg-white/8 dark:hover:bg-white/8 hover:bg-zinc-50/30 text-white/90 dark:text-white/90 text-zinc-700"
                }`}
              >
                <span className="mr-2">{currencyOption.label}</span>
                <span className="text-xs opacity-70">{currencyOption.symbol}</span>
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
} 