import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const brand = searchParams.get("brand")?.toLowerCase()
    const limitParam = parseInt(searchParams.get("limit") || "20", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 20

    if (!brand) {
      return NextResponse.json({ error: "Brand parameter is required" }, { status: 400 })
    }

    // Fetch ONLY from finds database (same as /finds page)
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

    if (findsItems.length === 0) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Mark all items as finds type
    const allItems = findsItems.map((item) => ({ ...item, type: "finds" }))

    // Filter by brand (case-insensitive) and sort by view count (highest first)
    const brandItems = allItems
      .filter((item) => {
        const brandField = item.brand?.toLowerCase() || ""
        const nameField = item.name?.toLowerCase() || ""
        return brandField.includes(brand) || nameField.includes(brand)
      })
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit)

    return NextResponse.json({ items: brandItems })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

