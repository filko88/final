"use server"
import "server-only"

export type FxResponse = {
  base: string
  rates: Record<string, number>
  time_last_update_unix?: number
}

export async function getFxRates(base = "CNY"): Promise<FxResponse | { error: string }> {
  const normalizedBase = base.toUpperCase()
  const upstream = `https://open.er-api.com/v6/latest/${encodeURIComponent(normalizedBase)}`

  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      headers: { accept: "application/json" },
    })
    if (!res.ok) {
      return { error: `Failed to fetch rates (${res.status})` }
    }
    const json = await res.json()
    return {
      base: json.base_code || normalizedBase,
      rates: json.rates || {},
      time_last_update_unix: json.time_last_update_unix,
    }
  } catch {
    return { error: "Network error" }
  }
}
