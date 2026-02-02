import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

interface RecentlyViewedItem {
  _id: number
  name: string
  brand?: string
  "category[0]"?: string | null
  "category[1]"?: string | null
  "category[2]"?: string | null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recentlyViewed } = body
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const limitParam = parseInt(searchParams.get("limit") || "20", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 20

    // Fetch finds
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

    if (findsItems.length === 0) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Combine and mark with type
    const allItems = [
      ...findsItems.map((item) => ({ ...item, type: "finds" })),
    ]

    // Get IDs that user has already viewed
    const viewedIds = new Set(
      Array.isArray(recentlyViewed) 
        ? recentlyViewed.map((item: RecentlyViewedItem) => item._id) 
        : []
    )

    // Extract brands and categories from recently viewed items
    const recentBrands = new Set<string>()
    const recentCategories = new Set<string>()

    if (Array.isArray(recentlyViewed)) {
      recentlyViewed.forEach((item: RecentlyViewedItem) => {
        if (item.brand) recentBrands.add(item.brand.toLowerCase())
        if (item["category[0]"]) recentCategories.add(item["category[0]"].toLowerCase())
        if (item["category[1]"]) recentCategories.add(item["category[1]"].toLowerCase())
        if (item["category[2]"]) recentCategories.add(item["category[2]"].toLowerCase())
      })
    }

    // Score items based on similarity to user's viewing history
    const scoredItems = allItems
      .filter((item) => !viewedIds.has(item._id)) // Exclude already viewed items
      .map((item) => {
        let score = 0

        // Score based on matching brand
        if (item.brand && recentBrands.has(item.brand.toLowerCase())) {
          score += 3
        }

        // Score based on matching categories
        if (item["category[0]"] && recentCategories.has(item["category[0]"]?.toLowerCase())) {
          score += 2
        }
        if (item["category[1]"] && recentCategories.has(item["category[1]"]?.toLowerCase())) {
          score += 1
        }
        if (item["category[2]"] && recentCategories.has(item["category[2]"]?.toLowerCase())) {
          score += 1
        }

        // Boost popular items slightly
        if (item.view_count) {
          score += Math.log(item.view_count + 1) * 0.1
        }

        return { ...item, score }
      })
      .filter((item) => item.score > 0) // Only include items with some relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // If no personalized items, return recently added items
    if (scoredItems.length === 0) {
      const recentItems = allItems
        .filter((item) => !viewedIds.has(item._id))
        .filter((item) => item.created_at)
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
        .slice(0, limit)

      return NextResponse.json({ items: recentItems })
    }

    return NextResponse.json({ items: scoredItems })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

