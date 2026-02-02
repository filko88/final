import { NextResponse } from "next/server"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const category = searchParams.get("category")?.toLowerCase()
    const limitParam = parseInt(searchParams.get("limit") || "20", 10)
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 20

    if (!category) {
      return NextResponse.json({ error: "Category parameter is required" }, { status: 400 })
    }

    // Fetch ONLY from finds database (same as /finds page)
    const findsItems = await fetchFindsFromDatabase(agent, currency).catch(() => [] as NormalizedFind[])

    if (findsItems.length === 0) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Mark all items as finds type
    const allItems = findsItems.map((item) => ({ ...item, type: "finds" }))

    // Filter by category (case-insensitive) - check all category fields and sort by view count
    const categoryItems = allItems
      .filter((item) => {
        const cat0 = item["category[0]"]?.toLowerCase() || ""
        const cat1 = item["category[1]"]?.toLowerCase() || ""
        const cat2 = item["category[2]"]?.toLowerCase() || ""
        
        return cat0.includes(category) || cat1.includes(category) || cat2.includes(category)
      })
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit)

    return NextResponse.json({ items: categoryItems })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

