import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const limitParam = parseInt(searchParams.get("limit") || "20", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 20

    // Fetch ONLY from finds database (same as /finds page)
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

    if (findsItems.length === 0) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Mark all items as finds type
    const allItems = findsItems.map((item) => ({ ...item, type: "finds" }))

    // Sort by highest IDs (freshly added items have higher IDs)
    const sortedItems = allItems
      .sort((a, b) => b._id - a._id)
      .slice(0, limit)

    return NextResponse.json({ items: sortedItems })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

