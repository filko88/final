"use client"

import Link from "next/link"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import FindsCard from "@/components/FindsCard"
import { type Currency, type Agent } from "@/hooks/use-preferences"

interface Product {
  _id: string | number
  name: string
  price: number
  image: string
  link: string
  marketplace: string
  type?: "finds"
  "category[0]"?: string | null
  "category[1]"?: string | null
  "category[2]"?: string | null
  brand?: string
  batch?: string
  view_count?: number
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface ProductCarouselProps {
  title: string
  products: Product[]
  currency: Currency
  selectedAgent: Agent
  convertFromCny: (priceCny: number | null | undefined) => number
  viewAllHref?: string
  viewAllLabel?: string
}

export default function ProductCarousel({
  title,
  products,
  currency,
  selectedAgent,
  convertFromCny,
  viewAllHref,
  viewAllLabel = "View all",
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    updateScrollButtons()
  }, [products, updateScrollButtons])

  const scroll = useCallback((direction: "left" | "right") => {
    if (!containerRef.current) return
    const scrollAmount = containerRef.current.clientWidth || 300
    const newPosition = direction === "left"
      ? containerRef.current.scrollLeft - scrollAmount
      : containerRef.current.scrollLeft + scrollAmount

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth"
    })
  }, [])

  if (products.length === 0) return null

  return (
    <div className="w-full py-2 sm:py-3 md:py-4 min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white dark:text-white text-zinc-900">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground transition"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-all backdrop-blur-md shadow-lg border border-white/20 enabled:hover:bg-black/85 disabled:opacity-0 disabled:pointer-events-none dark:bg-black/70 dark:text-white dark:border-white/20"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Products Container */}
        <div
          ref={containerRef}
          onScroll={updateScrollButtons}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory py-2 -my-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, index) => {
            const productWithDefaults = {
              ...product,
              type: product.type || "finds",
              "category[0]": product["category[0]"] || null,
              "category[1]": product["category[1]"] || null,
              "category[2]": product["category[2]"] || null,
              brand: product.brand || "",
              batch: product.batch || "",
              view_count: product.view_count || 0,
              created_by: product.created_by || null,
              created_at: product.created_at || null,
              updated_at: product.updated_at || null,
            }

            return (
              <div
                key={`${product.type || "item"}-${product._id}-${index}`}
                className="flex-shrink-0 snap-start w-[42%] xs:w-[38%] sm:w-[32%] md:w-[28%] lg:w-[23%] xl:w-[19%] 2xl:w-[16%] min-w-[140px] max-w-[220px]"
              >
                <FindsCard product={productWithDefaults as any} currency={currency} selectedAgent={selectedAgent} convertFromCny={convertFromCny} />
              </div>
            )
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-all backdrop-blur-md shadow-lg border border-white/20 enabled:hover:bg-black/85 disabled:opacity-0 disabled:pointer-events-none dark:bg-black/70 dark:text-white dark:border-white/20"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

