import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  return (
    <section className="relative w-full overflow-x-clip rounded-2xl sm:rounded-3xl border border-foreground/10 bg-gradient-to-r from-[rgba(158,240,26,0.18)] via-[rgba(36,41,54,0.85)] to-[rgba(15,17,24,0.95)] px-4 py-6 sm:px-6 sm:py-10 shadow-2xl shadow-foreground/20">
      <div className="absolute inset-0 overflow-visible bg-[radial-gradient(circle_at_18%_20%,rgba(158,240,26,0.22),transparent_45%),radial-gradient(circle_at_82%_0%,rgba(158,240,26,0.14),transparent_42%)]" />
      <div className="relative flex flex-col gap-4 sm:gap-6 text-left sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5 sm:space-y-2 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Ready</p>
          <h3 className="text-xl sm:text-2xl font-semibold leading-tight sm:text-3xl">
            Rep-Finds latest rep finds
          </h3>
          <p className="text-sm text-white/70">
            Browse our handpicked rep finds always updated to lastest rep fashion.
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-[rgba(158,240,26,0.95)] text-[#0c0f1a] hover:bg-[rgba(158,240,26,0.9)] sm:h-10"
          >
            <Link href="/finds" className="flex items-center gap-2">
              <span className="text-sm">Browse Rep Spreadsheet</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 sm:h-10"
          >
            <Link href="/tools" className="text-sm">Explore tools</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

