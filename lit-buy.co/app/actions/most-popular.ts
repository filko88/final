"use server"
import "server-only"

import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function getMostPopularItems(limit = 200, agent = "kakobuy", currency = "usd") {
  const limitValue = Number.isFinite(limit) ? Math.max(1, Math.min(500, limit)) : 200
  try {
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])
    const popularItems = findsItems
      .map((item) => ({ ...item, type: "finds" }))
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limitValue)
    return { items: popularItems }
  } catch (error) {
    console.error("Most popular fetch error:", error)
    return { items: [] as NormalizedFind[] }
  }
}
