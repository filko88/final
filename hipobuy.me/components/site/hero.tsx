"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type HeroProps = {
  title: string
  subtitle: string
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative overflow-visible">
      <div className="mx-auto max-w-6xl pb-6 pt-8 sm:pb-8 sm:pt-10 lg:pb-12 lg:pt-14">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="space-y-4 sm:space-y-5">
              {(() => {
                const rawTitle = title
                const [nameLine, restLineRaw] = rawTitle.includes("—")
                  ? rawTitle.split("—").map((s) => s.trim())
                  : [rawTitle, ""]
                const restLine = restLineRaw || ""
                return (
                  <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl space-y-1 sm:space-y-2">
                    <span className="block">{nameLine}</span>
                    {restLine && (
                      <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground/90 leading-tight">
                        {restLine}
                      </span>
                    )}
                  </h1>
                )
              })()}
              <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
              <Button
                asChild
                size="sm"
                className="rounded-full bg-foreground text-background shadow-lg shadow-foreground/10 hover:bg-foreground/90 sm:h-10 sm:px-6"
              >
                <Link href="/finds" className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">Browse Rep Spreadsheet</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full border-foreground/10 bg-background text-foreground shadow-sm hover:bg-muted sm:h-10 sm:px-6"
              >
                <Link href="/tools" className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">Explore tools</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden h-full w-full lg:block" />
        </div>
      </div>
    </section>
  )
}

