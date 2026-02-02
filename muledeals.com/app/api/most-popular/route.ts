import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const limitParam = parseInt(searchParams.get("limit") || "15", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 15

    // Fetch ONLY from finds database (same as /finds page)
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

    if (findsItems.length === 0) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Sort by view count (highest first) and mark as finds type
    const popularItems = findsItems
      .map((item) => ({ ...item, type: "finds" }))
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit)

    return NextResponse.json({ items: popularItems })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}


