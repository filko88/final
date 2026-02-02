"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  product: Product
  showBadge?: boolean
}

export function ProductCard({ product, showBadge = true }: Props) {
  const hasPrice = typeof product.price === "number" && !Number.isNaN(product.price)

  return (
    <motion.div
      className="group relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/70 via-white/40 to-white/10 p-3 shadow-md backdrop-blur-xl transition-all hover:shadow-lg dark:from-white/10 dark:via-white/5 dark:to-white/0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(110,86,207,0.18),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(110,86,207,0.2),transparent_38%)] opacity-70" />
        <div className="relative space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-foreground/5 text-xs text-muted-foreground">
              Image coming soon
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-2 sm:p-3">
            {showBadge && product.badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
                {product.badge}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-foreground/80 border border-foreground/10">
              {product.marketplace || "Marketplace"}
            </span>
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-base font-semibold text-foreground">{product.name}</p>
            <span className="text-sm font-semibold text-foreground/80 whitespace-nowrap">
              {hasPrice ? `$${(product.price ?? 0).toFixed(2)}` : "—"}
            </span>
          </div>

          {product.link && (
            <Link
              href={product.link}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-white/90"
              )}
            >
              View listing
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

