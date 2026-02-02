"use server"
import "server-only"

export async function fetchProductDetails(itemId: string, source: string) {
  if (!itemId || !source) {
    return { error: "Missing itemId or source" }
  }

  const apiUrl = `https://www.acbuy.com/prefix-api/store-product/product/api/item/detail?itemId=${encodeURIComponent(itemId)}&source=${encodeURIComponent(source)}`

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return { error: `ACBuy API failed (${res.status})` }
    }

    const data = await res.json()
    return { data }
  } catch (error) {
    console.error("ACBuy proxy error:", error)
    return { error: "Internal server error" }
  }
}
