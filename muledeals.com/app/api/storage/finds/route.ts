import { NextResponse } from "next/server"
import { fetchFindsFromDatabase } from "@/lib/finds-source"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get("agent") || "kakobuy"
    const currency = searchParams.get("currency") || "usd"

    const items = await fetchFindsFromDatabase(agent, currency)
    return NextResponse.json({ items })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

