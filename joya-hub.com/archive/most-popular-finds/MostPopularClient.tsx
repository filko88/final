"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePreferences, agentOptions, type Agent, type Currency } from "@/hooks/use-preferences"
import { TrendingUp, HelpCircle, Search as SearchIcon, ShoppingBag } from "lucide-react"
import FindsCard from "@/components/FindsCard"
import { getMostPopularItems } from "@/app/actions/most-popular"

interface Product {
  _id: number
  name: string
  price: number
  image: string
  link: string
  "category[0]": string | null
  "category[1]": string | null
  "category[2]": string | null
  brand: string
  view_count: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export default function MostPopularClient() {
  const { selectedAgent, selectedCurrency, isLoaded, convertFromCny } = usePreferences()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [displayCount, setDisplayCount] = useState(50)
  const [hasMore, setHasMore] = useState(true)

  const fetchPopular = useCallback(async (agent: Agent, currency: Currency) => {
    const result = await getMostPopularItems(200, agent, currency)
    return Array.isArray(result.items) ? (result.items as Product[]) : []
  }, [])
  
  // Load initial and on pref changes
  useEffect(() => {
    if (!isLoaded || !selectedAgent) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const items = await fetchPopular(selectedAgent, selectedCurrency)
        if (cancelled) return
        const sorted = [...items].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        // Deduplicate by _id to avoid duplicate keys and rendering
        const deduped = Array.from(new Map(sorted.map(p => [p._id, p])).values())
        setProducts(deduped)
        setDisplayCount(50)
        setHasMore(deduped.length > 50)
      } catch (e) {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isLoaded, selectedAgent, selectedCurrency, fetchPopular])

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || !isLoaded) return
    setIsLoadingMore(true)
    const next = Math.min(displayCount + 50, products.length)
    setDisplayCount(next)
    setHasMore(next < products.length)
    setIsLoadingMore(false)
  }, [isLoadingMore, hasMore, isLoaded, displayCount, products.length])

  // Infinite scroll with preload
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)
      if (distanceFromBottom <= 2000 && hasMore && !isLoadingMore) {
        loadMore()
      }
    }
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { handleScroll(); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasMore, isLoadingMore, loadMore])

  return (
    <div className="min-h-screen bg-[#040102] text-white">
        <div className="bg-[#040102]/95 border-b border-white/10 sticky top-[60px] z-40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[#ff9797]" />
                <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Most Popular</h1>
              <p className="text-zinc-400 text-sm">Top viewed products. Scroll to load more.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-[60px]">
        {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="relative"><div className="aspect-[14/16] bg-white/10 rounded-lg animate-pulse" /></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {products.slice(0, displayCount).map((p, idx) => (
              <FindsCard key={`${p._id}-${p.brand}-${p.name}-${idx}`} product={p} currency={selectedCurrency} selectedAgent={selectedAgent} convertFromCny={convertFromCny} />
              ))}
            </div>
          )}

        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Footer banner CTA with cyan glow - bigger with icons */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-12 w-[380px] sm:w-[520px] md:w-[700px] h-[220px] bg-[rgba(18,255,215,0.28)] blur-[90px] rounded-full" />
          <div className="flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-8 relative z-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-white text-lg sm:text-xl font-semibold">Not enough results?</div>
              <div className="text-zinc-400 text-sm sm:text-base">Explore the full catalogs to find even more.</div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/finds" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-base font-semibold hover:bg-zinc-100">
                <SearchIcon className="w-5 h-5" />
                <span>Go to Finds</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


