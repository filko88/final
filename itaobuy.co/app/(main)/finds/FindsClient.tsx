"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import FindsCard from "@/components/FindsCard"
import { productMatchesCategory } from "@/lib/finds-categories"
import type { NormalizedFind, Category } from "@/lib/finds-source"
import { usePreferences, type Agent, type Currency } from "@/hooks/use-preferences"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, X } from "lucide-react"

interface FindsClientProps {
  initialProducts: NormalizedFind[]
  categories: Category[]
}

const normalize = (val: string | null | undefined) =>
  (val ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ")

export default function FindsClient({ initialProducts, categories }: FindsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBatchSize = 20
  const [showCount, setShowCount] = useState(initialBatchSize)
  const [category, setCategory] = useState(() => {
    const param = searchParams.get("category")
    return param ? normalize(param) : "all"
  })
  const [brandFilter, setBrandFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"popular-desc" | "popular-asc" | "newest" | "oldest" | "price-asc" | "price-desc">("popular-desc")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const categoryScrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [brandQuery, setBrandQuery] = useState("")
  const { selectedCurrency, selectedAgent, convertFromCny } = usePreferences()

  const queryParam = searchParams.get("q") ?? ""
  const query = normalize(queryParam)

  // --- Category Logic ---

  // 1. Identify all products matching search (if any)
  const searchFiltered = useMemo(() => {
    return query
      ? initialProducts.filter((p) => normalize(p.name).includes(query) || normalize(p.brand).includes(query))
      : initialProducts
  }, [initialProducts, query])

  // 2. Identify the "Current Main Category" based on selection
  const activeMainCategoryData = useMemo(() => {
    if (category === "all") return null

    // Check if current selection matches a main category name
    const mainMatch = categories.find(c => !c.parent_id && normalize(c.name) === normalize(category))
    if (mainMatch) return mainMatch

    // Check if current selection matches a sub-category name
    const subMatch = categories.find(c => c.parent_id && normalize(c.name) === normalize(category))
    if (subMatch) {
      // Find its parent
      return categories.find(c => c.id === subMatch.parent_id) || null
    }

    return null
  }, [category, categories])

  const activeMainCategory = activeMainCategoryData?.name || null

  // 3. Current Filtered List (Items to show in grid)
  const filtered = useMemo(() => {
    if (category === "all") return searchFiltered
    return searchFiltered.filter((p) => productMatchesCategory(p, category))
  }, [category, searchFiltered])

  const brandOptions = useMemo(() => {
    const set = new Set<string>()
    filtered.forEach((p) => {
      const brand = (p.brand ?? "").toString().trim()
      if (brand) set.add(brand)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [filtered])

  const priceBounds = useMemo(() => {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    filtered.forEach((p) => {
      if (p.price == null) return
      const value = convertFromCny(p.price)
      if (Number.isNaN(value)) return
      min = Math.min(min, value)
      max = Math.max(max, value)
    })
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0 }
    }
    return { min: Math.floor(min), max: Math.ceil(max) }
  }, [filtered, convertFromCny])

  const isPriceDisabled = useMemo(
    () => priceBounds.max <= priceBounds.min,
    [priceBounds.max, priceBounds.min]
  )

  useEffect(() => {
    setBrandFilter("all")
  }, [category, query])

  useEffect(() => {
    if (priceBounds.max === 0 && priceBounds.min === 0) {
      setPriceRange([0, 0])
      return
    }
    setPriceRange([priceBounds.min, priceBounds.max])
  }, [priceBounds.min, priceBounds.max])

  useEffect(() => {
    setShowCount(initialBatchSize)
  }, [category, query, brandFilter, sortBy, priceRange])

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: selectedCurrency,
        maximumFractionDigits: 0,
      })
    } catch {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    }
  }, [selectedCurrency])

  const sortOptions = [
    { value: "popular-desc", label: "Most popular" },
    { value: "popular-asc", label: "Least popular" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
  ] as const

  const filteredBrandOptions = useMemo(() => {
    const queryText = brandQuery.trim().toLowerCase()
    if (!queryText) return brandOptions
    return brandOptions.filter((brand) => brand.toLowerCase().includes(queryText))
  }, [brandOptions, brandQuery])

  const resetFilters = () => {
    setBrandFilter("all")
    setSortBy("popular-desc")
    setPriceRange([priceBounds.min, priceBounds.max])
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    const queryString = params.toString()
    router.replace(queryString ? `/finds?${queryString}` : "/finds")
  }


  const filteredWithFilters = useMemo(() => {
    const [minPrice, maxPrice] = priceRange
    const normalizedBrand = normalize(brandFilter)

    return filtered.filter((p) => {
      const brandMatches = normalizedBrand === "all"
        ? true
        : normalize(p.brand) === normalizedBrand
      if (!brandMatches) return false

      if (p.price == null) return false
      const value = convertFromCny(p.price)
      if (Number.isNaN(value)) return false
      return value >= minPrice && value <= maxPrice
    })
  }, [filtered, brandFilter, priceRange, convertFromCny])

  const sortedFiltered = useMemo(() => {
    const getIdNumber = (value: string | number | null | undefined) => {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        const parsed = Number(value)
        return Number.isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    const getViews = (item: NormalizedFind) => {
      if (typeof item.view_count === "number") return item.view_count
      return 0
    }

    return [...filteredWithFilters].sort((a, b) => {
      if (sortBy === "popular-desc") return getViews(b) - getViews(a)
      if (sortBy === "popular-asc") return getViews(a) - getViews(b)
      if (sortBy === "newest") return getIdNumber(b._id) - getIdNumber(a._id)
      if (sortBy === "oldest") return getIdNumber(a._id) - getIdNumber(b._id)
      if (sortBy === "price-asc") return convertFromCny(a.price) - convertFromCny(b.price)
      return convertFromCny(b.price) - convertFromCny(a.price)
    })
  }, [filteredWithFilters, sortBy, convertFromCny])


  // 4. Compute Facets to Display
  const facetsToDisplay = useMemo(() => {
    if (!activeMainCategoryData) {
      // ROOT LEVEL: Show all Main Categories from the DATABASE
      const mainCats = categories.filter(c => !c.parent_id)

      const counts = new Map<string, number>()
      searchFiltered.forEach(p => {
        const c = p["category[0]"]
        if (c) {
          const n = normalize(c)
          counts.set(n, (counts.get(n) || 0) + 1)
        }
      })

      const items = mainCats.map(c => ({
        key: normalize(c.name),
        label: c.name,
        count: counts.get(normalize(c.name)) || 0
      }))

      return { level: 'root', items }
    } else {
      // CHILD LEVEL: Show Subcategories of the Active Main Category from DATABASE
      const subCats = categories.filter(c => c.parent_id === activeMainCategoryData.id)

      const counts = new Map<string, number>()
      const productsInMain = searchFiltered.filter(p => normalize(p["category[0]"]) === normalize(activeMainCategory))

      productsInMain.forEach(p => {
        const c = p["category[1]"]
        if (c) {
          const n = normalize(c)
          counts.set(n, (counts.get(n) || 0) + 1)
        }
      })

      const items = subCats.map(c => ({
        key: normalize(c.name),
        label: c.name,
        count: counts.get(normalize(c.name)) || 0
      }))

      return { level: 'child', items }
    }
  }, [activeMainCategoryData, activeMainCategory, categories, searchFiltered])


  // --- Render Logic ---

  const visible = sortedFiltered.slice(0, showCount)
  const hasMore = sortedFiltered.length > visible.length

  // Split visible items into Best Sellers and Regular
  const boostedItems = visible.filter(p => (p.boost_order || 0) > 0)
  const regularItems = visible.filter(p => !p.boost_order || p.boost_order === 0)

  useEffect(() => {
    if (!hasMore) return
    const node = loadMoreRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShowCount((c) => c + initialBatchSize)
          }
        }
      },
      { rootMargin: "200px", threshold: 0.2 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, initialBatchSize])

  useEffect(() => {
    const container = categoryScrollRef.current
    if (!container) return
    const active = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (!active) return
    const containerRect = container.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const offsetLeft = activeRect.left - containerRect.left
    const targetScroll =
      container.scrollLeft + offsetLeft - (containerRect.width / 2 - activeRect.width / 2)
    container.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: "smooth",
    })
  }, [category, facetsToDisplay.level, facetsToDisplay.items, activeMainCategory])

  const updateScrollButtons = () => {
    const container = categoryScrollRef.current
    if (!container) return
    const { scrollLeft, scrollWidth, clientWidth } = container
    const maxScrollLeft = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScrollLeft - 4)
  }

  useEffect(() => {
    updateScrollButtons()
    if (typeof window === "undefined") return
    const handleResize = () => updateScrollButtons()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [facetsToDisplay.items])

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {query && (
          <p className="text-sm text-muted-foreground">
            '
          </p>
        )}
      </div>

      <div className={query ? "" : "pt-4"}>
        <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 p-2 backdrop-blur-lg shadow-[0_18px_36px_-26px_rgba(15,23,42,0.7)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-foreground/10 to-transparent" />
          <div
            ref={categoryScrollRef}
            className="category-pill-scroll scrollbar-hide flex flex-1 min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-6"
            onScroll={updateScrollButtons}
          >
            {/* Always show "All" */}
            <Button
              size="sm"
              variant="outline"
              data-active={category === "all"}
              className={category === "all"
                ? "shrink-0 rounded-full px-3 py-1 text-xs text-foreground backdrop-blur-md border border-foreground/10 bg-background/60 shadow-sm hover:bg-background/70 hover:text-foreground"
                : "shrink-0 rounded-full px-3 py-1 text-xs text-foreground/80 border border-foreground/10 bg-background/40 backdrop-blur-md hover:bg-foreground/5 hover:border-foreground/15 hover:text-foreground"}
              onClick={() => {
                setCategory("all")
                setShowCount(initialBatchSize)
              }}
            >
              All
              {category === "all" && <span className="ml-1 text-[11px] opacity-80">{initialProducts.length}</span>}
            </Button>

            {facetsToDisplay.level === 'child' && activeMainCategory && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  data-active={normalize(category) === normalize(activeMainCategory)}
                  className={normalize(category) === normalize(activeMainCategory)
                    ? "shrink-0 rounded-full px-3 py-1 text-xs text-foreground backdrop-blur-md border border-foreground/10 bg-background/60 shadow-sm hover:bg-background/70 hover:text-foreground"
                    : "shrink-0 rounded-full px-3 py-1 text-xs text-foreground/80 border border-foreground/10 bg-background/40 backdrop-blur-md hover:bg-foreground/5 hover:border-foreground/15 hover:text-foreground"}
                  onClick={() => {
                    setCategory(normalize(activeMainCategory))
                    setShowCount(initialBatchSize)
                  }}
                >
                  {activeMainCategory}
                </Button>
                <div className="h-4 w-[1px] shrink-0 bg-foreground/20 mx-1" />
              </>
            )}

            {facetsToDisplay.items.map((cat) => (
              <Button
                key={cat.key}
                size="sm"
                variant="outline"
                data-active={normalize(category) === cat.key}
                className={normalize(category) === cat.key
                  ? "shrink-0 rounded-full px-3 py-1 text-xs text-foreground backdrop-blur-md border border-foreground/10 bg-background/60 shadow-sm hover:bg-background/70 hover:text-foreground"
                  : "shrink-0 rounded-full px-3 py-1 text-xs text-foreground/80 border border-foreground/10 bg-background/40 backdrop-blur-md hover:bg-foreground/5 hover:border-foreground/15 hover:text-foreground"}
                onClick={() => {
                  setCategory(cat.key)
                  setShowCount(initialBatchSize)
                }}
              >
                {cat.label}
                <span className={normalize(category) === cat.key ? "ml-1 text-[11px] opacity-80" : "ml-1 text-[11px] text-muted-foreground"}>{cat.count}</span>
              </Button>
            ))}
          </div>

          <button
            type="button"
            className={`absolute left-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-foreground/80 transition-all backdrop-blur-md shadow-sm border border-white/20 ring-1 ring-white/10 hover:bg-black/25 hover:text-foreground ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll categories left"
            onClick={() => {
              const container = categoryScrollRef.current
              if (!container) return
              container.scrollBy({ left: -180, behavior: "smooth" })
            }}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            className={`absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-foreground/80 transition-all backdrop-blur-md shadow-sm border border-white/20 ring-1 ring-white/10 hover:bg-black/25 hover:text-foreground ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll categories right"
            onClick={() => {
              const container = categoryScrollRef.current
              if (!container) return
              container.scrollBy({ left: 180, behavior: "smooth" })
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        {queryParam.trim().length > 0 ? (
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="truncate max-w-[200px] sm:max-w-[320px]">Search: {queryParam.trim()}</span>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete("q")
                const queryString = params.toString()
                router.replace(queryString ? `/finds?${queryString}` : "/finds")
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/80 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div />
        )}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto px-0 py-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Filter & sort
            </Button>
          </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] max-w-sm sm:max-w-md overflow-y-auto pt-4">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="pt-4 pb-4 space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sort</p>
                <div className="flex flex-col gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-foreground/10" />

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Brand</p>
                <div className="relative space-y-2">
                  <Input
                    value={brandQuery}
                    onChange={(event) => setBrandQuery(event.target.value)}
                    placeholder="Search brands"
                    className="h-9 rounded-full bg-background/60 border-foreground/10 text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="brand-scroll max-h-48 overflow-y-scroll pr-1 space-y-2">
                    <Button
                      variant={brandFilter === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setBrandFilter("all")}
                    >
                      All brands
                    </Button>
                    {filteredBrandOptions.map((brand) => (
                      <Button
                        key={brand}
                        variant={brandFilter === brand ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setBrandFilter(brand)}
                      >
                        {brand}
                      </Button>
                    ))}
                    {filteredBrandOptions.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No brands found.</div>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent" />
                </div>
              </div>

              <Separator className="bg-foreground/10" />

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                <div className="px-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{priceFormatter.format(priceRange[0])}</span>
                    <span>{priceFormatter.format(priceRange[1])}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    disabled={isPriceDisabled}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  />
                </div>
              </div>

              <Separator className="bg-foreground/10" />

              <Button
                variant="secondary"
                className="w-full justify-center text-[11px] uppercase tracking-[0.2em]"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Best Sellers Section */}
      {boostedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Best Sellers</h2>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {boostedItems.map((product) => (
              <FindsCard
                key={product._id}
                product={product}
                currency={selectedCurrency as Currency}
                selectedAgent={selectedAgent as Agent}
                convertFromCny={convertFromCny}
              />
            ))}
          </div>
          {regularItems.length > 0 && <Separator className="my-6 bg-foreground/10" />}
        </div>
      )}

      {/* Regular Products Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {regularItems.map((product) => (
          <FindsCard
            key={product._id}
            product={product}
            currency={selectedCurrency as Currency}
            selectedAgent={selectedAgent as Agent}
            convertFromCny={convertFromCny}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <div ref={loadMoreRef} className="mt-4 h-8 w-full max-w-xs rounded-full bg-foreground/5" />
        </div>
      )}

      {sortedFiltered.length === 0 && (
        <div className="mt-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground">No products found</h3>
          <p className="text-sm text-muted-foreground">Try a different search.</p>
        </div>
      )}
    </div>
  )
}
