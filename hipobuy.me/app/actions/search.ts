"use server"
import "server-only"

import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

type SearchParams = {
  q: string
  agent?: string
  currency?: string
  limit?: number
}

type SearchSuggestion = {
  id: number
  name: string
  brand?: string
  price: number
  image: string
  link: string
  marketplace?: string
  source: "finds"
}

type CacheEntry = { timestamp: number; finds: NormalizedFind[] }
const FULL_DATA_CACHE = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30_000

// Normalize function - same as FindsClient
const normalize = (val: string | null | undefined) =>
  (val ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ")

export async function getSearchSuggestions(params: SearchParams): Promise<{ items: SearchSuggestion[] }> {
  const agent = params.agent || "kakobuy"
  const currency = params.currency || "usd"
  const limitParam = typeof params.limit === "number" ? params.limit : 8
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 8

  // Normalize query - same as FindsClient
  const query = normalize(params.q || "")

  if (!query) {
    return { items: [] }
  }

  const cacheKey = `${agent}:${currency}`
  const now = Date.now()
  let finds: NormalizedFind[] = []
  const cached = FULL_DATA_CACHE.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    finds = cached.finds
  } else {
    finds = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])
    FULL_DATA_CACHE.set(cacheKey, { timestamp: now, finds })
  }

  // Filter using exact same logic as FindsClient
  const filtered = finds.filter((p) => 
    normalize(p.name).includes(query) || normalize(p.brand).includes(query)
  )

  // Convert to suggestions and limit
  const items = filtered
    .slice(0, limit)
    .map((p) => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
      link: p.link,
      marketplace: p.marketplace,
      source: "finds" as const,
    }))

  return { items }
}
