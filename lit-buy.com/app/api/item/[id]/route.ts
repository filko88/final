import { NextResponse } from "next/server"
import { fetchFindsFromDatabase } from "@/lib/finds-source"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"
    const { id } = await params

    const items = await fetchFindsFromDatabase(agent, currency)
    const targetId = Number.parseInt(id, 10)
    const item = items.find((p) => p._id === targetId)

    if (!item) {
      console.error(`Item not found: ${id}, total items: ${items.length}`)
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}

