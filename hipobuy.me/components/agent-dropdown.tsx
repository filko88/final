"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePreferences, agentOptions, type Agent } from "@/hooks/use-preferences"

/* eslint-disable @next/next/no-img-element */


export function AgentDropdown() {
  const { selectedAgent, setSelectedAgent } = usePreferences()
  const [open, setOpen] = React.useState(false)

  const orderedAgentOptions = React.useMemo(() => {
    const kakobuy = agentOptions.find(agent => agent.value === "kakobuy")
    const others = agentOptions.filter(agent => agent.value !== "kakobuy")
    return kakobuy ? [kakobuy, ...others] : agentOptions
  }, [])

  const getAgentDisplayName = (agent: Agent) => {
    const option = agentOptions.find(a => a.value === agent)
    return option?.label || agent
  }

  const handleSelect = (agent: Agent) => {
    setSelectedAgent(agent)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10 justify-between h-10 px-2 w-full border-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
        >
          <span className="text-sm">Agent</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">{getAgentDisplayName(selectedAgent)}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="right"
        align="start" 
        className="w-[420px] p-0 relative border-0 shadow-md overflow-visible"
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
        <div className="relative z-10 text-zinc-900 dark:text-white p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500 dark:text-white/50">Agent</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{getAgentDisplayName(selectedAgent)}</p>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-white/50">Pick your shopper</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {orderedAgentOptions.map((agentOption) => {
              const isSelected = selectedAgent === agentOption.value
              return (
                <Button
                  key={agentOption.value}
                  type="button"
                  variant="ghost"
                  onClick={() => handleSelect(agentOption.value)}
                  className={`relative h-28 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-2 px-2 text-xs font-medium focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                    isSelected
                      ? "bg-white text-zinc-900 border-indigo-200 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-200"
                      : "bg-white/70 text-zinc-900 border-white/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-zinc-950 active:bg-indigo-100 active:border-indigo-300 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/40 dark:active:bg-white/15 dark:active:border-white/60"
                  }`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-white/60 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                    <img
                      src={`/images/agents/${agentOption.value}.webp`}
                      alt={`${agentOption.label} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[12px] leading-tight text-center">{agentOption.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 