import { ArrowUpRight, Camera, Layers, Link2, Sparkles } from "lucide-react"
import Link from "next/link"
import { SectionHeader } from "@/components/site/section-header"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Link utilities",
    description: "Best universal agent link converter for Kakobuy, Cnfans, Acbuy, Oopbuy and other agents.",
    href: "/links",
    icon: Link2,
  },
  {
    title: "QC checker",
    description: "Check qc photos of any rep find.",
    href: "/tools/qc-checker",
    icon: Camera,
  },
  {
    title: "Guides & tutorials",
    description: "Tutorial on how to buy on Kakobuy, Cnfans, Acbuy, Oopbuy and other agents.",
    href: "/tutorials",
    icon: Sparkles,
  },
]

export function FeatureGrid() {
  return (
    <section className="space-y-6 sm:space-y-8">
      <SectionHeader
        eyebrow="Tools"
        title="Apple-smooth utilities, built-in"
        description="A modular toolkit that stays out of the way until you need it."
      />
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className={cn(
                "group relative overflow-x-clip rounded-2xl border border-foreground/5 bg-gradient-to-b from-white/60 via-white/40 to-white/20 p-4 shadow transition-all hover:-translate-y-1 hover:border-foreground/15 hover:shadow-md dark:from-white/10 dark:via-white/5 dark:to-white/0"
              )}
            >
              <div className="absolute inset-0 overflow-visible bg-[radial-gradient(circle_at_20%_20%,rgba(110,86,207,0.25),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(110,86,207,0.12),transparent_40%)] opacity-70" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

