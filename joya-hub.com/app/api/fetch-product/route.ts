
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const source = searchParams.get("source") // AL, WD, TB

    if (!itemId || !source) {
        return NextResponse.json({ error: "Missing itemId or source" }, { status: 400 })
    }

    // https://www.acbuy.com/prefix-api/store-product/product/api/item/detail?itemId={itemId}&source={source}
    const apiUrl = `https://www.acbuy.com/prefix-api/store-product/product/api/item/detail?itemId=${itemId}&source=${source}`

    try {
        const res = await fetch(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!res.ok) {
            return NextResponse.json({ error: "ACBuy API failed", status: res.status }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("ACBuy proxy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
