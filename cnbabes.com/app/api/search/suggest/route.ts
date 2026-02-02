import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple in-memory cache for full datasets by agent+currency to avoid refetching on each keystroke
// Note: This cache is per runtime instance and ephemeral. TTL keeps it reasonably fresh.
type CacheEntry = { timestamp: number; finds: NormalizedFind[] }
const FULL_DATA_CACHE = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30_000

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get("q") || "").trim().toLowerCase()
    const agent = url.searchParams.get("agent") || "kakobuy"
    const currency = url.searchParams.get("currency") || "usd"
    const limitParam = parseInt(url.searchParams.get("limit") || "8", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(20, limitParam)) : 8

    if (!q) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const cacheKey = `${agent}:${currency}`
    const now = Date.now()
    let finds: NormalizedFind[] = []

    const cached = FULL_DATA_CACHE.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      finds = cached.finds
    } else {
      finds = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

      FULL_DATA_CACHE.set(cacheKey, {
        timestamp: now,
        finds,
      })
    }

    const tokens = q.split(/\s+/).filter(Boolean)

    const scoreOf = (p: NormalizedFind) => {
      const name = (p.name || "").toLowerCase()
      const brand = (p.brand || "").toLowerCase()
      let score = 0
      if (!q) return score
      if (name === q) score += 180
      if (brand === q) score += 160
      if (name.startsWith(q)) score += 130
      if (brand.startsWith(q)) score += 120
      const idx = name.indexOf(q)
      if (idx >= 0) score += Math.max(0, 60 - idx)
      if (name.includes(q)) score += 80
      if (brand.includes(q)) score += 50
      for (const t of tokens) {
        if (!t) continue
        if (name.startsWith(t)) score += 25
        if (brand.startsWith(t)) score += 20
        if (name.includes(t)) score += 20
        if (brand.includes(t)) score += 15
      }
      // Light popularity boost
      const vc = typeof p.view_count === 'number' ? p.view_count : 0
      if (vc > 0) score += Math.log10(vc + 1) * 5
      return score
    }

    const toSuggestion = (p: NormalizedFind, source: "finds") => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
      link: p.link,
      marketplace: p.marketplace,
      source,
      _score: scoreOf(p),
    })

    const all = [
      ...finds.map(p => toSuggestion(p, "finds")),
    ]

    const matched = q
      ? all.filter(s => s._score > 0)
      : all

    const merged = matched
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...rest }) => rest)
    if (merged.length > 0) {
      return NextResponse.json({ items: merged }, { status: 200 })
    }

    // If no matches and query is short, return a small set of popular defaults
    const defaultFallback = (arr: NormalizedFind[], source: "finds") => {
      const items = Array.isArray(arr) ? arr : []
      return items.slice(0, Math.max(1, Math.floor(limit / 2))).map(p => ({
        id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        image: p.image,
        link: p.link,
        source,
        view_count: p.view_count,
      }))
    }

    const fallback = [
      ...defaultFallback(finds || [], "finds"),
    ]
    return NextResponse.json({ items: fallback }, { status: 200 })
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}


